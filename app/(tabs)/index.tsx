import React, { useMemo, useEffect, useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from "react-native";
import Screen from "@/components/ui/Screen";
import { Header } from "@/components/ui/Header";
import { Link } from "expo-router";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useAppTheme } from "@/theme/useTheme";
import { space, radius } from "@/theme/tokens";
import { useAuth } from "@/state/auth";
import { useReminders } from "@/state/reminders";
import { useTracker } from "@/state/tracker";
import { useOrders } from "@/state/orders";
import SparkBars from "@/components/ui/SparkBars";

function formatWeekdaysShort(weekdays: number[]) {
  // incoming values: 1..7 (Sun..Sat)
  const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  if (!weekdays?.length) return "Daily";
  return weekdays.map((w) => DAY[(w - 1 + 7) % 7]).join("•");
}

export default function Dashboard() {
  const t = useAppTheme();
  const user = useAuth((s) => s.user);
  const { items: reminders } = useReminders();

  const { hydrate, hydrated, lastOf, recentValues } = useTracker();
  const {
    orders = [],
    hydrate: hydrateOrders,
    hydrated: ordersHydrated,
  } = useOrders();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!hydrated) hydrate();
    if (!ordersHydrated) hydrateOrders?.();
  }, [hydrated, hydrate, ordersHydrated, hydrateOrders]);

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await Promise.allSettled([hydrate(), hydrateOrders?.()]);
    } finally {
      setRefreshing(false);
    }
  }, [hydrate, hydrateOrders]);

  // meds for today + next dose
  const { todayList, nextDose } = useMemo(() => {
    const jsWeekday1to7 = (new Date().getDay() + 1) as number; // 1..7
    const todays = reminders
      .filter(
        (r) =>
          r.enabled &&
          (r.weekdays.length === 0 || r.weekdays.includes(jsWeekday1to7))
      )
      .sort((a, b) => a.time.localeCompare(b.time));

    // compute the next dose time (>= now)
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const nowHHMM = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const next = todays.find((r) => r.time >= nowHHMM) ?? todays[0];
    return { todayList: todays.slice(0, 4), nextDose: next };
  }, [reminders]);

  // tracker last values & micro trends
  const lastBP = lastOf("bp") as any;
  const lastHR = lastOf("hr") as any;
  const lastSteps = lastOf("steps") as any;
  const hrSeries = recentValues("hr", 10);
  const stepsSeries = recentValues("steps", 10);

  // orders peek
  const pendingCount = useMemo(
    () => orders.filter((o: any) => o.status === "pending").length,
    [orders]
  );
  const lastOrder = useMemo(
    () => [...orders].sort((a: any, b: any) => b.createdAt - a.createdAt)[0],
    [orders]
  );

  return (
    <Screen edges={["top", "left", "right"]}>
      <Header title="Chorkor Mobile Doctor" />
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Greeting */}
        <Text style={[styles.h1, { color: t.text }]}>
          {user?.name ? `Hello, ${user.name} 👋` : "Welcome 👋"}
        </Text>
        <Text style={{ color: t.sub, marginTop: 4 }}>
          Your trusted healthcare companion — advice, meds, and tracking in one
          place.
        </Text>

        {/* KPIs */}
        <View style={styles.row}>
          <KPI
            label="BP"
            value={lastBP ? `${lastBP.sys}/${lastBP.dia}` : "—"}
          />
          <KPI
            label="Heart Rate"
            value={lastHR ? `${lastHR.value} bpm` : "—"}
          />
          <KPI label="Steps" value={lastSteps ? `${lastSteps.value}` : "—"} />
        </View>

        {/* Micro charts */}
        <Card
          title="Today at a glance"
          subtitle="Mini trends"
          style={{ marginTop: 12 }}
        >
          <View style={{ gap: 10 }}>
            <TrendLine
              label="Heart Rate"
              series={hrSeries}
              color={t.brand}
              unit="bpm"
            />
            <TrendLine
              label="Steps"
              series={stepsSeries}
              color={t.success}
              unit=""
            />
          </View>
        </Card>

        {/* Today's Meds + Next dose */}
        <Card
          title="Today's Medications"
          subtitle={todayList.length ? "Next doses" : "No reminders for today"}
          style={{ marginTop: 12 }}
        >
          {todayList.length ? (
            <View style={{ gap: 8 }}>
              {nextDose ? (
                <View
                  style={[
                    styles.nextBadge,
                    {
                      backgroundColor: t.isDark ? "#083344" : "#E0F2FE",
                      borderColor: t.border,
                    },
                  ]}
                >
                  <Text style={{ color: t.text, fontWeight: "800" }}>
                    Next dose: {nextDose.name}
                    {nextDose.dose ? ` — ${nextDose.dose}` : ""} at{" "}
                    {nextDose.time}
                  </Text>
                </View>
              ) : null}

              {todayList.map((r) => (
                <View
                  key={r.id}
                  style={[styles.medRow, { borderColor: t.border }]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: t.text, fontWeight: "700" }}>
                      {r.name}
                      {r.dose ? ` — ${r.dose}` : ""}
                    </Text>
                    <Text style={{ color: t.sub, marginTop: 2 }}>
                      {formatWeekdaysShort(r.weekdays)} • Notes:{" "}
                      {r.notes || "—"}
                    </Text>
                  </View>
                  <Text style={{ color: t.text, fontWeight: "800" }}>
                    {r.time}
                  </Text>
                </View>
              ))}
              <Link href="/reminders/new" asChild>
                <Button title="Add another reminder" style={{ marginTop: 6 }} />
              </Link>
            </View>
          ) : (
            <Link href="/reminders/new" asChild>
              <Button title="Create a reminder" />
            </Link>
          )}
        </Card>

        {/* Orders peek */}
        <Card
          title="Orders"
          subtitle={
            orders.length
              ? `${pendingCount} pending • ${orders.length} total`
              : "You have no orders yet"
          }
          style={{ marginTop: 12 }}
        >
          {orders.length ? (
            <View style={{ gap: 6 }}>
              <Text style={{ color: t.text }}>
                Latest:{" "}
                <Text style={{ fontWeight: "800" }}>{lastOrder?.id}</Text> —{" "}
                {formatCurrency(lastOrder?.total)} •{" "}
                <Text style={{ textTransform: "capitalize" }}>
                  {lastOrder?.status}
                </Text>
              </Text>
              <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
                <Link href="/orders" asChild>
                  <Button
                    title="View all orders"
                    color="neutral"
                    fullWidth={false}
                  />
                </Link>
                <Link href="/(tabs)/pharmacy" asChild>
                  <Button
                    title="Go to Pharmacy"
                    color="success"
                    fullWidth={false}
                  />
                </Link>
              </View>
            </View>
          ) : (
            <Link href="/(tabs)/pharmacy" asChild>
              <Button title="Shop medicines" color="success" />
            </Link>
          )}
        </Card>

        {/* Quick actions */}
        <Card
          title="Quick Actions"
          subtitle="Jump into common tasks"
          style={{ marginTop: 12 }}
        >
          <View style={{ gap: 10 }}>
            <Link href="/symptom-checker" asChild>
              <Button title="Symptom Checker" />
            </Link>
            <Link href="/(tabs)/tracker" asChild>
              <Button title="Log a Health Reading" color="purple" />
            </Link>
            <Link href="/(tabs)/consult" asChild>
              <Button title="Consult a Doctor" color="success" />
            </Link>
            <Link href="/(tabs)/pharmacy" asChild>
              <Button title="Pharmacy & Orders" color="warn" />
            </Link>
          </View>
        </Card>

        <Text style={{ color: t.sub, marginTop: 12, fontSize: 12 }}>
          *Info only. Not a diagnosis. In emergencies, call local services.
        </Text>
      </ScrollView>
    </Screen>
  );
}

