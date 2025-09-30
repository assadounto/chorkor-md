import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Screen from "@/components/ui/Screen";
import { Header } from "@/components/ui/Header";
import * as Haptics from "expo-haptics";

const QUESTIONS = [
  { id: "fever", q: "Do you have a fever (≥38°C)?" },
  { id: "chest_pain", q: "Any chest pain or trouble breathing?" },
  { id: "severe", q: "Severe headache, confusion, or fainting?" },
];

type Answers = Record<string, boolean | null>;

export default function SymptomChecker() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});

  const onPick = (v: boolean) => {
    const key = QUESTIONS[step].id;
    setAnswers((a) => ({ ...a, [key]: v }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTimeout(() => setStep((s) => Math.min(s + 1, QUESTIONS.length)), 120);
  };

  const urgent = !!answers["chest_pain"] || !!answers["severe"];
  const care = !!answers["fever"] && !urgent;

  return (
    <Screen>
      <Header title="Symptom Checker" />
      <View className="p-5 gap-5">
        {step < QUESTIONS.length ? (
          <View className="gap-4">
            <Text className="text-lg text-zinc-900 dark:text-zinc-100">{QUESTIONS[step].q}</Text>
            <View className="flex-row gap-3">
              <TouchableOpacity onPress={() => onPick(true)} className="px-4 py-3 rounded-xl bg-brand">
                <Text className="text-white">Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onPick(false)} className="px-4 py-3 rounded-xl bg-zinc-200 dark:bg-zinc-700">
                <Text className="text-zinc-900 dark:text-zinc-100">No</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View className="gap-3">
            {urgent ? (
              <View className="p-4 rounded-2xl bg-red-500">
                <Text className="text-white font-semibold">Urgent attention recommended</Text>
                <Text className="text-white/90 mt-1">Breathing difficulty or severe symptoms. Please go to the nearest emergency clinic or call local services.</Text>
              </View>
            ) : care ? (
              <View className="p-4 rounded-2xl bg-amber-500">
                <Text className="text-white font-semibold">Care soon</Text>
                <Text className="text-white/90 mt-1">Fever detected. Consider consulting a clinician within 24–48 hours or start a teleconsultation.</Text>
              </View>
            ) : (
              <View className="p-4 rounded-2xl bg-emerald-600">
                <Text className="text-white font-semibold">Self‑care possible</Text>
                <Text className="text-white/90 mt-1">Based on your answers, your symptoms don’t suggest an emergency. Rest, hydrate, and monitor. If symptoms worsen, seek care.</Text>
              </View>
            )}
            <TouchableOpacity className="mt-4 px-4 py-3 rounded-xl bg-brand">
              <Text className="text-white text-center">Start a consultation</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Screen>
  );
}
