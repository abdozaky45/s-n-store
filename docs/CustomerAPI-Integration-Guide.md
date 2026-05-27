# S&N Customer API — Integration Guide

> **Base URL variable:** `{{urlDev}}` — replace with your actual server URL before making any request.
> All requests and responses use **JSON** (`Content-Type: application/json`).

---

## Table of Contents

1. [Customer Onboarding](#1-customer-onboarding)
2. [Categories](#2-categories)
3. [Sub-Categories](#3-sub-categories)
4. [Shipping Options](#4-shipping-options)
5. [Colors](#5-colors)
6. [Products](#6-products)
7. [Wishlist](#7-wishlist)
8. [Active Offers](#8-active-offers)
9. [Orders](#9-orders)
10. [Social Reviews & Hero Sliders](#10-social-reviews--hero-sliders)
11. [Full Checkout Flow — End-to-End](#11-full-checkout-flow--end-to-end)
12. [Error Reference](#12-error-reference)

---

## 1. Customer Onboarding

### Step 1 — Send Welcome Email

This is the very first step. Call this when the customer enters their email to start registration.

**Request**
```
POST {{urlDev}}/authentication/register-email
```
```json
{
  "email": "customer@example.com"
}
```

**Success Response (200)**
```json
{
  "statusCode": 200,
  "data": null,
  "message": "Welcome email sent successfully",
  "success": true
}
```

**Common Errors**

| Situation | Code | Message |
|-----------|------|---------|
| Invalid email format | 400 | `"Please enter a valid email address"` |
| Email field missing | 400 | `"Email is required"` |
| Email is not a string | 400 | `"Email must be a string"` |

---

### Step 2 — Identify Customer by Phone

After the welcome email is sent, register the customer's phone number. This creates the **customer record** and returns a `customer._id` you will use in all future calls.

**Request**
```
POST {{urlDev}}/public/customer/identify
```
```json
{
  "phone": "+201025502697"
}
```

> Phone must be in **international format** (e.g. `+20XXXXXXXXXX`).

**Success Response (200)**
```json
{
  "statusCode": 200,
  "data": {
    "customer": {
      "_id": "69d3075506143bda46fff7e1",
      "phone": "01025502697",
      "__v": 0
    }
  },
  "message": "Customer identified successfully",
  "success": true
}
```

> **Save `_id`** — this is your `customerId` used throughout the rest of the flow.

**Common Errors**

| Situation | Code | Message |
|-----------|------|---------|
| Phone field missing | 400 | `"phone" is required` |

---

### Step 3 — Get Customer by ID

Retrieve the customer record at any time.

**Request**
```
GET {{urlDev}}/public/customer/:customerId
```

Example: `GET {{urlDev}}/public/customer/69d3075506143bda46fff7e1`

---

### Step 4 — Update Customer Phone

Use this to change the phone number of an existing customer.

**Request**
```
PATCH {{urlDev}}/public/customer/:customerId
Authorization: Bearer <token>
```
```json
{
  "phone": "+201212140700"
}
```

---

### Step 5 — Add Customer Shipping Info

Before placing an order, the customer must have at least one saved address (customer info record). This links their name, address, and chosen shipping method.

**Request**
```
POST {{urlDev}}/public/customer-info/add-info
```
```json
{
  "customer": "69d3075506143bda46fff7e1",
  "firstName": "Ahmed",
  "lastName": "Khaled",
  "address": "Ain Shams",
  "apartmentSuite": "27 Mohamed Amin",
  "shipping": "69d2b4497485855f928edf8e",
  "postalCode": "2554",
  "additionalPhone": "01212740700",
  "email": "customer@example.com"
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `customer` | Yes | The `_id` from Step 2 |
| `firstName` | Yes | |
| `lastName` | Yes | |
| `address` | Yes | |
| `shipping` | Yes | `_id` from [Shipping Options](#4-shipping-options) |
| `apartmentSuite` | No | |
| `postalCode` | No | |
| `additionalPhone` | No | |
| `email` | No | |

**Success Response (200)**
```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "customer": "69d3075506143bda46fff7e1",
      "country": "Egypt",
      "firstName": "Ahmed",
      "lastName": "Khaled",
      "address": "Ain Shams",
      "apartmentSuite": "27 Mohamed Amin",
      ...
    }
  },
  "success": true
}
```

> **Save the returned `_id`** — this is your `customerInfoId`, required when creating an order.

**Common Errors**

| Situation | Code | Message |
|-----------|------|---------|
| Invalid / missing `customer` ID | 400 | `"Customer not found"` |
| Invalid / missing `shipping` ID | 400 | `"Shipping not found"` |

---

### Step 6 — Update Customer Info

To edit a saved address record:

**Request**
```
PATCH {{urlDev}}/public/customer-info/update-info/:customerInfoId
```
```json
{
  "customer": "69d3075506143bda46fff7e1",
  "firstName": "Ahmed",
  "lastName": "Khaled",
  "address": "Ain Shams",
  "apartmentSuite": "28 Mohamed Amin",
  "shipping": "69cd88c98e13c19f521dd2b2",
  "postalCode": "2554",
  "additionalPhone": "01212740700",
  "email": "customer@example.com"
}
```

---

### Step 7 — Get All Customer Info Records

Returns all saved addresses for a customer.

**Request**
```
GET {{urlDev}}/public/customer-info/all-info/:customerId
```

---

### Step 8 — Get One Customer Info Record

**Request**
```
GET {{urlDev}}/public/customer-info/get-one/:customerInfoId
```

---

### Step 9 — Delete Customer Info Record

**Request**
```
DELETE {{urlDev}}/public/customer-info/delete-info/:customerInfoId
```

---

## 2. Categories

### Get All Categories

**Request**
```
GET {{urlDev}}/public/category/get-all-categories
```

### Get Category by ID

**Request**
```
GET {{urlDev}}/public/category/get-one-category/:categoryId
```

---

## 3. Sub-Categories

### Get All Sub-Categories

**Request**
```
GET {{urlDev}}/public/sub-category/get-all-sub-categories
```

### Get Sub-Category by ID

**Request**
```
GET {{urlDev}}/public/sub-category/get-one-sub-category/:subCategoryId
```

---

## 4. Shipping Options

Fetch shipping methods before building the customer info form so the customer can pick one.

### Get All Shipping Methods

**Request**
```
GET {{urlDev}}/public/shipping
```

### Get Shipping by ID

**Request**
```
GET {{urlDev}}/public/shipping/:shippingId
```

---

## 5. Colors

### Get All Colors

**Request**
```
GET {{urlDev}}/public/color
```

### Get Color by ID

**Request**
```
GET {{urlDev}}/public/color/:colorId
```

---

## 6. Products

### Search Products (Fuzzy)

**Request**
```
GET {{urlDev}}/public/product/search?searchQuery=<term>
```

Example: `GET {{urlDev}}/public/product/search?searchQuery=shirt`

---

### Get All Products (with Filters & Pagination)

**Request**
```
GET {{urlDev}}/public/product/get-all-products?page=1&sort=High to Low
```

| Query Param | Required | Notes |
|-------------|----------|-------|
| `page` | No | Page number (default 1) |
| `sort` | No | `High to Low`, `Low to High`, etc. |

---

### Get Product by ID

Pass `customer` as a query param to get personalised data (e.g. whether the item is in the customer's wishlist).

**Request**
```
GET {{urlDev}}/public/product/get-one-product/:productId?customer=:customerId
```

---

### Check Stock for Variants

Call this before placing an order to confirm items are in stock. Pass an array of `variantId`s.

**Request**
```
POST {{urlDev}}/public/product/stock
```
```json
{
  "variantIds": [
    "69d58eaafbe60f1e85d2045a",
    "69d58eaafbe60f1e85d2045e"
  ]
}
```

**Success Response (200)**
```json
{
  "statusCode": 200,
  "data": {
    "stock": {
      "69d58eaafbe60f1e85d2045a": 10,
      "69d58eaafbe60f1e85d2045e": 0
    }
  }
}
```

> A stock value of `0` means the variant is **out of stock**. Do not include it in the order.

---

## 7. Wishlist

### Add Product to Wishlist

**Request**
```
POST {{urlDev}}/public/wishlist/add-product
```
```json
{
  "customer": "69d3075506143bda46fff7e1",
  "productId": "69d5867fcd727aebc4ee36a6"
}
```

---

### Get All Wishlist Items for a Customer

**Request**
```
GET {{urlDev}}/public/wishlist/customer/:customerId
```

---

### Get Wishlist Item by ID

**Request**
```
GET {{urlDev}}/public/wishlist/product/:wishlistItemId
```

---

### Remove Product from Wishlist

**Request**
```
DELETE {{urlDev}}/public/wishlist/product/:wishlistItemId
```

---

## 8. Active Offers

### Get All Active Offers

**Request**
```
GET {{urlDev}}/public/offers/Active
```

---

## 9. Orders

### Create an Order

This is the final step of checkout. You need:
- `customerInfoId` from Step 5
- `customerId` from Step 2
- `productId` and `variantId` from the product listing
- Quantities that have been validated against stock (Step 6 above)

**Request**
```
POST {{urlDev}}/public/order
```
```json
{
  "customerInfo": "69d318a4d4f3f169b43f109c",
  "customer": "69d3075506143bda46fff7e1",
  "products": [
    {
      "productId": "69d5867fcd727aebc4ee36c3",
      "variantId": "69d58ee5354ce24f8f7b83d9",
      "quantity": 1
    }
  ]
}
```

**Success Response (201)**
```json
{
  "statusCode": 201,
  "data": {
    "order": {
      "orderNumber": "ORD-798358-3315",
      "customer": "69d3075506143bda46fff7e1",
      "customerInfo": "69d318a4d4f3f169b43f109c",
      ...
    }
  }
}
```

**Common Errors**

| Situation | Code | Message |
|-----------|------|---------|
| Variant out of stock | 400 | `"Insufficient stock for variant ..."` |
| Product ID not found | 400 | `"Some products not found"` |
| Invalid customer/info IDs | 400 | `"Customer information not found or customer or invalid"` |

---

### Get All Orders for a Customer (with Pagination)

**Request**
```
GET {{urlDev}}/public/order/customer/:customerId?page=1
```

---

### Get Order by ID

**Request**
```
GET {{urlDev}}/public/order/:orderId
```

---

### Cancel an Order

**Request**
```
PATCH {{urlDev}}/public/order/cancel/:orderId
```

---

## 10. Social Reviews & Hero Sliders

### Get All Social Reviews

**Request**
```
GET {{urlDev}}/public/social-review
```

---

### Get All Hero Sections (Image Slider)

**Request**
```
GET {{urlDev}}/public/hero-section/all
Authorization: Bearer <token>
```

---

### Get Hero Section by ID

**Request**
```
GET {{urlDev}}/public/hero-section/:heroSectionId
```

---

## 11. Full Checkout Flow — End-to-End

Follow these steps in order for a complete customer journey from landing page to placed order.

```
1.  POST /authentication/register-email          → send welcome email
2.  POST /public/customer/identify               → create customer, get customerId
3.  GET  /public/shipping                        → fetch shipping options for address form
4.  POST /public/customer-info/add-info          → save address, get customerInfoId
5.  GET  /public/product/get-all-products        → show product listing
6.  GET  /public/product/get-one-product/:id     → show product detail page
7.  POST /public/product/stock                   → verify stock before adding to cart
8.  POST /public/order                           → place the order
9.  GET  /public/order/:orderId                  → confirm & display order details
```

---

## 12. Error Reference

All errors follow this envelope:

```json
{
  "statusCode": 400,
  "success": false,
  "message": "Validation Error!",
  "errors": [
    {
      "message": "Human readable error",
      "path": ["fieldName"],
      "type": "joi.error.type"
    }
  ]
}
```

| HTTP Code | Meaning |
|-----------|---------|
| 200 | Success |
| 201 | Created successfully |
| 400 | Bad request — check the `errors` array for field-level detail |
| 401 | Unauthorized — missing or invalid Bearer token |
| 404 | Resource not found |
