import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// Save data to cache
export const setCache = async <T>(key: string, data: T): Promise<void> => {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(entry));
  } catch (err) {
    console.log('Cache set error:', err);
  }
};

// Get data from cache
export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    const raw = await AsyncStorage.getItem(`cache_${key}`);
    if (!raw) return null;

    const entry: CacheEntry<T> = JSON.parse(raw);

    // Check if cache is still valid
    if (Date.now() - entry.timestamp > CACHE_EXPIRY) {
      await AsyncStorage.removeItem(`cache_${key}`);
      return null;
    }

    return entry.data;
  } catch (err) {
    console.log('Cache get error:', err);
    return null;
  }
};

// Clear specific cache
export const clearCache = async (key: string): Promise<void> => {
  await AsyncStorage.removeItem(`cache_${key}`);
};

// Clear all cache
export const clearAllCache = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(k => k.startsWith('cache_'));
    await AsyncStorage.multiRemove(cacheKeys);
  } catch (err) {
    console.log('Cache clear error:', err);
  }
};