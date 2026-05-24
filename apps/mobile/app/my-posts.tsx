import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, RefreshControl, Alert
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme';
import { Card, Badge } from '../components';
import api from '../lib/api';

interface Job {
  id: number;
  title: string;
  category: string;
  pay: string;
  location: string;
  status: string;
  createdAt: string;
  applicationCount: number;
}

export default function MyPostsScreen() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchMyPosts();
    }, [])
  );

  const fetchMyPosts = async () => {
    try {
      const response = await api.get('/jobs/my-posts');
      setJobs(response.data);
    } catch (err) {
      console.log('My posts fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMyPosts();
    setRefreshing(false);
  };

  const handleCloseJob = async (jobId: number) => {
    Alert.alert(
      'Isara ang Job?',
      'Hindi na matatanggap ang mga bagong aplikante.',
      [
        { text: 'Kanselahin', style: 'cancel' },
        {
          text: 'Isara',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.patch(`/jobs/${jobId}/close`);
              await fetchMyPosts();
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.message || 'Hindi masara. Subukan ulit.');
            }
          },
        },
      ]
    );
  };
  
const handleDeleteJob = async (jobId: number) => {
  Alert.alert(
    'Burahin ang Job?',
    'Hindi na ito mababawi. Mabubura na ang lahat ng applications.',
    [
      { text: 'Kanselahin', style: 'cancel' },
      {
        text: 'Burahin',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/jobs/${jobId}`);
            // Remove from local state immediately
            setJobs(prev => prev.filter(j => j.id !== jobId));
          } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Hindi mabura. Subukan ulit.');
          }
        },
      },
    ]
  );
};

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fil-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusVariant = (status: string): any => {
    const variants: Record<string, string> = {
      OPEN: 'success',
      FILLED: 'primary',
      CLOSED: 'neutral',
    };
    return variants[status] || 'neutral';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      OPEN: 'Bukas',
      FILLED: 'Napuno',
      CLOSED: 'Sarado',
    };
    return labels[status] || status;
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mga Na-post Kong Trabaho</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : jobs.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="briefcase-outline" size={64} color={colors.gray200} />
          <Text style={styles.emptyText}>Wala ka pang na-post na trabaho</Text>
          <TouchableOpacity
            style={styles.postBtn}
            onPress={() => router.push('/post-job')}
          >
            <Text style={styles.postBtnText}>Mag-post ng Trabaho</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        >
          <Text style={styles.count}>{jobs.length} job post</Text>

          {jobs.map(job => (
            <TouchableOpacity
              key={job.id}
              onPress={() => router.push({
                pathname: '/job-applicants',
                params: { jobId: job.id, jobTitle: job.title }
              })}
              activeOpacity={0.8}
            >
              <Card>
                {/* Header row */}
                <View style={styles.jobHeader}>
                  <Text style={styles.jobTitle} numberOfLines={2}>
                    {job.title}
                  </Text>
                  <Badge
                    label={getStatusLabel(job.status)}
                    variant={getStatusVariant(job.status)}
                  />
                </View>

                {/* Meta */}
                <View style={styles.jobMeta}>
                  {job.pay && <Text style={styles.metaText}>💰 {job.pay}</Text>}
                  {job.location && <Text style={styles.metaText}>📍 {job.location}</Text>}
                  {job.category && <Text style={styles.metaText}>🏷 {job.category}</Text>}
                </View>

                {/* Footer */}
                <View style={styles.jobFooter}>
                  <Text style={styles.date}>
                    Na-post: {formatDate(job.createdAt)}
                  </Text>
                  <View style={styles.applicantsRow}>
                    <Ionicons name="people-outline" size={14} color={colors.primary} />
                    <Text style={styles.applicantsCount}>
                      {job.applicationCount} nag-apply
                    </Text>
                    <Text style={styles.viewApplicants}>Tingnan →</Text>
                  </View>
                </View>

                {/* Job actions */}
                <View style={styles.jobActions}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={(e) => {
                      e.stopPropagation();
                      router.push({
                        pathname: '/edit-job',
                        params: { jobId: job.id }
                      });
                    }}
                  >
                    <Ionicons name="create-outline" size={14} color={colors.primary} />
                    <Text style={styles.editBtnText}>I-edit</Text>
                  </TouchableOpacity>

                  {job.status === 'OPEN' && (
                    <TouchableOpacity
                      style={styles.closeBtn}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleCloseJob(job.id);
                      }}
                    >
                      <Ionicons name="lock-closed-outline" size={14} color={colors.warning} />
                      <Text style={styles.closeBtnText}>Isara</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleDeleteJob(job.id);
                    }}
                  >
                    <Ionicons name="trash-outline" size={14} color={colors.danger} />
                    <Text style={styles.deleteBtnText}>Burahin</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xl,
    paddingTop: 60,
    backgroundColor: colors.primary,
    gap: spacing.md,
  },
  backBtn: { padding: spacing.xs },
  headerTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.medium,
    color: colors.gray600,
    textAlign: 'center',
  },
  postBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 10,
    marginTop: spacing.sm,
  },
  postBtnText: {
    color: colors.white,
    fontWeight: typography.fontWeights.bold,
    fontSize: typography.fontSizes.md,
  },
  list: { flex: 1, padding: spacing.lg },
  count: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray400,
    marginBottom: spacing.md,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  jobTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.gray900,
    flex: 1,
  },
  jobMeta: { gap: spacing.xs, marginBottom: spacing.md },
  metaText: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray600,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: colors.gray200,
    paddingTop: spacing.sm,
  },
  date: {
    fontSize: typography.fontSizes.xs,
    color: colors.gray400,
  },
  applicantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  applicantsCount: {
    fontSize: typography.fontSizes.xs,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },
  viewApplicants: {
    fontSize: typography.fontSizes.xs,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
    marginLeft: 4,
  },
  jobActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    borderTopWidth: 0.5,
    borderTopColor: colors.gray200,
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  editBtnText: {
    fontSize: typography.fontSizes.xs,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },
  closeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  closeBtnText: {
    fontSize: typography.fontSizes.xs,
    color: colors.warning,
    fontWeight: typography.fontWeights.medium,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.dangerLight,
  },
  deleteBtnText: {
    fontSize: typography.fontSizes.xs,
    color: colors.danger,
    fontWeight: typography.fontWeights.medium,
  },
});