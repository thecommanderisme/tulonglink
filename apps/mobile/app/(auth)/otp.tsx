import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button, Input } from '../../components';
import { colors, typography, spacing } from '../../theme';
import { verifyOtp, sendOtp } from '../../lib/auth';

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
      router.replace('/(tabs)');
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
    } catch (err: any) {
      setError(t('phone.apiError'));
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.container}>
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
    paddingTop: 80,
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