/* ---------- Small subcomponents ---------- */

function KPI({ label, value }: { label: string; value: string }) {
  const t = useAppTheme();
  return (
    <View
      style={[styles.kpi, { backgroundColor: t.card, borderColor: t.border }]}
    >
      <Text style={[styles.kpiLabel, { color: t.sub }]}>{label}</Text>
      <Text style={[styles.kpiValue, { color: t.text }]}>{value}</Text>
    </View>
  );
}

function TrendLine({
  label,
  series,
  color,
  unit,
}: {
  label: string;
  series: number[];
  color: string;
  unit: string;
}) {
  const t = useAppTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
      <Text style={{ color: t.text, width: 100, fontWeight: "700" }}>
        {label}
      </Text>
      {series.length ? (
        <>
          <SparkBars data={series} width={160} height={36} color={color} />
          <Text style={{ color: t.sub, fontSize: 12 }}>
            min {Math.min(...series)}
            {unit} • max {Math.max(...series)}
            {unit}
          </Text>
        </>
      ) : (
        <Text style={{ color: t.sub, fontSize: 12 }}>No data yet</Text>
      )}
    </View>
  );
}

function formatCurrency(n?: number) {
  const v = Number(n || 0);
  try {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      maximumFractionDigits: 2,
    }).format(v);
  } catch {
    return `GHS ${v.toFixed(2)}`;
  }
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  container: { padding: space.lg, paddingBottom: 32 },
  h1: { fontSize: 24, fontWeight: "800" },

  row: { flexDirection: "row", gap: 12, marginTop: 12 },
  kpi: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.xl,
    padding: 12,
  },
  kpiLabel: { fontSize: 12, fontWeight: "600" },
  kpiValue: { marginTop: 6, fontSize: 18, fontWeight: "800" },

  medRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
  },
  nextBadge: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.xl,
    padding: 10,
    marginBottom: 6,
  },
});
