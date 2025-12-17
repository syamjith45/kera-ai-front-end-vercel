import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-8">
      <h1 class="text-3xl font-bold mb-4">Super Admin Dashboard</h1>
      <p class="mb-4">Welcome, Super Admin. You have full system access.</p>
      
      <!-- Conditional UI example: Only Superadmin sees this -->
      <div *ngIf="userRole === 'superadmin'" class="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-4">
          <h3 class="font-bold">Super Admin Exclusive</h3>
          <p>You can see this because you are a Super Admin.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="p-4 border rounded shadow">
            <h2 class="font-bold text-xl mb-2">Manage Users</h2>
            <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Assign Roles
            </button>
        </div>
      </div>
    </div>
  `
})
export class SuperAdminDashboardComponent {
  userRole = localStorage.getItem('userRole');
}
