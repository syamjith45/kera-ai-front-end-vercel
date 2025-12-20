import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, Operator } from '../../../services/admin.service';
import { ParkingService, ParkingLot } from '../../../services/parking.service';

@Component({
  selector: 'app-operator-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-6">Operator Management</h2>
      
      <div class="overflow-x-auto bg-white rounded-lg shadow">
        <table class="min-w-full leading-normal">
          <thead>
            <tr>
              <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Operator
              </th>
              <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Email
              </th>
              <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Assigned Lot
              </th>
              <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let op of operators()">
              <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                <p class="text-gray-900 whitespace-no-wrap font-medium">{{ op.name }}</p>
              </td>
              <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                <p class="text-gray-900 whitespace-no-wrap">{{ op.email }}</p>
              </td>
              <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                <div class="flex items-center">
                  <select 
                    [ngModel]="op.assignedLotId || ''" 
                    (ngModelChange)="handleAssignmentChange(op, $event)"
                    class="block w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                    <option value="">Select Lot...</option>
                    <option *ngFor="let lot of parkingLots()" [value]="lot.id">
                      {{ lot.name }}
                    </option>
                  </select>
                </div>
              </td>
              <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                <span *ngIf="op.assignedLotId" class="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
                  <span aria-hidden class="absolute inset-0 bg-green-200 opacity-50 rounded-full"></span>
                  <span class="relative">Assigned</span>
                </span>
                <span *ngIf="!op.assignedLotId" class="relative inline-block px-3 py-1 font-semibold text-gray-900 leading-tight">
                    <span aria-hidden class="absolute inset-0 bg-gray-200 opacity-50 rounded-full"></span>
                    <span class="relative">Unassigned</span>
                </span>
                 <button *ngIf="op.assignedLotId" 
                        (click)="revoke(op)"
                        class="ml-4 text-red-600 hover:text-red-900">
                    Revoke
                 </button>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div *ngIf="operators().length === 0" class="p-4 text-center text-gray-500">
            No operators found.
        </div>
      </div>
      
      <!-- Parking Lot Maintenance Section -->
      <div class="mt-8">
        <h2 class="text-2xl font-bold mb-4">Parking Lot Maintenance</h2>
        <div class="bg-white rounded-lg shadow p-6">
             <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div *ngFor="let lot of parkingLots()" class="border p-4 rounded bg-gray-50 flex flex-col justify-between">
                     <div>
                         <h3 class="font-bold text-lg">{{ lot.name }}</h3>
                         <p class="text-sm text-gray-600">{{ lot.address }}</p>
                         <p class="mt-2" [class.text-red-500]="lot.totalSlots > 0 && lot.slots?.length === 0" [class.text-green-600]="lot.slots?.length! > 0">
                            Slots: {{ lot.slots?.length || 0 }} / {{ lot.totalSlots }}
                         </p>
                     </div>
                     <div class="mt-4">
                         <button *ngIf="lot.totalSlots > 0 && (!lot.slots || lot.slots.length === 0)"
                                 (click)="initializeForLot(lot.id)"
                                 class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full">
                             Initialize Slots
                         </button>
                         <span *ngIf="lot.slots && lot.slots.length > 0" class="text-green-600 text-sm font-medium">
                             ✓ Configured
                         </span>
                     </div>
                 </div>
             </div>
        </div>
      </div>
    </div>
  `
})
export class OperatorManagementComponent implements OnInit {
  private adminService = inject(AdminService);
  private parkingService = inject(ParkingService);

  operators = signal<Operator[]>([]);
  parkingLots = signal<ParkingLot[]>([]);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    // Load Operators
    this.adminService.getOperators().subscribe({
      next: (ops) => this.operators.set(ops),
      error: (e) => console.error('Error loading operators', e)
    });

    // Load Parking Lots for dropdown
    this.parkingService.getParkingLots().subscribe({
      next: (lots) => this.parkingLots.set(lots),
      error: (e) => console.error('Error loading lots', e)
    });
  }

  handleAssignmentChange(operator: Operator, newLotId: string) {
    if (!newLotId) return; // Handle revoke separately or via empty value if desired

    if (confirm(`Assign ${operator.name} to this lot?`)) {
      this.adminService.assignOperator(operator.id, newLotId).subscribe({
        next: () => {
          alert('Assigned successfully');
          this.loadData(); // Reload to refresh state
        },
        error: (err) => {
          console.error(err);
          alert('Failed to assign operator.');
        }
      });
    } else {
        // Reset selection if cancelled (would need better state management for strict UI, 
        // but this reloads on init anyway so simple refresh works or mapped state)
        this.loadData();
    }
  }

  revoke(operator: Operator) {
      if (!operator.assignedLotId) return;
      
      if (confirm(`Revoke assignment for ${operator.name}?`)) {
          this.adminService.revokeOperator(operator.id, operator.assignedLotId).subscribe({
              next: () => {
                  alert('Revoked successfully');
                  this.loadData();
              },
              error: (err) => {
                  console.error(err);
                  alert('Failed to revoke assignment.');
              }
          });
      }
  }
}
