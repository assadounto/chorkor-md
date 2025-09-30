import React from "react";
import { View, Text } from "react-native";
import Screen from "@/components/ui/Screen";
import { Header } from "@/components/ui/Header";
import Button from "@/components/ui/Button";
import { useAuth } from "@/state/auth";
import { useAppTheme } from "@/theme/useTheme";
import { space } from "@/theme/tokens";

export default function Settings() {
  const { signOut } = useAuth();
  const t = useAppTheme();
  return (
    <Screen>
      <Header title="Settings" />
      <View style={{ padding: space.lg, gap: 10 }}>
        <Button title="Log Out" color="neutral" onPress={() => signOut()} />
        <Text style={{ color: t.sub, fontSize: 12 }}>
          Reminders support only. Always follow advice from licensed clinicians.
        </Text>
      </View>
    </Screen>
  );
}

