import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function setupAndroidChannel() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("events", {
      name: "Eventos del calendario",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
      vibrationPattern: [0, 250, 250, 250],
    });
  }
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
      data: { eventId: event.id },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: trigger,
      channelId: "events",
    },
  });
}

export async function cancelEventNotification(eventId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(eventId);
}
