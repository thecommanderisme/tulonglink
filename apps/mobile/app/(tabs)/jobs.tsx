import { useState, useEffect } from 'react';
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
  postedById: number;
}

interface Application {
  id: number;
  job: { id: number };
  status: string;
}

const CATEGORIES = ['Lahat', 'Malapit', 'Bahay', 'Pagkain', 'Konstruksiyon', 'Bantay', 'Iba pa'];

export default function JobsScreen() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Lahat');
  const [showOpenOnly, setShowOpenOnly] = useState(true);
  const [applying, setApplying] = useState<number | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<number[]>([]);
  const [reporting, setReporting] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [userCity, setUserCity] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    fetchUserCity();
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/users/me');
      setCurrentUserId(response.data.id);
    } catch (err) {
      console.log('Could not fetch user:', err);
    }
  };

  const fetchUserCity = async () => {
    try {
      const response = await api.get('/users/profile');
      if (response.data?.barangayName) {
        const barangayResponse = await api.get('/barangays');
        const userBarangay = barangayResponse.data.find(
          (b: any) => b.name === response.data.barangayName
        );
        if (userBarangay) setUserCity(userBarangay.city);
      }
    } catch (err) {
      console.log('Could not fetch user city:', err);
    }
  };

  const params: any = { _v: showOpenOnly ? 'open' : 'all' };
  if (selectedCategory === 'Malapit' && userCity) {
    params.city = userCity;
  } else if (selectedCategory !== 'Lahat' && selectedCategory !== 'Malapit') {
    params.category = selectedCategory;
  }
  if (search) params.search = search;
  if (!showOpenOnly) params.showAll = true;

  const { data: jobs, loading, refresh, isFromCache } =
    useCachedFetch<Job[]>('/jobs', params);

  const { data: myApplications } =
    useCachedFetch<Application[]>('/jobs/my-applications');

  useEffect(() => {
    if (myApplications && myApplications.length > 0) {
      const appliedIds = myApplications.map(app => app.job?.id).filter(Boolean);
      setAppliedJobs(appliedIds);
    }
  }, [myApplications]);

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
            style={[
              styles.filterBtn,
              !showOpenOnly && styles.filterBtnInactive
            ]}
            onPress={() => setShowOpenOnly(!showOpenOnly)}
          >
            <Text style={[
              styles.filterBtnText,
              !showOpenOnly && styles.filterBtnTextInactive
            ]}>
              {showOpenOnly ? '✅ Bukas lang' : '📋 Lahat'}
            </Text>
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
              {cat === 'Malapit' ? '📍 Malapit' : cat}
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

      {/* Malapit info banner */}
      {selectedCategory === 'Malapit' && (
        <View style={styles.nearbyBanner}>
          <Ionicons name="location-outline" size={14} color={colors.primary} />
          <Text style={styles.nearbyText}>
            {userCity
              ? `Mga trabaho sa ${userCity}`
              : 'Itakda ang iyong barangay para makita ang mga trabaho malapit sa iyo'}
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
          <Text style={styles.emptyText}>
            {selectedCategory === 'Malapit'
              ? 'Walang trabaho malapit sa iyo ngayon'
              : 'Walang trabaho ngayon'}
          </Text>
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
          {jobs.map(job => {
            const isOwnJob = currentUserId === job.postedById;
            return (
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
                    {isOwnJob ? (
                      <Badge label="Iyong Post" variant="primary" />
                    ) : (
                      <Badge
                        label={job.status === 'OPEN' ? 'Bukas' : 'Sarado'}
                        variant={job.status === 'OPEN' ? 'success' : 'neutral'}
                      />
                    )}
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
                    {isOwnJob ? (
                      <TouchableOpacity
                        style={styles.ownJobBtn}
                        onPress={(e) => {
                          e.stopPropagation();
                          router.push({
                            pathname: '/job-applicants',
                            params: { jobId: job.id, jobTitle: job.title }
                          });
                        }}
                      >
                        <Text style={styles.ownJobBtnText}>👥 Mga Nag-apply</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          handleApply(job.id);
                        }}
                        disabled={
                          applying === job.id ||
                          appliedJobs.includes(job.id) ||
                          job.status !== 'OPEN'
                        }
                        style={[
                          styles.applyBtn,
                          appliedJobs.includes(job.id) && styles.applyBtnDone,
                          job.status !== 'OPEN' && styles.applyBtnClosed
                        ]}
                      >
                        {applying === job.id ? (
                          <ActivityIndicator color={colors.white} size="small" />
                        ) : (
                          <Text style={styles.applyText}>
                            {appliedJobs.includes(job.id)
                              ? 'Nag-apply na ✓'
                              : job.status !== 'OPEN'
                              ? 'Sarado na'
                              : 'Mag-apply'}
                          </Text>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Report button — only for non-own jobs */}
                  {!isOwnJob && (
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        setReporting(job.id);
                      }}
                      style={styles.reportBtn}
                    >
                      <Text style={styles.reportText}>🚩 I-report</Text>
                    </TouchableOpacity>
                  )}
                </Card>
              </TouchableOpacity>
            );
          })}
          <View style={{ height: 100 }} />
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

      {/* Floating Post Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/post-job')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={20} color={colors.white} />
        <Text style={styles.fabText}>Mag-post</Text>
      </TouchableOpacity>

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
  filterBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: colors.successLight,
    borderWidth: 1,
    borderColor: colors.success,
  },
  filterBtnInactive: {
    backgroundColor: colors.white,
    borderColor: colors.gray200,
  },
  filterBtnText: {
    fontSize: typography.fontSizes.xs,
    color: colors.success,
    fontWeight: typography.fontWeights.medium,
  },
  filterBtnTextInactive: {
    color: colors.gray600,
  },
  searchWrap: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
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
  nearbyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    padding: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  nearbyText: {
    fontSize: typography.fontSizes.xs,
    color: colors.primary,
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
    textAlign: 'center',
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
  applyBtnClosed: { backgroundColor: colors.gray200 },
  applyText: {
    fontSize: typography.fontSizes.sm,
    color: colors.white,
    fontWeight: typography.fontWeights.medium,
  },
  ownJobBtn: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  ownJobBtnText: {
    fontSize: typography.fontSizes.xs,
    color: colors.primary,
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
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 999,
    backgroundColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  fabText: {
    fontSize: typography.fontSizes.sm,
    color: colors.white,
    fontWeight: typography.fontWeights.bold,
  },
});