import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import Screen from "@/components/ui/Screen";
import { Header } from "@/components/ui/Header";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useCart } from "@/state/cart";
import { useQuery } from "@tanstack/react-query";
import { apiMedicines } from "@/lib/apiClient";
import { Link } from "expo-router";
import { useAppTheme } from "@/theme/useTheme";
import { space } from "@/theme/tokens";

export default function Pharmacy() {
  const add = useCart((s) => s.add);
  const { data } = useQuery({ queryKey: ["meds"], queryFn: apiMedicines });
  const t = useAppTheme();

  return (
    <Screen>
      <Header title="Pharmacy" />
      <FlatList
        data={data || []}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: space.lg, gap: 12 }}
        renderItem={({ item }) => (
          <Card title={item.name} subtitle={`GHS ${item.price.toFixed(2)}`}>
            <Button title="Add to cart" onPress={() => add(item)} />
          </Card>
        )}
        ListFooterComponent={() => (
          <View style={{ marginTop: 8 }}>
            <Link href="/pharmacy/cart" asChild>
              <Button title="Go to cart" color="success" />
            </Link>
          </View>
        )}
      />
    </Screen>
  );
}
