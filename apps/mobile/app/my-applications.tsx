import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, RefreshControl
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme';
import { Card, Badge } from '../components';
import api from '../lib/api';

interface Application {
  id: number;
  job: {
    id: number;
    title: string;
    pay: string;
    location: string;
    category: string;
    status: string;
  };
  status: string;
  appliedAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; variant: any; icon: string }> = {
  APPLIED: { label: 'Nag-apply', variant: 'primary', icon: 'time-outline' },
  SHORTLISTED: { label: 'Shortlisted', variant: 'warning', icon: 'star-outline' },
  FILLED: { label: 'Napili', variant: 'success', icon: 'checkmark-circle-outline' },
  REJECTED: { label: 'Hindi napili', variant: 'danger', icon: 'close-circle-outline' },
};

export default function MyApplicationsScreen() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await api.get('/jobs/my-applications');
      setApplications(response.data);
    } catch (err) {
      console.log('Applications fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchApplications();
    setRefreshing(false);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fil-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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
        <Text style={styles.headerTitle}>Mga Na-apply Ko</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : applications.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="briefcase-outline" size={64} color={colors.gray200} />
          <Text style={styles.emptyText}>Wala ka pang na-apply</Text>
          <Text style={styles.emptySubtext}>
            Mag-apply ng trabaho para makita dito
          </Text>
          <TouchableOpacity
            style={styles.browseBtn}
            onPress={() => router.push('/(tabs)/jobs')}
          >
            <Text style={styles.browseBtnText}>Mag-browse ng Trabaho</Text>
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
          <Text style={styles.count}>
            {applications.length} application{applications.length > 1 ? 's' : ''}
          </Text>

          {applications.map(app => {
            const statusConfig = STATUS_CONFIG[app.status] || STATUS_CONFIG.APPLIED;
            return (
              <Card key={app.id}>
                {/* Status badge */}
                <View style={styles.statusRow}>
                  <Ionicons
                    name={statusConfig.icon as any}
                    size={16}
                    color={colors[statusConfig.variant === 'primary' ? 'secondary' :
                      statusConfig.variant === 'warning' ? 'warning' :
                      statusConfig.variant === 'success' ? 'success' : 'danger']}
                  />
                  <Badge
                    label={statusConfig.label}
                    variant={statusConfig.variant}
                  />
                  <Text style={styles.date}>{formatDate(app.appliedAt)}</Text>
                </View>

                {/* Job info */}
                <Text style={styles.jobTitle}>{app.job?.title || 'Unknown Job'}</Text>

                <View style={styles.jobMeta}>
                  {app.job?.pay && (
                    <Text style={styles.metaText}>💰 {app.job.pay}</Text>
                  )}
                  {app.job?.location && (
                    <Text style={styles.metaText}>📍 {app.job.location}</Text>
                  )}
                </View>

                {/* View job button */}
                <TouchableOpacity
                  style={styles.viewJobBtn}
                  onPress={() => router.push({
                    pathname: '/job-detail',
                    params: { id: app.job?.id }
                  })}
                >
                  <Text style={styles.viewJobText}>Tingnan ang Job Post →</Text>
                </TouchableOpacity>
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
  headerTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
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
    fontWeight: typography.fontWeights.bold,
    color: colors.gray600,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray400,
    textAlign: 'center',
  },
  browseBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 10,
    marginTop: spacing.sm,
  },
  browseBtnText: {
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
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  date: {
    fontSize: typography.fontSizes.xs,
    color: colors.gray400,
    marginLeft: 'auto',
  },
  jobTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.gray900,
    marginBottom: spacing.sm,
  },
  jobMeta: { gap: spacing.xs, marginBottom: spacing.md },
  metaText: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray600,
  },
  viewJobBtn: {
    borderTopWidth: 0.5,
    borderTopColor: colors.gray200,
    paddingTop: spacing.sm,
    alignItems: 'center',
  },
  viewJobText: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },
});