import { useColorScheme } from "react-native";
import { colors } from "./tokens";

export function useAppTheme() {
  const isDark = useColorScheme() === "dark";
  return {
    isDark,
    bg: isDark ? colors.bgDark : colors.bgLight,
    card: isDark ? "#18181B" : "#FFFFFF",
    text: isDark ? colors.textDark : colors.textLight,
    sub: colors.muted,
    border: isDark ? colors.borderDark : colors.borderLight,
    brand: colors.brand,
    success: colors.success,
    warn: colors.warn,
    purple: colors.purple,
    danger: colors.danger
  };
}

