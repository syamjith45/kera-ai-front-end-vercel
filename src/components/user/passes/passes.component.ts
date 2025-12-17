import { Component, ChangeDetectionStrategy, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService, Booking } from '../../../services/booking.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-user-passes',
  templateUrl: './passes.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class UserPassesComponent implements OnInit {
  private bookingService = inject(BookingService);
  private authService = inject(AuthService);

  passView = signal<'active' | 'history'>('active');
  activeBookings = signal<Booking[]>([]);
  historyBookings = signal<Booking[]>([]);

  setView(view: 'active' | 'history') {
    this.passView.set(view);
  }

  ngOnInit() {
    this.authService.getUser().subscribe(user => {
      if (user) {
        this.bookingService.getUserBookings(user.id).subscribe(bookings => {
          const active = bookings.filter(b => b.status === 'active' || b.status === 'pending');
          const history = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');
          this.activeBookings.set(active);
          this.historyBookings.set(history);
        });
      }
    });
  }
}
