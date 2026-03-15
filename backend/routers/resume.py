from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from models import User, Resume, ResumeAnalysis, ResumeCreate
from auth import get_current_active_user
from database import get_database
from config import settings
import os
import aiofiles
from typing import Dict, Any, List
import logging
from datetime import datetime
import PyPDF2
from docx import Document
import re

logger = logging.getLogger(__name__)
router = APIRouter()

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from PDF file."""
    try:
        with open(file_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text = ""
            for page in reader.pages:
                text += page.extract_text()
        return text
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {e}")
        return ""

def extract_text_from_docx(file_path: str) -> str:
    """Extract text from DOCX file."""
    try:
        doc = Document(file_path)
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text
    except Exception as e:
        logger.error(f"Error extracting text from DOCX: {e}")
        return ""

def analyze_resume_text(text: str) -> ResumeAnalysis:
    """Analyze resume text and provide feedback."""
    
    # Initialize analysis
    contact_info = bool(re.search(r'\b\d{10}\b|\b\d{3}[-.]?\d{3}[-.]?\d{4}\b', text))
    email_found = bool(re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text))
    
    # Check for professional summary
    summary_keywords = ['summary', 'objective', 'profile', 'about']
    professional_summary = any(keyword in text.lower() for keyword in summary_keywords)
    
    # Check for skills section
    skills_keywords = ['skills', 'technical skills', 'competencies', 'expertise']
    skills_section = any(keyword in text.lower() for keyword in skills_keywords)
    
    # Check for experience description
    experience_keywords = ['experience', 'work history', 'employment', 'career']
    experience_description = any(keyword in text.lower() for keyword in experience_keywords)
    
    # Calculate scores
    contact_score = 25 if (contact_info and email_found) else 12.5 if contact_info or email_found else 0
    summary_score = 20 if professional_summary else 10
    skills_score = 25 if skills_section else 12.5
    experience_score = 30 if experience_description else 15
    
    # Overall score
    overall_score = contact_score + summary_score + skills_score + experience_score
    
    # ATS compatibility (based on formatting and keywords)
    ats_score = min(10, len(text.split()) / 100)  # Simple ATS scoring
    
    # Generate recommendations
    recommendations = []
    if not contact_info or not email_found:
        recommendations.append("Add complete contact information (phone and email)")
    if not professional_summary:
        recommendations.append("Include a professional summary or objective statement")
    if not skills_section:
        recommendations.append("Add a dedicated skills section with technical keywords")
    if not experience_description:
        recommendations.append("Provide detailed descriptions of your work experience")
    if len(text.split()) < 200:
        recommendations.append("Expand your resume with more detailed content")
    if not re.search(r'\d{4}', text):
        recommendations.append("Include specific years and dates in your experience")
    
    return ResumeAnalysis(
        overall_score=round(overall_score, 2),
        ats_compatibility=round(ats_score, 2),
        contact_info=contact_info and email_found,
        professional_summary=professional_summary,
        skills_section=skills_section,
        experience_description=experience_description,
        recommendations=recommendations
    )

@router.post("/upload", response_model=Dict[str, Any])
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user)
):
    """Upload and analyze resume."""
    try:
        # Validate file
        if file.size > settings.MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large")
        
        file_extension = os.path.splitext(file.filename)[1].lower()
        if file_extension not in settings.ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=400, detail="File type not allowed")
        
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{current_user.email}_{timestamp}_{file.filename}"
        file_path = os.path.join(settings.UPLOAD_DIR, filename)
        
        # Save file
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        # Extract text based on file type
        if file_extension == '.pdf':
            text = extract_text_from_pdf(file_path)
        elif file_extension in ['.doc', '.docx']:
            text = extract_text_from_docx(file_path)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type")
        
        # Analyze resume
        analysis = analyze_resume_text(text)
        
        # Save to database
        db = get_database()
        resume_data = ResumeCreate(
            student_id=str(current_user.id),
            file_name=file.filename,
            file_size=file.size,
            file_type=file_extension,
            analysis=analysis
        )
        
        resume_dict = resume_data.dict()
        resume_dict["file_path"] = file_path
        
        result = await db.resumes.insert_one(resume_dict)
        
        # Update student's resume score
        await db.students.update_one(
            {"user_id": str(current_user.id)},
            {"$set": {"resume_score": analysis.overall_score}}
        )
        
        logger.info(f"Resume uploaded and analyzed for user {current_user.email}")
        
        return {
            "message": "Resume uploaded and analyzed successfully",
            "resume_id": str(result.inserted_id),
            "analysis": analysis.dict(),
            "file_info": {
                "filename": file.filename,
                "size": file.size,
                "type": file_extension
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading resume: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload resume")

@router.get("/my-resumes", response_model=List[Dict[str, Any]])
async def get_my_resumes(current_user: User = Depends(get_current_active_user)):
    """Get current user's uploaded resumes."""
    try:
        db = get_database()
        resumes = await db.resumes.find({"student_id": str(current_user.id)}).to_list(10)
        
        resume_list = []
        for resume in resumes:
            resume_list.append({
                "id": str(resume["_id"]),
                "file_name": resume["file_name"],
                "file_size": resume["file_size"],
                "file_type": resume["file_type"],
                "uploaded_at": resume["created_at"],
                "overall_score": resume["analysis"]["overall_score"],
                "ats_compatibility": resume["analysis"]["ats_compatibility"]
            })
        
        return resume_list
        
    except Exception as e:
        logger.error(f"Error getting resumes: {e}")
        raise HTTPException(status_code=500, detail="Failed to get resumes")

@router.get("/{resume_id}/analysis", response_model=Dict[str, Any])
async def get_resume_analysis(
    resume_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Get detailed analysis of a specific resume."""
    try:
        db = get_database()
        resume = await db.resumes.find_one({
            "_id": resume_id,
            "student_id": str(current_user.id)
        })
        
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        return {
            "resume_id": str(resume["_id"]),
            "file_name": resume["file_name"],
            "analysis": resume["analysis"],
            "uploaded_at": resume["created_at"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting resume analysis: {e}")
        raise HTTPException(status_code=500, detail="Failed to get resume analysis")

@router.delete("/{resume_id}", response_model=Dict[str, Any])
async def delete_resume(
    resume_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Delete a resume."""
    try:
        db = get_database()
        resume = await db.resumes.find_one({
            "_id": resume_id,
            "student_id": str(current_user.id)
        })
        
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        # Delete file from filesystem
        if os.path.exists(resume["file_path"]):
            os.remove(resume["file_path"])
        
        # Delete from database
        await db.resumes.delete_one({"_id": resume_id})
        
        logger.info(f"Resume deleted: {resume_id}")
        return {"message": "Resume deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting resume: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete resume")
