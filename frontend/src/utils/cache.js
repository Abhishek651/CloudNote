class CacheManager {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
  }

  set(key, data, ttl = 5 * 60 * 1000) {
    this.cache.set(key, { data, timestamp: Date.now() });
    
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }
    
    const timer = setTimeout(() => this.invalidate(key), ttl);
    this.timers.set(key, timer);
  }

  get(key) {
    return this.cache.get(key)?.data || null;
  }

  has(key) {
    return this.cache.has(key);
  }

  invalidate(key) {
    this.cache.delete(key);
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
  }

  invalidatePattern(pattern) {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.invalidate(key);
      }
    }
  }

  clear() {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.cache.clear();
    this.timers.clear();
  }
}

export const cacheManager = new CacheManager();
