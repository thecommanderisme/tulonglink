import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, RefreshControl,
  Alert, Linking
} from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme';
import { Card, Badge } from '../components';
import api from '../lib/api';

interface Applicant {
  id: number;
  status: string;
  appliedAt: string;
  applicantId: number;
  applicantPhone: string;
  applicantName: string;
  applicantSkills: string;
}

const STATUS_CONFIG: Record<string, { label: string; variant: any }> = {
  APPLIED: { label: 'Nag-apply', variant: 'neutral' },
  SHORTLISTED: { label: 'Interesado', variant: 'warning' },
  HIRED: { label: 'Napili! 🎉', variant: 'success' },
  REJECTED: { label: 'Hindi napili', variant: 'danger' },
};

export default function JobApplicantsScreen() {
  const { jobId, jobTitle } = useLocalSearchParams<{
    jobId: string;
    jobTitle: string;
  }>();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      fetchApplicants();
    }, [])
  );

  const fetchApplicants = async () => {
    try {
      const response = await api.get(`/jobs/${jobId}/applications`);
      setApplicants(response.data);
    } catch (err) {
      console.log('Applicants fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchApplicants();
    setRefreshing(false);
  };

  const handleUpdateStatus = async (applicationId: number, status: string, phone: string) => {
    const statusLabels: Record<string, string> = {
      SHORTLISTED: 'i-shortlist',
      HIRED: 'piliin bilang hired',
      REJECTED: 'tanggihan',
    };

    Alert.alert(
      'Kumpirmahin',
      `Gusto mong ${statusLabels[status]} si ${phone}?`,
      [
        { text: 'Kanselahin', style: 'cancel' },
        {
          text: 'Oo',
          style: status === 'REJECTED' ? 'destructive' : 'default',
          onPress: async () => {
            setUpdating(applicationId);
            try {
              await api.patch(`/jobs/${jobId}/applications/${applicationId}`, {
                status,
              });
              await fetchApplicants();
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.message || 'Hindi ma-update. Subukan ulit.');
            } finally {
              setUpdating(null);
            }
          },
        },
      ]
    );
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fil-PH', {
      month: 'short',
      day: 'numeric',
    });
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
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Mga Nag-apply
          </Text>
          <Text style={styles.headerSub} numberOfLines={1}>
            {jobTitle}
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : applicants.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="people-outline" size={64} color={colors.gray200} />
          <Text style={styles.emptyText}>Wala pang nag-apply</Text>
          <Text style={styles.emptySubtext}>
            I-share ang iyong job post para makakuha ng mga aplikante
          </Text>
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
          <Text style={styles.count}>
            {applicants.length} aplikante
          </Text>

          {applicants.map(app => {
            const statusConfig = STATUS_CONFIG[app.status] || STATUS_CONFIG.APPLIED;
            const isUpdating = updating === app.id;

            return (
              <Card key={app.id}>
                {/* Top row */}
                <View style={styles.topRow}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {app.applicantPhone.slice(-2)}
                    </Text>
                  </View>
                  <View style={styles.applicantInfo}>
  <Text style={styles.name}>{app.applicantName || app.applicantPhone}</Text>
  <Text style={styles.phone}>{app.applicantPhone}</Text>
  {app.applicantSkills && (
    <Text style={styles.skills}>💼 {app.applicantSkills}</Text>
  )}
  <Text style={styles.date}>
    Nag-apply: {formatDate(app.appliedAt)}
  </Text>
</View>
                  <Badge
                    label={statusConfig.label}
                    variant={statusConfig.variant}
                  />
                </View>

                {/* Action buttons */}
                {app.status !== 'HIRED' && (
                  <View style={styles.actions}>
                    {/* Call button */}
                    <TouchableOpacity
                      style={styles.callBtn}
                      onPress={() => handleCall(app.applicantPhone)}
                    >
                      <Ionicons name="call-outline" size={16} color={colors.primary} />
                      <Text style={styles.callText}>Tumawag</Text>
                    </TouchableOpacity>

                    {/* Status buttons */}
                    {app.status === 'APPLIED' && (
                      <TouchableOpacity
                        style={styles.shortlistBtn}
                        disabled={isUpdating}
                        onPress={() => handleUpdateStatus(app.id, 'SHORTLISTED', app.applicantPhone)}
                      >
                        {isUpdating ? (
                          <ActivityIndicator size="small" color={colors.warning} />
                        ) : (
                          <>
                            <Ionicons name="star-outline" size={16} color={colors.warning} />
                            <Text style={styles.shortlistText}>Interesado</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    )}

                    {(app.status === 'APPLIED' || app.status === 'SHORTLISTED') && (
                      <TouchableOpacity
                        style={styles.hireBtn}
                        disabled={isUpdating}
                        onPress={() => handleUpdateStatus(app.id, 'HIRED', app.applicantPhone)}
                      >
                        {isUpdating ? (
                          <ActivityIndicator size="small" color={colors.white} />
                        ) : (
                          <>
                            <Ionicons name="checkmark-circle-outline" size={16} color={colors.white} />
                            <Text style={styles.hireText}>Piliin</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    )}

                    {app.status !== 'REJECTED' && (
                      <TouchableOpacity
                        style={styles.rejectBtn}
                        disabled={isUpdating}
                        onPress={() => handleUpdateStatus(app.id, 'REJECTED', app.applicantPhone)}
                      >
                        {isUpdating ? (
                          <ActivityIndicator size="small" color={colors.danger} />
                        ) : (
                          <Ionicons name="close-circle-outline" size={20} color={colors.danger} />
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* Hired message */}
                {app.status === 'HIRED' && (
                  <View style={styles.hiredBanner}>
                    <Text style={styles.hiredText}>
                      🎉 Napili mo na ang taong ito! Makikipag-ugnayan sila sa iyo.
                    </Text>
                  </View>
                )}
              </Card>
            );
          })}
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
  headerInfo: { flex: 1 },
  headerTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
  },
  headerSub: {
    fontSize: typography.fontSizes.sm,
    color: colors.primaryLight,
    marginTop: 2,
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
  emptySubtext: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray400,
    textAlign: 'center',
  },
  list: { flex: 1, padding: spacing.lg },
  count: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray400,
    marginBottom: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
  },
  applicantInfo: { flex: 1 },
  phone: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.gray900,
  },
  date: {
    fontSize: typography.fontSizes.xs,
    color: colors.gray400,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    borderTopWidth: 0.5,
    borderTopColor: colors.gray200,
    paddingTop: spacing.sm,
    alignItems: 'center',
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  callText: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },
  skills: {
  fontSize: typography.fontSizes.xs,
  color: colors.primary,
  marginTop: 2,
},
  shortlistBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.warning,
    flex: 1,
    justifyContent: 'center',
  },
  shortlistText: {
    fontSize: typography.fontSizes.sm,
    color: colors.warning,
    fontWeight: typography.fontWeights.medium,
  },
  hireBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.success,
    flex: 1,
    justifyContent: 'center',
  },
  hireText: {
    fontSize: typography.fontSizes.sm,
    color: colors.white,
    fontWeight: typography.fontWeights.medium,
  },
  rejectBtn: {
    padding: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.dangerLight,
  },
  hiredBanner: {
    backgroundColor: colors.successLight,
    borderRadius: 8,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  hiredText: {
    fontSize: typography.fontSizes.sm,
    color: colors.success,
    textAlign: 'center',
  },
  name: {
  fontSize: typography.fontSizes.md,
  fontWeight: typography.fontWeights.medium,
  color: colors.gray900,
},
});