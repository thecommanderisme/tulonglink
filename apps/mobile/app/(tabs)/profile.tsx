import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../theme';
import { Badge, Button } from '../../components';
import { logout } from '../../lib/auth';
import { logoutApi } from '../../lib/authApi';
import api from '../../lib/api';

interface UserProfile {
  id: number;
  phone: string;
  email: string;
  role: string;
  status: string;
}

interface UserProfileDetail {
  displayName: string;
  barangayName: string;
  skillsSummary: string;
  language: string;
}

const QUICK_LINKS = [
  { icon: 'create-outline', label: 'I-edit ang Profile', route: '/edit-profile', color: '#378ADD' },
  { icon: 'briefcase-outline', label: 'Mga Na-apply Ko', route: '/my-applications', color: '#1D9E75' },
  { icon: 'heart-outline', label: 'Mga Kahilingan Ko', route: '/my-help-requests', color: '#D4537E' },
  { icon: 'search-outline', label: 'Maghanap ng Trabaho', route: '/(tabs)/jobs', color: '#BA7517' },
  { icon: 'medkit-outline', label: 'Mga Serbisyo', route: '/(tabs)/services', color: '#639922' },
  { icon: 'alert-circle-outline', label: 'Emergency Hotlines', route: '/emergency', color: '#E24B4A' },
];

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileDetail, setProfileDetail] = useState<UserProfileDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  const fetchProfile = async () => {
    try {
      const [userRes, detailRes] = await Promise.all([
        api.get('/users/me'),
        api.get('/users/profile'),
      ]);
      setProfile(userRes.data);
      setProfileDetail(detailRes.data);
    } catch (err) {
      console.log('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutApi();
    await logout();
    router.replace('/(auth)/welcome');
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      RESIDENT: 'Residente',
      EMPLOYER: 'Employer',
      PARTNER: 'Partner',
      BARANGAY_ADMIN: 'Barangay Admin',
      SUPER_ADMIN: 'Super Admin',
    };
    return labels[role] || role;
  };

  const getRoleVariant = (role: string): any => {
    const variants: Record<string, string> = {
      RESIDENT: 'neutral',
      EMPLOYER: 'primary',
      PARTNER: 'success',
      BARANGAY_ADMIN: 'warning',
      SUPER_ADMIN: 'danger',
    };
    return variants[role] || 'neutral';
  };

  const getInitials = () => {
    if (profileDetail?.displayName) {
      return profileDetail.displayName.slice(0, 2).toUpperCase();
    }
    return profile?.phone?.slice(-2) || '??';
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity
            onPress={() => router.push('/edit-profile')}
            style={styles.editBtn}
          >
            <Ionicons name="create-outline" size={20} color={colors.primary} />
            <Text style={styles.editBtnText}>I-edit</Text>
          </TouchableOpacity>
        </View>

        {/* Avatar + Info */}
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials()}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>
              {profileDetail?.displayName || 'Walang pangalan'}
            </Text>
            <Text style={styles.phone}>{profile?.phone}</Text>
            {profile?.role && (
              <View style={styles.badgeRow}>
                <Badge
                  label={getRoleLabel(profile.role)}
                  variant={getRoleVariant(profile.role)}
                />
              </View>
            )}
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {profileDetail?.barangayName ? (
            <View style={styles.statItem}>
              <Ionicons name="location-outline" size={14} color={colors.gray400} />
              <Text style={styles.statText}>{profileDetail.barangayName}</Text>
            </View>
          ) : null}
          {profileDetail?.skillsSummary ? (
            <View style={styles.statItem}>
              <Ionicons name="construct-outline" size={14} color={colors.gray400} />
              <Text style={styles.statText} numberOfLines={1}>
                {profileDetail.skillsSummary}
              </Text>
            </View>
          ) : null}
          <View style={styles.statItem}>
            <Ionicons name="language-outline" size={14} color={colors.gray400} />
            <Text style={styles.statText}>
              {profileDetail?.language === 'en' ? 'English' : 'Filipino'}
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Links */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Mga Shortcut</Text>
        <View style={styles.linksGrid}>
          {QUICK_LINKS.map(link => (
            <TouchableOpacity
              key={link.route}
              style={styles.linkCard}
              onPress={() => router.push(link.route as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.linkIcon, { backgroundColor: link.color + '18' }]}>
                <Ionicons name={link.icon as any} size={22} color={link.color} />
              </View>
              <Text style={styles.linkLabel}>{link.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Account Info */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <Ionicons name="call-outline" size={16} color={colors.gray400} />
              <Text style={styles.infoLabel}>Telepono</Text>
            </View>
            <Text style={styles.infoValue}>{profile?.phone || '—'}</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <Ionicons name="mail-outline" size={16} color={colors.gray400} />
              <Text style={styles.infoLabel}>Email</Text>
            </View>
            <Text style={styles.infoValue}>{profile?.email || '—'}</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <Ionicons name="shield-checkmark-outline" size={16} color={colors.gray400} />
              <Text style={styles.infoLabel}>Status</Text>
            </View>
            <View style={[styles.statusBadge, {
              backgroundColor: profile?.status === 'ACTIVE' ? colors.successLight : colors.dangerLight
            }]}>
              <Text style={[styles.statusText, {
                color: profile?.status === 'ACTIVE' ? colors.success : colors.danger
              }]}>
                {profile?.status === 'ACTIVE' ? '● Aktibo' : '● Hindi aktibo'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Logout */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={styles.logoutText}>Mag-logout</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray100 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: colors.white,
    padding: spacing.xl,
    paddingTop: 60,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.gray200,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.gray900,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },
  editBtnText: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
  },
  profileInfo: { flex: 1, gap: spacing.xs },
  name: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.gray900,
  },
  phone: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray400,
  },
  badgeRow: { marginTop: 2 },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 0.5,
    borderTopColor: colors.gray100,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray600,
  },
  section: {
    padding: spacing.lg,
    paddingBottom: 0,
  },
  sectionLabel: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
    color: colors.gray400,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: spacing.md,
  },
  linksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  linkCard: {
    width: '30%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 0.5,
    borderColor: colors.gray200,
    flexGrow: 1,
  },
  linkIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkLabel: {
    fontSize: typography.fontSizes.xs,
    color: colors.gray700,
    textAlign: 'center',
    fontWeight: typography.fontWeights.medium,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: colors.gray200,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray600,
  },
  infoValue: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray900,
    fontWeight: typography.fontWeights.medium,
  },
  infoDivider: {
    height: 0.5,
    backgroundColor: colors.gray100,
    marginHorizontal: spacing.lg,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 999,
  },
  statusText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 0.5,
    borderColor: colors.dangerLight,
    marginBottom: spacing.lg,
  },
  logoutText: {
    fontSize: typography.fontSizes.md,
    color: colors.danger,
    fontWeight: typography.fontWeights.medium,
  },
});