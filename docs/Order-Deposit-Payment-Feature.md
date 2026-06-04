# Frontend Task Brief — Order Deposit / Payment Tracking

> **How to use this file:** Hand this entire file to Claude Code **inside the frontend repository**. It is a complete, self‑contained brief — everything needed (concept, data shapes, API contracts, upload flow, errors, exact tasks, acceptance criteria) is below. No need to read the backend.

---

## 0. Role & Objective (read first)

You are Claude Code working in the **frontend** repository. The backend for an **Order Deposit / Payment Tracking** feature is already implemented and deployed on the API. Your job is to build the frontend for it.

**Hard guardrails:**
- The whole feature is **OPTIONAL**. An order can have **no payment recorded** and must keep working **exactly as it does today**. Do not break any existing order screen.
- Everything you add must be **additive and backward compatible**.
- **Privacy:** the field `payment.transactions[].recordedBy` is an internal admin id — **never render it in the customer UI**.
- Reuse the app's existing API client, auth handling (Bearer token), toast/notifications, money formatter, image uploader, theme and i18n. Do **not** invent parallel utilities.

**Conventions used by this API:**
- Base URL placeholder: `{{baseUrl}}`. Admin endpoints require header `Authorization: Bearer <token>`.
- Success envelope: `{ statusCode, data, message, success: true }`.
- Thrown error envelope: `{ success: false, message, error }` (HTTP status carries the code).
- Validation error envelope: `{ statusCode: 400, success: false, message: "Validation Error!", errors: [...] }`.
- All amounts are plain numbers in **EGP**.

---

## 1. The Concept (why this exists)

Some customers send an **earnest/booking deposit** ("جدية حجز") when placing an order — **sometimes, optionally**. There is **no payment gateway**: money is transferred **outside the system** (Instapay, Vodafone Cash, bank transfer, …). The system only **records** that a transfer happened, **tracks how much was collected**, and **shows the remaining balance** to the admin and the customer.

Design principles you must reflect in the UI:
- **Payment status is separate from order (fulfilment) status.** An order has its normal lifecycle (`under_review → confirmed → ordered → shipped → delivered`) **and** an independent payment status.
- **The remaining balance is derived:** `remainingAmount = totalAmount − payment.totalCollected`. Always trust the `remainingAmount` field from the API; never recompute or cache it.
- **Reaching `delivered` means fully collected:** the backend auto‑collects the remaining balance as cash‑on‑delivery when an order becomes `delivered`. The UI just reflects it after refresh.

---

## 2. Data Model — exact shapes

Every order object returned by the API now includes a `payment` object and a `remainingAmount` number. TypeScript shape to mirror:

```ts
type PaymentMethod = "instapay" | "vodafone_cash" | "bank_transfer" | "cash" | "other";
type PaymentStatus = "unpaid" | "partially_paid" | "paid" | "refund_pending" | "refunded";
type PaymentTxnType = "deposit" | "balance_on_delivery" | "refund";

interface PaymentTransaction {
  amount: number;
  type: PaymentTxnType;
  method: PaymentMethod;
  note?: string;
  receiptImage?: { mediaUrl: string; mediaId: string };
  recordedBy: string;     // INTERNAL admin id — never show to customers
  recordedAt: string;     // ISO date
}

interface OrderPayment {
  totalCollected: number;          // net collected so far (deposits + COD − refunds)
  status: PaymentStatus;
  transactions: PaymentTransaction[];
}

// Added to the existing Order type:
interface Order {
  // ...all existing fields (orderNumber, totalAmount, status, products, ...)
  payment: OrderPayment;
  remainingAmount: number;         // derived: totalAmount − payment.totalCollected
}
```

A brand‑new order arrives as `payment = { totalCollected: 0, status: "unpaid", transactions: [] }` and `remainingAmount = totalAmount`.

### Payment status meanings (for labels/badges)

| `payment.status`  | Meaning | Suggested badge color |
|-------------------|---------|------------------------|
| `unpaid`          | Nothing collected yet | gray |
| `partially_paid`  | A deposit collected, balance remains | amber |
| `paid`            | Fully collected | green |
| `refund_pending`  | Cancelled while money held — refund owed | red |
| `refunded`        | Money returned to the customer | blue |

### Transaction type meanings

| `type`                | Origin | Meaning |
|-----------------------|--------|---------|
| `deposit`             | Admin manual | A deposit / partial transfer the customer sent |
| `balance_on_delivery` | System auto | Remaining balance auto‑collected at `delivered` (COD) |
| `refund`              | Admin manual | Money returned to the customer |

