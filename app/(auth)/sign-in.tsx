import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Alert } from "react-native";
import Screen from "@/components/ui/Screen";
import { Header } from "@/components/ui/Header";
import Button from "@/components/ui/Button";
import { useAppTheme } from "@/theme/useTheme";
import { useAuth } from "@/state/auth";
import { apiSignIn } from "@/lib/apiClient";
import { Link, useRouter } from "expo-router";
import { radius, space } from "@/theme/tokens";

export default function SignIn() {
  const t = useAppTheme();
  const setAuth = useAuth((s) => s.setAuth);
  const router = useRouter();
  const [email, setEmail] = useState("rich@example.com");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);
  const input = [styles.input, { backgroundColor: t.card, borderColor: t.border, color: t.text }];

  const submit = async () => {
    if (!email || !password) return Alert.alert("Missing info", "Enter email & password.");
    try { setLoading(true);
      const { token, user } = await apiSignIn(email, password);
      await setAuth(token, user);
      router.replace("/");
    } catch (e: any) { Alert.alert("Sign in failed", e.message || String(e)); }
    finally { setLoading(false); }
  };

  return (
    <Screen>
      <Header title="Sign In" />
      <View style={styles.wrap}>
        <TextInput placeholder="Email" placeholderTextColor={t.sub} value={email} onChangeText={setEmail}
          autoCapitalize="none" keyboardType="email-address" style={input} />
        <TextInput placeholder="Password" placeholderTextColor={t.sub} value={password} onChangeText={setPassword}
          secureTextEntry style={input} />
        <Button title={loading ? "Signing in..." : "Sign In"} onPress={submit} />
        <Link href="/(auth)/register"><Text style={[styles.link, { color: t.sub }]}>No account? Register</Text></Link>
      </View>
    </Screen>
  );
}
const styles = StyleSheet.create({
  wrap: { padding: space.lg, gap: 10 },
  input: { padding: 14, borderRadius: radius.xl, borderWidth: StyleSheet.hairlineWidth },
  link: { textAlign: "center", marginTop: 8 }
});

