import { useLocalSearchParams } from "expo-router";
import Screen from "@/components/ui/Screen";
import { Header } from "@/components/ui/Header";
import { View, Text, TouchableOpacity, Alert } from "react-native";

export default function Call() {
  const { doctor } = useLocalSearchParams<{ doctor?: string }>();
  const start = () => Alert.alert("Coming soon", "Video/voice calling will be integrated here (e.g., WebRTC/SDK).");
  return (
    <Screen>
      <Header title={`Call — ${doctor || "Doctor"}`} />
      <View className="p-6 gap-3">
        <Text className="text-zinc-700 dark:text-zinc-300">This is a stub for voice/video consultations.</Text>
        <TouchableOpacity onPress={start} className="p-4 rounded-2xl bg-emerald-600">
          <Text className="text-white text-center">Start Call</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}
