# The Black Wash — Mobile App

> Premium doorstep car wash service — React Native mobile application for customers.

**Business:** The Black Wash, Hazaribagh, Jharkhand, India  
**Status:** Phase 1 — Foundation (Complete)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Expo SDK 57 / React Native 0.86.3 |
| Language | JavaScript (JSX) |
| Navigation | Expo Router 57 |
| State Management | Redux Toolkit + RTK Query |
| Secure Storage | Expo SecureStore |
| Animations | React Native Reanimated 4 |
| Gestures | React Native Gesture Handler |
| Icons | Lucide React Native |
| Forms | React Hook Form + Zod |
| Architecture | New Architecture (Fabric + TurboModules) |

---

## Project Structure

```
mobile/
├── src/
│   ├── app/                    # Expo Router routes (screens)
│   │   ├── _layout.jsx         # Root layout (Redux, GestureHandler, SafeArea)
│   │   ├── index.jsx           # Entry redirect
│   │   ├── (auth)/             # Auth group (welcome, login, register, otp)
│   │   │   ├── _layout.jsx
│   │   │   └── welcome.jsx     # Phase 1 placeholder
│   │   └── (tabs)/             # Main tab screens
│   │       ├── _layout.jsx     # Tab navigator (Home · Bookings · Me)
│   │       ├── index.jsx       # Foundation Preview (Phase 1)
│   │       ├── bookings.jsx    # Placeholder
│   │       └── me.jsx          # Placeholder
│   │
│   ├── components/             # Reusable UI
│   │   ├── ui/                 # AppText, AppButton, AppCard, AppInput, AppDivider, AppIconButton
│   │   ├── layout/             # AppScreen
│   │   └── feedback/           # AppLoader, AppErrorState, AppEmptyState
│   │
│   ├── features/               # Feature-level logic
│   │   ├── auth/               # authSlice.js + authApi.js (JWT login, register, OTP)
│   │   ├── services/           # servicesApi.js
│   │   ├── bookings/           # bookingsApi.js
│   │   └── profile/            # profileApi.js (vehicles)
│   │
│   ├── store/                  # Redux store
│   │   ├── index.js            # Store configuration
│   │   └── api/baseApi.js      # RTK Query base API with JWT header injection
│   │
│   ├── services/
│   │   └── storage/            # secureStorage.js — JWT token storage
│   │
│   ├── hooks/                  # useAppDispatch, useAppSelector
│   ├── constants/              # api.js (endpoints), layout.js (dimensions)
│   ├── utils/                  # formatPrice, getApiErrorMessage, getInitials
│   └── theme/                  # Design system tokens
│       ├── colors.js           # Brand palette
│       ├── spacing.js          # 4pt spacing scale
│       ├── typography.js       # Font sizes, weights, text variants
│       ├── radius.js           # Border radius tokens
│       ├── shadows.js          # iOS + Android shadow system
│       └── index.js            # Single import point
│
├── assets/
│   └── images/                 # App icons, splash screen (place logo here)
│
├── app.json                    # Expo config (name: "The Black Wash")
├── babel.config.js             # Expo preset + Reanimated plugin
├── eslint.config.js            # ESLint flat config
├── tsconfig.json               # Path aliases (@/* → src/*)
├── .env.example                # Environment variable template
└── package.json
```

---

## Setup & Run

### 1. Prerequisites

- **Node.js** v18+ (v24 recommended)
- **Xcode** (for iOS Simulator) — install from Mac App Store
- **Android Studio** (for Android Emulator) — with Android SDK configured

### 2. Install dependencies

```bash
cd mobile
npm install
```

### 3. Environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
# iOS Simulator (Mac localhost)
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000/api/

# Android Emulator (host machine)
# EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8000/api/

EXPO_PUBLIC_APP_ENV=development
```

### 4. Start the development server

```bash
npm start
# or
npx expo start
```

---

## Launching Simulators

### iOS Simulator

```bash
# Option 1 — from running dev server, press 'i'
npm start  # then press i

