import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme';
import { Badge, Button } from '../components';
import { useCachedFetch } from '../lib/useCachedFetch';
import api from '../lib/api';

interface Job {
  id: number;
  title: string;
  category: string;
  pay: string;
  location: string;
  status: string;
  postedBy: string;
  postedById: number;
  createdAt: string;
  applicationCount: number;
}

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [checkingOwner, setCheckingOwner] = useState(true);

  const { data: job, loading } = useCachedFetch<Job>(`/jobs/${id}`);

  useEffect(() => {
    if (job) checkOwnership();
  }, [job]);

  const checkOwnership = async () => {
    try {
      const userRes = await api.get('/users/me');
      if (job?.postedById === userRes.data?.id) {
        setIsOwner(true);
      }
    } catch (err) {
      console.log('Ownership check error:', err);
    } finally {
      setCheckingOwner(false);
    }
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      await api.post(`/jobs/${id}/apply`);
      setApplied(true);
      Alert.alert(
        'Nag-apply ka na! ✅',
        'Makikipag-ugnayan sa iyo ang employer.',
        [{ text: 'OK' }]
      );
    } catch (err: any) {
      const message = err.response?.data?.message || 'Hindi ma-apply. Subukan ulit.';
      Alert.alert('Error', message);
    } finally {
      setApplying(false);
    }
  };

  if (loading || checkingOwner) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Hindi mahanap ang trabaho</Text>
        <Button label="Bumalik" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalye ng Trabaho</Text>
        </View>

        {/* Job Info */}
        <View style={styles.jobCard}>
          <View style={styles.jobHeader}>
            <Text style={styles.jobTitle}>{job.title}</Text>
            <Badge
              label={job.status === 'OPEN' ? 'Bukas' : job.status === 'FILLED' ? 'Napuno' : 'Sarado'}
              variant={job.status === 'OPEN' ? 'success' : 'neutral'}
            />
          </View>

          <View style={styles.metaList}>
            {job.pay && (
              <View style={styles.metaRow}>
                <Ionicons name="cash-outline" size={18} color={colors.primary} />
                <Text style={styles.metaText}>{job.pay}</Text>
              </View>
            )}
            {job.location && (
              <View style={styles.metaRow}>
                <Ionicons name="location-outline" size={18} color={colors.primary} />
                <Text style={styles.metaText}>{job.location}</Text>
              </View>
            )}
            {job.category && (
              <View style={styles.metaRow}>
                <Ionicons name="pricetag-outline" size={18} color={colors.primary} />
                <Text style={styles.metaText}>{job.category}</Text>
              </View>
            )}
            {job.status === 'FILLED' && (
                <View style={styles.metaRow}>
                    <Ionicons name="checkmark-circle-outline" size={18} color={colors.success} />
                    <Text style={[styles.metaText, { color: colors.success }]}>
                    Napili na ang manggagawa para sa trabahong ito
                    </Text>
                </View>
                )}
            {job.postedBy && (
              <View style={styles.metaRow}>
                <Ionicons name="person-outline" size={18} color={colors.primary} />
                <Text style={styles.metaText}>In-post ni {job.postedBy}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Owner banner */}
        {isOwner && (
          <View style={styles.ownerBanner}>
            <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
            <Text style={styles.ownerText}>
              Ito ay iyong job post. Hindi ka makapag-apply sa sarili mong post.
            </Text>
          </View>
        )}

        {/* Anti-scam Warning */}
        {!isOwner && (
          <View style={styles.scamWarning}>
            <View style={styles.scamHeader}>
              <Ionicons name="warning-outline" size={20} color={colors.warning} />
              <Text style={styles.scamTitle}>Mag-ingat sa Scam!</Text>
            </View>
            <Text style={styles.scamText}>
              ⚠️ Huwag magbayad ng kahit anong halaga para makakuha ng trabaho.
            </Text>
            <Text style={styles.scamText}>
              ⚠️ Huwag ibigay ang iyong personal na impormasyon bago makapag-usap sa employer.
            </Text>
            <Text style={styles.scamText}>
              ⚠️ Kung may hinihingi silang bayad bago ka magtrabaho — SCAM iyan!
            </Text>
            <TouchableOpacity
              style={styles.reportScamBtn}
              onPress={() => router.back()}
            >
              <Text style={styles.reportScamText}>🚩 I-report ang Job Post</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Apply Bar — job seeker */}
      {job.status === 'OPEN' && !isOwner && (
        <View style={styles.applyBar}>
          <Button
            label={applied ? 'Nag-apply na ✓' : applying ? 'Nag-aapply...' : 'Mag-apply Ngayon'}
            onPress={handleApply}
            disabled={applied || applying}
            loading={applying}
            style={applied ? styles.appliedBtn : undefined}
          />
        </View>
      )}

      {/* View Applicants Bar — owner */}
      {isOwner && (
        <View style={styles.applyBar}>
          <Button
            label={`👥 Tingnan ang mga Nag-apply (${job.applicationCount})`}
            onPress={() => router.push({
              pathname: '/job-applicants',
              params: { jobId: id, jobTitle: job.title }
            })}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },
  errorText: {
    fontSize: typography.fontSizes.lg,
    color: colors.gray600,
  },
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
  jobCard: {
    backgroundColor: colors.white,
    margin: spacing.lg,
    borderRadius: 12,
    padding: spacing.xl,
    borderWidth: 0.5,
    borderColor: colors.gray200,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  jobTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.gray900,
    flex: 1,
    marginRight: spacing.md,
  },
  metaList: { gap: spacing.md },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  metaText: {
    fontSize: typography.fontSizes.md,
    color: colors.gray600,
  },
  ownerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    margin: spacing.lg,
    marginTop: 0,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  ownerText: {
    flex: 1,
    fontSize: typography.fontSizes.sm,
    color: colors.primaryDark,
    lineHeight: 20,
  },
  scamWarning: {
    backgroundColor: colors.warningLight,
    margin: spacing.lg,
    marginTop: 0,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.warning,
    gap: spacing.sm,
  },
  scamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  scamTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.warning,
  },
  scamText: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray400,
    lineHeight: 20,
  },
  reportScamBtn: {
    marginTop: spacing.sm,
    alignItems: 'center',
    padding: spacing.sm,
  },
  reportScamText: {
    fontSize: typography.fontSizes.sm,
    color: colors.danger,
    fontWeight: typography.fontWeights.medium,
  },
  applyBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderTopWidth: 0.5,
    borderTopColor: colors.gray200,
  },
  appliedBtn: {
    backgroundColor: colors.success,
  },
});