import { Component, ChangeDetectionStrategy, signal, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ParkingService, ParkingLot } from '../../../services/parking.service';
import { BookingService } from '../../../services/booking.service';
import { AuthService } from '../../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-user-booking',
    templateUrl: './booking.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, FormsModule]
})
export class UserBookingComponent implements OnInit, OnDestroy {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private parkingService = inject(ParkingService);
    private bookingService = inject(BookingService);
    private authService = inject(AuthService);
    
    private bookingSubscription?: Subscription;

    lotId: string | null = null;
    lot = signal<ParkingLot | null>(null);

    // Form data
    startTime = signal<string>('');
    endTime = signal<string>('');

    // Cost calculation
    totalCost = signal<number>(0);

    // State
    isProcessing = signal(false);
    errorMsg = signal<string | null>(null);

    ngOnInit() {
        this.lotId = this.route.snapshot.paramMap.get('lotId');

        
        if (this.lotId) {
            this.parkingService.getParkingLotDetails(this.lotId).subscribe({
                next: (l) => {
                    if (l) {
                        this.lot.set(l);
                        // Default times
                        const now = new Date();
                        const later = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour later
                        this.startTime.set(now.toISOString().slice(0, 16));
                        this.endTime.set(later.toISOString().slice(0, 16));
                        this.calculateCost();
                    } else {

                        this.errorMsg.set('Parking lot details could not be loaded.');
                    }
                },
                error: (err) => {

                    this.errorMsg.set('Failed to load parking lot details.');
                }
            });
        }
    }

    ngOnDestroy() {
        if (this.bookingSubscription) {
            this.bookingSubscription.unsubscribe();
        }
    }

    calculateCost() {
        // Clear previous errors when user modifies input
        this.errorMsg.set(null);
        
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
        // Clear error state
        this.errorMsg.set(null);



        if (!this.lotId) {
             this.errorMsg.set('Invalid Parking Lot ID. Please return to home and try again.');
             return;
        }

        if (this.isProcessing()) return;

        this.isProcessing.set(true);

        this.authService.getUser().subscribe(user => {
            if (user && this.lotId && this.totalCost() > 0) {
                
                // Create booking with auto-assignment (no slot passed)

                
                this.bookingSubscription = this.bookingService.createBooking({
                    user_id: user.id,
                    lot_id: this.lotId,
                    start_time: new Date(this.startTime()).toISOString(),
                    end_time: new Date(this.endTime()).toISOString(),
                    status: 'pending',
                    total_cost: this.totalCost(),
                        // slot: undefined // Let backend auto-assign
                }).subscribe({
                    next: (booking) => {

                            this.router.navigate(['/user/payment', booking.id]);
                    },
                    error: (err: any) => {

                        // Handle specific backend errors
                        const msg = err.message || 'Unknown error';
                        this.errorMsg.set('Failed to create booking: ' + msg);
                        this.isProcessing.set(false);
                    }
                });
            } else {

                this.errorMsg.set('Please sign in and ensure valid booking details (Cost > 0).');
                this.isProcessing.set(false);
            }
        });
    }
}
