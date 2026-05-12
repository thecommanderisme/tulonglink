import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert
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
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      });
      Alert.alert(
        'Na-post na! ✅',
        'Ang iyong job post ay nai-publish na.',
        [{
          text: 'OK',
          onPress: () => router.back()
        }]
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
  submitBtn: {
    marginTop: spacing.md,
  },
});