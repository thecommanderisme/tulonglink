import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing } from '../../theme';
import { Card, Badge } from '../../components';
import { logout } from '../../lib/auth';

// Placeholder data — will be replaced with real API data in Month 2
const SAMPLE_JOBS = [
  { id: 1, title: 'Labandera / Plantsa', pay: '₱300/araw', location: 'Barangay 123' },
  { id: 2, title: 'Tagaluto', pay: '₱400/araw', location: 'Barangay 456' },
  { id: 3, title: 'Tanod ng Gabi', pay: '₱500/gabi', location: 'Barangay 789' },
];

const SAMPLE_ANNOUNCEMENTS = [
  { id: 1, title: 'Libreng Medical Mission', category: 'Kalusugan', date: 'Abr 28' },
  { id: 2, title: 'Ayuda Distribution', category: 'Tulong', date: 'Abr 30' },
];

const SAMPLE_SERVICES = [
  { id: 1, name: 'Ospital ng Maynila', category: 'Ospital', hours: '24/7' },
  { id: 2, name: 'DSWD Office', category: 'Tulong', hours: '8am-5pm' },
];

export default function HomeScreen() {
  const { t } = useTranslation();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/welcome');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

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
      <TouchableOpacity style={styles.emergencyBanner}>
        <Text style={styles.emergencyIcon}>🚨</Text>
        <View>
          <Text style={styles.emergencyTitle}>Emergency Hotlines</Text>
          <Text style={styles.emergencySubtitle}>Tap para makita ang mga hotline</Text>
        </View>
        <Text style={styles.emergencyArrow}>→</Text>
      </TouchableOpacity>

      {/* Jobs Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mga Trabaho Ngayon</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/jobs')}>
            <Text style={styles.seeAll}>Lahat →</Text>
          </TouchableOpacity>
        </View>
        {SAMPLE_JOBS.map(job => (
          <Card key={job.id}>
            <Text style={styles.jobTitle}>{job.title}</Text>
            <View style={styles.jobMeta}>
              <Badge label={job.pay} variant="success" />
              <Text style={styles.jobLocation}>📍 {job.location}</Text>
            </View>
          </Card>
        ))}
      </View>

      {/* Announcements Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mga Balita</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/feed')}>
            <Text style={styles.seeAll}>Lahat →</Text>
          </TouchableOpacity>
        </View>
        {SAMPLE_ANNOUNCEMENTS.map(a => (
          <Card key={a.id}>
            <View style={styles.announcementRow}>
              <View style={styles.announcementLeft}>
                <Text style={styles.announcementTitle}>{a.title}</Text>
                <Badge label={a.category} variant="primary" />
              </View>
              <Text style={styles.announcementDate}>{a.date}</Text>
            </View>
          </Card>
        ))}
      </View>

      {/* Services Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mga Serbisyo</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/services')}>
            <Text style={styles.seeAll}>Lahat →</Text>
          </TouchableOpacity>
        </View>
        {SAMPLE_SERVICES.map(s => (
          <Card key={s.id}>
            <View style={styles.serviceRow}>
              <View>
                <Text style={styles.serviceName}>{s.name}</Text>
                <Badge label={s.category} variant="neutral" />
              </View>
              <Text style={styles.serviceHours}>{s.hours}</Text>
            </View>
          </Card>
        ))}
      </View>

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
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
    marginLeft: 'auto',
    color: colors.white,
    fontSize: typography.fontSizes.lg,
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
  },
  seeAll: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
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
  announcementLeft: { gap: spacing.xs },
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
});