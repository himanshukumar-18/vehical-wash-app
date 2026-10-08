# The Black Wash — Mobile App

> **Doorstep car detailing service** for Hazaribagh, Jharkhand.  
> Built with **React Native / Expo (Expo Router)** + **Django REST Framework** backend.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Prerequisites](#3-prerequisites)
4. [Clone & Install](#4-clone--install)
5. [Environment Setup](#5-environment-setup)
6. [Running the App](#6-running-the-app)
7. [Authentication Features](#7-authentication-features)
8. [Google Sign-In Setup](#8-google-sign-in-setup)
9. [Project Structure](#9-project-structure)
10. [API Layer](#10-api-layer)
11. [Production Build (EAS)](#11-production-build-eas)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Project Overview

The Black Wash is a doorstep vehicle detailing app. Customers can:

- Register / log in (Email+Password, Phone OTP, or Google Sign-In)
- Manage their vehicles
- Browse services
- Book a wash via WhatsApp (no in-app booking backend)
- View and update their profile

---

## 2. Architecture

```
React Native / Expo (this repo)
        ↓  HTTPS
Production API: https://api.theblackwash.com
        ↓
VPS Nginx → 127.0.0.1:8011
        ↓
Docker container (Django + Gunicorn, port 8000)
        ↓
PostgreSQL
```

**Local development — Android Emulator:**
```
Expo Dev Client → http://10.0.2.2:8011/api/
```

**Local development — iOS Simulator / Web:**
```
Expo Dev Client → http://localhost:8011/api/
```

---

## 3. Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | ≥ 18 LTS | `node -v` |
| npm | ≥ 9 | bundled with Node |
| Expo CLI | ≥ 0.18 | `npx expo` works without global install |
| Android Studio | Latest | Android emulator / SDK |
| Xcode | ≥ 15 | iOS simulator (macOS only) |
| EAS CLI | Latest | `npm i -g eas-cli` — only needed for production builds |

---

## 4. Clone & Install

```bash
git clone <repo-url>
cd theblackwash/mobile

npm install
```

---

## 5. Environment Setup

```bash
cp .env.example .env
```

Open `.env` and configure for your environment:

```env
# Android Emulator (default for local dev)
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8011/api/

# iOS Simulator / Web — uncomment if needed
# EXPO_PUBLIC_API_BASE_URL=http://localhost:8011/api/

# Physical device on same LAN — replace X with your machine IP
# EXPO_PUBLIC_API_BASE_URL=http://192.168.1.X:8011/api/

# Production
# EXPO_PUBLIC_API_BASE_URL=https://api.theblackwash.com/api/

EXPO_PUBLIC_APP_ENV=development

EXPO_PUBLIC_CALL_NUMBER=+916201030273
EXPO_PUBLIC_WHATSAPP_NUMBER=+916201030273
EXPO_PUBLIC_LEGAL_SITE_URL=https://theblackwash.vercel.app

# Google OAuth Web Client ID (see Section 8)
EXPO_PUBLIC_GOOGLE_CLIENT_ID=347851166673-o863kj6gje7hde5rq8fgqe8i145eiv12.apps.googleusercontent.com

# Dev-only: skip auth and preview home screen directly (MUST be false in production)
EXPO_PUBLIC_DEV_HOME_PREVIEW=false
```

> **Never commit `.env` to version control.** It is already in `.gitignore`.

---

## 6. Running the App

### Start the Expo dev server

```bash
npm start
```

Press in the terminal:
- `a` — open Android emulator
- `i` — open iOS simulator
- `w` — open in browser

### Run directly on a platform

```bash
npm run android   # build and launch on Android emulator / device
npm run ios       # build and launch on iOS simulator (macOS only)
npm run web       # launch in browser
```

### Lint

```bash
npm run lint
```

### Expo Doctor (dependency health check)

```bash
npm run doctor
```

---

## 7. Authentication Features

The app supports three authentication methods:

### Email + Password
1. Register with email, full name, password (and optional phone)
2. An OTP is sent to your email — verify it on the OTP screen
3. Log in with email + password

### Phone OTP
1. Enter Indian mobile number (+91 XXXXXXXXXX)
2. Receive a 6-digit OTP
3. Verify OTP to log in (creates a new account automatically if first time)

### Google Sign-In
1. Tap **Continue with Google**
2. Browser-based OAuth 2.0 flow opens via `expo-auth-session`
3. Google ID token is verified server-side by Django
4. Existing account is linked; new account is auto-created if first time

---

## 8. Google Sign-In Setup

### Step 1 — Google Cloud Console

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create or select your project
3. Navigate to **APIs & Services → Credentials**

### Step 2 — Create a Web Application OAuth 2.0 Client ID

| Field | Value |
|-------|-------|
| Application type | Web application |
| Authorized redirect URIs | `https://auth.expo.io/@<your-expo-username>/theblackwash` |

> For production standalone builds, also add: `theblackwash://auth/callback`

### Step 3 — Set the Client ID in both .env files

**Mobile** (`mobile/.env`):
```env
EXPO_PUBLIC_GOOGLE_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
```

**Backend** (`backend/.env`):
```env
GOOGLE_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
```

Both must use the same Web Client ID.

### Step 4 — Verify app scheme

`app.json` must have `scheme: "theblackwash"` (already set):

```json
{
  "expo": {
    "scheme": "theblackwash"
  }
}
```

### Step 5 — Enable APIs in Google Cloud Console

Go to **APIs & Services → Library** and enable:
- **Google People API**

---

## 9. Project Structure

```
mobile/
├── src/
│   ├── app/                        # Expo Router file-based navigation
│   │   ├── (auth)/                 # Unauthenticated screens
│   │   │   ├── login.jsx           # Login: Phone OTP / Email+Password / Google
│   │   │   ├── register.jsx        # Registration form
│   │   │   ├── otp-verify.jsx      # OTP verification (email & phone)
│   │   │   ├── auth-success.jsx    # Post-login success screen
│   │   │   └── splash.jsx          # Splash / onboarding
│   │   ├── (tabs)/                 # Authenticated tab screens
│   │   │   ├── index.jsx           # Home
│   │   │   └── me.jsx              # Profile
│   │   ├── booking.jsx             # WhatsApp booking flow
│   │   └── _layout.jsx             # Root layout with auth guard
│   │
│   ├── features/                   # Feature-based domain modules
│   │   ├── auth/
│   │   │   ├── authApi.js          # RTK Query auth endpoints
│   │   │   ├── authSlice.js        # Redux auth state
│   │   │   ├── hooks/
│   │   │   │   ├── useLogin.js
│   │   │   │   ├── useRegister.js
│   │   │   │   ├── useGoogleAuth.js
│   │   │   │   ├── usePhoneAuth.js
│   │   │   │   ├── useResendOtp.js
│   │   │   │   └── useSessionRestore.js
│   │   │   ├── components/
│   │   │   │   └── GoogleSignInButton.jsx
│   │   │   ├── utils/
│   │   │   │   └── authErrors.js   # Backend error code → user message mapping
│   │   │   └── validation/         # Zod schemas (loginSchema, registerSchema, etc.)
│   │   ├── vehicles/
│   │   ├── bookings/
│   │   ├── services/
│   │   └── profile/
│   │
│   ├── store/
│   │   ├── api/baseApi.js          # RTK Query base with JWT refresh interceptor
│   │   └── index.js                # Redux store
│   │
│   ├── services/
│   │   └── storage/
│   │       └── secureStorage.js    # expo-secure-store token management
│   │
│   ├── constants/
│   │   ├── api.js                  # API_BASE_URL + ENDPOINTS map
│   │   └── layout.js               # Screen dimensions, platform flags
│   │
│   ├── components/
│   │   └── ui/                     # AppButton, AppInput, AppText, AppCard, etc.
│   │
│   ├── hooks/                      # useAppDispatch, useAppSelector
│   ├── theme/                      # Colors, Spacing, Typography, Radius, Shadows
│   └── utils/                      # formatPrice, getApiErrorMessage, getInitials
│
├── .env                            # Local environment variables (gitignored)
├── .env.example                    # Template — safe to commit
├── app.json                        # Expo config (scheme, splash, icons, permissions)
├── eas.json                        # EAS Build profiles (development/preview/production)
├── babel.config.js
├── package.json
└── README.md
```

---

## 10. API Layer

### Base URL

Resolved from `EXPO_PUBLIC_API_BASE_URL` at runtime in [`src/constants/api.js`](src/constants/api.js).

### Auth Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|:---:|-------------|
| `POST` | `/api/auth/register/` | ✗ | Register with email + password |
| `POST` | `/api/auth/verify-otp/` | ✗ | Verify email OTP after registration |
| `POST` | `/api/auth/resend-otp/` | ✗ | Resend OTP (60 s cooldown client-side) |
| `POST` | `/api/auth/login/` | ✗ | Login with email + password |
| `POST` | `/api/auth/phone/send-otp/` | ✗ | Send OTP to phone number |
| `POST` | `/api/auth/phone/verify-otp/` | ✗ | Verify phone OTP and receive tokens |
| `POST` | `/api/auth/google/` | ✗ | Google Sign-In (id_token exchange) |
| `POST` | `/api/auth/refresh/` | ✗ | Refresh JWT access token |
| `POST` | `/api/auth/logout/` | ✓ | Logout (invalidates refresh token) |
| `GET` | `/api/auth/me/` | ✓ | Get current user profile |
| `PATCH` | `/api/auth/me/` | ✓ | Update profile (fullname, phone) |

### Vehicle Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/vehicles/` | Add a vehicle |
| `GET` | `/api/vehicles/` | List user's vehicles |
| `PATCH` | `/api/vehicles/<id>/` | Update a vehicle |
| `DELETE` | `/api/vehicles/<id>/` | Delete a vehicle |

### Health Check

```
GET /api/health/  →  { "status": "ok" }
```

No authentication required. Use this to verify the backend is reachable.

### Token Storage

JWT tokens are stored in **`expo-secure-store`** (hardware-backed keychain / keystore).  
They are **never** stored in Redux state, AsyncStorage, or `.env`.

| SecureStore Key | Value |
|-----------------|-------|
| `tbw_access_token` | Short-lived JWT (1 hour) |
| `tbw_refresh_token` | Long-lived JWT (7 days) |

The `baseApi.js` Axios interceptor automatically refreshes the access token using the refresh token when a `401` is received.

---

## 11. Production Build (EAS)

### One-time setup

```bash
npm install -g eas-cli
eas login
eas build:configure   # only needed once per project
```

### Android APK (for testing)

```bash
eas build --platform android --profile preview
```

### Android AAB (for Play Store)

```bash
eas build --platform android --profile production
```

### iOS (for App Store)

```bash
eas build --platform ios --profile production
```

### Submit to stores

```bash
eas submit --platform android
eas submit --platform ios
```

> **Before production build:** make sure `EXPO_PUBLIC_API_BASE_URL=https://api.theblackwash.com/api/` and `EXPO_PUBLIC_APP_ENV=production` are set — either in EAS secrets or in the `env` block inside `eas.json`.

---

## 12. Troubleshooting

### Backend not receiving requests

1. Check `EXPO_PUBLIC_API_BASE_URL` matches your environment
2. Android emulator must use `http://10.0.2.2:8011/api/` (not `localhost`)
3. iOS simulator / Web must use `http://localhost:8011/api/`
4. Verify backend is running: `docker compose ps` in the `backend/` directory
5. Test health: `curl http://localhost:8011/api/health/`

### OTP email not arriving in Gmail

- Check your **spam / junk** folder first
- Confirm `backend/.env` has: `EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend`
- Verify the Gmail App Password has no spaces (16 chars): `EMAIL_HOST_PASSWORD=xxxxxxxxxxxxxxxx`
- Check backend logs: `docker compose logs backend | grep -i email`

### Google Sign-In fails silently

- Ensure `EXPO_PUBLIC_GOOGLE_CLIENT_ID` is set in `mobile/.env`
- Ensure the same ID is in `backend/.env` as `GOOGLE_CLIENT_ID`
- Verify the redirect URI is registered in Google Cloud Console
- On a physical device ensure `scheme: "theblackwash"` is in `app.json`

### Metro bundler cache issues

```bash
npx expo start --clear
```

### Dependency conflicts

```bash
npm run doctor
```

---

## Environment Quick Reference

| Variable | Android Emulator | iOS Simulator / Web | Production |
|----------|:---:|:---:|:---:|
| `EXPO_PUBLIC_API_BASE_URL` | `http://10.0.2.2:8011/api/` | `http://localhost:8011/api/` | `https://api.theblackwash.com/api/` |
| `EXPO_PUBLIC_APP_ENV` | `development` | `development` | `production` |
| `EXPO_PUBLIC_DEV_HOME_PREVIEW` | `false` | `false` | `false` |

---

*The Black Wash — Hazaribagh, Jharkhand*  
*React Native / Expo · Django REST Framework · PostgreSQL · Docker*
