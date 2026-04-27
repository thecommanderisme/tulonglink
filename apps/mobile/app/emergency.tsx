import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Linking, ActivityIndicator
} from 'react-native';
import { router } from 'expo-router';
import { colors, typography, spacing } from '../theme';
import { useCachedFetch } from '../lib/useCachedFetch';

interface EmergencyContact {
  id: number;
  category: string;
  name: string;
  phone: string;
  barangay: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  Pulis: '👮',
  Sunog: '🚒',
  Medikal: '🏥',
  Sakuna: '⛑️',
  Barangay: '🏛️',
};

const CATEGORY_COLORS: Record<string, string> = {
  Pulis: '#1A56DB',
  Sunog: '#E24B4A',
  Medikal: '#1D9E75',
  Sakuna: '#BA7517',
  Barangay: '#6B46C1',
};

export default function EmergencyScreen() {
  const { data: contacts, loading } =
    useCachedFetch<EmergencyContact[]>('/emergency-contacts');

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  // Group contacts by category
  const grouped = contacts?.reduce((acc, contact) => {
    if (!acc[contact.category]) acc[contact.category] = [];
    acc[contact.category].push(contact);
    return acc;
  }, {} as Record<string, EmergencyContact[]>);

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Bumalik</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Emergency Hotlines</Text>
        <Text style={styles.subtitle}>
          I-tap ang numero para tumawag agad
        </Text>
      </View>

      {/* SOS Banner */}
      <TouchableOpacity
        style={styles.sosBanner}
        onPress={() => handleCall('911')}
      >
        <Text style={styles.sosIcon}>🆘</Text>
        <View style={styles.sosText}>
          <Text style={styles.sosTitle}>I-call ang 911</Text>
          <Text style={styles.sosSubtitle}>Para sa emergency na nangangailangan ng agarang tulong</Text>
        </View>
        <Text style={styles.sosArrow}>→</Text>
      </TouchableOpacity>

      {/* Contacts list */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.danger} size="large" />
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {grouped && Object.entries(grouped).map(([category, items]) => (
            <View key={category} style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryIcon}>
                  {CATEGORY_ICONS[category] || '📞'}
                </Text>
                <Text style={[
                  styles.categoryTitle,
                  { color: CATEGORY_COLORS[category] || colors.gray900 }
                ]}>
                  {category}
                </Text>
              </View>

              {items.map(contact => (
                <TouchableOpacity
                  key={contact.id}
                  style={styles.contactCard}
                  onPress={() => handleCall(contact.phone)}
                >
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    {contact.barangay && (
                      <Text style={styles.contactBarangay}>
                        📍 {contact.barangay}
                      </Text>
                    )}
                  </View>
                  <View style={[
                    styles.phoneBtn,
                    { backgroundColor: CATEGORY_COLORS[category] || colors.primary }
                  ]}>
                    <Text style={styles.phoneText}>📞 {contact.phone}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
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
    backgroundColor: colors.danger,
  },
  backBtn: { marginBottom: spacing.md },
  backText: {
    fontSize: typography.fontSizes.md,
    color: colors.dangerLight,
    fontWeight: typography.fontWeights.medium,
  },
  title: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.dangerLight,
  },
  sosBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.danger,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: 12,
    gap: spacing.md,
    borderWidth: 2,
    borderColor: colors.dangerLight,
  },
  sosIcon: { fontSize: 32 },
  sosText: { flex: 1 },
  sosTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
  },
  sosSubtitle: {
    fontSize: typography.fontSizes.xs,
    color: colors.dangerLight,
    marginTop: 2,
  },
  sosArrow: {
    color: colors.white,
    fontSize: typography.fontSizes.xl,
  },
  list: {
    flex: 1,
    padding: spacing.lg,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categorySection: {
    marginBottom: spacing.xl,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  categoryIcon: { fontSize: 20 },
  categoryTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 0.5,
    borderColor: colors.gray200,
  },
  contactInfo: { flex: 1, marginRight: spacing.md },
  contactName: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.gray900,
    marginBottom: spacing.xs,
  },
  contactBarangay: {
    fontSize: typography.fontSizes.xs,
    color: colors.gray400,
  },
  phoneBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    alignItems: 'center',
  },
  phoneText: {
    fontSize: typography.fontSizes.sm,
    color: colors.white,
    fontWeight: typography.fontWeights.bold,
  },
});