---

## 3. Lifecycle & Scenarios (the behavior to support)

**Scenario A — deposit (typical).** Order = 500. Created → `unpaid`, remaining 500. Admin records a 200 deposit → `partially_paid`, collected 200, remaining 300. Status → `delivered` → backend auto‑adds `balance_on_delivery: 300` → `paid`, remaining 0.

**Scenario B — no deposit.** Order = 500 → stays `unpaid`. Status → `delivered` → backend auto‑adds `balance_on_delivery: 500` → `paid`. (No payment step ever taken.)

**Scenario C — paid then cancelled → refund.** Order = 500, 200 deposit collected, then cancelled → `refund_pending` (200 owed). Admin returns the 200 outside the system, then records a refund → `refunded`, collected 0.

> If an admin moves an order *back* from `delivered`, the backend removes the auto balance entry and recomputes the status — the UI just shows the refreshed values.

---

## 4. API Endpoints you will call

### 4.1 Record a Payment / Deposit (Admin) — NEW

```
POST {{baseUrl}}/order/admin/payment/:orderId
Authorization: Bearer <token>
```

Body:

| Field             | Type   | Required | Notes |
|-------------------|--------|----------|-------|
| `amount`          | number | Yes      | `> 0`; must not push `totalCollected` above `totalAmount`. |
| `method`          | string | Yes      | `instapay` \| `vodafone_cash` \| `bank_transfer` \| `cash` \| `other`. |
| `note`            | string | No       | e.g. sender phone / transfer reference. |
| `receiptImageUrl` | string | No       | S3 `mediaUrl` of the transfer screenshot (see §5). |

```json
{ "amount": 200, "method": "instapay", "note": "transfer from 01000000000", "receiptImageUrl": "https://bucket.s3.us-east-1.amazonaws.com/PaymentReceipts/adminId_..._0" }
```

Success `200` → returns the updated order (not populated) with the new `payment` and `remainingAmount`:

```json
{
  "statusCode": 200,
  "data": { "order": {
      "_id": "...", "orderNumber": "ORD-123456-7890", "totalAmount": 500, "status": "confirmed",
      "payment": { "totalCollected": 200, "status": "partially_paid",
        "transactions": [ { "amount": 200, "type": "deposit", "method": "instapay", "note": "...", "recordedBy": "...", "recordedAt": "..." } ] },
      "remainingAmount": 300
  } },
  "message": "Payment recorded successfully", "success": true
}
```

Possible errors (map to inline messages — see §6): order not found (404); order cancelled/deleted (400); already settled (400); amount exceeds remaining (400); validation (400).

### 4.2 Record a Refund (Admin) — NEW

```
POST {{baseUrl}}/order/admin/refund/:orderId
Authorization: Bearer <token>
```

Precondition: `payment.status === "refund_pending"`. Refund amount = full `totalCollected` (no amount field needed).

Body:

| Field             | Type   | Required | Notes |
|-------------------|--------|----------|-------|
| `method`          | string | Yes      | How money was returned (same enum). |
| `note`            | string | No       | Free text. |
| `receiptImageUrl` | string | No       | Optional proof. |

```json
{ "method": "instapay", "note": "refunded to customer" }
```

Success `200` → order with `payment.status: "refunded"`, `totalCollected: 0`, plus a `refund` ledger entry. Errors: order not found (404); no pending refund (400).

### 4.3 Existing endpoints — unchanged request, now return `payment` + `remainingAmount`

- `GET {{baseUrl}}/order/admin/all` — admin list.
- `GET {{baseUrl}}/order/admin/:orderId` — admin detail.
- `GET {{baseUrl}}/public/order/:orderId` — customer detail.
- `GET {{baseUrl}}/public/order/customer/:customerId` — customer list.
- `PATCH {{baseUrl}}/order/admin/status/:orderId` — body `{ "status": "..." }` unchanged. Setting `delivered` makes the backend auto‑mark payment `paid`.
- `PATCH {{baseUrl}}/order/admin/free-shipping/:orderId` — no body; recomputes total and payment status.
- `PATCH {{baseUrl}}/public/order/cancel/:orderId` — if money was held, payment becomes `refund_pending`.

---

## 5. Receipt Image Upload (2‑step S3 flow — reuse existing uploader)

`receiptImageUrl` is optional. When attaching a screenshot:

