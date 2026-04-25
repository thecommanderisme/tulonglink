import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './en';
import tl from './tl';

const LANGUAGE_KEY = 'tulonglink_language';

export const initI18n = async () => {
  // Check saved language preference
  let savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);

  // Fall back to device language or Tagalog
  if (!savedLanguage) {
    const deviceLanguage = Localization.getLocales()[0]?.languageCode;
    savedLanguage = deviceLanguage === 'fil' || deviceLanguage === 'tl' ? 'tl' : 'tl';
  }

  await i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      tl: { translation: tl },
    },
    lng: savedLanguage,
    fallbackLng: 'tl',
    interpolation: { escapeValue: false },
  });
};

export const changeLanguage = async (lang: 'en' | 'tl') => {
  await i18n.changeLanguage(lang);
  await AsyncStorage.setItem(LANGUAGE_KEY, lang);
};

export default i18n;