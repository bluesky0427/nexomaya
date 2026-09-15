/**
 * Minimal fixed-window rate limiter kept in server memory.
 *
 * This is best-effort: each serverless instance keeps its own counters, so a
 * determined attacker spread across many instances can exceed the limit. It
 * still stops simple scripted abuse of the contact form. For a hard global
 * limit, swap this for a shared store such as Upstash Redis (@upstash/ratelimit).
 */

type Window = { count: number; resetAt: number };

const MAX_TRACKED_KEYS = 10_000;

export function createRateLimiter({
  limit,
  windowMs,
}: {
  limit: number;
  windowMs: number;
}) {
  const windows = new Map<string, Window>();

  function prune(now: number) {
    windows.forEach((w, key) => {
      if (w.resetAt <= now) windows.delete(key);
    });
  }

  /** Records one hit for `key`. Returns false once the limit is exceeded. */
  return function hit(key: string): boolean {
    const now = Date.now();
    if (windows.size >= MAX_TRACKED_KEYS) prune(now);

    const current = windows.get(key);
    if (!current || current.resetAt <= now) {
      windows.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }

    current.count += 1;
    return current.count <= limit;
  };
}
