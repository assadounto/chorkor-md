// lib/notifications.ts
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export async function ensurePermissions(): Promise<boolean> {
  const p = await Notifications.getPermissionsAsync();
  if (
    p.granted ||
    p.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  )
    return true;
  const r = await Notifications.requestPermissionsAsync();
  return (
    !!r.granted ||
    r.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}

export async function ensureAndroidChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync("medication-reminders", {
    name: "Medication Reminders",
    importance: Notifications.AndroidImportance.HIGH,
    sound: "default",
    vibrationPattern: [0, 250, 250, 250],
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
}

export function parseTimeToHourMinute(time: string): {
  hour: number;
  minute: number;
} {
  const m = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!m) throw new Error("Time must be HH:MM");
  let hour = Math.min(23, Math.max(0, parseInt(m[1], 10)));
  let minute = Math.min(59, Math.max(0, parseInt(m[2], 10)));
  return { hour, minute };
}

/**
 * Weekly reminders, robust for Ghana (no DST):
 * - If weekday === today and target HH:MM:SS <= now, skip today (avoids instant ping).
 * - If weekdays empty => schedule all 7 days with same rule (acts like daily).
 */
export async function scheduleWeeklyReminders(params: {
  time: string;
  weekdays: number[]; // 1=Sun..7=Sat; [] => daily
  title: string;
  body: string;
}): Promise<string[]> {
  const ok = await ensurePermissions();
  if (!ok) throw new Error("Notifications permission denied");
  await ensureAndroidChannel();

  const { hour, minute } = parseTimeToHourMinute(params.time);
  const now = new Date();
  const today1to7 = (now.getDay() + 1) as number; // 1..7
  const nowSec =
    now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const targetSec = hour * 3600 + minute * 60 + 0;

  const days = params.weekdays.length
    ? [...params.weekdays]
    : [1, 2, 3, 4, 5, 6, 7];
  const adjusted = days.filter(
    (d) => !(d === today1to7 && targetSec <= nowSec)
  );
  const finalDays = adjusted.length ? adjusted : days; // if everything got filtered, fire next week

  const ids: string[] = [];
  for (const weekday of finalDays) {
    const id = await Notifications.scheduleNotificationAsync({
      content: { title: params.title, body: params.body, sound: "default" },
      trigger: {
        weekday,
        hour,
        minute,
        second: 0,
        repeats: true,
        channelId: "medication-reminders",
      } as any,
    });
    ids.push(id);
  }
  return ids;
}

export async function cancelMany(ids: string[]) {
  await Promise.all(
    ids.map((id) => Notifications.cancelScheduledNotificationAsync(id))
  );
}

export async function listScheduled() {
  return Notifications.getAllScheduledNotificationsAsync();
}
