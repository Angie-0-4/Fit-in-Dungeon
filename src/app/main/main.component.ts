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
 
  isCollapsed = signal(false);

  ngOnInit(): void {
   
    const saved = localStorage.getItem('fid.sidebarCollapsed');
    if (saved !== null) {
      this.isCollapsed.set(saved === 'true');
    }
  }


  toggleSidebar(): void {
    this.isCollapsed.update(prev => {
      const next = !prev;
      localStorage.setItem('fid.sidebarCollapsed', String(next));
      return next;
    });
  }


  collapseOnNavigate(): void {
    if (window.innerWidth < 1024) {
      this.isCollapsed.set(true);
      localStorage.setItem('fid.sidebarCollapsed', 'true');
    }
  }


  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth >= 1024 && this.isCollapsed()) {
      this.isCollapsed.set(false);
      localStorage.setItem('fid.sidebarCollapsed', 'false');
    }
  }


  onLogout(): void {
    
    console.log('Logout clicked');
  }




}
