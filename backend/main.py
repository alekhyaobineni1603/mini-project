from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from config import settings
from database import connect_to_mongo, disconnect_from_mongo
from auth import get_current_active_user
from routers import auth, students, readiness, skills, resume, interview, roadmap, company, risk, admin

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await disconnect_from_mongo()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(students.router, prefix="/api/v1/students", tags=["students"])
app.include_router(readiness.router, prefix="/api/v1/readiness", tags=["readiness"])
app.include_router(skills.router, prefix="/api/v1/skills", tags=["skills"])
app.include_router(resume.router, prefix="/api/v1/resume", tags=["resume"])
app.include_router(interview.router, prefix="/api/v1/interview", tags=["interview"])
app.include_router(roadmap.router, prefix="/api/v1/roadmap", tags=["roadmap"])
app.include_router(company.router, prefix="/api/v1/company", tags=["company"])
app.include_router(risk.router, prefix="/api/v1/risk", tags=["risk"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["admin Dashboard"])

@app.get("/")
async def root():
    return {"message": "Placement Readiness System API", "version": settings.VERSION}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": "2024-01-01T00:00:00Z"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=settings.DEBUG)
