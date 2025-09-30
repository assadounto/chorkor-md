import React, { ReactNode } from "react";
import { View, StyleSheet } from "react-native";
import { useAppTheme } from "@/theme/useTheme";

export default function Screen({ children }: { children: ReactNode }) {
  const t = useAppTheme();
  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>{children}</View>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
