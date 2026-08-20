# Razorpay Payment Gateway & Financial Integrity Specification

---

## 1. Overview

Payment processing in **The Black Wash** application is managed via Razorpay. Financial calculations, order creation, signature verification, and ledger updates are handled strictly on the backend to enforce 100% financial integrity.

---

## 2. Payment Lifecycle Workflow

```
Customer                    Frontend                   Django Backend                Razorpay API
   │                           │                             │                            │
   │─── Click "Pay Now" ──────>│                             │                            │
   │                           │─── POST /create-order/ ────>│                            │
   │                           │    { booking_id }           │─── Create Order Request ──>│
   │                           │                             │    Amount in paise         │
   │                           │                             │<── Returns order_id ───────│
   │                           │<── { order_id, amount } ────│                            │
   │                           │                             │                            │
   │─── Render Checkout SDK ──>│                             │                            │
   │    Enter Card/UPI Details │                             │                            │
   │                           │─── Payment Response ───────>│                            │
   │                           │    payment_id, signature    │                            │
   │                           │                             │                            │
   │                           │─── POST /verify/ ──────────>│                            │
   │                           │    { order_id, payment_id,  │                            │
   │                           │      signature }            │                            │
   │                           │                             │─── HMAC SHA256 Verification│
   │                           │                             │    Update Payment Status   │
   │                           │                             │    Update Booking Status   │
   │                           │<── { success: true } ───────│                            │
   │<── Show Success Screen ───│                             │                            │
```

---

## 3. Financial Integrity Rules

1. **Zero Trust for Frontend Amounts**:
   The backend NEVER reads or trusts payment amounts sent from the frontend request body. Amounts are calculated directly from backend database records (`service.price`).
2. **Monetary Representation**:
   Prices in database models use `models.DecimalField(max_digits=10, decimal_places=2)`. Razorpay API calls multiply amounts by `100` (`int(amount * 100)`) to submit values in Indian Paise.
3. **Backend Signature Verification**:
   Verification generates an HMAC SHA256 hash using `RAZORPAY_KEY_SECRET` over `f"{order_id}|{payment_id}"` and compares it against `razorpay_signature` in constant time (`hmac.compare_digest`).

---

## 4. Idempotency & Duplicate Protection

- **Active Payment Check**:
  When `/api/payments/create-order/` is invoked, the backend queries existing `Payment` records for the target `booking`.
  If a payment record already exists with status `CREATED` and a valid `razorpay_order_id`, the existing order details are returned instead of creating a duplicate order with Razorpay.
- **Single Active Attempt**:
  Prevents race conditions caused by repeated button clicks during network latency.
