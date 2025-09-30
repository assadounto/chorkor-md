import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import Screen from "@/components/ui/Screen";
import { Header } from "@/components/ui/Header";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAppTheme } from "@/theme/useTheme";
import { radius, space } from "@/theme/tokens";
import { useCart } from "@/state/cart";
import { useOrders } from "@/state/orders";
import { useRouter } from "expo-router";

function formatGHS(n: number) {
  try {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `GHS ${Number(n || 0).toFixed(2)}`;
  }
}

export default function CheckoutCOD() {
  const t = useAppTheme();
  const router = useRouter();
  const { items, total, clear } = useCart();
  const { add, hydrate, hydrated } = useOrders();

  // form fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState(""); // e.g. 024xxxxxxx
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("Accra");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrated, hydrate]);

  const hasItems = items?.length > 0;
  const amount = useMemo(() => total(), [items]);

  const validate = () => {
    if (!hasItems) {
      Alert.alert("Empty cart", "Add items before checking out.");
      return false;
    }
    if (!name.trim() || !phone.trim() || !address1.trim() || !city.trim()) {
      Alert.alert("Missing info", "Please fill name, phone, address and city.");
      return false;
    }
    // simple GH phone sanity: 10 digits starting 0
    if (!/^0\d{9}$/.test(phone.trim())) {
      Alert.alert(
        "Phone looks off",
        "Enter a valid 10-digit Ghana number (e.g., 0241234567)."
      );
      return false;
    }
    return true;
  };

  const submit = async () => {
    if (!validate()) return;
    try {
      const order = await add({
        items: items.map((i: any) => ({
          id: i.id,
          name: i.name,
          price: i.price,
          qty: i.qty ?? 1,
        })),
        total: amount,
        delivery: {
          name: name.trim(),
          phone: phone.trim(),
          address1: address1.trim(),
          address2: address2.trim(),
          city: city.trim(),
          notes: notes.trim(),
        },
        paymentMethod: "COD",
      } as any);
      clear();
      router.replace({
        pathname: "/pharmacy/order-success",
        params: { id: order.id, total: String(amount) },
      });
    } catch (e: any) {
      Alert.alert("Error", e.message || "Could not place order.");
    }
  };

  return (
    <Screen edges={["top", "left", "right"]}>
      <Header title="Delivery details" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: "padding", android: undefined })}
        keyboardVerticalOffset={Platform.OS === "ios" ? 72 : 0}
      >
        <ScrollView
          contentContainerStyle={{ padding: space.lg, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <Card title="Contact" subtitle="Who should we reach on delivery?">
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Full name"
              placeholderTextColor={t.sub}
              style={[
                styles.input,
                {
                  backgroundColor: t.card,
                  borderColor: t.border,
                  color: t.text,
                },
              ]}
            />
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="Phone (e.g., 0241234567)"
              keyboardType="phone-pad"
              placeholderTextColor={t.sub}
              style={[
                styles.input,
                {
                  backgroundColor: t.card,
                  borderColor: t.border,
                  color: t.text,
                },
              ]}
            />
          </Card>

          <Card
            title="Address"
            subtitle="Where should we deliver? "
            style={{ marginTop: 12 }}
          >
            <TextInput
              value={address1}
              onChangeText={setAddress1}
              placeholder="Address line 1"
              placeholderTextColor={t.sub}
              style={[
                styles.input,
                {
                  backgroundColor: t.card,
                  borderColor: t.border,
                  color: t.text,
                },
              ]}
            />
            <TextInput
              value={address2}
              onChangeText={setAddress2}
              placeholder="Address line 2 (optional)"
              placeholderTextColor={t.sub}
              style={[
                styles.input,
                {
                  backgroundColor: t.card,
                  borderColor: t.border,
                  color: t.text,
                },
              ]}
            />
            <TextInput
              value={city}
              onChangeText={setCity}
              placeholder="City (e.g., Accra)"
              placeholderTextColor={t.sub}
              style={[
                styles.input,
                {
                  backgroundColor: t.card,
                  borderColor: t.border,
                  color: t.text,
                },
              ]}
            />
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Delivery notes (optional)"
              placeholderTextColor={t.sub}
              style={[
                styles.input,
                {
                  backgroundColor: t.card,
                  borderColor: t.border,
                  color: t.text,
                },
              ]}
              multiline
            />
          </Card>

          <Card
            title="Order summary"
            subtitle="Cash on delivery"
            style={{ marginTop: 12 }}
          >
            <View style={{ gap: 6 }}>
              <Text style={{ color: t.text, fontWeight: "800" }}>
                Total: {formatGHS(amount)}
              </Text>
              <Text style={{ color: t.sub, fontSize: 12 }}>
                You’ll pay this amount to our rider on delivery.
              </Text>
            </View>
          </Card>

          <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
            <Button
              title="Place order (COD)"
              color="success"
              onPress={submit}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    marginTop: 10,
    padding: 14,
    borderRadius: radius.xl,
    borderWidth: 1,
    fontSize: 14,
  },
});
