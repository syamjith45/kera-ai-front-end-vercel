import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, FormsModule]
})
export class LoginComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  role = signal<'user' | 'operator'>('user');
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
        console.log('Login successful', data);
        if (data.session) {
          localStorage.setItem('auth_token', data.session.access_token);
        }

        if (this.role() === 'user') {
          this.router.navigate(['/user/home']);
        } else {
          this.router.navigate(['/operator/dashboard']);
        }
      },
      error: (err) => {
        console.error('Login failed', err);
        alert('Login failed: ' + err.message);
      }
    });
  }
}
