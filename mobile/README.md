# THE BLACK WASH — Mobile App

> **Tagline:** *"Your Car. Our Care."*  
> Premium doorstep car washing, detailing, and vehicle care mobile application for customers in Hazaribagh, Jharkhand, India.

---

## 📱 Overview

**The Black Wash** mobile app is a high-performance, dark-themed customer application built with **React Native** and **Expo**. It connects vehicle owners in Hazaribagh directly with professional doorstep car washing services via structured WhatsApp communication and secure backend session management.

---

## 🚀 Features

### 🔐 Authentication & Session
- **Registration**: Full name, email, password validation with client-side Zod schemas. Clickable Terms of Service & Privacy Policy links.
- **OTP Verification**: 6-digit numeric email verification matching backend security constraints.
- **Login**: SimpleJWT access (1 hr) & refresh token (7 days) handling with automatic background token rotation.
- **Secure Token Storage**: Tokens stored exclusively in hardware-backed `Expo SecureStore` (never in AsyncStorage, Redux, or .env).
- **Session Restoration**: Seamless startup token validation (`useSessionRestore`) with automatic silent refresh on 401.
- **Logout**: Complete token clearance, session destruction, and cache reset.

### 🏠 Home Experience
- **Dynamic Header & Avatar**: Displays real user initials (e.g., `Himanshu Kumar` → `HK`, `Rahul Sharma` → `RS`) with fallback and unauthenticated dev preview support.
- **Live Search**: Client-side filtering of wash packages and descriptions.
- **Wash Packages**: Dynamic services feed from backend (`/api/services/`) with pricing, duration, and fallback support.
- **Hero Carousel**: Interactive promotional banner carousel showcasing premium car care services.
- **Before → After Transformation**: Interactive visual comparisons demonstrating detailing quality.
- **Premium Trust Strip**: Verified doorstep highlights, professional technicians, and satisfaction guarantees.
- **Photo Gallery**: Showcase of premium car cleaning results.
- **Direct Support Call**: 1-tap phone hotline dialer for immediate customer assistance.

### 🧼 Booking Flow (WhatsApp Handoff)
- **Multi-Step Booking**:
  1. Select Vehicle from user's registered garage.
  2. Select Wash Package.
  3. Select Preferred Date (next 7 rolling days).
  4. Enter Doorstep Address in Hazaribagh.
  5. Optional Google Maps location link & special instructions.
- **Order Breakdown**: Real-time pricing summary with free doorstep travel calculation.
- **WhatsApp Integration**: Generates structured, readable WhatsApp message with unique reference ID (`TBW-YYYYMMDD-HHMM`) and opens WhatsApp directly to dispatch to the business owner.
- **No Online Payments**: Zero payment friction in-app. Payment is made directly upon service completion (Cash/UPI).

### 🚗 My Garage
- **Vehicle Registration**: Add cars by brand, model, vehicle type (Hatchback, Sedan, SUV, Luxury), color, and registration number.
- **Garage Management**: Set default vehicle for 1-tap checkout, view registered cars, or delete vehicles.
- **Authenticated CRUD**: Backed by protected `/api/vehicles/` Django endpoints with user ownership isolation.

### 👤 Profile / Account Hub (`Me` Tab)
- **User Identity**: Real authenticated profile data, email, verified member badge.
- **Live Statistics**: Real counts for Total Bookings, Completed Services, and Garage Vehicles.
- **Doorstep Service Hub**: Operating hours (8 AM – 7 PM), location information.
- **Legal & Policies**: 1-tap browser navigation to Privacy Policy, Terms of Service, Account Deletion, and Support.
- **Edit Profile**: Modal to update customer name and profile details.
- **Sign Out**: Secure session destruction with confirmation alert.

