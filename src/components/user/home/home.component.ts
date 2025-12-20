import { Component, ChangeDetectionStrategy, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MapComponent, MapLocation } from '../../map/map.component';
import { ParkingService } from '../../../services/parking.service';

@Component({
  selector: 'app-user-home',
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MapComponent]
})
export class UserHomeComponent implements OnInit {
  private parkingService = inject(ParkingService);
  private router = inject(Router);
  viewMode = signal<'map' | 'list'>('map');
  parkingGarages = signal<(MapLocation & { id: string; distance: string; available: number; price: number; })[]>([]);

  userLocation = signal<{ lat: number; lng: number } | null>(null);

  ngOnInit() {
    this.getUserLocation();
    
    this.parkingService.getParkingLots().subscribe({
      next: (lots) => {
        const currentLoc = this.userLocation();
        
        const mappedLots = lots.map(lot => {
          let distanceStr = 'Calculating...';
          if (currentLoc) {
             const dist = this.calculateDistance(currentLoc.lat, currentLoc.lng, lot.latitude, lot.longitude);
             distanceStr = `${dist.toFixed(1)} km`; 
          }
          
          return {
            id: lot.id,
            name: lot.name,
            distance: distanceStr,
            available: lot.availableSlots,
            price: lot.pricePerHour,
            lat: lot.latitude,
            lng: lot.longitude,
            type: 'parking' as const
          };
        });
        this.parkingGarages.set(mappedLots);
      },
      error: (err) => {
        console.error('Error fetching parking lots:', err);
      }
    });
  }

  getUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLocation.set({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          // Refresh list with new location
          this.refreshDistances();
        },
        (error) => {
          console.warn('Geolocation denied or failed', error);
          this.userLocation.set(null);
        }
      );
    } else {
       console.warn('Geolocation not supported');
    }
  }

  refreshDistances() {
      const currentLoc = this.userLocation();
      if (!currentLoc) return;

      this.parkingGarages.update(garages => {
          return garages.map(g => ({
              ...g,
              distance: `${this.calculateDistance(currentLoc.lat, currentLoc.lng, g.lat, g.lng).toFixed(1)} km`
          }));
      });
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  }

  deg2rad(deg: number) {
    return deg * (Math.PI / 180);
  }

  setViewMode(mode: 'map' | 'list') {
    this.viewMode.set(mode);
  }

  navigateToBooking(lotId: string) {
    this.router.navigate(['/user/booking', lotId]);
  }
}