import {
  Component,
  HostListener,
  ElementRef,
  OnInit,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';

interface DialogLine {
  name: string;
  text: string;
  meta?: 'askPassword' | 'askRepeat' | 'askGender' | 'askReady';
}

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css'],
})
export class RegistrationComponent implements OnInit, OnDestroy {
  // ----- Dialog -----
  lines: DialogLine[] = [
    { name: 'A Knight of Muscle Land', text: 'Welcome, traveler...' },
    { name: 'A Knight of Muscle Land', text: 'The King awaits your introduction!' },
    { name: 'King', text: 'Step forward and tell us your name.' }, // danach Name-Form
  ];
  ix = 0;
  displayText = '';
  typing = false;
  showNext = false;
  speed = 35;
  private timer?: number;

  private startEndIndex!: number;
  private navigateAfterReady = false;

  // ----- Name -----
  showNameForm = false;
  username = '';
  nameError = '';
  @ViewChild('unameInput') unameInput!: ElementRef<HTMLInputElement>;
  playerName = '';

  // ----- Password (Schritt 1) + Repeat (Schritt 2) -----
  showPassForm = false;      // nur 1. Feld
  showRepeatForm = false;    // beide Felder
  password = '';
  password2 = '';
  passError = '';
  @ViewChild('pwdInput')  pwdInput!:  ElementRef<HTMLInputElement>;
  @ViewChild('pwd2Input') pwd2Input!: ElementRef<HTMLInputElement>;

  // ----- Auswahl -----
  showGender = false;
  showReady = false;