### 📜 Legal & Compliance (Play Store Ready)
- **Centralized Legal URLs** (`src/constants/legal.js`):
  - Privacy Policy: `https://theblackwash.vercel.app/privacy-policy`
  - Terms of Service: `https://theblackwash.vercel.app/terms`
  - Account & Data Deletion: `https://theblackwash.vercel.app/account-deletion`
  - Contact & Support: `https://theblackwash.vercel.app/contact`

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Expo SDK 57 / React Native 0.86.3 |
| **Language** | JavaScript (ES6+ / JSX) — *100% JavaScript* |
| **Routing** | Expo Router 57 (File-based navigation) |
| **State Management** | Redux Toolkit 2.8 + RTK Query |
| **Secure Storage** | Expo SecureStore (`expo-secure-store`) |
| **Animations** | React Native Reanimated 4 & Worklets |
| **Forms & Validation** | React Hook Form + Zod |
| **Icons & UI** | Lucide React Native, React Native SVG |
| **Backend API** | Django 5.x + Django REST Framework + SimpleJWT |
| **Database** | PostgreSQL 16 |
| **Legal Website** | React 18 + Vite 6 + React Router 6 (Vercel SPA) |

---

## 🏗️ Architecture

```
Mobile Customer App (React Native / Expo)
       │
       ├─► Hardware SecureStore (JWT Tokens)
       │
       ├─► RTK Query / BaseApi (Auto-refresh on 401)
       │         │
       │         ▼ (HTTPS / REST)
       │   Django REST API Backend (PostgreSQL)
       │         ├── /api/auth/ (register, verify-otp, login, logout, refresh, profile)
       │         ├── /api/vehicles/ (user vehicles CRUD)
       │         ├── /api/services/ (public active wash packages)
       │         └── /api/bookings/ (customer booking records)
       │
       └─► Booking Dispatch Handoff
                 │
                 ▼
          WhatsApp Messenger
          (Direct communication & slot confirmation with business owner)
```

> **Important Note on Data Flow:** WhatsApp is used as the customer communication and dispatch channel. The Django backend remains the source of truth for user accounts, profile data, and vehicle garage records.

---

## 📁 Directory Structure

```
mobile/
├── src/
│   ├── app/                         # Expo Router screens
│   │   ├── (auth)/                  # Auth group
│   │   │   ├── login.jsx            # Sign In
│   │   │   ├── register.jsx         # Create Account + Legal Links
│   │   │   ├── otp-verify.jsx       # 6-digit OTP verification
│   │   │   ├── splash.jsx           # Startup loader & session check
│   │   │   └── auth-success.jsx     # Welcome animation transition
│   │   ├── (tabs)/                  # Main tabs
│   │   │   ├── _layout.jsx          # Tab navigation (Home · Me)
│   │   │   ├── index.jsx            # Home dashboard (Services, Carousel, Trust Strip)
│   │   │   └── me.jsx               # Account Hub, Garage, Legal Links, Logout
│   │   ├── booking.jsx              # 5-step doorstep booking flow & WhatsApp dispatch
│   │   ├── index.jsx                # Entry redirect
│   │   └── _layout.jsx              # Root Layout (Redux, GestureHandler, SafeAreaProvider)
│   │
│   ├── components/                  # Reusable UI components
│   │   ├── ui/                      # AppText, AppButton, AppCard, AppInput, AppDivider, AppModal
│   │   ├── layout/                  # AppScreen
│   │   └── feedback/                # AppLoader, AppErrorState, AppEmptyState
│   │
│   ├── features/                    # Modular feature logic
│   │   ├── auth/                    # authSlice, authApi, useLogin, useRegister, useOtpVerify, useSessionRestore
│   │   ├── services/                # servicesApi (getServices)
│   │   ├── vehicles/                # vehiclesApi (CRUD) + AddVehicleModal
│   │   ├── bookings/                # bookingsApi (getBookings, createBooking)
│   │   ├── home/                    # Carousel, Before/After, Trust Strip, Gallery
│   │   └── profile/                 # EditProfileModal
│   │
│   ├── constants/                   # Configuration constants
│   │   ├── api.js                   # API_BASE_URL, API_ENV
│   │   ├── contact.js               # Business phone, WhatsApp, message formatting
│   │   ├── legal.js                 # Centralized legal & privacy URLs
│   │   ├── services.js              # Fallback services
│   │   └── devPreview.js            # Safe development-only preview flag
│   │
│   ├── store/                       # Redux store & RTK Query baseApi with JWT reauth
│   ├── services/storage/            # SecureStore token manager
│   ├── theme/                       # Colors, Typography, Spacing, Radius, Shadows
│   └── utils/                       # getUserInitials, formatPrice, error parsers
│
├── the-black-wash-legal/            # Standalone Vite + React legal website for Vercel
├── app.json                         # Expo configuration (Package name, icon, splash)
└── package.json
```

