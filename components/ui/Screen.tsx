import React, { ReactNode } from "react";
import { View, StyleSheet } from "react-native";
import { useAppTheme } from "@/theme/useTheme";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Screen({ children }: { children: ReactNode }) {
  const t = useAppTheme();
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: t.bg }]}>{children}</SafeAreaView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
