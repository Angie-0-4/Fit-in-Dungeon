import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],   
})
export class RegisterComponent implements OnInit, OnDestroy {

  text = '';
  private basePrompt = 'You need to introduce yourself to the King of Muscle Land!';
  lines: string[] = [
    'Before your adventure can start...',
    this.basePrompt,
  ];


  showChoices = false;
  mode: 'main' | 'doubt' = 'main';   


  private i = 0;
  private t: any;
  private reallyCount = 0;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.typeNext();
  }
  ngOnDestroy(): void {
    clearTimeout(this.t);
  }


  private typeNext(): void {
    const full = this.lines[this.i];

    if (this.text.length < full.length) {
      this.text += full[this.text.length];
      this.t = setTimeout(() => this.typeNext(), 30);
      return;
    }

    if (this.i === this.lines.length - 1) {
      this.showChoices = true;
      return;
    }

    this.t = setTimeout(() => {
      this.i++;
      this.text = '';
      this.typeNext();
    }, 900);
  }

  
  private setLinesSingle(line: string): void {
    this.lines = [line];
    this.i = 0;
    this.text = '';
    this.typeNext();
  }


  onChoose(answer: 'yes' | 'no'): void {
    this.showChoices = false;
    clearTimeout(this.t);

    if (this.mode === 'main') {
      if (answer === 'yes') {
        this.router.navigate(['/registration']); 
        return;
      }
    
      this.mode = 'doubt';
      this.reallyCount = 0;
      this.setLinesSingle('Are you sure?');
      return;
    }

   
    if (answer === 'yes') {
      
      this.reallyCount++;
      const r = ' really'.repeat(this.reallyCount);
      this.setLinesSingle(`Are you${r} sure?`);
    } else {
   
      this.mode = 'main';
      this.setLinesSingle(this.basePrompt);
    }
  }
}