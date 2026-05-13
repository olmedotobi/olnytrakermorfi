import { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert, Modal, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import { scheduleEventNotification, cancelEventNotification } from "@/lib/notifications";
import { useTheme } from "@/lib/theme";

type CalendarEvent = { id: string; date: string; time: string; title: string; description: string };

function todayStr() { return new Date().toISOString().slice(0, 10); }
function fmtDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}
function addDays(d: string, n: number) {
  const dt = new Date(d + "T12:00:00");
  dt.setDate(dt.getDate() + n);
  return dt.toISOString().slice(0, 10);
}
function monthLabel(d: string) {
  const dt = new Date(d + "T12:00:00");
  return dt.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
}
function getDaysInMonth(d: string) {
  const dt = new Date(d + "T12:00:00");
  const y = dt.getFullYear(), m = dt.getMonth();
  const first = new Date(y, m, 1);
  const last = new Date(y, m + 1, 0);
  const days: string[] = [];
  for (let i = 1; i <= last.getDate(); i++) {
    days.push(`${y}-${String(m + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`);
  }
  return { days, startWeekday: first.getDay() };
}

export default function CalendarScreen() {
  const t = useTheme();
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [monthRef, setMonthRef] = useState(todayStr().slice(0, 7) + "-01");
  const [events, setEvents] = useState<Record<string, CalendarEvent[]>>({});
  const [dayEvents, setDayEvents] = useState<CalendarEvent[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editEvent, setEditEvent] = useState<CalendarEvent | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [time, setTime] = useState("");
  const [saving, setSaving] = useState(false);

  const loadMonth = useCallback(async (month: string) => {
    const res = await apiGet<CalendarEvent[]>(`/api/calendar-events?month=${month}`);
    const byDate: Record<string, CalendarEvent[]> = {};
    (Array.isArray(res) ? res : []).forEach(e => {
      if (!byDate[e.date]) byDate[e.date] = [];
      byDate[e.date].push(e);
    });
    setEvents(prev => ({ ...prev, ...byDate }));
  }, []);

  useEffect(() => { loadMonth(monthRef.slice(0, 7)); }, [loadMonth, monthRef]);

  useEffect(() => {
    setDayEvents(events[selectedDate] ?? []);
  }, [selectedDate, events]);

  const openNew = () => {
    setEditEvent(null);
    setTitle(""); setDescription(""); setTime("");
    setModalVisible(true);
  };

  const openEdit = (ev: CalendarEvent) => {
    setEditEvent(ev);
    setTitle(ev.title); setDescription(ev.description); setTime(ev.time);
    setModalVisible(true);
  };

  const saveEvent = async () => {
    if (!title.trim()) { Alert.alert("Ingresá un título"); return; }
    if (time && !/^\d{2}:\d{2}$/.test(time)) { Alert.alert("Formato de hora inválido. Usá HH:MM"); return; }
    setSaving(true);
    try {
      if (editEvent) {
        await apiPost("/api/calendar-events", { ...editEvent, title: title.trim(), description: description.trim(), time });
        await cancelEventNotification(editEvent.id);
        const updated = { ...editEvent, title: title.trim(), description: description.trim(), time };
        await scheduleEventNotification(updated);
      } else {
        const created = await apiPost<CalendarEvent>("/api/calendar-events", {
          date: selectedDate, time, title: title.trim(), description: description.trim(),
        });
        await scheduleEventNotification(created);
      }
      setModalVisible(false);
      await loadMonth(selectedDate.slice(0, 7));
    } finally {
      setSaving(false);
    }
  };

  const deleteEvent = (ev: CalendarEvent) => {
    Alert.alert("Eliminar evento", `¿Eliminar "${ev.title}"?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: async () => {
        await apiDelete(`/api/calendar-events?id=${ev.id}`);
        await cancelEventNotification(ev.id);
        await loadMonth(selectedDate.slice(0, 7));
      }},
    ]);
  };

  const { days, startWeekday } = getDaysInMonth(monthRef);
  const weekDays = ["D", "L", "M", "M", "J", "V", "S"];

  const prevMonth = () => {
    const dt = new Date(monthRef + "T12:00:00");
    dt.setMonth(dt.getMonth() - 1);
    const next = dt.toISOString().slice(0, 8) + "01";
    setMonthRef(next);
    loadMonth(next.slice(0, 7));
  };
  const nextMonth = () => {
    const dt = new Date(monthRef + "T12:00:00");
    dt.setMonth(dt.getMonth() + 1);
    const next = dt.toISOString().slice(0, 8) + "01";
    setMonthRef(next);
    loadMonth(next.slice(0, 7));
  };

  const s = styles(t);
  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <View style={s.header}>
          <Text style={s.title}>Calendario</Text>
        </View>

        {/* Month navigator */}
        <View style={s.monthRow}>
          <TouchableOpacity onPress={prevMonth} style={s.arrowBtn}><Ionicons name="chevron-back" size={20} color={t.text} /></TouchableOpacity>
          <Text style={s.monthLabel}>{monthLabel(monthRef)}</Text>
          <TouchableOpacity onPress={nextMonth} style={s.arrowBtn}><Ionicons name="chevron-forward" size={20} color={t.text} /></TouchableOpacity>
        </View>

        {/* Calendar grid */}
        <View style={s.calCard}>
          <View style={s.weekRow}>
            {weekDays.map((d, i) => <Text key={i} style={s.weekDay}>{d}</Text>)}
          </View>
          <View style={s.daysGrid}>
            {Array.from({ length: startWeekday }).map((_, i) => <View key={`e${i}`} style={s.dayCell} />)}
            {days.map(d => {
              const isSelected = d === selectedDate;
              const isToday = d === todayStr();
              const hasEvents = (events[d]?.length ?? 0) > 0;
              return (
                <TouchableOpacity key={d} style={[s.dayCell, isSelected && { backgroundColor: t.text }, isToday && !isSelected && { borderWidth: 1.5, borderColor: t.salmon }]}
                  onPress={() => setSelectedDate(d)}>
                  <Text style={[s.dayNum, isSelected && { color: t.card }]}>{parseInt(d.slice(8))}</Text>
                  {hasEvents && <View style={[s.eventDot, { backgroundColor: isSelected ? t.card : t.salmon }]} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Selected day */}
        <View style={s.dayCard}>
          <View style={s.dayHeader}>
            <Text style={s.dayTitle}>{fmtDate(selectedDate)}{selectedDate === todayStr() ? " · Hoy" : ""}</Text>
            <TouchableOpacity style={s.addBtn} onPress={openNew}>
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={s.addBtnText}>Evento</Text>
            </TouchableOpacity>
          </View>

          {dayEvents.length === 0 ? (
            <Text style={s.empty}>Sin eventos. Tocá + Evento para agendar.</Text>
          ) : (
            dayEvents.map(ev => (
              <View key={ev.id} style={s.eventCard}>
                <View style={s.eventLeft}>
                  {ev.time ? <Text style={s.eventTime}>{ev.time}</Text> : <Ionicons name="calendar-outline" size={14} color={t.muted} />}
                </View>
                <View style={s.eventBody}>
                  <Text style={s.eventTitle}>{ev.title}</Text>
                  {ev.description ? <Text style={s.eventDesc}>{ev.description}</Text> : null}
                  {ev.time ? <Text style={s.alarmBadge}>🔔 Alarma programada</Text> : null}
                </View>
                <TouchableOpacity onPress={() => openEdit(ev)} style={s.editBtn}><Ionicons name="pencil" size={15} color={t.muted} /></TouchableOpacity>
                <TouchableOpacity onPress={() => deleteEvent(ev)} style={s.editBtn}><Ionicons name="trash-outline" size={15} color={t.danger} /></TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Create / Edit modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={[s.modal, { backgroundColor: t.bg }]}>
          <View style={s.modalHeader}>
            <Text style={s.title}>{editEvent ? "Editar evento" : "Nuevo evento"}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color={t.muted} />
            </TouchableOpacity>
          </View>

          <Text style={s.fieldLabel}>FECHA</Text>
          <Text style={[s.input, { color: t.text }]}>{fmtDate(selectedDate)}</Text>

          <Text style={[s.fieldLabel, { marginTop: 16 }]}>TÍTULO *</Text>
          <TextInput style={s.inputField} placeholder="Ej: Médico, Gym, Cumpleaños..." placeholderTextColor={t.muted}
            value={title} onChangeText={setTitle} />

          <Text style={[s.fieldLabel, { marginTop: 16 }]}>HORA (opcional — activa la alarma)</Text>
          <TextInput style={s.inputField} placeholder="HH:MM  (ej: 09:30)" placeholderTextColor={t.muted}
            value={time} onChangeText={setTime} keyboardType="numbers-and-punctuation" maxLength={5} />
          {time ? <Text style={{ fontSize: 12, color: t.mint, marginTop: 4 }}>🔔 Se va a programar una notificación para este horario</Text> : null}

          <Text style={[s.fieldLabel, { marginTop: 16 }]}>DESCRIPCIÓN (opcional)</Text>
          <TextInput style={[s.inputField, { height: 80, textAlignVertical: "top" }]} placeholder="Detalles..."
            placeholderTextColor={t.muted} value={description} onChangeText={setDescription} multiline />

          <TouchableOpacity style={[s.saveBtn, { marginTop: 24 }]} onPress={saveEvent} disabled={saving}>
            <Text style={s.saveBtnText}>{saving ? "Guardando..." : "Guardar evento"}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = (t: ReturnType<typeof useTheme>) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: t.bg },
  header: { padding: 20, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: "800", color: t.text, letterSpacing: -0.5 },
  monthRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginHorizontal: 16, marginBottom: 10 },
  arrowBtn: { padding: 8, borderRadius: 10, borderWidth: 1.5, borderColor: t.border },
  monthLabel: { fontSize: 16, fontWeight: "700", color: t.text, textTransform: "capitalize" },
  calCard: { backgroundColor: t.card, marginHorizontal: 16, borderRadius: 18, padding: 14, borderWidth: 1.5, borderColor: t.border, marginBottom: 12 },
  weekRow: { flexDirection: "row", marginBottom: 6 },
  weekDay: { flex: 1, textAlign: "center", fontSize: 11, fontWeight: "700", color: t.muted },
  daysGrid: { flexDirection: "row", flexWrap: "wrap" },
  dayCell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: "center", justifyContent: "center", borderRadius: 10, padding: 2 },
  dayNum: { fontSize: 14, fontWeight: "600", color: t.text },
  eventDot: { width: 5, height: 5, borderRadius: 99, marginTop: 2 },
  dayCard: { backgroundColor: t.card, marginHorizontal: 16, borderRadius: 18, padding: 18, borderWidth: 1.5, borderColor: t.border },
  dayHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  dayTitle: { fontSize: 16, fontWeight: "700", color: t.text },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: t.salmon, borderRadius: 10, paddingVertical: 7, paddingHorizontal: 12 },
  addBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  empty: { color: t.muted, fontSize: 14, textAlign: "center", paddingVertical: 20 },
  eventCard: { flexDirection: "row", alignItems: "flex-start", backgroundColor: t.input, borderRadius: 12, padding: 12, marginBottom: 8 },
  eventLeft: { width: 44, alignItems: "center", paddingTop: 2 },
  eventTime: { fontSize: 13, fontWeight: "700", color: t.salmon },
  eventBody: { flex: 1 },
  eventTitle: { fontSize: 15, fontWeight: "700", color: t.text },
  eventDesc: { fontSize: 13, color: t.muted, marginTop: 2 },
  alarmBadge: { fontSize: 11, color: t.mint, marginTop: 4 },
  editBtn: { padding: 6 },
  modal: { flex: 1, padding: 24 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  fieldLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 1.2, color: t.muted, textTransform: "uppercase", marginBottom: 6 },
  input: { backgroundColor: t.input, borderRadius: 12, padding: 12, fontSize: 15 },
  inputField: { backgroundColor: t.input, borderWidth: 1.5, borderColor: t.border, borderRadius: 14, padding: 12, fontSize: 15, color: t.text },
  saveBtn: { backgroundColor: t.text, borderRadius: 14, padding: 14, alignItems: "center" },
  saveBtnText: { color: t.card, fontWeight: "700", fontSize: 16 },
});
