import { Component, HostListener, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AddWorkoutModalComponent,
  WorkoutTemplate,
  AddPlanPayLoad, 
} from './add-workout-modal/add-workout-modal.component';

type CalEvent = {
  id: string;
  title: string;
  day: number;             
  start: string;            
  end: string;              
  type?: 'strength'|'cardio'|'mobility'|'other';
  weekly?: boolean;        
  dateISO?: string;         
};

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, AddWorkoutModalComponent],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
})
export class CalendarComponent implements OnInit {
  

  showAddModal = signal(false);
  templates = signal<WorkoutTemplate[]>([]);
  openAddModal()  { this.showAddModal.set(true); }
  closeAddModal() { this.showAddModal.set(false); }


  readonly START_HOUR = 0;
  readonly END_HOUR   = 24;
  readonly SLOT_PX    = 48;

  weekStart!: Date;                              
  weekDays!: { label: string; date: Date }[];    

  
  events = signal<CalEvent[]>([]);

 
  placing = signal(false);
  previewDay   = signal(0);
  previewStart = signal('08:00');
  previewEnd   = signal('09:00');
  private pendingTemplateId: string | null = null;
  private pendingWeekly = false;


  private previewDurationMin = 60;


  ngOnInit(): void {
    this.setWeek(new Date());

   
    try {
      const raw = localStorage.getItem('calendar.templates');
      if (raw) this.templates.set(JSON.parse(raw));
    } catch (_) {  }
    if (!this.templates().length) {
      this.templates.set([
        { id: 't1', name: 'Push Day',  exercises: [{ name: 'Bench Press' }, { name: 'Shoulder Press' }] },
        { id: 't2', name: 'Leg Day',   exercises: [{ name: 'Squat' }, { name: 'Romanian Deadlift' }] },
        { id: 't3', name: 'Cardio 45', exercises: [{ name: 'Treadmill' }], archived: false },
      ]);
    }
  }


