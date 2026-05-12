import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Modal, ActivityIndicator,
  RefreshControl
} from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing } from '../../theme';
import { Card, Badge, Input } from '../../components';
import { logout } from '../../lib/auth';
import { useCachedFetch } from '../../lib/useCachedFetch';
import api from '../../lib/api';

interface Job {
  id: number;
  title: string;
  pay: string;
  location: string;
  category: string;
  applicationCount: number;
}

interface Announcement {
  id: number;
  title: string;
  category: string;
  createdAt: string;
}

interface ServiceCenter {
  id: number;
  category: string;
  hours: string;
  address: string;
}

export default function HomeScreen() {
  const { t } = useTranslation();
  const [showHelpForm, setShowHelpForm] = useState(false);
  const [helpType, setHelpType] = useState('');
  const [helpSummary, setHelpSummary] = useState('');
  const [helpPrivacy, setHelpPrivacy] = useState('PUBLIC');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { data: jobs, refresh: refreshJobs } =
    useCachedFetch<Job[]>('/jobs');
  const { data: announcements, refresh: refreshAnnouncements } =
    useCachedFetch<Announcement[]>('/announcements');
  const { data: services, refresh: refreshServices } =
    useCachedFetch<ServiceCenter[]>('/services');

  const handleRefresh = async () => {
    await Promise.all([
      refreshJobs(),
      refreshAnnouncements(),
      refreshServices()
    ]);
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/welcome');
  };

  const handleSubmitHelp = async () => {
    if (!helpType) return;
    setSubmitting(true);
    try {
      await api.post('/help-requests', {
        requestType: helpType,
        summary: helpSummary,
        privacyLevel: helpPrivacy,
      });
      setSubmitted(true);
    } catch (err) {
      console.log('Help request error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowHelpForm(false);
    setSubmitted(false);
    setHelpType('');
    setHelpSummary('');
    setHelpPrivacy('PUBLIC');
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={handleRefresh}
            tintColor={colors.white}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{t('home.greeting')}</Text>
            <Text style={styles.subtitle}>{t('home.subtitle')}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Emergency Banner */}
        <TouchableOpacity
          style={styles.emergencyBanner}
          onPress={() => router.push('/emergency')}
        >
          <Text style={styles.emergencyIcon}>🚨</Text>
          <View style={styles.emergencyTextWrap}>
            <Text style={styles.emergencyTitle}>Emergency Hotlines</Text>
            <Text style={styles.emergencySubtitle}>
              Tap para makita ang mga hotline
            </Text>
          </View>
          <Text style={styles.emergencyArrow}>→</Text>
        </TouchableOpacity>

        {/* Help Request Button */}
        <View style={styles.helpSection}>
          <Text style={styles.sectionTitle}>Kailangan mo ng tulong?</Text>
          <TouchableOpacity
            style={styles.helpBtn}
            onPress={() => setShowHelpForm(true)}
          >
            <Text style={styles.helpBtnText}>🤝 Humingi ng Tulong</Text>
          </TouchableOpacity>
        </View>

        {/* Jobs Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mga Trabaho Ngayon</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/jobs')}>
              <Text style={styles.seeAll}>Lahat →</Text>
            </TouchableOpacity>
          </View>
          {!jobs || jobs.length === 0 ? (
            <Card>
              <Text style={styles.emptyText}>Walang trabaho ngayon</Text>
            </Card>
          ) : (
            jobs.slice(0, 3).map(job => (
              <TouchableOpacity
                key={job.id}
                onPress={() => router.push({
                  pathname: '/job-detail',
                  params: { id: job.id }
                })}
                activeOpacity={0.8}
              >
                <Card>
                  <Text style={styles.jobTitle}>{job.title}</Text>
                  <View style={styles.jobMeta}>
                    {job.pay && <Badge label={job.pay} variant="success" />}
                    {job.location && (
                      <Text style={styles.jobLocation}>📍 {job.location}</Text>
                    )}
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Announcements Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mga Balita</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/feed')}>
              <Text style={styles.seeAll}>Lahat →</Text>
            </TouchableOpacity>
          </View>
          {!announcements || announcements.length === 0 ? (
            <Card>
              <Text style={styles.emptyText}>Walang balita ngayon</Text>
            </Card>
          ) : (
            announcements.slice(0, 3).map(a => (
              <Card key={a.id}>
                <View style={styles.announcementRow}>
                  <View style={styles.announcementLeft}>
                    <Text style={styles.announcementTitle}>{a.title}</Text>
                    {a.category && (
                      <Badge label={a.category} variant="primary" />
                    )}
                  </View>
                  <Text style={styles.announcementDate}>
                    {formatDate(a.createdAt)}
                  </Text>
                </View>
              </Card>
            ))
          )}
        </View>

        {/* Services Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mga Serbisyo</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/services')}>
              <Text style={styles.seeAll}>Lahat →</Text>
            </TouchableOpacity>
          </View>
          {!services || services.length === 0 ? (
            <Card>
              <Text style={styles.emptyText}>Walang serbisyo ngayon</Text>
            </Card>
          ) : (
            services.slice(0, 3).map(s => (
              <Card key={s.id}>
                <View style={styles.serviceRow}>
                  <View>
                    <Text style={styles.serviceName}>
                      {s.address || s.category}
                    </Text>
                    <Badge label={s.category} variant="neutral" />
                  </View>
                  {s.hours && (
                    <Text style={styles.serviceHours}>{s.hours}</Text>
                  )}
                </View>
              </Card>
            ))
          )}
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>

      {/* Help Request Modal */}
      <Modal
        visible={showHelpForm}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Humingi ng Tulong</Text>

            {submitted ? (
              <View style={styles.successBox}>
                <Text style={styles.successIcon}>✅</Text>
                <Text style={styles.successText}>
                  Natanggap ang iyong kahilingan!
                </Text>
                <Text style={styles.successSubtext}>
                  Makikipag-ugnayan sa iyo ang aming team.
                </Text>
                <TouchableOpacity
                  style={styles.doneBtn}
                  onPress={handleCloseModal}
                >
                  <Text style={styles.doneBtnText}>Tapos na</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.fieldLabel}>Uri ng tulong</Text>
                <View style={styles.helpTypes}>
                  {['Pagkain', 'Medikal', 'Trabaho', 'Tirahan', 'Iba pa'].map(type => (
                    <TouchableOpacity
                      key={type}
                      onPress={() => setHelpType(type)}
                      style={[
                        styles.helpTypeBtn,
                        helpType === type && styles.helpTypeBtnActive
                      ]}
                    >
                      <Text style={[
                        styles.helpTypeText,
                        helpType === type && styles.helpTypeTextActive
                      ]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Input
                  label="Ilarawan ang iyong sitwasyon"
                  placeholder="Halimbawa: Wala kaming pagkain ngayong gabi..."
                  value={helpSummary}
                  onChangeText={setHelpSummary}
                  multiline
                  numberOfLines={4}
                />

                <Text style={styles.fieldLabel}>Privacy</Text>
                <View style={styles.privacyRow}>
                  {[
                    { value: 'PUBLIC', label: '🌐 Pampubliko' },
                    { value: 'ANONYMOUS', label: '🔒 Anonymous' },
                  ].map(opt => (
                    <TouchableOpacity
                      key={opt.value}
                      onPress={() => setHelpPrivacy(opt.value)}
                      style={[
                        styles.privacyBtn,
                        helpPrivacy === opt.value && styles.privacyBtnActive
                      ]}
                    >
                      <Text style={[
                        styles.privacyText,
                        helpPrivacy === opt.value && styles.privacyTextActive
                      ]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={handleCloseModal}
                  >
                    <Text style={styles.cancelText}>Kanselahin</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.submitBtn,
                      (!helpType || submitting) && { opacity: 0.6 }
                    ]}
                    onPress={handleSubmitHelp}
                    disabled={submitting || !helpType}
                  >
                    {submitting ? (
                      <ActivityIndicator color={colors.white} size="small" />
                    ) : (
                      <Text style={styles.submitText}>Isumite</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.xl,
    paddingTop: 60,
    backgroundColor: colors.primary,
  },
  greeting: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.primaryLight,
  },
  logoutText: {
    fontSize: typography.fontSizes.sm,
    color: colors.primaryLight,
    marginTop: spacing.xs,
  },
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.danger,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: 12,
    gap: spacing.md,
  },
  emergencyIcon: { fontSize: 24 },
  emergencyTextWrap: { flex: 1 },
  emergencyTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
  },
  emergencySubtitle: {
    fontSize: typography.fontSizes.xs,
    color: colors.dangerLight,
    marginTop: 2,
  },
  emergencyArrow: {
    color: colors.white,
    fontSize: typography.fontSizes.lg,
  },
  helpSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.gray900,
    marginBottom: spacing.sm,
  },
  seeAll: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },
  helpBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
  },
  helpBtnText: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
  },
  emptyText: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray400,
    textAlign: 'center',
    padding: spacing.sm,
  },
  jobTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.gray900,
    marginBottom: spacing.sm,
  },
  jobMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  jobLocation: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray600,
  },
  announcementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  announcementLeft: { gap: spacing.xs, flex: 1 },
  announcementTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.gray900,
    marginBottom: spacing.xs,
  },
  announcementDate: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray400,
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceName: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.gray900,
    marginBottom: spacing.xs,
  },
  serviceHours: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray600,
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
  helpTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  helpTypeBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  helpTypeBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  helpTypeText: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray600,
  },
  helpTypeTextActive: { color: colors.white },
  privacyRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  privacyBtn: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.gray200,
    alignItems: 'center',
  },
  privacyBtnActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  privacyText: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray600,
  },
  privacyTextActive: {
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
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
    backgroundColor: colors.primary,
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
  successSubtext: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray600,
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