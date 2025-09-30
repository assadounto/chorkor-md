import React, { useEffect, useMemo } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import Screen from "@/components/ui/Screen";
import { Header } from "@/components/ui/Header";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAppTheme } from "@/theme/useTheme";
import { radius, space } from "@/theme/tokens";
import { useOrders } from "@/state/orders";
import { useLocalSearchParams, useRouter } from "expo-router";

function formatGHS(n: number) {
  try {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
    }).format(n);
  } catch {
    return `GHS ${n.toFixed(2)}`;
  }
}
function formatDate(ts: number) {
  try {
    return new Intl.DateTimeFormat("en-GH", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(ts);
  } catch {
    return new Date(ts).toLocaleString();
  }
}

export default function OrderDetail() {
  const t = useAppTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { orders, hydrate, hydrated, getById, updateStatus } = useOrders();

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrated, hydrate]);

  const order = useMemo(() => (id ? getById(id) : undefined), [orders, id]);

  if (!order) {
    return (
      <Screen edges={["top", "left", "right"]}>
        <Header title="Order" />
        <View style={{ padding: space.lg }}>
          <Text style={{ color: t.sub }}>Order not found.</Text>
          <Button
            title="Back"
            color="neutral"
            onPress={() => router.back()}
            style={{ marginTop: 10 }}
          />
        </View>
      </Screen>
    );
  }

  const canDeliver = order.status === "pending";
  const canCancel = order.status === "pending";

  const markDelivered = () => {
    Alert.alert("Mark as delivered?", "This will set the order to Delivered.", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        onPress: async () => {
          await updateStatus(order.id, "delivered");
        },
      },
    ]);
  };
  const cancelOrder = () => {
    Alert.alert("Cancel order?", "This will set the order to Cancelled.", [
      { text: "Keep", style: "cancel" },
      {
        text: "Cancel",
        style: "destructive",
        onPress: async () => {
          await updateStatus(order.id, "cancelled");
        },
      },
    ]);
  };

  return (
    <Screen edges={["top", "left", "right"]}>
      <Header title={order.id} />
      <View style={{ padding: space.lg, gap: 12 }}>
        <Card title="Summary" subtitle={formatDate(order.createdAt)}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={{ color: t.sub }}>Payment</Text>
            <Text style={{ color: t.text, fontWeight: "800" }}>
              {order.paymentMethod === "COD"
                ? "Cash on Delivery"
                : order.paymentMethod}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 6,
            }}
          >
            <Text style={{ color: t.sub }}>Status</Text>
            <Text
              style={{
                color: t.text,
                fontWeight: "800",
                textTransform: "capitalize",
              }}
            >
              {order.status}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 6,
            }}
          >
            <Text style={{ color: t.sub }}>Total</Text>
            <Text style={{ color: t.text, fontWeight: "800" }}>
              {formatGHS(order.total)}
            </Text>
          </View>
        </Card>

        <Card title="Delivery">
          <Text style={{ color: t.text, fontWeight: "800" }}>
            {order.delivery.name}
          </Text>
          <Text style={{ color: t.text, marginTop: 2 }}>
            {order.delivery.phone}
          </Text>
          <Text style={{ color: t.text, marginTop: 2 }}>
            {order.delivery.address1}
          </Text>
          {order.delivery.address2 ? (
            <Text style={{ color: t.text }}>{order.delivery.address2}</Text>
          ) : null}
          <Text style={{ color: t.text }}>{order.delivery.city}</Text>
          {order.delivery.notes ? (
            <Text style={{ color: t.sub, marginTop: 6 }}>
              Notes: {order.delivery.notes}
            </Text>
          ) : null}
        </Card>

        <Card title={`Items (${order.items.length})`}>
          <View style={{ gap: 10 }}>
            {order.items.map((it) => (
              <View key={it.id} style={[styles.row, { borderColor: t.border }]}>
                <Text style={{ color: t.text, flex: 1 }}>{it.name}</Text>
                <Text style={{ color: t.sub, width: 40, textAlign: "right" }}>
                  ×{it.qty}
                </Text>
                <Text
                  style={{
                    color: t.text,
                    width: 90,
                    textAlign: "right",
                    fontWeight: "800",
                  }}
                >
                  {formatGHS(it.price * it.qty)}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        <View style={{ flexDirection: "row", gap: 10 }}>
          {canDeliver && (
            <Button
              title="Mark delivered"
              color="success"
              onPress={markDelivered}
            />
          )}
          {canCancel && (
            <Button title="Cancel order" color="warn" onPress={cancelOrder} />
          )}
          <Button title="Back" color="neutral" onPress={() => router.back()} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
