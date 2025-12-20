import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../environments/environment';

export interface Operator {
  id: string;
  name: string;
  email: string;
  assignedLotId?: string; // Optional, populated if assigned
}

// Note: Backend 'allUsers' resolver ignores arguments, so we fetch all and filter here.
const GET_OPERATORS = gql`
  query GetOperators {
    allUsers {
      uid
      name
      email
      role
      # assigned_lot_id not in 'allUsers' return type in backend snippet, 
      # but we need it. If it's not there, we might need a separate query or join.
      # For now, let's assume 'users' query returns what we need OR we can't show assignment in list properly
      # without a separate call. 
      # Actually, backend 'allUsers' returns: uid, name, email, role, vehicle... NO assigned_lot_id.
      # To show "Assigned Lot" in UI, we need to fetch assignments separately.
    }
  }
`;

const ASSIGN_OPERATOR = gql`
  mutation AssignOperator($userId: ID!, $lotId: ID!) {
    assignOperator(userId: $userId, lotId: $lotId)
  }
`;



const INITIALIZE_SLOTS = gql`
  mutation InitializeSlots($lotId: ID!, $prefix: String) {
    initializeSlots(lotId: $lotId, prefix: $prefix)
  }
`;

const REVOKE_OPERATOR = gql`
  mutation RevokeOperator($userId: ID!, $lotId: ID!) {
     revokeOperator(userId: $userId, lotId: $lotId)
  }
`;

// Helper query for assignments if needed, or we just fetch assignments table directly?
// Let's stick to standard GQL if possible, but if not, we do what we must.
// The UI expects 'assignedLotId'.
// I'll fetch ALL assignments via Supabase (since GQL has no list assignments query) 
// and map them. This is efficient enough for admin.

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private apollo: Apollo) { }

  getOperators(): Observable<Operator[]> {
    return new Observable(observer => {
        (async () => {
             // 1. Fetch Users via GQL
             this.apollo.query<{ allUsers: any[] }>({
                 query: GET_OPERATORS,
                 fetchPolicy: 'network-only'
             }).subscribe(async (result) => {
                 const allUsers = result.data.allUsers;
                 const operators = allUsers.filter(u => u.role === 'operator');

                 // 2. Fetch Assignments via Supabase to map 'assignedLotId'
                 // (Backend 'allUsers' doesn't return it)
                 try {
                     const { createClient } = await import('@supabase/supabase-js');
                     const supabase = createClient(environment.supabase.url, environment.supabase.anonKey);
                     
                     const { data: assignments } = await supabase
                        .from('operator_assignments')
                        .select('*');

                     const mapped = operators.map(u => {
                         const assign = assignments?.find((a: any) => a.operator_id === u.uid);
                         return {
                             id: u.uid,
                             name: u.name,
                             email: u.email,
                             assignedLotId: assign?.lot_id
                         };
                     });
                     
                     observer.next(mapped);
                     observer.complete();

                 } catch (e) {
                     console.error('Error fetching assignments', e);
                     // Return operators without assignment info on error
                     observer.next(operators.map(u => ({
                         id: u.uid,
                         name: u.name,
                         email: u.email
                     })));
                     observer.complete();
                 }
             });
        })();
    });
  }

  initializeSlots(lotId: string, prefix: string = 'A'): Observable<any> {
    return this.apollo.mutate({
      mutation: INITIALIZE_SLOTS,
      variables: { lotId, prefix }
    });
  }

  assignOperator(userId: string, lotId: string): Observable<any> {
    return this.apollo.mutate({
      mutation: ASSIGN_OPERATOR,
      variables: { userId, lotId }
    });
  }

  revokeOperator(userId: string, lotId: string): Observable<any> {
    return this.apollo.mutate({
      mutation: REVOKE_OPERATOR,
      variables: { userId, lotId }
    });
  }
}
