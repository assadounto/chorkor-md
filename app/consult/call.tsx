import React from "react";
import { useLocalSearchParams } from "expo-router";
import Screen from "@/components/ui/Screen";
import { Header } from "@/components/ui/Header";
import { View, Text, Alert } from "react-native";
import Button from "@/components/ui/Button";
import { useAppTheme } from "@/theme/useTheme";
import { space } from "@/theme/tokens";

export default function Call() {
  const { doctor } = useLocalSearchParams<{ doctor?: string }>();
  const t = useAppTheme();
  const start = () =>
    Alert.alert(
      "Coming soon",
      "Video/voice calling will be integrated here (e.g., WebRTC/SDK)."
    );

  return (
    <Screen>
      <Header title={`Call — ${doctor || "Doctor"}`} />
      <View style={{ padding: space.lg }}>
        <Text style={{ color: t.sub, marginBottom: 8 }}>
          This is a stub for voice/video consultations.
        </Text>
        <Button title="Start Call" color="success" onPress={start} />
      </View>
    </Screen>
  );
}
