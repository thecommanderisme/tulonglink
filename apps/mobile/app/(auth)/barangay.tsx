import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../theme';
import { Input, Button } from '../../components';
import api from '../../lib/api';

interface Barangay {
  id: number;
  name: string;
  city: string;
  province: string;
  displayName: string;
}

export default function BarangayScreen() {
  const { isOnboarding } = useLocalSearchParams<{ isOnboarding: string }>();
  const [barangays, setBarangays] = useState<Barangay[]>([]);
  const [filtered, setFiltered] = useState<Barangay[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Barangay | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBarangays();
  }, []);

  useEffect(() => {
    if (search.trim() === '') {
      setFiltered(barangays);
    } else {
      setFiltered(
        barangays.filter(b =>
          b.displayName.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, barangays]);

  const fetchBarangays = async () => {
    try {
      const response = await api.get('/barangays');
      setBarangays(response.data);
      setFiltered(response.data);
    } catch (err) {
      console.log('Barangay fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await api.post('/users/barangay', { barangayId: selected.id });
    } catch (err) {
      console.log('Barangay save error:', err);
    } finally {
      setSaving(false);
      router.replace('/(tabs)');
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Saan ka nakatira?</Text>
        <Text style={styles.subtitle}>
          Para makita mo ang mga trabaho at balita malapit sa iyo
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Input
          placeholder="Hanapin ang iyong barangay..."
          value={search}
          onChangeText={setSearch}
          containerStyle={{ marginBottom: 0 }}
        />
      </View>

      {/* Selected */}
      {selected && (
        <View style={styles.selectedBanner}>
          <Ionicons name="location" size={16} color={colors.primary} />
          <Text style={styles.selectedText}>{selected.displayName}</Text>
          <TouchableOpacity onPress={() => setSelected(null)}>
            <Ionicons name="close-circle" size={18} color={colors.gray400} />
          </TouchableOpacity>
        </View>
      )}

      {/* List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id.toString()}
          style={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.item,
                selected?.id === item.id && styles.itemSelected
              ]}
              onPress={() => setSelected(item)}
            >
              <Ionicons
                name={selected?.id === item.id ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={selected?.id === item.id ? colors.primary : colors.gray400}
              />
              <View style={styles.itemText}>
                <Text style={[
                  styles.itemName,
                  selected?.id === item.id && styles.itemNameSelected
                ]}>
                  {item.name}
                </Text>
                <Text style={styles.itemCity}>{item.city}</Text>
              </View>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      {/* Bottom actions */}
      <View style={styles.bottom}>
        <Button
          label={saving ? 'Sine-save...' : 'Kumpirmahin'}
          onPress={handleConfirm}
          disabled={!selected || saving}
          loading={saving}
        />
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipText}>Laktawan — itakda mamaya</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    padding: spacing.xl,
    paddingTop: 60,
    backgroundColor: colors.primary,
  },
  title: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.primaryLight,
    lineHeight: 20,
  },
  searchWrap: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.gray200,
  },
  selectedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primaryLight,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.primary,
  },
  selectedText: {
    flex: 1,
    fontSize: typography.fontSizes.sm,
    color: colors.primaryDark,
    fontWeight: typography.fontWeights.medium,
  },
  list: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  itemSelected: {
    backgroundColor: colors.primaryLight,
  },
  itemText: { flex: 1 },
  itemName: {
    fontSize: typography.fontSizes.md,
    color: colors.gray900,
  },
  itemNameSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },
  itemCity: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray400,
    marginTop: 2,
  },
  separator: {
    height: 0.5,
    backgroundColor: colors.gray200,
    marginLeft: spacing.xl + 20,
  },
  bottom: {
    padding: spacing.lg,
    borderTopWidth: 0.5,
    borderTopColor: colors.gray200,
    gap: spacing.sm,
  },
  skipBtn: {
    alignItems: 'center',
    padding: spacing.sm,
  },
  skipText: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray400,
  },
});