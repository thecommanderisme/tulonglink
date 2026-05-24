import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button, Input } from '../../components';
import { colors, typography, spacing } from '../../theme';
import { verifyOtp, sendOtp } from '../../lib/authApi';
import api from '../../lib/api';

export default function OtpScreen() {
  const { t } = useTranslation();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

const handleVerify = async () => {
  if (!otp || otp.length < 6) {
    setError(t('otp.error'));
    return;
  }
  setError('');
  setLoading(true);
  try {
    await verifyOtp(phone, otp);

    // Check if returning user
    try {
      const profileResponse = await api.get('/users/profile');
      if (profileResponse.data?.barangayId) {
        router.replace('/(tabs)');
      } else if (profileResponse.data?.displayName) {
        // Has name but no barangay — go to barangay picker
        router.replace({
          pathname: '/(auth)/barangay',
          params: { isOnboarding: 'true' }
        });
      } else {
        // Brand new user — go through full onboarding
        router.replace({
          pathname: '/(auth)/onboarding',
          params: { phone }
        });
      }
    } catch {
      // No profile — new user
      router.replace({
        pathname: '/(auth)/onboarding',
        params: { phone }
      });
    }
  } catch (err: any) {
    setError(t('otp.apiError'));
  } finally {
    setLoading(false);
  }
};

  const handleResend = async () => {
    setResending(true);
    try {
      await sendOtp(phone);
      setError('');
      setOtp('');
    } catch (err: any) {
      if (err.response?.status === 429) {
        setError('Napakaraming pagsubok. Maghintay ng isang minuto.');
      } else {
        setError(t('phone.apiError'));
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.container}>

      {/* Back button */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.backBtn}
      >
        <Text style={styles.backText}>← Bumalik</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>{t('otp.title')}</Text>
        <Text style={styles.subtitle}>{t('otp.subtitle')} {phone}</Text>
      </View>

      <Input
        label={t('otp.label')}
        placeholder="______"
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        maxLength={6}
        error={error}
      />

      <Button
        label={loading ? '...' : t('otp.button')}
        onPress={handleVerify}
        loading={loading}
        disabled={loading}
      />

      <Button
        label={resending ? t('otp.resending') : t('otp.resend')}
        variant="outline"
        onPress={handleResend}
        loading={resending}
        disabled={resending}
        style={{ marginTop: spacing.md }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    padding: spacing.xl,
    paddingTop: 60,
  },
  backBtn: {
    marginBottom: spacing.xl,
  },
  backText: {
    fontSize: typography.fontSizes.md,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },
  header: {
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.gray900,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSizes.md,
    color: colors.gray600,
    lineHeight: 24,
  },
});