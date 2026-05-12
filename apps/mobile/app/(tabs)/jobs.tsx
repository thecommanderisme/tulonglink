import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl, ActivityIndicator,
  Modal
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../theme';
import { Card, Badge, Input } from '../../components';
import { useCachedFetch } from '../../lib/useCachedFetch';
import api from '../../lib/api';

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

const CATEGORIES = ['Lahat', 'Bahay', 'Pagkain', 'Konstruksiyon', 'Bantay', 'Iba pa'];

export default function JobsScreen() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Lahat');
  const [applying, setApplying] = useState<number | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<number[]>([]);
  const [reporting, setReporting] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const params: any = {};
  if (selectedCategory !== 'Lahat') params.category = selectedCategory;
  if (search) params.search = search;

  const { data: jobs, loading, refresh, isFromCache } =
    useCachedFetch<Job[]>('/jobs', params);

  const handleApply = async (jobId: number) => {
    try {
      setApplying(jobId);
      await api.post(`/jobs/${jobId}/apply`);
      setAppliedJobs(prev => [...prev, jobId]);
    } catch (err: any) {
      console.log('Apply error:', err.response?.data?.message);
    } finally {
      setApplying(null);
    }
  };

  const handleReport = async () => {
    if (!reportReason || !reporting) return;
    setReportSubmitting(true);
    try {
      await api.post('/moderation/reports', {
        contentType: 'JOB',
        contentId: reporting,
        reason: reportReason,
      });
      setReportSuccess(true);
    } catch (err: any) {
      console.log('Report error:', err.response?.data?.message);
    } finally {
      setReportSubmitting(false);
    }
  };

  const handleCloseReport = () => {
    setReporting(null);
    setReportReason('');
    setReportSuccess(false);
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Mga Trabaho</Text>
            <Text style={styles.subtitle}>Mag-apply nang walang resume</Text>
          </View>
          <TouchableOpacity
            style={styles.postBtn}
            onPress={() => router.push('/post-job')}
          >
            <Ionicons name="add-circle" size={20} color={colors.white} />
            <Text style={styles.postBtnText}>Mag-post</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Input
          placeholder="Maghanap ng trabaho..."
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={refresh}
          containerStyle={{ marginBottom: 0 }}
        />
      </View>

      {/* Category filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categories}
        contentContainerStyle={styles.categoriesContent}
      >
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            onPress={() => setSelectedCategory(cat)}
            style={[
              styles.categoryBtn,
              selectedCategory === cat && styles.categoryBtnActive
            ]}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === cat && styles.categoryTextActive
            ]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Offline indicator */}
      {isFromCache && (
        <View style={styles.cacheBar}>
          <Text style={styles.cacheText}>
            📶 Offline mode — showing cached data
          </Text>
        </View>
      )}

      {/* Jobs list */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : !jobs || jobs.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Walang trabaho ngayon</Text>
          <Text style={styles.emptySubtext}>Subukan ulit mamaya</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={refresh}
              tintColor={colors.primary}
            />
          }
        >
          {jobs.map(job => (
            <TouchableOpacity
              key={job.id}
              activeOpacity={0.8}
              onPress={() => router.push({
                pathname: '/job-detail',
                params: { id: job.id }
              })}
            >
              <Card>
                <View style={styles.jobHeader}>
                  <Text style={styles.jobTitle}>{job.title}</Text>
                  <Badge
                    label={job.status === 'OPEN' ? 'Bukas' : 'Sarado'}
                    variant={job.status === 'OPEN' ? 'success' : 'neutral'}
                  />
                </View>

                <View style={styles.jobMeta}>
                  {job.pay && <Text style={styles.metaText}>💰 {job.pay}</Text>}
                  {job.location && <Text style={styles.metaText}>📍 {job.location}</Text>}
                  {job.category && <Text style={styles.metaText}>🏷 {job.category}</Text>}
                </View>

                <View style={styles.jobFooter}>
                  <Text style={styles.appCount}>
                    {job.applicationCount} nag-apply
                  </Text>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      handleApply(job.id);
                    }}
                    disabled={applying === job.id || appliedJobs.includes(job.id)}
                    style={[
                      styles.applyBtn,
                      appliedJobs.includes(job.id) && styles.applyBtnDone
                    ]}
                  >
                    {applying === job.id ? (
                      <ActivityIndicator color={colors.white} size="small" />
                    ) : (
                      <Text style={styles.applyText}>
                        {appliedJobs.includes(job.id) ? 'Nag-apply na ✓' : 'Mag-apply'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Report button */}
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    setReporting(job.id);
                  }}
                  style={styles.reportBtn}
                >
                  <Text style={styles.reportText}>🚩 I-report</Text>
                </TouchableOpacity>
              </Card>
            </TouchableOpacity>
          ))}
          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      )}

      {/* Report Modal */}
      <Modal
        visible={reporting !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseReport}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>I-report ang Job Post</Text>

            {reportSuccess ? (
              <View style={styles.successBox}>
                <Text style={styles.successIcon}>✅</Text>
                <Text style={styles.successText}>Natanggap ang iyong report!</Text>
                <TouchableOpacity
                  style={styles.doneBtn}
                  onPress={handleCloseReport}
                >
                  <Text style={styles.doneBtnText}>Tapos na</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={styles.fieldLabel}>Dahilan ng report</Text>
                <View style={styles.reasons}>
                  {['SCAM', 'SPAM', 'INAPPROPRIATE', 'FAKE'].map(reason => (
                    <TouchableOpacity
                      key={reason}
                      onPress={() => setReportReason(reason)}
                      style={[
                        styles.reasonBtn,
                        reportReason === reason && styles.reasonBtnActive
                      ]}
                    >
                      <Text style={[
                        styles.reasonText,
                        reportReason === reason && styles.reasonTextActive
                      ]}>
                        {reason}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={handleCloseReport}
                  >
                    <Text style={styles.cancelText}>Kanselahin</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.submitBtn,
                      (!reportReason || reportSubmitting) && { opacity: 0.6 }
                    ]}
                    disabled={!reportReason || reportSubmitting}
                    onPress={handleReport}
                  >
                    {reportSubmitting ? (
                      <ActivityIndicator color={colors.white} size="small" />
                    ) : (
                      <Text style={styles.submitText}>Isumite</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  header: {
    padding: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.md,
    backgroundColor: colors.primary,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
  },
  subtitle: {
    fontSize: typography.fontSizes.xs,
    color: colors.primaryLight,
    marginTop: 2,
  },
  postBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryDark,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
  },
  postBtnText: {
    fontSize: typography.fontSizes.sm,
    color: colors.white,
    fontWeight: typography.fontWeights.medium,
  },
  searchWrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: 0,
    backgroundColor: colors.white,
  },
  categories: {
    backgroundColor: colors.white,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.gray200,
    maxHeight: 56,
  },
  categoriesContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  categoryBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.gray200,
    backgroundColor: colors.white,
    height: 36,
    justifyContent: 'center',
  },
  categoryBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray600,
    fontWeight: typography.fontWeights.medium,
  },
  categoryTextActive: { color: colors.white },
  cacheBar: {
    backgroundColor: colors.warningLight,
    padding: spacing.sm,
    alignItems: 'center',
  },
  cacheText: {
    fontSize: typography.fontSizes.xs,
    color: colors.warning,
    fontWeight: typography.fontWeights.medium,
  },
  list: { flex: 1, padding: spacing.lg },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.medium,
    color: colors.gray600,
  },
  emptySubtext: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray400,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  jobTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.gray900,
    flex: 1,
    marginRight: spacing.sm,
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
  appCount: {
    fontSize: typography.fontSizes.xs,
    color: colors.gray400,
  },
  applyBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    minWidth: 100,
    alignItems: 'center',
  },
  applyBtnDone: { backgroundColor: colors.success },
  applyText: {
    fontSize: typography.fontSizes.sm,
    color: colors.white,
    fontWeight: typography.fontWeights.medium,
  },
  reportBtn: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  reportText: {
    fontSize: typography.fontSizes.xs,
    color: colors.gray400,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.xl,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.gray900,
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.gray600,
    marginBottom: spacing.sm,
  },
  reasons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  reasonBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  reasonBtnActive: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  reasonText: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray600,
  },
  reasonTextActive: { color: colors.white },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  cancelBtn: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.gray200,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: typography.fontSizes.md,
    color: colors.gray600,
  },
  submitBtn: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 10,
    backgroundColor: colors.danger,
    alignItems: 'center',
  },
  submitText: {
    fontSize: typography.fontSizes.md,
    color: colors.white,
    fontWeight: typography.fontWeights.bold,
  },
  successBox: {
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  successIcon: { fontSize: 48 },
  successText: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.gray900,
    textAlign: 'center',
  },
  doneBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: 10,
    marginTop: spacing.sm,
  },
  doneBtnText: {
    color: colors.white,
    fontWeight: typography.fontWeights.bold,
  },
});