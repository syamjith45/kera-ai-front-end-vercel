# Comprehensive Role Walkthrough

This document guides you through the application flows for all four distinct user roles: **User**, **Operator**, **Admin**, and **Superadmin**.

---

## 1. User (Driver)
**Goal**: Find a parking spot, book it, and park.

1.  **Login**: Enter valid user credentials.
2.  **Home Screen (`/user/home`)**:
    *   View map/list of available parking lots.
    *   See price and availability.
    *   Click **"Book Now"** on a lot (e.g., "Airport View Parking").
3.  **Booking Screen**:
    *   Select **Start Time** and **End Time**.
    *   Review the calculated **Total Cost**.
    *   Click **"Book"**.
4.  **Payment**:
    *   You are redirected to a simulated Payment page.
    *   Click **"Pay"** (waits 2s for success).
5.  **My Passes (`/user/passes`)**:
    *   View your **Active Pass**.
    *   **QR Code**: Displayed for verification.
    *   **Status**: Starts as `PENDING`. Shows `ACTIVE` after operator scan.

---

## 2. Operator (Lot Manager)
**Goal**: Manage day-to-day lot operations, check-in cars, and handle walk-ins.

1.  **Login**: Enter valid operator credentials.
2.  **Dashboard (`/operator/dashboard`)**:
    *   View overview stats (Occupancy, Today's Earnings).
3.  **Live View (`/operator/live-view`)**:
    *   See a real-time grid of slots (Green = Empty, Red = Taken).
4.  **Scanner (`/operator/scanner`)** (New!):
    *   **Task**: Check-in a pre-booked User.
    *   **Action**: Scan the User's QR Code or type their Booking ID.
    *   **Result**: "Verified!" message, status updates to `ACTIVE`.
5.  **Spot Booking (`/operator/spot-booking`)**:
    *   **Task**: Book for a driver *without* the app.
    *   **Action**: Enter Name, Phone, Duration, and pick a Slot.
    *   **Result**: Instant booking created, slot marked occupied.

---

## 3. Admin (Lot Owner)
**Goal**: Manage operators and oversee specific parking lots.

1.  **Login**: Enter valid admin credentials.
2.  **Dashboard (`/admin/dashboard`)**:
    *   View aggregate stats for your assigned lots.
3.  **Operator Management (`/admin/operators`)**:
    *   View list of all operators.
    *   **Assign**: Link an operator to a specific Parking Lot.
    *   **Revoke**: Remove operator access from a lot.

---

## 4. Superadmin (System Owner)
**Goal**: Full system oversight.

1.  **Login**: Enter superadmin credentials.
2.  **Dashboard (`/superadmin/dashboard`)**:
    *   View system-wide analytics (All lots, global revenue).
    *   **Exclusive UI**: Sees "Super Admin Exclusive" panels.
3.  **Access**:
    *   Can access **ALL** Admin routes (Operator Management).
    *   Can access **ALL** Operator routes (for debugging/supervision).

---

### Access Control Note
*   The system uses **Role Guards**.
*   A **User** cannot see the Operator dashboard.
*   An **Operator** cannot see the Admin panel.
*   **Superadmin** has the highest privileges.
