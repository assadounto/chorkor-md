import React, { useState } from "react";
import { View, Text } from "react-native";
import Screen from "@/components/ui/Screen";
import { Header } from "@/components/ui/Header";
import Button from "@/components/ui/Button";
import { useAppTheme } from "@/theme/useTheme";
import { space } from "@/theme/tokens";

const QUESTIONS = [
  { id: "fever", q: "Do you have a fever (≥38°C)?" },
  { id: "chest_pain", q: "Any chest pain or trouble breathing?" },
  { id: "severe", q: "Severe headache, confusion, or fainting?" },
];

type Answers = Record<string, boolean | null>;

export default function SymptomChecker() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const t = useAppTheme();

  const onPick = (v: boolean) => {
    const key = QUESTIONS[step].id;
    setAnswers((a) => ({ ...a, [key]: v }));
    setTimeout(() => setStep((s) => Math.min(s + 1, QUESTIONS.length)), 100);
  };

  const urgent = !!answers["chest_pain"] || !!answers["severe"];
  const care = !!answers["fever"] && !urgent;

  return (
    <Screen>
      <Header title="Symptom Checker" />
      <View style={{ padding: space.lg, gap: 12 }}>
        {step < QUESTIONS.length ? (
          <>
            <Text style={{ color: t.text, fontSize: 18 }}>
              {QUESTIONS[step].q}
            </Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Button title="Yes" onPress={() => onPick(true)} />
              <Button
                title="No"
                color="neutral"
                onPress={() => onPick(false)}
              />
            </View>
          </>
        ) : (
          <>
            {urgent ? (
              <View
                style={{
                  padding: 16,
                  borderRadius: 16,
                  backgroundColor: t.danger,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "800" }}>
                  Urgent attention recommended
                </Text>
                <Text style={{ color: "#fff", opacity: 0.9, marginTop: 4 }}>
                  Trouble breathing or severe symptoms. Please go to the nearest
                  emergency clinic or call local services.
                </Text>
              </View>
            ) : care ? (
              <View
                style={{
                  padding: 16,
                  borderRadius: 16,
                  backgroundColor: t.warn,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "800" }}>
                  Care soon
                </Text>
                <Text style={{ color: "#fff", opacity: 0.9, marginTop: 4 }}>
                  Fever detected. Consider consulting a clinician within 24–48
                  hours or start a teleconsultation.
                </Text>
              </View>
            ) : (
              <View
                style={{
                  padding: 16,
                  borderRadius: 16,
                  backgroundColor: t.success,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "800" }}>
                  Self-care possible
                </Text>
                <Text style={{ color: "#fff", opacity: 0.9, marginTop: 4 }}>
                  Based on your answers, your symptoms don’t suggest an
                  emergency. Rest, hydrate, and monitor.
                </Text>
              </View>
            )}
            <Button title="Start a consultation" />
          </>
        )}
      </View>
    </Screen>
  );
}
