# Frontend Task Brief — Home Feed APIs (Diversified Products)

> **How to use this file:** Hand this entire file to Claude Code **inside the frontend repository**. It is a complete, self‑contained brief for wiring the two storefront home‑page product feeds. No need to read the backend.

---

## 0. Role & Objective

You are Claude Code working in the **frontend** repository. The backend already exposes two **public** home‑page product feeds. Your job is to call them and render them on the home page.

**Conventions:**
- Base URL placeholder: `{{baseUrl}}`.
- These are **public GET** endpoints — **no auth header, no query params, no body**.
- Success envelope: `{ statusCode, data, message, success: true }`.
- Reuse the app's existing product card / product type, money formatter, i18n and image components. Do **not** invent parallel utilities.

---

## 1. What these endpoints are for

The home page must feel **diverse**, not flooded by one category. The backend returns a curated, **newest‑first but diversified** set of products:

- Max **20** products.
- Never more than **3 products from the same category**.
- Inside a category it **prefers different subcategories** (preference, not a hard rule).
- Categories are **interleaved** (product from category A, then B, then C, then back to A…), so no category dominates the top of the page.
- Only active products (deleted products are never returned).

There are two feeds:

| Feed | Endpoint | Returns |
|------|----------|---------|
| Regular products | `GET {{baseUrl}}/public/product/home-products` | products **not** on sale (`isSale: false`) |
| Sale products | `GET {{baseUrl}}/public/product/home-sale-products` | products **on sale** (`isSale: true`) |

> ⚠️ **The `products` array is already in display order.** It is intentionally interleaved for diversity. **Do not re‑sort it** on the frontend — render it as received.

---

## 2. Request

```
GET {{baseUrl}}/public/product/home-products
GET {{baseUrl}}/public/product/home-sale-products
```

No headers, no params, no body. Each returns up to 20 products.

---

## 3. Response — envelope (identical for both)

```json
{
  "statusCode": 200,
  "data": {
    "products": [ /* ≤ 20 products, already in display order */ ],
    "currentPage": 1,
    "totalItems": 14,
    "totalPages": 1
  },
  "message": "Product found successfully",
  "success": true
}
```

> `currentPage` and `totalPages` are always `1` (the home feed is not paginated). `totalItems` = number of products returned (≤ 20).

---

## 4. Response — the product object (TypeScript)

The product shape is **identical** to the existing `GET /public/product/get-all-products` endpoint, so reuse the same product card/type.

```ts
interface HomeProduct {
  _id: string;
  name: { ar: string; en: string };
  description: { ar: string; en: string };
  price: number;
  salePrice: number;              // 0 when there is no sale
  finalPrice: number;             // = price for regular, = salePrice for sale items
  isSale: boolean;
  saleStartDate: number;          // unix-ms timestamp (0 if none)
  saleEndDate: number;
  isSoldOut: boolean;
  soldItems: number;
  isNewArrival: boolean;
  isBestSeller: boolean;
  defaultImage: { mediaUrl: string; mediaId: string };
  albumImages: { mediaUrl: string; mediaId: string }[];
  sizeChartImage: { mediaUrl: string; mediaId: string };
  category: {
    _id: string;
    name: { ar: string; en: string };
    image: { mediaUrl: string; mediaId: string };
    groupSize: string;
    order?: number;
  };
  subCategory: {                  // ⚠️ can be null (product not under any subcategory)
    _id: string;
    name: { ar: string; en: string };
    image: { mediaUrl: string; mediaId: string };
  } | null;
  variants: {
    _id: string;
    size: string;
    quantity: number;
    color: { name: { ar: string; en: string }; hex: string } | null;  // color can be null
  }[];
  discount: number;               // virtual: price − salePrice (0 if none)
  discountPercentage: number;     // virtual: percentage (0 if none)
  createdBy: string;
  createdAt: number;              // numeric unix-ms timestamp
}
```

> `wholesalePrice` and `isDeleted` are **never** present in the response.

---

## 5. Full examples

### 5.1 `GET /public/product/home-products` (regular / not on sale)

```json
{
  "statusCode": 200,
  "data": {
    "products": [
      {
        "_id": "6650a1f2c3d4e5f6a7b8c901",
        "name": { "ar": "بوكسر قطن", "en": "Cotton Boxer" },
        "description": { "ar": "وصف", "en": "desc" },
        "price": 250,
        "salePrice": 0,
        "finalPrice": 250,
        "isSale": false,
        "saleStartDate": 0,
        "saleEndDate": 0,
        "isSoldOut": false,
        "soldItems": 12,
        "isNewArrival": true,
        "isBestSeller": false,
        "defaultImage": { "mediaUrl": "https://bucket.s3.amazonaws.com/Product/...", "mediaId": "Product/..." },
        "albumImages": [ { "mediaUrl": "https://...", "mediaId": "Product/..." } ],
        "sizeChartImage": { "mediaUrl": "", "mediaId": "" },
        "category": {
          "_id": "6650a000c3d4e5f6a7b8c001",
          "name": { "ar": "ملابس داخلية", "en": "Underwear" },
          "image": { "mediaUrl": "https://...", "mediaId": "Category/..." },
          "groupSize": "6650aaa0c3d4e5f6a7b8c0aa",
          "order": 1
        },
        "subCategory": {
          "_id": "6650b000c3d4e5f6a7b8c0b1",
          "name": { "ar": "بوكسر", "en": "Boxer" },
          "image": { "mediaUrl": "https://...", "mediaId": "SubCategory/..." }
        },
        "variants": [
          { "_id": "6650c111c3d4e5f6a7b8c0c1", "size": "L", "quantity": 8, "color": { "name": { "ar": "أسود", "en": "Black" }, "hex": "#000000" } },
          { "_id": "6650c222c3d4e5f6a7b8c0c2", "size": "XL", "quantity": 3, "color": { "name": { "ar": "كحلي", "en": "Navy" }, "hex": "#1a2b4c" } }
        ],
        "discount": 0,
        "discountPercentage": 0,
        "createdBy": "6650d000c3d4e5f6a7b8c0d1",
        "createdAt": 1748995200000
      },
      {
        "_id": "6650a1f2c3d4e5f6a7b8c902",
        "name": { "ar": "بيجامة صيفي", "en": "Summer Pajama" },
        "description": { "ar": "وصف", "en": "desc" },
        "price": 400,
        "salePrice": 0,
        "finalPrice": 400,
        "isSale": false,
        "isSoldOut": false,
        "category": { "_id": "6650a000c3d4e5f6a7b8c002", "name": { "ar": "بيجامات", "en": "Pajamas" }, "image": { "mediaUrl": "https://...", "mediaId": "Category/..." }, "groupSize": "..." },
        "subCategory": null,
        "variants": [ { "_id": "6650c333c3d4e5f6a7b8c0c3", "size": "M", "quantity": 5, "color": null } ],
        "discount": 0,
        "discountPercentage": 0,
        "createdBy": "6650d000c3d4e5f6a7b8c0d1",
        "createdAt": 1748991600000
      }
    ],
    "currentPage": 1,
    "totalItems": 14,
    "totalPages": 1
  },
  "message": "Product found successfully",
  "success": true
}
```

