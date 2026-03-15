from fastapi import APIRouter, Depends, HTTPException, status
from models import Student, StudentCreate, StudentUpdate, StudentResponse, User
from auth import get_current_active_user
from database import get_database
from typing import List
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/", response_model=dict)
async def create_student(
    student: StudentCreate,
    current_user: User = Depends(get_current_active_user)
):
    """Create a new student profile."""
    db = get_database()
    
    # Check if student already exists
    existing_student = await db.students.find_one({"student_id": student.student_id})
    if existing_student:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student ID already exists"
        )
    
    # Create student
    student_dict = student.dict()
    student_dict["readiness_score"] = 0.0
    student_dict["mock_interviews_count"] = 0
    
    result = await db.students.insert_one(student_dict)
    
    if result.inserted_id:
        logger.info(f"Student created: {student.student_id}")
        return {"message": "Student profile created successfully", "student_id": str(result.inserted_id)}
    
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to create student profile"
    )

@router.get("/me", response_model=Student)
async def get_my_student_profile(current_user: User = Depends(get_current_active_user)):
    """Get current user's student profile."""
    db = get_database()
    student = await db.students.find_one({"user_id": str(current_user.id)})
    
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found"
        )
    
    return Student(**student)

@router.put("/me", response_model=dict)
async def update_my_student_profile(
    student_update: StudentUpdate,
    current_user: User = Depends(get_current_active_user)
):
    """Update current user's student profile."""
    db = get_database()
    
    # Get current student
    current_student = await db.students.find_one({"user_id": str(current_user.id)})
    if not current_student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found"
        )
    
    # Update student
    update_data = student_update.dict(exclude_unset=True)
    result = await db.students.update_one(
        {"user_id": str(current_user.id)},
        {"$set": update_data}
    )
    
    if result.modified_count:
        logger.info(f"Student profile updated: {current_student['student_id']}")
        return {"message": "Student profile updated successfully"}
    
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Failed to update student profile"
    )

@router.get("/{student_id}", response_model=Student)
async def get_student(
    student_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Get student by ID (admin only or own profile)."""
    db = get_database()
    
    # Check if user is admin or requesting own profile
    if current_user.role != "admin":
        student = await db.students.find_one({"user_id": str(current_user.id), "student_id": student_id})
    else:
        student = await db.students.find_one({"student_id": student_id})
    
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    return Student(**student)

@router.get("/", response_model=List[Student])
async def get_all_students(current_user: User = Depends(get_current_active_user)):
    """Get all students (admin only)."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    db = get_database()
    students = await db.students.find().to_list(1000)
    return [Student(**student) for student in students]

@router.delete("/{student_id}", response_model=dict)
async def delete_student(
    student_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Delete student (admin only)."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    db = get_database()
    result = await db.students.delete_one({"student_id": student_id})
    
    if result.deleted_count:
        logger.info(f"Student deleted: {student_id}")
        return {"message": "Student deleted successfully"}
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Student not found"
    )