1. `POST {{baseUrl}}/aws/get-presigned-url` with `{ "folder": "PaymentReceipts", "files": [ { "contentType": "<mime>" } ] }` → response `data.preSignedURLs[0].preSignedURL` (upload target) and `.mediaUrl` (final URL).
2. `PUT` the raw file binary to `preSignedURL` with header `Content-Type` = the same mime.
3. Send the returned `mediaUrl` as `receiptImageUrl` in the record‑payment / record‑refund request.

Allowed mime types: `image/jpeg`, `image/jpg`, `image/png`, `image/gif`, `image/webp`, `image/svg+xml`, `image/bmp`, `image/tiff`. `folder` is a free string; use `PaymentReceipts`.

---

## 6. Errors to handle (admin forms)

| HTTP | `message` | Show as |
|------|-----------|---------|
| 404  | `Order not found` | toast/error |
| 400  | `Cannot record a payment for an order in its current status` | inline form error |
| 400  | `Order payment is already fully settled` | inline form error |
| 400  | `Payment amount exceeds the remaining order total` | inline error on the amount field |
| 400  | `This order has no pending refund` | toast/error |
| 400  | `Validation Error!` (with `errors[]`) | inline field errors |

---

## 7. Implementation Tasks (do all of these)

**A. Shared**
1. Add the `payment` / `remainingAmount` fields to the Order type/model.
2. Create one shared mapping for `PaymentStatus` → { label (i18n), color } and reuse it everywhere. Same for `PaymentMethod` → label, and `PaymentTxnType` → label.
3. Add two API client methods: `recordOrderPayment(orderId, { amount, method, note?, receiptImageUrl? })` and `recordOrderRefund(orderId, { method, note?, receiptImageUrl? })`.

**B. Admin — Order detail page**
4. Add a **Payment panel** showing: Total amount, Collected (`payment.totalCollected`), Remaining (`remainingAmount`), and a **payment status badge**.
5. Add a **transactions ledger** table: amount, type (labeled), method (labeled), date (`recordedAt`), note, and a receipt **thumbnail** (`receiptImage.mediaUrl`) that opens full size. **Do not render `recordedBy`.**
6. **"Record Payment" button → modal/form:** `amount` (number, required, `> 0`, client‑validate `<= remainingAmount`), `method` (select, required), `note` (optional), optional receipt image (use §5 uploader). Submit to §4.1. On success, refresh the order. Map backend 400 messages to inline errors. **Hide/disable** this button when `payment.status` ∈ {`paid`, `refund_pending`, `refunded`} or the order is `cancelled`/`deleted`.
7. **"Record Refund" button** — visible **only** when `payment.status === "refund_pending"`. Modal: `method` (select, required), `note` (optional), optional receipt image. Submit to §4.2. On success, refresh (status → `refunded`).
8. Leave the existing "Update Order Status" control as is; just refresh the payment panel after a status change (so `delivered → paid` is reflected).

**C. Admin — Orders list**
9. Add a compact payment status badge per row (same color mapping). Optionally show `remainingAmount`.

**D. Customer — Order detail & order list**
10. Show a **payment summary**: Total, **Paid** (`payment.totalCollected`), **Remaining to pay** (`remainingAmount`), and a payment status badge. Keep it minimal — the customer mainly needs "Remaining to pay" + status.
11. **Privacy:** do not show `recordedBy`. Prefer showing only the summary; if you show any ledger, hide `recordedBy`.
12. Friendly status copy for customers: `refund_pending` → "Refund is being processed"; `refunded` → "Refunded"; `partially_paid` → show remaining due; `paid` → "Fully paid".

---

## 8. Acceptance Criteria (definition of done)

- [ ] Existing order screens work unchanged when an order has `payment.status === "unpaid"` and no transactions.
- [ ] Admin can record a deposit; panel updates with new collected/remaining and a `deposit` ledger row.
- [ ] Recording an amount greater than `remainingAmount` shows the backend error on the amount field (and is also blocked client‑side).
- [ ] After setting an order to `delivered`, the payment panel shows `paid` and remaining `0` (a `balance_on_delivery` row appears).
- [ ] A cancelled order that had a deposit shows `refund_pending` and a working "Record Refund" action that flips it to `refunded`.
- [ ] Optional receipt image uploads via the S3 flow and renders as a thumbnail in the admin ledger.
- [ ] Customer views show Total / Paid / Remaining / status, and never show `recordedBy`.
- [ ] All new strings go through i18n; status colors come from the single shared mapping.
