import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button, Input } from '../../components';
import { colors, typography, spacing } from '../../theme';
import auth from '@react-native-firebase/auth';
import { getConfirmation, clearConfirmation } from '../../lib/firebaseConfirmation';
import { saveTokens } from '../../lib/auth';
import api from '../../lib/api';

export default function OtpScreen() {
  const { t } = useTranslation();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!otp || otp.length < 6) {
      setError(t('otp.error'));
      return;
    }
    setError('');
    setLoading(true);
    try {
      const confirmation = getConfirmation();
      if (!confirmation) {
        setError('Session expired. Please go back and try again.');
        return;
      }

      // Confirm OTP with Firebase
      const result = await confirmation.confirm(otp);
      clearConfirmation();

      // Get Firebase ID token
      const firebaseToken = await result.user.getIdToken();

      // Exchange Firebase token for your JWT
      const response = await api.post('/auth/verify-firebase', { firebaseToken });
      await saveTokens(response.data.token, response.data.refreshToken);

      // Check profile and navigate
      try {
        const profileResponse = await api.get('/users/profile');
        if (profileResponse.data?.barangayId) {
          router.replace('/(tabs)');
        } else if (profileResponse.data?.displayName) {
          router.replace({ pathname: '/(auth)/barangay', params: { isOnboarding: 'true' } });
        } else {
          router.replace({ pathname: '/(auth)/onboarding', params: { phone } });
        }
      } catch {
        router.replace({ pathname: '/(auth)/onboarding', params: { phone } });
      }

    } catch (err: any) {
      console.log('OTP verify error:', err);
      if (err.code === 'auth/invalid-verification-code') {
        setError('Mali ang OTP. Subukan ulit.');
      } else if (err.code === 'auth/code-expired') {
        setError('Expired na ang OTP. Bumalik at subukan ulit.');
      } else {
        setError(t('otp.apiError'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const e164Phone = '+63' + phone.substring(1);
      const { setConfirmation } = await import('../../lib/firebaseConfirmation');
      const confirmation = await auth().signInWithPhoneNumber(e164Phone);
      setConfirmation(confirmation);
      setError('');
      setOtp('');
    } catch (err: any) {
      if (err.code === 'auth/too-many-requests') {
        setError('Napakaraming pagsubok. Maghintay ng isang minuto.');
      } else {
        setError('Hindi ma-resend. Subukan ulit.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
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
        label={t('otp.resend')}
        variant="outline"
        onPress={handleResend}
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
  backBtn: { marginBottom: spacing.xl },
  backText: {
    fontSize: typography.fontSizes.md,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },
  header: { marginBottom: spacing.xxl },
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
