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
import { AuthService, Gender } from '../services/auth.service';
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

 
  showNameForm = false;
  username = '';
  nameError = '';
  @ViewChild('unameInput') unameInput!: ElementRef<HTMLInputElement>;
  playerName = '';


  showPassForm = false;     
  showRepeatForm = false;    
  password = '';
  password2 = '';
  passError = '';
  @ViewChild('pwdInput')  pwdInput!:  ElementRef<HTMLInputElement>;
  @ViewChild('pwd2Input') pwd2Input!: ElementRef<HTMLInputElement>;


  showGender = false;
  showReady = false;
  selectedGender: Gender | undefined;


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

  
  private isAskPasswordLine(): boolean { return this.lines[this.ix]?.meta === 'askPassword'; }
  private isAskRepeatLine(): boolean   { return this.lines[this.ix]?.meta === 'askRepeat'; }
  private isAskGenderLine(): boolean   { return this.lines[this.ix]?.meta === 'askGender'; }
  private isAskReadyLine(): boolean    { return this.lines[this.ix]?.meta === 'askReady'; }


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
     
        this.showNext = !this.showNameForm && !this.showPassForm && !this.showRepeatForm && !this.showGender && !this.showReady;
      }
    };
    this.timer = window.setTimeout(step, this.speed);
  }

  
  onNext(): void {
    if (this.typing) return;

   
    if (this.isAskPasswordLine() && !this.showPassForm) {
      this.showNext = false;
      this.showNameForm = false;
      this.showGender = false;
      this.showRepeatForm = false;
      this.showPassForm = true;
      setTimeout(() => this.pwdInput?.nativeElement.focus(), 0);
      return;
    }

   
    if (this.isAskRepeatLine() && !this.showRepeatForm) {
      this.showNext = false;
      this.showNameForm = false;
      this.showPassForm = false;
      this.showGender = false;
      this.showRepeatForm = true;          
      setTimeout(() => this.pwd2Input?.nativeElement.focus(), 0);
      return;
    }


    if (this.isAskGenderLine() && !this.showGender) {
      this.showNext = false;
      this.showPassForm = false;
      this.showRepeatForm = false;
      this.showGender = true;
      return;
    }

 
    if (this.isAskReadyLine() && !this.showReady) {
      this.showNext = false;
      this.showReady = true;
      return;
    }

   
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


    this.showNext = false;
    if (this.ix < this.lines.length - 1) {
      this.ix++;
      this.startCurrentLine();
    } else if (this.navigateAfterReady) {
      this.router.navigate(['/start']).catch(console.error);
    } else {
      this.showNext = true; 
    }
  }


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

  
  submitPassword(): void {
    this.passError = '';
    const pwd = (this.password ?? '').trim();
  
    if (!pwd)            { this.passError = 'Please enter a password.'; return; }
    if (pwd.length < 6)  { this.passError = 'Use at least 6 characters.'; return; }
    if (pwd.length > 64) { this.passError = 'Use at most 64 characters.'; return; }
  
   
    if (this.isAskRepeatLine()) return;
  
  
    this.showPassForm   = false;
    this.showRepeatForm = false;
  
  
    const repeatIndex = this.lines.push({
      name: 'King',
      text: 'Ohh, could you repeat that? My hearing is bad...',
      meta: 'askRepeat'
    }) - 1;
  
    this.ix = repeatIndex; 
    this.startCurrentLine();    
  }

 
  async submitRepeatPassword(): Promise<void> {
    this.passError = '';
    const pwd  = (this.password  ?? '').trim();
    const pwd2 = (this.password2 ?? '').trim();
  
    if (!pwd2)        { this.passError = 'Please repeat your password.'; return; }
    if (pwd !== pwd2) { this.passError = 'Passwords must match.';        return; }
  
    try {
      await firstValueFrom(
        this.auth.register({
          username: (this.playerName || this.username).trim(),
          password: pwd
        })
      );
    } catch (e: any) {
      if (e?.status === 409) {
        this.showPassForm   = false;
        this.showRepeatForm = false;
        this.showNameForm   = true;
        this.nameError      = 'Username already taken. Choose another.';
        setTimeout(() => this.unameInput?.nativeElement.focus(), 0);
        return;
      }
      this.error = e?.message ?? 'Registration failed';
      return;
    }
  
    const securedIndex = this.lines.push({
      name: 'King',
      text: 'Excellent. Your identity is secured. Now no one can steal your treasures har har!'
    }) - 1;
  
    this.lines.push({
      name: 'King',
      text: `Excuse my curiosity, dear Knight ${this.playerName || this.username}... but may I know if you're a Sir or a Lady?`,
      meta: 'askGender'
    });
  
    this.showPassForm   = false;
    this.showRepeatForm = false;
    this.password = '';
    this.password2 = '';
    this.ix = securedIndex;
    this.startCurrentLine();
  
  }

  


  chooseGender(g: 'sir' | 'lady'): void {
    localStorage.setItem('gender', g);
    this.showGender = false;
    this.selectedGender = g; 

    this.auth.setGender(g).subscribe({
      next: () => {
        
      },
      error: () => { this.error = 'Could not save gender';  }
    });

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


  
  chooseReady(yes: boolean): void {
    this.showReady = false;
    this.navigateAfterReady = true; 

    const text = yes
      ? `Excellent! I knew you had the courage, ${this.playerName}.`
      : `Oh... fear is natural, ${this.playerName}, but bravery is born from facing it.`;

    const lineIndex = this.lines.push({ name: 'King', text }) - 1;
    this.ix = lineIndex;
    this.startCurrentLine();
  }


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