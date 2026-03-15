from fastapi import APIRouter, Depends, HTTPException
from models import User, Company, CompanyCreate, CompanyMatch, CompanySize
from auth import get_current_active_user
from database import get_database
from typing import Dict, Any, List
import logging
import random

logger = logging.getLogger(__name__)
router = APIRouter()

# Company database
COMPANY_DATABASE = [
    {
        "name": "TechCorp Solutions",
        "industry": "Technology",
        "description": "Leading software development company specializing in enterprise solutions",
        "location": "Bangalore",
        "size": "large",
        "website": "https://techcorp.com",
        "roles_offered": ["Software Engineer", "Senior Developer", "Tech Lead"],
        "required_skills": {
            "programming": 85,
            "data_structures": 80,
            "web_development": 75,
            "database": 70,
            "communication": 75,
            "problem_solving": 85
        },
        "salary_range": "8-15 LPA",
        "culture": "Innovation-driven, collaborative environment"
    },
    {
        "name": "DataTech Inc",
        "industry": "Data Analytics",
        "description": "Pioneering data science and machine learning solutions",
        "location": "Mumbai",
        "size": "medium",
        "website": "https://datatech.com",
        "roles_offered": ["Data Scientist", "ML Engineer", "Data Analyst"],
        "required_skills": {
            "programming": 80,
            "data_structures": 75,
            "web_development": 60,
            "database": 85,
            "communication": 75,
            "problem_solving": 90
        },
        "salary_range": "10-20 LPA",
        "culture": "Research-focused, analytical environment"
    },
    {
        "name": "CloudSoft Systems",
        "industry": "Cloud Computing",
        "description": "Cloud infrastructure and DevOps solutions provider",
        "location": "Pune",
        "size": "medium",
        "website": "https://cloudsoft.com",
        "roles_offered": ["DevOps Engineer", "Cloud Architect", "Site Reliability Engineer"],
        "required_skills": {
            "programming": 75,
            "data_structures": 70,
            "web_development": 70,
            "database": 80,
            "communication": 75,
            "problem_solving": 80
        },
        "salary_range": "12-25 LPA",
        "culture": "Fast-paced, automation-focused"
    },
    {
        "name": "InnoSys Technologies",
        "industry": "Technology",
        "description": "Innovative startup building next-gen applications",
        "location": "Bangalore",
        "size": "startup",
        "website": "https://innosys.com",
        "roles_offered": ["Full Stack Developer", "Product Engineer", "Frontend Developer"],
        "required_skills": {
            "programming": 80,
            "data_structures": 75,
            "web_development": 85,
            "database": 65,
            "communication": 70,
            "problem_solving": 75
        },
        "salary_range": "6-12 LPA",
        "culture": "Startup culture, rapid growth"
    },
    {
        "name": "NextGen AI",
        "industry": "Artificial Intelligence",
        "description": "AI and machine learning research and development",
        "location": "Hyderabad",
        "size": "small",
        "website": "https://nextgenai.com",
        "roles_offered": ["AI Engineer", "Research Scientist", "ML Engineer"],
        "required_skills": {
            "programming": 85,
            "data_structures": 80,
            "web_development": 50,
            "database": 75,
            "communication": 80,
            "problem_solving": 90
        },
        "salary_range": "15-30 LPA",
        "culture": "Research-oriented, innovative"
    }
]

def calculate_company_match(student_skills: Dict, company: Dict, preferences: Dict) -> CompanyMatch:
    """Calculate match score between student and company."""
    required_skills = company["required_skills"]
    
    # Calculate skill match score
    skill_scores = []
    for skill, student_level in student_skills.items():
        required_level = required_skills.get(skill, 70)
        # Give bonus for exceeding requirements
        if student_level >= required_level:
            score = 100
        else:
            score = (student_level / required_level) * 100
        skill_scores.append(score)
    
    skill_match = sum(skill_scores) / len(skill_scores)
    
    # Apply preference filters
    preference_bonus = 0
    preference_reasons = []
    
    if preferences.get("industry") and preferences["industry"].lower() == company["industry"].lower():
        preference_bonus += 5
        preference_reasons.append(f"Industry match: {company['industry']}")
    
    if preferences.get("location") and preferences["location"].lower() == company["location"].lower():
        preference_bonus += 5
        preference_reasons.append(f"Location match: {company['location']}")
    
    if preferences.get("size") and preferences["size"].lower() == company["size"].lower():
        preference_bonus += 3
        preference_reasons.append(f"Company size match: {company['size']}")
    
    # Calculate final match score
    final_score = min(100, skill_match + preference_bonus)
    
    # Generate match reasons
    match_reasons = preference_reasons.copy()
    
    if skill_match >= 80:
        match_reasons.append("Excellent skill alignment")
    elif skill_match >= 60:
        match_reasons.append("Good skill fit")
    else:
        match_reasons.append("Skills need improvement")
    
    # Add specific skill highlights
    strong_skills = [skill for skill, level in student_skills.items() if level >= required_skills.get(skill, 70)]
    if strong_skills:
        match_reasons.append(f"Strong in: {', '.join(strong_skills)}")
    
    return CompanyMatch(
        company_id=company["name"].lower().replace(" ", "_"),
        match_score=round(final_score, 2),
        match_reasons=match_reasons
    )

