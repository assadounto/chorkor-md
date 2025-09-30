import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import Screen from "@/components/ui/Screen";
import { Header } from "@/components/ui/Header";
import { useAppTheme } from "@/theme/useTheme";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { apiDoctors } from "@/lib/apiClient";
import { useQuery } from "@tanstack/react-query";
import { Link } from "expo-router";
import { space } from "@/theme/tokens";

export default function ConsultIndex() {
  const t = useAppTheme();
  const { data } = useQuery({ queryKey: ["doctors"], queryFn: apiDoctors });

  return (
    <Screen>
      <Header title="Consult a Doctor" />
      <View style={{ padding: space.lg }}>
        <Text style={{ color: t.sub, marginBottom: 8 }}>Available Doctors</Text>
        <FlatList
          data={data || []}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <Card
              title={item.name}
              subtitle={`${item.speciality} • ${item.city} • ⭐ ${item.rating}`}
              style={{ marginBottom: 12 }}
            >
              <View style={{ flexDirection: "row", gap: 10, marginTop: 6 }}>
                <Link
                  href={`/consult/chat?doctor=${encodeURIComponent(item.name)}`}
                  asChild
                >
                  <Button title="Chat" />
                </Link>
                <Link
                  href={`/consult/call?doctor=${encodeURIComponent(item.name)}`}
                  asChild
                >
                  <Button title="Call" color="success" />
                </Link>
                <Button title="Book" color="purple" />
              </View>
            </Card>
          )}
        />
      </View>
    </Screen>
  );
}
