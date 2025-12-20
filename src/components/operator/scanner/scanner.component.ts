import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BookingService } from '../../../services/booking.service';

@Component({
  selector: 'app-operator-scanner',
  templateUrl: './scanner.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ZXingScannerModule]
})
export class OperatorScannerComponent {
  private bookingService = inject(BookingService);

  manualId = signal('');
  scanResult = signal<string | null>(null);
  bookingDetails = signal<any | null>(null);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  // Scanner status
  allowedFormats = [ 'QR_CODE' ];
  enableScanner = signal(true);

  handleQrCodeResult(resultString: string) {
    if (resultString) {
        this.enableScanner.set(false); // Pause scanning
        this.verify(resultString);
    }
  }

  submitManual() {
    if (this.manualId()) {
        this.verify(this.manualId());
    }
  }

  verify(bookingId: string) {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.scanResult.set(bookingId);
    
    this.bookingService.verifyBooking(bookingId).subscribe({
        next: (booking) => {
            this.isLoading.set(false);
            this.bookingDetails.set(booking);
        },
        error: (err) => {
            this.isLoading.set(false);
            this.errorMessage.set('Invalid Booking or already scanned.');
            // Re-enable scanner after short delay if error? 
            // Better to let user manually reset to avoid infinite loop of errors
        }
    });
  }

  reset() {
    this.bookingDetails.set(null);
    this.scanResult.set(null);
    this.errorMessage.set(null);
    this.manualId.set('');
    this.enableScanner.set(true);
  }
}
