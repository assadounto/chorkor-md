import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import Screen from "@/components/ui/Screen";
import { Header } from "@/components/ui/Header";
import { Link } from "expo-router";
import { useAuth } from "@/state/auth";

export default function Home() {
  const { user } = useAuth();
  return (
    <Screen>
      <Header title="Chorkor Mobile Doctor" />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Your trusted healthcare companion</Text>
        <Text className="mt-2 text-zinc-600 dark:text-zinc-300">
          Get medical advice, order medicines, and track your health — all in one place.
        </Text>

        <View className="mt-6 gap-3">
          <Link href="/symptom-checker" asChild>
            <TouchableOpacity className="p-4 rounded-2xl bg-brand">
              <Text className="text-white text-base font-medium">Symptom Checker</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/consult" asChild>
            <TouchableOpacity className="p-4 rounded-2xl bg-emerald-500">
              <Text className="text-white text-base font-medium">Consult a Doctor</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/pharmacy" asChild>
            <TouchableOpacity className="p-4 rounded-2xl bg-[#F59E0B]">
              <Text className="text-white text-base font-medium">Pharmacy & Orders</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/tracker" asChild>
            <TouchableOpacity className="p-4 rounded-2xl bg-purple-500">
              <Text className="text-white text-base font-medium">Health Tracker</Text>
            </TouchableOpacity>
          </Link>
        </View>

        <Text className="mt-8 text-xs text-zinc-500">
          *Info only. Not a diagnosis. In emergencies, call local services.
        </Text>

        {!user && (
          <View className="mt-6">
            <Link href="/auth/register" asChild>
              <TouchableOpacity className="p-3 rounded-xl bg-zinc-200">
                <Text className="text-center">Create account</Text>
              </TouchableOpacity>
            </Link>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