### 5.2 `GET /public/product/home-sale-products` (sale only)

Same shape — only the sale‑related values differ (`isSale: true`, `finalPrice = salePrice`, `discount > 0`).

```json
{
  "statusCode": 200,
  "data": {
    "products": [
      {
        "_id": "6650a1f2c3d4e5f6a7b8c950",
        "name": { "ar": "فانلة قطن", "en": "Cotton Undershirt" },
        "description": { "ar": "وصف", "en": "desc" },
        "price": 300,
        "salePrice": 210,
        "finalPrice": 210,
        "isSale": true,
        "saleStartDate": 1748908800000,
        "saleEndDate": 1751500800000,
        "isSoldOut": false,
        "soldItems": 40,
        "isNewArrival": false,
        "isBestSeller": true,
        "defaultImage": { "mediaUrl": "https://...", "mediaId": "Product/..." },
        "albumImages": [],
        "sizeChartImage": { "mediaUrl": "", "mediaId": "" },
        "category": {
          "_id": "6650a000c3d4e5f6a7b8c001",
          "name": { "ar": "ملابس داخلية", "en": "Underwear" },
          "image": { "mediaUrl": "https://...", "mediaId": "Category/..." },
          "groupSize": "6650aaa0c3d4e5f6a7b8c0aa"
        },
        "subCategory": {
          "_id": "6650b000c3d4e5f6a7b8c0b2",
          "name": { "ar": "فانلات", "en": "Undershirts" },
          "image": { "mediaUrl": "https://...", "mediaId": "SubCategory/..." }
        },
        "variants": [
          { "_id": "6650c444c3d4e5f6a7b8c0c4", "size": "L", "quantity": 10, "color": { "name": { "ar": "أبيض", "en": "White" }, "hex": "#ffffff" } }
        ],
        "discount": 90,
        "discountPercentage": 30,
        "createdBy": "6650d000c3d4e5f6a7b8c0d1",
        "createdAt": 1748980000000
      }
    ],
    "currentPage": 1,
    "totalItems": 9,
    "totalPages": 1
  },
  "message": "Product found successfully",
  "success": true
}
```

---

## 6. Gotchas (handle these)

- **Do not re‑sort `products`.** The order is the intended diversified display order.
- **`subCategory` can be `null`** — render safely.
- **`variants[].color` can be `null`** — render safely.
- **Empty result is valid:** `products: []` with `totalItems: 0`. Show an empty/placeholder state, not an error.
- The two feeds may legitimately return **fewer than 20** items (small catalog) — that's expected.
- Product shape is the **same** as `get-all-products`; reuse the existing product card and type.
- A sale item has `isSale: true`, `finalPrice === salePrice`, and `discount`/`discountPercentage > 0` — use these to render the price strike‑through and discount badge.

---

## 7. Frontend wiring tasks

1. Add two API client methods:
   - `getHomeProducts()` → `GET /public/product/home-products`
   - `getHomeSaleProducts()` → `GET /public/product/home-sale-products`
   Both return `data` = `{ products, currentPage, totalItems, totalPages }`.
2. On the **home page**, render two sections (reuse the existing product card/grid):
   - A "New / Featured" section fed by `getHomeProducts()`.
   - A "Sale / Offers" section fed by `getHomeSaleProducts()`.
   (Use the app's existing section/labels and i18n; place them where the home layout expects.)
3. Render `products` **in the order received**.
4. For sale cards, show the original `price` struck through, the `finalPrice`/`salePrice` as the active price, and a discount badge from `discountPercentage`.
5. Handle empty/loading/error states with the app's existing patterns.
6. Reuse the existing product type; if it doesn't already include `discount` / `discountPercentage` / `finalPrice`, extend it per §4.

---

## 8. Acceptance Criteria

- [ ] Home page shows a regular feed and a sale feed from the two endpoints.
- [ ] Products render in the exact order returned (no client re‑sorting).
- [ ] Sale cards show original price, sale price, and discount badge.
- [ ] `subCategory: null` and `color: null` never crash a card.
- [ ] Empty result renders an empty state (not an error).
- [ ] The existing product card/type is reused; no `wholesalePrice` is referenced anywhere (it is not returned).
