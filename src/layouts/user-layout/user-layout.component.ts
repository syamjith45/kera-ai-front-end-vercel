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

    this.authService.getUser().subscribe(user => {
      if (user) {

        this.profileService.getProfile(user.id).subscribe({
          next: (profile) => {},
          error: (err) => {}
        });
      } else {

      }
    });
  }
}
