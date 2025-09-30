import React, { useState } from "react";
import { View, TextInput, StyleSheet, Alert } from "react-native";
import Screen from "@/components/ui/Screen";
import { Header } from "@/components/ui/Header";
import Button from "@/components/ui/Button";
import { useAppTheme } from "@/theme/useTheme";
import { useAuth } from "@/state/auth";
import { apiRegister } from "@/lib/apiClient";
import { useRouter } from "expo-router";
import { radius, space } from "@/theme/tokens";

export default function Register() {
  const t = useAppTheme();
  const setAuth = useAuth((s) => s.setAuth);
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const input = [styles.input, { backgroundColor: t.card, borderColor: t.border, color: t.text }];

  const submit = async () => {
    if (!name || !email || !password) return Alert.alert("Missing info", "Fill all fields.");
    try { setLoading(true);
      const { token, user } = await apiRegister(name, email, password);
      await setAuth(token, user);
      router.replace("/");
    } catch (e: any) { Alert.alert("Register failed", e.message || String(e)); }
    finally { setLoading(false); }
  };

  return (
    <Screen>
      <Header title="Create Account" />
      <View style={styles.wrap}>
        <TextInput placeholder="Name" placeholderTextColor={t.sub} value={name} onChangeText={setName} style={input} />
        <TextInput placeholder="Email" placeholderTextColor={t.sub} value={email} onChangeText={setEmail}
          autoCapitalize="none" keyboardType="email-address" style={input} />
        <TextInput placeholder="Password" placeholderTextColor={t.sub} value={password} onChangeText={setPassword}
          secureTextEntry style={input} />
        <Button title={loading ? "Creating..." : "Register"} onPress={submit} />
      </View>
    </Screen>
  );
}
const styles = StyleSheet.create({
  wrap: { padding: space.lg, gap: 10 },
  input: { padding: 14, borderRadius: radius.xl, borderWidth: StyleSheet.hairlineWidth }
});

