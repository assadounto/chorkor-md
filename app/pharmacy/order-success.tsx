import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Screen from "@/components/ui/Screen";
import { Header } from "@/components/ui/Header";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useLocalSearchParams, Link } from "expo-router";
import { useAppTheme } from "@/theme/useTheme";
import { radius, space } from "@/theme/tokens";

export default function OrderSuccess() {
  const t = useAppTheme();
  const { id, total } = useLocalSearchParams<{ id?: string; total?: string }>();

  return (
    <Screen edges={["top", "left", "right"]}>
      <Header title="Order placed 🎉" />
      <View style={{ padding: space.lg, gap: 12 }}>
        <Card title="Thank you!" subtitle="We’ll deliver soon">
          <Text style={{ color: t.text }}>
            Your order <Text style={{ fontWeight: "800" }}>{id}</Text> was
            placed successfully.
          </Text>
          <Text style={{ color: t.text, marginTop: 4 }}>
            Payment method:{" "}
            <Text style={{ fontWeight: "800" }}>Cash on Delivery</Text>
          </Text>
          {total ? (
            <Text style={{ color: t.sub, marginTop: 2 }}>
              Amount due on delivery: GHS {Number(total).toFixed(2)}
            </Text>
          ) : null}
          <Text style={{ color: t.sub, fontSize: 12, marginTop: 8 }}>
            Our rider will call the phone number you provided before arrival.
          </Text>
        </Card>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <Link href="/(tabs)/pharmacy" asChild>
            <Button title="Back to Pharmacy" color="success" />
          </Link>
          <Link href="/(tabs)/tracker" asChild>
            <Button title="Log health reading" color="neutral" />
          </Link>
        </View>
      </View>
    </Screen>
  );
}
