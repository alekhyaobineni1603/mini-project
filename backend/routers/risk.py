from fastapi import APIRouter, Depends, HTTPException
from models import User, RiskAssessment, RiskFactor
from auth import get_current_active_user
from database import get_database
from typing import Dict, Any, List
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)
router = APIRouter()

def analyze_risk_factors(student_data: Dict) -> List[RiskFactor]:
    """Analyze risk factors for placement success."""
    risk_factors = []
    
    # Academic Performance Risk
    cgpa = student_data.get("cgpa", 0.0)
    if cgpa < 6.0:
        risk_factors.append(RiskFactor(
            factor="Academic Performance",
            risk_level="high",
            score=75,
            description=f"CGPA of {cgpa} is below the typical threshold of 6.0",
            mitigation_strategy="Focus on improving grades in remaining semesters and highlight project work"
        ))
    elif cgpa < 7.5:
        risk_factors.append(RiskFactor(
            factor="Academic Performance",
            risk_level="medium",
            score=50,
            description=f"CGPA of {cgpa} is moderate and could be improved",
            mitigation_strategy="Maintain consistent performance and strengthen technical skills"
        ))
    else:
        risk_factors.append(RiskFactor(
            factor="Academic Performance",
            risk_level="low",
            score=25,
            description=f"CGPA of {cgpa} is competitive",
            mitigation_strategy="Maintain current academic performance"
        ))
    
    # Technical Skills Risk
    skills = student_data.get("skills", {})
    avg_technical_score = (
        skills.get("programming", 0) + 
        skills.get("data_structures", 0) + 
        skills.get("web_development", 0) + 
        skills.get("database", 0) + 
        skills.get("problem_solving", 0)
    ) / 5
    
    if avg_technical_score < 50:
        risk_factors.append(RiskFactor(
            factor="Technical Skills Gap",
            risk_level="high",
            score=80,
            description=f"Average technical score of {avg_technical_score:.1f} is below industry requirements",
            mitigation_strategy="Dedicate 2-3 hours daily to technical practice and complete online courses"
        ))
    elif avg_technical_score < 70:
        risk_factors.append(RiskFactor(
            factor="Technical Skills Gap",
            risk_level="medium",
            score=55,
            description=f"Technical skills need improvement to reach competitive level",
            mitigation_strategy="Focus on weak areas and build hands-on projects"
        ))
    else:
        risk_factors.append(RiskFactor(
            factor="Technical Skills Gap",
            risk_level="low",
            score=20,
            description="Technical skills are competitive",
            mitigation_strategy="Continue learning advanced topics"
        ))
    
    # Communication Skills Risk
    communication_score = skills.get("communication", 0)
    if communication_score < 50:
        risk_factors.append(RiskFactor(
            factor="Communication Skills",
            risk_level="high",
            score=70,
            description="Communication skills may impact interview performance",
            mitigation_strategy="Join public speaking clubs, practice technical presentations, and improve written communication"
        ))
    elif communication_score < 70:
        risk_factors.append(RiskFactor(
            factor="Communication Skills",
            risk_level="medium",
            score=45,
            description="Communication skills need enhancement for better interview performance",
            mitigation_strategy="Practice mock interviews and improve articulation of technical concepts"
        ))
    else:
        risk_factors.append(RiskFactor(
            factor="Communication Skills",
            risk_level="low",
            score=15,
            description="Communication skills are strong",
            mitigation_strategy="Maintain and refine communication abilities"
        ))
    
    # Project Experience Risk
    projects_count = student_data.get("projects_count", 0)
    if projects_count < 2:
        risk_factors.append(RiskFactor(
            factor="Project Experience",
            risk_level="high",
            score=75,
            description=f"Only {projects_count} projects completed - insufficient practical experience",
            mitigation_strategy="Build 2-3 significant projects showcasing different technologies and skills"
        ))
    elif projects_count < 5:
        risk_factors.append(RiskFactor(
            factor="Project Experience",
            risk_level="medium",
            score=50,
            description="Project experience could be strengthened",
            mitigation_strategy="Develop more diverse projects and contribute to open source"
        ))
    else:
        risk_factors.append(RiskFactor(
            factor="Project Experience",
            risk_level="low",
            score=20,
            description="Good project experience",
            mitigation_strategy="Focus on quality and complexity of projects"
        ))
    
    # Internship Experience Risk
    internships_count = student_data.get("internships_count", 0)
    if internships_count == 0:
        risk_factors.append(RiskFactor(
            factor="Internship Experience",
            risk_level="high",
            score=65,
            description="No internship experience - may affect practical understanding",
            mitigation_strategy="Seek internship opportunities or work on freelance projects to gain experience"
        ))
    elif internships_count < 2:
        risk_factors.append(RiskFactor(
            factor="Internship Experience",
            risk_level="medium",
            score=40,
            description="Limited internship experience",
            mitigation_strategy="Apply for internships and gain industry exposure"
        ))
    else:
        risk_factors.append(RiskFactor(
            factor="Internship Experience",
            risk_level="low",
            score=10,
            description="Good internship experience",
            mitigation_strategy="Leverage internship experience in interviews"
        ))
    
    return risk_factors

