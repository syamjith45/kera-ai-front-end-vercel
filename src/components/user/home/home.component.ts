
import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent, MapLocation } from '../../map/map.component';

@Component({
  selector: 'app-user-home',
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MapComponent]
})
export class UserHomeComponent {
  viewMode = signal<'map' | 'list'>('map');

  parkingGarages: (MapLocation & { distance: string; available: number; price: number; })[] = [
    { name: 'Central Plaza Garage', distance: '0.2 mi', available: 15, price: 5, lat: 40.7155, lng: -74.0042, type: 'parking' },
    { name: 'Downtown Parking Lot', distance: '0.4 mi', available: 8, price: 6, lat: 40.7101, lng: -74.0051, type: 'parking' },
    { name: 'Uptown Structure', distance: '0.5 mi', available: 25, price: 4, lat: 40.7182, lng: -74.0088, type: 'parking' },
    { name: 'City Center Parkade', distance: '0.8 mi', available: 12, price: 5, lat: 40.7129, lng: -73.9984, type: 'parking' },
  ];

  setViewMode(mode: 'map' | 'list') {
    this.viewMode.set(mode);
  }
}