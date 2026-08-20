# Production Deployment Guide

---

## 1. Overview

This document describes the production deployment pipeline for **The Black Wash** application using Docker, Docker Compose, Gunicorn, Nginx, PostgreSQL, and Redis.

---

## 2. Docker Architecture

The application runs inside a Docker Compose network:

```
                  ┌───────────────────────────────┐
                  │    Nginx Reverse Proxy        │
                  │   (Ports 80 / 443 HTTPS)      │
                  └──────────────┬────────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 │                               │
                 ▼                               ▼
    ┌─────────────────────────┐     ┌─────────────────────────┐
    │  wash_frontend (Node)   │     │  wash_backend (Django)  │
    │  Port 3000 (Internal)   │     │  Port 8000 (Internal)   │
    └─────────────────────────┘     └────────────┬────────────┘
                                                 │
                                 ┌───────────────┴───────────────┐
                                 │                               │
                                 ▼                               ▼
                    ┌─────────────────────────┐     ┌─────────────────────────┐
                    │   wash_db (PostgreSQL)  │     │   wash_redis (Redis)    │
                    │   Port 5432 (Internal)  │     │   Port 6379 (Internal)  │
                    └─────────────────────────┘     └─────────────────────────┘
```

---

## 3. Pre-Deployment Configuration

### 3.1 Environment File Preparation
Copy `.env.example` to `.env` on your production server:

```bash
cp .env.example .env
```

Ensure the following variables are configured:
- `DEBUG=False`
- `SECRET_KEY`: Set to a cryptographically secure 50+ character random string.
- `ALLOWED_HOSTS`: Set to your domain names (`theblackwash.com,api.theblackwash.com`).
- `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`: Set to production Razorpay keys.
- `CLOUDINARY_*`: Set to your production Cloudinary account credentials.
- `EMAIL_*`: Set to valid SMTP credentials.

---

## 4. Deployment Execution

### Step 1: Clone Repository & Build Containers
```bash
git clone https://github.com/your-org/vehicle-wash-app.git
cd vehicle-wash-app

# Build and start container stack in detached mode
docker compose up -d --build
```

### Step 2: Database Migration & Superuser Creation
```bash
# Apply database migrations
docker exec wash_backend python manage.py migrate

# Create initial admin superuser
docker exec -it wash_backend python manage.py createsuperuser
```

### Step 3: Collect Static Files
```bash
docker exec wash_backend python manage.py collectstatic --noinput
```

---

## 5. Health Check & Monitoring

### Container Health Status
```bash
docker compose ps
```

### Health Endpoints
- Backend Liveness Probe: `GET http://localhost:8000/health/`
- Backend Readiness Probe: `GET http://localhost:8000/health/ready/`
- Frontend Probe: `GET http://localhost:3000/`

---

## 6. Logs & Maintenance

```bash
# View backend logs
docker logs -f wash_backend

# View frontend logs
docker logs -f wash_frontend

# Restart single service
docker restart wash_backend
```