def calculate_overall_risk(risk_factors: List[RiskFactor]) -> float:
    """Calculate overall risk level from individual risk factors."""
    if not risk_factors:
        return 0.0
    
    # Weight different risk factors
    weights = {
        "Academic Performance": 0.20,
        "Technical Skills Gap": 0.30,
        "Communication Skills": 0.20,
        "Project Experience": 0.15,
        "Internship Experience": 0.15
    }
    
    weighted_score = 0.0
    total_weight = 0.0
    
    for risk_factor in risk_factors:
        weight = weights.get(risk_factor.factor, 0.20)
        weighted_score += risk_factor.score * weight
        total_weight += weight
    
    return weighted_score / total_weight if total_weight > 0 else 0.0

def calculate_success_probability(risk_score: float) -> float:
    """Calculate success probability based on risk score."""
    # Inverse relationship: higher risk = lower success probability
    return max(0, min(100, 100 - risk_score))

def estimate_months_to_ready(risk_factors: List[RiskFactor]) -> float:
    """Estimate months needed to become placement-ready."""
    high_risk_count = sum(1 for rf in risk_factors if rf.risk_level == "high")
    medium_risk_count = sum(1 for rf in risk_factors if rf.risk_level == "medium")
    
    # Base calculation
    months = high_risk_count * 2 + medium_risk_count * 1
    
    # Adjust based on current readiness
    if high_risk_count == 0 and medium_risk_count <= 1:
        months = 0.5  # Already mostly ready
    
    return max(0.5, months)

def generate_mitigation_strategies(risk_factors: List[RiskFactor]) -> List[str]:
    """Generate comprehensive mitigation strategies."""
    strategies = []
    
    # Collect unique strategies
    unique_strategies = set()
    for risk_factor in risk_factors:
        unique_strategies.add(risk_factor.mitigation_strategy)
    
    # Add general strategies
    strategies.extend(list(unique_strategies))
    
    # Add comprehensive strategies
    if any(rf.risk_level == "high" for rf in risk_factors):
        strategies.extend([
            "Create a detailed 90-day improvement plan",
            "Seek mentorship from industry professionals",
            "Consider additional certifications or courses"
        ])
    
    strategies.extend([
        "Practice mock interviews weekly",
        "Build a strong online presence (GitHub, LinkedIn)",
        "Network with professionals in target industry"
    ])
    
    return strategies[:10]  # Return top 10 strategies

