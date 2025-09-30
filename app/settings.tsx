import { View, Text, TouchableOpacity, Alert } from "react-native";
import Screen from "@/components/ui/Screen";
import { Header } from "@/components/ui/Header";
import * as Notifications from "expo-notifications";
import { apiLogout } from "@/lib/apiClient";
import { useAuth } from "@/state/auth";
import { useRouter } from "expo-router";

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: false })
});

export default function Settings() {
  const router = useRouter();
  const setAuth = useAuth((s) => s.setAuth);

  const schedule = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") return Alert.alert("Permission required", "Enable notifications in settings.");
    await Notifications.scheduleNotificationAsync({
      content: { title: "Medicine Reminder", body: "Time to take your meds 💊" },
      trigger: { seconds: 5 }
    });
    Alert.alert("Scheduled", "You’ll get a reminder in 5 seconds.");
  };

  const logout = async () => {
    await apiLogout();
    setAuth(null, null);
    router.replace("/");
  };

  return (
    <Screen>
      <Header title="Settings" />
      <View className="p-5 gap-3">
        <TouchableOpacity onPress={schedule} className="p-4 rounded-2xl bg-brand">
          <Text className="text-white text-center">Test Reminder</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={logout} className="p-4 rounded-2xl bg-zinc-200 dark:bg-zinc-700">
          <Text style={{ textAlign: "center", color: "#18181b" }}>Log Out</Text>
        </TouchableOpacity>

        <Text className="text-xs text-zinc-500">Reminders are supportive only. Always follow advice from licensed clinicians.</Text>
      </View>
    </Screen>
  );
}
