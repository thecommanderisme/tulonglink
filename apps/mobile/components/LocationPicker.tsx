import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme';
import { Input } from './Input';

const PSGC_BASE = 'https://psgc.gitlab.io/api';

interface Province { code: string; name: string; isDistrict?: boolean; }
interface City { code: string; name: string; }
interface Barangay { code: string; name: string; }

export interface LocationValue {
  provinceCode: string;
  provinceName: string;
  cityCode: string;
  cityName: string;
  barangayCode: string;
  barangayName: string;
  displayName: string;
}

interface LocationPickerProps {
  value: LocationValue | null;
  onChange: (value: LocationValue | null) => void;
  error?: string;
  label?: string;
}

export const LocationPicker = ({ value, onChange, error, label }: LocationPickerProps) => {
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<'province' | 'city' | 'barangay'>('province');
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [barangays, setBarangays] = useState<Barangay[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showModal && provinces.length === 0) {
      fetchProvinces();
    }
  }, [showModal]);

  const fetchProvinces = async () => {
    setLoading(true);
    try {
      const [provincesRes, districtsRes] = await Promise.all([
        fetch(`${PSGC_BASE}/provinces/`),
        fetch(`${PSGC_BASE}/districts/`),
      ]);

      const provincesData = await provincesRes.json();
      const districtsData = await districtsRes.json();

      const ncrDistricts = Array.isArray(districtsData)
        ? districtsData.map((d: any) => ({
            code: d.code,
            name: `NCR - ${d.name}`,
            isDistrict: true,
          }))
        : [];

      const allProvinces = Array.isArray(provincesData)
        ? provincesData.map((p: any) => ({
            code: p.code,
            name: p.name,
            isDistrict: false,
          }))
        : [];

      const all = [...ncrDistricts, ...allProvinces]
        .sort((a, b) => a.name.localeCompare(b.name));

      setProvinces(all);
    } catch (err) {
      console.log('Provinces fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async (provinceCode: string, isDistrict: boolean) => {
    setLoading(true);
    try {
      const url = isDistrict
        ? `${PSGC_BASE}/districts/${provinceCode}/cities-municipalities/`
        : `${PSGC_BASE}/provinces/${provinceCode}/cities-municipalities/`;
      const response = await fetch(url);
      const data = await response.json();
      setCities(
        Array.isArray(data)
          ? data.map((c: any) => ({ code: c.code, name: c.name }))
              .sort((a: City, b: City) => a.name.localeCompare(b.name))
          : []
      );
    } catch (err) {
      console.log('Cities fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBarangays = async (cityCode: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${PSGC_BASE}/cities-municipalities/${cityCode}/barangays/`
      );
      const data = await response.json();
      setBarangays(
        Array.isArray(data)
          ? data.map((b: any) => ({ code: b.code, name: b.name }))
              .sort((a: Barangay, b: Barangay) => a.name.localeCompare(b.name))
          : []
      );
    } catch (err) {
      console.log('Barangays fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProvinceSelect = (province: Province) => {
    setSelectedProvince(province);
    setSearch('');
    setStep('city');
    fetchCities(province.code, province.isDistrict || false);
  };

  const handleCitySelect = (city: City) => {
    setSelectedCity(city);
    setSearch('');
    setStep('barangay');
    fetchBarangays(city.code);
  };

  const handleBarangaySelect = (barangay: Barangay) => {
    if (!selectedProvince || !selectedCity) return;
    onChange({
      provinceCode: selectedProvince.code,
      provinceName: selectedProvince.name,
      cityCode: selectedCity.code,
      cityName: selectedCity.name,
      barangayCode: barangay.code,
      barangayName: barangay.name,
      displayName: `${barangay.name}, ${selectedCity.name}`,
    });
    handleClose();
  };

  const handleClose = () => {
    setShowModal(false);
    setStep('province');
    setSearch('');
    setSelectedProvince(null);
    setSelectedCity(null);
  };

  const handleBack = () => {
    setSearch('');
    if (step === 'barangay') setStep('city');
    else if (step === 'city') setStep('province');
  };

  const getTitle = () => {
    if (step === 'province') return 'Piliin ang Probinsya';
    if (step === 'city') return `Lungsod/Bayan sa ${selectedProvince?.name}`;
    return `Barangay sa ${selectedCity?.name}`;
  };

  const getCurrentList = () => {
    const list = step === 'province' ? provinces
      : step === 'city' ? cities
      : barangays;
    return list.filter(item =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  };

  const isSelected = (item: any) => {
    if (step === 'province') return selectedProvince?.code === item.code;
    if (step === 'city') return selectedCity?.code === item.code;
    return value?.barangayCode === item.code;
  };

  return (
    <View>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={[styles.selector, error ? { borderColor: colors.danger } : {}]}
        onPress={() => setShowModal(true)}
      >
        <Ionicons name="location-outline" size={18} color={colors.gray400} />
        <Text style={[styles.selectorText, !value && { color: colors.gray400 }]}>
          {value?.displayName || 'Pumili ng lokasyon...'}
        </Text>
        {value && (
          <TouchableOpacity onPress={() => onChange(null)}>
            <Ionicons name="close-circle" size={18} color={colors.gray400} />
          </TouchableOpacity>
        )}
        <Ionicons name="chevron-down" size={18} color={colors.gray400} />
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal visible={showModal} animationType="slide" onRequestClose={handleClose}>
        <View style={styles.modal}>

          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={step === 'province' ? handleClose : handleBack}
              style={styles.backBtn}
            >
              <Ionicons
                name={step === 'province' ? 'close' : 'arrow-back'}
                size={24}
                color={colors.gray900}
              />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{getTitle()}</Text>
          </View>

          {/* Step indicator */}
          <View style={styles.stepRow}>
            {['Probinsya', 'Lungsod', 'Barangay'].map((s, i) => {
              const steps = ['province', 'city', 'barangay'];
              const isActive = steps[i] === step;
              const isDone = steps.indexOf(step) > i;
              return (
                <View key={s} style={styles.stepWrap}>
                  <View style={[
                    styles.stepDot,
                    isActive && styles.stepDotActive,
                    isDone && styles.stepDotDone,
                  ]}>
                    {isDone
                      ? <Ionicons name="checkmark" size={10} color={colors.white} />
                      : <Text style={[
                          styles.stepNum,
                          (isActive || isDone) && { color: colors.white }
                        ]}>
                          {i + 1}
                        </Text>
                    }
                  </View>
                  <Text style={[
                    styles.stepLabel,
                    isActive && styles.stepLabelActive
                  ]}>
                    {s}
                  </Text>
                  {i < 2 && (
                    <Ionicons
                      name="chevron-forward"
                      size={12}
                      color={colors.gray300}
                      style={{ marginHorizontal: 2 }}
                    />
                  )}
                </View>
              );
            })}
          </View>

          {/* Search */}
          <View style={styles.searchWrap}>
            <Input
              placeholder={
                step === 'province' ? 'Maghanap ng probinsya...' :
                step === 'city' ? 'Maghanap ng lungsod/bayan...' :
                'Maghanap ng barangay...'
              }
              value={search}
              onChangeText={setSearch}
              containerStyle={{ marginBottom: 0 }}
            />
          </View>

          {/* List */}
          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator color={colors.primary} size="large" />
              <Text style={styles.loadingText}>Nilo-load...</Text>
            </View>
          ) : getCurrentList().length === 0 ? (
            <View style={styles.center}>
              <Text style={styles.emptyText}>Walang resulta</Text>
            </View>
          ) : (
            <ScrollView style={styles.list}>
              {getCurrentList().map(item => (
                <TouchableOpacity
                  key={item.code}
                  style={[styles.item, isSelected(item) && styles.itemSelected]}
                  onPress={() => {
                    if (step === 'province') handleProvinceSelect(item as Province);
                    else if (step === 'city') handleCitySelect(item as City);
                    else handleBarangaySelect(item as Barangay);
                  }}
                >
                  <Ionicons
                    name={isSelected(item) ? 'radio-button-on' : 'radio-button-off'}
                    size={18}
                    color={isSelected(item) ? colors.primary : colors.gray400}
                  />
                  <Text style={[
                    styles.itemText,
                    isSelected(item) && styles.itemTextSelected
                  ]}>
                    {item.name}
                  </Text>
                  {step !== 'barangay' && (
                    <Ionicons name="chevron-forward" size={16} color={colors.gray400} />
                  )}
                </TouchableOpacity>
              ))}
              <View style={{ height: spacing.xxl }} />
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.gray600,
    marginBottom: spacing.sm,
  },
  selector: {
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
  selectorText: {
    flex: 1,
    fontSize: typography.fontSizes.md,
    color: colors.gray900,
  },
  errorText: {
    fontSize: typography.fontSizes.xs,
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  modal: {
    flex: 1,
    backgroundColor: colors.white,
    paddingTop: 60,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.gray200,
    gap: spacing.md,
  },
  backBtn: { padding: spacing.xs },
  modalTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.gray900,
    flex: 1,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.gray50,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.gray200,
  },
  stepWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotActive: { backgroundColor: colors.primary },
  stepDotDone: { backgroundColor: colors.success },
  stepNum: {
    fontSize: 10,
    color: colors.gray600,
    fontWeight: typography.fontWeights.medium,
  },
  stepLabel: {
    fontSize: typography.fontSizes.xs,
    color: colors.gray400,
  },
  stepLabelActive: {
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },
  searchWrap: {
    padding: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.gray200,
  },
  list: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },
  loadingText: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray400,
  },
  emptyText: {
    fontSize: typography.fontSizes.md,
    color: colors.gray400,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.gray100,
  },
  itemSelected: { backgroundColor: colors.primaryLight },
  itemText: {
    flex: 1,
    fontSize: typography.fontSizes.md,
    color: colors.gray900,
  },
  itemTextSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },
});