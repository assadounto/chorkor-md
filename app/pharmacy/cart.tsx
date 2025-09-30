import { View, Text, TouchableOpacity, Alert } from "react-native";
import Screen from "@/components/ui/Screen";
import { Header } from "@/components/ui/Header";
import { useCart } from "@/state/cart";
import { apiCheckout } from "@/lib/apiClient";

export default function Cart() {
  const { items, inc, dec, total, clear } = useCart();

  const checkout = async () => {
    if (items.length === 0) return Alert.alert("Cart is empty");
    const payload = { items, total: total(), currency: "GHS", method: "PaystackOrMoMo" };
    const res = await apiCheckout(payload);
    Alert.alert("Checkout (stub)", `Reference: ${res.reference}\nURL: ${res.checkout_url}`);
    clear();
  };

  return (
    <Screen>
      <Header title="Your Cart" />
      <View className="p-5 gap-3">
        {items.length === 0 ? (
          <Text className="text-zinc-600 dark:text-zinc-300">Your cart is empty.</Text>
        ) : (
          <>
            {items.map((i) => (
              <View key={i.id} className="p-4 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                <Text className="text-zinc-900 dark:text-zinc-100 font-medium">{i.name}</Text>
                <Text className="text-zinc-500">GHS {i.price.toFixed(2)}</Text>
                <View className="flex-row items-center gap-3 mt-2">
                  <TouchableOpacity onPress={() => dec(i.id)} className="px-3 py-1 rounded-full bg-zinc-200 dark:bg-zinc-700"><Text>-</Text></TouchableOpacity>
                  <Text className="text-zinc-900 dark:text-zinc-100">{i.qty}</Text>
                  <TouchableOpacity onPress={() => inc(i.id)} className="px-3 py-1 rounded-full bg-zinc-200 dark:bg-zinc-700"><Text>+</Text></TouchableOpacity>
                </View>
              </View>
            ))}
            <Text className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Total: GHS {total().toFixed(2)}</Text>
            <TouchableOpacity onPress={checkout} className="mt-3 p-4 rounded-2xl bg-brand">
              <Text className="text-white text-center">Checkout (Paystack/MoMo stub)</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={clear} className="mt-2 p-3 rounded-2xl bg-zinc-200 dark:bg-zinc-700">
              <Text className="text-center text-zinc-900 dark:text-zinc-100">Clear</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </Screen>
  );
}
