from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from datetime import timedelta
from models import User, UserCreate, Token, UserResponse
from auth import authenticate_user, create_access_token, get_password_hash, get_current_active_user
from database import get_database
from config import settings
import logging

logger = logging.getLogger(__name__)
router = APIRouter()
security = HTTPBearer()

@router.post("/register", response_model=dict)
async def register(user: UserCreate):
    """Register a new user."""
    db = get_database()
    
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    user_dict = user.dict()
    user_dict.pop("password")
    user_dict["hashed_password"] = hashed_password
    user_dict["is_active"] = True
    
    result = await db.users.insert_one(user_dict)
    
    if result.inserted_id:
        logger.info(f"User registered successfully: {user.email}")
        return {"message": "User registered successfully", "user_id": str(result.inserted_id)}
    
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to register user"
    )

@router.post("/login", response_model=Token)
async def login(email: str, password: str):
    """Login user and return access token."""
    user = await authenticate_user(email, password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    logger.info(f"User logged in: {user.email}")
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """Get current user information."""
    return current_user

@router.put("/me", response_model=dict)
async def update_current_user(
    user_update: dict,
    current_user: User = Depends(get_current_active_user)
):
    """Update current user information."""
    db = get_database()
    
    # Remove sensitive fields
    if "password" in user_update:
        user_update["hashed_password"] = get_password_hash(user_update.pop("password"))
    
    # Update user
    result = await db.users.update_one(
        {"_id": current_user.id},
        {"$set": user_update}
    )
    
    if result.modified_count:
        logger.info(f"User updated: {current_user.email}")
        return {"message": "User updated successfully"}
    
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Failed to update user"
    )

@router.post("/logout")
async def logout(current_user: User = Depends(get_current_active_user)):
    """Logout user (client-side token removal)."""
    logger.info(f"User logged out: {current_user.email}")
    return {"message": "Successfully logged out"}
