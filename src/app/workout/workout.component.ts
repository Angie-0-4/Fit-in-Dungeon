import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WorkoutService } from '../services/workout.service';


export interface Workout {
  name: string;
  equipment?: string;
  difficulty?: string;   
  muscleGroup?: string;  
  type?: string;         
  riskLevel?: string;
}

type ID = string;

interface Exercise {
  name: string;
  muscleGroup?: string;
  difficulty?: string;
  type?: string;
  equipment?: string;
  riskLevel?: string;
}
interface WorkoutTemplate {
  id: ID;
  name: string;
  exercises: Exercise[];
  folderId: ID | null;
  archived?: boolean;
  lastUsed?: string | Date;
}
interface Folder { id: ID; name: string; }


const ALL = 'ALL';
const NONE = 'NONE';
type FolderFilter = typeof ALL | typeof NONE | ID;

@Component({
  selector: 'app-workout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './workout.component.html',
  styleUrls: ['./workout.component.css'],
})
export class WorkoutComponent implements OnInit {

 
  readonly ALL  = ALL;
  readonly NONE = NONE;


  today = signal(new Date());
  city  = signal('Berlin');

  constructor(private ws: WorkoutService, private router: Router) {}

 
  private persistTemplates(): void {
    try {
      localStorage.setItem('calendar.templates', JSON.stringify(this._templates()));
    } catch {  }
  }

  
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
        { name: 'Pull Up (Assisted)', muscleGroup: 'Back' },
        { name: 'Lat Pulldown (Cable)', muscleGroup: 'Back' },
        { name: 'Seated Row (Cable)', muscleGroup: 'Back' },
      ],
      lastUsed: '2025-01-24',
      folderId: null,
    },
    {
      id: 't2',
      name: 'Push Day',
      exercises: [
        { name: 'Bench Press (Barbell)', muscleGroup: 'Chest' },
        { name: 'Shoulder Press (Dumbbell)', muscleGroup: 'Shoulders' },
        { name: 'Triceps Pushdown', muscleGroup: 'Arms' },
      ],
      lastUsed: '2025-02-15',
      folderId: 'f1',
    },
    {
      id: 't3',
      name: 'Leg Day',
      exercises: [
        { name: 'Squat', muscleGroup: 'Legs' },
        { name: 'Romanian Deadlift', muscleGroup: 'Legs' },
        { name: 'Leg Press', muscleGroup: 'Legs' },
      ],
      folderId: 'f2',
      archived: true,
    },
  ]);


  selectedFolderId = signal<FolderFilter>(ALL);

  folders            = computed(() => this._folders());
  templates         = computed(() => this._templates().filter(t => !t.archived));
  archivedTemplates = computed(() => this._templates().filter(t => !!t.archived));

  filteredTemplates = computed<WorkoutTemplate[]>(() => {
    const id = this.selectedFolderId();
    const list = this.templates();
    if (id === ALL)  return list;
    if (id === NONE) return list.filter(t => t.folderId === null);
    return list.filter(t => t.folderId === id);
  });

  currentFolderIndex = computed(() => {
    const id = this.selectedFolderId();
    if (id === ALL || id === NONE) return -1;
    return this.folders().findIndex(f => f.id === id);
  });

  currentFolderName = computed(() => {
    const id = this.selectedFolderId();
    if (id === ALL)  return 'Alle';
    if (id === NONE) return 'Ohne Ordner';
    return this.folders().find(f => f.id === id)?.name ?? '';
  });

  prevFolder(): void {
    const list = this.folders();
    const id = this.selectedFolderId();
    if (id === ALL)  { this.selectedFolderId.set(NONE); return; }
    if (id === NONE) { if (list.length) this.selectedFolderId.set(list[0].id); return; }
    const i = this.currentFolderIndex();
    if (i <= 0) { this.selectedFolderId.set(NONE); return; }
    this.selectedFolderId.set(list[i - 1].id);
  }

  nextFolder(): void {
    const list = this.folders();
    const id = this.selectedFolderId();
    if (id === ALL)  { if (list.length) this.selectedFolderId.set(list[0].id); return; }
    if (id === NONE) { if (list.length) this.selectedFolderId.set(list[0].id); return; }
    const i = this.currentFolderIndex();
    if (i < 0) { if (list.length) this.selectedFolderId.set(list[0].id); return; }
    if (i >= list.length - 1) { this.selectedFolderId.set(ALL); return; }
    this.selectedFolderId.set(list[i + 1].id);
  }

  jumpTo(id: FolderFilter) { this.selectedFolderId.set(id); }

  addFolder(): void {
    const name = this.newFolderName.trim();
    if (!name) return;
    const id = 'f_' + Math.random().toString(36).slice(2, 9);
    this._folders.update(v => [...v, { id, name }]);
    this.newFolderName = '';
    this.selectedFolderId.set(id);
  }

  deleteCurrentFolder(): void {
    const id = this.selectedFolderId();
    if (id === ALL || id === NONE) return;

    this._templates.update(ts => ts.map(t => (t.folderId === id ? { ...t, folderId: null } : t)));
    this._folders.update(fs => fs.filter(f => f.id !== id));
    this.selectedFolderId.set(ALL);

    this.persistTemplates(); 
  }

  moveToFolder(t: WorkoutTemplate, folderId: ID | null) {
    this._templates.update(list => list.map(x => x.id === t.id ? { ...x, folderId } : x));
    this.persistTemplates(); 
  }


  showCreate = signal(false);
  draft = signal<WorkoutTemplate | null>(null);

  newFolderName = '';

  openCreate(): void {
    const cur = this.selectedFolderId();
    this.draft.set({
      id: 'draft',
      name: '',
      exercises: [],
      folderId: cur === ALL ? null : (cur === NONE ? null : (cur as string)),
    });
    this.showCreate.set(true);
  }

  closeCreate(): void {
    this.showCreate.set(false);
    this.draft.set(null);
  }

  updateDraftName(name: string) {
    const d = this.draft(); if (d) this.draft.set({ ...d, name });
  }

  updateDraftFolder(folderId: string) {
    const d = this.draft(); if (d) this.draft.set({ ...d, folderId: folderId || null });
  }

  removeExerciseAt(i: number) {
    const d = this.draft(); if (!d) return;
    this.draft.set({ ...d, exercises: d.exercises.filter((_, idx) => idx !== i) });
  }

  saveTemplate(): void {
    const d = this.draft(); if (!d) return;
    const name = (d.name || '').trim();
    if (!name || d.exercises.length === 0) return;

    const id = 't_' + Math.random().toString(36).slice(2, 9);
    this._templates.update(list => [
      { id, name, exercises: d.exercises, folderId: d.folderId ?? null, archived: false },
      ...list
    ]);

    this.showCreate.set(false);
    this.draft.set(null);

    this.persistTemplates();
  }

  duplicate(t: WorkoutTemplate) {
    const id = 't_' + Math.random().toString(36).slice(2, 9);
    const copy: WorkoutTemplate = { ...t, id, name: `${t.name} (Kopie)`, archived: false };
    this._templates.update(list => [copy, ...list]);
    this.persistTemplates();
  }

  archive(t: WorkoutTemplate) {
    this._templates.update(list => list.map(x => x.id === t.id ? { ...x, archived: true } : x));
    this.persistTemplates(); 
  }

  unarchive(t: WorkoutTemplate) {
    this._templates.update(list => list.map(x => x.id === t.id ? { ...x, archived: false } : x));
    this.persistTemplates();
  }

  remove(t: WorkoutTemplate) {
    this._templates.update(list => list.filter(x => x.id !== t.id));
    this.persistTemplates(); 
  }

  startFromTemplate(t: WorkoutTemplate) {
    
    this._templates.update(list =>
      list.map(x => x.id === t.id ? { ...x, lastUsed: new Date().toISOString() } : x)
    );
    this.persistTemplates(); 

    console.log('Start mit Vorlage:', t);
    this.router.navigate(['/main/session'], { state: { template: t } });
  }

  startEmpty() {
    console.log('Leeres Workout starten');
    this.router.navigate(['/main/session'], { state: { template: null } });
  }


  workouts = signal<Workout[]>([]);
  workoutError = signal<string>('');

 
  pickerQuery    = signal('');
  pickerBodyPart = signal<string>(''); 

  
  bodyParts: string[] = [
    'Arms','Biceps','Triceps','Forearms',
    'Shoulders','Chest','Back','Lats','Lower Back',
    'Core','Abs','Obliques',
    'Legs','Quads','Hamstrings','Glutes','Calves',
    'Full Body','Cardio','Neck'
  ];

  
  private bpMap: Record<string, string[]> = {
    arms: ['arms', 'biceps', 'triceps', 'forearms'],
    legs: ['legs', 'quads', 'hamstrings', 'glutes', 'calves'],
    back: ['back', 'lats', 'lower back', 'back/biceps'],
    shoulders: ['shoulders', 'delts'],
    core: ['core', 'abs', 'obliques'],
    chest: ['chest'],
    cardio: ['cardio'],
    'full body': ['full body', 'full-body']
  };

  pickableExercises = computed<Workout[]>(() => {
    const q     = (this.pickerQuery() || '').toLowerCase().trim();
    const bpRaw = (this.pickerBodyPart() || '').toLowerCase().trim();
    const all   = this.workouts();

    const allowed = bpRaw ? (this.bpMap[bpRaw] ?? [bpRaw]) : null;

    return all
      .filter(w => {
        const name   = (w.name || '').toLowerCase();
        const muscle = (w.muscleGroup || '').toLowerCase();

        const nameHit = !q || name.includes(q);
        const bpHit   = !allowed || allowed.some(a => muscle === a || muscle.includes(a));

        return nameHit && bpHit;
      })
      .slice(0, 400);
  });

  addExerciseByWorkout(w: Workout) {
    const d = this.draft(); if (!d) return;
    if (d.exercises.some(e => e.name === w.name)) return;
    const ex: Exercise = {
      name: w.name,
      muscleGroup: w.muscleGroup,
      difficulty: w.difficulty,
      type: w.type,
      equipment: w.equipment,
      riskLevel: w.riskLevel
    };
    this.draft.set({ ...d, exercises: [...d.exercises, ex] });
  }

 
  showCustomModal = signal(false);

  openCustomModal()  { this.showCustomModal.set(true); }
  closeCustomModal() { this.showCustomModal.set(false); }
  setCustomStr<K extends keyof Exercise>(key: K, value: string) {
    this.custom.set({ ...this.custom(), [key]: value });
  }

 
  custom = signal<Partial<Workout>>({
    name: '',
    muscleGroup: '',
    difficulty: '',
    type: '',
    equipment: '',
    riskLevel: ''
  });

  addCustomExercise(): void {
    const c = this.custom();
    const name = (c.name || '').trim();
    if (!name) return;

    const payload: Partial<Workout> = {
      name,
      muscleGroup: c.muscleGroup || '',
      difficulty:  c.difficulty  || '',
      type:        c.type        || '',
      equipment:   c.equipment   || '',
      riskLevel:   c.riskLevel   || ''
    };

   
    this.workouts.update(arr => [{ ...(payload as Workout) }, ...arr]);

 
    this.ws.create(payload).subscribe({
      next: saved => {

        this.workouts.update(arr => [saved, ...arr.filter((_, i) => i !== 0)]);
        this.resetCustom();
      },
      error: _ => this.resetCustom()
    });
  }

  resetCustom(): void {
    this.custom.set({ name: '', muscleGroup: '', difficulty: '', type: '', equipment: '', riskLevel: '' });
  }

  
  ngOnInit(): void {
    // Standardwerte setzen
    this.pickerQuery.set('');
    this.pickerBodyPart.set('');
  
    // Workouts aus Service laden
    this.ws.list().subscribe({
      next: arr => this.workouts.set(arr || []),
      error: err => this.workoutError.set(err?.message ?? 'Fehler beim Laden'),
    });

   
    this.persistTemplates();
  }

 
  preview(t: { exercises: { name: string }[] }): string {
    const names = (t.exercises || []).map(e => e.name);
    const head  = names.slice(0, 3).join(', ');
    return head + (names.length > 3 ? ' …' : '');
  }

  trackByTemplate = (_: number, t: WorkoutTemplate) => t.id;
  trackByFolder   = (_: number, f: Folder)         => f.id;
}