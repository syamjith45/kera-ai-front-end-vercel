import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-user-layout',
  templateUrl: './user-layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive]
})
export class UserLayoutComponent implements OnInit {
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);

  ngOnInit() {
    console.log('UserLayout initialized, checking session...');
    this.authService.getUser().subscribe(user => {
      if (user) {
        console.log('User session found in layout, fetching profile for:', user.id);
        this.profileService.getProfile(user.id).subscribe({
          next: (profile) => console.log('Layout loaded profile:', profile),
          error: (err) => console.error('Layout failed to load profile:', err)
        });
      } else {
        console.log('No user session in layout');
      }
    });
  }
}
