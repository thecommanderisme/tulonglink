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

interface HelpRequest {
  id: number;
  requestType: string;
  summary: string;
  privacyLevel: string;
  status: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; variant: any; icon: string }> = {
  PENDING: { label: 'Nakabinbin', variant: 'warning', icon: 'time-outline' },
  IN_PROGRESS: { label: 'Pinoproseso', variant: 'primary', icon: 'sync-outline' },
  RESOLVED: { label: 'Natugunan', variant: 'success', icon: 'checkmark-circle-outline' },
  CLOSED: { label: 'Sarado', variant: 'neutral', icon: 'close-circle-outline' },
};

const TYPE_ICONS: Record<string, string> = {
  Pagkain: '🍚',
  Medikal: '🏥',
  Trabaho: '💼',
  Tirahan: '🏠',
  'Iba pa': '🤝',
};

export default function MyHelpRequestsScreen() {
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/help-requests/mine');
      setRequests(response.data);
    } catch (err) {
      console.log('Help requests fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRequests();
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
        <Text style={styles.headerTitle}>Mga Kahilingan Ko</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : requests.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>🤝</Text>
          <Text style={styles.emptyText}>Wala ka pang kahilingan</Text>
          <Text style={styles.emptySubtext}>
            Mag-request ng tulong mula sa home screen
          </Text>
          <TouchableOpacity
            style={styles.homeBtn}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={styles.homeBtnText}>Pumunta sa Home</Text>
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
            {requests.length} kahilingan
          </Text>

          {requests.map(req => {
            const statusConfig = STATUS_CONFIG[req.status] || STATUS_CONFIG.PENDING;
            return (
              <Card key={req.id}>
                {/* Top row */}
                <View style={styles.topRow}>
                  <Text style={styles.typeIcon}>
                    {TYPE_ICONS[req.requestType] || '🤝'}
                  </Text>
                  <View style={styles.topInfo}>
                    <Text style={styles.requestType}>{req.requestType}</Text>
                    <Text style={styles.date}>{formatDate(req.createdAt)}</Text>
                  </View>
                  <Badge
                    label={statusConfig.label}
                    variant={statusConfig.variant}
                  />
                </View>

                {/* Summary */}
                {req.summary && (
                  <Text style={styles.summary} numberOfLines={2}>
                    {req.summary}
                  </Text>
                )}

                {/* Footer */}
                <View style={styles.footer}>
                  <View style={styles.privacyRow}>
                    <Ionicons
                      name={req.privacyLevel === 'ANONYMOUS' ? 'eye-off-outline' : 'eye-outline'}
                      size={14}
                      color={colors.gray400}
                    />
                    <Text style={styles.privacyText}>
                      {req.privacyLevel === 'ANONYMOUS' ? 'Anonymous' : 'Pampubliko'}
                    </Text>
                  </View>
                  <View style={styles.statusRow}>
                    <Ionicons
                      name={statusConfig.icon as any}
                      size={14}
                      color={colors.gray400}
                    />
                    <Text style={styles.statusText}>{statusConfig.label}</Text>
                  </View>
                </View>
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
  emptyIcon: { fontSize: 48 },
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
  homeBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 10,
    marginTop: spacing.sm,
  },
  homeBtnText: {
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  typeIcon: { fontSize: 28 },
  topInfo: { flex: 1 },
  requestType: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.gray900,
  },
  date: {
    fontSize: typography.fontSizes.xs,
    color: colors.gray400,
    marginTop: 2,
  },
  summary: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray600,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 0.5,
    borderTopColor: colors.gray200,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  privacyText: {
    fontSize: typography.fontSizes.xs,
    color: colors.gray400,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: typography.fontSizes.xs,
    color: colors.gray400,
  },
});