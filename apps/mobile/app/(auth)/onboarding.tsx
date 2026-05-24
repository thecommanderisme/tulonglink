import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../theme';
import { Input, Button } from '../../components';
import api from '../../lib/api';

const AVAILABILITY_OPTIONS = [
  { value: 'FULL_TIME', label: '🕐 Full-time', sub: 'Buong araw, buong linggo' },
  { value: 'PART_TIME', label: '⏰ Part-time', sub: 'Ilang oras lang' },
  { value: 'ONE_TIME', label: '📅 One-time', sub: 'Isang beses lang' },
  { value: 'WEEKENDS', label: '🗓 Weekends', sub: 'Sabado at Linggo' },
];

export default function OnboardingScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState('');
  const [availability, setAvailability] = useState('');
  const [saving, setSaving] = useState(false);

  const handleNext = async () => {
    if (step === 1) {
      // Go to step 2
      setStep(2);
      return;
    }

    // Step 2 — save and go to barangay picker
    setSaving(true);
    try {
      if (displayName.trim() || availability) {
        await api.patch('/users/profile', {
          displayName: displayName.trim(),
          availability,
        });
      }
    } catch (err) {
      console.log('Onboarding save error:', err);
    } finally {
      setSaving(false);
      router.replace({
        pathname: '/(auth)/barangay',
        params: { isOnboarding: 'true' }
      });
    }
  };

  const handleSkip = () => {
    if (step === 1) {
      setStep(2);
    } else {
      router.replace({
        pathname: '/(auth)/barangay',
        params: { isOnboarding: 'true' }
      });
    }
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.progressRow}>
          {[1, 2, 3].map(s => (
            <View
              key={s}
              style={[
                styles.progressDot,
                s <= step && styles.progressDotActive,
                s < step && styles.progressDotDone
              ]}
            />
          ))}
        </View>
        <Text style={styles.stepLabel}>
          Hakbang {step} ng 3
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {step === 1 ? (
          <>
            {/* Step 1 — Name */}
            <Text style={styles.title}>
              Kumusta! 👋{'\n'}Ano ang tawag sa iyo?
            </Text>
            <Text style={styles.subtitle}>
              Ito ang makikita ng mga employer at komunidad
            </Text>

            <Input
              label="Pangalan o Palayaw"
              placeholder="Halimbawa: Maria, Kuya Jun, Ate Rose"
              value={displayName}
              onChangeText={setDisplayName}
            />

            <View style={styles.exampleRow}>
              {['Ate Maria', 'Kuya Jun', 'Lola Nena'].map(name => (
                <TouchableOpacity
                  key={name}
                  style={styles.exampleChip}
                  onPress={() => setDisplayName(name)}
                >
                  <Text style={styles.exampleText}>{name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <>
            {/* Step 2 — Availability */}
            <Text style={styles.title}>
              Kailan ka available{'\n'}magtrabaho?
            </Text>
            <Text style={styles.subtitle}>
              Makakatulong ito para makita ka ng mga employer
            </Text>

            <View style={styles.availabilityGrid}>
              {AVAILABILITY_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => setAvailability(opt.value)}
                  style={[
                    styles.availabilityBtn,
                    availability === opt.value && styles.availabilityBtnActive
                  ]}
                >
                  <Text style={styles.availabilityLabel}>{opt.label}</Text>
                  <Text style={[
                    styles.availabilitySub,
                    availability === opt.value && { color: colors.primary }
                  ]}>
                    {opt.sub}
                  </Text>
                  {availability === opt.value && (
                    <View style={styles.checkIcon}>
                      <Ionicons name="checkmark" size={14} color={colors.white} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <View style={{ height: spacing.xl }} />
      </ScrollView>

      {/* Bottom actions */}
      <View style={styles.bottom}>
        <Button
          label={saving ? 'Sine-save...' : step === 1 ? 'Susunod →' : 'Pumili ng Barangay →'}
          onPress={handleNext}
          loading={saving}
          disabled={saving}
        />
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipText}>
            {step === 1 ? 'Laktawan — itakda mamaya' : 'Laktawan ang hakbang na ito'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    padding: spacing.xl,
    paddingTop: 60,
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray200,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
  progressDotDone: {
    backgroundColor: colors.primaryLight,
    width: 8,
  },
  stepLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray400,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
  },
  title: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.gray900,
    marginBottom: spacing.sm,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: typography.fontSizes.md,
    color: colors.gray600,
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  exampleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  exampleChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    backgroundColor: colors.gray100,
    borderWidth: 0.5,
    borderColor: colors.gray200,
  },
  exampleText: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray600,
  },
  availabilityGrid: {
    gap: spacing.sm,
  },
  availabilityBtn: {
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray200,
    backgroundColor: colors.white,
    position: 'relative',
  },
  availabilityBtnActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  availabilityLabel: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.gray900,
    marginBottom: 2,
  },
  availabilitySub: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray400,
  },
  checkIcon: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottom: {
    padding: spacing.lg,
    borderTopWidth: 0.5,
    borderTopColor: colors.gray200,
    gap: spacing.sm,
  },
  skipBtn: {
    alignItems: 'center',
    padding: spacing.sm,
  },
  skipText: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray400,
  },
});