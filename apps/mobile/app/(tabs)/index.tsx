import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { colors, typography, spacing } from '../../theme';
import { logout } from '../../lib/auth';

export default function HomeScreen() {
  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/welcome');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Magandang umaga! 👋</Text>
      <Text style={styles.subtitle}>Ano ang kailangan mo ngayon?</Text>

      <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
        <Text style={styles.logoutText}>Logout (temp)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
    padding: spacing.xl,
    paddingTop: 60,
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
    marginBottom: spacing.xxl,
  },
  logoutBtn: {
    padding: spacing.md,
    backgroundColor: colors.dangerLight,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutText: {
    color: colors.danger,
    fontWeight: typography.fontWeights.medium,
  },
});