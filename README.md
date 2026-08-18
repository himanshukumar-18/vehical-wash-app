# The Black Wash

**The Black Wash** is a modern, premium car-wash home-service platform designed for doorstep vehicle detailing. Customers can browse detailing services, specify their doorstep service location using GPS, schedule preferred service dates, complete secure online payments via Razorpay, and track their wash status in real time. The platform features an event-driven notification engine, full admin booking management, and a containerized multi-service architecture.

---

## Overview

The Black Wash operates as a mobile van car-wash service where professional detailing teams travel directly to the customer's specified address with high-pressure washing equipment and water supplies. The application provides an intuitive customer booking portal alongside an administrative management panel for service confirmation, staff dispatching, payment settlement, and real-time customer communications.

---

## Key Features

- **JWT Authentication & Security**: Email/Password authentication with 6-digit OTP email verification.
- **Doorstep Service Architecture**: Mobile car wash booking flow with GPS location detection and technician contact mobile collection.
- **Dynamic Pricing Engine**: Automated base price, GST calculation, coupon discounts, and grand total computation.
- **Razorpay Payment Gateway**: Online checkout, signature verification, and automated transaction settlement.
- **Event-Driven Notifications**: Real-time in-app alerts and responsive HTML email dispatching powered by Celery & Redis.
- **Idempotency & Duplicate Protection**: Database-level event key constraints to prevent duplicate emails or repeat notification triggers.
- **Admin Management Panel**: Real-time dashboard metrics, booking state transitions (`PENDING` → `CONFIRMED` → `IN_PROGRESS` → `COMPLETED`), customer directory, and financial audit logs.
- **Cinematic Welcome Experience**: Luxury 5-scene welcome animation with session-based `localStorage` persistence.
- **Containerized Stack**: Complete Docker Compose setup for PostgreSQL, Redis, Django API, Celery Workers, and Next.js Frontend.

---

## Customer Features

### Authentication & Account Management
- **User Registration**: Create customer accounts with mandatory full name, email, and password.
- **OTP Verification**: Secure 6-digit OTP dispatched via HTML email for account activation.
- **JWT Login & Session**: Secure JWT access & refresh token pair management with blacklist logout support.

### Service Discovery & Vehicle Setup
- **Service Catalog**: Browse detailing packages (e.g. Testing, Deluxe Wash, Full Detailing) with dynamic pricing fetched from backend REST endpoints.
- **Vehicle Profiles**: Register customer vehicles with brand, model, and registration number.

### Mobile Doorstep Booking Flow
- **Vehicle & Package Selection**: Choose registered vehicle and wash package.
- **Preferred Date Selection**: Select preferred service date without rigid time-slot restrictions.
- **Doorstep Address & GPS Location**: Enter house/flat address, landmark, PIN code, contact phone number, or click **Use Current Location (GPS)** for automated reverse geocoding.
- **Review & Checkout**: Instant pricing breakdown including GST (18%) and applied discount.

### Booking Management & Cancellation
- **My Bookings Dashboard**: View active and historical bookings with status badges (`Pending`, `Confirmed`, `In Progress`, `Completed`, `Cancelled`).
- **Booking Cancellation**: Customers can cancel `Pending` or `Confirmed` bookings directly from their dashboard with automated backend status updates.

---

## Admin Features

- **Admin Dashboard Metrics**: Real-time counters for Total Bookings, Pending Confirmations, Active Wash Requests, Completed Services, and Total Revenue.
- **Booking State Management**: Single-click action handlers to confirm (`CONFIRMED`) and complete (`COMPLETED`) customer doorstep wash requests.
- **Direct Staff Calling**: Dedicated **Contact Mobile** column displaying customer phone numbers with clickable `tel:` links for on-the-field technicians.
- **Customer Directory**: View registered customer profiles with financial integrity preservation.
- **Payment & Financial Audit**: Track payment statuses (`Pending`, `Paid`, `Failed`, `Refunded`) and transaction identifiers.

---

## Payment & Notification System

### Payment Flow Architecture

```text
Customer Checkout
       ↓
Create Razorpay Order (Backend)
       ↓
Razorpay Modal (Frontend)
       ↓
Backend Signature Verification (`razorpay.Client`)
       ↓
Payment Status Updated to PAID (`transaction.atomic`)
       ↓
Automated Booking Confirmation & Receipt Email
```

### Notification Engine Architecture

```text
Business Event (OTP / Payment / Status Change)
       ↓
Notification Service (Database Record with Unique `event_key`)
       ↓
Email Service (Celery Worker / Fallback Synchronous Dispatch)
       ↓
Customer Inbox & In-App Notification Center
```

Supported Events:
1. **OTP Verification**: 6-digit verification code email with 10-minute expiry.
2. **Registration Welcome**: Instant welcome email upon successful account activation.
3. **Payment Successful**: Transaction receipt with payment ID, method, and amount.
4. **Booking Confirmed**: Confirmation email dispatched when admin approves booking.
5. **Booking Completed**: Completion receipt dispatched when wash service is finished.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | Next.js 16 (App Router, Turbopack) & React 19 |
| **Language** | TypeScript & JavaScript (ES6+) |
| **Styling** | Tailwind CSS 4 & CSS Custom Properties |
| **State Management** | Redux Toolkit & React Context |
| **Animation & Icons** | Framer Motion & Lucide React |
| **Backend Framework** | Django 5.x & Django REST Framework (DRF) |
| **Database** | PostgreSQL 16 |
| **Asynchronous Queue** | Celery 5.4 & Redis 7 |
| **Payment Gateway** | Razorpay Payment Gateway API |
| **Authentication** | SimpleJWT (JSON Web Tokens) |
| **Containerization** | Docker & Docker Compose |

