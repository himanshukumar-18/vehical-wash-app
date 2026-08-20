# The Black Wash — Doorstep Car Wash Platform

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016-000000?style=flat&logo=nextdotjs)](https://nextjs.org/)
[![Django](https://img.shields.io/badge/Backend-Django%205%20%2B%20DRF-092E20?style=flat&logo=django)](https://www.djangoproject.com/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![Razorpay](https://img.shields.io/badge/Payment-Razorpay-02042B?style=flat&logo=razorpay)](https://razorpay.com/)
[![Cloudinary](https://img.shields.io/badge/Media-Cloudinary-3448C5?style=flat&logo=cloudinary)](https://cloudinary.com/)

**The Black Wash** is a full-stack doorstep car washing and detailing application designed for home-service car care in Hazaribagh, Jharkhand, India.

---

## Features

### Customer Features
- **Doorstep Car Wash Booking**: 6-step responsive booking flow (Vehicle Selection $\rightarrow$ Service Selection $\rightarrow$ Date $\rightarrow$ Doorstep Location Address $\rightarrow$ Order Review $\rightarrow$ Razorpay Payment).
- **Customer Authentication & Verification**: Email OTP verification, JWT access/refresh token authentication, profile management.
- **Vehicle Garage**: Register, manage, and toggle default customer vehicles (Hatchback, Sedan, SUV, Luxury).
- **My Bookings Dashboard**: Real-time status tracking for current and historical doorstep wash orders.
- **Public Customer Feedback**: Share wash reviews and ratings directly on the site.

### Admin / Owner Features
- **Admin Dashboard**: Real-time business revenue metrics, order counters, and customer growth analytics.
- **Order Notification Bell**: Topbar real-time order alert bell with Web Audio API chime sound, mute toggle, and order history clearing.
- **Service Management**: Fully dynamic CRUD for car wash services, pricing, durations, active/inactive toggles, and images.
- **Testimonial Moderation**: Moderation portal (`/admin/testimonials`) to review, approve (publish to site), or delete customer reviews.
- **Dynamic Image Management**: Cloudinary-integrated CMS (`/admin/images`) for replacing home hero, banner, about, and why-choose assets without developer intervention.
- **Payment Ledger**: Audit Razorpay payment orders, transaction signatures, payment statuses, and transaction history.

---

## Technical Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | Next.js 16 (App Router), TypeScript, Tailwind CSS, Framer Motion, Redux Toolkit |
| **Backend** | Python 3.14, Django 5.x, Django REST Framework, Celery |
| **Database** | PostgreSQL 16 |
| **Task Queue & Cache** | Redis 7, Celery Beat |
| **Payments** | Razorpay Payment Gateway (HMAC SHA256 verification) |
| **Media CDN** | Cloudinary API |
| **Containerization** | Docker, Docker Compose |

---

## Architecture Overview

```
                          ┌────────────────────────┐
                          │    Next.js Frontend    │
                          │   (React 19 / Redux)   │
                          └───────────┬────────────┘
                                      │ HTTP / REST (JWT)
                                      ▼
                          ┌────────────────────────┐
                          │     Django REST API    │
                          │ (Gunicorn / Celery)    │
                          └────┬──────┬──────┬─────┘
                               │      │      │
          ┌────────────────────┘      │      └────────────────────┐
          ▼                           ▼                           ▼
┌───────────────────┐       ┌───────────────────┐       ┌───────────────────┐
│ PostgreSQL DB 16  │       │  Razorpay Gateway │       │  Cloudinary CDN   │
│ (User, Booking)   │       │ (HMAC Signature)  │       │ (Dynamic Images)  │
└───────────────────┘       └───────────────────┘       └───────────────────┘
```

---

## Project Directory Structure

```
vehicle-wash-app/
├── backend/
│   ├── config/              # Django settings, URLs, Celery, Exceptions
│   ├── users/               # Custom User model, Auth, OTP, Profile
│   ├── services/            # Car Wash Services API
│   ├── vehicles/            # Customer Vehicles API
│   ├── bookings/            # Doorstep Wash Booking API & permissions
│   ├── payments/            # Razorpay Order & Signature Verification API
│   ├── notifications/       # Bell notifications & Email alerts
│   ├── imageupdation/       # Cloudinary Dynamic Image CMS
│   ├── testimonials/        # Customer feedback & Admin moderation
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── app/             # App Router pages ((public), admin, login, etc.)
│   │   ├── components/      # UI components (booking, admin, sections)
│   │   ├── lib/             # API clients, Redux store & slices
│   │   ├── context/         # Booking context provider
│   │   └── config/          # Site SEO config
│   └── package.json
├── docs/                    # Technical documentation suite
├── docker-compose.yml       # Production multi-container orchestration
└── .env.example             # Environment template
```

---

## Local Development Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+ or Docker

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create Superuser
python manage.py createsuperuser

# Start Django Server
python manage.py runserver 0.0.0.0:8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install

# Start Next.js Development Server
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## Docker Production Deployment

To launch the complete application stack in production containers:

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Start all services
docker compose up -d --build

# 3. Check running containers
docker compose ps
```

The stack runs:
- `wash_frontend` at `http://localhost:3000`
- `wash_backend` at `http://localhost:8000`
- `wash_db` (PostgreSQL 16)
- `wash_redis` (Redis)
- `wash_celery_worker`

---

## Verification & Testing Commands

### Backend Automated Test Suite
```bash
cd backend
USE_SQLITE=True ./venv/bin/python manage.py test
```

### Django System Check
```bash
cd backend
./venv/bin/python manage.py check
```

### Frontend TypeScript Verification
```bash
cd frontend
npx tsc --noEmit
```

### Frontend Production Build Test
```bash
cd frontend
npm run build
```

---

## Documentation Suite

Detailed technical guides are available in the [`docs/`](file:///Users/himanshukumar/Developer/django-projects/vehicle-wash-app/docs) directory:

- [ARCHITECTURE.md](file:///Users/himanshukumar/Developer/django-projects/vehicle-wash-app/docs/ARCHITECTURE.md): Full system architecture & exception handling specifications.
- [API.md](file:///Users/himanshukumar/Developer/django-projects/vehicle-wash-app/docs/API.md): Comprehensive REST API endpoint contract.
- [DEPLOYMENT.md](file:///Users/himanshukumar/Developer/django-projects/vehicle-wash-app/docs/DEPLOYMENT.md): Production Docker Compose & server setup.
- [SECURITY.md](file:///Users/himanshukumar/Developer/django-projects/vehicle-wash-app/docs/SECURITY.md): RBAC matrix, JWT lifecycle, & payment security.
- [PAYMENT.md](file:///Users/himanshukumar/Developer/django-projects/vehicle-wash-app/docs/PAYMENT.md): Razorpay order creation, signature verification, & financial integrity.
- [TESTING.md](file:///Users/himanshukumar/Developer/django-projects/vehicle-wash-app/docs/TESTING.md): Testing strategy and E2E validation scenarios.

---

## License

Copyright © 2026 **The Black Wash**. All rights reserved.