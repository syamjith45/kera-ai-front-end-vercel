import { Component, ChangeDetectionStrategy, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService } from '../../../services/payment.service';

@Component({
    selector: 'app-user-payment',
    template: `
    <div class="p-4 flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      <h1 class="text-2xl font-bold text-gray-800">Payment</h1>
      
      @if (isProcessing()) {
        <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
        <p class="text-gray-600 animate-pulse">Processing payment...</p>
      } @else if (success()) {
        <div class="bg-green-100 p-4 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-12 h-12 text-green-600">
            <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <h2 class="text-xl font-bold text-green-600">Payment Successful!</h2>
        <p class="text-gray-500 text-center">Your spot has been booked.</p>
        <button (click)="goToPasses()" class="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg mt-4">View My Passes</button>
      } @else {
         <div class="bg-red-50 p-4 rounded-xl border border-red-200">
            <p class="text-red-700">Payment initialization failed.</p>
         </div>
         <button (click)="goToHome()" class="text-blue-600 font-semibold">Go Home</button>
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

    isProcessing = signal(true);
    success = signal(false);
    bookingId: string | null = null;

    ngOnInit() {
        this.bookingId = this.route.snapshot.paramMap.get('bookingId');
        if (this.bookingId) {
            // Mocking amount, in real app would get from booking details
            this.paymentService.processPayment(10, this.bookingId).subscribe(result => {
                this.isProcessing.set(false);
                this.success.set(result);
            });
        } else {
            this.isProcessing.set(false);
        }
    }

    goToPasses() {
        this.router.navigate(['/user/passes']);
    }

    goToHome() {
        this.router.navigate(['/user/home']);
    }
}
