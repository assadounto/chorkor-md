import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useAppTheme } from "@/theme/useTheme";
import { space, font } from "@/theme/tokens";
import Ionicons from "@expo/vector-icons/Ionicons";

type Props = {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
};

export function Header({ title, showBack = true, onBack }: Props) {
  const t = useAppTheme();

  const handleBack = () => {
    if (onBack) return onBack();
    router.back();
  };

  return (
    <View
      style={[
        styles.bar,
        { borderBottomColor: t.border, backgroundColor: t.card },
      ]}
    >
      {router.canGoBack() && showBack ? (
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={22} color={t.text} />
        </TouchableOpacity>
      ) : (
        <View style={styles.backPlaceholder} />
      )}

      <Text
        style={[styles.title, { color: t.text }]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {title}
      </Text>

      {/* Right-side placeholder to keep title centered */}
      <View style={styles.backPlaceholder} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
  },
  backPlaceholder: {
    width: 34,
    height: 34,
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: font.h1,
    fontWeight: "700",
  },
});
