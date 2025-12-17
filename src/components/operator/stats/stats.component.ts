import { Component, ChangeDetectionStrategy, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService, Booking } from '../../../services/booking.service';
import { ParkingService } from '../../../services/parking.service';

@Component({
  selector: 'app-operator-stats',
  templateUrl: './stats.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class OperatorStatsComponent implements OnInit {
  private bookingService = inject(BookingService);
  private parkingService = inject(ParkingService);

  statsView = signal<'daily' | 'weekly'>('daily');
  totalScans = signal(0);
  boomOps = signal(0);
  recentCosts = signal<Booking[]>([]);
  dailyScanData = signal<number[]>(new Array(12).fill(0));
  managedLotId = signal<string | null>(null);

  setView(view: 'daily' | 'weekly') {
    this.statsView.set(view);
  }

  ngOnInit() {
    this.parkingService.getParkingLots().subscribe(lots => {
      if (lots.length > 0) {
        this.managedLotId.set(lots[0].id); // Mock: Manage first lot
        this.loadStats();
      }
    });
  }

  loadStats() {
    const lotId = this.managedLotId();
    if (!lotId) return;

    this.bookingService.getAllBookings().subscribe(allBookings => {
      // Filter for this lot
      const bookings = allBookings.filter(b => b.lotId === lotId || b.parking_lots?.name); // Fallback if lotId missing in some mock data

      this.totalScans.set(bookings.length);
      this.boomOps.set(Math.floor(bookings.length * 0.8)); // Mock boom operations
      this.recentCosts.set(bookings.filter(b => (b.total_cost || 0) > 0).slice(0, 5));

      this.calculateChartData(bookings);
    });
  }

  calculateChartData(bookings: Booking[]) {
    const data = new Array(12).fill(0);
    bookings.forEach(b => {
      const dateStr = b.created_at || b.startTime;
      if (dateStr) {
        const hour = new Date(dateStr).getHours();
        // Map 24h to 12 buckets (2 hour intervals)
        const index = Math.floor(hour / 2) % 12;
        data[index] += 1;
      }
    });

    // Normalize height for chart (relative to max value, simplified)
    const max = Math.max(...data, 1);
    const normalized = data.map(v => (v / max) * 100);
    this.dailyScanData.set(normalized);
  }
}
