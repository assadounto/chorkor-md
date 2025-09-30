import { View, Text, TouchableOpacity, FlatList } from "react-native";
import Screen from "@/components/ui/Screen";
import { Header } from "@/components/ui/Header";
import { apiDoctors } from "@/lib/apiClient";
import { useQuery } from "@tanstack/react-query";
import { Link } from "expo-router";

export default function ConsultIndex() {
  const { data } = useQuery({ queryKey: ["doctors"], queryFn: apiDoctors });
  return (
    <Screen>
      <Header title="Consult a Doctor" />
      <View className="p-5 gap-3">
        <Text className="text-zinc-600 dark:text-zinc-300">Available Doctors</Text>
        <FlatList
          data={data || []}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <View className="p-4 mb-3 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
              <Text className="text-zinc-900 dark:text-zinc-100 font-medium">{item.name}</Text>
              <Text className="text-zinc-500">{item.speciality} • {item.city} • ⭐ {item.rating}</Text>
              <View className="flex-row gap-2 mt-2">
                <Link href={`/consult/chat?doctor=${encodeURIComponent(item.name)}`} asChild>
                  <TouchableOpacity className="px-3 py-2 rounded-xl bg-brand"><Text className="text-white">Chat</Text></TouchableOpacity>
                </Link>
                <Link href={`/consult/call?doctor=${encodeURIComponent(item.name)}`} asChild>
                  <TouchableOpacity className="px-3 py-2 rounded-xl bg-emerald-600"><Text className="text-white">Call</Text></TouchableOpacity>
                </Link>
                <TouchableOpacity className="px-3 py-2 rounded-xl bg-purple-600"><Text className="text-white">Book</Text></TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>
    </Screen>
  );
}
