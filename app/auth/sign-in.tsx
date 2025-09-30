import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import Screen from "@/components/ui/Screen";
import { Header } from "@/components/ui/Header";
import { apiSignIn } from "@/lib/apiClient";
import { useAuth } from "@/state/auth";
import { Link, useRouter } from "expo-router";

export default function SignIn() {
  const [email, setEmail] = useState("rich@example.com");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuth((s) => s.setAuth);

  const submit = async () => {
    if (!email || !password) return Alert.alert("Missing info", "Enter email & password.");
    try {
      setLoading(true);
      const { token, user } = await apiSignIn(email, password);
      setAuth(token, user);
      router.replace("/");
    } catch (e: any) {
      Alert.alert("Sign in failed", e.message || String(e));
    } finally { setLoading(false); }
  };

  return (
    <Screen>
      <Header title="Sign In" />
      <View className="p-5 gap-3">
        <TextInput placeholder="Email" value={email} onChangeText={setEmail}
          autoCapitalize="none" keyboardType="email-address"
          className="p-4 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100" />
        <TextInput placeholder="Password" value={password} onChangeText={setPassword}
          secureTextEntry
          className="p-4 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100" />
        <TouchableOpacity disabled={loading} onPress={submit} className="p-4 rounded-2xl bg-brand">
          <Text className="text-white text-center">{loading ? "Signing in..." : "Sign In"}</Text>
        </TouchableOpacity>
        <Link href="/auth/register"><Text className="text-center text-zinc-600 dark:text-zinc-300 mt-2">No account? Register</Text></Link>
      </View>
    </Screen>
  );
}