@router.post("/assess", response_model=Dict[str, Any])
async def assess_placement_risk(current_user: User = Depends(get_current_active_user)):
    """Assess placement risk and provide mitigation strategies."""
    try:
        db = get_database()
        
        # Get student data
        student = await db.students.find_one({"user_id": str(current_user.id)})
        if not student:
            raise HTTPException(status_code=404, detail="Student profile not found")
        
        # Analyze risk factors
        risk_factors = analyze_risk_factors(student)
        
        # Calculate overall metrics
        overall_risk_level = calculate_overall_risk(risk_factors)
        success_probability = calculate_success_probability(overall_risk_level)
        months_to_ready = estimate_months_to_ready(risk_factors)
        
        # Generate mitigation strategies
        mitigation_strategies = generate_mitigation_strategies(risk_factors)
        
        # Create risk assessment
        assessment = RiskAssessment(
            overall_risk_level=round(overall_risk_level, 2),
            success_probability=round(success_probability, 2),
            months_to_ready=round(months_to_ready, 1),
            risk_factors=risk_factors,
            mitigation_strategies=mitigation_strategies
        )
        
        # Save assessment to database
        assessment_dict = assessment.dict()
        assessment_dict["student_id"] = str(current_user.id)
        assessment_dict["assessed_at"] = datetime.utcnow().isoformat()
        
        await db.risk_assessments.update_one(
            {"student_id": str(current_user.id)},
            {"$set": assessment_dict},
            upsert=True
        )
        
        logger.info(f"Risk assessment completed for user {current_user.email}")
        
        return {
            "assessment": assessment_dict,
            "risk_level_category": get_risk_category(overall_risk_level),
            "recommendations": get_risk_recommendations(overall_risk_level),
            "next_assessment_date": (datetime.utcnow() + timedelta(days=30)).strftime("%Y-%m-%d")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error assessing risk: {e}")
        raise HTTPException(status_code=500, detail="Failed to assess risk")

def get_risk_category(risk_score: float) -> str:
    """Get risk category based on score."""
    if risk_score >= 60:
        return "High Risk"
    elif risk_score >= 40:
        return "Moderate Risk"
    elif risk_score >= 20:
        return "Low Risk"
    else:
        return "Very Low Risk"

def get_risk_recommendations(risk_score: float) -> List[str]:
    """Get recommendations based on risk level."""
    if risk_score >= 60:
        return [
            "Immediate action required - focus on high-risk areas first",
            "Consider extending preparation timeline",
            "Seek professional guidance and mentorship",
            "Intensive practice and skill development needed"
        ]
    elif risk_score >= 40:
        return [
            "Structured improvement plan recommended",
            "Focus on medium-risk areas",
            "Regular practice and monitoring needed",
            "Consider additional learning resources"
        ]
    else:
        return [
            "Maintain current performance",
            "Fine-tune existing skills",
            "Focus on interview preparation",
            "Ready for placement opportunities"
        ]

@router.get("/my-assessment", response_model=Dict[str, Any])
async def get_my_risk_assessment(current_user: User = Depends(get_current_active_user)):
    """Get the latest risk assessment for the current user."""
    try:
        db = get_database()
        
        assessment = await db.risk_assessments.find_one({"student_id": str(current_user.id)})
        if not assessment:
            raise HTTPException(status_code=404, detail="Risk assessment not found")
        
        return {
            "assessment": assessment,
            "risk_level_category": get_risk_category(assessment["overall_risk_level"]),
            "recommendations": get_risk_recommendations(assessment["overall_risk_level"])
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting risk assessment: {e}")
        raise HTTPException(status_code=500, detail="Failed to get risk assessment")

@router.get("/risk-trends", response_model=Dict[str, Any])
async def get_risk_trends(current_user: User = Depends(get_current_active_user)):
    """Get risk assessment trends over time."""
    try:
        # Mock historical data (in real implementation, fetch from database)
        historical_data = [
            {"date": "2024-01-01", "risk_score": 65, "success_probability": 35},
            {"date": "2024-02-01", "risk_score": 58, "success_probability": 42},
            {"date": "2024-03-01", "risk_score": 52, "success_probability": 48},
            {"date": "2024-04-01", "risk_score": 45, "success_probability": 55},
            {"date": "2024-05-01", "risk_score": 38, "success_probability": 62},
            {"date": "2024-06-01", "risk_score": 32, "success_probability": 68}
        ]
        
        # Calculate trend
        if len(historical_data) >= 2:
            recent_score = historical_data[-1]["risk_score"]
            previous_score = historical_data[-2]["risk_score"]
            trend = "improving" if recent_score < previous_score else "declining"
        else:
            trend = "stable"
        
        return {
            "historical_data": historical_data,
            "trend": trend,
            "improvement_rate": abs(historical_data[-1]["risk_score"] - historical_data[0]["risk_score"]) / len(historical_data),
            "projected_readiness": historical_data[-1]["risk_score"] - (len(historical_data) * 2)  # Projected improvement
        }
        
    except Exception as e:
        logger.error(f"Error getting risk trends: {e}")
        raise HTTPException(status_code=500, detail="Failed to get risk trends")

@router.get("/mitigation-plan", response_model=Dict[str, Any])
async def get_mitigation_plan(current_user: User = Depends(get_current_active_user)):
    """Get a detailed mitigation plan based on risk assessment."""
    try:
        db = get_database()
        
        assessment = await db.risk_assessments.find_one({"student_id": str(current_user.id)})
        if not assessment:
            raise HTTPException(status_code=404, detail="Risk assessment not found")
        
        # Create detailed mitigation plan
        plan = {
            "timeline_months": int(assessment["months_to_ready"]),
            "weekly_goals": [],
            "milestones": [],
            "resources": []
        }
        
        # Generate weekly goals based on risk factors
        week = 1
        for risk_factor in assessment["risk_factors"]:
            if risk_factor["risk_level"] == "high":
                plan["weekly_goals"].append({
                    "week": week,
                    "goal": f"Address {risk_factor['factor']}",
                    "tasks": [risk_factor["mitigation_strategy"]],
                    "priority": "high"
                })
                week += 1
        
        # Add general goals
        plan["weekly_goals"].extend([
            {
                "week": week,
                "goal": "Mock Interview Practice",
                "tasks": ["Schedule 2 mock interviews", "Review common questions", "Practice STAR method"],
                "priority": "medium"
            },
            {
                "week": week + 1,
                "goal": "Portfolio Enhancement",
                "tasks": ["Update GitHub profile", "Add project documentation", "Create demo videos"],
                "priority": "medium"
            }
        ])
        
        # Generate milestones
        plan["milestones"] = [
            {"month": 1, "milestone": "Complete high-risk factor improvements", "target": "Reduce risk score by 20%"},
            {"month": 2, "milestone": "Achieve technical competency", "target": "Score 70+ in all technical areas"},
            {"month": 3, "milestone": "Interview readiness", "target": "Success probability > 80%"}
        ]
        
        # Add resources
        plan["resources"] = [
            {"type": "online_course", "name": "Data Structures & Algorithms", "provider": "Coursera"},
            {"type": "practice_platform", "name": "LeetCode", "provider": "LeetCode"},
            {"type": "interview_prep", "name": "Mock Interview Service", "provider": "Internal"},
            {"type": "mentorship", "name": "Career Mentorship", "provider": "Alumni Network"}
        ]
        
        return plan
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating mitigation plan: {e}")
        raise HTTPException(status_code=500, detail="Failed to create mitigation plan")
