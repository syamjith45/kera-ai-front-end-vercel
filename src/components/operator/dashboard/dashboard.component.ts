import { Component, ChangeDetectionStrategy, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService, Booking } from '../../../services/booking.service';
import { ParkingService } from '../../../services/parking.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-operator-dashboard',
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule]
})
export class OperatorDashboardComponent implements OnInit {
  private bookingService = inject(BookingService);
  private parkingService = inject(ParkingService);

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

  loadManagedLot() {
    this.parkingService.getParkingLots().subscribe(lots => {
      // Mock: Operator manages the first lot found
      if (lots.length > 0) {
        const lot = lots[0];
        this.managedLot.set(lot);
        this.newFee.set(lot.pricePerHour);
      }
    });
  }

  toggleEditFee() {
    this.isEditingFee.update(v => !v);
    if (!this.isEditingFee() && this.managedLot()) {
      this.newFee.set(this.managedLot().pricePerHour); // Reset if cancelled
    }
  }

  async saveFee() {
    const lot = this.managedLot();
    if (!lot) return;

    try {
      await this.parkingService.updateParkingLot(lot.id, { pricePerHour: this.newFee() });
      this.isEditingFee.set(false);
      this.loadManagedLot(); // Reload to confirm
      alert('Fee updated successfully!');
    } catch (e) {
      console.error('Failed to update fee', e);
      alert('Failed to update fee.');
    }
  }

  // Mock actions
  triggerAction(action: string) {
    console.log('Action triggered:', action);
    if (action === 'barrier') {
      alert('Boom Barrier Activated');
    } else {
      alert(`Action ${action} triggered`);
    }
  }
}
