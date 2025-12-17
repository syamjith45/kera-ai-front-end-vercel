
import { Component, ChangeDetectionStrategy, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ProfileService, UserProfile } from '../../../services/profile.service';

@Component({
  selector: 'app-operator-profile',
  templateUrl: './profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule]
})
export class OperatorProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);
  private router = inject(Router);

  profile = signal<UserProfile | null>(null);
  isEditing = signal(false);
  editForm = signal<Partial<UserProfile>>({});

  ngOnInit() {
    this.authService.getUser().subscribe(user => {
      if (user) {
        this.profileService.getProfile(user.id).subscribe(p => {
          this.profile.set(p);
          this.editForm.set({ ...p });
        });
      }
    });
  }

  toggleEdit() {
    this.isEditing.update(v => !v);
    if (!this.isEditing() && this.profile()) {
      this.editForm.set({ ...this.profile() }); // Reset on cancel
    }
  }

  saveProfile() {
    const current = this.profile();
    if (!current) return;

    this.profileService.updateProfile(current.id, this.editForm()).subscribe({
      next: (updated) => {
        this.profile.set(updated);
        this.isEditing.set(false);
        alert('Profile updated');
      },
      error: (err) => {
        console.error('Profile update failed', err);
        alert('Failed to update profile');
      }
    });
  }

  logout() {
    this.authService.signOut().subscribe(() => {
      this.router.navigate(['/auth/login']);
    });
  }
}
