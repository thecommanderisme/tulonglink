import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components';
import { colors, typography, spacing } from '../../theme';
import { TouchableOpacity } from 'react-native';
import i18n, { changeLanguage } from '../../lib/i18n';

export default function WelcomeScreen() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <Text style={styles.logo}>TulongLink</Text>
        <Text style={styles.tagline}>{t('welcome.tagline')}</Text>
      </View>

      <View style={styles.bottom}>
        {/* Language toggle */}
        <View style={styles.langRow}>
            <TouchableOpacity
            onPress={() => changeLanguage('tl')}
            style={[styles.langBtn, i18n.language === 'tl' && styles.langBtnActive]}
            >
            <Text style={[styles.langText, i18n.language === 'tl' && styles.langTextActive]}>Filipino</Text>
            </TouchableOpacity>
            <TouchableOpacity
            onPress={() => changeLanguage('en')}
            style={[styles.langBtn, i18n.language === 'en' && styles.langBtnActive]}
            >
            <Text style={[styles.langText, i18n.language === 'en' && styles.langTextActive]}>English</Text>
            </TouchableOpacity>
        </View>

        <Button
            label={t('welcome.start')}
            onPress={() => router.push('/(auth)/phone')}
        />
        <Text style={styles.hint}>{t('welcome.hint')}</Text>
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
  langRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  langBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
    langBtnActive: {
    backgroundColor: colors.white,
    borderColor: colors.white,
    },
    langText: {
    fontSize: typography.fontSizes.sm,
    color: colors.primaryLight,
    fontWeight: typography.fontWeights.medium,
    },
    langTextActive: {
    color: colors.primary,
    },
});