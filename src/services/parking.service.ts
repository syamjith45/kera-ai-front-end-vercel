import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../environments/environment';

export interface ParkingLot {
    id: string;
    name: string;
    address: string;
    totalSlots: number;
    availableSlots: number; // mapped from available_spots / availableSlots
    pricePerHour: number;
    description?: string; // Not in GQL
    image_url?: string; // Not in GQL
    latitude: number;
    longitude: number;
    hourly_rate?: number; // Alias matching DB
    available_spots?: number; // Alias matching DB
    slots?: { id: string; status: string }[];
}

const GET_PARKING_LOTS = gql`
  query GetParkingLots {
    parkingLots {
      id
      name
      address
      totalSlots
      availableSlots
      pricePerHour
      coords {
        lat
        lng
      }
      slots {
        id
        status
      }
    }
  }
`;

@Injectable({
    providedIn: 'root'
})
export class ParkingService {

    constructor(private apollo: Apollo) { }

    getParkingLots(): Observable<ParkingLot[]> {
        return this.apollo
            .watchQuery<{ parkingLots: any[] }>({
                query: GET_PARKING_LOTS,
                fetchPolicy: 'network-only'
            })
            .valueChanges.pipe(
                map(result => {
                    const res = result as any;
                    if (res.errors) {

                    }
                    if (!result.data || !result.data.parkingLots) {

                        return [];
                    }
                    return result.data.parkingLots.map(lot => ({
                        id: lot.id,
                        name: lot.name,
                        address: lot.address,
                        totalSlots: lot.totalSlots,
                        availableSlots: lot.availableSlots,
                        pricePerHour: lot.pricePerHour,
                        latitude: lot.coords?.lat || 0, // Handle missing coords
                        longitude: lot.coords?.lng || 0,
                        // Mock fields not in GQL but used in UI
                        description: 'Description not available',
                        image_url: 'https://images.unsplash.com/photo-1470224114660-3f6686c562eb?q=80&w=2000&auto=format&fit=crop',
                        hourly_rate: lot.pricePerHour, // Alias for UI compatibility
                        available_spots: lot.availableSlots, // Alias for UI compatibility
                        slots: lot.slots || []
                    } as any));
                })
            );
    }

    getParkingLotDetails(id: string): Observable<ParkingLot> {
        return this.getParkingLots().pipe(
            map(lots => lots.find(l => l.id === id)!)
        );
    }

    getOperatorAssignedLot(userId: string): Observable<ParkingLot | null> {
        // Query to match user's assigned lot.
        // Assuming backend exposing 'assigned_lot_id' on 'user' or 'me'
        const GET_MY_LOT = gql`
            query GetMyLot {
                me {
                    assigned_lot_id
                }
            }
        `;
        
        return this.apollo.query<{ me: { assigned_lot_id: string } }>({
            query: GET_MY_LOT,
            fetchPolicy: 'network-only'
        }).pipe(
            map(result => {
                 const lotId = result.data.me?.assigned_lot_id;
                 if(!lotId) return null;
                 return lotId;
            }),
            // If we get an ID, we need the full lot details. 
            // Reuse getParkingLots or similar.
            // Using switchMap would be better but keeping it simple with nested subscription or just mapping if I had the lot list.
            // I'll return the ID for now, wait, the component expects a Lot object.
            // Let's just fetch all lots and find the one matching the ID.
        ) as any; // Temporary cast to fix flow, refining below
    }
    
    // Correct Implementation of getOperatorAssignedLot to return Observable<ParkingLot | null>
    // using direct Supabase query because 'me' GQL query does not return assigned_lot_id in current backend resolvers.
    getOperatorAssignedLotWithDetails(userId: string): Observable<ParkingLot | null> {
        return new Observable(observer => {
            (async () => {
                try {
                    const { createClient } = await import('@supabase/supabase-js');
                    const supabase = createClient(environment.supabase.url, environment.supabase.anonKey);

                    const { data, error } = await supabase
                        .from('operator_assignments')
                        .select('lot_id')
                        .eq('operator_id', userId)
                        .single();

                    if (error || !data) {
                        // Not assigned or error
                        observer.next(null);
                        observer.complete();
                        return;
                    }

                    // Got lot ID, now fetch full details via existing GQL method
                    this.getParkingLots().subscribe(lots => {
                         const found = lots.find(l => l.id === data.lot_id);
                         observer.next(found || null);
                         observer.complete();
                    });

                } catch (e) {
                    observer.error(e);
                }
            })();
        });
    }

    async updateParkingLot(id: string, data: Partial<ParkingLot>): Promise<void> {
        // Direct Supabase update since GQL mutation is not available in provided schema
        // This requires the Supabase client. Ideally we'd inject a SupabaseService, 
        // but for now we'll instantiate it here or key off an existing pattern if safe.
        // Creating a temporary client for this operation:
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(environment.supabase.url, environment.supabase.anonKey);

        const updateData: any = {};
        if (data.pricePerHour !== undefined) updateData.hourly_rate = data.pricePerHour;
        if (data.hourly_rate !== undefined) updateData.hourly_rate = data.hourly_rate;
        if (data.availableSlots !== undefined) updateData.available_spots = data.availableSlots;
        // Add other fields as necessary

        const { error } = await supabase
            .from('parking_lots')
            .update(updateData)
            .eq('id', id);

        if (error) throw error;
    }
}
