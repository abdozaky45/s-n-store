/**
 * Cache INVALIDATION WIRING tests.
 *
 * cache.spec.ts proves the helpers work in isolation. This suite proves the
 * actual contract every write path in the app relies on: each entity's
 * invalidation pattern (the glob a service runs on create/update/delete) busts
 * EXACTLY that entity's cached keys — and never silently wipes an unrelated
 * namespace.
 *
 * The map below mirrors, key-for-key, what every service caches via getOrSet
 * and the pattern each service hands to invalidatePattern on a write. If a key
 * ever stops matching its pattern (a typo, a renamed namespace), the storefront
 * would serve stale data after an edit/delete — the exact bug we're guarding
 * against. These tests fail loudly the moment that drifts.
 */

import { CacheKeys } from "../../src/Utils/Cache/cache";

// Reuse the same anchored-glob matching the in-memory FakeRedis (and real Redis
// SCAN MATCH) use, so the assertions reflect production invalidation behaviour.
const matches = (pattern: string, key: string): boolean => {
  const re = new RegExp(
    "^" +
      pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*") +
      "$"
  );
  return re.test(key);
};

// Every cached key produced by getOrSet across the whole app, grouped by the
// entity whose writes must invalidate it. Keep this in lockstep with the
// getOrSet calls in the services.
const sampleProductId = "65b0c1d2e3f4a5b6c7d8e9f0";
const ENTITIES: Record<
  string,
  { pattern: string; keys: string[] }
> = {
  product: {
    pattern: CacheKeys.productsPattern,
    keys: [
      CacheKeys.homeProducts,
      CacheKeys.homeSaleProducts,
      CacheKeys.productById(sampleProductId),
      CacheKeys.productList({ category: "x", page: 1 }),
      CacheKeys.productList({}),
    ],
  },
  category: {
    pattern: CacheKeys.categoriesPattern,
    keys: [CacheKeys.categoriesAll],
  },
  subCategory: {
    pattern: CacheKeys.subCategoriesPattern,
    keys: [CacheKeys.subCategoriesAll],
  },
  size: {
    pattern: CacheKeys.sizesPattern,
    keys: [CacheKeys.sizeGroupsAll, CacheKeys.sizeCategoriesAll],
  },
  color: {
    pattern: CacheKeys.colorsPattern,
    keys: [CacheKeys.colorsAll],
  },
  categoryIcon: {
    pattern: CacheKeys.categoryIconsPattern,
    keys: [CacheKeys.categoryIconsActive, CacheKeys.categoryIconsAll],
  },
  slider: {
    pattern: CacheKeys.sliderPattern,
    keys: [CacheKeys.sliderAll],
  },
  shipping: {
    pattern: CacheKeys.shippingPattern,
    keys: [CacheKeys.shippingAll],
  },
  socialReview: {
    pattern: CacheKeys.socialReviewsPattern,
    keys: [CacheKeys.socialReviewsAll],
  },
  offers: {
    pattern: CacheKeys.offersPattern,
    keys: [CacheKeys.offersActive, CacheKeys.offersAll],
  },
};

const allKeys = Object.values(ENTITIES).flatMap((e) => e.keys);

describe("each entity's invalidation pattern busts its OWN keys", () => {
  for (const [name, { pattern, keys }] of Object.entries(ENTITIES)) {
    it(`${name}: pattern "${pattern}" matches every cached ${name} key`, () => {
      for (const key of keys) {
        expect(matches(pattern, key)).toBe(true);
      }
    });
  }
});

describe("invalidation patterns are isolated (no cross-namespace wipe)", () => {
  for (const [name, { pattern, keys }] of Object.entries(ENTITIES)) {
    it(`${name}: pattern "${pattern}" never matches another entity's keys`, () => {
      const foreignKeys = allKeys.filter((k) => !keys.includes(k));
      for (const key of foreignKeys) {
        expect(matches(pattern, key)).toBe(false);
      }
    });
  }
});

describe("regression guards for the trickiest overlaps", () => {
  // "product*" must catch the by-id key (singular) AND the list/home keys
  // (plural) — they share the "product" prefix but differ after it.
  it("productsPattern catches both singular product:<id> and plural products:* keys", () => {
    expect(matches(CacheKeys.productsPattern, CacheKeys.productById("abc"))).toBe(true);
    expect(matches(CacheKeys.productsPattern, CacheKeys.homeProducts)).toBe(true);
    expect(matches(CacheKeys.productsPattern, CacheKeys.productList({ a: 1 }))).toBe(true);
  });

  // "categories*" must NOT swallow "category-icons:*": both begin with
  // "categ", so a careless pattern would wipe icons on every category edit.
  it("categoriesPattern does not match category-icons keys", () => {
    expect(matches(CacheKeys.categoriesPattern, CacheKeys.categoryIconsAll)).toBe(false);
    expect(matches(CacheKeys.categoriesPattern, CacheKeys.categoryIconsActive)).toBe(false);
  });

  // "categories*" vs "subcategories*": the sub list must survive a top-level
  // category-only bust (services bust both explicitly when they need to).
  it("categoriesPattern does not match subcategories keys", () => {
    expect(matches(CacheKeys.categoriesPattern, CacheKeys.subCategoriesAll)).toBe(false);
  });

  // "sizes*" covers BOTH size groups and size categories (مقاس) in one bust.
  it("sizesPattern catches both size groups and size categories", () => {
    expect(matches(CacheKeys.sizesPattern, CacheKeys.sizeGroupsAll)).toBe(true);
    expect(matches(CacheKeys.sizesPattern, CacheKeys.sizeCategoriesAll)).toBe(true);
  });
});
