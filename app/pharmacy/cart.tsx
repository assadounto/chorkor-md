import React, { useMemo } from "react";
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
import { useCart } from "@/state/cart";
import { useAppTheme } from "@/theme/useTheme";
import { radius, space } from "@/theme/tokens";
import { Link, router } from "expo-router";

function formatGHS(n: number) {
  try {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `GHS ${n.toFixed(2)}`;
  }
}

export default function Cart() {
  const t = useAppTheme();
  const { items, inc, dec, remove, total, clear } = useCart();

  const data = useMemo(() => items ?? [], [items]);
  const grandTotal = useMemo(() => total(), [items]);

const checkout = () => {
  if (items.length === 0) return;
  router.push("/pharmacy/checkout"); // now goes to the delivery form + COD
};
  const ListHeader = () => (
    <View style={{ paddingHorizontal: space.lg, paddingTop: space.lg }}>
      <Text style={{ color: t.text, fontWeight: "800", fontSize: 18 }}>
        Your Cart
      </Text>
      <Text style={{ color: t.sub, marginTop: 4, fontSize: 12 }}>
        Review items, adjust quantities, or remove. Prices are for demo.
      </Text>
    </View>
  );

  const Empty = () => (
    <View
      style={[styles.empty, { borderColor: t.border, backgroundColor: t.card }]}
    >
      <Text style={{ color: t.text, fontWeight: "800", fontSize: 16 }}>
        Your cart is empty
      </Text>
      <Text style={{ color: t.sub, marginTop: 6, textAlign: "center" }}>
        Add items from the Pharmacy to see them here.
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
      <Header title="Cart" />
      <FlatList
        data={data}
        keyExtractor={(i) => i.id}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={{ paddingBottom: 96 }}
        renderItem={({ item: i }) => (
          <View style={{ paddingHorizontal: space.lg, marginTop: 12 }}>
            <Card
              title={i.name}
              subtitle={`Unit price: ${formatGHS(i.price)}`}
              style={{
                borderColor: t.border,
                borderWidth: StyleSheet.hairlineWidth,
              }}
            >
              <View style={{ gap: 10 }}>
                {/* qty row */}
                <View style={styles.row}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Button
                      title="–"
                      color="neutral"
                      fullWidth={false}
                      onPress={() => dec(i.id)}
                    />
                    <Text
                      style={{
                        color: t.text,
                        minWidth: 28,
                        textAlign: "center",
                        fontWeight: "800",
                      }}
                    >
                      {i.qty}
                    </Text>
                    <Button
                      title="+"
                      color="neutral"
                      fullWidth={false}
                      onPress={() => inc(i.id)}
                    />
                  </View>
                  <Text style={{ color: t.text, fontWeight: "800" }}>
                    {formatGHS((i.price ?? 0) * (i.qty ?? 1))}
                  </Text>
                </View>

                {/* remove link */}
                <View
                  style={{ flexDirection: "row", justifyContent: "flex-end" }}
                >
                  <Pressable onPress={() => remove(i.id)}>
                    <Text style={{ color: t.warn, fontWeight: "700" }}>
                      Remove
                    </Text>
                  </Pressable>
                </View>
              </View>
            </Card>
          </View>
        )}
        ListEmptyComponent={
          <View style={{ padding: space.lg }}>
            <Empty />
          </View>
        }
      />

      {/* sticky checkout bar */}
      <View
        style={[
          styles.bar,
          { backgroundColor: t.card, borderTopColor: t.border },
        ]}
      >
        <View style={{ gap: 2 }}>
          <Text style={{ color: t.sub, fontSize: 12, fontWeight: "700" }}>
            Total
          </Text>
          <Text style={{ color: t.text, fontSize: 20, fontWeight: "800" }}>
            {formatGHS(grandTotal)}
          </Text>
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Button
            title="Clear"
            color="neutral"
            fullWidth={false}
            onPress={clear}
          />
          <Button
            title="Checkout"
            color="success"
            fullWidth={false}
            onPress={checkout}
            disabled={data.length === 0}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: space.lg,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  empty: {
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.xl,
    alignItems: "center",
  },
});
