import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-intro',
  standalone: true,
  templateUrl: './intro.component.html',
  styleUrls: ['./intro.component.css'],
  imports: [RouterLink]
})
export class IntroComponent {
  @ViewChild('dlg') dlg!: ElementRef<HTMLDialogElement>;

  constructor(private router: Router) {}

  openModal() {
    const d = this.dlg.nativeElement;
    if (typeof d.showModal === 'function') d.showModal();
    else d.setAttribute('open', '');
  }

  // nicht private, weil vom Template aufgerufen
  closeModal() {
    const d = this.dlg.nativeElement;
    if (typeof d.close === 'function') d.close();
    else d.removeAttribute('open');
  }

  onYes() {
    this.closeModal();
    this.router.navigate(['/start']);
  }

  onNo() {
    this.closeModal();
  }
}