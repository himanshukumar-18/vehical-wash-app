# The Black Wash — Backend

> "Your Car. Our Care."

Production-ready Django REST Framework backend for the The Black Wash vehicle wash mobile application (React Native / Expo). Dockerized, PostgreSQL-backed, VPS-deployable.

---

## Architecture

```
React Native App  →  Django REST API  →  PostgreSQL
                            ↓
                     MSG91 SMS API (OTP)
                     SMTP Email (OTP / Welcome)
                     Google OAuth2 (token verify)
```

**Deployment architecture (VPS):**
```
Client → Nginx (443) → localhost:8011 → Docker:8000 → Gunicorn → Django → PostgreSQL (internal)
```

---

## Tech Stack

| Layer | Choice |
|---|---|
| Language | Python 3.13 |
| Framework | Django 5.x + Django REST Framework 3.15.x |
| Auth | JWT (SimpleJWT) + Google OAuth2 |
| Database | PostgreSQL 17 (Docker) |
| OTP / SMS | MSG91 v5 OTP API |
| Email | Django built-in SMTP |
| Containerisation | Docker + Docker Compose |
| Production server | Gunicorn 3 workers |

---

## Project Structure

```
backend/
├── config/                 # Django project config
│   ├── settings.py         # All settings, env-driven
│   ├── urls.py             # Root URL routing
│   ├── exceptions.py       # Custom DRF exception handler
│   ├── wsgi.py
│   └── asgi.py
├── users/                  # Auth, OTP, Profile
│   ├── models.py           # User, OTP models
│   ├── serializers.py      # All auth serializers
│   ├── views.py            # All auth views
│   ├── urls.py             # /api/auth/ routes
│   ├── admin.py
│   ├── tests.py
│   └── migrations/
├── vehicles/               # Vehicle management
│   ├── models.py           # Vehicle model
│   ├── serializers.py
│   ├── views.py            # VehicleViewSet + IsVehicleOwner
│   ├── urls.py             # /api/vehicles/ routes
│   ├── admin.py
│   ├── tests.py
│   └── migrations/
├── notifications/          # Email + SMS delivery
│   ├── email.py            # send_otp_email, send_welcome_email
│   ├── sms.py              # MSG91 OTP integration
│   ├── services.py         # send_otp_sms wrapper
│   ├── templates/emails/   # Branded HTML email templates
│   └── apps.py
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── .env.example
├── .gitignore
└── manage.py
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in all values before running.

| Variable | Description | Default |
|---|---|---|
| `SECRET_KEY` | Django secret key | — |
| `DEBUG` | Debug mode | `False` |
| `ALLOWED_HOSTS` | Comma-separated allowed hosts | `127.0.0.1,localhost` |
| `DB_NAME` | PostgreSQL database name | `theblackwash` |
| `DB_USER` | PostgreSQL user | `theblackwash_user` |
| `DB_PASSWORD` | PostgreSQL password | — |
| `DB_HOST` | PostgreSQL host | `db` (Docker service name) |
| `DB_PORT` | PostgreSQL port | `5432` |
| `HOST_PORT` | Host port mapping | `8011` |
| `CONTAINER_PORT` | Container port | `8000` |
| `EMAIL_BACKEND` | Django email backend | console |
| `EMAIL_HOST` | SMTP host | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_HOST_USER` | SMTP username | — |
| `EMAIL_HOST_PASSWORD` | SMTP password / app password | — |
| `EMAIL_USE_TLS` | Enable TLS | `True` |
| `DEFAULT_FROM_EMAIL` | From address for outgoing emails | — |
| `SMS_PROVIDER` | SMS provider (`msg91` or `mock`) | `mock` |
| `MSG91_API_KEY` | MSG91 API key | — |
| `MSG91_TEMPLATE_ID` | MSG91 OTP template ID | — |
| `MSG91_SENDER_ID` | MSG91 sender ID | `TBWASH` |
| `GOOGLE_CLIENT_ID` | Google OAuth2 client ID | — |
| `OTP_EXPIRY_MINUTES` | OTP validity window | `10` |
| `OTP_MAX_ATTEMPTS` | Max OTP verify attempts | `5` |
| `OTP_RESEND_COOLDOWN_SECONDS` | Resend cooldown | `60` |
| `USE_SQLITE` | Use SQLite instead of PostgreSQL | `False` |

> **Never commit `.env` to version control.**

---

## Docker Commands

### Start (production)
```bash
docker compose up -d
```

### Stop
```bash
docker compose down
```

### View logs
```bash
docker compose logs -f backend
docker compose logs -f db
```

### Container status
```bash
docker compose ps
```

### Run migrations
```bash
docker compose exec backend python manage.py migrate
```

