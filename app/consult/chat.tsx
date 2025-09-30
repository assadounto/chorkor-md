import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import Screen from "@/components/ui/Screen";
import { Header } from "@/components/ui/Header";
import { useLocalSearchParams } from "expo-router";
import { useAppTheme } from "@/theme/useTheme";
import { radius, space } from "@/theme/tokens";

type Msg = { id: string; from: "me" | "doc"; text: string };

export default function Chat() {
  const { doctor } = useLocalSearchParams<{ doctor?: string }>();
  const t = useAppTheme();
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      id: "1",
      from: "doc",
      text: `Hi, I'm ${doctor || "your doctor"}. How can I help today?`,
    },
  ]);

  const send = () => {
    if (!text.trim()) return;
    setMsgs((m) => [
      ...m,
      { id: Math.random().toString(36).slice(2), from: "me", text },
    ]);
    setText("");
  };

  return (
    <Screen>
      <Header title={`Chat — ${doctor || "Doctor"}`} />
      <FlatList
        style={{ flex: 1, padding: space.lg }}
        data={msgs}
        keyExtractor={(i) => i.id}
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
      />
      <View
        style={{
          padding: space.md,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: t.border,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Type a message"
            placeholderTextColor={t.sub}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: radius.md,
              backgroundColor: t.card,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: t.border,
              color: t.text,
            }}
          />
          <TouchableOpacity
            onPress={send}
            style={{
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: radius.xl,
              backgroundColor: t.success,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  bubble: { maxWidth: "80%", padding: 12, marginVertical: 6, borderRadius: 16 },
});
