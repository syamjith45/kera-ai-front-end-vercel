import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface UserProfile {
    id: string; // references auth.users
    email?: string;
    full_name?: string;
    vehicle_make?: string;
    vehicle_model?: string; // Not in GQL explicitly ("vehicle_make" is mostly just "type" there? Schema: vehicle_make, vehicle_plate)
    vehicle_plate?: string;
    phone_number?: string;
    created_at?: string;
    updated_at?: string;
    role?: string;
}

const GET_ME = gql`
  query GetCurrentUser {
    me {
      uid
      name
      email
      role
    }
  }
`;

const SETUP_PROFILE = gql`
  mutation SetupProfile($name: String!, $vehicle: VehicleInput!) {
    setupProfile(name: $name, vehicle: $vehicle) {
      uid
      name
    }
  }
`;

@Injectable({
    providedIn: 'root'
})
export class ProfileService {

    constructor(private apollo: Apollo) { }

    getProfile(userId: string): Observable<UserProfile> {
        console.log('ProfileService.getProfile called for:', userId);
        return this.apollo
            .watchQuery<{ me: any }>({
                query: GET_ME,
                fetchPolicy: 'network-only' // Force network fetch to avoid cache issues during debug
            })
            .valueChanges.pipe(
                map(result => {
                    console.log('ProfileService.getProfile raw result:', result);

                    if (result.loading && !result.data) {
                        console.log('ProfileService.getProfile: Loading...');
                        // Return a placeholder or standard object, or filter this out upstream if possible. 
                        // For now, returning a basic object with ID so the UI doesn't crash.
                        return { id: userId };
                    }

                    const me = result.data?.me;

                    if (!me) {
                        console.warn('ProfileService.getProfile: "me" is null (or data missing)');
                        return { id: userId };
                    }
                    console.log('ProfileService.getProfile mapped user:', me);
                    return {
                        id: me.uid,
                        email: me.email,
                        full_name: me.name,
                        vehicle_make: me.vehicle_make,
                        vehicle_plate: me.vehicle_plate,
                        role: me.role,
                        vehicle_model: 'Standard' // Default
                    } as UserProfile;
                })
            );
    }

    updateProfile(userId: string, data: Partial<UserProfile>): Observable<UserProfile> {
        // Map UI data to Mutation arguments
        // mutation setupProfile(name: String!, vehicle: VehicleInput!)
        // input VehicleInput { registrationNumber: String!, type: VehicleType! }
        // VehicleType enum: TWO_WHEELER, FOUR_WHEELER, SUV

        const vehicleType = 'FOUR_WHEELER'; // Defaulting for now as UI doesn't have selector

        return this.apollo.mutate<{ setupProfile: any }>({
            mutation: SETUP_PROFILE,
            variables: {
                name: data.full_name || 'User',
                vehicle: {
                    registrationNumber: data.vehicle_plate || 'UNKNOWN',
                    type: vehicleType
                }
            }
        }).pipe(
            map(result => {
                // Return updated object in UI format
                return {
                    id: result.data!.setupProfile.uid,
                    full_name: result.data!.setupProfile.name,
                    ...data
                } as UserProfile;
            })
        );
    }
}
