import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const RoleGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const userRole = localStorage.getItem('userRole');

    // Get expected roles from route data
    const expectedRoles = route.data?.['roles'] as string[];

    if (!userRole) {
        // Not logged in (or no role found)
        router.navigate(['/auth/login']);
        return false;
    }

    if (expectedRoles && !expectedRoles.includes(userRole)) {
        // Role not authorized
        console.warn(`Access denied. User role '${userRole}' not in [${expectedRoles}]`);
        router.navigate(['/user/home']); // Or an access-denied page
        return false;
    }

    return true;
};
