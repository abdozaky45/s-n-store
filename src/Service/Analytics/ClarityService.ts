import dotenv from "dotenv";
import { ApiError } from "../../Utils/ErrorHandling";
dotenv.config();

/**
 * Microsoft Clarity "Data Export" API integration.
 *
 * Endpoint: GET https://www.clarity.ms/export-data/api/v1/project-live-insights
 * Auth:     Authorization: Bearer <CLARITY_API_TOKEN>
 *
 * HARD CONSTRAINTS from Clarity (why this file is built the way it is):
 *  - The API only returns data for the last 1-3 days (`numOfDays`, max 3).
 *  - It is rate limited to **10 requests per project per day**. Blowing that
 *    budget locks us out for the rest of the day, so we MUST NOT call it on
 *    every incoming request. Results are cached for several hours and every
 *    live call is counted against a per-day budget that force-refresh respects.
 *
 * WHY IN-MEMORY (not the shared Redis cache): the project's Redis is a tiny
 * 30MB `allkeys-lru` cache — it may evict any key at any time and may be
 * disabled entirely (no REDIS_URL). redisClient.ts explicitly forbids storing
 * counters there because losing one is a correctness bug. The daily-call
 * counter here is exactly such a counter: if it were dropped we could silently
 * exceed Clarity's 10/day limit. The API runs as a single Elastic Beanstalk
 * instance, so a module-level in-memory cache + counter is both correct and
 * simple. If this ever scales horizontally, move the counter to a durable
 * store (e.g. a Redis INCR that is never evicted).
 */

const CLARITY_ENDPOINT =
  "https://www.clarity.ms/export-data/api/v1/project-live-insights";

// Clarity caps numOfDays at 3; we always ask for the widest window available.
const NUM_OF_DAYS = 3;

// How long a cached payload is considered fresh. Several hours keeps us well
// under the 10/day budget (a single dimension refreshes at most ~4x/day here).
const CACHE_TTL_MS = Number(process.env.CLARITY_CACHE_TTL_MS) || 6 * 60 * 60 * 1000;

// Hard ceiling on live calls per UTC day, matching Clarity's documented limit.
const MAX_LIVE_CALLS_PER_DAY = Number(process.env.CLARITY_MAX_CALLS_PER_DAY) || 10;

// Abort a hung request rather than holding the response open indefinitely.
const REQUEST_TIMEOUT_MS = 15_000;

// Dimensions Clarity accepts for a breakdown (dimension1). Validated so a bad
// query param can't be smuggled straight into the upstream request.
export const CLARITY_DIMENSIONS = [
  "Browser",
  "Device",
  "Country",
  "OS",
  "Source",
  "Medium",
  "Campaign",
  "Channel",
  "URL",
  "Referrer",
] as const;

export type ClarityDimension = (typeof CLARITY_DIMENSIONS)[number];

/**
 * One row inside a metric's `information` array. Known numeric-ish fields are
 * declared for convenience, but Clarity returns numbers as strings and adds a
 * dynamic key named after the requested dimension (e.g. `Browser: "Chrome"`),
 * so we keep an open index signature. Shape is intentionally permissive because
 * Clarity's public docs lag the live response.
 */
export interface ClarityMetricInfo {
  sessionsCount?: string;
  sessionsWithMetricPercentage?: number;
  sessionsWithoutMetricPercentage?: number;
  pagesViews?: string;
  subTotal?: string;
  totalSessionCount?: string;
  totalBotSessionCount?: string;
  distinctUserCount?: string;
  pagesPerSessionPercentage?: number;
  [key: string]: string | number | undefined;
}

export interface ClarityMetric {
  metricName: string;
  information: ClarityMetricInfo[];
}

/** The live-insights endpoint returns a bare array of metric objects. */
export type ClarityInsights = ClarityMetric[];

