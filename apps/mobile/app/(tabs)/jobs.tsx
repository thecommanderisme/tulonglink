import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl, ActivityIndicator
} from 'react-native';
import { colors, typography, spacing } from '../../theme';
import { Card, Badge, Input } from '../../components';
import api from '../../lib/api';

interface Job {
  id: number;
  title: string;
  category: string;
  pay: string;
  location: string;
  status: string;
  createdAt: string;
  applicationCount: number;
}

const CATEGORIES = ['Lahat', 'Bahay', 'Pagkain', 'Konstruksiyon', 'Bantay', 'Iba pa'];

export default function JobsScreen() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Lahat');
  const [applying, setApplying] = useState<number | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<number[]>([]);

  useEffect(() => {
    fetchJobs();
  }, [selectedCategory]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedCategory !== 'Lahat') params.category = selectedCategory;
      if (search) params.search = search;
      const response = await api.get('/jobs', { params });
      setJobs(response.data);
    } catch (err) {
      console.log('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchJobs();
    setRefreshing(false);
  };

  const handleApply = async (jobId: number) => {
    try {
      setApplying(jobId);
      await api.post(`/jobs/${jobId}/apply`);
      setAppliedJobs(prev => [...prev, jobId]);
    } catch (err: any) {
      console.log('Apply error:', err.response?.data?.message);
    } finally {
      setApplying(null);
    }
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mga Trabaho</Text>
        <Text style={styles.subtitle}>Mag-apply nang walang resume</Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Input
          placeholder="Maghanap ng trabaho..."
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={fetchJobs}
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
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Jobs list */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : jobs.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Walang trabaho ngayon</Text>
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
          {jobs.map(job => (
            <Card key={job.id}>
              <View style={styles.jobHeader}>
                <Text style={styles.jobTitle}>{job.title}</Text>
                <Badge
                  label={job.status === 'OPEN' ? 'Bukas' : 'Sarado'}
                  variant={job.status === 'OPEN' ? 'success' : 'neutral'}
                />
              </View>

              <View style={styles.jobMeta}>
                {job.pay && (
                  <Text style={styles.metaText}>💰 {job.pay}</Text>
                )}
                {job.location && (
                  <Text style={styles.metaText}>📍 {job.location}</Text>
                )}
                {job.category && (
                  <Text style={styles.metaText}>🏷 {job.category}</Text>
                )}
              </View>

              <View style={styles.jobFooter}>
                <Text style={styles.appCount}>
                  {job.applicationCount} nag-apply
                </Text>
                <TouchableOpacity
                  onPress={() => handleApply(job.id)}
                  disabled={applying === job.id || appliedJobs.includes(job.id)}
                  style={[
                    styles.applyBtn,
                    appliedJobs.includes(job.id) && styles.applyBtnDone
                  ]}
                >
                  {applying === job.id ? (
                    <ActivityIndicator color={colors.white} size="small" />
                  ) : (
                    <Text style={styles.applyText}>
                      {appliedJobs.includes(job.id) ? 'Nag-apply na ✓' : 'Mag-apply'}
                    </Text>
                  )}
                </TouchableOpacity>
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
  searchWrap: {
    padding: spacing.lg,
    paddingBottom: 0,
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
  categoryTextActive: {
    color: colors.white,
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
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  jobTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.gray900,
    flex: 1,
    marginRight: spacing.sm,
  },
  jobMeta: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  metaText: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray600,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: colors.gray200,
    paddingTop: spacing.sm,
  },
  appCount: {
    fontSize: typography.fontSizes.xs,
    color: colors.gray400,
  },
  applyBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    minWidth: 100,
    alignItems: 'center',
  },
  applyBtnDone: {
    backgroundColor: colors.success,
  },
  applyText: {
    fontSize: typography.fontSizes.sm,
    color: colors.white,
    fontWeight: typography.fontWeights.medium,
  },
});