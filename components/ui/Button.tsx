import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from "react-native";
import { useAppTheme } from "@/theme/useTheme";
import { radius } from "@/theme/tokens";

type Props = {
  title: string;
  onPress?: () => void;
  color?: "brand" | "success" | "warn" | "purple" | "neutral";
  style?: ViewStyle | ViewStyle[];
  disabled?: boolean;
  /** If false, renders inline (content-sized). Default true = full-width/block. */
  fullWidth?: boolean;
};

export default function Button({
  title,
  onPress,
  color = "brand",
  style,
  disabled,
  fullWidth = true,
}: Props) {
  const t = useAppTheme();

  const bg = {
    brand: t.brand,
    success: t.success,
    warn: t.warn,
    purple: t.purple,
    neutral: t.isDark ? "#3F3F46" : "#E5E7EB",
  }[color];

  const textColor =
    color === "neutral" ? (t.isDark ? "#fff" : "#111827") : "#fff";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.btn,
        fullWidth ? styles.block : styles.inline,
        { backgroundColor: bg, opacity: disabled ? 0.6 : 1 },
        style,
      ]}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, { color: textColor }]} numberOfLines={1}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    minHeight: 44, // bigger touch target
    paddingVertical: 10,
    paddingHorizontal: 14, // prevents squishing
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0, // <-- don't allow shrinking in rows
  },
  block: {
    width: "100%", // full width by default
    alignSelf: "stretch",
  },
  inline: {
    alignSelf: "flex-start", // content-sized if needed
  },
  text: {
    fontWeight: "700",
  },
});
