// src/app/start/start.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-start',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.css']
})
export class StartComponent {
  username = '';
  password = '';
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  onLogin() {
    this.error = '';
    this.loading = true;
    this.auth.login({ username: this.username, password: this.password })
      .subscribe({
        next: () => this.router.navigateByUrl('/main'),
        error: e => { this.error = e.message ?? 'Login failed'; this.loading = false; }
      });
  }

  goRegister() {
    this.router.navigateByUrl('/registration');
  }
}