---

## Project Structure

```text
vehicle-wash-app/
├── backend/
│   ├── bookings/        # Booking creation, doorstep address, state management
│   ├── config/          # Django settings, Celery app, URL routing, CORS
│   ├── notifications/   # In-app notifications, HTML email templates, Celery tasks
│   ├── payments/        # Razorpay order creation, signature verification, webhooks
│   ├── services/        # Service packages and pricing models
│   ├── slots/           # Legacy slot models
│   ├── users/           # User authentication, OTP verification, profiles
│   ├── vehicles/        # Customer vehicle management
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/         # Next.js App Router pages (Public & Admin routes)
│   │   ├── components/  # Booking wizard, UI controls, intro animation, layouts
│   │   ├── context/     # BookingProvider context
│   │   ├── lib/         # Axios instance, Redux slices, API modules
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml
```

---

## Installation

### Prerequisites
- Python 3.12+
- Node.js 20+
- PostgreSQL 16+
- Redis (optional for local non-docker testing)

### Backend Setup (Manual)
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run migrations and start development server:
   ```bash
   python manage.py migrate
   python manage.py runserver
   ```

### Frontend Setup (Manual)
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

---

## Environment Variables

### Backend (`backend/.env`)

```env
SECRET_KEY=your-django-secret-key
DB_NAME=washdb
DB_USER=washuser
DB_PASSWORD=washpass
DB_HOST=db
DB_PORT=5432

CORS_ALLOWED_ORIGINS=http://localhost:3000

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-google-app-password

CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0

RAZORPAY_KEY_ID=rzp_test_xxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxx
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxx
```

---

## Running the Application

The recommended production and development method is using **Docker Compose**:

```bash
docker compose up --build
```

Once running, access:
- **Frontend Portal**: `http://localhost:3000`
- **Admin Dashboard**: `http://localhost:3000/admin`
- **Backend REST API**: `http://localhost:8000/api/`

---

## API Overview

| Module | Base Path | Purpose |
| :--- | :--- | :--- |
| **Auth & Users** | `/api/users/` | Registration, OTP verification, JWT login, profile |
| **Services** | `/api/services/` | Browse wash packages & prices |
| **Vehicles** | `/api/vehicles/` | Customer vehicle CRUD operations |
| **Bookings** | `/api/bookings/` | Create doorstep booking, price calculation, status tracking, cancel |
| **Admin Bookings**| `/api/admin/bookings/` | Dashboard metrics, status confirmation & completion |
| **Payments** | `/api/payments/` | Razorpay order creation, payment verification, cash settlement |
| **Notifications** | `/api/notifications/` | Customer in-app notifications, mark read, unread count |

---

## Customer Flow

```text
User Registration
       ↓
OTP Email Verification
       ↓
Select Vehicle & Service Package
       ↓
Select Preferred Date & Enter Service Address (or use GPS)
       ↓
Review Price Breakdown (Base + GST)
       ↓
Razorpay Online Checkout
       ↓
Payment Signature Verification
       ↓
Receive Order Confirmation Email
       ↓
Track Booking Status on Dashboard
```

---

## Admin Flow

```text
Admin Login (/admin)
       ↓
View Dashboard Metrics & Wash Requests
       ↓
Review Customer Address & Contact Phone Number
       ↓
Click [ Confirm ] to Approve Booking
       ↓
Technician Dispatched to Customer Address
       ↓
Click [ Complete ] Upon Service Completion
       ↓
Automated Customer Email & In-App Notification Sent
```

---

## Docker

The application includes multi-container orchestration configured in `docker-compose.yml`:

- `wash_db`: PostgreSQL 16 database.
- `wash_redis`: Redis 7 in-memory broker.
- `wash_backend`: Django REST Framework API server.
- `wash_celery_worker`: Celery task worker for background email dispatches.
- `wash_celery_beat`: Celery beat scheduler.
- `wash_frontend`: Next.js production web server.

---

## Security

- **JWT Authentication**: Short-lived access tokens with secure refresh token rotation.
- **Backend Payment Verification**: Cryptographic HMAC-SHA256 signature verification for all Razorpay transactions.
- **Idempotent Webhooks**: Payment event deduplication protecting against replay attacks.
- **IDOR Protection**: Endpoint authorization ensuring users can only access their own vehicles, bookings, and notifications.
- **Environment Isolation**: Secrets and API keys injected via environment variables.

---

## Future Improvements

- Live GPS tracking of washing van technician arrival.
- Customer rating and review submission post service completion.
- Automated SMS notifications via Twilio / Fast2SMS.

---

## Author

**The Black Wash Engineering Team**  
*Premium Vehicle Care & Mobile Detailing Services.*