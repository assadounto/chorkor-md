import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
} from "react-native";
import Screen from "@/components/ui/Screen";
import { Header } from "@/components/ui/Header";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useOrders } from "@/state/orders";
import { useAppTheme } from "@/theme/useTheme";
import { radius, space } from "@/theme/tokens";
import { Link } from "expo-router";

const FILTERS = ["All", "Pending", "Delivered", "Cancelled"] as const;

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

export default function Orders() {
  const t = useAppTheme();
  const { orders, hydrate, hydrated, clearAll } = useOrders();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrated, hydrate]);

  const data = useMemo(() => {
    const list = [...orders].sort((a, b) => b.createdAt - a.createdAt);
    if (filter === "All") return list;
    const f = filter.toLowerCase();
    return list.filter((o) => o.status === f);
  }, [orders, filter]);

  const ListHeader = () => (
    <View
      style={{ paddingHorizontal: space.lg, paddingTop: space.lg, gap: 12 }}
    >
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {FILTERS.map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[
              styles.chip,
              {
                backgroundColor:
                  filter === f ? t.brand : t.isDark ? "#3F3F46" : "#E5E7EB",
              },
            ]}
          >
            <Text
              style={{
                color: filter === f ? "#fff" : "#111827",
                fontWeight: "700",
              }}
            >
              {f}
            </Text>
          </Pressable>
        ))}
      </View>
      {orders.length > 0 ? (
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Button
            title="Clear all (demo)"
            color="neutral"
            fullWidth={false}
            onPress={() =>
              Alert.alert(
                "Clear all orders?",
                "This deletes local order history.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Clear",
                    style: "destructive",
                    onPress: () => clearAll(),
                  },
                ]
              )
            }
          />
        </View>
      ) : null}
    </View>
  );

  const Empty = () => (
    <View
      style={[styles.empty, { borderColor: t.border, backgroundColor: t.card }]}
    >
      <Text style={{ color: t.text, fontWeight: "800", fontSize: 16 }}>
        No orders yet
      </Text>
      <Text style={{ color: t.sub, marginTop: 6, textAlign: "center" }}>
        Place an order from the Pharmacy to see it here.
      </Text>
      <Link href="/(tabs)/pharmacy" asChild>
        <Button
          title="Go to Pharmacy"
          color="success"
          style={{ marginTop: 10 }}
        />
      </Link>
    </View>
  );

  return (
    <Screen edges={["top", "left", "right"]}>
      <Header title="Orders" />
      <FlatList
        data={data}
        keyExtractor={(o) => o.id}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          <View style={{ padding: space.lg }}>
            <Empty />
          </View>
        }
        renderItem={({ item: o }) => (
          <View style={{ paddingHorizontal: space.lg, marginTop: 12 }}>
            <Link
              href={{ pathname: "/orders/[id]", params: { id: o.id } }}
              asChild
            >
              <Pressable>
                <Card
                  title={`${o.id}`}
                  subtitle={`${formatDate(o.createdAt)} • ${o.delivery.city}`}
                  style={{
                    borderColor: t.border,
                    borderWidth: StyleSheet.hairlineWidth,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <View style={{ gap: 4 }}>
                      <Text style={{ color: t.text, fontWeight: "800" }}>
                        {formatGHS(o.total)}
                      </Text>
                      <Text style={{ color: t.sub, fontSize: 12 }}>
                        {o.items.length} item{o.items.length > 1 ? "s" : ""}
                      </Text>
                    </View>
                    <StatusBadge status={o.status} />
                  </View>
                </Card>
              </Pressable>
            </Link>
          </View>
        )}
      />
    </Screen>
  );
}

function StatusBadge({
  status,
}: {
  status: "pending" | "delivered" | "cancelled";
}) {
  const t = useAppTheme();
  const theme =
    status === "pending"
      ? {
          bg: t.isDark ? "#083344" : "#E0F2FE",
          fg: t.isDark ? "#7DD3FC" : "#075985",
          label: "Pending",
        }
      : status === "delivered"
      ? {
          bg: t.isDark ? "#0B5032" : "#DCFCE7",
          fg: t.isDark ? "#86EFAC" : "#166534",
          label: "Delivered",
        }
      : {
          bg: t.isDark ? "#4C0519" : "#FEE2E2",
          fg: t.isDark ? "#FCA5A5" : "#991B1B",
          label: "Cancelled",
        };
  return (
    <View
      style={{
        backgroundColor: theme.bg,
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 999,
      }}
    >
      <Text style={{ color: theme.fg, fontWeight: "800", fontSize: 12 }}>
        {theme.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  empty: {
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.xl,
    alignItems: "center",
  },
});
