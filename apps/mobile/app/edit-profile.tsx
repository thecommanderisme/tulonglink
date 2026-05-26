import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme';
import { Input, Button, LocationPicker } from '../components';
import type { LocationValue } from '../components/LocationPicker';
import api from '../lib/api';
import { changeLanguage } from '../lib/i18n';

const AVAILABILITY_OPTIONS = [
  { value: 'FULL_TIME', label: '🕐 Full-time', sub: 'Buong araw, buong linggo' },
  { value: 'PART_TIME', label: '⏰ Part-time', sub: 'Ilang oras lang' },
  { value: 'ONE_TIME', label: '📅 One-time', sub: 'Isang beses lang' },
  { value: 'WEEKENDS', label: '🗓 Weekends', sub: 'Sabado at Linggo' },
];

export default function EditProfileScreen() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [skillsSummary, setSkillsSummary] = useState('');
  const [language, setLanguage] = useState('tl');
  const [availability, setAvailability] = useState('');
  const [location, setLocation] = useState<LocationValue | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      if (response.data) {
        setDisplayName(response.data.displayName || '');
        setEmail(response.data.email || '');
        setSkillsSummary(response.data.skillsSummary || '');
        setLanguage(response.data.language || 'tl');
        setAvailability(response.data.availability || '');
        if (response.data.barangayName) {
          setLocation({
            provinceCode: '',
            provinceName: '',
            cityCode: '',
            cityName: response.data.barangayCity || '',
            barangayCode: '',
            barangayName: response.data.barangayName || '',
            displayName: response.data.barangayName
              ? `${response.data.barangayName}, ${response.data.barangayCity || ''}`
              : '',
          });
        }
      }
    } catch (err) {
      console.log('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch('/users/profile', {
        displayName: displayName.trim(),
        skillsSummary: skillsSummary.trim(),
        language,
        availability,
        email: email.trim(),
      });

      if (location?.barangayName) {
        await api.post('/users/barangay', {
          barangayName: location.barangayName,
          cityName: location.cityName,
          provinceName: location.provinceName,
          displayName: location.displayName,
        });
      }

      await changeLanguage(language as 'en' | 'tl');

      Alert.alert(
        'Na-save! ✅',
        'Na-update na ang iyong profile.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Hindi ma-save. Subukan ulit.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>I-edit ang Profile</Text>
      </View>

      <ScrollView
        style={styles.form}
        showsVerticalScrollIndicator={false}
      >
        {/* Personal */}
        <Text style={styles.sectionLabel}>Personal</Text>

        <Input
          label="Pangalan o Palayaw"
          placeholder="Halimbawa: Ate Maria, Kuya Jun"
          value={displayName}
          onChangeText={setDisplayName}
        />

        <Input
          label="Email Address"
          placeholder="example@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Location */}
        <Text style={styles.sectionLabel}>Lokasyon</Text>

        <LocationPicker
          label="Barangay"
          value={location}
          onChange={setLocation}
        />

        {/* Work */}
        <Text style={styles.sectionLabel}>Trabaho</Text>

        <Input
          label="Mga Kasanayan"
          placeholder="Halimbawa: Magluto, Maglaba, Karpintero"
          value={skillsSummary}
          onChangeText={setSkillsSummary}
          multiline
          numberOfLines={3}
        />

        <Text style={styles.fieldLabel}>Availability</Text>
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
            </TouchableOpacity>
          ))}
        </View>

        {/* Language */}
        <Text style={styles.sectionLabel}>Preferences</Text>
        <Text style={styles.fieldLabel}>Wika</Text>
        <View style={styles.langRow}>
          {[
            { value: 'tl', label: '🇵🇭 Filipino' },
            { value: 'en', label: '🇺🇸 English' },
          ].map(opt => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setLanguage(opt.value)}
              style={[
                styles.langBtn,
                language === opt.value && styles.langBtnActive
              ]}
            >
              <Text style={[
                styles.langText,
                language === opt.value && styles.langTextActive
              ]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          label={saving ? 'Sine-save...' : 'I-save ang Profile'}
          onPress={handleSave}
          loading={saving}
          disabled={saving}
          style={styles.saveBtn}
        />

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xl,
    paddingTop: 60,
    backgroundColor: colors.primary,
    gap: spacing.md,
  },
  backBtn: { padding: spacing.xs },
  headerTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
  },
  form: { flex: 1, padding: spacing.lg },
  sectionLabel: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
    color: colors.gray400,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  fieldLabel: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.gray600,
    marginBottom: spacing.sm,
  },
  availabilityGrid: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  availabilityBtn: {
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray200,
    backgroundColor: colors.white,
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
  langRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  langBtn: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.gray200,
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  langBtnActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  langText: {
    fontSize: typography.fontSizes.md,
    color: colors.gray600,
  },
  langTextActive: {
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },
  saveBtn: { marginTop: spacing.md },
});