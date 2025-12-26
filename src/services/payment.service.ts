import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

const CREATE_PAYMENT_ORDER = gql`
  mutation CreatePaymentOrder($bookingId: ID!) {
    createPaymentOrder(bookingId: $bookingId) {
      orderId
      amount
      currency
      bookingId
      status
    }
  }
`;

const PAY_ORDER = gql`
  mutation PayOrder($orderId: ID!) {
    payOrder(orderId: $orderId) {
      success
      message
      paymentId
      orderId
    }
  }
`;

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  constructor(private apollo: Apollo) {}

  // amount param is optional now, backend uses booking.total_cost
  processPayment(amount: number, bookingId: string): Observable<boolean> {
    return this.apollo.mutate<{ createPaymentOrder: any }>({
      mutation: CREATE_PAYMENT_ORDER,
      variables: { bookingId }
    }).pipe(
      switchMap(res => {
        const orderId = res.data!.createPaymentOrder.orderId;
        return this.callPayOrder(orderId);
      })
    );
  }

  private callPayOrder(orderId: string): Observable<boolean> {
    return this.apollo.mutate<{ payOrder: any }>({
      mutation: PAY_ORDER,
      variables: { orderId }
    }).pipe(
      map(res => !!res.data?.payOrder?.success)
    );
  }
}
