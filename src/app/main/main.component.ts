import { Component, OnInit, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';



@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, RouterLinkActive ],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  /** Sidebar-Zustand: true = eingeklappt, false = offen */
  isCollapsed = signal(false);

  ngOnInit(): void {
    // gespeicherten Zustand laden (optional)
    const saved = localStorage.getItem('fid.sidebarCollapsed');
    if (saved !== null) {
      this.isCollapsed.set(saved === 'true');
    }
  }

  /** Logo klick -> Sidebar ein/ausklappen */
  toggleSidebar(): void {
    this.isCollapsed.update(prev => {
      const next = !prev;
      localStorage.setItem('fid.sidebarCollapsed', String(next));
      return next;
    });
  }

  /** Auf kleinen Screens Sidebar nach Navigation automatisch schließen */
  collapseOnNavigate(): void {
    if (window.innerWidth < 1024) {
      this.isCollapsed.set(true);
      localStorage.setItem('fid.sidebarCollapsed', 'true');
    }
  }

  /** Optional: bei Resize automatisch offen lassen ab Desktop */
  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth >= 1024 && this.isCollapsed()) {
      this.isCollapsed.set(false);
      localStorage.setItem('fid.sidebarCollapsed', 'false');
    }
  }

  /** Logout-Button (Hook für deine Auth) */
  onLogout(): void {
    // TODO: hier deine echte Logout-Logik einbauen
    console.log('Logout clicked');
  }




}
