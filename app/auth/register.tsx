import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import Screen from "@/components/ui/Screen";
import { Header } from "@/components/ui/Header";
import { apiRegister } from "@/lib/apiClient";
import { useAuth } from "@/state/auth";
import { useRouter } from "expo-router";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuth = useAuth((s) => s.setAuth);
  const router = useRouter();

  const submit = async () => {
    if (!name || !email || !password) return Alert.alert("Missing info", "Fill all fields.");
    try {
      setLoading(true);
      const { token, user } = await apiRegister(name, email, password);
      setAuth(token, user);
      router.replace("/");
    } catch (e: any) { Alert.alert("Register failed", e.message || String(e)); }
    finally { setLoading(false); }
  };

  return (
    <Screen>
      <Header title="Register" />
      <View className="p-5 gap-3">
        <TextInput placeholder="Name" value={name} onChangeText={setName}
          className="p-4 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100" />
        <TextInput placeholder="Email" value={email} onChangeText={setEmail}
          autoCapitalize="none" keyboardType="email-address"
          className="p-4 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100" />
        <TextInput placeholder="Password" value={password} onChangeText={setPassword}
          secureTextEntry
          className="p-4 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100" />
        <TouchableOpacity disabled={loading} onPress={submit} className="p-4 rounded-2xl bg-brand">
          <Text className="text-white text-center">{loading ? "Creating..." : "Create Account"}</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}
