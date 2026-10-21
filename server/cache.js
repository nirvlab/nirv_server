// High-performance in-memory cache for ultra-low latency API responses
const memoryCache = new Map();

function getCache(key) {
  const item = memoryCache.get(key);
  if (!item) return null;
  if (Date.now() > item.expires) {
    memoryCache.delete(key);
    return null;
  }
  return item.data;
}

function setCache(key, data, ttlMs = 120000) { // 2 minutes default TTL
  memoryCache.set(key, { data, expires: Date.now() + ttlMs });
}

function clearCache() {
  memoryCache.clear();
}

module.exports = {
  getCache,
  setCache,
  clearCache
};
