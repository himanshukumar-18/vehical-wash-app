# Testing Strategy & Verification Guide

---

## 1. Overview

This document outlines the automated testing suite, type verification, production build checks, and manual E2E validation procedures for **The Black Wash**.

---

## 2. Backend Automated Test Suite

The Django backend contains 40 automated unit & integration tests covering authentication, vehicles, services, bookings, payments, notifications, dynamic images, and testimonials.

### Running Backend Tests
```bash
cd backend

# Execute all tests using in-memory SQLite database
USE_SQLITE=True ./venv/bin/python manage.py test
```

### Backend Test Coverage Summary
- `users`: Registration, OTP generation, verification, SimpleJWT authentication, role permissions.
- `services`: Public service listing, admin service CRUD, price validation.
- `vehicles`: Vehicle registration, customer owner isolation, default vehicle toggle.
- `bookings`: Doorstep wash booking creation, address validation, status progression.
- `payments`: Razorpay order creation, amount calculation, HMAC SHA256 signature verification, idempotency.
- `imageupdation`: Dynamic Cloudinary image CMS asset keys, admin upload, reset.
- `testimonials`: Public submission, `is_approved` status, admin approval, deletion.

---

## 3. Frontend Type Safety & Production Build

### TypeScript Compilation Check
```bash
cd frontend
npx tsc --noEmit
```

### Next.js Production Build Test
```bash
cd frontend
npm run build
```

---

## 4. End-to-End (E2E) Manual Test Lifecycle

### Scenario A: Customer Doorstep Booking Lifecycle
1. Navigate to `http://localhost:3000/`.
2. Click **Register** $\rightarrow$ Enter details $\rightarrow$ Receive OTP email $\rightarrow$ Submit OTP.
3. Login $\rightarrow$ Go to **My Vehicles** $\rightarrow$ Add vehicle (e.g. Honda City, Sedan).
4. Click **Book a Wash** $\rightarrow$ Select Vehicle $\rightarrow$ Select Service (e.g. Full Detailing) $\rightarrow$ Pick Date $\rightarrow$ Enter Address $\rightarrow$ Review Order $\rightarrow$ Pay via Razorpay.
5. Verify order is created with `CONFIRMED` status in **My Bookings**.

### Scenario B: Admin Review & Management Workflow
1. Login as Admin $\rightarrow$ Navigate to `/admin`.
2. Check order notification bell chime sound and popup list.
3. Navigate to `/admin/services` $\rightarrow$ Add / Edit car wash service.
4. Navigate to `/admin/testimonials` $\rightarrow$ Review pending customer feedback $\rightarrow$ Click **Approve**.
5. Verify approved review appears dynamically on public homepage.
