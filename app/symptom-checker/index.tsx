import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  LayoutAnimation,
  UIManager,
} from "react-native";
import Screen from "@/components/ui/Screen";
import { Header } from "@/components/ui/Header";
import Button from "@/components/ui/Button";
import { useAppTheme } from "@/theme/useTheme";
import { radius, space } from "@/theme/tokens";
import {
  SYMPTOMS,
  RED_FLAGS,
  checkSymptoms,
  type Severity,
  type Sex,
} from "@/lib/symptoms";

type Msg = { id: string; from: "bot" | "me"; text: string };

type Step =
  | "intro"
  | "age"
  | "sex"
  | "symptoms"
  | "duration"
  | "severity"
  | "redflags"
  | "confirm"
  | "result";

const FLOW: Step[] = [
  "age",
  "sex",
  "symptoms",
  "duration",
  "severity",
  "redflags",
  "confirm",
];
const SEXES: Sex[] = ["male", "female", "other"];
const SEVERITIES: Severity[] = ["mild", "moderate", "severe"];

// Enable Android layout animation
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function SymptomCheckerChat() {
  const t = useAppTheme();
  const listRef = useRef<FlatList<Msg>>(null);

  // Conversation / UI
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: "m1",
      from: "bot",
      text: "Hi! I’m your helpful checker 🤖. I’ll ask a few questions to give general guidance. This isn’t a diagnosis. In emergencies, seek care immediately.",
    },
  ]);
  const [step, setStep] = useState<Step>("intro");
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");

  // Answers
  const [age, setAge] = useState<string>("");
  const [sex, setSex] = useState<Sex>("other");
  const [selected, setSelected] = useState<string[]>([]);
  const [duration, setDuration] = useState<string>("1");
  const [severity, setSeverity] = useState<Severity>("mild");
  const [redFlags, setRedFlags] = useState<string[]>([]);

  // Progress
  const currentIndex = useMemo(() => FLOW.indexOf(step as any), [step]);
  const totalSteps = FLOW.length;

  // Smooth scroll on message change
  useEffect(() => {
    const id = setTimeout(
      () => listRef.current?.scrollToEnd({ animated: true }),
      60
    );
    return () => clearTimeout(id);
  }, [messages.length]);

  // Start flow
  useEffect(() => {
    if (step === "intro") {
      botSay("First, how old are you (in years)?", "age");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helpers
  const animate = () =>
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

  const botSay = (text: string, next?: Step) => {
    setTyping(true);
    setTimeout(() => {
      animate();
      setMessages((m) => [
        ...m,
        { id: Math.random().toString(36).slice(2), from: "bot", text },
      ]);
      setTyping(false);
      if (next) setStep(next);
    }, 220);
  };

  const userSay = (text: string) => {
    animate();
    setMessages((m) => [
      ...m,
      { id: Math.random().toString(36).slice(2), from: "me", text },
    ]);
  };

  const restart = () => {
    animate();
    setMessages([
      {
        id: "m1",
        from: "bot",
        text: "Let’s start again. I’ll ask a few questions to give general guidance. This isn’t a diagnosis.",
      },
    ]);
    setAge("");
    setSex("other");
    setSelected([]);
    setDuration("1");
    setSeverity("mild");
    setRedFlags([]);
    setInput("");
    setStep("intro");
    setTimeout(() => botSay("How old are you (in years)?", "age"), 260);
  };

  // Navigation
  const goNext = (target?: Step) => {
    if (target) return setStep(target);
    const i = FLOW.indexOf(step as any);
    if (i >= 0 && i < FLOW.length - 1) setStep(FLOW[i + 1]);
  };
  const goPrev = () => {
    const i = FLOW.indexOf(step as any);
    if (i > 0) setStep(FLOW[i - 1]);
  };

  // Input submit
  const onSubmitText = () => {
    if (step === "age") {
      const n = Number(input || age);
      if (!isFinite(n) || n < 0) return;
      const value = String(n);
      setAge(value);
      userSay(value);
      setInput("");
      botSay("Got it. Which best describes your sex?", "sex");
      return;
    }
    if (step === "duration") {
      const n = Number(input || duration);
      if (!isFinite(n) || n < 0) return;
      const value = String(n);
      setDuration(value);
      userSay(`${value} day(s)`);
      setInput("");
      botSay("How severe are your symptoms?", "severity");
      return;
    }
  };

  const chip = (label: string, active: boolean, onPress: () => void) => (
    <Pressable
      key={label}
      onPress={() => {
        onPress();
        animate();
      }}
      style={[
        styles.chip,
        {
          backgroundColor: active ? t.brand : t.isDark ? "#3F3F46" : "#E5E7EB",
        },
      ]}
    >
      <Text style={{ color: active ? "#fff" : "#111827", fontWeight: "600" }}>
        {label}
      </Text>
    </Pressable>
  );

  const canContinueSymptoms = selected.length > 0;

  const goConfirm = () => {
    const summary =
      `Okay, here’s what I’ve got:\n` +
      `• Age: ${age}\n` +
      `• Sex: ${sex}\n` +
      `• Symptoms: ${selected.join(", ") || "—"}\n` +
      `• Duration: ${duration} day(s)\n` +
      `• Severity: ${severity}\n` +
      `• Red flags: ${redFlags.join(", ") || "None"}`;
    botSay(summary, "confirm");
  };

  const compute = () => {
    const res = checkSymptoms({
      age: Number(age),
      sex,
      symptoms: selected,
      durationDays: Number(duration),
      severity,
      redFlags,
    });
    animate();
    setMessages((m) => [
      ...m,
      {
        id: Math.random().toString(36).slice(2),
        from: "bot",
        text: renderResult(res),
      },
    ]);
    setStep("result");
  };

  // UI
  const Progress = () =>
    step === "result" ? null : (
      <View
        style={[
          styles.progress,
          { backgroundColor: t.card, borderColor: t.border },
        ]}
      >
        <Text style={{ color: t.sub, fontSize: 12, fontWeight: "700" }}>
          Step {Math.max(1, currentIndex + 1)} / {totalSteps}
        </Text>
      </View>
    );

  return (
    <Screen>
      <Header title="Symptom Checker" />
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 72 : 0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: space.lg, paddingBottom: 96 }}
          renderItem={({ item }) => (
            <View
              style={[
                styles.bubble,
                item.from === "me"
                  ? { alignSelf: "flex-end", backgroundColor: t.brand }
                  : {
                      alignSelf: "flex-start",
                      backgroundColor: t.isDark ? "#3F3F46" : "#E4E4E7",
                    },
              ]}
            >
              <Text style={{ color: item.from === "me" ? "#fff" : t.text }}>
                {item.text}
              </Text>
            </View>
          )}
          ListFooterComponent={
            <>
              {typing && (
                <View
                  style={[
                    styles.bubble,
                    {
                      alignSelf: "flex-start",
                      backgroundColor: t.isDark ? "#3F3F46" : "#E4E4E7",
                    },
                  ]}
                >
                  <Text style={{ color: t.text }}>…</Text>
                </View>
              )}

              {/* Step UI blocks */}
              <Progress />

              {step === "age" && (
                <View style={{ marginTop: 6 }}>
                  <Text style={{ color: t.sub, marginBottom: 6 }}>
                    Enter age (years)
                  </Text>
                  <TextInput
                    value={input}
                    onChangeText={setInput}
                    placeholder="e.g., 28"
                    keyboardType="number-pad"
                    returnKeyType="send"
                    onSubmitEditing={onSubmitText}
                    placeholderTextColor={t.sub}
                    style={[
                      styles.input,
                      {
                        backgroundColor: t.card,
                        borderColor: t.border,
                        color: t.text,
                      },
                    ]}
                  />
                  <View style={{  gap: 8, marginTop: 8 }}>
                    <Button title="Send" onPress={onSubmitText} />
                    <Button title="Back" color="neutral" onPress={goPrev} />
                  </View>
                </View>
              )}

              {step === "sex" && (
                <View style={{ marginTop: 6 }}>
                  <Text style={{ color: t.sub, marginBottom: 6 }}>
                    Choose one
                  </Text>
                  <View
                    style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                  >
                    {SEXES.map((s) =>
                      chip(s[0].toUpperCase() + s.slice(1), sex === s, () => {
                        setSex(s);
                        userSay(s);
                        botSay(
                          "What symptoms do you have? Pick all that apply.",
                          "symptoms"
                        );
                      })
                    )}
                  </View>
                  <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                    <Button title="Back" color="neutral" onPress={goPrev} />
                  </View>
                </View>
              )}

              {step === "symptoms" && (
                <View style={{ marginTop: 6 }}>
                  <Text style={{ color: t.sub, marginBottom: 6 }}>
                    Tap to toggle symptoms — then Continue
                  </Text>
                  <View
                    style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                  >
                    {SYMPTOMS.map((s) =>
                      chip(s, selected.includes(s), () =>
                        setSelected((cur) =>
                          cur.includes(s)
                            ? cur.filter((x) => x !== s)
                            : [...cur, s]
                        )
                      )
                    )}
                  </View>
                  <View style={{  gap: 8, marginTop: 10 }}>
                    <Button
                      title={
                        canContinueSymptoms ? "Continue" : "Pick at least one"
                      }
                      onPress={() => {
                        if (!canContinueSymptoms) return;
                        userSay(selected.join(", "));
                        botSay(
                          "How many days have you felt this way?",
                          "duration"
                        );
                      }}
                      disabled={!canContinueSymptoms}
                    />
                    <Button title="Back" color="neutral" onPress={goPrev} />
                  </View>
                </View>
              )}

              {step === "duration" && (
                <View style={{ marginTop: 6 }}>
                  <Text style={{ color: t.sub, marginBottom: 6 }}>
                    Duration in days
                  </Text>
                  <TextInput
                    value={input}
                    onChangeText={setInput}
                    placeholder="e.g., 2"
                    keyboardType="number-pad"
                    returnKeyType="send"
                    onSubmitEditing={onSubmitText}
                    placeholderTextColor={t.sub}
                    style={[
                      styles.input,
                      {
                        backgroundColor: t.card,
                        borderColor: t.border,
                        color: t.text,
                      },
                    ]}
                  />
                  <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                    <Button title="sSesssnd" onPress={onSubmitText} />
                    <Button title="Back" color="neutral" onPress={goPrev} />
                  </View>
                </View>
              )}

              {step === "severity" && (
                <View style={{ marginTop: 6 }}>
                  <Text style={{ color: t.sub, marginBottom: 6 }}>
                    Pick severity
                  </Text>
                  <View
                    style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                  >
                    {SEVERITIES.map((s) =>
                      chip(
                        s[0].toUpperCase() + s.slice(1),
                        severity === s,
                        () => {
                          setSeverity(s);
                          userSay(s);
                          botSay(
                            "Any red flags? If unsure, pick none.",
                            "redflags"
                          );
                        }
                      )
                    )}
                  </View>
                  <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                    <Button title="Back" color="neutral" onPress={goPrev} />
                  </View>
                </View>
              )}

              {step === "redflags" && (
                <View style={{ marginTop: 6 }}>
                  <Text style={{ color: t.sub, marginBottom: 6 }}>
                    Toggle any that apply — then Continue
                  </Text>
                  <View
                    style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                  >
                    {RED_FLAGS.map((s) =>
                      chip(s, redFlags.includes(s), () =>
                        setRedFlags((cur) =>
                          cur.includes(s)
                            ? cur.filter((x) => x !== s)
                            : [...cur, s]
                        )
                      )
                    )}
                  </View>
                  <View style={{  gap: 8, marginTop: 10 }}>
                    <Button
                      title="None"
                      color="neutral"
                      onPress={() => {
                        setRedFlags([]);
                        userSay("None");
                        goConfirm();
                      }}
                    />
                    <Button
                      title="Continue"
                      onPress={() => {
                        userSay(redFlags.length ? redFlags.join(", ") : "None");
                        goConfirm();
                      }}
                    />
                    <Button title="Back" color="neutral" onPress={goPrev} />
                  </View>
                </View>
              )}

              {step === "confirm" && (
                <View style={{ marginTop: 6, gap: 8 }}>
                  <Button
                    title="Looks good — check"
                    color="success"
                    onPress={compute}
                  />
                  <View style={{  gap: 8 }}>
                    <Button
                      title="Change answers"
                      color="neutral"
                      onPress={() =>
                        botSay(
                          "Which would you like to change? You can navigate Back.",
                          "sex"
                        )
                      }
                    />
                    <Button title="Restart" color="warn" onPress={restart} />
                  </View>
                </View>
              )}
            </>
          }
        />

        {/* Footer after result */}
        {step === "result" && (
          <View
            style={{
              paddingHorizontal: space.lg,
              paddingBottom: space.lg,
              gap: 8,
            }}
          >
            <Button title="Start over" onPress={restart} />
            <Text style={{ color: t.sub, fontSize: 12, textAlign: "center" }}>
              Info only — not a diagnosis. Seek emergency care if symptoms
              worsen or red flags appear.
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}

function renderResult(res: ReturnType<typeof checkSymptoms>) {
  const lines: string[] = [];
  lines.push(`${res.headline} (${res.urgency.toUpperCase()})`);
  if (res.reasons.length) {
    lines.push("");
    lines.push("Why:");
    for (const r of res.reasons) lines.push(`• ${r}`);
  }
  if (res.likelyCauses.length) {
    lines.push("");
    lines.push("Possible causes:");
    for (const r of res.likelyCauses) lines.push(`• ${r}`);
  }
  if (res.selfCare.length) {
    lines.push("");
    lines.push("Self-care tips:");
    for (const r of res.selfCare) lines.push(`• ${r}`);
  }
  if (res.nextSteps.length) {
    lines.push("");
    lines.push("Next steps:");
    for (const r of res.nextSteps) lines.push(`• ${r}`);
  }
  lines.push("");
  lines.push(res.disclaimer);
  return lines.join("\n");
}

const styles = StyleSheet.create({
  bubble: {
    maxWidth: "85%",
    padding: 12,
    marginVertical: 6,
    borderRadius: 16,
  },
  input: {
    padding: 14,
    borderRadius: radius.xl,
    borderWidth: 1,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  progress: {
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 6,
  },
});
