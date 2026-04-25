import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Input } from '../../components';
import { colors, typography, spacing } from '../../theme';

export default function OtpScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const handleVerify = () => {
    if (!otp || otp.length < 6) {
      setError('Ilagay ang 6-digit na OTP');
      return;
    }
    setError('');
    // TODO: connect to Spring Boot /auth/verify-otp
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>I-verify ang iyong numero</Text>
        <Text style={styles.subtitle}>
          Nagpadala kami ng OTP sa {phone}
        </Text>
      </View>

      <Input
        label="OTP Code"
        placeholder="______"
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        maxLength={6}
        error={error}
      />

      <Button
        label="I-verify"
        onPress={handleVerify}
      />

      <Button
        label="Magpadala ulit"
        variant="outline"
        onPress={() => {}}
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