from fastapi import APIRouter, Depends, HTTPException
from models import User, SkillsData
from auth import get_current_active_user
from database import get_database
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

def calculate_readiness_score(cgpa: float, skills: SkillsData, projects_count: int, internships_count: int) -> float:
    """Calculate placement readiness score based on various factors."""
    weights = {
        'cgpa': 0.25,
        'technical_skills': 0.25,
        'communication_skills': 0.20,
        'projects': 0.15,
        'internships': 0.15
    }
    
    # Normalize CGPA (assuming 10.0 scale)
    cgpa_score = (cgpa / 10.0) * 100
    
    # Calculate technical skills average
    technical_skills = (
        skills.programming + 
        skills.data_structures + 
        skills.web_development + 
        skills.database + 
        skills.problem_solving
    ) / 5
    
    # Communication skills
    communication_score = skills.communication
    
    # Projects and internships scores
    projects_score = min(projects_count * 20, 100)  # 5 projects = 100%
    internships_score = min(internships_count * 33.33, 100)  # 3 internships = 100%
    
    # Calculate weighted average
    readiness_score = (
        cgpa_score * weights['cgpa'] +
        technical_skills * weights['technical_skills'] +
        communication_score * weights['communication_skills'] +
        projects_score * weights['projects'] +
        internships_score * weights['internships']
    )
    
    return round(readiness_score, 2)

def get_readiness_feedback(score: float) -> Dict[str, Any]:
    """Get feedback based on readiness score."""
    if score >= 80:
        return {
            "level": "Excellent",
            "message": "You are well-prepared for placements!",
            "color": "green",
            "strengths": ["Strong academic performance", "Good technical skills", "Project experience"],
            "improvements": ["Maintain current performance", "Focus on interview skills"]
        }
    elif score >= 60:
        return {
            "level": "Good",
            "message": "Good progress! Keep improving to reach your goals.",
            "color": "blue",
            "strengths": ["Decent academic record", "Developing technical skills"],
            "improvements": ["More hands-on projects", "Technical skill depth", "Interview practice"]
        }
    elif score >= 40:
        return {
            "level": "Average",
            "message": "You're on the right track. Focus on weak areas.",
            "color": "yellow",
            "strengths": ["Basic foundation present", "Room for growth"],
            "improvements": ["Improve CGPA", "Build more projects", "Enhance technical skills"]
        }
    else:
        return {
            "level": "Needs Improvement",
            "message": "More effort needed. Consider our personalized roadmap.",
            "color": "red",
            "strengths": ["Willingness to learn"],
            "improvements": ["Focus on academics", "Build fundamental skills", "Seek mentorship"]
        }

@router.post("/calculate", response_model=Dict[str, Any])
async def calculate_readiness(
    data: Dict[str, Any],
    current_user: User = Depends(get_current_active_user)
):
    """Calculate placement readiness score."""
    try:
        # Extract data
        cgpa = data.get('cgpa', 0.0)
        skills_data = data.get('skills', {})
        projects_count = data.get('projects_count', 0)
        internships_count = data.get('internships_count', 0)
        
        # Create skills object
        skills = SkillsData(
            programming=skills_data.get('programming', 0),
            data_structures=skills_data.get('data_structures', 0),
            web_development=skills_data.get('web_development', 0),
            database=skills_data.get('database', 0),
            communication=skills_data.get('communication', 0),
            problem_solving=skills_data.get('problem_solving', 0)
        )
        
        # Calculate score
        readiness_score = calculate_readiness_score(cgpa, skills, projects_count, internships_count)
        
        # Get feedback
        feedback = get_readiness_feedback(readiness_score)
        
        # Update student's readiness score in database
        db = get_database()
        await db.students.update_one(
            {"user_id": str(current_user.id)},
            {"$set": {"readiness_score": readiness_score}}
        )
        
        logger.info(f"Readiness score calculated for user {current_user.email}: {readiness_score}")
        
        return {
            "readiness_score": readiness_score,
            "feedback": feedback,
            "breakdown": {
                "cgpa_score": (cgpa / 10.0) * 100,
                "technical_skills": (skills.programming + skills.data_structures + skills.web_development + skills.database + skills.problem_solving) / 5,
                "communication_skills": skills.communication,
                "projects_score": min(projects_count * 20, 100),
                "internships_score": min(internships_count * 33.33, 100)
            }
        }
        
    except Exception as e:
        logger.error(f"Error calculating readiness score: {e}")
        raise HTTPException(status_code=500, detail="Failed to calculate readiness score")

@router.get("/my-score", response_model=Dict[str, Any])
async def get_my_readiness_score(current_user: User = Depends(get_current_active_user)):
    """Get current user's readiness score."""
    db = get_database()
    student = await db.students.find_one({"user_id": str(current_user.id)})
    
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    
    readiness_score = student.get('readiness_score', 0.0)
    feedback = get_readiness_feedback(readiness_score)
    
    return {
        "readiness_score": readiness_score,
        "feedback": feedback
    }

@router.get("/analytics", response_model=Dict[str, Any])
async def get_readiness_analytics(current_user: User = Depends(get_current_active_user)):
    """Get readiness analytics for current user."""
    db = get_database()
    student = await db.students.find_one({"user_id": str(current_user.id)})
    
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    
    # Get historical data (mock for now)
    historical_scores = [
        {"date": "2024-01-01", "score": 45},
        {"date": "2024-02-01", "score": 52},
        {"date": "2024-03-01", "score": 58},
        {"date": "2024-04-01", "score": 65},
        {"date": "2024-05-01", "score": 72},
        {"date": "2024-06-01", "score": student.get('readiness_score', 0)}
    ]
    
    return {
        "current_score": student.get('readiness_score', 0),
        "historical_scores": historical_scores,
        "improvement_trend": "positive" if len(historical_scores) > 1 and historical_scores[-1]["score"] > historical_scores[0]["score"] else "negative",
        "next_milestone": "80% - Excellent readiness level"
    }