export interface ClarityResult {
  data: ClarityInsights;
  /** ISO timestamp of when `data` was actually fetched from Clarity. */
  fetchedAt: string;
  /** True when served from cache rather than a fresh live call. */
  fromCache: boolean;
  /**
   * True when we wanted fresh data but had to serve cache instead (rate limit
   * hit locally or a 429 upstream). Signals the caller the data is not current.
   */
  stale: boolean;
  /** Live calls already spent today (out of MAX_LIVE_CALLS_PER_DAY). */
  liveCallsToday: number;
  /** Human-readable explanation when something non-fatal happened. */
  note?: string;
}

// ---------------------------------------------------------------------------
// In-memory state (module singletons)
// ---------------------------------------------------------------------------

interface CacheEntry {
  data: ClarityInsights;
  fetchedAt: number; // epoch ms
}

// One cache entry per dimension breakdown ("__base__" for no dimension).
const cache = new Map<string, CacheEntry>();

// De-dupe concurrent live fetches for the same key so two simultaneous
// requests can't each spend a call from the daily budget.
const inflight = new Map<string, Promise<ClarityInsights>>();

// Per-UTC-day counter of live calls actually issued to Clarity.
let callCounter = { day: currentUtcDay(), count: 0 };

function currentUtcDay(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
}

/** Roll the counter over at the UTC day boundary. */
function refreshCounterWindow(): void {
  const today = currentUtcDay();
  if (callCounter.day !== today) {
    callCounter = { day: today, count: 0 };
  }
}

function cacheKey(dimension1?: ClarityDimension): string {
  return dimension1 ?? "__base__";
}

/** Exposed for observability/tests: how many live calls remain today. */
export function getRemainingLiveCalls(): number {
  refreshCounterWindow();
  return Math.max(0, MAX_LIVE_CALLS_PER_DAY - callCounter.count);
}

// ---------------------------------------------------------------------------
// Live fetch
// ---------------------------------------------------------------------------

/**
 * Issue the actual HTTP request to Clarity. Increments the daily counter for
 * every attempt (Clarity counts the request regardless of status). Throws an
 * ApiError with a meaningful statusCode on failure; the caller decides whether
 * to surface it or fall back to cache.
 */
async function fetchFromClarity(
  dimension1?: ClarityDimension
): Promise<ClarityInsights> {
  const token = process.env.CLARITY_API_TOKEN;
  if (!token) {
    // Configuration error — never counts against the daily budget.
    throw new ApiError(
      500,
      "CLARITY_API_TOKEN is not set. Add it to your .env before calling the Clarity insights endpoint."
    );
  }

  const url = new URL(CLARITY_ENDPOINT);
  url.searchParams.set("numOfDays", String(NUM_OF_DAYS));
  if (dimension1) url.searchParams.set("dimension1", dimension1);

  // Count the call the moment we commit to sending it.
  refreshCounterWindow();
  callCounter.count += 1;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      signal: controller.signal,
    });
  } catch (err) {
    const reason =
      (err as Error)?.name === "AbortError"
        ? `timed out after ${REQUEST_TIMEOUT_MS}ms`
        : (err as Error)?.message || String(err);
    console.error(`[clarity] network error: ${reason}`);
    throw new ApiError(502, `Failed to reach Clarity API: ${reason}`);
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 401) {
    console.error(
      "[clarity] 401 Unauthorized — CLARITY_API_TOKEN is invalid or expired. " +
        "Regenerate it in the Clarity dashboard (Settings → Data export) and update .env."
    );
    throw new ApiError(401, "Clarity API token is invalid or expired.");
  }

  if (response.status === 429) {
    console.warn(
      "[clarity] 429 Too Many Requests — daily Clarity rate limit reached upstream."
    );
    throw new ApiError(429, "Clarity API rate limit reached.");
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    console.error(
      `[clarity] unexpected ${response.status} response: ${body.slice(0, 500)}`
    );
    throw new ApiError(
      502,
      `Clarity API returned an unexpected status (${response.status}).`
    );
  }

  const json = await response.json().catch(() => null);
  if (!Array.isArray(json)) {
    console.error("[clarity] response was not the expected array of metrics.");
    throw new ApiError(502, "Clarity API returned an unexpected response shape.");
  }

  return json as ClarityInsights;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface GetClarityInsightsOptions {
  dimension1?: ClarityDimension;
  /** Bypass the cache and hit the live API — still bounded by the daily budget. */
  forceRefresh?: boolean;
}

