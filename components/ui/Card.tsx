import React, { ReactNode } from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { useAppTheme } from "@/theme/useTheme";
import { radius, space } from "@/theme/tokens";

type Props = {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  style?: ViewStyle | ViewStyle[];
};

export default function Card({ title, subtitle, children, style }: Props) {
  const t = useAppTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: t.card, borderColor: t.border },
        style,
      ]}
    >
      {title ? (
        <Text style={[styles.title, { color: t.text }]}>{title}</Text>
      ) : null}
      {subtitle ? (
        <Text style={[styles.subtitle, { color: t.sub }]}>{subtitle}</Text>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.xl,
    padding: space.lg,
  },
  title: { fontSize: 16, fontWeight: "700" },
  subtitle: { marginTop: 4, marginBottom: 6, fontSize: 14 },
});
