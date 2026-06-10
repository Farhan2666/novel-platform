const store = new Map<string, { count: number; resetAt: number }>();

const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
let lastCleanup = Date.now();

/**
 * Remove expired entries from the rate limit store to prevent memory leaks.
 */
function cleanupStore() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, value] of Array.from(store.entries())) {
    if (value.resetAt <= now) {
      store.delete(key);
    }
  }
}

export function rateLimit(key: string, maxAttempts = 5, windowMs = 60000) {
  cleanupStore();
  const now = Date.now();
  const existing = store.get(key);

  if (existing && existing.resetAt > now) {
    if (existing.count >= maxAttempts) {
      const retryAfter = Math.ceil((existing.resetAt - now) / 1000);
      return { allowed: false, retryAfter };
    }
    store.set(key, { count: existing.count + 1, resetAt: existing.resetAt });
  } else {
    store.set(key, { count: 1, resetAt: now + windowMs });
  }

  return { allowed: true, retryAfter: 0 };
}

export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "");
}

export function sanitizeRichText(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son\w+\s*=\s*'[^']*'/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}
