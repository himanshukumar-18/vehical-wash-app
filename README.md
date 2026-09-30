# The Black Wash — Doorstep Car Care Platform

[![Expo](https://img.shields.io/badge/Mobile-Expo%20SDK%2057%20%2F%20React%20Native-000000?style=flat&logo=expo)](https://expo.dev/)
[![Django](https://img.shields.io/badge/Backend-Django%205%20%2B%20DRF-092E20?style=flat&logo=django)](https://www.djangoproject.com/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%2016-4169E1?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![Vite](https://img.shields.io/badge/Legal%20Site-React%20%2B%20Vite%206-646CFF?style=flat&logo=vite)](https://vitejs.dev/)

**The Black Wash** is a comprehensive doorstep car washing, detailing, and vehicle care platform serving customers in Hazaribagh, Jharkhand, India.

> **Tagline:** *"Your Car. Our Care."*

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  THE BLACK WASH ECOSYSTEM               │
└─────────────────────────────────────────────────────────┘

 1. CUSTOMER MOBILE APP (React Native / Expo 57)
    ├── Auth (Register, 6-digit OTP, SimpleJWT, SecureStore)
    ├── Dynamic Initials Avatar & Home Dashboard
    ├── Active Wash Packages & Search
    ├── Multi-step Doorstep Booking Flow
    ├── WhatsApp Dispatch & Owner Communication Handoff
    ├── Vehicle Garage (CRUD, Default Vehicle Toggle)
    ├── Account Hub (Profile, Statistics, Legal Links)
    └── Centralized Legal Opener

 2. DJANGO REST FRAMEWORK BACKEND (Python / DRF)
    ├── Custom User Model & Email OTP Services
    ├── SimpleJWT Token Lifecycle with Rotation
    ├── Vehicles API with User Ownership Permissions
    ├── Services API (Active Wash Packages)
    ├── Bookings API (Customer Records)
    └── Security Headers, CORS, Rate Limiting & Throttling

 3. STANDALONE LEGAL & PRIVACY WEBSITE (React + Vite + Vercel)
    ├── Google Play Store Privacy Policy URL (/privacy-policy)
    ├── Terms of Service (/terms)
    ├── Account & Data Deletion Guide (/account-deletion)
    └── Customer Support Info (/contact)
```

---

## 📂 Repository Structure

```
vehicle-wash-app/
├── mobile/                          # Customer React Native / Expo application
│   ├── src/                         # JavaScript source (routes, features, store)
│   ├── the-black-wash-legal/        # Standalone legal website for Vercel deployment
│   ├── app.json                     # Expo mobile app configuration
│   ├── package.json
│   └── README.md
│
├── backend/                         # Django REST Framework backend
│   ├── config/                      # Settings, URLs, exceptions
│   ├── users/                       # User model, SimpleJWT auth, OTP
│   ├── vehicles/                    # Customer vehicle garage API
│   ├── services/                    # Active wash packages API
│   ├── bookings/                    # Booking management API
│   ├── tests/                       # Backend test suite (25 passing tests)
│   ├── requirements.txt
│   └── manage.py
│
└── README.md                        # Root ecosystem documentation
```

---

## 🚀 Quick Start Guide

### 1. Backend Setup (Django)

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Run system checks & automated tests
python manage.py check
python manage.py test tests

# Start Django Development Server
python manage.py runserver 0.0.0.0:8000
```

### 2. Customer Mobile App Setup (Expo / React Native)

```bash
cd mobile
npm install

# Setup environment variables
cp .env.example .env

# Run linting
npx eslint src

# Start Expo Metro Bundler
npx expo start
```

### 3. Legal Website Build (Vercel)

```bash
cd mobile/the-black-wash-legal
npm install
npm run build
```

---

## 🔒 Security & Privacy

- **JWT Authentication**: Short-lived access tokens (1 hour) + refresh tokens (7 days) with rotation.
- **Hardware-backed Storage**: Tokens stored exclusively in `expo-secure-store`.
- **Zero Hardcoded Secrets**: All backend secrets and mobile credentials injected via environment variables.
- **Object-Level Permissions**: Strict queryset filtering on backend views (`request.user`) preventing IDOR across customer vehicles and profiles.
- **Play Store Ready**: Publicly accessible, responsive HTTPS Privacy Policy with clear disclosures.

---

## 📄 License

Copyright © 2026 **The Black Wash**. All rights reserved.