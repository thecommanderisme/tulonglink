import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl, ActivityIndicator
} from 'react-native';
import { colors, typography, spacing } from '../../theme';
import { Card, Badge } from '../../components';
import { useCachedFetch } from '../../lib/useCachedFetch';

interface Announcement {
  id: number;
  title: string;
  body: string;
  category: string;
  verificationStatus: string;
  barangay: string;
  organization: string;
  expiresAt: string;
  createdAt: string;
}

const CATEGORIES = ['Lahat', 'Kalusugan', 'Tulong', 'Edukasyon', 'Trabaho', 'Iba pa'];

const CATEGORY_COLORS: Record<string, any> = {
  Kalusugan: 'danger',
  Tulong: 'primary',
  Edukasyon: 'secondary',
  Trabaho: 'success',
  'Iba pa': 'neutral',
};

export default function FeedScreen() {
  const [selectedCategory, setSelectedCategory] = useState('Lahat');

  const { data: announcements, loading, refresh, isFromCache } =
    useCachedFetch<Announcement[]>(
      '/announcements',
      selectedCategory !== 'Lahat' ? { category: selectedCategory } : {}
    );

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fil-PH', { month: 'short', day: 'numeric' });
  };

  const isExpiringSoon = (expiresAt: string) => {
    if (!expiresAt) return false;
    const diff = new Date(expiresAt).getTime() - Date.now();
    return diff < 3 * 24 * 60 * 60 * 1000;
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Balita ng Barangay</Text>
        <Text style={styles.subtitle}>Mga anunsyo at abiso</Text>
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
              {cat}
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

      {/* Announcements list */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : !announcements || announcements.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Walang balita ngayon</Text>
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
          {announcements.map(a => (
            <Card key={a.id}>
              <View style={styles.topRow}>
                <Badge
                  label={a.category || 'Balita'}
                  variant={CATEGORY_COLORS[a.category] || 'neutral'}
                />
                <Text style={styles.date}>{formatDate(a.createdAt)}</Text>
              </View>
              <Text style={styles.announcementTitle}>{a.title}</Text>
              {a.body && (
                <Text style={styles.body} numberOfLines={3}>{a.body}</Text>
              )}
              <View style={styles.footer}>
                {a.organization && <Text style={styles.org}>🏢 {a.organization}</Text>}
                {a.barangay && <Text style={styles.org}>📍 {a.barangay}</Text>}
                {isExpiringSoon(a.expiresAt) && (
                  <Badge label="Malapit matapos" variant="warning" />
                )}
              </View>
            </Card>
          ))}
          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  date: { fontSize: typography.fontSizes.xs, color: colors.gray400 },
  announcementTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.gray900,
    marginBottom: spacing.sm,
  },
  body: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray600,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    borderTopWidth: 0.5,
    borderTopColor: colors.gray200,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  org: { fontSize: typography.fontSizes.xs, color: colors.gray400 },
});