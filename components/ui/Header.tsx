import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAppTheme } from "@/theme/useTheme";
import { space, font } from "@/theme/tokens";

export function Header({ title }: { title: string }) {
  const t = useAppTheme();
  return (
    <View style={[styles.bar, { borderBottomColor: t.border }]}>
      <Text style={[styles.title, { color: t.text }]}>{title}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  bar: { paddingHorizontal: space.lg, paddingVertical: space.md, borderBottomWidth: StyleSheet.hairlineWidth },
  title: { fontSize: font.h1, fontWeight: "700" }
});

