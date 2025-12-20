import { Injectable } from '@angular/core';
import { Observable, of, timer } from 'rxjs';
import { delay, mapTo } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class PaymentService {

    constructor() { }

    processPayment(amount: number, bookingId: string): Observable<boolean> {
        // Mock payment processing
        console.log(`Processing payment of ₹${amount} for booking ${bookingId}`);
        return timer(2000).pipe(
            mapTo(true) // Always return success for now
        );
    }
}