def get_company_by_id(company_id: str) -> Dict:
    """Get company by ID."""
    for company in COMPANY_DATABASE:
        if company["name"].lower().replace(" ", "_") == company_id:
            return company
    return None

@router.post("/match", response_model=Dict[str, Any])
async def find_company_matches(
    preferences: Dict[str, Any],
    current_user: User = Depends(get_current_active_user)
):
    """Find company matches based on student profile and preferences."""
    try:
        db = get_database()
        
        # Get student data
        student = await db.students.find_one({"user_id": str(current_user.id)})
        if not student:
            raise HTTPException(status_code=404, detail="Student profile not found")
        
        student_skills = student["skills"]
        
        # Calculate matches for all companies
        matches = []
        for company in COMPANY_DATABASE:
            # Apply basic filters
            if preferences.get("industry") and preferences["industry"].lower() != company["industry"].lower():
                continue
            if preferences.get("location") and preferences["location"].lower() != company["location"].lower():
                continue
            if preferences.get("size") and preferences["size"].lower() != company["size"].lower():
                continue
            
            match = calculate_company_match(student_skills, company, preferences)
            matches.append({
                "company": company,
                "match": match.dict()
            })
        
        # Sort by match score
        matches.sort(key=lambda x: x["match"]["match_score"], reverse=True)
        
        logger.info(f"Company matches found for user {current_user.email}: {len(matches)}")
        
        return {
            "matches": matches[:10],  # Return top 10 matches
            "total_matches": len(matches),
            "preferences_used": preferences,
            "search_criteria": {
                "industry": preferences.get("industry"),
                "location": preferences.get("location"),
                "size": preferences.get("size"),
                "job_role": preferences.get("job_role")
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error finding company matches: {e}")
        raise HTTPException(status_code=500, detail="Failed to find company matches")

@router.get("/companies", response_model=List[Dict[str, Any]])
async def get_all_companies():
    """Get all available companies."""
    return COMPANY_DATABASE

@router.get("/companies/{company_id}", response_model=Dict[str, Any])
async def get_company_details(company_id: str):
    """Get detailed information about a specific company."""
    company = get_company_by_id(company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    return {
        "company": company,
        "similar_companies": [
            c for c in COMPANY_DATABASE 
            if c["industry"] == company["industry"] and c["name"] != company["name"]
        ][:3]
    }

@router.get("/preferences", response_model=Dict[str, Any])
async def get_matching_preferences():
    """Get available matching preferences."""
    return {
        "industries": list(set(c["industry"] for c in COMPANY_DATABASE)),
        "locations": list(set(c["location"] for c in COMPANY_DATABASE)),
        "sizes": ["startup", "small", "medium", "large"],
        "job_roles": list(set(role for company in COMPANY_DATABASE for role in company["roles_offered"])),
        "salary_ranges": list(set(c["salary_range"] for c in COMPANY_DATABASE))
    }

@router.post("/companies/{company_id}/apply", response_model=Dict[str, Any])
async def apply_to_company(
    company_id: str,
    application_data: Dict[str, Any],
    current_user: User = Depends(get_current_active_user)
):
    """Apply to a company (mock application)."""
    try:
        company = get_company_by_id(company_id)
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
        
        db = get_database()
        
        # Create application record
        application = {
            "student_id": str(current_user.id),
            "company_id": company_id,
            "company_name": company["name"],
            "job_role": application_data.get("job_role"),
            "cover_letter": application_data.get("cover_letter", ""),
            "resume_id": application_data.get("resume_id"),
            "status": "submitted",
            "applied_at": datetime.utcnow().isoformat()
        }
        
        result = await db.applications.insert_one(application)
        
        logger.info(f"Application submitted by user {current_user.email} to {company['name']}")
        
        return {
            "application_id": str(result.inserted_id),
            "message": "Application submitted successfully",
            "company": company["name"],
            "status": "submitted",
            "next_steps": [
                "Application review by HR team",
                "Technical assessment (if shortlisted)",
                "Interview rounds",
                "Final decision"
            ]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error submitting application: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit application")

@router.get("/applications", response_model=List[Dict[str, Any]])
async def get_my_applications(current_user: User = Depends(get_current_active_user)):
    """Get all applications submitted by the current user."""
    try:
        db = get_database()
        applications = await db.applications.find(
            {"student_id": str(current_user.id)}
        ).sort("applied_at", -1).to_list(20)
        
        application_list = []
        for app in applications:
            company = get_company_by_id(app["company_id"])
            application_list.append({
                "application_id": str(app["_id"]),
                "company": company,
                "job_role": app["job_role"],
                "status": app["status"],
                "applied_at": app["applied_at"],
                "cover_letter": app["cover_letter"]
            })
        
        return application_list
        
    except Exception as e:
        logger.error(f"Error getting applications: {e}")
        raise HTTPException(status_code=500, detail="Failed to get applications")