---

## ⚡ Getting Started

### 1. Prerequisites
- **Node.js** v18+ (Node 20+ recommended)
- **Expo CLI** (`npx expo`)
- **Django Backend** running locally or on a remote staging server

### 2. Installation
```bash
cd mobile
npm install
```

### 3. Environment Variables
Create a `.env` file from the template:
```bash
cp .env.example .env
```

Configure your `.env`:
```env
# Backend API base URL
# iOS Simulator: http://localhost:8000/api/
# Android Emulator: http://10.0.2.2:8000/api/
# Production / Staging: https://your-backend-domain.com/api/
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000/api/

EXPO_PUBLIC_APP_ENV=development

# Business Phone & WhatsApp (international format: +91XXXXXXXXXX)
EXPO_PUBLIC_CALL_NUMBER=+91XXXXXXXXXX
EXPO_PUBLIC_WHATSAPP_NUMBER=+91XXXXXXXXXX

# Production Legal & Privacy Site
EXPO_PUBLIC_LEGAL_SITE_URL=https://theblackwash.vercel.app

# Dev UI Preview Flag (strictly disabled in production builds)
EXPO_PUBLIC_DEV_HOME_PREVIEW=false
```

### 4. Start Development Server
```bash
# Start Expo Metro Bundler
npx expo start

# Run on iOS Simulator (Mac only)
npx expo start --ios

# Run on Android Emulator
npx expo start --android
```

---

## 🧪 Testing & Verification

```bash
# 1. Run ESLint across entire mobile source
npx eslint src

# 2. Run Django backend system check
cd ../backend && python manage.py check

# 3. Run Django automated test suite
cd ../backend && python manage.py test tests

# 4. Build & verify legal website
cd ../mobile/the-black-wash-legal && npm run build
```

---

## 📋 Production Readiness Checklist

- [x] **Zero Hardcoded Secrets**: All keys, numbers, and tokens read from SecureStore or environment variables.
- [x] **JavaScript Only**: 100% clean JavaScript source code.
- [x] **Lint Verification**: `npx eslint src` passes with 0 errors and 0 warnings.
- [x] **Backend Checks**: `python manage.py check` passes with 0 issues.
- [x] **Backend Tests**: 25/25 automated tests passing (`test_auth`, `test_bookings`, `test_security`, `test_notifications`).
- [x] **Secure JWT Lifecycle**: Automatic token refresh on 401 with rotation support; safe logout cleanup.
- [x] **Safe Legal Links**: Centralized in `src/constants/legal.js` on Register and Profile screens.
- [x] **Standalone Legal Website**: Production build passing (`the-black-wash-legal/` ready for Vercel).
- [x] **No Localhost in Prod**: Environment-driven API endpoints.
- [ ] **EAS Production Build**: Run `eas build --platform android` for Play Store release.
- [ ] **Play Store Listing**: Submit Privacy Policy URL (`https://theblackwash.vercel.app/privacy-policy`) to Google Play Console.

---

## 📄 License

Copyright © 2026 **The Black Wash**. All rights reserved.
