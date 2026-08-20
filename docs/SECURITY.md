# Security & Access Control Specification

---

## 1. Overview

This document outlines the security architecture, Role-Based Access Control (RBAC), authentication mechanisms, rate-limiting, and data safety practices implemented across **The Black Wash** platform.

---

## 2. Authentication Architecture

- **Token Mechanism**: JSON Web Tokens (JWT) issued via SimpleJWT (`rest_framework_simplejwt`).
- **Token Lifetimes**:
  - Access Token: 1 Hour
  - Refresh Token: 7 Days
- **Token Rotation & Blacklisting**: `ROTATE_REFRESH_TOKENS = True` and `BLACKLIST_AFTER_ROTATION = True`. Refresh tokens are invalidated upon rotation or logout.

---

## 3. Role-Based Access Control (RBAC) Matrix

| User Role | Customer Endpoints | Public Services/Images | Admin Dashboard | Admin Services/Images | Testimonial Moderation |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Unauthenticated** | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Customer** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Manager** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Admin / Owner** | ✅ | ✅ | ✅ | ✅ | ✅ |

- **Permission Classes**:
  - `IsAdminOrStaff`: Restricts access to users with `role in ["admin", "manager", "staff"]`.
  - `IsBookingOwner`: Ensures customers can only access their own bookings.

---

## 4. Rate Limiting (Throttling)

API endpoints are protected against brute-force and Denial-of-Service (DoS) attacks via DRF throttle classes:

| Throttle Scope | Limit | Target Endpoints |
| :--- | :--- | :--- |
| `anon` | 1000 / day | Public landing pages & service listings |
| `user` | 10000 / day | Authenticated user actions |
| `auth` | 30 / minute | `/api/auth/login/`, `/api/auth/register/` |
| `otp` | 10 / minute | `/api/auth/verify-otp/`, `/api/auth/resend-otp/` |
| `payment` | 100 / minute | `/api/payments/create-order/`, `/api/payments/verify/` |

---

## 5. Defense-in-Depth Measures

- **HTTP Security Headers**:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: same-origin`
- **Exception Sanitization**: `custom_exception_handler` strips out database stack traces, file system paths, and internal exceptions before delivering JSON responses to clients.
- **SQL Injection Prevention**: All queries rely on Django's ORM parameterized queries.
- **Cross-Site Scripting (XSS)**: Inputs sanitized, React/Next.js automatic escaping enforced.
- **Secret Safety**: Secrets managed via `.env` files; `.env` is excluded from git via `.gitignore`.
