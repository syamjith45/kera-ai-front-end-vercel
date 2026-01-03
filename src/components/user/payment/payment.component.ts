import { Component, ChangeDetectionStrategy, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService } from '../../../services/payment.service';
import { BookingService, Booking } from '../../../services/booking.service';
import { AuthService } from '../../../services/auth.service';
import { switchMap, map } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
    selector: 'app-user-payment',
    template: `
    <div class="p-4 flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      <h1 class="text-2xl font-bold text-gray-800">Payment</h1>
      
      @if (isLoading()) {
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="text-gray-500">Loading booking details...</p>
      } @else if (success()) {
        <div class="bg-green-100 p-4 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-12 h-12 text-green-600">
            <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <h2 class="text-xl font-bold text-green-600">Payment Successful!</h2>
        <p class="text-gray-500 text-center">Your spot has been booked.</p>
        <button (click)="goToPasses()" class="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg mt-4">View My Passes</button>
      } @else if (booking()) {
        <div class="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div class="flex justify-between items-center border-b pb-4">
                <span class="text-gray-600">Booking ID</span>
                <span class="font-mono font-medium">{{ booking()!.id }}</span>
            </div>
             <div class="flex justify-between items-center border-b pb-4">
                <span class="text-gray-600">Location</span>
                <span class="font-medium">{{ booking()!.parking_lots?.name || 'Parking Lot' }}</span>
            </div>
            <div class="flex justify-between items-center py-2">
                <span class="text-lg font-bold text-gray-800">Total Amount</span>
                <span class="text-2xl font-bold text-blue-600">₹{{ booking()!.total_cost }}</span>
            </div>

            @if (errorMsg()) {
                <div class="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
                    {{ errorMsg() }}
                </div>
            }

            <button (click)="initiatePayment()" [disabled]="isProcessing()" 
                class="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 disabled:opacity-70 flex justify-center items-center gap-2">
                @if (isProcessing()) {
                    <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                } @else {
                    Pay Now
                }
            </button>
             <button (click)="goToHome()" class="w-full py-3 text-gray-500 font-medium hover:text-gray-700">Cancel</button>

        </div>
      } @else {
         <div class="bg-red-50 p-4 rounded-xl border border-red-200">
            <p class="text-red-700">Booking not found or invalid.</p>
         </div>
         <button (click)="goToHome()" class="text-blue-600 font-semibold mt-4">Go Home</button>
      }
    </div>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule]
})
export class UserPaymentComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private paymentService = inject(PaymentService);
    private bookingService = inject(BookingService);
    private authService = inject(AuthService);

    bookingId: string | null = null;
    
    // Signals
    booking = signal<Booking | null>(null);
    isLoading = signal(true);
    isProcessing = signal(false);
    success = signal(false);
    errorMsg = signal<string | null>(null);

    ngOnInit() {
        this.bookingId = this.route.snapshot.paramMap.get('bookingId');
        
        if (!this.bookingId) {
            this.isLoading.set(false);
            return;
        }

        // Fetch booking details
        this.authService.getUser().pipe(
            switchMap(user => {
                if (!user) return of([]); // Should redirect to login ideally
                return this.bookingService.getUserBookings(user.id);
            }),
            map(bookings => bookings.find(b => b.id === this.bookingId))
        ).subscribe({
            next: (foundBooking) => {
                if (foundBooking) {
                    this.booking.set(foundBooking);
                }
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error("Error fetching booking", err);
                this.isLoading.set(false);
            }
        });
    }

    initiatePayment() {
        const b = this.booking();
        if (!b || !this.bookingId) return;

        this.isProcessing.set(true);
        this.errorMsg.set(null);

        // pass total_cost. In real implementation, the backend likely re-verifies this from DB using bookingId
        this.paymentService.processPayment(b.total_cost || 0, this.bookingId).subscribe({
            next: (result) => {
                this.isProcessing.set(false);
                if (result) {
                    this.success.set(true);
                } else {
                    this.errorMsg.set('Payment failed. Please try again.');
                }
            },
            error: (err) => {
                this.isProcessing.set(false);
                this.errorMsg.set('Payment error: ' + (err.message || 'Unknown error'));
            }
        });
    }

    goToPasses() {
        this.router.navigate(['/user/passes']);
    }

    goToHome() {
        this.router.navigate(['/user/home']);
    }
}
