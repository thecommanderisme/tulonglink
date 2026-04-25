import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Button, Input } from '../../components';
import { colors, typography, spacing } from '../../theme';

export default function PhoneScreen() {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleContinue = () => {
    if (!phone || phone.length < 11) {
      setError('Ilagay ang wastong numero ng telepono');
      return;
    }
    setError('');
    router.push({ pathname: '/(auth)/otp', params: { phone } });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ano ang iyong numero?</Text>
        <Text style={styles.subtitle}>
          Magpapadala kami ng OTP sa iyong telepono
        </Text>
      </View>

      <Input
        label="Numero ng Telepono"
        placeholder="09XXXXXXXXX"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        maxLength={11}
        error={error}
      />

      <Button
        label="Magpadala ng OTP"
        onPress={handleContinue}
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