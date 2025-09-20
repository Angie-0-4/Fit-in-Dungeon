import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/** Minimaler Typ für deine Vorlagen (exportieren, damit Calendar importieren kann) */
export interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: { name: string }[];
  archived?: boolean;
}

@Component({
  selector: 'app-add-workout-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-workout-modal.component.html',
  styleUrls: ['./add-workout-modal.component.css']
})
export class AddWorkoutModalComponent {
  @Input() open = false;
  @Input() templates: WorkoutTemplate[] = [];
  @Output() pick  = new EventEmitter<WorkoutTemplate>();
  @Output() close = new EventEmitter<void>();

  preview(t: WorkoutTemplate): string {
    const list = (t.exercises ?? []).map(e => e.name);
    return list.join(', ');
  }

  q = signal<string>('');            // Suche
  hideArchived = signal<boolean>(true);

  onQueryChange(v: string){ this.q.set(v); }

  filtered = computed<WorkoutTemplate[]>(() => {
    const q = this.q().trim().toLowerCase();
    return (this.templates ?? [])
      .filter(t => !this.hideArchived() || !t.archived)
      .filter(t =>
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.exercises.some(e => e.name.toLowerCase().includes(q))
      );
  });

  onBackdropClick(ev: MouseEvent) {
    const el = ev.target as HTMLElement | null;
    if (el && el.classList.contains('backdrop')) this.onCancel();
  }
  onCancel(){ this.close.emit(); }
  onPick(t: WorkoutTemplate){ this.pick.emit(t); }
}