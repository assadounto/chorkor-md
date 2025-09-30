import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/state/auth";

export function Header({ title }: { title: string }) {
  const router = useRouter();
  const { user } = useAuth();
  return (
    <View className="flex-row items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
      <Text className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{title}</Text>
      <TouchableOpacity onPress={() => router.push(user ? "/settings" : "/auth/sign-in")}
        className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
        <Text className="text-zinc-700 dark:text-zinc-200">{user ? "Settings" : "Sign In"}</Text>
      </TouchableOpacity>
    </View>
  );
}
