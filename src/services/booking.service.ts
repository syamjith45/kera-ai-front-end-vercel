import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Booking {
    id: string;
    userId: string;
    lotId: string;
    parkingLotInfo?: { name: string; address: string };
    parking_lots?: { name: string; address: string }; // Alias for UI compat
    slotNumber: string;
    startTime: string; // ISO
    endTime: string; // ISO
    durationHours: number;
    totalAmount: number;
    total_cost?: number; // Alias for UI compat
    status: string;
    created_at?: string; // Not in GQL
    qr_code_data?: string; // derived
}

const MY_BOOKINGS = gql`
  query MyBookings {
    myBookings {
      id
      userId
      lotId
      parkingLotInfo {
        name
        address
      }
      slotNumber
      startTime
      endTime
      durationHours
      totalAmount
      status
    }
  }
`;

const CREATE_BOOKING = gql`
  mutation CreateBooking($lotId: ID!, $slot: String!, $duration: Int!) {
    createBooking(lotId: $lotId, slot: $slot, duration: $duration) {
      id
      status
    }
  }
`;

@Injectable({
    providedIn: 'root'
})
export class BookingService {

    constructor(private apollo: Apollo) { }

    createBooking(booking: any): Observable<Booking> {
        // UI passes: user_id, lot_id, start_time, end_time, status, total_cost
        // GQL expects: lotId, slot, duration
        // We need to calculate duration and pick a slot (mock slot selection for now as UI doesn't allow picking slot)

        const start = new Date(booking.start_time);
        const end = new Date(booking.end_time);
        const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60));
        const slot = "A1"; // Hardcoded slot for simplicity as per UI limitation

        return this.apollo.mutate<{ createBooking: any }>({
            mutation: CREATE_BOOKING,
            variables: {
                lotId: booking.lot_id,
                slot: slot,
                duration: duration
            }
        }).pipe(
            map(result => {
                const b = result.data!.createBooking;
                return {
                    id: b.id,
                    status: b.status,
                    ...booking // spread original request to satisfy UI return expectation
                } as Booking;
            })
        );
    }

    getUserBookings(userId: string): Observable<Booking[]> {
        return this.apollo
            .watchQuery<{ myBookings: any[] }>({
                query: MY_BOOKINGS,
                fetchPolicy: 'network-only'
            })
            .valueChanges.pipe(
                map(result => result.data.myBookings.map(b => ({
                    ...b,
                    parking_lots: b.parkingLotInfo, // map for UI component compatibility
                    total_cost: b.totalAmount,
                    created_at: b.startTime, // approx
                    user_id: b.userId,
                    qr_code_data: `${b.lotId}_${b.slotNumber}`
                } as any)))
            );
    }

    getAllBookings(): Observable<Booking[]> {
        // Using myBookings as a proxy for now, in real app would use adminStats or specialized query
        return this.getUserBookings('admin');
    }
}
