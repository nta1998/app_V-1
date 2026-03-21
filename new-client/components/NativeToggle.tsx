import { Switch, Platform } from 'react-native';

interface NativeToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  tintColor?: string;
}

/**
 * Styled toggle that works in Expo Go.
 * Uses React Native Switch with platform-appropriate styling.
 */
export function NativeToggle({ value, onValueChange, tintColor }: NativeToggleProps) {
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: Platform.OS === 'ios' ? '#767577' : '#767577', true: tintColor ?? '#c8a455' }}
      thumbColor={Platform.OS === 'android' ? (value ? tintColor ?? '#c8a455' : '#f4f3f4') : undefined}
      ios_backgroundColor="#3e3e3e"
    />
  );
}
