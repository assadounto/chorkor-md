import React, { ReactNode } from "react";
import { StyleSheet, ViewStyle } from "react-native";
import { SafeAreaView, Edge } from "react-native-safe-area-context";
import { useAppTheme } from "@/theme/useTheme";

type Props = {
  children: ReactNode;
  /** Which edges get padded by the safe area.
   * For tab screens, use ["top","left","right"] to avoid spacing above the tab bar. */
  edges?: Edge[];
  style?: ViewStyle;
};

export default function Screen({
  children,
  edges = ["top", "right", "left", "bottom"],
  style,
}: Props) {
  const t = useAppTheme();
  return (
    <SafeAreaView
      edges={edges}
      style={[styles.root, { backgroundColor: t.bg }, style]}
    >
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