# Option 2 — direct launch
npm run ios
# or
npx expo start --ios
```

**Requirements:**
- Xcode installed and opened at least once
- iOS Simulator app launched via Xcode → Open Simulator

### Android Emulator

```bash
# Option 1 — from running dev server, press 'a'
npm start  # then press a

# Option 2 — direct launch
npm run android
# or
npx expo start --android
```

**Requirements:**
- Android Studio installed
- At least one AVD (Android Virtual Device) created in Android Studio
- Emulator running before pressing 'a'

> **Note:** On Android Emulator, change `EXPO_PUBLIC_API_BASE_URL` to `http://10.0.2.2:8000/api/` to reach localhost on your Mac.

---

## Development Commands

```bash
npm start           # Start Expo dev server
npm run ios         # Start + launch iOS Simulator
npm run android     # Start + launch Android Emulator
npm run lint        # Run ESLint (npx expo lint)
npm run doctor      # Run expo-doctor health check
```

---

## Brand Design System

Located in `src/theme/`. Import from `@/theme`.

```js
import { Colors, Spacing, Radius, Shadows, TextVariants } from '@/theme';
```

**Brand Colors:**

| Token | Value | Usage |
|---|---|---|
| `Colors.primaryBlack` | `#080B10` | Dark backgrounds, splash |
| `Colors.deepNavy` | `#101923` | Card backgrounds (dark mode) |
| `Colors.cyanBlue` | `#00CFFF` | Primary CTA, accent |
| `Colors.electricBlue` | `#168BFF` | Secondary CTA |
| `Colors.background` | `#F5F7FA` | Light screen background |
| `Colors.textPrimary` | `#111827` | Primary body text |
| `Colors.textSecondary` | `#7B8492` | Subtext, captions |

---

## Authentication Architecture

- **JWT tokens are stored exclusively in Expo SecureStore** (`src/services/storage/secureStorage.js`)
- Tokens are **never** stored in Redux state, AsyncStorage, or environment variables
- Access token: 1 hour lifetime
- Refresh token: 7 days lifetime
- Token rotation: enabled on backend (SimpleJWT)

**Auth flow (Phase 2):**
1. App starts → check SecureStore for existing access token
2. If token exists → validate via `GET /api/auth/profile/`
3. If valid → dispatch `setCredentials` → redirect to `/(tabs)`
4. If expired → use refresh token → dispatch `setCredentials`
5. If no token → redirect to `/(auth)/welcome`

---

## Backend API

See [`docs/API.md`](../docs/API.md) for the full endpoint reference.

**Base URL:**
- Development: `http://localhost:8000/api/`
- Production: `https://api.theblackwash.com/api/`

**Standard response format:**
```json
{
  "success": true,
  "message": "Operation completed.",
  "data": {}
}
```

---

## Phase Roadmap

| Phase | Status | Description |
|---|---|---|
| **Phase 1** | ✅ Complete | Foundation — theme, components, navigation, Redux |
| **Phase 2** | ⏳ Next | Authentication screens (welcome, login, register, OTP) |
| **Phase 3** | ⏳ Planned | Home screen with services listing |
| **Phase 4** | ⏳ Planned | Booking flow |
| **Phase 5** | ⏳ Planned | Payment integration (Razorpay) |
| **Phase 6** | ⏳ Planned | Profile + Vehicle management |
| **Phase 7** | ⏳ Planned | Push notifications |

---

## What's Needed for Phase 2

1. **Backend URL for staging** — to test API calls on device
2. **OTP behavior** — exact OTP length and expiry UX requirements
3. **Logo asset** — place official logo in `assets/images/` as `logo.png` and `logo-dark.png`
4. **Social login** — confirm if Google/Apple sign-in is required

---

## Code Quality Rules

- **JavaScript only** — no TypeScript source files in `src/`
- `tsconfig.json` exists only for ESLint path alias resolution and Expo Router internals
- All route files in `src/app/` are lightweight — no business logic inside route files
- Business logic → `src/features/`
- API calls → RTK Query in `src/features/*/Api.js`
- Tokens → `src/services/storage/secureStorage.js` only
- Colors → `src/theme/colors.js` only — never hardcoded in components

---

*Built with ❤️ for The Black Wash, Hazaribagh, Jharkhand, India*
