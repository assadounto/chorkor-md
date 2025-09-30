import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import Screen from "@/components/ui/Screen";
import { Header } from "@/components/ui/Header";
import { Link } from "expo-router";
import Button from "@/components/ui/Button";
import { useAuth } from "@/state/auth";
import { useAppTheme } from "@/theme/useTheme";
import { space, radius } from "@/theme/tokens";

export default function Home() {
  const { user } = useAuth();
  const t = useAppTheme();

  return (
    <Screen>
      <Header title="Chorkor Mobile Doctor" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.h1, { color: t.text }]}>
          Your trusted healthcare companion
        </Text>
        <Text style={[styles.body, { color: t.sub }]}>
          Get medical advice, order medicines, and track your health — all in
          one place.
        </Text>

        <View style={styles.grid}>
          <Link href="/symptom-checker" asChild>
            <Button title="Symptom Checker" color="brand" />
          </Link>
          <Link href="/consult" asChild>
            <Button title="Consult a Doctor" color="success" />
          </Link>
          <Link href="/pharmacy" asChild>
            <Button title="Pharmacy & Orders" color="warn" />
          </Link>
          <Link href="/tracker" asChild>
            <Button title="Health Tracker" color="purple" />
          </Link>
        </View>

        <Text style={[styles.note, { color: t.sub }]}>
          *Info only. Not a diagnosis. In emergencies, call local services.
        </Text>

        {!user && (
          <View style={{ marginTop: space.lg }}>
            <Link href="/auth/register" asChild>
              <Button title="Create account" color="neutral" />
            </Link>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
const styles = StyleSheet.create({
  container: { padding: space.lg },
  h1: { fontSize: 24, fontWeight: "800" },
  body: { marginTop: 8, fontSize: 16, lineHeight: 22 },
  grid: { marginTop: 24, gap: 12 },
  note: { marginTop: 24, fontSize: 12 },
});
