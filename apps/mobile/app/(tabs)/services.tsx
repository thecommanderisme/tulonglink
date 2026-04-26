import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl, ActivityIndicator,
  Linking
} from 'react-native';
import { colors, typography, spacing } from '../../theme';
import { Card, Badge } from '../../components';
import api from '../../lib/api';

interface ServiceCenter {
  id: number;
  category: string;
  address: string;
  contactInfo: string;
  hours: string;
  eligibilityNotes: string;
  barangay: string;
  organization: string;
}

const CATEGORIES = ['Lahat', 'Ospital', 'DSWD', 'Botika', 'Eskwelahan', 'Iba pa'];

const CATEGORY_ICONS: Record<string, string> = {
  Ospital: '🏥',
  DSWD: '🤝',
  Botika: '💊',
  Eskwelahan: '🏫',
  'Iba pa': '🏢',
};

export default function ServicesScreen() {
  const [services, setServices] = useState<ServiceCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Lahat');

  useEffect(() => {
    fetchServices();
  }, [selectedCategory]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedCategory !== 'Lahat') params.category = selectedCategory;
      const response = await api.get('/services', { params });
      setServices(response.data);
    } catch (err) {
      console.log('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchServices();
    setRefreshing(false);
  };

  const handleCall = (contactInfo: string) => {
    if (!contactInfo) return;
    const phone = contactInfo.replace(/[^0-9+]/g, '');
    Linking.openURL(`tel:${phone}`);
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mga Serbisyo</Text>
        <Text style={styles.subtitle}>Ospital, tulong, at iba pa</Text>
      </View>

      {/* Category filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categories}
        contentContainerStyle={styles.categoriesContent}
      >
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            onPress={() => setSelectedCategory(cat)}
            style={[
              styles.categoryBtn,
              selectedCategory === cat && styles.categoryBtnActive
            ]}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === cat && styles.categoryTextActive
            ]}>
              {CATEGORY_ICONS[cat] || '📋'} {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Services list */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : services.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Walang serbisyo ngayon</Text>
          <Text style={styles.emptySubtext}>Subukan ulit mamaya</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {services.map(s => (
            <Card key={s.id}>

              {/* Top row */}
              <View style={styles.topRow}>
                <Text style={styles.icon}>
                  {CATEGORY_ICONS[s.category] || '🏢'}
                </Text>
                <View style={styles.topInfo}>
                  <Badge label={s.category} variant="primary" />
                  {s.hours && (
                    <Text style={styles.hours}>🕐 {s.hours}</Text>
                  )}
                </View>
              </View>

              {/* Address */}
              {s.address && (
                <Text style={styles.address}>📍 {s.address}</Text>
              )}

              {/* Eligibility */}
              {s.eligibilityNotes && (
                <View style={styles.eligibility}>
                  <Text style={styles.eligibilityText}>
                    ✅ {s.eligibilityNotes}
                  </Text>
                </View>
              )}

              {/* Footer */}
              {s.contactInfo && (
                <TouchableOpacity
                  style={styles.callBtn}
                  onPress={() => handleCall(s.contactInfo)}
                >
                  <Text style={styles.callText}>📞 Tumawag — {s.contactInfo}</Text>
                </TouchableOpacity>
              )}

            </Card>
          ))}
          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  header: {
    padding: spacing.xl,
    paddingTop: 60,
    backgroundColor: colors.primary,
  },
  title: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.primaryLight,
  },
  categories: {
    backgroundColor: colors.white,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.gray200,
    maxHeight: 56,
  },
  categoriesContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  categoryBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.gray200,
    backgroundColor: colors.white,
    height: 36,
    justifyContent: 'center',
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
  list: { flex: 1, padding: spacing.lg },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.medium,
    color: colors.gray600,
  },
  emptySubtext: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray400,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  icon: { fontSize: 32 },
  topInfo: { gap: spacing.xs, flex: 1 },
  hours: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray600,
  },
  address: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray600,
    marginBottom: spacing.sm,
  },
  eligibility: {
    backgroundColor: colors.successLight,
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  eligibilityText: {
    fontSize: typography.fontSizes.sm,
    color: colors.success,
  },
  callBtn: {
    backgroundColor: colors.secondaryLight,
    borderRadius: 8,
    padding: spacing.md,
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: colors.gray200,
    marginTop: spacing.xs,
  },
  callText: {
    fontSize: typography.fontSizes.sm,
    color: colors.secondary,
    fontWeight: typography.fontWeights.medium,
  },
});