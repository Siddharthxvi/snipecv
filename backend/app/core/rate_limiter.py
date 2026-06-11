import time
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(
        self, 
        app, 
        requests_limit: int = 20, 
        window_seconds: int = 60
    ):
        """
        In-memory rate limiter using a sliding window per IP address.
        :param requests_limit: Max number of requests allowed in the window.
        :param window_seconds: The duration of the sliding window in seconds.
        """
        super().__init__(app)
        self.requests_limit = requests_limit
        self.window_seconds = window_seconds
        # In-memory store: { ip_address: [timestamp1, timestamp2, ...] }
        self.client_records: dict[str, list[float]] = {}

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        # Get client IP address
        client_ip = request.client.host if request.client else "unknown"
        
        # Bypass rate limit for docs, openapi, or root index
        path = request.url.path
        if path in ["/", "/docs", "/redoc", "/openapi.json"]:
            return await call_next(request)

        current_time = time.time()
        
        # Initialize client record if not present
        if client_ip not in self.client_records:
            self.client_records[client_ip] = []

        # Filter out timestamps older than the window
        timestamps = self.client_records[client_ip]
        self.client_records[client_ip] = [
            t for t in timestamps if current_time - t < self.window_seconds
        ]

        # Check limit
        if len(self.client_records[client_ip]) >= self.requests_limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded. Too many requests. Please wait a minute and try again."
            )

        # Record this request's timestamp
        self.client_records[client_ip].append(current_time)
        
        # Proceed with request
        response = await call_next(request)
        return response
