import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme';
import { Input, Button } from '../components';
import api from '../lib/api';

const CATEGORIES = ['Bahay', 'Pagkain', 'Konstruksiyon', 'Bantay', 'Kalusugan', 'Iba pa'];

export default function EditJobScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [pay, setPay] = useState('');
  const [location, setLocation] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchJob();
  }, []);

  const fetchJob = async () => {
    try {
      const response = await api.get(`/jobs/${jobId}`);
      const job = response.data;
      setTitle(job.title || '');
      setCategory(job.category || '');
      setPay(job.pay || '');
      setLocation(job.location || '');
    } catch (err) {
      console.log('Job fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !category || !pay.trim() || !location.trim()) {
      Alert.alert('Error', 'Punan ang lahat ng required fields.');
      return;
    }
    setSubmitting(true);
    try {
      await api.patch(`/jobs/${jobId}`, {
        title: title.trim(),
        category,
        pay: pay.trim(),
        location: location.trim(),
        dateNeeded: expiresAt ? `${expiresAt}T23:59:59` : null,
      });
      Alert.alert(
        'Na-update! ✅',
        'Na-update na ang iyong job post.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Hindi ma-update. Subukan ulit.');
    } finally {
      setSubmitting(false);
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
        <Text style={styles.headerTitle}>I-edit ang Job Post</Text>
      </View>

      <ScrollView
        style={styles.form}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets={true}
      >
        <Input
          label="Titulo ng Trabaho *"
          placeholder="Halimbawa: Labandera, Tagaluto"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.fieldLabel}>Kategorya *</Text>
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

        <Input
          label="Bayad *"
          placeholder="Halimbawa: ₱300/araw"
          value={pay}
          onChangeText={setPay}
        />

        <Input
          label="Lokasyon *"
          placeholder="Halimbawa: Barangay 123, Maynila"
          value={location}
          onChangeText={setLocation}
        />

        <Input
          label="Hanggang kailan kailangan? (Optional)"
          placeholder="Halimbawa: 2026-06-30"
          value={expiresAt}
          onChangeText={setExpiresAt}
        />

        <Button
          label={submitting ? 'Sine-save...' : 'I-save ang Pagbabago'}
          onPress={handleSave}
          loading={submitting}
          disabled={submitting}
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
  fieldLabel: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.gray600,
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
  saveBtn: { marginTop: spacing.md },
});