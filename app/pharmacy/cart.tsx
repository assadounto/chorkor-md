import React from "react";
import { View, Text } from "react-native";
import Screen from "@/components/ui/Screen";
import { Header } from "@/components/ui/Header";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useCart } from "@/state/cart";
import { apiCheckout } from "@/lib/apiClient";
import { useAppTheme } from "@/theme/useTheme";
import { space } from "@/theme/tokens";

export default function Cart() {
  const { items, inc, dec, total, clear } = useCart();
  const t = useAppTheme();

  const checkout = async () => {
    if (items.length === 0) return;
    const res = await apiCheckout({
      items,
      total: total(),
      currency: "GHS",
      method: "PaystackOrMoMo",
    });
    alert(`Reference: ${res.reference}\nURL: ${res.checkout_url}`);
    clear();
  };

  return (
    <Screen>
      <Header title="Your Cart" />
      <View style={{ padding: space.lg, gap: 12 }}>
        {items.length === 0 ? (
          <Text style={{ color: t.sub }}>Your cart is empty.</Text>
        ) : (
          <>
            {items.map((i) => (
              <Card
                key={i.id}
                title={i.name}
                subtitle={`GHS ${i.price.toFixed(2)}`}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    marginTop: 8,
                  }}
                >
                  <Button title="–" color="neutral" onPress={() => dec(i.id)} />
                  <Text
                    style={{ color: t.text, minWidth: 24, textAlign: "center" }}
                  >
                    {i.qty}
                  </Text>
                  <Button title="+" color="neutral" onPress={() => inc(i.id)} />
                </View>
              </Card>
            ))}
            <Text style={{ color: t.text, fontWeight: "800", fontSize: 18 }}>
              Total: GHS {total().toFixed(2)}
            </Text>
            <Button title="Checkout (stub)" onPress={checkout} />
            <Button title="Clear cart" color="neutral" onPress={clear} />
          </>
        )}
      </View>
    </Screen>
  );
}
