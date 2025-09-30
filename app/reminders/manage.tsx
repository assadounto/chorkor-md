import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, Alert, ScrollView } from "react-native";
import Screen from "@/components/ui/Screen";
import { Header } from "@/components/ui/Header";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAppTheme } from "@/theme/useTheme";
import { space, radius } from "@/theme/tokens";
import { useReminders } from "@/state/reminders";
import { listScheduled, cancelMany } from "@/lib/notifications";
import * as Notifications from "expo-notifications";

type Scheduled = {
  identifier: string;
  content: any;
  trigger: any; // may contain weekday/hour/minute/second on Android; date trigger on iOS
};

const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]; // display only

export default function ReminderTools() {
  const t = useAppTheme();
  const { items, toggle, reconcileOnLaunch } = useReminders();
  const [scheduled, setScheduled] = useState<Scheduled[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const s = (await listScheduled()) as unknown as Scheduled[];
      setScheduled(s || []);
    } catch (e) {
      console.warn(e);
      Alert.alert("Error", "Could not load scheduled notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const clearAllOS = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await refresh();
      Alert.alert("Cleared", "All OS-scheduled notifications were canceled.");
    } catch (e: any) {
      Alert.alert("Failed", e.message || String(e));
    }
  };

  const disableAll = async () => {
    try {
      for (const r of items) {
        if (r.enabled) {
          // cancel existing ids if present, then disable
          if (r.notificationIds?.length) await cancelMany(r.notificationIds);
          await toggle(r.id, false);
        }
      }
      await refresh();
      Alert.alert("Done", "All reminders are now disabled.");
    } catch (e: any) {
      Alert.alert("Failed", e.message || String(e));
    }
  };

  const rescheduleEnabled = async () => {
    try {
      await reconcileOnLaunch(); // will (re)schedule enabled reminders if OS has none
      await refresh();
      Alert.alert(
        "Rescheduled",
        "Enabled reminders were reconciled with the OS scheduler."
      );
    } catch (e: any) {
      Alert.alert("Failed", e.message || String(e));
    }
  };

  return (
    <Screen>
      <Header title="Reminder Tools" />
      <ScrollView
        contentContainerStyle={{ padding: space.lg, paddingBottom: 32 }}
      >
        <Card title="Actions" subtitle="Maintenance & testing">
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            <Button
              title="Clear all OS schedules"
              color="warn"
              onPress={clearAllOS}
            />
            <Button
              title="Disable all reminders"
              color="neutral"
              onPress={disableAll}
            />
            <Button
              title="Reschedule enabled"
              color="success"
              onPress={rescheduleEnabled}
            />
            <Button
              title={loading ? "Refreshing…" : "Refresh list"}
              onPress={refresh}
            />
          </View>
          <Text style={{ color: t.sub, fontSize: 12, marginTop: 8 }}>
            Tip: After clearing OS schedules, use “Reschedule enabled” to
            re-create weekly alarms from your saved reminders.
          </Text>
        </Card>

        <Card
          title="OS-Scheduled Notifications"
          subtitle={
            scheduled.length
              ? `${scheduled.length} scheduled`
              : "None scheduled"
          }
          style={{ marginTop: 12 }}
        >
          {scheduled.length === 0 ? (
            <Text style={{ color: t.sub }}>— no OS schedules —</Text>
          ) : (
            <View style={{ gap: 10 }}>
              {scheduled.map((s) => {
                const trig: any = s.trigger || {};
                // Android weekly trigger example: { weekday: 1..7, hour, minute, second, repeats: true }
                // iOS may show a date trigger; we display what we can safely read.
                const weekday = trig.weekday
                  ? DAY[(trig.weekday - 1 + 7) % 7]
                  : undefined;
                const hh = trig.hour ?? "—";
                const mm = trig.minute ?? "—";
                const time =
                  hh !== "—" && mm !== "—"
                    ? `${String(hh).padStart(2, "0")}:${String(mm).padStart(
                        2,
                        "0"
                      )}`
                    : "—";
                return (
                  <View
                    key={s.identifier}
                    style={[
                      styles.item,
                      { borderColor: t.border, backgroundColor: t.card },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: t.text, fontWeight: "700" }}>
                        {s.content?.title || "Medication Reminder"}
                      </Text>
                      <Text style={{ color: t.sub, marginTop: 2 }}>
                        {weekday ? `${weekday} • ` : ""}
                        {time} {trig.repeats ? "• repeats" : ""}
                      </Text>
                      {s.content?.body ? (
                        <Text
                          style={{ color: t.sub, marginTop: 2, fontSize: 12 }}
                        >
                          {s.content.body}
                        </Text>
                      ) : null}
                    </View>
                    <Text style={{ color: t.sub, fontSize: 12 }}>
                      {s.identifier.slice(0, 8)}…
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  item: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.xl,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
});
