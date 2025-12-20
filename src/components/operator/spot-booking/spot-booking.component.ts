import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BookingService } from '../../../services/booking.service';
import { ParkingService, ParkingLot } from '../../../services/parking.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-operator-spot-booking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './spot-booking.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperatorSpotBookingComponent implements OnInit {
  private bookingService = inject(BookingService);
  private parkingService = inject(ParkingService);
  private router = inject(Router);
  private authService = inject(AuthService);

  // Data
  parkingLots = signal<ParkingLot[]>([]);
  selectedLotId = signal<string>('');
  selectedSlotId = signal<string>('');
  availableSlots = signal<{id: string, status: string}[]>([]);
  
  // Form Inputs
  duration = signal<number>(1);
  walkInName = signal<string>('');
  walkInPhone = signal<string>('');
  
  // Computed/State
  totalCost = signal<number>(0);
  isLoading = signal<boolean>(false);
  successMessage = signal<string>('');
  errorMessage = signal<string>('');
  lastBookingQrData = signal<string | null>(null);

  ngOnInit() {
    this.loadParkingLots();
  }

  loadParkingLots() {
    this.parkingService.getParkingLots().subscribe(lots => {
      this.parkingLots.set(lots);
      if (lots.length > 0) {
        this.selectedLotId.set(lots[0].id);
        this.onLotChange();
      }
    });
  }

  onLotChange() {
    const lotId = this.selectedLotId();
    if (!lotId) return;

    const lot = this.parkingLots().find(l => l.id === lotId);
    if (lot) {
      // Cast slots to array if needed, similar to user booking logic
      const slotsData = lot.slots as any;
      let slotsList: {id: string, status: string}[] = [];

      if (Array.isArray(slotsData)) {
         slotsList = slotsData;
      } else if (slotsData && typeof slotsData === 'object') {
         slotsList = Object.entries(slotsData).map(([id, status]) => ({ id, status: status as string }));
      }
      
      this.availableSlots.set(slotsList.filter(s => s.status === 'available'));
      
      // Auto-select first slot
      if (this.availableSlots().length > 0) {
        this.selectedSlotId.set(this.availableSlots()[0].id);
      } else {
        this.selectedSlotId.set('');
      }
      
      this.calculateCost();
    }
  }

  calculateCost() {
    const lotId = this.selectedLotId();
    const lot = this.parkingLots().find(l => l.id === lotId);
    if (lot && this.duration() > 0) {
      this.totalCost.set(lot.pricePerHour * this.duration());
    } else {
      this.totalCost.set(0);
    }
  }

  submitBooking() {
    if (!this.walkInName()) {
      this.errorMessage.set('Guest Name is required.');
      return;
    }
    if (!this.selectedSlotId()) {
      this.errorMessage.set('Please select a slot.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.bookingService.createOperatorBooking({
      lotId: this.selectedLotId(),
      slot: this.selectedSlotId(),
      duration: this.duration(),
      walkInName: this.walkInName(),
      walkInPhone: this.walkInPhone()
    }).subscribe({
      next: (booking) => {
        this.isLoading.set(false);
        this.successMessage.set(`Booking Successful! Slot: ${booking.slotNumber}`);
        this.lastBookingQrData.set(booking.qr_code_data || null);
        // Reset form or navigate
        this.walkInName.set('');
        this.walkInPhone.set('');
        this.loadParkingLots(); // Refresh slots
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'Booking failed');
      }
    });
  }
}
