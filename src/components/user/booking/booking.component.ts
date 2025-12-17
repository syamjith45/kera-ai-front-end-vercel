import { Component, ChangeDetectionStrategy, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ParkingService, ParkingLot } from '../../../services/parking.service';
import { BookingService } from '../../../services/booking.service';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-user-booking',
    templateUrl: './booking.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, FormsModule]
})
export class UserBookingComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private parkingService = inject(ParkingService);
    private bookingService = inject(BookingService);
    private authService = inject(AuthService);

    lotId: string | null = null;
    lot = signal<ParkingLot | null>(null);

    // Form data
    startTime = signal<string>('');
    endTime = signal<string>('');

    // Cost calculation
    totalCost = signal<number>(0);

    ngOnInit() {
        this.lotId = this.route.snapshot.paramMap.get('lotId');
        if (this.lotId) {
            this.parkingService.getParkingLotDetails(this.lotId).subscribe(l => {
                this.lot.set(l);
                // Default times
                const now = new Date();
                const later = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour later
                this.startTime.set(now.toISOString().slice(0, 16));
                this.endTime.set(later.toISOString().slice(0, 16));
                this.calculateCost();
            });
        }
    }

    calculateCost() {
        const l = this.lot();
        if (!l || !this.startTime() || !this.endTime()) return;

        const start = new Date(this.startTime());
        const end = new Date(this.endTime());
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

        if (hours > 0) {
            this.totalCost.set(Math.round(hours * l.pricePerHour * 100) / 100);
        } else {
            this.totalCost.set(0);
        }
    }

    proceedToPayment() {
        this.authService.getUser().subscribe(user => {
            if (user && this.lotId && this.totalCost() > 0) {
                // For now, create booking immediately (status pending) then go to 'payment' (mock)
                this.bookingService.createBooking({
                    user_id: user.id,
                    lot_id: this.lotId,
                    start_time: new Date(this.startTime()).toISOString(),
                    end_time: new Date(this.endTime()).toISOString(),
                    status: 'pending',
                    total_cost: this.totalCost()
                }).subscribe(booking => {
                    // Navigate to payment or passes (skipping payment screen for brevity if needed, but plan said Integrate Payment Screen)
                    // Let's go to payment logic
                    this.router.navigate(['/user/payment', booking.id]);
                });
            }
        });
    }
}
