import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button, Input } from '../../components';
import { colors, typography, spacing } from '../../theme';
import auth from '@react-native-firebase/auth';
import { setConfirmation } from '../../lib/firebaseConfirmation';

export default function PhoneScreen() {
  const { t } = useTranslation();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!phone || phone.length < 11) {
      setError(t('phone.error'));
      return;
    }
    setError('');
    setLoading(true);
    try {
      const e164Phone = '+63' + phone.substring(1);
      const confirmation = await auth().signInWithPhoneNumber(e164Phone);
      setConfirmation(confirmation);
      router.push({ pathname: '/(auth)/otp', params: { phone } });
    } catch (err: any) {
      console.log('Firebase phone error:', err);
      if (err.code === 'auth/too-many-requests') {
        setError('Napakaraming pagsubok. Maghintay ng isang minuto.');
      } else {
        setError('Hindi ma-send ang OTP. Subukan ulit.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>{t('phone.back')}</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>{t('phone.title')}</Text>
        <Text style={styles.subtitle}>{t('phone.subtitle')}</Text>
      </View>

      <Input
        label={t('phone.label')}
        placeholder={t('phone.placeholder')}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        maxLength={11}
        error={error}
      />

      <Button
        label={loading ? t('phone.sending') : t('phone.button')}
        onPress={handleContinue}
        loading={loading}
        disabled={loading}
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
  backButton: { marginBottom: spacing.xl },
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
