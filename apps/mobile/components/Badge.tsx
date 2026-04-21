import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../theme';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

export const Badge = ({ label, variant = 'neutral' }: BadgeProps) => {
  return (
    <View style={[styles.base, styles[variant]]}>
      <Text style={[styles.label, styles[`${variant}Label`]]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  primary: { backgroundColor: colors.primaryLight },
  success: { backgroundColor: colors.successLight },
  warning: { backgroundColor: colors.warningLight },
  danger: { backgroundColor: colors.dangerLight },
  neutral: { backgroundColor: colors.gray100 },
  label: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
  },
  primaryLabel: { color: colors.primaryDark },
  successLabel: { color: colors.success },
  warningLabel: { color: colors.warning },
  dangerLabel: { color: colors.danger },
  neutralLabel: { color: colors.gray600 },
});