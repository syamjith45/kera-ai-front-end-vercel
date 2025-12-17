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

  ngOnInit() {
    this.parkingService.getParkingLots().subscribe({
      next: (lots) => {
        console.log('Received parking lots:', lots.length);
        const mappedLots = lots.map(lot => ({
          id: lot.id,
          name: lot.name,
          distance: '0.5 mi', // Todo: Calculate actual distance based on user location
          available: lot.availableSlots,
          price: lot.pricePerHour,
          lat: lot.latitude,
          lng: lot.longitude,
          type: 'parking' as const
        }));
        this.parkingGarages.set(mappedLots);
      },
      error: (err) => {
        console.error('Error fetching parking lots:', err);
      }
    });
  }

  setViewMode(mode: 'map' | 'list') {
    this.viewMode.set(mode);
  }

  navigateToBooking(lotId: string) {
    this.router.navigate(['/user/booking', lotId]);
  }
}