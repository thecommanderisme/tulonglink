import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Button } from '../../components';
import { colors, typography, spacing } from '../../theme';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <Text style={styles.logo}>TulongLink</Text>
        <Text style={styles.tagline}>Trabaho, tulong, at balita para sa inyong komunidad</Text>
      </View>

      <View style={styles.bottom}>
        <Button
          label="Magsimula"
          onPress={() => router.push('/(auth)/phone')}
        />
        <Text style={styles.hint}>Libre. Walang resume. Para sa lahat.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: spacing.xl,
    justifyContent: 'space-between',
  },
  top: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: typography.fontSizes.xxxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
    marginBottom: spacing.md,
  },
  tagline: {
    fontSize: typography.fontSizes.lg,
    color: colors.primaryLight,
    textAlign: 'center',
    lineHeight: 26,
  },
  bottom: { gap: spacing.md },
  hint: {
    fontSize: typography.fontSizes.sm,
    color: colors.primaryLight,
    textAlign: 'center',
  },
});
