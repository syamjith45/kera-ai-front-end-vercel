import { Component, ChangeDetectionStrategy, signal, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService, UserProfile } from '../../../services/profile.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule]
})
export class UserProfileComponent implements OnInit {
  private profileService = inject(ProfileService);
  private authService = inject(AuthService);
  private router = inject(Router);

  profile = signal<UserProfile | null>(null);
  isEditing = signal(false);

  // Form model
  editForm: Partial<UserProfile> = {};

  ngOnInit() {
    this.authService.getUser().subscribe(user => {
      if (user) {
        this.profileService.getProfile(user.id).subscribe(p => {
          this.profile.set(p);
          this.editForm = { ...p };
        });
      }
    });
  }

  toggleEdit() {
    if (this.isEditing()) {
      // Cancel
      this.isEditing.set(false);
      this.editForm = { ...this.profile() };
    } else {
      // Start editing
      this.isEditing.set(true);
    }
  }

  saveProfile() {
    const currentProfile = this.profile();
    if (currentProfile) {
      console.log('Saving profile...', this.editForm);
      this.profileService.updateProfile(currentProfile.id, this.editForm).subscribe({
        next: (updated) => {
          console.log('Profile updated successfully', updated);
          this.profile.set(updated);
          this.isEditing.set(false);
        },
        error: (err) => {
          console.error('Error updating profile in component:', err);
        }
      });
    }
  }

  signOut() {
    this.authService.signOut().subscribe(() => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('userRole'); // Clear the role we stored!
      this.router.navigate(['/auth/login']);
    });
  }
}
