import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme';
import { Input, Button } from '../components';
import api from '../lib/api';
import i18n, { changeLanguage } from '../lib/i18n';

interface Barangay {
  id: number;
  name: string;
  city: string;
  displayName: string;
}

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
  const [language, setLanguage] = useState(i18n.language || 'tl');
  const [availability, setAvailability] = useState('');
  const [selectedBarangay, setSelectedBarangay] = useState<Barangay | null>(null);
  const [barangays, setBarangays] = useState<Barangay[]>([]);
  const [showBarangayPicker, setShowBarangayPicker] = useState(false);
  const [barangaySearch, setBarangaySearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, barangaysRes] = await Promise.all([
        api.get('/users/profile'),
        api.get('/barangays'),
      ]);

      if (profileRes.data) {
        setDisplayName(profileRes.data.displayName || '');
        setEmail(profileRes.data.email || '');
        setSkillsSummary(profileRes.data.skillsSummary || '');
        setLanguage(profileRes.data.language || 'tl');
        setAvailability(profileRes.data.availability || '');

        if (profileRes.data.barangayId) {
          const b = barangaysRes.data.find(
            (b: Barangay) => b.id === profileRes.data.barangayId
          );
          if (b) setSelectedBarangay(b);
        }
      }
      setBarangays(barangaysRes.data);
    } catch (err) {
      console.log('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredBarangays = barangays.filter(b =>
    b.displayName.toLowerCase().includes(barangaySearch.toLowerCase())
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        api.patch('/users/profile', {
          displayName: displayName.trim(),
          skillsSummary: skillsSummary.trim(),
          language,
          availability,
          email: email.trim(),
        }),
        selectedBarangay
          ? api.post('/users/barangay', { barangayId: selectedBarangay.id })
          : Promise.resolve(),
      ]);

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

      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>

        {/* Personal */}
        <Text style={styles.sectionLabel}>Personal</Text>

        <Input
          label="Buong Pangalan o Palayaw"
          placeholder="Halimbawa: Maria Santos, Ate Maria"
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

        <Text style={styles.fieldLabel}>Barangay</Text>
        <TouchableOpacity
          style={styles.barangaySelector}
          onPress={() => setShowBarangayPicker(true)}
        >
          <Ionicons name="location-outline" size={18} color={colors.gray400} />
          <Text style={[
            styles.barangaySelectorText,
            !selectedBarangay && { color: colors.gray400 }
          ]}>
            {selectedBarangay?.displayName || 'Pumili ng barangay...'}
          </Text>
          <Ionicons name="chevron-down" size={18} color={colors.gray400} />
        </TouchableOpacity>

        {/* Barangay Picker Modal */}
        {showBarangayPicker && (
          <View style={styles.barangayModal}>
            <View style={styles.barangayModalHeader}>
              <Text style={styles.barangayModalTitle}>Piliin ang Barangay</Text>
              <TouchableOpacity onPress={() => setShowBarangayPicker(false)}>
                <Ionicons name="close" size={24} color={colors.gray600} />
              </TouchableOpacity>
            </View>
            <Input
              placeholder="Maghanap..."
              value={barangaySearch}
              onChangeText={setBarangaySearch}
              containerStyle={{ marginBottom: spacing.sm }}
            />
            <ScrollView style={{ maxHeight: 200 }}>
              {filteredBarangays.map(b => (
                <TouchableOpacity
                  key={b.id}
                  style={[
                    styles.barangayItem,
                    selectedBarangay?.id === b.id && styles.barangayItemSelected
                  ]}
                  onPress={() => {
                    setSelectedBarangay(b);
                    setShowBarangayPicker(false);
                    setBarangaySearch('');
                  }}
                >
                  <Ionicons
                    name={selectedBarangay?.id === b.id ? 'radio-button-on' : 'radio-button-off'}
                    size={18}
                    color={selectedBarangay?.id === b.id ? colors.primary : colors.gray400}
                  />
                  <Text style={[
                    styles.barangayItemText,
                    selectedBarangay?.id === b.id && { color: colors.primary, fontWeight: typography.fontWeights.medium }
                  ]}>
                    {b.displayName}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

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

        {/* Save */}
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
  barangaySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 10,
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
    marginBottom: spacing.lg,
  },
  barangaySelectorText: {
    flex: 1,
    fontSize: typography.fontSizes.md,
    color: colors.gray900,
  },
  barangayModal: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 0.5,
    borderColor: colors.gray200,
  },
  barangayModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  barangayModalTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.gray900,
  },
  barangayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: 8,
  },
  barangayItemSelected: { backgroundColor: colors.primaryLight },
  barangayItemText: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray900,
  },
  availabilityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  availabilityBtn: {
    width: '47%',
    padding: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.gray200,
    backgroundColor: colors.white,
  },
  availabilityBtnActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  availabilityLabel: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.gray900,
    marginBottom: 2,
  },
  availabilitySub: {
    fontSize: typography.fontSizes.xs,
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