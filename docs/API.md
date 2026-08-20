# REST API Reference Documentation

---

## Base URL
- **Development**: `http://localhost:8000/api/`
- **Production**: `https://api.theblackwash.com/api/`

---

## Response Formats

### Standard Success Response (`200 OK`, `201 Created`)
```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {}
}
```

### Standard Error Response (`400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict`, `429 Too Many Requests`)
```json
{
  "success": false,
  "message": "Validation failed.",
  "code": "VALIDATION_ERROR",
  "errors": {
    "field_name": ["This field is required."]
  }
}
```

---

## API Endpoint Matrix

### 1. Authentication & User Management (`/api/auth/`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register/` | Register new customer account | No |
| `POST` | `/api/auth/verify-otp/` | Verify email OTP code | No |
| `POST` | `/api/auth/resend-otp/` | Request new OTP code | No |
| `POST` | `/api/auth/login/` | User login (returns JWT tokens) | No |
| `POST` | `/api/auth/token/refresh/` | Refresh JWT access token | No |
| `GET` | `/api/auth/profile/` | Fetch current user profile | Yes |
| `PUT/PATCH` | `/api/auth/profile/` | Update profile information | Yes |

---

### 2. Vehicle Management (`/api/vehicles/`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/vehicles/` | List customer vehicles | Yes |
| `POST` | `/api/vehicles/` | Register new vehicle | Yes |
| `GET` | `/api/vehicles/{id}/` | Get vehicle details | Yes |
| `PUT/PATCH` | `/api/vehicles/{id}/` | Update vehicle | Yes |
| `DELETE` | `/api/vehicles/{id}/` | Remove vehicle | Yes |
| `POST` | `/api/vehicles/{id}/set_default/` | Set as primary default vehicle | Yes |

---

### 3. Services API (`/api/services/`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/services/` | List active bookable services | No |
| `GET` | `/api/admin/services/` | List all services (admin view) | Admin / Staff |
| `POST` | `/api/admin/services/` | Create new service | Admin / Staff |
| `PUT/PATCH` | `/api/admin/services/{id}/` | Update service details / price | Admin / Staff |
| `DELETE` | `/api/admin/services/{id}/` | Delete service | Admin / Staff |

---

### 4. Doorstep Wash Bookings (`/api/bookings/`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/bookings/` | List customer bookings | Yes |
| `POST` | `/api/bookings/` | Create doorstep wash booking | Yes |
| `GET` | `/api/bookings/{id}/` | Get booking details | Yes |
| `POST` | `/api/bookings/{id}/cancel/` | Cancel customer booking | Yes |
| `GET` | `/api/admin/bookings/` | List all system bookings | Admin / Staff |
| `PATCH` | `/api/admin/bookings/{id}/update_status/` | Progress booking status | Admin / Staff |

---

### 5. Razorpay Payments (`/api/payments/`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/payments/create-order/` | Create Razorpay order | Yes |
| `POST` | `/api/payments/verify/` | Verify Razorpay payment signature | Yes |
| `GET` | `/api/admin/payments/` | List payment ledger (admin view) | Admin / Staff |

---

### 6. Notifications & Bell (`/api/notifications/`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/notifications/` | List top 5 order notifications | Admin / Staff |
| `POST` | `/api/notifications/clear-all/` | Clear notification history | Admin / Staff |

---

### 7. Dynamic Image CMS (`/api/images/`, `/api/admin/images/`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/images/` | Fetch public active site images | No |
| `GET` | `/api/admin/images/` | List all image slots & Cloudinary URLs | Admin / Staff |
| `POST` | `/api/admin/images/upload/` | Upload image to Cloudinary | Admin / Staff |
| `POST` | `/api/admin/images/{key}/reset/` | Reset slot to default image | Admin / Staff |

---

### 8. Customer Testimonials (`/api/testimonials/`, `/api/admin/testimonials/`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/testimonials/` | List approved public testimonials | No |
| `POST` | `/api/testimonials/` | Submit customer feedback | No |
| `GET` | `/api/admin/testimonials/` | List all feedback (pending & approved) | Admin / Staff |
| `POST` | `/api/admin/testimonials/{id}/approve/` | Approve & publish feedback | Admin / Staff |
| `DELETE` | `/api/admin/testimonials/{id}/` | Delete feedback permanently | Admin / Staff |
