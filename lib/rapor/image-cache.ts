/**
 * Image cache for PDF generation
 * Caches frequently used images to avoid re-downloading
 */

interface CacheEntry {
  data: string; // base64 data
  timestamp: number;
  size: number;
}

class ImageCache {
  private cache: Map<string, CacheEntry> = new Map();
  private maxSize: number = 50 * 1024 * 1024; // 50MB max cache size
  private maxAge: number = 30 * 60 * 1000; // 30 minutes max age
  private currentSize: number = 0;

  /**
   * Get image from cache
   */
  get(url: string): string | null {
    const entry = this.cache.get(url);
    
    if (!entry) {
      return null;
    }

    // Check if entry is expired
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.delete(url);
      return null;
    }

    return entry.data;
  }

  /**
   * Set image in cache
   */
  set(url: string, data: string): void {
    // Estimate size (base64 is ~1.37x original size)
    const size = Math.ceil((data.length * 3) / 4);

    // Remove old entry if exists
    if (this.cache.has(url)) {
      this.delete(url);
    }

    // Check if we need to evict entries
    while (this.currentSize + size > this.maxSize && this.cache.size > 0) {
      this.evictOldest();
    }

    // Add new entry
    this.cache.set(url, {
      data,
      timestamp: Date.now(),
      size,
    });
    this.currentSize += size;
  }

  /**
   * Delete image from cache
   */
  delete(url: string): void {
    const entry = this.cache.get(url);
    if (entry) {
      this.currentSize -= entry.size;
      this.cache.delete(url);
    }
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
    this.currentSize = 0;
  }

  /**
   * Evict oldest entry
   */
  private evictOldest(): void {
    let oldestUrl: string | null = null;
    let oldestTime = Date.now();

    for (const [url, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestUrl = url;
      }
    }

    if (oldestUrl) {
      this.delete(oldestUrl);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    entries: number;
    size: number;
    maxSize: number;
    hitRate: number;
  } {
    return {
      entries: this.cache.size,
      size: this.currentSize,
      maxSize: this.maxSize,
      hitRate: 0, // TODO: Track hits/misses
    };
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    const expiredUrls: string[] = [];

    for (const [url, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.maxAge) {
        expiredUrls.push(url);
      }
    }

    for (const url of expiredUrls) {
      this.delete(url);
    }
  }
}

// Global cache instance
export const imageCache = new ImageCache();

// Cleanup expired entries every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    imageCache.cleanup();
  }, 5 * 60 * 1000);
}
