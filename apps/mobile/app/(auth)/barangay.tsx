import { useState } from 'react';
import {
  View, Text, StyleSheet,
  TouchableOpacity, ActivityIndicator
} from 'react-native';
import { router } from 'expo-router';
import { colors, typography, spacing } from '../../theme';
import { Button, LocationPicker } from '../../components';
import type { LocationValue } from '../../components/LocationPicker';
import api from '../../lib/api';

export default function BarangayScreen() {
  const [location, setLocation] = useState<LocationValue | null>(null);
  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    if (!location) return;
    setSaving(true);
    try {
      await api.post('/users/barangay', {
        barangayName: location.barangayName,
        cityName: location.cityName,
        provinceName: location.provinceName,
        displayName: location.displayName,
      });
    } catch (err) {
      console.log('Barangay save error:', err);
    } finally {
      setSaving(false);
      router.replace('/(tabs)');
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Saan ka nakatira?</Text>
        <Text style={styles.subtitle}>
          Para makita mo ang mga trabaho at balita malapit sa iyo
        </Text>
      </View>

      <View style={styles.content}>
        <LocationPicker
          label="Piliin ang iyong lokasyon"
          value={location}
          onChange={setLocation}
        />

        {location && (
          <View style={styles.selectedBanner}>
            <Text style={styles.selectedText}>
              📍 {location.displayName}
            </Text>
          </View>
        )}
      </View>

      {/* Bottom actions */}
      <View style={styles.bottom}>
        <Button
          label={saving ? 'Sine-save...' : 'Kumpirmahin'}
          onPress={handleConfirm}
          disabled={!location || saving}
          loading={saving}
        />
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipText}>Laktawan — itakda mamaya</Text>
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
    backgroundColor: colors.primary,
  },
  title: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.primaryLight,
    lineHeight: 20,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  selectedBanner: {
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
    padding: spacing.md,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  selectedText: {
    fontSize: typography.fontSizes.md,
    color: colors.primaryDark,
    fontWeight: typography.fontWeights.medium,
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