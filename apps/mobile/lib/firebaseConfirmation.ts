import { FirebaseAuthTypes } from '@react-native-firebase/auth';

let confirmation: FirebaseAuthTypes.ConfirmationResult | null = null;

export const setConfirmation = (c: FirebaseAuthTypes.ConfirmationResult) => {
  confirmation = c;
};

export const getConfirmation = () => confirmation;

export const clearConfirmation = () => {
  confirmation = null;
};
