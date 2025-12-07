
import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent, MapLocation } from '../../map/map.component';

@Component({
  selector: 'app-operator-live-view',
  templateUrl: './live-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MapComponent]
})
export class OperatorLiveViewComponent {
  siteLocations = signal<MapLocation[]>([
    { name: 'On-Site Staff', lat: 40.7145, lng: -74.0040, type: 'staff' },
    { name: 'Active Scanner', lat: 40.7130, lng: -74.0080, type: 'scanner' },
    { name: 'Boom Barrier', lat: 40.7120, lng: -74.0065, type: 'barrier-closed' },
  ]);
}
