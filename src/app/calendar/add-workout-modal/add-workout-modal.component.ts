import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: { name: string }[];
  folderId?: string | null;
  archived?: boolean;
  lastUsed?: string | Date;
}

export type AddPlanPayLoad = {
  templateId: string;
  day: number;          
  start: string;        
  durationMin: number;          
  weekly: boolean;
  placeByClick: boolean;
};

@Component({
  selector: 'app-add-workout-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-workout-modal.component.html',
  styleUrls: ['./add-workout-modal.component.css'],
})
export class AddWorkoutModalComponent {
  @Input() open = false;
  @Input() templates: WorkoutTemplate[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() pick  = new EventEmitter<AddPlanPayLoad>();

  trackByTpl = (_: number, t: WorkoutTemplate) => t.id;

  search = '';
  hideArchived = false;

  selectedId: string | null = null;
  day   = 0;
  durationH = 1;
  durationM = 0;
  weekly = false;
  placeByClick = true;

  dayNames = ['Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag','Sonntag'];

  filtered() {
    const q = this.search.toLowerCase().trim();
    return this.templates
      .filter(t => !this.hideArchived || !t.archived)
      .filter(t => !q || t.name.toLowerCase().includes(q) || t.exercises.some(e => e.name.toLowerCase().includes(q)));
  }

  preview(t: WorkoutTemplate) {
    const names = (t.exercises || []).map(e => e.name);
    const head = names.slice(0,3).join(', ');
    return head + (names.length > 3 ? ' …' : '');
  }

 
  private durationMin(): number {
    const h = Math.max(0, Math.floor(this.durationH || 0));
    const m = Math.max(0, Math.min(59, Math.floor(this.durationM || 0)));
    return h * 60 + m || 60; 
  }

  confirm() {
    if (!this.selectedId) return;

    this.pick.emit({
      templateId: this.selectedId!,
      durationMin: this.durationMin(),
      weekly: this.weekly === true,
      placeByClick: true 
    } as AddPlanPayLoad);
}
}
