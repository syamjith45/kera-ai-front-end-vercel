import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, FormsModule]
})
export class LoginComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);

  role = signal<'user' | 'operator'>('user'); // Kept for UI toggle, but not for auth logic
  email = signal('');
  password = signal('');

  setRole(selectedRole: 'user' | 'operator'): void {
    this.role.set(selectedRole);
  }

  onLogin(): void {
    console.log('Sending login request...');

    const email = this.email().trim();
    const password = this.password().trim();

    this.authService.signIn(email, password).subscribe({
      next: (data) => {
        console.log('Login successful response:', data);
        if (data.session) {
          console.log('Session found, setting token...');
          localStorage.setItem('auth_token', data.session.access_token);
        }

        // FETCH REAL ROLE FROM DB
        if (data.user) {
          console.log('User found in login response, fetching profile for:', data.user.id);
          this.profileService.getProfile(data.user.id).subscribe({
            next: (profile) => {
              console.log('Fetched Profile Success:', profile);
              const dbRole = profile.role || 'user'; // Fallback to user

              // Store role in LocalStorage as per guide
              localStorage.setItem('userRole', dbRole);

              switch (dbRole) {
                case 'superadmin':
                  this.router.navigate(['/superadmin/dashboard']);
                  break;
                case 'admin':
                  this.router.navigate(['/admin/dashboard']);
                  break;
                case 'operator':
                  this.router.navigate(['/operator/dashboard']);
                  break;
                default:
                  this.router.navigate(['/user/home']);
                  break;
              }
            },
            error: (err) => {
              console.error('Failed to fetch profile', err);
              // Fallback based on UI toggle if DB fails? Or just go to home?
              this.router.navigate(['/user/home']);
            }
          });
        }
      },
      error: (err) => {
        console.error('Login failed', err);
        alert('Login failed: ' + err.message);
      }
    });
  }
}
