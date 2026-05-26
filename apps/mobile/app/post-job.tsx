import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, typography, spacing } from '../theme';
import { Input, Button, LocationPicker } from '../components';
import type { LocationValue } from '../components/LocationPicker';
import api from '../lib/api';

const CATEGORIES = ['Bahay', 'Pagkain', 'Konstruksiyon', 'Bantay', 'Kalusugan', 'Iba pa'];
const WORK_TYPES = ['Isang beses', 'Part-time', 'Full-time', 'Regular'];
const CONTACT_PREFS = ['Text lang', 'Tawag lang', 'Text o Tawag', 'Personal na pumunta'];

export default function PostJobScreen() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [pay, setPay] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [workSchedule, setWorkSchedule] = useState('');
  const [workType, setWorkType] = useState('');
  const [contactPref, setContactPref] = useState('');
  const [location, setLocation] = useState<LocationValue | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    autoFillLocation();
  }, []);

  const autoFillLocation = async () => {
    try {
      const response = await api.get('/users/profile');
      if (response.data?.barangayName) {
        // We have the user's barangay name but not the PSGC codes
        // Just show a hint — user still needs to select via picker
        console.log('User barangay:', response.data.barangayName);
      }
    } catch (err) {
      console.log('Could not auto-fill location:', err);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Ilagay ang titulo ng trabaho';
    if (!category) newErrors.category = 'Pumili ng kategorya';
    if (!pay.trim()) newErrors.pay = 'Ilagay ang bayad';
    if (!location) newErrors.location = 'Pumili ng lokasyon';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        category,
        pay: pay.trim(),
        location: location?.displayName || '',
        dateNeeded: expiresAt
          ? `${expiresAt.toISOString().split('T')[0]}T23:59:59`
          : null,
        barangayId: null,
        description: description.trim() || null,
        requirements: requirements.trim() || null,
        workSchedule: workSchedule.trim() || null,
        workType: workType || null,
        contactPref: contactPref || null,
      };

      console.log('Posting job:', JSON.stringify(payload));
      await api.post('/jobs', payload);

      Alert.alert(
        'Na-post na! ✅',
        'Ang iyong job post ay nai-publish na.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (err: any) {
      Alert.alert(
        'Error',
        err.response?.data?.message || 'Hindi ma-post. Subukan ulit.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mag-post ng Trabaho</Text>
      </View>

      <ScrollView
        style={styles.form}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets={true}
      >
        {/* Anti-scam reminder */}
        <View style={styles.reminderBox}>
          <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
          <Text style={styles.reminderText}>
            Huwag humingi ng bayad sa mga aplikante. Libreng mag-apply sa TulongLink.
          </Text>
        </View>

        {/* Section: Basic Info */}
        <Text style={styles.sectionLabel}>Basic Info</Text>

        <Input
          label="Titulo ng Trabaho *"
          placeholder="Halimbawa: Labandera, Tagaluto, Bantay Bahay"
          value={title}
          onChangeText={setTitle}
          error={errors.title}
        />

        <Text style={styles.fieldLabel}>Kategorya *</Text>
        {errors.category && (
          <Text style={styles.errorText}>{errors.category}</Text>
        )}
        <View style={styles.chipGrid}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategory(cat)}
              style={[styles.chip, category === cat && styles.chipActive]}
            >
              <Text style={[
                styles.chipText,
                category === cat && styles.chipTextActive
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input
          label="Bayad *"
          placeholder="Halimbawa: ₱300/araw, ₱500/linggo"
          value={pay}
          onChangeText={setPay}
          error={errors.pay}
        />

        {/* Section: Location */}
        <Text style={styles.sectionLabel}>Lokasyon</Text>

        <LocationPicker
          label="Probinsya, Lungsod at Barangay *"
          value={location}
          onChange={setLocation}
          error={errors.location}
        />

        {/* Section: Job Details */}
        <Text style={styles.sectionLabel}>Detalye ng Trabaho</Text>

        <Input
          label="Paglalarawan (Optional)"
          placeholder="Halimbawa: Kailangan ng labandera 3x sa isang linggo..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />

        <Input
          label="Mga Kinakailangan (Optional)"
          placeholder="Halimbawa: May sariling plantsa, 18+ taong gulang..."
          value={requirements}
          onChangeText={setRequirements}
          multiline
          numberOfLines={3}
        />

        <Input
          label="Oras ng Trabaho (Optional)"
          placeholder="Halimbawa: Lunes-Miyerkules, 7am-12pm"
          value={workSchedule}
          onChangeText={setWorkSchedule}
        />

        <Text style={styles.fieldLabel}>Uri ng Trabaho (Optional)</Text>
        <View style={styles.chipGrid}>
          {WORK_TYPES.map(type => (
            <TouchableOpacity
              key={type}
              onPress={() => setWorkType(workType === type ? '' : type)}
              style={[styles.chip, workType === type && styles.chipActive]}
            >
              <Text style={[
                styles.chipText,
                workType === type && styles.chipTextActive
              ]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.fieldLabel}>Paraan ng Contact (Optional)</Text>
        <View style={styles.chipGrid}>
          {CONTACT_PREFS.map(pref => (
            <TouchableOpacity
              key={pref}
              onPress={() => setContactPref(contactPref === pref ? '' : pref)}
              style={[styles.chip, contactPref === pref && styles.chipActive]}
            >
              <Text style={[
                styles.chipText,
                contactPref === pref && styles.chipTextActive
              ]}>
                {pref}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Section: Other */}
        <Text style={styles.sectionLabel}>Iba Pa</Text>

        <Text style={styles.fieldLabel}>Hanggang kailan kailangan? (Optional)</Text>
        <TouchableOpacity
          style={styles.dateSelector}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar-outline" size={18} color={colors.gray400} />
          <Text style={[
            styles.dateSelectorText,
            !expiresAt && { color: colors.gray400 }
          ]}>
            {expiresAt
              ? expiresAt.toLocaleDateString('fil-PH', {
                  month: 'long', day: 'numeric', year: 'numeric'
                })
              : 'Pumili ng petsa...'}
          </Text>
          {expiresAt && (
            <TouchableOpacity onPress={() => setExpiresAt(null)}>
              <Ionicons name="close-circle" size={18} color={colors.gray400} />
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={expiresAt || new Date(new Date().setDate(new Date().getDate() + 1))}
            mode="date"
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (event.type === 'set' && date) {
                setExpiresAt(date);
              }
            }}
          />
        )}

        <Button
          label={submitting ? 'Nagpo-post...' : 'I-post ang Trabaho'}
          onPress={handleSubmit}
          loading={submitting}
          disabled={submitting}
          style={styles.submitBtn}
        />

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
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
  reminderBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  reminderText: {
    flex: 1,
    fontSize: typography.fontSizes.sm,
    color: colors.primaryDark,
    lineHeight: 20,
  },
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
  errorText: {
    fontSize: typography.fontSizes.xs,
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.gray200,
    backgroundColor: colors.white,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray600,
    fontWeight: typography.fontWeights.medium,
  },
  chipTextActive: { color: colors.white },
  dateSelector: {
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
  dateSelectorText: {
    flex: 1,
    fontSize: typography.fontSizes.md,
    color: colors.gray900,
  },
  submitBtn: { marginTop: spacing.md },
});