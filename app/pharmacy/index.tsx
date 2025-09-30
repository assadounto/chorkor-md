import { View, Text, TouchableOpacity, FlatList } from "react-native";
import Screen from "@/components/ui/Screen";
import { Header } from "@/components/ui/Header";
import { useCart } from "@/state/cart";
import { useQuery } from "@tanstack/react-query";
import { apiMedicines } from "@/lib/apiClient";
import { Link } from "expo-router";

export default function Pharmacy() {
  const add = useCart((s) => s.add);
  const { data } = useQuery({ queryKey: ["meds"], queryFn: apiMedicines });

  return (
    <Screen>
      <Header title="Pharmacy" />
      <FlatList
        data={data || []}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View className="m-3 p-4 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
            <Text className="text-zinc-900 dark:text-zinc-100 font-medium">{item.name}</Text>
            <Text className="text-zinc-500 mt-1">GHS {item.price.toFixed(2)}</Text>
            <TouchableOpacity onPress={() => add(item)} className="mt-3 px-3 py-2 rounded-xl bg-brand">
              <Text className="text-white">Add to cart</Text>
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={() => (
          <Link href="/pharmacy/cart" asChild>
            <TouchableOpacity className="m-3 p-4 rounded-2xl bg-emerald-600">
              <Text className="text-white text-center">Go to cart</Text>
            </TouchableOpacity>
          </Link>
        )}
      />
    </Screen>
  );
}
