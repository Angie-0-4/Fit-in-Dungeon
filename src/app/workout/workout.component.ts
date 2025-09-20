import { Component, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// <-- Service für Mongo-Workouts
import { WorkoutService, Workout } from '../services/workout.service';

/* ------- Typsichere Modelle (deine Vorlagen/Folder) ------- */
type ID = string;
interface Exercise { name: string; muscle?: string; }
interface WorkoutTemplate {
  id: ID;
  name: string;
  exercises: Exercise[];        // nie undefined
  lastUsed?: string;            // ISO
  folderId: ID | null;          // null = „Ohne Ordner“
  archived?: boolean;
}
interface Folder { id: ID; name: string; }

/* ------- Hilfszeug ------- */
const ALL   = 'ALL';
const NONE  = 'NONE';
type FolderFilter = typeof ALL | typeof NONE | ID;

@Component({
  selector: 'app-workout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './workout.component.html',
  styleUrls: ['./workout.component.css'],
})
export class WorkoutComponent implements OnInit {

  /* =======================
     1) Deine bisherigen Daten
     ======================= */
  private _folders = signal<Folder[]>([
    { id: 'f1', name: 'Push/Pull' },
    { id: 'f2', name: 'Legs' },
    { id: 'f3', name: 'Cardio' },
  ]);
  private _templates = signal<WorkoutTemplate[]>([
    {
      id: 't1',
      name: 'Donnerstag kurz / Sonntag lang',
      exercises: [
        { name: 'Pull Up (Assisted)' },
        { name: 'Lat Pulldown (Cable)' },
        { name: 'Seated Row (Cable)' },
        { name: 'Cable Pulldown' },
        { name: 'Bicep Curl (Dumbbell)' },
      ],
      lastUsed: '2025-01-24',
      folderId: 'f1',
    },
    {
      id: 't2',
      name: 'Push Day',
      exercises: [
        { name: 'Bench Press (Barbell)' },
        { name: 'Shoulder Press (Dumbbell)' },
        { name: 'Triceps Pushdown' },
      ],
      lastUsed: '2025-02-15',
      folderId: 'f1',
    },
    {
      id: 't3',
      name: 'Leg Day',
      exercises: [
        { name: 'Squat' },
        { name: 'Romanian Deadlift' },
        { name: 'Leg Press' },
      ],
      folderId: 'f2',
    },
    {
      id: 't4',
      name: 'Mobility 30',
      exercises: [
        { name: 'Hip Opener' },
        { name: 'T-Spine Rotation' },
      ],
      folderId: 'f3',
      archived: true,
    },
  ]);

  /* Eingaben */
  newFolderName = '';

  /* Aktueller Ordnerfilter */
  selectedFolderId = signal<FolderFilter>(ALL);

  /* Abgeleitete Listen */
  folders = computed(() => this._folders());
  templates = computed(() => this._templates().filter(t => !t.archived));
  archivedTemplates = computed(() => this._templates().filter(t => !!t.archived));

  filteredTemplates = computed<WorkoutTemplate[]>(() => {
    const id = this.selectedFolderId();
    const list = this.templates();
    if (id === ALL)  return list;
    if (id === NONE) return list.filter(t => t.folderId === null);
    return list.filter(t => t.folderId === id);
  });

  /* ---------- Template-Helfer ---------- */
  trackByTemplate = (_: number, t: WorkoutTemplate) => t.id;
  trackByFolder   = (_: number, f: Folder) => f.id;

  preview(t: WorkoutTemplate): string {
    const names = t.exercises.map(e => e.name);
    const head  = names.slice(0, 3).join(', ');
    const more  = names.length > 3 ? ' …' : '';
    return head + more;
  }

  /* ---------- UI-Aktionen (dein Code) ---------- */
  selectFolder(id: FolderFilter): void {
    this.selectedFolderId.set(id);
  }
  isSelected(id: FolderFilter): boolean {
    return this.selectedFolderId() === id;
  }

  addFolder(): void {
    const name = this.newFolderName.trim();
    if (!name) return;
    const id = 'f_' + Math.random().toString(36).slice(2, 9);
    this._folders.update(list => [...list, { id, name }]);
    this.newFolderName = '';
  }

  moveToFolder(t: WorkoutTemplate, folderId: ID | null): void {
    this._templates.update(list =>
      list.map(x => (x.id === t.id ? { ...x, folderId } : x))
    );
  }

  createTemplate(): void {
    const id = 't_' + Math.random().toString(36).slice(2, 9);
    const draft: WorkoutTemplate = {
      id,
      name: 'Neues Workout',
      exercises: [],
      folderId: this.selectedFolderId() === ALL || this.selectedFolderId() === NONE
        ? null
        : (this.selectedFolderId() as ID),
    };
    this._templates.update(list => [draft, ...list]);
  }

  duplicate(t: WorkoutTemplate): void {
    const id = 't_' + Math.random().toString(36).slice(2, 9);
    const copy: WorkoutTemplate = { ...t, id, name: `${t.name} (Kopie)`, archived: false };
    this._templates.update(list => [copy, ...list]);
  }

  archive(t: WorkoutTemplate): void {
    this._templates.update(list =>
      list.map(x => (x.id === t.id ? { ...x, archived: true } : x))
    );
  }

  unarchive(t: WorkoutTemplate): void {
    this._templates.update(list =>
      list.map(x => (x.id === t.id ? { ...x, archived: false } : x))
    );
  }

  remove(t: WorkoutTemplate): void {
    this._templates.update(list => list.filter(x => x.id !== t.id));
  }

  startFromTemplate(t: WorkoutTemplate): void {
    console.log('Starten mit Vorlage:', t);
  }

  startEmpty(): void {
    console.log('Leeres Workout starten');
  }

  // Anzeigename für aktuellen Folder-Filter
  folderName(filter: 'ALL' | 'NONE' | string): string {
    if (filter === 'ALL')  return 'Alle Vorlagen';
    if (filter === 'NONE') return 'Vorlagen ohne Ordner';
    const f = this.folders().find(x => x.id === filter);
    return f ? f.name : '';
  }

  /* =======================
     2) NEU: Daten aus Mongo
     ======================= */

  // Server-Workouts (Mongo)
  workouts = signal<Workout[]>([]);
  workoutError = signal<string>('');

  // Filter für Server-Workouts
  wQuery = signal<string>('');        // Suchtext
  wType = signal<string>('');         // Push/Pull/Legs/...
  wDifficulty = signal<string>('');   // Beginner/Intermediate/Advanced

  // Gefilterte Server-Workouts
  filteredWorkouts = computed<Workout[]>(() => {
    const q = this.wQuery().toLowerCase();
    const t = this.wType();
    const d = this.wDifficulty();

    return this.workouts().filter(w =>
      (!t || w.type === t) &&
      (!d || w.difficulty === d) &&
      (!q || w.name.toLowerCase().includes(q) || w.muscleGroup.toLowerCase().includes(q))
    );
  });

  constructor(private ws: WorkoutService) {}

  ngOnInit(): void {
    this.ws.list().subscribe({
      next: (res: Workout[]) => {
        // wir bekommen direkt ein Array
        this.workouts.set(res);
      },
      error: (err: unknown) => {
        // sauber typisieren und Fehlermeldung setzen
        const msg =
          typeof err === 'object' && err !== null && 'message' in err
            ? String((err as any).message)
            : 'Failed to load workouts';
        this.workoutError.set(msg);
      }
    });
  }
}