  setWeek(base: Date) {
    const d = new Date(base);
    const dow = (d.getDay() + 6) % 7; 
    d.setDate(d.getDate() - dow);
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
      out.push(String(h).padStart(2, '0') + ':00');
    }
    return out;
  }
  private dayDateISO(dayIndex: number): string {
    const d = new Date(this.weekStart);
    d.setDate(d.getDate() + dayIndex);
    d.setHours(0,0,0,0);
    return d.toISOString().slice(0,10); 
  }
  private toMin(t: string) { const [h,m]=t.split(':').map(Number); return (h - this.START_HOUR) * 60 + m; }
  private minToHHMM(min: number) {
    const total = Math.max(0, Math.min((this.END_HOUR - this.START_HOUR) * 60, min));
    const h = Math.floor(total/60) + this.START_HOUR;
    const m = total % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
  }
  private addMinutes(hhmm: string, minutes: number): string {
    const [h, m] = hhmm.split(':').map(Number);
    const tot = h * 60 + m + (minutes || 0);
    const H = Math.floor(tot / 60);
    const M = tot % 60;
    return `${String(H).padStart(2,'0')}:${String(M).padStart(2,'0')}`;
  }


  styleFor(ev: CalEvent) {
    const top = Math.max(0, this.toMin(ev.start) * (this.SLOT_PX/60));
    const height = Math.max(28, (this.toMin(ev.end) - this.toMin(ev.start)) * (this.SLOT_PX/60));
    const { bg, bd } = this.colorFor(ev.type);
    return { top: `${top}px`, height: `${height}px`, background: bg, borderColor: bd };
  }
  colorFor(type: CalEvent['type'] = 'other'){
    switch (type) {
      case 'strength': return { bg:'rgba(33,150,243,.18)', bd:'#2196f3' };
      case 'cardio':   return { bg:'rgba(244,67,54,.18)',  bd:'#f44336' };
      case 'mobility': return { bg:'rgba(76,175,80,.18)',  bd:'#4caf50' };
      default:         return { bg:'rgba(158,158,158,.18)',bd:'#9e9e9e' };
    }
  }
  eventsByDay(day: number): CalEvent[] {
    const iso = this.dayDateISO(day);
    return this.events().filter(ev => ev.day === day && (ev.weekly === true || ev.dateISO === iso));
  }
  evTrack(_idx: number, ev: CalEvent) { return ev.id; }

  private addEventFromTemplate(
    t: WorkoutTemplate,
    day: number,
    start: string,
    end: string,
    weekly: boolean = false
  ): void {
    const id = 'ev_' + Math.random().toString(36).slice(2, 8);
    const ev: CalEvent = { id, title: t.name, day, start, end, type: 'strength', weekly: weekly === true };
    if (!weekly) ev.dateISO = this.dayDateISO(day); 
    this.events.update(arr => [...arr, ev]);
  }
  removeEvent(ev: CalEvent): void {
    if (ev.weekly) {
     
      this.events.update(list => list.filter(x => x.id !== ev.id));
    } else {
     
      this.events.update(list => list.filter(x => !(x.id === ev.id && x.dateISO === ev.dateISO)));
    }
  }

  
  addPickedWorkout(e: AddPlanPayLoad) {
   
    this.closeAddModal();

    const t = this.templates().find(x => x.id === e.templateId);
    if (!t) return;


    this.previewDurationMin = e.durationMin ?? 60;

    if (e.placeByClick) {
      
      this.pendingTemplateId = t.id;
      this.pendingWeekly = !!e.weekly;
      this.placing.set(true);
      this.previewDay.set(e.day ?? 0);
      this.previewStart.set(e.start ?? '08:00');
      this.previewEnd.set(this.addMinutes(this.previewStart(), this.previewDurationMin));
      return;
    }

   
    const end = this.addMinutes(e.start, this.previewDurationMin);
    this.addEventFromTemplate(t, e.day, e.start, end, e.weekly === true);
  }


  onDayMouseMove(dayIndex: number, ev: MouseEvent) {
    if (!this.placing()) return;
    const target = ev.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const y = ev.clientY - rect.top; 
    const minutes = Math.round(y / (this.SLOT_PX/60));
    const start = this.minToHHMM(minutes);
    this.previewDay.set(dayIndex);
    this.previewStart.set(start);
    this.previewEnd.set(this.addMinutes(start, this.previewDurationMin));
  }
  onDayClick(dayIndex: number, _ev: MouseEvent) {
    if (!this.placing()) return;
    this.previewDay.set(dayIndex);
    this.confirmPlace();
  }
  @HostListener('window:keydown', ['$event'])
  onKey(e: KeyboardEvent){
    if (!this.placing()) return;
    const step = 15;
    const startMin = this.toMin(this.previewStart());
    const endMin   = this.toMin(this.previewEnd());
    if (e.key === 'ArrowUp') {
      this.previewStart.set(this.minToHHMM(startMin - step));
      this.previewEnd.set(this.minToHHMM(endMin   - step));
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      this.previewStart.set(this.minToHHMM(startMin + step));
      this.previewEnd.set(this.minToHHMM(endMin   + step));
      e.preventDefault();
    } else if (e.key === 'Enter') {
      this.confirmPlace();
      e.preventDefault();
    } else if (e.key === 'Escape') {
      this.cancelPlace();
      e.preventDefault();
    }
  }
  ghostTopPx(): number {
    const [hStr, mStr] = this.previewStart().split(':');
    const h = Number(hStr) || this.START_HOUR;
    const m = Number(mStr) || 0;
    const minutesFromStart = (h - this.START_HOUR) * 60 + m;
    return Math.max(0, minutesFromStart * (this.SLOT_PX / 60));
  }
  confirmPlace() {
    if (!this.pendingTemplateId) return;
    const t = this.templates().find(x => x.id === this.pendingTemplateId);
    if (!t) return;

    const d = this.previewDay();
    const s = this.previewStart();
    const e = this.addMinutes(s, this.previewDurationMin);

    this.addEventFromTemplate(t, d, s, e, this.pendingWeekly);
    this.cancelPlace();
  }
  cancelPlace() {
    this.placing.set(false);
    this.pendingTemplateId = null;
    this.pendingWeekly = false;
  }

 
  evTrackBy(_i: number, ev: CalEvent) { return ev.id; }
}