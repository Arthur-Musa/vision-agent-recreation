// Simple rate limiter for API calls
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private timeWindow: number; // in milliseconds

  constructor(maxRequests: number = 10, timeWindow: number = 60000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
  }

  canMakeRequest(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Filter out old requests
    const recentRequests = requests.filter(time => now - time < this.timeWindow);
    
    if (recentRequests.length >= this.maxRequests) {
      return false;
    }

    // Update requests array
    recentRequests.push(now);
    this.requests.set(key, recentRequests);
    
    return true;
  }

  getRemainingRequests(key: string): number {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    const recentRequests = requests.filter(time => now - time < this.timeWindow);
    
    return Math.max(0, this.maxRequests - recentRequests.length);
  }

  getTimeUntilReset(key: string): number {
    const requests = this.requests.get(key) || [];
    if (requests.length === 0) return 0;
    
    const oldestRequest = Math.min(...requests);
    const timeUntilReset = this.timeWindow - (Date.now() - oldestRequest);
    
    return Math.max(0, timeUntilReset);
  }

  reset(key: string): void {
    this.requests.delete(key);
  }
}

// Global rate limiter instances
export const apiRateLimiter = new RateLimiter(20, 60000); // 20 requests per minute
export const uploadRateLimiter = new RateLimiter(5, 60000); // 5 uploads per minute

export { RateLimiter };