#!/usr/bin/env python3
"""
Placement Readiness System Backend
Run this script to start the FastAPI server
"""

import uvicorn
from main import app
from config import settings

if __name__ == "__main__":
    print(f"🚀 Starting {settings.PROJECT_NAME} Backend Server")
    print(f"📍 Environment: {settings.ENVIRONMENT}")
    print(f"🌐 API Documentation: http://localhost:8000/docs")
    print(f"🔍 Health Check: http://localhost:8000/health")
    print(f"📊 API Base URL: http://localhost:8000{settings.API_V1_STR}")
    print("-" * 50)
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info"
    )
