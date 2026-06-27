/**
 * Unit tests for the Redis cache helpers (getOrSet / invalidateKeys /
 * invalidatePattern). The real redisClient is replaced with an in-memory fake
 * so we can assert the EXACT behaviour the production code relies on:
 *
 *  1. Reads are served from cache; the DB loader runs only on a miss.
 *  2. After an update/delete invalidation, the next read rebuilds from the DB
 *     (i.e. NO stale data survives a write) — the core guarantee we promised.
 *  3. Any Redis failure (including an out-of-memory write rejection) is
 *     swallowed and the caller transparently falls back to the DB, so a full /
 *     down Redis can never break the app.
 */

// --- In-memory fake standing in for ioredis ----------------------------------
type Stored = { value: string; expireAt: number | null };

class FakeRedis {
  store = new Map<string, Stored>();
  // Toggles to simulate a misbehaving / full Redis on a per-test basis.
  failGet = false;
  failSet = false;

  async get(key: string): Promise<string | null> {
    if (this.failGet) throw new Error("simulated GET failure");
    const e = this.store.get(key);
    if (!e) return null;
    if (e.expireAt !== null && e.expireAt < Date.now()) {
      this.store.delete(key);
      return null;
    }
    return e.value;
  }

  async set(key: string, value: string, _ex: "EX", ttl: number): Promise<"OK"> {
    // Mirrors Redis returning an OOM error on write (e.g. noeviction + full).
    if (this.failSet) throw new Error("OOM command not allowed when used memory > 'maxmemory'");
    this.store.set(key, { value, expireAt: Date.now() + ttl * 1000 });
    return "OK";
  }

  async del(...keys: string[]): Promise<number> {
    let n = 0;
    for (const k of keys) if (this.store.delete(k)) n++;
    return n;
  }

  // Minimal SCAN: returns everything matching the glob in a single pass.
  async scan(
    _cursor: string,
    _match: "MATCH",
    pattern: string,
    _count: "COUNT",
    _n: number
  ): Promise<[string, string[]]> {
    const re = new RegExp(
      "^" +
        pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*") +
        "$"
    );
    const found = [...this.store.keys()].filter((k) => re.test(k));
    return ["0", found];
  }
}

// `mock`-prefixed so babel-plugin-jest-hoist allows the factory to reference it.
const mockState: { fake: FakeRedis; ready: boolean } = {
  fake: new FakeRedis(),
  ready: true,
};

jest.mock("../../src/Utils/Cache/redisClient", () => ({
  getRedis: () => (mockState.ready ? mockState.fake : null),
  isCacheReady: () => mockState.ready,
}));

import {
  getOrSet,
  invalidateKeys,
  invalidatePattern,
  CacheKeys,
} from "../../src/Utils/Cache/cache";

beforeEach(() => {
  mockState.fake = new FakeRedis();
  mockState.ready = true;
  // The resilience tests deliberately trigger Redis failures; cache.ts logs
  // those via console.error. Silence it so expected noise doesn't clutter CI
  // output (real failures still surface as failed assertions).
  jest.spyOn(console, "error").mockImplementation(() => {});
});

describe("getOrSet (read-through cache)", () => {
  it("runs the loader on a miss and stores the result", async () => {
    const loader = jest.fn().mockResolvedValue({ hello: "world" });

    const result = await getOrSet("k1", loader, 60);

    expect(result).toEqual({ hello: "world" });
    expect(loader).toHaveBeenCalledTimes(1);
    expect(mockState.fake.store.has("k1")).toBe(true);
  });

  it("serves a hit from cache WITHOUT calling the loader", async () => {
    const loader = jest.fn().mockResolvedValue({ n: 1 });

    await getOrSet("k2", loader, 60); // populate
    const second = await getOrSet("k2", loader, 60); // should hit

    expect(second).toEqual({ n: 1 });
    expect(loader).toHaveBeenCalledTimes(1); // not called again
  });

  it("never caches null/undefined results (so a fresh resource isn't masked)", async () => {
    await getOrSet("empty", async () => null, 60);
    expect(mockState.fake.store.has("empty")).toBe(false);
  });

  it("honours the TTL passed in", async () => {
    await getOrSet("ttlkey", async () => "v", 123);
    const entry = mockState.fake.store.get("ttlkey")!;
    const ttlMs = entry.expireAt! - Date.now();
    expect(ttlMs).toBeGreaterThan(120_000);
    expect(ttlMs).toBeLessThanOrEqual(123_000);
  });
});

describe("invalidation on update / delete", () => {
  it("invalidateKeys removes exactly the listed keys", async () => {
    await getOrSet("a", async () => "1", 60);
    await getOrSet("b", async () => "2", 60);

    await invalidateKeys("a");

    expect(mockState.fake.store.has("a")).toBe(false);
    expect(mockState.fake.store.has("b")).toBe(true);
  });

  it("invalidatePattern removes only matching keys", async () => {
    await getOrSet(CacheKeys.homeProducts, async () => "h", 60);
    await getOrSet(CacheKeys.productById("abc"), async () => "p", 60);
    await getOrSet(CacheKeys.categoriesAll, async () => "c", 60);

    await invalidatePattern(CacheKeys.productsPattern);

    expect(mockState.fake.store.has(CacheKeys.homeProducts)).toBe(false);
    expect(mockState.fake.store.has(CacheKeys.productById("abc"))).toBe(false);
    // Unrelated namespace must survive.
    expect(mockState.fake.store.has(CacheKeys.categoriesAll)).toBe(true);
  });

  it("after an update busts the key, the next read rebuilds FRESH (no stale data)", async () => {
    let dbValue = "old";
    const loader = () => Promise.resolve(dbValue);

    // First read caches "old".
    expect(await getOrSet("prod:1", loader, 60)).toBe("old");

    // Simulate an admin update: DB changes, then the cache is invalidated.
    dbValue = "new";
    await invalidateKeys("prod:1");

    // The very next read must reflect the new DB value immediately.
    expect(await getOrSet("prod:1", loader, 60)).toBe("new");
  });
});

describe("resilience when Redis is unavailable or full", () => {
  it("falls back to the loader when caching is not ready", async () => {
    mockState.ready = false;
    const loader = jest.fn().mockResolvedValue("from-db");

    const result = await getOrSet("x", loader, 60);

    expect(result).toBe("from-db");
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it("still returns fresh data when a GET throws", async () => {
    mockState.fake.failGet = true;
    const result = await getOrSet("y", async () => "db-value", 60);
    expect(result).toBe("db-value");
  });

  it("still returns fresh data when a SET is rejected (e.g. OOM on a full Redis)", async () => {
    mockState.fake.failSet = true;
    const loader = jest.fn().mockResolvedValue("db-value");

    // Must not throw, and must return the loader's value.
    await expect(getOrSet("z", loader, 60)).resolves.toBe("db-value");
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it("invalidation is a safe no-op when caching is not ready", async () => {
    mockState.ready = false;
    await expect(invalidateKeys("whatever")).resolves.toBeUndefined();
    await expect(invalidatePattern("whatever*")).resolves.toBeUndefined();
  });
});
