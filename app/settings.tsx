import React from "react";
import { View, Text, Alert } from "react-native";
import Screen from "@/components/ui/Screen";
import { Header } from "@/components/ui/Header";
import Button from "@/components/ui/Button";
import * as Notifications from "expo-notifications";
import { useAuth } from "@/state/auth";
import { useAppTheme } from "@/theme/useTheme";
import { space } from "@/theme/tokens";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function Settings() {
  const setAuth = useAuth((s) => s.setAuth);
  const t = useAppTheme();

  const schedule = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted")
      return Alert.alert(
        "Permission required",
        "Enable notifications in settings."
      );
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Medicine Reminder",
        body: "Time to take your meds 💊",
      },
      trigger: { seconds: 5 },
    });
    Alert.alert("Scheduled", "You’ll get a reminder in 5 seconds.");
  };

  return (
    <Screen>
      <Header title="Settings" />
      <View style={{ padding: space.lg, gap: 10 }}>
        <Button title="Test Reminder" onPress={schedule} />
        <Button
          title="Log Out"
          color="neutral"
          onPress={() => setAuth(null, null)}
        />
        <Text style={{ color: t.sub, fontSize: 12 }}>
          Reminders support only. Always follow advice from licensed clinicians.
        </Text>
      </View>
    </Screen>
  );
}
