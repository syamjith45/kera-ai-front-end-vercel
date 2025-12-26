import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, FormsModule]
})
export class SignupComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  role = signal<'user' | 'operator'>('user');
  fullName = signal('');
  email = signal('');
  password = signal('');
  confirmPassword = signal('');
  vehiclePlate = signal('');

  setRole(selectedRole: 'user' | 'operator'): void {
    this.role.set(selectedRole);
  }

  onSignup(): void {
    if (!this.passwordsMatch()) {
      alert('Passwords do not match');
      return;
    }

    const metadata = {
      full_name: this.fullName().trim(),
      role: this.role(),
      vehicle_plate: this.vehiclePlate().trim()
    };

    const email = this.email().trim();
    const password = this.password().trim();



    this.authService.signUp(email, password, metadata).subscribe({
      next: (data) => {

        alert('Account created successfully! You can now log in.');
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {

        alert('Signup failed: ' + err.message);
      }
    });
  }

  passwordsMatch(): boolean {
    return this.password() === this.confirmPassword();
  }
}
