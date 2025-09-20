import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// Modal import (Pfad wie unten im Ordner-Aufbau)
import {
  AddWorkoutModalComponent,
  WorkoutTemplate
} from './add-workout-modal/add-workout-modal.component';

type CalEvent = {
  id: string;
  title: string;
  day: number;        // 0 = Mo ... 6 = So
  start: string;      // "HH:MM"
  end: string;        // "HH:MM"
  type?: 'strength' | 'cardio' | 'mobility' | 'other';
};

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, AddWorkoutModalComponent],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {

  // Modal steuern
  showAddModal = false;

  // Vorlagen, die im Modal erscheinen (später aus deinem Workout-Service/API laden)
  templates: WorkoutTemplate[] = [];

  // Kalender-Setup
  readonly START_HOUR = 6;
  readonly END_HOUR = 22;
  readonly SLOT_HEIGHT = 48; // px pro Stunde

  weekStart!: Date;     // Montag-Start
  weekDays!: { label: string; date: Date }[];

  // Events im Kalender (kannst du leer lassen und per Modal+Click hinzufügen)
  events: CalEvent[] = [];

  ngOnInit(): void {
    this.setWeek(new Date());

    // Demo-Vorlagen (bis du aus dem Workout-Bereich lieferst)
    this.templates = [
      { id: 't1', name: 'Push Day',  exercises: [{ name: 'Bench Press' }, { name: 'Shoulder Press' }] },
      { id: 't2', name: 'Leg Day',   exercises: [{ name: 'Squat' }, { name: 'Romanian Deadlift' }] },
      { id: 't3', name: 'Cardio 45', exercises: [{ name: 'Treadmill' }], archived: false },
    ];
  }

  // Callback wenn im Modal eine Vorlage gewählt wurde
  onTemplatePicked(t: WorkoutTemplate) {
    this.showAddModal = false;
    // Hier NUR loggen – Platzhalter. Du kannst hier sofort eine „Platzierung“
    // triggern oder nach einem Klick im Raster einfügen (siehe unten).
    console.log('Workout gewählt:', t);
    // Beispiel: direkt am Montag 07:30–09:00 eintragen:
    // this.addEventFromTemplate(t, 0, '07:30', '09:00');
  }

  // Beispiel-Helfer, um aus einer Vorlage ein Event zu basteln
  addEventFromTemplate(t: WorkoutTemplate, day: number, start: string, end: string) {
    const id = 'ev_' + Math.random().toString(36).slice(2, 8);
    this.events = [
      ...this.events,
      { id, title: t.name, day, start, end, type: 'strength' }
    ];
  }

  setWeek(base: Date) {
    const d = new Date(base);
    const day = (d.getDay() + 6) % 7;  // Montag = 0
    d.setDate(d.getDate() - day);
    d.setHours(0,0,0,0);
    this.weekStart = d;

    const fmt = new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: '2-digit', month: '2-digit' });
    this.weekDays = Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(d);
      date.setDate(d.getDate() + i);
      return { label: fmt.format(date), date };
    });
  }

  prevWeek(){ const d = new Date(this.weekStart); d.setDate(d.getDate()-7); this.setWeek(d); }
  nextWeek(){ const d = new Date(this.weekStart); d.setDate(d.getDate()+7); this.setWeek(d); }

  hours(): string[] {
    const out: string[] = [];
    for (let h = this.START_HOUR; h <= this.END_HOUR; h++) {
      out.push(String(h).padStart(2,'0')+':00');
    }
    return out;
  }

  // Position/Style für Event-Kacheln
  styleFor(ev: CalEvent) {
    const toMin = (t:string)=>{ const [h,m]=t.split(':').map(Number); return (h-this.START_HOUR)*60+m; };
    const top = Math.max(0, toMin(ev.start) * (this.SLOT_HEIGHT/60));
    const height = Math.max(28, (toMin(ev.end)-toMin(ev.start)) * (this.SLOT_HEIGHT/60));
    const {bg,bd}=this.colorFor(ev.type);
    return { top: `${top}px`, height: `${height}px`, background: bg, borderColor: bd };
  }

  colorFor(type: CalEvent['type']='other'){
    switch(type){
      case 'strength': return { bg:'rgba(33,150,243,.18)', bd:'#2196f3' }; // blau
      case 'cardio':   return { bg:'rgba(244,67,54,.18)',  bd:'#f44336' }; // rot
      case 'mobility': return { bg:'rgba(76,175,80,.18)',  bd:'#4caf50' }; // grün
      default:         return { bg:'rgba(158,158,158,.18)',bd:'#9e9e9e' }; // grau
    }
  }

  eventsByDay(day: number) {
    return this.events.filter(e => e.day === day);
  }
  evTrack(_index: number, ev: CalEvent) { return ev.id; }

  // Optional: Klick in eine Day-Spalte, um Event an einer Zeit zu droppen
  onDayClick(dayIndex: number, ev: MouseEvent) {
    const target = ev.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const y = ev.clientY - rect.top; // px relativ zur Spalte
    const minutesFromStart = Math.round(y / (this.SLOT_HEIGHT/60));
    const totalMin = minutesFromStart + this.START_HOUR * 60;
    const hh = String(Math.floor(totalMin / 60)).padStart(2,'0');
    const mm = String(totalMin % 60).padStart(2,'0');
    const start = `${hh}:${mm}`;
    const end   = `${hh}:${String((parseInt(mm,10)+60)%60).padStart(2,'0')}`; // +60min simple

    // Hier könntest du den zuletzt ausgewählten Template-Namen merken.
    // Für das Demo nehmen wir den ersten Template (falls vorhanden).
    if (this.templates.length > 0) {
      this.addEventFromTemplate(this.templates[0], dayIndex, start, end);
    }
  }
}