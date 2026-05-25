import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme';
import { Input, Button } from '../components';
import api from '../lib/api';

const CATEGORIES = ['Bahay', 'Pagkain', 'Konstruksiyon', 'Bantay', 'Kalusugan', 'Iba pa'];

export default function PostJobScreen() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [pay, setPay] = useState('');
  const [location, setLocation] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [selectedBarangay, setSelectedBarangay] = useState<any>(null);
  const [barangays, setBarangays] = useState<any[]>([]);
  const [showBarangayPicker, setShowBarangayPicker] = useState(false);
  const [barangaySearch, setBarangaySearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchBarangays();
  }, []);

  const fetchBarangays = async () => {
    try {
      const response = await api.get('/barangays');
      setBarangays(response.data);
    } catch (err) {
      console.log('Barangay fetch error:', err);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Ilagay ang titulo ng trabaho';
    if (!category) newErrors.category = 'Pumili ng kategorya';
    if (!pay.trim()) newErrors.pay = 'Ilagay ang bayad';
    if (!location.trim()) newErrors.location = 'Ilagay ang lokasyon';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await api.post('/jobs', {
        title: title.trim(),
        category,
        pay: pay.trim(),
        location: location.trim(),
        dateNeeded: expiresAt ? `${expiresAt}T23:59:59` : null,
        barangayId: selectedBarangay?.id || null,
      });
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

  const filteredBarangays = barangays.filter(b =>
    b.displayName.toLowerCase().includes(barangaySearch.toLowerCase())
  );

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

        {/* Title */}
        <Input
          label="Titulo ng Trabaho *"
          placeholder="Halimbawa: Labandera, Tagaluto, Bantay Bahay"
          value={title}
          onChangeText={setTitle}
          error={errors.title}
        />

        {/* Category */}
        <Text style={styles.fieldLabel}>Kategorya *</Text>
        {errors.category && (
          <Text style={styles.errorText}>{errors.category}</Text>
        )}
        <View style={styles.categories}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategory(cat)}
              style={[
                styles.categoryBtn,
                category === cat && styles.categoryBtnActive
              ]}
            >
              <Text style={[
                styles.categoryText,
                category === cat && styles.categoryTextActive
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Pay */}
        <Input
          label="Bayad *"
          placeholder="Halimbawa: ₱300/araw, ₱500/buwanin"
          value={pay}
          onChangeText={setPay}
          error={errors.pay}
        />

        {/* Location */}
        <Input
          label="Lokasyon *"
          placeholder="Halimbawa: Barangay 123, Maynila"
          value={location}
          onChangeText={setLocation}
          error={errors.location}
        />

        {/* Barangay */}
        <Text style={styles.fieldLabel}>Barangay (Optional)</Text>
        <TouchableOpacity
          style={styles.barangaySelector}
          onPress={() => setShowBarangayPicker(!showBarangayPicker)}
        >
          <Ionicons name="location-outline" size={18} color={colors.gray400} />
          <Text style={[
            styles.barangaySelectorText,
            !selectedBarangay && { color: colors.gray400 }
          ]}>
            {selectedBarangay?.displayName || 'Pumili ng barangay...'}
          </Text>
          <Ionicons
            name={showBarangayPicker ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={colors.gray400}
          />
        </TouchableOpacity>

        {/* Barangay Picker */}
        {showBarangayPicker && (
          <View style={styles.barangayModal}>
            <View style={styles.barangayModalHeader}>
              <Text style={styles.barangayModalTitle}>Piliin ang Barangay</Text>
              <TouchableOpacity onPress={() => {
                setShowBarangayPicker(false);
                setBarangaySearch('');
              }}>
                <Ionicons name="close" size={24} color={colors.gray600} />
              </TouchableOpacity>
            </View>
            <Input
              placeholder="Maghanap..."
              value={barangaySearch}
              onChangeText={setBarangaySearch}
              containerStyle={{ marginBottom: spacing.sm }}
            />
            <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
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
                    name={selectedBarangay?.id === b.id
                      ? 'radio-button-on'
                      : 'radio-button-off'}
                    size={18}
                    color={selectedBarangay?.id === b.id
                      ? colors.primary
                      : colors.gray400}
                  />
                  <Text style={[
                    styles.barangayItemText,
                    selectedBarangay?.id === b.id && {
                      color: colors.primary,
                      fontWeight: typography.fontWeights.medium
                    }
                  ]}>
                    {b.displayName}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Expiry date */}
        <Input
          label="Hanggang kailan kailangan? (Optional)"
          placeholder="Halimbawa: 2026-06-30"
          value={expiresAt}
          onChangeText={setExpiresAt}
        />

        {/* Submit */}
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
  form: {
    flex: 1,
    padding: spacing.lg,
  },
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
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  categoryBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.gray200,
    backgroundColor: colors.white,
  },
  categoryBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray600,
    fontWeight: typography.fontWeights.medium,
  },
  categoryTextActive: { color: colors.white },
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
    marginBottom: spacing.sm,
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
  submitBtn: { marginTop: spacing.md },
});