import { useLocalSearchParams } from "expo-router";
import Screen from "@/components/ui/Screen";
import { Header } from "@/components/ui/Header";
import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList } from "react-native";

type Msg = { id: string; from: "me" | "doc"; text: string };

export default function Chat() {
  const { doctor } = useLocalSearchParams<{ doctor?: string }>();
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: "1", from: "doc", text: `Hi, I'm ${doctor || "your doctor"}. How can I help today?` }
  ]);

  const send = () => {
    if (!text.trim()) return;
    const newMsgs = [...msgs, { id: Math.random().toString(36).slice(2), from: "me", text }];
    setMsgs(newMsgs);
    setText("");
  };

  return (
    <Screen>
      <Header title={`Chat — ${doctor || "Doctor"}`} />
      <FlatList
        className="flex-1 p-4"
        data={msgs}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View className={`max-w-[80%] p-3 my-1 rounded-2xl ${item.from === "me" ? "self-end bg-brand" : "self-start bg-zinc-200 dark:bg-zinc-700"}`}>
            <Text className={`${item.from === "me" ? "text-white" : "text-zinc-900 dark:text-zinc-100"}`}>{item.text}</Text>
          </View>
        )}
      />
      <View className="p-3 border-t border-zinc-200 dark:border-zinc-800">
        <View className="flex-row items-center gap-2">
          <TextInput value={text} onChangeText={setText} placeholder="Type a message"
            className="flex-1 p-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100" />
          <TouchableOpacity onPress={send} className="px-4 py-3 rounded-xl bg-emerald-600"><Text className="text-white">Send</Text></TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
}
