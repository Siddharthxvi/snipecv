from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import auth, upload, experiences, resume

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(upload.router, prefix=settings.API_V1_STR)
app.include_router(experiences.router, prefix=settings.API_V1_STR)
app.include_router(resume.router, prefix=settings.API_V1_STR)

# Register custom Rate Limiting middleware (e.g., limit to 20 requests per minute per IP)
from app.core.rate_limiter import RateLimitMiddleware
app.add_middleware(RateLimitMiddleware, requests_limit=15, window_seconds=60)

@app.get("/")
async def root():

    return {"message": "Welcome to SnipeCV AI Career Memory & Resume Optimization API"}

