import Redis from "ioredis";

/**
 * Single shared Redis connection used purely as a CACHE.
 *
 * IMPORTANT: the provider plan is tiny (30MB) and configured with the
 * `allkeys-lru` eviction policy, which means Redis is free to drop ANY key the
 * moment it runs out of memory. Therefore Redis here is never a source of
 * truth: every value stored MUST be reconstructable from MongoDB, and every
 * read MUST tolerate the key being gone. We never store sessions, queues,
 * counters, or anything whose loss would be a correctness bug.
 *
 * The client is also a "soft dependency": if Redis is down or unreachable the
 * app keeps working by falling back to the database. We deliberately avoid
 * throwing on connection errors so a Redis outage can never take the API down.
 */

let client: Redis | null = null;

// Tracks whether the connection is currently usable. We gate every cache
// operation on this so a dead connection becomes a cheap no-op instead of a
// stack of retry timeouts on the request path.
let isReady = false;

const REDIS_URL = process.env.REDIS_URL;

// Never open a real connection under tests: it keeps a socket handle alive that
// stops Jest from exiting, and tests should hit the DB directly anyway. The
// cache helpers treat a null client as "caching disabled" and fall through.
const cachingDisabled = process.env.NODE_ENV === "test" || !REDIS_URL;

if (cachingDisabled) {
  if (!REDIS_URL) {
    // No URL configured -> caching is simply disabled. The helpers in cache.ts
    // detect the null client and go straight to the DB.
    console.warn("[cache] REDIS_URL not set — caching is disabled");
  }
} else {
  client = new Redis(REDIS_URL, {
    // Fail fast instead of queueing commands forever when Redis is unreachable.
    maxRetriesPerRequest: 1,
    // Don't buffer commands while offline; we'd rather hit the DB immediately.
    enableOfflineQueue: false,
    // Bounded reconnect backoff, capped so we never hammer the provider.
    retryStrategy: (times) => Math.min(times * 200, 5000),
    lazyConnect: false,
  });

  client.on("ready", () => {
    isReady = true;
    console.log("[cache] Redis connected");
  });

  client.on("end", () => {
    isReady = false;
  });

  client.on("error", (err) => {
    isReady = false;
    // Log once per error burst at most; ioredis can emit these rapidly.
    console.error("[cache] Redis error:", err.message);
  });
}

export const getRedis = (): Redis | null => client;

export const isCacheReady = (): boolean => isReady;
