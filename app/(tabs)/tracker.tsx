import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import Screen from "@/components/ui/Screen";
import { Header } from "@/components/ui/Header";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAppTheme } from "@/theme/useTheme";
import { radius, space } from "@/theme/tokens";
import { useTracker, type ReadingType } from "@/state/tracker";
import SparkBars from "@/components/ui/SparkBars"; // ✅ move import to top

const TYPES: { key: ReadingType; label: string; ph: string }[] = [
  { key: "bp", label: "BP", ph: "120/80" },
  { key: "hr", label: "Heart Rate", ph: "72" },
  { key: "steps", label: "Steps", ph: "5000" },
  { key: "weight", label: "Weight (kg)", ph: "72.5" },
  { key: "sugar", label: "Blood Sugar (mg/dL)", ph: "95" },
];

export default function Tracker() {
  const t = useAppTheme();
  const { add, hydrate, hydrated, lastOf, recentValues, recentBP } =
    useTracker();
  const [type, setType] = useState<ReadingType>("bp");
  const [value, setValue] = useState("");

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrated, hydrate]);

  const submit = async () => {
    try {
      if (type === "bp") {
        const m = /^\s*(\d{2,3})\s*\/\s*(\d{2,3})\s*$/.exec(value);
        if (!m) return Alert.alert("Invalid BP", "Use format like 120/80");
        const sys = parseInt(m[1], 10),
          dia = parseInt(m[2], 10);
        await add({ type: "bp", sys, dia } as any);
      } else {
        const n = Number(value);
        if (!isFinite(n))
          return Alert.alert("Invalid number", "Enter a numeric value.");
        await add({ type, value: n } as any);
      }
      setValue("");
      Alert.alert("Saved", "Reading added.");
    } catch (e: any) {
      Alert.alert("Error", e.message || String(e));
    }
  };

  // snapshots
  const lastBP = lastOf("bp") as any;
  const lastHR = lastOf("hr") as any;
  const lastSteps = lastOf("steps") as any;

  return (
    <Screen edges={["top", "left", "right"]}>
      <Header title="Tracker" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: "padding", android: undefined })}
        keyboardVerticalOffset={Platform.OS === "ios" ? 72 : 0}
      >
        <ScrollView
          contentContainerStyle={{ padding: space.lg, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <Card title="Add Reading" subtitle="Quick log">
            {/* type chips */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {TYPES.map((tpe) => (
                <Pressable
                  key={tpe.key}
                  onPress={() => setType(tpe.key)}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    borderRadius: 14,
                    backgroundColor:
                      type === tpe.key
                        ? t.brand
                        : t.isDark
                        ? "#3F3F46"
                        : "#E5E7EB",
                  }}
                >
                  <Text
                    style={{
                      color: type === tpe.key ? "#fff" : "#111827",
                      fontWeight: "700",
                    }}
                  >
                    {tpe.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <TextInput
              value={value}
              onChangeText={setValue}
              placeholder={TYPES.find((x) => x.key === type)?.ph}
              placeholderTextColor={t.sub}
              style={[
                styles.input,
                {
                  backgroundColor: t.card,
                  borderColor: t.border,
                  color: t.text,
                },
              ]}
              keyboardType={type === "bp" ? "default" : "numeric"}
              returnKeyType="done"
              onSubmitEditing={submit}
            />
            <Button
              title="Save"
              color="success"
              style={{ marginTop: 10 }}
              onPress={submit}
            />
          </Card>

          {/* Last snapshots */}
          <Card
            title="Snapshots"
            subtitle="Latest values"
            style={{ marginTop: 12 }}
          >
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Snap
                label="BP"
                value={lastBP ? `${lastBP.sys}/${lastBP.dia}` : "—"}
              />
              <Snap label="HR" value={lastHR ? `${lastHR.value} bpm` : "—"} />
              <Snap
                label="Steps"
                value={lastSteps ? `${lastSteps.value}` : "—"}
              />
            </View>
          </Card>

          {/* Mini trend charts */}
          <Card
            title="Trends"
            subtitle="Last entries (new → old)"
            style={{ marginTop: 12 }}
          >
            <View style={{ gap: 16 }}>
              <TrendRow
                label="Heart Rate"
                data={recentValues("hr", 12)}
                unit="bpm"
              />
              <TrendRow
                label="Steps"
                data={recentValues("steps", 12)}
                unit=""
              />
              <BPTrend data={recentBP(8)} />
            </View>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function Snap({ label, value }: { label: string; value: string }) {
  const t = useAppTheme();
  return (
    <View
      style={{
        flex: 1,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: t.border,
        borderRadius: 16,
        padding: 12,
      }}
    >
      <Text style={{ color: t.sub, fontSize: 12, fontWeight: "600" }}>
        {label}
      </Text>
      <Text
        style={{ color: t.text, fontSize: 18, fontWeight: "800", marginTop: 6 }}
      >
        {value}
      </Text>
    </View>
  );
}

function TrendRow({
  label,
  data,
  unit,
}: {
  label: string;
  data: number[];
  unit: string;
}) {
  const t = useAppTheme();
  return (
    <View>
      <Text style={{ color: t.text, fontWeight: "700" }}>{label}</Text>
      {data.length ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            marginTop: 6,
          }}
        >
          <SparkBars
            data={data}
            width={160}
            height={36}
            color={t.brand}
            bg="transparent"
          />
          <Text style={{ color: t.sub, fontSize: 12 }}>
            min {Math.min(...data)}
            {unit} • max {Math.max(...data)}
            {unit}
          </Text>
        </View>
      ) : (
        <Text style={{ color: t.sub, fontSize: 12, marginTop: 6 }}>
          No data yet
        </Text>
      )}
    </View>
  );
}

function BPTrend({ data }: { data: { sys: number; dia: number }[] }) {
  const t = useAppTheme();
  if (!data.length)
    return <Text style={{ color: t.sub, fontSize: 12 }}>No BP data yet</Text>;
  const sys = data.map((d) => d.sys);
  const dia = data.map((d) => d.dia);
  return (
    <View>
      <Text style={{ color: t.text, fontWeight: "700" }}>Blood Pressure</Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          marginTop: 6,
        }}
      >
        <SparkBars data={sys} width={160} height={36} color={t.warn} />
        <SparkBars data={dia} width={160} height={36} color={t.purple} />
      </View>
      <Text style={{ color: t.sub, fontSize: 12, marginTop: 4 }}>
        Systolic (amber) • Diastolic (purple)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    marginTop: 10,
    padding: 14,
    borderRadius: radius.xl,
    borderWidth: 1,
  },
});
