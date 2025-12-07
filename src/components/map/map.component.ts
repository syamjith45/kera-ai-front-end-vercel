
import { Component, ChangeDetectionStrategy, input, effect, afterNextRender, ElementRef, viewChild } from '@angular/core';

// This is to avoid TypeScript errors for the Leaflet library.
declare var L: any;

export interface MapLocation {
  name: string;
  lat: number;
  lng: number;
  type?: 'parking' | 'staff' | 'scanner' | 'barrier-open' | 'barrier-closed';
}

@Component({
  selector: 'app-map',
  template: `<div #mapContainer class="w-full h-full z-0"></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent {
  locations = input.required<MapLocation[]>();
  mapContainer = viewChild.required<ElementRef>('mapContainer');
  
  private map: any;
  private markers: any[] = [];
  private isMapInitialized = false;

  constructor() {
    afterNextRender(() => {
      this.initMap();
    });

    effect(() => {
      if (this.isMapInitialized) {
        this.updateMarkers(this.locations());
      }
    });
  }

  private initMap(): void {
    if (!this.mapContainer()) return;
    
    this.map = L.map(this.mapContainer().nativeElement, {
      zoomControl: false, // Hiding zoom controls for a cleaner mobile view
    }).setView([40.7128, -74.0060], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.isMapInitialized = true;
    this.updateMarkers(this.locations());
  }

  private getIcon(type: MapLocation['type'] = 'parking') {
    let iconHtml = '';
    switch (type) {
      case 'staff':
        iconHtml = `<div class="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md border-2 border-white"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" /></svg></div>`;
        break;
      case 'scanner':
        iconHtml = `<div class="bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md border-2 border-white"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5Z" /></svg></div>`;
        break;
      case 'barrier-closed':
        iconHtml = `<div class="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md border-2 border-white"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg></div>`;
        break;
      default: // parking
        iconHtml = `<div class="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg shadow-md border-2 border-white">P</div>`;
    }

    return L.divIcon({
      html: iconHtml,
      className: '', // important to clear default leaflet styles
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });
  }

  private updateMarkers(locations: MapLocation[]): void {
    // Clear existing markers
    this.markers.forEach(marker => this.map.removeLayer(marker));
    this.markers = [];

    if (!locations) return;

    // Add new markers
    locations.forEach(location => {
      const icon = this.getIcon(location.type);
      const marker = L.marker([location.lat, location.lng], { icon })
        .addTo(this.map)
        .bindPopup(`<b>${location.name}</b>`);
      this.markers.push(marker);
    });

    // Fit map to markers if there are any
    if (locations.length > 0) {
      const group = L.featureGroup(this.markers);
      this.map.fitBounds(group.getBounds().pad(0.3));
    }
  }
}