### Create superuser
```bash
docker compose exec backend python manage.py createsuperuser
```

### Run tests (uses SQLite in-memory)
```bash
docker compose exec -e USE_SQLITE=True backend python manage.py test --verbosity=2
```

### Rebuild after code changes
```bash
docker compose build && docker compose up -d
```

### Collect static files
```bash
docker compose exec backend python manage.py collectstatic --noinput
```

---

## Local Development (without Docker)

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Use SQLite locally
echo "USE_SQLITE=True" >> .env

python manage.py migrate
python manage.py runserver
```

---

## API Endpoints

Base URL: `http://localhost:8011/api/`

### Authentication — `/api/auth/`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `auth/register/` | No | Register with email + password + fullname |
| `POST` | `auth/verify-otp/` | No | Verify email OTP after registration |
| `POST` | `auth/resend-otp/` | No | Resend OTP (60s cooldown) |
| `POST` | `auth/login/` | No | Login with email + password |
| `POST` | `auth/login/phone/` | No | Login / register with phone OTP |
| `POST` | `auth/verify-otp/phone/` | No | Verify phone OTP |
| `POST` | `auth/google/` | No | Google Sign-In (server-side token verify) |
| `POST` | `auth/token/refresh/` | No | Refresh access token |
| `POST` | `auth/logout/` | Yes | Blacklist refresh token |
| `GET` | `auth/profile/` | Yes | Get current user profile |
| `PATCH` | `auth/profile/` | Yes | Update profile (fullname, phone) |

### Vehicles — `/api/vehicles/`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `vehicles/` | Yes | List user's vehicles |
| `POST` | `vehicles/` | Yes | Add a vehicle |
| `GET` | `vehicles/{id}/` | Yes | Get vehicle detail |
| `PUT/PATCH` | `vehicles/{id}/` | Yes | Update vehicle |
| `DELETE` | `vehicles/{id}/` | Yes | Delete vehicle |
| `POST` | `vehicles/{id}/set_default/` | Yes | Set vehicle as default |

### Standard API Response Shape

**Success:**
```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "...",
  "code": "error_code",
  "errors": { ... }
}
```

---

## Authentication Flows

### Email Registration
```
POST /auth/register/     → creates user (unverified) → sends OTP email
POST /auth/verify-otp/   → verifies OTP → returns access + refresh JWT
```

### Email Login
```
POST /auth/login/        → validates credentials → returns access + refresh JWT
```

### Phone OTP Login
```
POST /auth/login/phone/          → sends SMS OTP via MSG91
POST /auth/verify-otp/phone/     → verifies OTP → returns access + refresh JWT
                                    (creates user if first login)
```

### Google Sign-In
```
App → Google Sign-In SDK → receives id_token
POST /auth/google/ { id_token }  → Django verifies with Google servers
                                 → returns access + refresh JWT
```

### Token Refresh
```
POST /auth/token/refresh/ { refresh }  → returns new access token
```

### Logout
```
POST /auth/logout/ { refresh }  → blacklists refresh token
```

---

## SMS Integration (MSG91)

The mobile app **never** receives or stores the MSG91 API key.

```
Mobile App  →  POST /api/auth/login/phone/  →  Django  →  MSG91 API  →  User Phone (SMS)
```

Set `SMS_PROVIDER=msg91` in production. Use `SMS_PROVIDER=mock` in development (OTP is printed to logs).

---

## Security

- JWT: 60-minute access tokens, 7-day refresh tokens, rotation enabled
- Passwords: never stored in plain text, never logged
- OTPs: stored as SHA-256 hashes, expire after 10 minutes, max 5 attempts
- Throttling: 10 req/min on auth endpoints, 5 req/min on OTP endpoints
- Object-level auth: all vehicle endpoints filter by `request.user` — no cross-user access
- Google auth: server-side `id_token` verification — client never sends raw email/name as proof
- Security headers: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, XSS filter
- HTTPS-only cookies when `DEBUG=False`
- Non-root Docker user (`appuser`)
- Internal PostgreSQL — port not exposed to host

---

## VPS Deployment

1. Clone the repo on your VPS
2. Copy `.env.example` to `.env` and fill in production values
3. Set `DEBUG=False`, `SECRET_KEY` to a long random string, `ALLOWED_HOSTS` to your domain
4. Set `SMS_PROVIDER=msg91` and configure MSG91 credentials
5. Configure SMTP credentials for production email
6. Run:
   ```bash
   docker compose build
   docker compose up -d
   docker compose exec backend python manage.py migrate
   docker compose exec backend python manage.py collectstatic --noinput
   ```
7. Point Nginx to `localhost:8011`

**Nginx config snippet:**
```nginx
location /api/ {
    proxy_pass http://127.0.0.1:8011;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```
