import React from "react";
import { View, Text, FlatList } from "react-native";
import Screen from "@/components/ui/Screen";
import { Header } from "@/components/ui/Header";
import { Link } from "expo-router";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { create } from "zustand";
import { useAppTheme } from "@/theme/useTheme";
import { space } from "@/theme/tokens";

export type Reading = {
  id: string;
  type: "bp" | "hr" | "sugar" | "weight";
  value: string;
  at: number;
};

export const useReadings = create<{
  items: Reading[];
  add: (r: Reading) => void;
}>((set) => ({
  items: [],
  add: (r) => set((s) => ({ items: [r, ...s.items] })),
}));

export default function Tracker() {
  const items = useReadings((s) => s.items);
  const t = useAppTheme();

  return (
    <Screen>
      <Header title="Health Tracker" />
      <View style={{ padding: space.lg, gap: 12 }}>
        <Link href="/tracker/add-reading" asChild>
          <Button title="Add Reading" />
        </Link>
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <Card
              title={item.type.toUpperCase()}
              subtitle={new Date(item.at).toLocaleString()}
            >
              <Text style={{ color: t.text, marginTop: 6 }}>{item.value}</Text>
            </Card>
          )}
        />
      </View>
    </Screen>
  );
}
