import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-8">
      <h1 class="text-3xl font-bold mb-4">Admin Dashboard</h1>
      <p class="mb-4">Welcome, Admin. You can manage parking lots and view stats.</p>
      
       <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="p-4 border rounded shadow">
            <h2 class="font-bold text-xl mb-2">Parking Lots</h2>
            
            <!-- Conditional UI: Both Admin and Superadmin can see -->
            <button *ngIf="['admin', 'superadmin'].includes(userRole || '')" 
                    class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                Add New Lot
            </button>
        </div>

        <div class="p-4 border rounded shadow">
            <h2 class="font-bold text-xl mb-2">Operators</h2>
            <p class="mb-2">Assign operators to parking lots.</p>
            <a routerLink="/admin/operators" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-block">
                Manage Operators
            </a>
        </div>
      </div>
    </div>
  `
})
export class AdminDashboardComponent {
  userRole = localStorage.getItem('userRole');
}
