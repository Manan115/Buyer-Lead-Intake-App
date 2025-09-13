const requestCounts: Record<string, { count: number; lastReset: number }> = {};
const WINDOW_MS = 60 * 1000; // 1 min
const MAX_REQUESTS = 5;

export function checkRateLimit(userId: string) {
  const now = Date.now();
  const data = requestCounts[userId] || { count: 0, lastReset: now };

  if (now - data.lastReset > WINDOW_MS) {
    requestCounts[userId] = { count: 1, lastReset: now };
    return true;
  }

  if (data.count >= MAX_REQUESTS) {
    return false;
  }

  data.count++;
  requestCounts[userId] = data;
  return true;
}
