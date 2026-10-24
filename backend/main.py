from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import feed, negotiations, deals, log, wakil, demo

app = FastAPI(
    title="SupplySwipe (Wakil) Backend API",
    description="FastAPI + Supabase backend powering autonomous F&B SME procurement negotiations.",
    version="1.0.0"
)

# Configure CORS so Next.js frontend and mobile devices can make requests seamlessly
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(feed.router)
app.include_router(negotiations.router)
app.include_router(deals.router)
app.include_router(log.router)
app.include_router(wakil.router)
app.include_router(demo.router)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "supplyswipe-fastapi",
        "supabase_connected": settings.has_supabase
    }

if __name__ == "__main__":
    import sys
    from pathlib import Path
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
