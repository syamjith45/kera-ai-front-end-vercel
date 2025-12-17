import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
            })
            .valueChanges.pipe(
                map(result => {
                    const res = result as any;
                    if (res.errors) {
                        console.error('GraphQL Errors in getParkingLots:', res.errors);
                    }
                    if (!result.data || !result.data.parkingLots) {
                        console.warn('No parking lots found in response data');
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
                        available_spots: lot.availableSlots // Alias for UI compatibility
                    } as any));
                })
            );
    }

    getParkingLotDetails(id: string): Observable<ParkingLot> {
        // Since there's no single lot query in GQL provided, filtering from list or just returning mocked details if needed.
        // Or re-using getParkingLots and finding the one.
        return this.getParkingLots().pipe(
            map(lots => lots.find(l => l.id === id)!)
        );
    }

    async updateParkingLot(id: string, data: Partial<ParkingLot>): Promise<void> {
        // Direct Supabase update since GQL mutation is not available in provided schema
        // This requires the Supabase client. Ideally we'd inject a SupabaseService, 
        // but for now we'll instantiate it here or key off an existing pattern if safe.
        // Creating a temporary client for this operation:
        const { createClient } = await import('@supabase/supabase-js');
        const { supabaseConfig } = await import('../supabase-config');
        const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

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
