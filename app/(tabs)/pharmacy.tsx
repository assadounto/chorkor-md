import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  FlatList,
  ScrollView,
} from "react-native";
import Screen from "@/components/ui/Screen";
import { Header } from "@/components/ui/Header";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useCart } from "@/state/cart";
import { Link } from "expo-router";
import { useAppTheme } from "@/theme/useTheme";
import { radius, space } from "@/theme/tokens";

type Med = {
  id: string;
  name: string;
  price: number;
  category: string;
  desc?: string;
};

const CATEGORIES = ["All", "Pain", "Cold & Flu", "Digestive", "Dermatology"];

const CATALOG: Med[] = [
  {
    id: "paracetamol",
    name: "Paracetamol 500mg (10s)",
    price: 12.0,
    category: "Pain",
    desc: "For fever & mild pain",
  },
  {
    id: "ibuprofen",
    name: "Ibuprofen 200mg (10s)",
    price: 15.0,
    category: "Pain",
    desc: "Anti-inflammatory",
  },
  {
    id: "cetirizine",
    name: "Cetirizine 10mg (10s)",
    price: 18.5,
    category: "Cold & Flu",
    desc: "Allergy relief",
  },
  {
    id: "ors",
    name: "Oral Rehydration Salts",
    price: 10.0,
    category: "Digestive",
    desc: "Dehydration support",
  },
  {
    id: "hydrocortisone",
    name: "Hydrocortisone 1% Cream",
    price: 22.0,
    category: "Dermatology",
    desc: "Itch & rash",
  },
];

export default function Pharmacy() {
  const t = useAppTheme();
  const add = useCart((s: any) => s.add);
  const items = useCart((s: any) => s.items ?? []); // safe if your store has items
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");

  // local qty map so we don't need cart.setQty API
  const [qty, setQty] = useState<Record<string, number>>({});

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return CATALOG.filter((m) =>
      cat === "All" ? true : m.category === cat
    ).filter((m) =>
      !term
        ? true
        : m.name.toLowerCase().includes(term) ||
          m.category.toLowerCase().includes(term) ||
          (m.desc?.toLowerCase().includes(term) ?? false)
    );
  }, [q, cat]);

  const totalQty = useMemo(
    () => items.reduce((s: number, it: any) => s + (it.qty ?? 1), 0),
    [items]
  );
  const subtotal = useMemo(
    () =>
      items.reduce(
        (s: number, it: any) => s + (it.price ?? 0) * (it.qty ?? 1),
        0
      ),
    [items]
  );

  const onAdd = (med: Med) => {
    const count = Math.max(1, Math.min(10, qty[med.id] ?? 1));
    // call add() N times to avoid depending on setQty
    for (let i = 0; i < count; i++)
      add({ id: med.id, name: med.name, price: med.price });
    setQty((q0) => ({ ...q0, [med.id]: 1 })); // reset to 1 after adding
  };

  const ListHeader = () => (
    <View
      style={{ paddingHorizontal: space.lg, paddingTop: space.lg, gap: 12 }}
    >
      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder="Search medicines (name, use, category)"
        placeholderTextColor={t.sub}
        style={[
          styles.input,
          { backgroundColor: t.card, borderColor: t.border, color: t.text },
        ]}
        returnKeyType="search"
      />

      {/* Category chips */}
      <ScrollView  horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {CATEGORIES.map((c) => (
          <Pressable
            key={c}
            onPress={() => setCat(c)}
            style={[
              styles.chip,
              {
                backgroundColor:
                  cat === c ? t.brand : t.isDark ? "#3F3F46" : "#E5E7EB",
              },
            ]}
          >
            <Text
              style={{
                color: cat === c ? "#fff" : "#111827",
                fontWeight: "700",
              }}
            >
              {c}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Small note */}
      <Text style={{ color: t.sub, fontSize: 12 }}>
        *Information only. Always read labels. If unsure, consult a
        pharmacist/doctor.
      </Text>
    </View>
  );

  return (
    <Screen edges={["top", "left", "right"]}>
      <Header title="Pharmacy" />
      <FlatList
        data={filtered}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ paddingBottom: 96 }}
        ListHeaderComponent={ListHeader}
        renderItem={({ item: m }) => (
          <View style={{ paddingHorizontal: space.lg, marginTop: 12 }}>
            <Card
              title={m.name}
              subtitle={`${m.category}${m.desc ? " • " + m.desc : ""}`}
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
                  gap: 10,
                }}
              >
                <Text
                  style={{ color: t.text, fontSize: 18, fontWeight: "800" }}
                >
                  {formatGHS(m.price)}
                </Text>

                {/* qty picker */}
                <View style={styles.qtyRow}>
                  <Pressable
                    onPress={() =>
                      setQty((q0) => ({
                        ...q0,
                        [m.id]: Math.max(1, (q0[m.id] ?? 1) - 1),
                      }))
                    }
                    style={[
                      styles.qtyBtn,
                      { borderColor: t.border, backgroundColor: t.card },
                    ]}
                  >
                    <Text style={{ color: t.text, fontWeight: "800" }}>−</Text>
                  </Pressable>
                  <Text
                    style={{
                      color: t.text,
                      fontWeight: "800",
                      minWidth: 24,
                      textAlign: "center",
                    }}
                  >
                    {qty[m.id] ?? 1}
                  </Text>
                  <Pressable
                    onPress={() =>
                      setQty((q0) => ({
                        ...q0,
                        [m.id]: Math.min(10, (q0[m.id] ?? 1) + 1),
                      }))
                    }
                    style={[
                      styles.qtyBtn,
                      { borderColor: t.border, backgroundColor: t.card },
                    ]}
                  >
                    <Text style={{ color: t.text, fontWeight: "800" }}>＋</Text>
                  </Pressable>
                </View>

                <Button
                  title="Add to cart"
                  fullWidth={false}
                  onPress={() => onAdd(m)}
                />
              </View>
            </Card>
          </View>
        )}
      />

      {/* Sticky cart bar */}
      <View
        style={[
          styles.cartBar,
          { backgroundColor: t.card, borderTopColor: t.border },
        ]}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={[styles.cartBadge, { backgroundColor: t.brand }]}>
            <Text style={{ color: "#fff", fontWeight: "800" }}>{totalQty}</Text>
          </View>
          <Text style={{ color: t.text, fontWeight: "800" }}>
            {formatGHS(subtotal)}
          </Text>
          <Text style={{ color: t.sub }}>in cart</Text>
        </View>
        <Link href="/pharmacy/cart" asChild>
          <Button title="View Cart" color="success" fullWidth={false} />
        </Link>
      </View>
    </Screen>
  );
}

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
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  qtyBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
  },
  cartBar: {
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
  cartBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
});