  // ----- Status -----
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.startEndIndex = this.lines.length - 1;
    this.startCurrentLine();
  }

  ngOnDestroy(): void {
    if (this.timer) clearTimeout(this.timer);
  }

  get currentName(): string { return this.lines[this.ix]?.name ?? ''; }
  get fullText(): string { return this.lines[this.ix]?.text ?? ''; }

  // ----- Helpers -----
  private isAskPasswordLine(): boolean { return this.lines[this.ix]?.meta === 'askPassword'; }
  private isAskRepeatLine(): boolean   { return this.lines[this.ix]?.meta === 'askRepeat'; }
  private isAskGenderLine(): boolean   { return this.lines[this.ix]?.meta === 'askGender'; }
  private isAskReadyLine(): boolean    { return this.lines[this.ix]?.meta === 'askReady'; }

  // ----- Typewriter -----
  private startCurrentLine(): void {
    this.displayText = '';
    this.showNext = false;
    this.typing = true;

    let i = 0;
    const step = () => {
      this.displayText += this.fullText[i++] ?? '';
      if (i < this.fullText.length) {
        this.timer = window.setTimeout(step, this.speed);
      } else {
        this.typing = false;
        // Continue nur, wenn keinerlei Formular/Auswahl offen ist
        this.showNext = !this.showNameForm && !this.showPassForm && !this.showRepeatForm && !this.showGender && !this.showReady;
      }
    };
    this.timer = window.setTimeout(step, this.speed);
  }

  // ----- Continue klicken -----
  onNext(): void {
    if (this.typing) return;

    // 1) Passwort-frage → erstes Feld
    if (this.isAskPasswordLine() && !this.showPassForm) {
      this.showNext = false;
      this.showNameForm = false;
      this.showGender = false;
      this.showRepeatForm = false;
      this.showPassForm = true;
      setTimeout(() => this.pwdInput?.nativeElement.focus(), 0);
      return;
    }

    // 2) Repeat-frage → beide Felder
    if (this.isAskRepeatLine() && !this.showRepeatForm) {
      this.showNext = false;
      this.showNameForm = false;
      this.showPassForm = false;
      this.showGender = false;
      this.showRepeatForm = true;          // jetzt beide Felder zeigen
      setTimeout(() => this.pwd2Input?.nativeElement.focus(), 0);
      return;
    }

    // 3) Gender-Auswahl
    if (this.isAskGenderLine() && !this.showGender) {
      this.showNext = false;
      this.showPassForm = false;
      this.showRepeatForm = false;
      this.showGender = true;
      return;
    }

    // 4) Ready-Auswahl
    if (this.isAskReadyLine() && !this.showReady) {
      this.showNext = false;
      this.showReady = true;
      return;
    }

    // 5) Auf der letzten Start-Zeile → Name-Form öffnen
    if (
      this.ix === this.startEndIndex &&
      !this.showNameForm && !this.showPassForm && !this.showRepeatForm &&
      !this.showGender && !this.showReady
    ) {
      this.showNext = false;
      this.showNameForm = true;
      setTimeout(() => this.unameInput?.nativeElement.focus(), 0);
      return;
    }

    // 6) Normal weiterblättern / ggf. am Ende navigieren
    this.showNext = false;
    if (this.ix < this.lines.length - 1) {
      this.ix++;
      this.startCurrentLine();
    } else if (this.navigateAfterReady) {
      this.router.navigate(['/start']).catch(console.error);
    } else {
      this.showNext = true; // falls am Ende bleiben
    }
  }

  // ----- Name absenden -----
  submitName(): void {
    this.nameError = '';
    const trimmed = (this.username || '').trim();

    if (!trimmed)            { this.nameError = 'Please enter a name.'; return; }
    if (trimmed.length < 2)  { this.nameError = 'Please enter at least 2 characters.'; return; }
    if (trimmed.length > 30) { this.nameError = 'Please enter at most 30 characters.'; return; }

    this.playerName = trimmed;

    const complimentIndex = this.lines.push({
      name: 'King',
      text: `What a great name. It is an honor to meet you, Knight ${trimmed}!`
    }) - 1;

    // genau EINE Frage „How do you protect…“
    this.lines.push({
      name: 'King',
      text: `How do you protect yourself from being imitated, ${trimmed}?`,
      meta: 'askPassword'
    });

    this.showNameForm = false;
    this.username = '';
    this.ix = complimentIndex;
    this.startCurrentLine();
  }

  // ----- Passwort absenden (Schritt 1) -----
  submitPassword(): void {
    this.passError = '';
    const pwd = (this.password ?? '').trim();
  
    if (!pwd)            { this.passError = 'Please enter a password.'; return; }
    if (pwd.length < 6)  { this.passError = 'Use at least 6 characters.'; return; }
    if (pwd.length > 64) { this.passError = 'Use at most 64 characters.'; return; }
  
    // Wenn wir bereits in der Repeat-Zeile sind, KEINEN neuen Eintrag mehr erzeugen
    if (this.isAskRepeatLine()) return;
  
    // Form schließen
    this.showPassForm   = false;
    this.showRepeatForm = false;
  
    // Neue Repeat-Zeile anhängen UND ZU IHR SPRINGEN
    const repeatIndex = this.lines.push({
      name: 'King',
      text: 'Ohh, could you repeat that? My hearing is bad...',
      meta: 'askRepeat'
    }) - 1;
  
    this.ix = repeatIndex;       // <— WICHTIG
    this.startCurrentLine();     // tippt jetzt die neue Zeile, nicht die alte nochmal
  }


  // ----- Passwort + Wiederholung absenden (Schritt 2) -----
  async submitRepeatPassword(): Promise<void> {
    console.log('[repeat] submit');  // Debug
  
    this.passError = '';
    const pwd  = (this.password  ?? '').trim();
    const pwd2 = (this.password2 ?? '').trim();
  
    if (!pwd2)        { this.passError = 'Please repeat your password.'; return; }
    if (pwd !== pwd2) { this.passError = 'Passwords must match.';        return; }
  
    this.loading = true;
    try {
      await firstValueFrom(this.auth.register({
        username: this.playerName || this.username,
        password: pwd
      }));
    } catch (e: any) {
      this.error = e?.message ?? 'Registration failed';
      // KEIN return;  -> Dialog geht weiter
    } finally {
      this.loading = false;
    }
  
    const securedIndex = this.lines.push({
      name: 'King',
      text: 'Excellent. Your identity is secured. Now no one can steal your treasures har har!'
    }) - 1;
  
    this.lines.push({
      name: 'King',
      text: `Excuse my curiosity, dear Knight ${this.playerName}... but may I know if you're a Sir or a Lady?`,
      meta: 'askGender'
    });
  
    this.showPassForm = false;
    this.showRepeatForm = false;
    this.password = '';
    this.password2 = '';
    this.ix = securedIndex;
    this.startCurrentLine();
  
  }

  // ----- Sir/Lady -----
  chooseGender(g: 'sir' | 'lady'): void {
    localStorage.setItem('gender', g);
    this.showGender = false;

    const title = g === 'sir' ? 'Sir' : 'Lady';

    const apologyIndex = this.lines.push({
      name: 'King',
      text: `Ah... I should have known. My apologies ${title} ${this.playerName}. Welcome to Muscle Land!`
    }) - 1;

    this.lines.push({
      name: 'King',
      text: `Are you ready to make me a proud King and fight through our land's dungeons, ${title} ${this.playerName}?`,
      meta: 'askReady'
    });

    this.ix = apologyIndex;
    this.startCurrentLine();
  }

  // ----- Ready/Not Ready -----
  chooseReady(yes: boolean): void {
    this.showReady = false;
    this.navigateAfterReady = true; // nächster Continue navigiert zu /start

    const text = yes
      ? `Excellent! I knew you had the courage, ${this.playerName}.`
      : `Oh... fear is natural, ${this.playerName}, but bravery is born from facing it.`;

    const lineIndex = this.lines.push({ name: 'King', text }) - 1;
    this.ix = lineIndex;
    this.startCurrentLine();
  }

  // Space/Enter als Continue (nur wenn nichts offen ist)
  @HostListener('window:keydown', ['$event'])
  handleKey(e: KeyboardEvent): void {
    if (
      (e.key === ' ' || e.key === 'Enter') &&
      this.showNext &&
      !this.showNameForm &&
      !this.showPassForm &&
      !this.showRepeatForm &&
      !this.showGender &&
      !this.showReady
    ) {
      e.preventDefault();
      this.onNext();
    }
  }

}