/**
 * Return Clarity live-insights, served from the in-memory cache whenever
 * possible. Only calls the live API when the cache is stale (or force-refresh
 * is requested) AND the daily budget still has room. When we can't refresh, any
 * previously cached payload is returned marked `stale` rather than failing.
 */
export async function getClarityInsights(
  options: GetClarityInsightsOptions = {}
): Promise<ClarityResult> {
  const { dimension1, forceRefresh = false } = options;
  const key = cacheKey(dimension1);
  const cached = cache.get(key);
  const now = Date.now();

  const isFresh =
    cached !== undefined && now - cached.fetchedAt < CACHE_TTL_MS;

  // Serve fresh cache unless the caller explicitly asked to force-refresh.
  if (cached && isFresh && !forceRefresh) {
    return {
      data: cached.data,
      fetchedAt: new Date(cached.fetchedAt).toISOString(),
      fromCache: true,
      stale: false,
      liveCallsToday: callCounter.count,
    };
  }

  // If a live fetch for this key is already in flight, JOIN it rather than
  // starting another. This must come before the budget guard: the in-flight
  // request already spent (or will spend) exactly one call from the budget, so
  // a concurrent caller piggy-backing on it should neither spend again nor be
  // rejected as "over budget".
  const existing = inflight.get(key);
  if (existing) {
    const data = await existing;
    return {
      data,
      fetchedAt: new Date().toISOString(),
      fromCache: false,
      stale: false,
      liveCallsToday: callCounter.count,
    };
  }

  // No in-flight fetch — we're about to start one. Guard the daily budget.
  refreshCounterWindow();
  if (callCounter.count >= MAX_LIVE_CALLS_PER_DAY) {
    if (cached) {
      // Budget exhausted but we have something to serve — return it stale.
      return {
        data: cached.data,
        fetchedAt: new Date(cached.fetchedAt).toISOString(),
        fromCache: true,
        stale: true,
        liveCallsToday: callCounter.count,
        note: `Daily Clarity API limit (${MAX_LIVE_CALLS_PER_DAY}) reached — serving cached data.`,
      };
    }
    // Nothing cached and no budget left: hard fail so the caller sees a 429.
    throw new ApiError(
      429,
      `Daily Clarity API limit (${MAX_LIVE_CALLS_PER_DAY}) reached and no cached data is available yet.`
    );
  }

  try {
    const promise = fetchFromClarity(dimension1).finally(() =>
      inflight.delete(key)
    );
    inflight.set(key, promise);
    const data = await promise;

    cache.set(key, { data, fetchedAt: Date.now() });
    return {
      data,
      fetchedAt: new Date().toISOString(),
      fromCache: false,
      stale: false,
      liveCallsToday: callCounter.count,
    };
  } catch (err) {
    // Upstream rate limit: fall back to cache (marked stale) if we have it.
    const status = err instanceof ApiError ? err.statusCode : 500;
    if (status === 429 && cached) {
      return {
        data: cached.data,
        fetchedAt: new Date(cached.fetchedAt).toISOString(),
        fromCache: true,
        stale: true,
        liveCallsToday: callCounter.count,
        note: "Clarity API rate limit hit — serving cached data.",
      };
    }
    // Everything else (401, 5xx, network): propagate so the controller can
    // return a clear error. The app never crashes — asyncHandler catches it.
    throw err;
  }
}
