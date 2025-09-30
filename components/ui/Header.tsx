import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/state/auth";
import { useAppTheme } from "@/theme/useTheme";
import { radius, space, font } from "@/theme/tokens";

export function Header({ title }: { title: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const t = useAppTheme();

  return (
    <View style={[styles.bar, { borderBottomColor: t.border }]}>
      <Text style={[styles.title, { color: t.text }]}>{title}</Text>
      <TouchableOpacity
        onPress={() => router.push(user ? "/settings" : "/auth/sign-in")}
        style={[
          styles.chip,
          { backgroundColor: t.isDark ? "#1F2937" : "#F4F4F5" },
        ]}
      >
        <Text style={{ color: t.text }}>{user ? "Settings" : "Sign In"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: { fontSize: font.h1, fontWeight: "700" },
  chip: {
    paddingHorizontal: space.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
});
