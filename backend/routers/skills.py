from fastapi import APIRouter, Depends, HTTPException
from models import User, SkillsData
from auth import get_current_active_user
from database import get_database
from typing import Dict, Any, List
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

def analyze_skill_gaps(current_skills: SkillsData, target_role: str = "Software Engineer") -> Dict[str, Any]:
    """Analyze skill gaps and provide recommendations."""
    
    # Define target skills for different roles
    target_skills = {
        "Software Engineer": {
            "programming": 85,
            "data_structures": 90,
            "web_development": 75,
            "database": 70,
            "communication": 80,
            "problem_solving": 85
        },
        "Data Scientist": {
            "programming": 80,
            "data_structures": 75,
            "web_development": 60,
            "database": 85,
            "communication": 75,
            "problem_solving": 90
        },
        "Product Manager": {
            "programming": 40,
            "data_structures": 50,
            "web_development": 50,
            "database": 60,
            "communication": 90,
            "problem_solving": 80
        },
        "DevOps Engineer": {
            "programming": 75,
            "data_structures": 70,
            "web_development": 70,
            "database": 80,
            "communication": 75,
            "problem_solving": 80
        }
    }
    
    target = target_skills.get(target_role, target_skills["Software Engineer"])
    
    # Calculate skill gaps
    skill_gaps = {}
    for skill, current_level in current_skills.dict().items():
        target_level = target.get(skill, 70)
        gap = target_level - current_level
        skill_gaps[skill] = {
            "current": current_level,
            "target": target_level,
            "gap": max(0, gap),
            "priority": "high" if gap > 20 else "medium" if gap > 10 else "low"
        }
    
    # Generate learning recommendations
    recommendations = []
    for skill, gap_info in skill_gaps.items():
        if gap_info["gap"] > 0:
            recommendations.append({
                "skill": skill.replace("_", " ").title(),
                "current_level": gap_info["current"],
                "target_level": gap_info["target"],
                "gap": gap_info["gap"],
                "priority": gap_info["priority"],
                "recommendations": get_skill_recommendations(skill, gap_info["gap"])
            })
    
    # Sort by priority and gap size
    recommendations.sort(key=lambda x: (x["priority"] != "high", x["gap"]), reverse=True)
    
    return {
        "target_role": target_role,
        "current_skills": current_skills.dict(),
        "target_skills": target,
        "skill_gaps": skill_gaps,
        "recommendations": recommendations,
        "overall_readiness": calculate_overall_skill_readiness(current_skills, target)
    }

def get_skill_recommendations(skill: str, gap: int) -> List[str]:
    """Get specific recommendations for skill improvement."""
    recommendations_map = {
        "programming": [
            "Practice coding challenges on platforms like LeetCode, HackerRank",
            "Contribute to open-source projects",
            "Build personal projects to apply concepts",
            "Read clean code and design pattern books"
        ],
        "data_structures": [
            "Study algorithms and data structures systematically",
            "Implement data structures from scratch",
            "Solve algorithmic problems regularly",
            "Take advanced algorithms courses"
        ],
        "web_development": [
            "Build full-stack web applications",
            "Learn modern frameworks (React, Vue, Angular)",
            "Study responsive design and UX principles",
            "Deploy projects to cloud platforms"
        ],
        "database": [
            "Learn SQL and NoSQL database design",
            "Practice database optimization techniques",
            "Work on database-intensive projects",
            "Study database administration"
        ],
        "communication": [
            "Join public speaking clubs or presentations",
            "Practice technical writing and documentation",
            "Participate in group discussions and debates",
            "Take communication skills workshops"
        ],
        "problem_solving": [
            "Practice logical reasoning puzzles",
            "Study problem-solving methodologies",
            "Work on complex system design problems",
            "Learn debugging and troubleshooting techniques"
        ]
    }
    
    return recommendations_map.get(skill, ["Practice regularly", "Seek mentorship", "Take relevant courses"])

def calculate_overall_skill_readiness(current_skills: SkillsData, target_skills: Dict[str, int]) -> float:
    """Calculate overall skill readiness percentage."""
    total_score = 0
    total_target = 0
    
    for skill, current_level in current_skills.dict().items():
        target_level = target_skills.get(skill, 70)
        total_score += min(current_level, target_level)
        total_target += target_level
    
    if total_target == 0:
        return 0.0
    
    return round((total_score / total_target) * 100, 2)

@router.post("/analyze", response_model=Dict[str, Any])
async def analyze_skills(
    data: Dict[str, Any],
    current_user: User = Depends(get_current_active_user)
):
    """Analyze skill gaps and provide recommendations."""
    try:
        # Get target role
        target_role = data.get('target_role', 'Software Engineer')
        
        # Get current student data
        db = get_database()
        student = await db.students.find_one({"user_id": str(current_user.id)})
        
        if not student:
            raise HTTPException(status_code=404, detail="Student profile not found")
        
        # Get current skills
        current_skills_data = student.get('skills', {})
        current_skills = SkillsData(**current_skills_data)
        
        # Analyze skill gaps
        analysis = analyze_skill_gaps(current_skills, target_role)
        
        logger.info(f"Skills analysis completed for user {current_user.email}")
        
        return analysis
        
    except Exception as e:
        logger.error(f"Error analyzing skills: {e}")
        raise HTTPException(status_code=500, detail="Failed to analyze skills")

@router.get("/my-skills", response_model=Dict[str, Any])
async def get_my_skills(current_user: User = Depends(get_current_active_user)):
    """Get current user's skills data."""
    db = get_database()
    student = await db.students.find_one({"user_id": str(current_user.id)})
    
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    
    skills_data = student.get('skills', {})
    
    return {
        "skills": skills_data,
        "last_updated": student.get('updated_at'),
        "analysis_available": True
    }

@router.put("/my-skills", response_model=Dict[str, Any])
async def update_my_skills(
    skills_update: SkillsData,
    current_user: User = Depends(get_current_active_user)
):
    """Update current user's skills."""
    try:
        db = get_database()
        
        # Update skills
        result = await db.students.update_one(
            {"user_id": str(current_user.id)},
            {"$set": {"skills": skills_update.dict(), "updated_at": "2024-01-01T00:00:00Z"}}
        )
        
        if result.modified_count:
            logger.info(f"Skills updated for user {current_user.email}")
            return {"message": "Skills updated successfully", "skills": skills_update.dict()}
        
        raise HTTPException(status_code=400, detail="Failed to update skills")
        
    except Exception as e:
        logger.error(f"Error updating skills: {e}")
        raise HTTPException(status_code=500, detail="Failed to update skills")

@router.get("/recommendations", response_model=Dict[str, Any])
async def get_skill_recommendations(
    target_role: str = "Software Engineer",
    current_user: User = Depends(get_current_active_user)
):
    """Get personalized skill recommendations."""
    db = get_database()
    student = await db.students.find_one({"user_id": str(current_user.id)})
    
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    
    current_skills_data = student.get('skills', {})
    current_skills = SkillsData(**current_skills_data)
    
    analysis = analyze_skill_gaps(current_skills, target_role)
    
    return {
        "recommendations": analysis["recommendations"],
        "target_role": target_role,
        "priority_focus": [rec for rec in analysis["recommendations"] if rec["priority"] == "high"]
    }
