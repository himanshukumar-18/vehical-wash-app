# Architecture & System Design Specification

---

## 1. Executive Summary

**The Black Wash** is engineered as a decoupled full-stack web platform built for high-reliability doorstep car washing operations. The system comprises a client-side Next.js 16 App Router application, a Django 5 REST Framework backend API, PostgreSQL relational storage, Redis caching, Celery task worker queue, Razorpay Payment Gateway integration, and Cloudinary dynamic media hosting.

---

## 2. System Architecture Diagram

```
+-----------------------------------------------------------------------+
|                          CLIENT LAYER                                 |
|                                                                       |
|   +---------------------------------------------------------------+   |
|   |                  Next.js 16 (App Router)                      |   |
|   |    - Redux Toolkit (State Management)                         |   |
|   |    - Axios Client (JWT Interceptor)                           |   |
|   |    - Razorpay Checkout SDK                                    |   |
|   +-------------------------------+-------------------------------+   |
+-----------------------------------|-----------------------------------+
                                    |
                               HTTP / HTTPS (REST API)
                                    |
+-----------------------------------|-----------------------------------+
|                          API LAYER                                    |
|                                   v                                   |
|   +---------------------------------------------------------------+   |
|   |                  Django 5 REST Framework                      |   |
|   |    - SimpleJWT (Auth & Token Rotation)                        |   |
|   |    - Custom Exception Handler (Standard Response Format)      |   |
|   |    - Rate Throttling (Anon: 1000/day, User: 10000/day)         |   |
|   |    - Role-Based Permissions (Customer, Manager, Admin)        |   |
|   +-------+---------------+---------------+---------------+-------+   |
+-----------|---------------|---------------|---------------|-----------+
            |               |               |               |
            v               v               v               v
    +---------------+ +-----------+ +---------------+ +---------------+
    |  PostgreSQL   | |   Redis   | |   Razorpay    | |  Cloudinary   |
    |  Relational   | | Cache /   | |  Payment API  | | Dynamic Image |
    |   Database    | | Celery MQ | | (HMAC SHA256) | |      CDN      |
    +---------------+ +-----------+ +---------------+ +---------------+
```

---

## 3. Core Modules & Subsystems

### 3.1 Authentication & Authorization Subsystem (`users` App)
- **User Model**: Custom `AbstractUser` model storing `email` (primary identifier), `fullname`, `phone`, `role` (`customer`, `manager`, `admin`), `is_verified`, and timestamps.
- **Authentication**: SimpleJWT handles token generation, rotation, and blacklisting upon logout.
- **OTP Verification**: OTP code generation with expiry timestamp and retry rate limits (`10/min`).

### 3.2 Doorstep Booking Subsystem (`bookings` App)
- **Booking Lifecycle**:
  `PENDING` $\rightarrow$ `CONFIRMED` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `COMPLETED` / `CANCELLED`.
- **Financial Validation**: Service price snapshots are captured at booking creation to preserve audit history against future price changes.

### 3.3 Payment Subsystem (`payments` App)
- **Financial Calculations**: Service amounts are computed exclusively on the backend (`Decimal(service.price)`). Frontend financial inputs are ignored.
- **Razorpay Verification**: Verification relies on HMAC SHA256 signature verification over `f"{order_id}|{payment_id}"`.
- **Idempotency**: Prevents duplicate order creation by checking for existing `CREATED` payment records before calling Razorpay API.

### 3.4 Media Subsystem (`imageupdation` App)
- **Cloudinary Dynamic CMS**: Admin key-value asset management system (`home_hero`, `why_choose_image`, `about_main`, `offer_banner`, etc.) permitting non-technical owners to update site images safely.

### 3.5 Testimonials Subsystem (`testimonials` App)
- **Customer Feedback & Approval**: Customer feedback defaults to `is_approved = False`. Published to public landing page only upon admin approval.

---

## 4. Exception Handling Architecture

All backend API errors are caught by `config.exceptions.custom_exception_handler` and converted into a standardized JSON response:

```json
{
  "success": false,
  "message": "Human readable error summary",
  "code": "ERROR_CODE_ENUM",
  "errors": {
    "field_name": ["Specific validation error details"]
  }
}
```

This prevents leakage of stack traces, database schema details, or sensitive server paths to production clients.
