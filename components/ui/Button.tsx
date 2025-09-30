import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from "react-native";
import { useAppTheme } from "@/theme/useTheme";
import { radius, space } from "@/theme/tokens";

type Props = {
  title: string;
  onPress?: () => void;
  color?: "brand" | "success" | "warn" | "purple" | "neutral";
  style?: ViewStyle | ViewStyle[];
  disabled?: boolean;
};

export default function Button({
  title,
  onPress,
  color = "brand",
  style,
  disabled,
}: Props) {
  const t = useAppTheme();

  const bg = {
    brand: t.brand,
    success: t.success,
    warn: t.warn,
    purple: t.purple,
    neutral: t.isDark ? "#3F3F46" : "#E5E7EB",
  }[color];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.btn,
        { backgroundColor: bg, opacity: disabled ? 0.6 : 1 },
        style,
      ]}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { paddingVertical: 14, borderRadius: radius.xl, alignItems: "center" },
  text: { color: "#fff", fontWeight: "700" },
});
