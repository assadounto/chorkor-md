import { View, Text, TouchableOpacity, FlatList } from "react-native";
import Screen from "@/components/ui/Screen";
import { Header } from "@/components/ui/Header";
import { Link } from "expo-router";
import { create } from "zustand";

export type Reading = { id: string; type: "bp" | "hr" | "sugar" | "weight"; value: string; at: number };

export const useReadings = create<{ items: Reading[]; add: (r: Reading) => void }>((set) => ({
  items: [], add: (r) => set((s) => ({ items: [r, ...s.items] }))
}));

export default function Tracker() {
  const items = useReadings((s) => s.items);
  return (
    <Screen>
      <Header title="Health Tracker" />
      <View className="p-5 gap-3">
        <Link href="/tracker/add-reading" asChild>
          <TouchableOpacity className="p-4 rounded-2xl bg-brand">
            <Text className="text-white text-center">Add Reading</Text>
          </TouchableOpacity>
        </Link>
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <View className="p-4 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 mb-3">
              <Text className="text-zinc-900 dark:text-zinc-100 font-medium">{item.type.toUpperCase()}</Text>
              <Text className="text-zinc-600 dark:text-zinc-300">{item.value}</Text>
              <Text className="text-xs text-zinc-500">{new Date(item.at).toLocaleString()}</Text>
            </View>
          )}
        />
      </View>
    </Screen>
  );
}
