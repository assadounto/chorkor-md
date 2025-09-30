import React, { useEffect, useMemo } from "react";
import {
  View,
  Text,
  Switch,
  Alert,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import Screen from "@/components/ui/Screen";
import { Header } from "@/components/ui/Header";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Link } from "expo-router";
import { useAppTheme } from "@/theme/useTheme";
import { radius, space } from "@/theme/tokens";
import { useReminders } from "@/state/reminders";

const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]; // display helper

export default function Reminders() {
  const t = useAppTheme();
  const { items, hydrate, hydrated, toggle, remove } = useReminders();

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrated, hydrate]);

  const grouped = useMemo(() => {
    const on = items
      .filter((r) => r.enabled)
      .sort((a, b) => a.time.localeCompare(b.time));
    const off = items
      .filter((r) => !r.enabled)
      .sort((a, b) => a.time.localeCompare(b.time));
    return { on, off };
  }, [items]);

  const confirmDelete = (id: string) => {
    Alert.alert("Delete reminder?", "This will remove the schedule.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => remove(id) },
    ]);
  };

  return (
    <Screen edges={["top", "left", "right"]}>
      <Header
        title="Reminders"
        // little actions slot on the right
        right={
          <Link href="/reminders/manage" asChild>
            <Button title="Tools" color="neutral" />
          </Link>
        }
      />
      <View
        style={{
          paddingHorizontal: space.lg,
          paddingTop: space.md,
          paddingBottom: 88,
        }}
      >
        {items.length === 0 ? (
          <EmptyState />
        ) : (
          <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
            {grouped.on.length > 0 && (
              <Section title="Active">
                {grouped.on.map((r) => (
                  <ReminderRow
                    key={r.id}
                    {...{ r, t, toggle, confirmDelete }}
                  />
                ))}
              </Section>
            )}

            {grouped.off.length > 0 && (
              <Section title="Off">
                {grouped.off.map((r) => (
                  <ReminderRow
                    key={r.id}
                    {...{ r, t, toggle, confirmDelete }}
                  />
                ))}
              </Section>
            )}
          </ScrollView>
        )}
      </View>

      {/* Floating Action Button */}
      <Link href="/reminders/new" asChild>
        <Pressable
          style={[
            styles.fab,
            {
              backgroundColor: t.brand,
              shadowColor: t.isDark ? "#000" : "#111827",
            },
          ]}
        >
          <Text style={{ color: "#fff", fontSize: 20, fontWeight: "800" }}>
            ＋
          </Text>
        </Pressable>
      </Link>
    </Screen>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const t = useAppTheme();
  return (
    <View style={{ marginBottom: 14 }}>
      <Text
        style={{
          color: t.sub,
          fontSize: 12,
          fontWeight: "700",
          marginBottom: 8,
        }}
      >
        {title}
      </Text>
      <View style={{ gap: 10 }}>{children}</View>
    </View>
  );
}

function ReminderRow({
  r,
  t,
  toggle,
  confirmDelete,
}: {
  r: any;
  t: ReturnType<typeof useAppTheme>;
  toggle: (id: string, enabled: boolean) => Promise<void>;
  confirmDelete: (id: string) => void;
}) {
  const days = r.weekdays.length
    ? r.weekdays.map((w: number) => DAY[w % 7])
    : ["Daily"];
  return (
    <Card
      title={`${r.name}${r.dose ? ` — ${r.dose}` : ""}`}
      subtitle={r.notes ? r.notes : undefined}
      style={{ borderColor: t.border, borderWidth: StyleSheet.hairlineWidth }}
    >
      <View style={{ gap: 10 }}>
        {/* Time + Days */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ color: t.text, fontSize: 20, fontWeight: "800" }}>
            {r.time}
          </Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 6,
              maxWidth: "65%",
              justifyContent: "flex-end",
            }}
          >
            {days.map((d: string, i: number) => (
              <View
                key={i}
                style={[
                  styles.badge,
                  { backgroundColor: t.isDark ? "#3F3F46" : "#E5E7EB" },
                ]}
              >
                <Text
                  style={{ color: t.text, fontSize: 12, fontWeight: "700" }}
                >
                  {d}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Actions */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Link
              href={{ pathname: "/reminders/new", params: { id: r.id } }}
              asChild
            >
              <Button title="Edit" color="neutral" />
            </Link>
            <Button
              title="Delete"
              color="warn"
              onPress={() => confirmDelete(r.id)}
            />
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text style={{ color: t.sub, fontSize: 12, fontWeight: "700" }}>
              {r.enabled ? "ON" : "OFF"}
            </Text>
            <Switch value={r.enabled} onValueChange={(v) => toggle(r.id, v)} />
          </View>
        </View>
      </View>
    </Card>
  );
}

function EmptyState() {
  const t = useAppTheme();
  return (
    <View
      style={[styles.empty, { borderColor: t.border, backgroundColor: t.card }]}
    >
      <Text style={{ color: t.text, fontWeight: "800", fontSize: 16 }}>
        No reminders yet
      </Text>
      <Text style={{ color: t.sub, marginTop: 6, textAlign: "center" }}>
        Create your first medication reminder to get notified on schedule.
      </Text>
      <Link href="/reminders/new" asChild>
        <Button
          title="Create a reminder"
          color="success"
          style={{ marginTop: 10 }}
        />
      </Link>
      <Link href="/reminders/manage" asChild>
        <Button
          title="Reminder Tools"
          color="neutral"
          style={{ marginTop: 6 }}
        />
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
  },
  fab: {
    position: "absolute",
    right: space.lg,
    bottom: space.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  empty: {
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.xl,
    alignItems: "center",
  },
});
