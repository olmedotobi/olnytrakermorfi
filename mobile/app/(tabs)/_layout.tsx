import { Tabs } from "expo-router";
import { useTheme } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";

type IoniconName = keyof typeof Ionicons.glyphMap;

const TABS: { name: string; label: string; icon: IoniconName; activeIcon: IoniconName }[] = [
  { name: "index",    label: "Inicio",      icon: "home-outline",       activeIcon: "home" },
  { name: "foods",    label: "Alimentos",   icon: "restaurant-outline", activeIcon: "restaurant" },
  { name: "calendar", label: "Calendario",  icon: "calendar-outline",   activeIcon: "calendar" },
  { name: "training", label: "Entreno",     icon: "barbell-outline",    activeIcon: "barbell" },
  { name: "profile",  label: "Perfil",      icon: "person-outline",     activeIcon: "person" },
];

export default function TabsLayout() {
  const t = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: t.card, borderTopColor: t.border, borderTopWidth: 1.5 },
        tabBarActiveTintColor: t.salmon,
        tabBarInactiveTintColor: t.muted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: "600" },
      }}
    >
      {TABS.map(tab => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.label,
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons name={focused ? tab.activeIcon : tab.icon} size={size} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
