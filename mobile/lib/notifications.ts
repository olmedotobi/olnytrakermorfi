import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} catch {}

export async function requestPermissions(): Promise<boolean> {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === "granted") return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  } catch {
    return false;
  }
}

export async function setupAndroidChannel() {
  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("events", {
        name: "Eventos del calendario",
        importance: Notifications.AndroidImportance.HIGH,
        sound: "default",
        vibrationPattern: [0, 250, 250, 250],
      });
    }
  } catch {}
}

export type CalendarEvent = {
  id: string;
  date: string;
  time: string;
  title: string;
  description: string;
};

export async function scheduleEventNotification(event: CalendarEvent): Promise<void> {
  if (!event.time) return;
  try {
    const [hour, minute] = event.time.split(":").map(Number);
    const [year, month, day] = event.date.split("-").map(Number);
    const trigger = new Date(year, month - 1, day, hour, minute, 0);
    if (trigger <= new Date()) return;
    await Notifications.scheduleNotificationAsync({
      identifier: event.id,
      content: {
        title: `📅 ${event.title}`,
        body: event.description || "Recordatorio de evento",
        sound: "default",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: trigger,
        channelId: "events",
      },
    });
  } catch {}
}

export async function cancelEventNotification(eventId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(eventId);
  } catch {}
}
