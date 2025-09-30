// app/_layout.tsx
import {
  Stack,
  useRouter,
  useSegments,
  useRootNavigationState,
} from "expo-router";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { useAuth } from "@/state/auth";
import * as Notifications from "expo-notifications";
import { useTracker } from "@/state/tracker";
import { useReminders } from "@/state/reminders";
import { SafeAreaProvider } from "react-native-safe-area-context";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const queryClient = new QueryClient();

export default function RootLayout() {
  const scheme = useColorScheme();
  const segments = useSegments();
  const router = useRouter();
  const navState = useRootNavigationState();

  const { token, hydrated, hydrate } = useAuth();

  // Optional: hydrate other stores on boot
  const { hydrate: hydrateTracker } = useTracker();
  const { hydrate: hydrateReminders, reconcileOnLaunch } = useReminders();

  useEffect(() => {
    hydrate();
  }, [hydrate]);
  useEffect(() => {
    hydrateTracker();
    hydrateReminders().then(() => reconcileOnLaunch());
  }, []);

  useEffect(() => {
    if (!navState?.key || !hydrated) return;
    const inAuthGroup = segments[0] === "(auth)";
    if (token && inAuthGroup) router.replace("/");
    else if (!token && !inAuthGroup) router.replace("/(auth)/sign-in");
  }, [navState?.key, hydrated, segments, token]);

  if (!navState?.key || !hydrated) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style={scheme === "dark" ? "light" : "dark"} />
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
