import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
} from "react-native";
import Screen from "@/components/ui/Screen";
import { Header } from "@/components/ui/Header";
import Button from "@/components/ui/Button";
import { useAppTheme } from "@/theme/useTheme";
import { radius, space } from "@/theme/tokens";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Reminder, useReminders } from "@/state/reminders";

const DAYS: { label: string; value: number }[] = [
  { label: "Sun", value: 1 },
  { label: "Mon", value: 2 },
  { label: "Tue", value: 3 },
  { label: "Wed", value: 4 },
  { label: "Thu", value: 5 },
  { label: "Fri", value: 6 },
  { label: "Sat", value: 7 },
];

export default function ReminderEditor() {
  const t = useAppTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const { items, hydrated, hydrate, add, update } = useReminders();

  const editing = useMemo(
    () => items.find((i) => i.id === params.id),
    [items, params.id]
  );

  const [name, setName] = useState(editing?.name ?? "");
  const [dose, setDose] = useState(editing?.dose ?? "");
  const [time, setTime] = useState(editing?.time ?? "09:00");
  const [weekdays, setWeekdays] = useState<number[]>(editing?.weekdays ?? []);
  const [notes, setNotes] = useState(editing?.notes ?? "");

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrated, hydrate]);

  const toggleDay = (d: number) =>
    setWeekdays((w) =>
      w.includes(d) ? w.filter((x) => x !== d) : [...w, d].sort()
    );

  const save = async () => {
    if (!name.trim())
      return Alert.alert("Missing name", "Enter the medicine name.");
    try {
      if (editing) {
        await update(editing.id, { name, dose, time, weekdays, notes });
      } else {
        await add({ name, dose, time, weekdays, notes });
      }
      router.back();
    } catch (e: any) {
      Alert.alert("Failed", e.message || String(e));
    }
  };

  const chipStyle = (active: boolean) => ({
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: active ? t.brand : t.isDark ? "#3F3F46" : "#E5E7EB",
  });

  return (
    <Screen>
      <Header title={editing ? "Edit Reminder" : "New Reminder"} />
      <View style={{ padding: space.lg, gap: 12 }}>
        <TextInput
          placeholder="Medicine name (e.g., Paracetamol)"
          placeholderTextColor={t.sub}
          value={name}
          onChangeText={setName}
          style={{
            padding: 14,
            borderRadius: 16,
            backgroundColor: t.card,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: t.border,
            color: t.text,
          }}
        />
        <TextInput
          placeholder="Dose (e.g., 500 mg)"
          placeholderTextColor={t.sub}
          value={dose}
          onChangeText={setDose}
          style={{
            padding: 14,
            borderRadius: 16,
            backgroundColor: t.card,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: t.border,
            color: t.text,
          }}
        />
        <TextInput
          placeholder="Time (HH:MM)"
          placeholderTextColor={t.sub}
          value={time}
          onChangeText={setTime}
          style={{
            padding: 14,
            borderRadius: 16,
            backgroundColor: t.card,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: t.border,
            color: t.text,
          }}
        />

        <View>
          <Text style={{ color: t.sub, marginBottom: 6 }}>Repeat on</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {DAYS.map((d) => (
              <Pressable
                key={d.value}
                onPress={() => toggleDay(d.value)}
                style={chipStyle(weekdays.includes(d.value)) as any}
              >
                <Text
                  style={{
                    color: weekdays.includes(d.value) ? "#fff" : "#111827",
                  }}
                >
                  {d.label}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={{ color: t.sub, marginTop: 6, fontSize: 12 }}>
            Select none for **every day**.
          </Text>
        </View>

        <TextInput
          placeholder="Notes (optional)"
          placeholderTextColor={t.sub}
          value={notes}
          onChangeText={setNotes}
          style={{
            padding: 14,
            borderRadius: 16,
            backgroundColor: t.card,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: t.border,
            color: t.text,
          }}
        />

        <Button
          title={editing ? "Save Changes" : "Create Reminder"}
          color="success"
          onPress={save}
        />
      </View>
    </Screen>
  );
}
