import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert, Linking
} from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme';
import { Badge, Button } from '../components';
import api from '../lib/api';

interface Job {
  id: number;
  title: string;
  category: string;
  pay: string;
  location: string;
  status: string;
  postedBy: string;
  postedByPhone: string;
  postedById: number;
  barangay: string;
  city: string;
  createdAt: string;
  applicationCount: number;
  description: string;
  requirements: string;
  workSchedule: string;
  workType: string;
  contactPref: string;
  dateNeeded: string;
}

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchJobAndCheck();
    }, [])
  );

  const fetchJobAndCheck = async () => {
    setLoading(true);
    try {
      const [jobRes, userRes, applicationsRes] = await Promise.all([
        api.get(`/jobs/${id}`),
        api.get('/users/me'),
        api.get('/jobs/my-applications'),
      ]);

      setJob(jobRes.data);

      if (jobRes.data?.postedById === userRes.data?.id) {
        setIsOwner(true);
      } else {
        setIsOwner(false);
      }

      const matchingApp = applicationsRes.data?.find(
        (app: any) => app.job?.id === jobRes.data?.id
      );
      if (matchingApp) {
        setApplied(true);
        setApplicationStatus(matchingApp.status);
      } else {
        setApplied(false);
        setApplicationStatus(null);
      }

    } catch (err) {
      console.log('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      await api.post(`/jobs/${id}/apply`);
      setApplied(true);
      setApplicationStatus('APPLIED');
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

  const handleCallEmployer = () => {
    if (job?.postedByPhone) {
      Linking.openURL(`tel:${job.postedByPhone}`);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fil-PH', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
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

        {/* Job Info Card */}
        <View style={styles.jobCard}>
          <View style={styles.jobHeader}>
            <Text style={styles.jobTitle}>{job.title}</Text>
            <Badge
                label={job.status === 'OPEN' ? 'Bukas' : 'Sarado'}
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
            {job.barangay && (
              <View style={styles.metaRow}>
                <Ionicons name="map-outline" size={18} color={colors.primary} />
                <Text style={styles.metaText}>
                  {job.barangay}{job.city ? `, ${job.city}` : ''}
                </Text>
              </View>
            )}
            {job.category && (
              <View style={styles.metaRow}>
                <Ionicons name="pricetag-outline" size={18} color={colors.primary} />
                <Text style={styles.metaText}>{job.category}</Text>
              </View>
            )}
            {job.workSchedule && (
              <View style={styles.metaRow}>
                <Ionicons name="time-outline" size={18} color={colors.primary} />
                <Text style={styles.metaText}>{job.workSchedule}</Text>
              </View>
            )}
            {job.workType && (
              <View style={styles.metaRow}>
                <Ionicons name="briefcase-outline" size={18} color={colors.primary} />
                <Text style={styles.metaText}>{job.workType}</Text>
              </View>
            )}
            {job.contactPref && (
              <View style={styles.metaRow}>
                <Ionicons name="chatbubble-outline" size={18} color={colors.primary} />
                <Text style={styles.metaText}>Contact: {job.contactPref}</Text>
              </View>
            )}
            {job.dateNeeded && (
              <View style={styles.metaRow}>
                <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                <Text style={styles.metaText}>
                  Kailangan hanggang {formatDate(job.dateNeeded)}
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

        {/* Description */}
        {job.description && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Tungkol sa Trabaho</Text>
            <Text style={styles.sectionText}>{job.description}</Text>
          </View>
        )}

        {/* Requirements */}
        {job.requirements && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Mga Kinakailangan</Text>
            <Text style={styles.sectionText}>{job.requirements}</Text>
          </View>
        )}

        {/* Employer contact — only shown when shortlisted or hired */}
        {applied && !isOwner &&
          (applicationStatus === 'SHORTLISTED' || applicationStatus === 'HIRED') && (
          <View style={styles.hiredCard}>
            <Text style={styles.hiredTitle}>
              {applicationStatus === 'HIRED' ? '🎉 Napili ka!' : '⭐ Interesado ang employer!'}
            </Text>
            <Text style={styles.hiredSub}>
              {applicationStatus === 'HIRED'
                ? 'Napili ka para sa trabahong ito! Makipag-ugnayan sa employer.'
                : 'Interesado ang employer sa iyong application. Maaari kang makipag-ugnayan.'}
            </Text>
            <TouchableOpacity
              style={styles.callBtn}
              onPress={handleCallEmployer}
            >
              <Ionicons name="call-outline" size={18} color={colors.white} />
              <Text style={styles.callText}>{job.postedByPhone}</Text>
            </TouchableOpacity>
          </View>
        )}

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
            label={
              applied ? 'Nag-apply na ✓' :
              applying ? 'Nag-aapply...' :
              'Mag-apply Ngayon'
            }
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
    flex: 1,
  },
  sectionCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 0.5,
    borderColor: colors.gray200,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.gray900,
    marginBottom: spacing.sm,
  },
  sectionText: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray600,
    lineHeight: 22,
  },
  hiredCard: {
    backgroundColor: colors.successLight,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.success,
    gap: spacing.sm,
  },
  hiredTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.success,
  },
  hiredSub: {
    fontSize: typography.fontSizes.sm,
    color: colors.success,
    lineHeight: 20,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.success,
    padding: spacing.md,
    borderRadius: 10,
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  callText: {
    fontSize: typography.fontSizes.md,
    color: colors.white,
    fontWeight: typography.fontWeights.bold,
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