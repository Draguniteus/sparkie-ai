"""
Rate limiting middleware for API protection.
"""
import time
from collections import defaultdict
from threading import Lock
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from app.config import settings


class RateLimiter:
    """Simple in-memory rate limiter."""
    
    def __init__(self, requests: int = 100, window: int = 60):
        self.requests = requests
        self.window = window
        self.hits = defaultdict(list)
        self.lock = Lock()
    
    def is_rate_limited(self, key: str) -> tuple[bool, int]:
        """Check if a key is rate limited."""
        now = time.time()
        window_start = now - self.window
        
        with self.lock:
            self.hits[key] = [t for t in self.hits[key] if t > window_start]
            
            if len(self.hits[key]) >= self.requests:
                return True, 0
            
            self.hits[key].append(now)
            return False, self.requests - len(self.hits[key])
    
    def get_reset_time(self, key: str) -> int:
        """Get seconds until rate limit resets."""
        if key not in self.hits or len(self.hits[key]) == 0:
            return 0
        
        oldest = min(self.hits[key])
        return int(oldest + self.window - time.time())


_rate_limiter: RateLimiter = None


def get_rate_limiter() -> RateLimiter:
    """Get or create the global rate limiter."""
    global _rate_limiter
    if _rate_limiter is None:
        _rate_limiter = RateLimiter(
            requests=settings.rate_limit_requests,
            window=settings.rate_limit_window
        )
    return _rate_limiter
