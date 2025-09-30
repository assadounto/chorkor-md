import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import Screen from "@/components/ui/Screen";
import { Header } from "@/components/ui/Header";
import { useReadings } from "./index";

export default function AddReading() {
  const add = useReadings((s) => s.add);
  const [type, setType] = useState<"bp" | "hr" | "sugar" | "weight">("bp");
  const [value, setValue] = useState("");

  return (
    <Screen>
      <Header title="Add Reading" />
      <View className="p-5 gap-3">
        <View className="flex-row gap-2">
          {(["bp","hr","sugar","weight"] as const).map((t) => (
            <TouchableOpacity key={t} onPress={() => setType(t)} className={`px-3 py-2 rounded-xl ${type === t ? "bg-brand" : "bg-zinc-200 dark:bg-zinc-700"}`}>
              <Text className={`${type === t ? "text-white" : "text-zinc-800 dark:text-zinc-100"}`}>{t.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          value={value} onChangeText={setValue}
          placeholder={type === "bp" ? "e.g., 120/80" : type === "hr" ? "e.g., 72 bpm" : type === "sugar" ? "e.g., 5.5 mmol/L" : "e.g., 74 kg"}
          className="p-4 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
        />
        <TouchableOpacity onPress={() => { if (!value.trim()) return; add({ id: Math.random().toString(36).slice(2), type, value, at: Date.now() }); }} className="p-4 rounded-2xl bg-emerald-600">
          <Text className="text-white text-center">Save</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}
