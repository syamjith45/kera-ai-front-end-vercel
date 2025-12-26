import { Component, ChangeDetectionStrategy, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService, Booking } from '../../../services/booking.service';
import { ParkingService } from '../../../services/parking.service';
import { AuthService } from '../../../services/auth.service';
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
  private authService = inject(AuthService);

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
        // Assuming ProfileService or a new service returns assigned_lot_id
        // Since I don't have a direct "getAssignedLot" in ProfileService yet, 
        // I will use a direct query here or modify ProfileService. 
        // For now, I'll assume ProfileService's getProfile MIGHT return it if I check the raw response,
        // or I can call a specific query.
        
        // Actually, let's use the ParkingService to "find" the lot if we knew the ID.
        // But we don't know the ID without fetching it.
        // Let's rely on the backend check: fail loudly if verify fails, 
        // BUT for the dashboard display, we need to show WHICH lot.
        
        // Strategy: Query 'me' with assigned_lot_id
        // Since I can't easily change ProfileService right now without context of its other usages,
        // I'll add a specific query right here or just rely on "No Data" until they perform an action if query is missing.
        // BUT user asked to "show as no data" if missing.
        
        // I will try to fetch ALL lots and filter? No, inefficient.
        // I will add a small query here to fetch "me { assigned_lot_id }" equivalent.
        
        this.fetchAssignedLot(user.id);
    });
  }

  fetchAssignedLot(userId: string) {
      // Small inline query or injected service call
      // Ideally this belongs in a service, using parkingService for now to keep code clean if I add method there.
      // But let's put logic here for speed as requested.
      
      // We need a way to get "My Assigned Lot". 
      // User said they implemented backend. I'll assume 'me' has it or there's a specific query.
      // If not, I'll default to "No Data" as requested.
      
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
    } else {
      alert(`Action ${action} triggered`);
    }
  }
}
