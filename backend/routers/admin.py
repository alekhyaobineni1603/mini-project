from fastapi import APIRouter, Depends, HTTPException
from models import User
from auth import get_current_admin_user
from database import get_database
from typing import Dict, Any, List
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/dashboard", response_model=Dict[str, Any])
async def get_admin_dashboard(current_user: User = Depends(get_current_admin_user)):
    """Get admin dashboard analytics and metrics."""
    try:
        db = get_database()
        
        # Get total students count
        total_students = await db.students.count_documents({})
        
        # Get average readiness score
        pipeline = [
            {"$group": {"_id": None, "avg_readiness": {"$avg": "$readiness_score"}}}
        ]
        result = await db.students.aggregate(pipeline).to_list(1)
        avg_readiness = result[0]["avg_readiness"] if result else 0
        
        # Get placements count (mock data for now)
        placements = 89  # This would come from actual placement data
        
        # Get active mentors count
        active_mentors = 15  # This would come from mentor availability data
        
        # Get recent activity
        recent_activity = await get_recent_activity(db)
        
        # Get placement trends
        placement_trends = await get_placement_trends(db)
        
        # Get skill distribution
        skill_distribution = await get_skill_distribution(db)
        
        logger.info(f"Admin dashboard accessed by {current_user.email}")
        
        return {
            "overview": {
                "total_students": total_students,
                "avg_readiness": round(avg_readiness, 2),
                "placements": placements,
                "active_mentors": active_mentors
            },
            "recent_activity": recent_activity,
            "placement_trends": placement_trends,
            "skill_distribution": skill_distribution,
            "last_updated": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting admin dashboard: {e}")
        raise HTTPException(status_code=500, detail="Failed to get admin dashboard")

async def get_recent_activity(db) -> List[Dict[str, Any]]:
    """Get recent system activity."""
    activities = []
    
    # Get recent student registrations
    recent_students = await db.students.find().sort("created_at", -1).to_list(5)
    for student in recent_students:
        activities.append({
            "type": "student_registration",
            "description": f"New student registered: {student['student_id']}",
            "timestamp": student["created_at"],
            "user_id": student["user_id"]
        })
    
    # Get recent resume uploads
    recent_resumes = await db.resumes.find().sort("created_at", -1).to_list(5)
    for resume in recent_resumes:
        activities.append({
            "type": "resume_upload",
            "description": f"Resume uploaded: {resume['file_name']}",
            "timestamp": resume["created_at"],
            "user_id": resume["student_id"]
        })
    
    # Get recent mock interviews
    recent_interviews = await db.interviews.find().sort("created_at", -1).to_list(5)
    for interview in recent_interviews:
        activities.append({
            "type": "mock_interview",
            "description": f"Mock interview completed: {interview['job_role']}",
            "timestamp": interview["created_at"],
            "user_id": interview["student_id"],
            "score": interview.get("overall_score", 0)
        })
    
    # Sort by timestamp
    activities.sort(key=lambda x: x["timestamp"], reverse=True)
    return activities[:10]

async def get_placement_trends(db) -> List[Dict[str, Any]]:
    """Get placement trends over time."""
    # Mock data - in real implementation, this would come from actual placement data
    return [
        {"month": "Jan", "placements": 12, "applications": 45},
        {"month": "Feb", "placements": 19, "applications": 52},
        {"month": "Mar", "placements": 15, "applications": 48},
        {"month": "Apr", "placements": 25, "applications": 61},
        {"month": "May", "placements": 22, "applications": 58},
        {"month": "Jun", "placements": 30, "applications": 72}
    ]

async def get_skill_distribution(db) -> Dict[str, Any]:
    """Get skill distribution across all students."""
    pipeline = [
        {"$group": {
            "_id": None,
            "avg_programming": {"$avg": "$skills.programming"},
            "avg_data_structures": {"$avg": "$skills.data_structures"},
            "avg_web_development": {"$avg": "$skills.web_development"},
            "avg_database": {"$avg": "$skills.database"},
            "avg_communication": {"$avg": "$skills.communication"},
            "avg_problem_solving": {"$avg": "$skills.problem_solving"}
        }}
    ]
    
    result = await db.students.aggregate(pipeline).to_list(1)
    if result:
        data = result[0]
        return {
            "labels": ["Programming", "Database", "Web Dev", "Mobile", "Cloud"],
            "data": [
                round(data["avg_programming"], 1),
                round(data["avg_database"], 1),
                round(data["avg_web_development"], 1),
                15.0,  # Mock mobile data
                10.0   # Mock cloud data
            ]
        }
    
    return {"labels": [], "data": []}

@router.get("/students", response_model=List[Dict[str, Any]])
async def get_all_students_admin(
    limit: int = 50,
    offset: int = 0,
    search: str = None,
    current_user: User = Depends(get_current_admin_user)
):
    """Get all students with pagination and search."""
    try:
        db = get_database()
        
        # Build query
        query = {}
        if search:
            query["$or"] = [
                {"student_id": {"$regex": search, "$options": "i"}},
                {"branch": {"$regex": search, "$options": "i"}}
            ]
        
        # Get students
        students = await db.students.find(query).skip(offset).limit(limit).to_list(limit)
        
        student_list = []
        for student in students:
            # Get user info
            user = await db.users.find_one({"_id": student["user_id"]})
            
            student_list.append({
                "student_id": student["student_id"],
                "name": user["full_name"] if user else "Unknown",
                "email": user["email"] if user else "Unknown",
                "branch": student["branch"],
                "year": student["year"],
                "cgpa": student["cgpa"],
                "readiness_score": student["readiness_score"],
                "resume_score": student.get("resume_score"),
                "mock_interviews_count": student["mock_interviews_count"],
                "created_at": student["created_at"]
            })
        
        # Get total count
        total_count = await db.students.count_documents(query)
        
        return {
            "students": student_list,
            "total": total_count,
            "limit": limit,
            "offset": offset
        }
        
    except Exception as e:
        logger.error(f"Error getting students: {e}")
        raise HTTPException(status_code=500, detail="Failed to get students")

@router.get("/analytics/performance", response_model=Dict[str, Any])
async def get_performance_analytics(current_user: User = Depends(get_current_admin_user)):
    """Get detailed performance analytics."""
    try:
        db = get_database()
        
        # Readiness score distribution
        readiness_distribution = await get_readiness_distribution(db)
        
        # Branch-wise performance
        branch_performance = await get_branch_performance(db)
        
        # Year-wise performance
        year_performance = await get_year_performance(db)
        
        # Top performers
        top_performers = await get_top_performers(db)
        
        # Students needing attention
        attention_needed = await get_students_needing_attention(db)
        
        return {
            "readiness_distribution": readiness_distribution,
            "branch_performance": branch_performance,
            "year_performance": year_performance,
            "top_performers": top_performers,
            "attention_needed": attention_needed
        }
        
    except Exception as e:
        logger.error(f"Error getting performance analytics: {e}")
        raise HTTPException(status_code=500, detail="Failed to get performance analytics")

async def get_readiness_distribution(db) -> Dict[str, Any]:
    """Get readiness score distribution."""
    pipeline = [
        {"$group": {
            "_id": None,
            "excellent": {"$sum": {"$cond": [{"$gte": ["$readiness_score", 80]}, 1, 0]}},
            "good": {"$sum": {"$cond": [{"$and": [{"$gte": ["$readiness_score", 60]}, {"$lt": ["$readiness_score", 80]}]}, 1, 0]}},
            "average": {"$sum": {"$cond": [{"$and": [{"$gte": ["$readiness_score", 40]}, {"$lt": ["$readiness_score", 60]}]}, 1, 0]}},
            "poor": {"$sum": {"$cond": [{"$lt": ["$readiness_score", 40]}, 1, 0]}}
        }}
    ]
    
    result = await db.students.aggregate(pipeline).to_list(1)
    if result:
        data = result[0]
        return {
            "labels": ["Excellent (80+)", "Good (60-79)", "Average (40-59)", "Poor (<40)"],
            "data": [data["excellent"], data["good"], data["average"], data["poor"]]
        }
    
    return {"labels": [], "data": []}

async def get_branch_performance(db) -> List[Dict[str, Any]]:
    """Get branch-wise performance metrics."""
    pipeline = [
        {"$group": {
            "_id": "$branch",
            "count": {"$sum": 1},
            "avg_readiness": {"$avg": "$readiness_score"},
            "avg_cgpa": {"$avg": "$cgpa"}
        }},
        {"$sort": {"avg_readiness": -1}}
    ]
    
    result = await db.students.aggregate(pipeline).to_list(10)
    
    branch_performance = []
    for item in result:
        branch_performance.append({
            "branch": item["_id"],
            "student_count": item["count"],
            "avg_readiness": round(item["avg_readiness"], 2),
            "avg_cgpa": round(item["avg_cgpa"], 2)
        })
    
    return branch_performance

async def get_year_performance(db) -> List[Dict[str, Any]]:
    """Get year-wise performance metrics."""
    pipeline = [
        {"$group": {
            "_id": "$year",
            "count": {"$sum": 1},
            "avg_readiness": {"$avg": "$readiness_score"},
            "avg_cgpa": {"$avg": "$cgpa"}
        }},
        {"$sort": {"_id": 1}}
    ]
    
    result = await db.students.aggregate(pipeline).to_list(10)
    
    year_performance = []
    for item in result:
        year_performance.append({
            "year": item["_id"],
            "student_count": item["count"],
            "avg_readiness": round(item["avg_readiness"], 2),
            "avg_cgpa": round(item["avg_cgpa"], 2)
        })
    
    return year_performance

async def get_top_performers(db) -> List[Dict[str, Any]]:
    """Get top performing students."""
    # Get user info for top performers
    pipeline = [
        {"$sort": {"readiness_score": -1}},
        {"$limit": 10},
        {"$lookup": {
            "from": "users",
            "localField": "user_id",
            "foreignField": "_id",
            "as": "user_info"
        }}
    ]
    
    result = await db.students.aggregate(pipeline).to_list(10)
    
    top_performers = []
    for student in result:
        user_info = student["user_info"][0] if student["user_info"] else {}
        top_performers.append({
            "student_id": student["student_id"],
            "name": user_info.get("full_name", "Unknown"),
            "email": user_info.get("email", "Unknown"),
            "branch": student["branch"],
            "year": student["year"],
            "readiness_score": student["readiness_score"],
            "cgpa": student["cgpa"]
        })
    
    return top_performers

async def get_students_needing_attention(db) -> List[Dict[str, Any]]:
    """Get students who need attention (low readiness scores)."""
    pipeline = [
        {"$match": {"readiness_score": {"$lt": 40}}},
        {"$sort": {"readiness_score": 1}},
        {"$limit": 10},
        {"$lookup": {
            "from": "users",
            "localField": "user_id",
            "foreignField": "_id",
            "as": "user_info"
        }}
    ]
    
    result = await db.students.aggregate(pipeline).to_list(10)
    
    attention_needed = []
    for student in result:
        user_info = student["user_info"][0] if student["user_info"] else {}
        attention_needed.append({
            "student_id": student["student_id"],
            "name": user_info.get("full_name", "Unknown"),
            "email": user_info.get("email", "Unknown"),
            "branch": student["branch"],
            "year": student["year"],
            "readiness_score": student["readiness_score"],
            "cgpa": student["cgpa"],
            "last_active": student.get("updated_at", student["created_at"])
        })
    
    return attention_needed

@router.get("/reports/generate", response_model=Dict[str, Any])
async def generate_report(
    report_type: str = "performance",
    format: str = "json",
    current_user: User = Depends(get_current_admin_user)
):
    """Generate various administrative reports."""
    try:
        db = get_database()
        
        if report_type == "performance":
            report_data = await generate_performance_report(db)
        elif report_type == "placements":
            report_data = await generate_placement_report(db)
        elif report_type == "engagement":
            report_data = await generate_engagement_report(db)
        else:
            raise HTTPException(status_code=400, detail="Invalid report type")
        
        report = {
            "report_type": report_type,
            "generated_at": datetime.utcnow().isoformat(),
            "generated_by": current_user.email,
            "data": report_data
        }
        
        # Save report to database
        await db.reports.insert_one(report)
        
        return report
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating report: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate report")

async def generate_performance_report(db) -> Dict[str, Any]:
    """Generate performance report."""
    total_students = await db.students.count_documents({})
    
    # Get various metrics
    pipeline = [
        {"$group": {
            "_id": None,
            "avg_readiness": {"$avg": "$readiness_score"},
            "avg_cgpa": {"$avg": "$cgpa"},
            "max_readiness": {"$max": "$readiness_score"},
            "min_readiness": {"$min": "$readiness_score"}
        }}
    ]
    
    result = await db.students.aggregate(pipeline).to_list(1)
    stats = result[0] if result else {}
    
    return {
        "total_students": total_students,
        "average_readiness": round(stats.get("avg_readiness", 0), 2),
        "average_cgpa": round(stats.get("avg_cgpa", 0), 2),
        "highest_readiness": stats.get("max_readiness", 0),
        "lowest_readiness": stats.get("min_readiness", 0)
    }

async def generate_placement_report(db) -> Dict[str, Any]:
    """Generate placement report."""
    # Mock placement data
    return {
        "total_placements": 89,
        "placement_rate": 7.2,  # percentage
        "top_companies": [
            {"name": "TechCorp Solutions", "placements": 15},
            {"name": "DataTech Inc", "placements": 12},
            {"name": "CloudSoft Systems", "placements": 10}
        ],
        "average_package": "8.5 LPA",
        "highest_package": "25 LPA"
    }

async def generate_engagement_report(db) -> Dict[str, Any]:
    """Generate user engagement report."""
    # Get engagement metrics
    total_resumes = await db.resumes.count_documents({})
    total_interviews = await db.interviews.count_documents({})
    total_chat_sessions = await db.chat_sessions.count_documents({})
    
    return {
        "total_resumes_uploaded": total_resumes,
        "total_mock_interviews": total_interviews,
        "total_chat_sessions": total_chat_sessions,
        "active_users": await db.users.count_documents({"is_active": True}),
        "avg_engagement_score": 65.0  # Mock calculation
    }
