import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  FlatList,
  Keyboard,
} from "react-native";
import Screen from "@/components/ui/Screen";
import { Header } from "@/components/ui/Header";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Link } from "expo-router";
import { useAppTheme } from "@/theme/useTheme";
import { radius, space } from "@/theme/tokens";

type Doctor = {
  id: string;
  name: string;
  speciality: string;
  city: string;
  rating: number;
  price?: string;
  available?: string;
};

const SPECIALTIES = ["All", "General Practitioner", "Pediatrics"];

export default function Consult() {
  const t = useAppTheme();
  const [q, setQ] = useState("");
  const [spec, setSpec] = useState<string>("All");

  const doctors: Doctor[] = [
    {
      id: "d1",
      name: "Dr. Afua Mensah",
      speciality: "General Practitioner",
      city: "Accra",
      rating: 4.8,
      price: "₵120",
      available: "Today",
    },
    {
      id: "d2",
      name: "Dr. Kwesi Owusu",
      speciality: "Pediatrics",
      city: "Tema",
      rating: 4.6,
      price: "₵150",
      available: "In 2h",
    },
    {
      id: "d3",
      name: "Dr. Sarah Addy",
      speciality: "General Practitioner",
      city: "Kumasi",
      rating: 4.7,
      price: "₵110",
      available: "Thu",
    },
    // add more to test scrolling...
  ];

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return doctors
      .filter((d) => (spec === "All" ? true : d.speciality === spec))
      .filter((d) =>
        !term
          ? true
          : d.name.toLowerCase().includes(term) ||
            d.city.toLowerCase().includes(term) ||
            d.speciality.toLowerCase().includes(term)
      );
  }, [q, spec]);

  const ListHeader = () => (
    <View
      style={{ paddingHorizontal: space.lg, paddingTop: space.lg, gap: 12 }}
    >
      {/* Search */}
      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder="Search by name, city, or specialty"
        placeholderTextColor={t.sub}
        style={[
          styles.input,
          { backgroundColor: t.card, borderColor: t.border, color: t.text },
        ]}
        returnKeyType="search"
        onSubmitEditing={() => Keyboard.dismiss()}
      />

      {/* Specialty filter chips */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {SPECIALTIES.map((label) => (
          <Pressable
            key={label}
            onPress={() => setSpec(label)}
            style={[
              styles.chip,
              {
                backgroundColor:
                  spec === label ? t.brand : t.isDark ? "#3F3F46" : "#E5E7EB",
              },
            ]}
          >
            <Text
              style={{
                color: spec === label ? "#fff" : "#111827",
                fontWeight: "700",
              }}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      {filtered.length === 0 && (
        <View
          style={[
            styles.empty,
            { borderColor: t.border, backgroundColor: t.card },
          ]}
        >
          <Text style={{ color: t.text, fontWeight: "800" }}>
            No doctors found
          </Text>
          <Text style={{ color: t.sub, marginTop: 4, textAlign: "center" }}>
            Try a different search term or specialty.
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <Screen edges={["top", "left", "right"]}>
      <Header title="Consult" />
      <FlatList
        data={filtered}
        keyExtractor={(d) => d.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListHeaderComponent={ListHeader}
        keyboardDismissMode="on-drag"
        renderItem={({ item: d }) => (
          <View style={{ paddingHorizontal: space.lg, marginTop: 12 }}>
            <Card
              title={d.name}
              subtitle={`${d.speciality} • ${d.city}`}
              style={{
                borderColor: t.border,
                borderWidth: StyleSheet.hairlineWidth,
              }}
            >
              {/* Top row: avatar + badges */}
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: t.isDark ? "#3F3F46" : "#E5E7EB" },
                  ]}
                >
                  <Text style={{ color: t.text, fontWeight: "800" }}>
                    {initials(d.name)}
                  </Text>
                </View>

                <View style={{ flex: 1, gap: 6 }}>
                  <View
                    style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}
                  >
                    <Badge label={`⭐ ${d.rating.toFixed(1)}`} />
                    {d.available ? (
                      <Badge
                        label={`Available: ${d.available}`}
                        tone="success"
                      />
                    ) : null}
                    {d.price ? <Badge label={d.price} tone="neutral" /> : null}
                  </View>
                </View>
              </View>

              {/* Actions */}
              <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
                <Link
                  href={{ pathname: "/consult/chat", params: { doctor: d.name } }}
                  asChild
                >
                  <Button title="Chat" fullWidth={false} />
                </Link>
                <Link
                  href={{ pathname: "/consult/call", params: { doctor: d.name } }}
                  asChild
                >
                  <Button title="Call" color="success" fullWidth={false} />
                </Link>
                <Button
                  title="Book"
                  color="purple"
                  fullWidth={false}
                  onPress={() => {
                    /* booking later */
                  }}
                />
              </View>
            </Card>
          </View>
        )}
      />
    </Screen>
  );
}

function Badge({ label, tone = "brand" as "brand" | "success" | "neutral" }) {
  const t = useAppTheme();
  const bg =
    tone === "success"
      ? t.isDark
        ? "#0B5032"
        : "#DCFCE7"
      : tone === "neutral"
      ? t.isDark
        ? "#3F3F46"
        : "#E5E7EB"
      : t.isDark
      ? "#083344"
      : "#E0F2FE";
  const fg =
    tone === "success"
      ? t.isDark
        ? "#86EFAC"
        : "#166534"
      : tone === "neutral"
      ? t.isDark
        ? "#fff"
        : "#111827"
      : t.isDark
      ? "#7DD3FC"
      : "#075985";
  return (
    <View
      style={{
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 999,
        backgroundColor: bg,
      }}
    >
      <Text style={{ color: fg, fontSize: 12, fontWeight: "700" }}>
        {label}
      </Text>
    </View>
  );
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] || "";
  const b = parts[1]?.[0] || "";
  return (a + b).toUpperCase();
}

const styles = StyleSheet.create({
  input: {
    padding: 12,
    borderRadius: radius.xl,
    borderWidth: 1,
    fontSize: 14,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.xl,
    alignItems: "center",
  },
});
