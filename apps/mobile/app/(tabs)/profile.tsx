import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator
} from 'react-native';
import { router } from 'expo-router';
import { colors, typography, spacing } from '../../theme';
import { Card, Badge, Button } from '../../components';
import { logout, getToken } from '../../lib/auth';
import api from '../../lib/api';

interface UserProfile {
  id: number;
  phone: string;
  email: string;
  role: string;
  status: string;
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/me');
      setProfile(response.data);
    } catch (err) {
      console.log('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profile?.phone?.slice(-2) || '??'}
          </Text>
        </View>
        <Text style={styles.phone}>{profile?.phone || 'Unknown'}</Text>
        {profile?.role && (
          <Badge
            label={getRoleLabel(profile.role)}
            variant={getRoleVariant(profile.role)}
          />
        )}
      </View>

      {/* Account Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Info</Text>
        <Card>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📱 Telepono</Text>
            <Text style={styles.infoValue}>{profile?.phone || '—'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📧 Email</Text>
            <Text style={styles.infoValue}>{profile?.email || '—'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>👤 Role</Text>
            <Text style={styles.infoValue}>
              {profile?.role ? getRoleLabel(profile.role) : '—'}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>✅ Status</Text>
            <Text style={styles.infoValue}>{profile?.status || '—'}</Text>
          </View>
        </Card>
      </View>

      {/* Quick Links */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Links</Text>
        <Card>
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => router.push('/(tabs)/jobs')}
          >
            <Text style={styles.linkText}>💼 Mga Trabaho</Text>
            <Text style={styles.linkArrow}>→</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => router.push('/(tabs)/services')}
          >
            <Text style={styles.linkText}>🏥 Mga Serbisyo</Text>
            <Text style={styles.linkArrow}>→</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => router.push('/emergency')}
          >
            <Text style={styles.linkText}>🚨 Emergency Hotlines</Text>
            <Text style={styles.linkArrow}>→</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => router.push('/my-applications')}
          >
            <Text style={styles.linkText}>📋 Mga Na-apply Ko</Text>
            <Text style={styles.linkArrow}>→</Text>
          </TouchableOpacity>
        </Card>
      </View>

      {/* Logout */}
      <View style={styles.section}>
        <Button
          label="Mag-logout"
          variant="danger"
          onPress={handleLogout}
        />
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: colors.primary,
    padding: spacing.xl,
    paddingTop: 60,
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
  },
  phone: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
  },
  section: {
    padding: spacing.lg,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.gray900,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
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
  divider: {
    height: 0.5,
    backgroundColor: colors.gray200,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  linkText: {
    fontSize: typography.fontSizes.md,
    color: colors.gray900,
  },
  linkArrow: {
    fontSize: typography.fontSizes.md,
    color: colors.gray400,
  },
});