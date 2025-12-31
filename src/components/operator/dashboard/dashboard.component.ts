import { Component, ChangeDetectionStrategy, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService, Booking } from '../../../services/booking.service';
import { ParkingService } from '../../../services/parking.service';
import { AuthService } from '../../../services/auth.service';
import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';

@Component({
  selector: 'app-operator-dashboard',
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule]
})
export class OperatorDashboardComponent implements OnInit {
  private bookingService = inject(BookingService);
  private parkingService = inject(ParkingService);
  private authService = inject(AuthService);
  private router = inject(Router);

  recentActivity = signal<Booking[]>([]);
  managedLot = signal<any>(null); // To store valid managed lot
  isEditingFee = signal(false);
  newFee = signal<number>(0);

  ngOnInit() {
    this.loadManagedLot();

    this.bookingService.getAllBookings().subscribe(bookings => {
      // Just take top 5 for recent history
      this.recentActivity.set(bookings.slice(0, 5));
    });
  }

  async loadManagedLot() {
    // 1. Get current user ID
    this.authService.getUser().subscribe(user => {
        if(!user) return;

        // 2. Fetch Profile or "Me" to get assigned lot
        this.fetchAssignedLot(user.id);
    });
  }

  fetchAssignedLot(userId: string) {
      this.parkingService.getOperatorAssignedLotWithDetails(userId).subscribe({
          next: (lot) => {
              this.managedLot.set(lot);
              if(lot) this.newFee.set(lot.pricePerHour);
          },
          error: (err) => {

              this.managedLot.set(null); // Explicit No Data
          }
      });
  }

  async saveFee() {
    const lot = this.managedLot();
    if (!lot) return;

    try {
      await this.parkingService.updateParkingLot(lot.id, { pricePerHour: this.newFee() });
      this.isEditingFee.set(false);
      this.fetchAssignedLot(this.managedLot().id); // Reload ?? No need id, just reload
      alert('Fee updated successfully!');
    } catch (e) {

      alert('Failed to update fee: ' + (e as any).message); // Show backend error format
    }
  }

  // Mock actions
  triggerAction(action: string) {

    if (action === 'barrier') {
      alert('Boom Barrier Activated');
    } else if (action === 'body_check') {
       this.router.navigate(['/operator/spot-booking']);
    } else {
      alert(`Action ${action} triggered`);
    }
  }
}
