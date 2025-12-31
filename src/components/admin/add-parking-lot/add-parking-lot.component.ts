import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ParkingService } from '../../../services/parking.service';

@Component({
  selector: 'app-add-parking-lot',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Add New Parking Lot
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Enter the details for the new parking facility.
          </p>
        </div>
        
        <form [formGroup]="lotForm" (ngSubmit)="onSubmit()" class="mt-8 space-y-6">
          <div class="rounded-md shadow-sm -space-y-px">
            
            <div class="mb-4">
              <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
              <input formControlName="name" id="name" type="text" required 
                class="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
                placeholder="Central Plaza Parking">
            </div>

            <div class="mb-4">
              <label for="address" class="block text-sm font-medium text-gray-700">Address</label>
              <input formControlName="address" id="address" type="text" required 
                class="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
                placeholder="123 Main St, City">
            </div>

            <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label for="totalSlots" class="block text-sm font-medium text-gray-700">Total Slots</label>
                  <input formControlName="totalSlots" id="totalSlots" type="number" required 
                    class="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
                    placeholder="50">
                </div>
                <div>
                  <label for="pricePerHour" class="block text-sm font-medium text-gray-700">Price/Hour ($)</label>
                  <input formControlName="pricePerHour" id="pricePerHour" type="number" step="0.01" required 
                    class="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
                    placeholder="2.50">
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label for="lat" class="block text-sm font-medium text-gray-700">Latitude</label>
                  <input formControlName="lat" id="lat" type="number" step="any" required 
                    class="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
                    placeholder="40.7128">
                </div>
                <div>
                  <label for="lng" class="block text-sm font-medium text-gray-700">Longitude</label>
                  <input formControlName="lng" id="lng" type="number" step="any" required 
                    class="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
                    placeholder="-74.0060">
                </div>
            </div>

            <div class="mb-4">
              <label for="slotPrefix" class="block text-sm font-medium text-gray-700">Slot Prefix</label>
              <input formControlName="slotPrefix" id="slotPrefix" type="text" required 
                class="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
                placeholder="A">
              <p class="text-xs text-gray-500 mt-1">Slots will be named A1, A2, etc.</p>
            </div>

          </div>

          <div *ngIf="errorMessage" class="text-red-500 text-sm text-center">
            {{ errorMessage }}
          </div>

          <div class="flex items-center justify-between space-x-4">
              <button type="button" routerLink="/admin/dashboard"
                class="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Cancel
              </button>
              <button type="submit" [disabled]="lotForm.invalid || isLoading"
                class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                <span *ngIf="isLoading">Creating...</span>
                <span *ngIf="!isLoading">Create Parking Lot</span>
              </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class AddParkingLotComponent {
  lotForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private parkingService: ParkingService,
    private router: Router
  ) {
    this.lotForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      totalSlots: ['', [Validators.required, Validators.min(1)]],
      pricePerHour: ['', [Validators.required, Validators.min(0)]],
      lat: ['', Validators.required],
      lng: ['', Validators.required],
      slotPrefix: ['A', Validators.required]
    });
  }

  onSubmit() {
    if (this.lotForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      const formValue = this.lotForm.value;
      
      // Ensure specific types are sent to GraphQL mutation
      const input = {
          name: formValue.name,
          address: formValue.address,
          totalSlots: parseInt(formValue.totalSlots, 10),
          pricePerHour: parseFloat(formValue.pricePerHour),
          lat: parseFloat(formValue.lat),
          lng: parseFloat(formValue.lng),
          slotPrefix: formValue.slotPrefix
      };

      this.parkingService.addParkingLot(input).subscribe({
        next: (result) => {
          console.log('Parking lot added successfully', result);
          this.router.navigate(['/admin/dashboard']);
        },
        error: (error) => {
          console.error('Error adding parking lot', error);
          this.errorMessage = error.message || 'Failed to add parking lot. Please try again.';
          this.isLoading = false;
        }
      });
    } else {
        this.lotForm.markAllAsTouched();
    }
  }
}
