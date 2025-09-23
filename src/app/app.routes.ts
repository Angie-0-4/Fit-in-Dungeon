import { Routes, CanActivateFn } from '@angular/router';

import { IntroComponent } from './intro/intro.component';
import { StartComponent } from './start/start.component';
import { RegisterComponent } from './register/register.component';
import { RegistrationComponent } from './registration/registration.component';

import { MainComponent } from './main/main.component';
import { ProfileComponent } from './profile/profile.component';
import { CalendarComponent } from './calendar/calendar.component';
import { WorkoutComponent } from './workout/workout.component';
import { SettingsComponent } from './settings/settings.component';
import { SessionComponent } from './workout/session/session.component';


export const authGuard: CanActivateFn = () => !! localStorage.getItem('token')

export const routes: Routes = [
  // Einstieg → Intro
  { path: '', pathMatch: 'full', redirectTo: 'intro' },

  // Öffentliche Seiten
  { path: 'intro', component: IntroComponent },
  { path: 'start', component: StartComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'registration', component: RegistrationComponent },

  // Hauptlayout mit Sidebar
  {
    path: 'main',
    component: MainComponent, canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'profile' }, // Standard
      { path: 'profile', component: ProfileComponent },
      { path: 'calendar', component: CalendarComponent },
      { path: 'workout', component: WorkoutComponent}, 
      {path: 'session', component: SessionComponent},
      { path: 'settings', component: SettingsComponent }
    ]
  },

  // Fallback 
  { path: '**', redirectTo: 'intro' }
];