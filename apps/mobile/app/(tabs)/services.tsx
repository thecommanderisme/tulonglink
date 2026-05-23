import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl, ActivityIndicator,
  Linking
} from 'react-native';
import { colors, typography, spacing } from '../../theme';
import { Card, Badge, Input } from '../../components';
import { useCachedFetch } from '../../lib/useCachedFetch';

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

// Check if service is currently open based on hours string
const isOpenNow = (hours: string): boolean | null => {
  if (!hours) return null;
  if (hours.toLowerCase().includes('24/7')) return true;

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinute;

  // Parse "8am-5pm" or "8:00am-5:00pm" format
  const match = hours.match(/(\d+)(?::(\d+))?(am|pm)[-–](\d+)(?::(\d+))?(am|pm)/i);
  if (!match) return null;

  let openHour = parseInt(match[1]);
  const openMin = parseInt(match[2] || '0');
  const openPeriod = match[3].toLowerCase();
  let closeHour = parseInt(match[4]);
  const closeMin = parseInt(match[5] || '0');
  const closePeriod = match[6].toLowerCase();

  if (openPeriod === 'pm' && openHour !== 12) openHour += 12;
  if (openPeriod === 'am' && openHour === 12) openHour = 0;
  if (closePeriod === 'pm' && closeHour !== 12) closeHour += 12;
  if (closePeriod === 'am' && closeHour === 12) closeHour = 0;

  const openTime = openHour * 60 + openMin;
  const closeTime = closeHour * 60 + closeMin;

  return currentTime >= openTime && currentTime < closeTime;
};

export default function ServicesScreen() {
  const [selectedCategory, setSelectedCategory] = useState('Lahat');
  const [search, setSearch] = useState('');

  const { data: allServices, loading, refresh, isFromCache } =
    useCachedFetch<ServiceCenter[]>('/services');

  // Filter locally for instant search
  const services = allServices?.filter(s => {
    const matchesCategory = selectedCategory === 'Lahat' || s.category === selectedCategory;
    const matchesSearch = !search ||
      s.category?.toLowerCase().includes(search.toLowerCase()) ||
      s.address?.toLowerCase().includes(search.toLowerCase()) ||
      s.eligibilityNotes?.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCall = (contactInfo: string) => {
    if (!contactInfo) return;
    const phone = contactInfo.replace(/[^0-9+]/g, '');
    Linking.openURL(`tel:${phone}`);
  };

  const handleDirections = (address: string) => {
    if (!address) return;
    const encoded = encodeURIComponent(address);
    Linking.openURL(`https://maps.google.com/?q=${encoded}`);
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mga Serbisyo</Text>
        <Text style={styles.subtitle}>Ospital, tulong, at iba pa</Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Input
          placeholder="Maghanap ng serbisyo..."
          value={search}
          onChangeText={setSearch}
          containerStyle={{ marginBottom: 0 }}
        />
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

      {/* Offline indicator */}
      {isFromCache && (
        <View style={styles.cacheBar}>
          <Text style={styles.cacheText}>
            📶 Offline mode — showing cached data
          </Text>
        </View>
      )}

      {/* Services list */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : !services || services.length === 0 ? (
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
              refreshing={false}
              onRefresh={refresh}
              tintColor={colors.primary}
            />
          }
        >
          {services.map(s => {
            const openStatus = isOpenNow(s.hours);
            return (
              <Card key={s.id}>
                {/* Top row */}
                <View style={styles.topRow}>
                  <Text style={styles.icon}>
                    {CATEGORY_ICONS[s.category] || '🏢'}
                  </Text>
                  <View style={styles.topInfo}>
                    <Badge label={s.category} variant="primary" />
                    {s.hours && (
                      <View style={styles.hoursRow}>
                        <Text style={styles.hours}>🕐 {s.hours}</Text>
                        {openStatus !== null && (
                          <View style={[
                            styles.openBadge,
                            { backgroundColor: openStatus ? colors.successLight : colors.dangerLight }
                          ]}>
                            <Text style={[
                              styles.openText,
                              { color: openStatus ? colors.success : colors.danger }
                            ]}>
                              {openStatus ? '● Bukas ngayon' : '● Sarado ngayon'}
                            </Text>
                          </View>
                        )}
                      </View>
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

                {/* Action buttons */}
                <View style={styles.actions}>
                  {s.contactInfo && (
                    <TouchableOpacity
                      style={styles.callBtn}
                      onPress={() => handleCall(s.contactInfo)}
                    >
                      <Text style={styles.callText}>📞 Tumawag</Text>
                    </TouchableOpacity>
                  )}
                  {s.address && (
                    <TouchableOpacity
                      style={styles.directionsBtn}
                      onPress={() => handleDirections(s.address)}
                    >
                      <Text style={styles.directionsText}>🗺 Direksyon</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </Card>
            );
          })}
          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  header: {
    padding: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.md,
    backgroundColor: colors.primary,
  },
  title: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
  },
  subtitle: {
    fontSize: typography.fontSizes.xs,
    color: colors.primaryLight,
    marginTop: 2,
  },
  searchWrap: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
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
  cacheBar: {
    backgroundColor: colors.warningLight,
    padding: spacing.sm,
    alignItems: 'center',
  },
  cacheText: {
    fontSize: typography.fontSizes.xs,
    color: colors.warning,
    fontWeight: typography.fontWeights.medium,
  },
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
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  hours: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray600,
  },
  openBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 999,
  },
  openText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
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
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    borderTopWidth: 0.5,
    borderTopColor: colors.gray200,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  callBtn: {
    flex: 1,
    backgroundColor: colors.secondaryLight,
    borderRadius: 8,
    padding: spacing.sm,
    alignItems: 'center',
  },
  callText: {
    fontSize: typography.fontSizes.sm,
    color: colors.secondary,
    fontWeight: typography.fontWeights.medium,
  },
  directionsBtn: {
    flex: 1,
    backgroundColor: colors.successLight,
    borderRadius: 8,
    padding: spacing.sm,
    alignItems: 'center',
  },
  directionsText: {
    fontSize: typography.fontSizes.sm,
    color: colors.success,
    fontWeight: typography.fontWeights.medium,
  },
});