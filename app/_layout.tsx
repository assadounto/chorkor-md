import { Stack } from "expo-router";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import "./global.css";
import { useColorScheme } from "react-native";
import { MMKV } from "react-native-mmkv";

export const storage = new MMKV();
const queryClient = new QueryClient();

export default function RootLayout() {
  const scheme = useColorScheme();
  useEffect(() => {}, []);
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  );
}
