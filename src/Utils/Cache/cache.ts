import { getRedis, isCacheReady } from "./redisClient";

/**
 * Cache-aside helpers built on top of the shared Redis client.
 *
 * Design rules (see redisClient.ts for the why):
 *  - Every helper is a SOFT operation: if Redis is unavailable or errors, we
 *    silently fall back to the data source. A cache problem must never surface
 *    as an API error.
 *  - Every cached key carries a TTL. Even with `allkeys-lru` eviction, the TTL
 *    is our guard against serving stale data after writes we forgot to bust.
 *  - Keys are namespaced (e.g. `products:home:sale`) so related entries can be
 *    invalidated together via pattern matching.
 */

// Default time-to-live for cached entries, in seconds. Chosen short on purpose
// because writes (create/update/delete) explicitly bust the relevant keys, so
// the TTL is only a safety net for anything an invalidation path misses.
const DEFAULT_TTL_SECONDS = 300; // 5 minutes

/**
 * Read-through cache. Returns the cached value if present, otherwise runs the
 * loader, stores its result under `key` with a TTL, and returns it.
 *
 * If Redis is down at any point we just run the loader — the caller gets fresh
 * data and never sees a cache error.
 */
export const getOrSet = async <T>(
  key: string,
  loader: () => Promise<T>,
  ttlSeconds: number = DEFAULT_TTL_SECONDS
): Promise<T> => {
  const redis = getRedis();

  if (redis && isCacheReady()) {
    try {
      const cached = await redis.get(key);
      if (cached !== null) {
        return JSON.parse(cached) as T;
      }
    } catch (err) {
      // Read failure -> fall through to the loader.
      console.error(`[cache] get failed for "${key}":`, (err as Error).message);
    }
  }

  const fresh = await loader();

  if (redis && isCacheReady()) {
    try {
      // Never cache empty/nullish results — caching a "miss" would mask a
      // freshly-created resource until the TTL expires.
      if (fresh !== null && fresh !== undefined) {
        await redis.set(key, JSON.stringify(fresh), "EX", ttlSeconds);
      }
    } catch (err) {
      console.error(`[cache] set failed for "${key}":`, (err as Error).message);
    }
  }

  return fresh;
};

/** Delete one or more exact keys. No-op when caching is unavailable. */
export const invalidateKeys = async (...keys: string[]): Promise<void> => {
  const redis = getRedis();
  if (!redis || !isCacheReady() || keys.length === 0) return;
  try {
    await redis.del(...keys);
  } catch (err) {
    console.error(`[cache] del failed:`, (err as Error).message);
  }
};

/**
 * Delete every key matching a glob pattern (e.g. `products:*`).
 *
 * Uses SCAN rather than KEYS so we never block the Redis event loop on a large
 * keyspace. Still cheap here because our keyspace is small by design.
 */
export const invalidatePattern = async (pattern: string): Promise<void> => {
  const redis = getRedis();
  if (!redis || !isCacheReady()) return;
  try {
    let cursor = "0";
    do {
      const [next, found] = await redis.scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        100
      );
      cursor = next;
      if (found.length > 0) {
        await redis.del(...found);
      }
    } while (cursor !== "0");
  } catch (err) {
    console.error(
      `[cache] pattern invalidation failed for "${pattern}":`,
      (err as Error).message
    );
  }
};

/**
 * Centralised cache-key registry. Keeping every key in one place makes it easy
 * to see what is cached and to bust the right things on writes.
 */
export const CacheKeys = {
  // Diversified home feeds (one key each; the query takes no per-user params).
  homeProducts: "products:home:regular",
  homeSaleProducts: "products:home:sale",
  // Single product detail page (public shape, no per-user wishlist state).
  productById: (id: string) => `product:${id}`,
  // Public filtered product listing. The key is derived deterministically from
  // the filter set so the same filters always map to the same key regardless of
  // query-string order. Short TTL + allkeys-lru keep rarely-used filter combos
  // from lingering in the tiny 30MB budget.
  productList: (params: Record<string, unknown>) =>
    `products:list:${serializeParams(params)}`,
  // Glob that matches EVERY product-related key (home feeds, by-id, and
  // listings), for a single blunt invalidation on any product write.
  productsPattern: "product*",

  // Active offers — shown on first paint of the storefront.
  offersActive: "offers:active",
  offersAll: "offers:all",
  offersPattern: "offers*",

  // Top-level categories (storefront navigation).
  categoriesAll: "categories:all",
  categoriesPattern: "categories*",

  // Sub-categories (public, non-deleted list).
  subCategoriesAll: "subcategories:all",
  subCategoriesPattern: "subcategories*",

  // Homepage banners / hero slider.
  sliderAll: "slider:all",
  sliderPattern: "slider*",

  // Category icons (SVG set used in navigation).
  categoryIconsActive: "category-icons:active",
  categoryIconsAll: "category-icons:all",
  categoryIconsPattern: "category-icons*",

  // Product colors (also embedded in product variant responses).
  colorsAll: "colors:all",
  colorsPattern: "colors*",

  // Size groups + size categories.
  sizeGroupsAll: "sizes:groups",
  sizeCategoriesAll: "sizes:categories",
  sizesPattern: "sizes*",

  // Shipping methods.
  shippingAll: "shipping:all",
  shippingPattern: "shipping*",

  // Storefront social reviews.
  socialReviewsAll: "social-reviews:all",
  socialReviewsPattern: "social-reviews*",
} as const;

/**
 * Build a stable, compact string from a filter object: undefined/null/empty
 * values are dropped and keys are sorted, so `{category:'x', page:1}` and
 * `{page:1, category:'x'}` produce the identical cache key.
 */
const serializeParams = (params: Record<string, unknown>): string =>
  Object.keys(params)
    .sort()
    .map((k) => [k, params[k]] as const)
    .filter(([, v]) => v !== undefined && v !== null && v !== "" && v !== false)
    .map(([k, v]) => `${k}=${v}`)
    .join("&") || "all";
