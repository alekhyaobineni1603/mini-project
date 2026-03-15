from fastapi import APIRouter, Depends, HTTPException
from models import User, Roadmap, Milestone
from auth import get_current_active_user
from database import get_database
from typing import Dict, Any, List
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)
router = APIRouter()

def generate_personalized_roadmap(student_skills: Dict, target_role: str = "Software Engineer") -> Roadmap:
    """Generate a personalized learning roadmap based on student skills and target role."""
    
    # Define roadmap templates for different roles
    roadmap_templates = {
        "Software Engineer": [
            {
                "week": 1,
                "title": "Foundation Strengthening",
                "description": "Core programming concepts and data structures",
                "topics": ["Variables & Data Types", "Control Structures", "Functions", "Arrays & Strings", "Linked Lists"],
                "assignments": 5,
                "status": "completed"
            },
            {
                "week": 2,
                "title": "Advanced Data Structures",
                "description": "Trees, graphs, and advanced algorithms",
                "topics": ["Trees & Binary Trees", "Graphs", "Dynamic Programming", "Greedy Algorithms", "Backtracking"],
                "assignments": 4,
                "status": "completed"
            },
            {
                "week": 3,
                "title": "Web Development Basics",
                "description": "Frontend and backend fundamentals",
                "topics": ["HTML/CSS", "JavaScript Basics", "DOM Manipulation", "HTTP Protocol", "REST APIs"],
                "assignments": 3,
                "status": "in_progress"
            },
            {
                "week": 4,
                "title": "Web Development Advanced",
                "description": "Modern frameworks and deployment",
                "topics": ["React/Vue/Angular", "Node.js", "Database Integration", "Authentication", "Deployment"],
                "assignments": 4,
                "status": "upcoming"
            },
            {
                "week": 5,
                "title": "Database Management",
                "description": "SQL and NoSQL databases",
                "topics": ["SQL Fundamentals", "Database Design", "Indexing & Optimization", "NoSQL Basics", "MongoDB"],
                "assignments": 4,
                "status": "upcoming"
            },
            {
                "week": 6,
                "title": "Database Advanced",
                "description": "Advanced database concepts",
                "topics": ["Transactions", "ACID Properties", "Distributed Databases", "Caching Strategies", "Performance Tuning"],
                "assignments": 3,
                "status": "upcoming"
            },
            {
                "week": 7,
                "title": "System Design",
                "description": "Architectural patterns and design",
                "topics": ["System Design Basics", "Scalability", "Load Balancing", "Microservices", "API Design"],
                "assignments": 2,
                "status": "upcoming"
            },
            {
                "week": 8,
                "title": "System Design Advanced",
                "description": "Complex system design",
                "topics": ["Distributed Systems", "Message Queues", "Caching Systems", "CDN Design", "Rate Limiting"],
                "assignments": 3,
                "status": "upcoming"
            },
            {
                "week": 9,
                "title": "DevOps & Cloud",
                "description": "Cloud computing and deployment",
                "topics": ["Git & Version Control", "CI/CD Pipeline", "Docker", "Kubernetes Basics", "Cloud Platforms"],
                "assignments": 3,
                "status": "upcoming"
            },
            {
                "week": 10,
                "title": "Testing & Quality",
                "description": "Software testing and quality assurance",
                "topics": ["Unit Testing", "Integration Testing", "Test-Driven Development", "Code Quality", "Debugging"],
                "assignments": 4,
                "status": "upcoming"
            },
            {
                "week": 11,
                "title": "Interview Preparation",
                "description": "Technical interview preparation",
                "topics": ["Problem Solving", "Algorithm Practice", "System Design Interviews", "Behavioral Questions", "Mock Interviews"],
                "assignments": 5,
                "status": "upcoming"
            },
            {
                "week": 12,
                "title": "Final Project",
                "description": "Capstone project and portfolio building",
                "topics": ["Project Planning", "Implementation", "Testing", "Documentation", "Deployment"],
                "assignments": 1,
                "status": "upcoming"
            }
        ],
        "Data Scientist": [
            {
                "week": 1,
                "title": "Python for Data Science",
                "description": "Python fundamentals for data analysis",
                "topics": ["NumPy", "Pandas", "Data Cleaning", "Data Visualization", "Statistical Basics"],
                "assignments": 4,
                "status": "completed"
            },
            {
                "week": 2,
                "title": "Machine Learning Basics",
                "description": "Introduction to machine learning",
                "topics": ["Supervised Learning", "Unsupervised Learning", "Model Evaluation", "Feature Engineering", "Cross Validation"],
                "assignments": 3,
                "status": "completed"
            },
            # ... more weeks for Data Scientist
        ]
    }
    
    # Get the appropriate template
    template = roadmap_templates.get(target_role, roadmap_templates["Software Engineer"])
    
    # Calculate progress based on completed milestones
    completed_milestones = sum(1 for m in template if m["status"] == "completed")
    progress_percentage = (completed_milestones / len(template)) * 100
    
    # Find current week
    current_week = completed_milestones + 1
    if current_week > len(template):
        current_week = len(template)
    
    # Convert to Milestone objects
    milestones = []
    for week_data in template:
        milestones.append(Milestone(**week_data))
    
    return Roadmap(
        student_id="",  # Will be set by the calling function
        total_weeks=12,
        current_week=current_week,
        progress_percentage=round(progress_percentage, 2),
        milestones=milestones
    )

def get_next_milestone_roadmap(roadmap: Roadmap) -> Dict[str, Any]:
    """Get the next milestone and recommendations."""
    current_milestone = None
    next_milestone = None
    
    for milestone in roadmap.milestones:
        if milestone.status == "in_progress":
            current_milestone = milestone
            break
        elif milestone.status == "upcoming" and not next_milestone:
            next_milestone = milestone
    
    recommendations = []
    if current_milestone:
        recommendations.extend([
            f"Focus on completing {current_milestone.title}",
            f"Complete {current_milestone.assignments} assignments this week",
            "Practice the topics covered in current milestone"
        ])
    
    if next_milestone:
        recommendations.extend([
            f"Prepare for {next_milestone.title}",
            "Review prerequisite topics",
            "Set up development environment for next milestone"
        ])
    
    return {
        "current_milestone": current_milestone.dict() if current_milestone else None,
        "next_milestone": next_milestone.dict() if next_milestone else None,
        "recommendations": recommendations,
        "deadline": (datetime.utcnow() + timedelta(days=7)).strftime("%Y-%m-%d")
    }

@router.get("/my-roadmap", response_model=Dict[str, Any])
async def get_my_roadmap(
    target_role: str = "Software Engineer",
    current_user: User = Depends(get_current_active_user)
):
    """Get personalized learning roadmap."""
    try:
        db = get_database()
        
        # Get student data
        student = await db.students.find_one({"user_id": str(current_user.id)})
        if not student:
            raise HTTPException(status_code=404, detail="Student profile not found")
        
        # Generate personalized roadmap
        roadmap = generate_personalized_roadmap(student["skills"], target_role)
        roadmap.student_id = str(current_user.id)
        
        # Save or update roadmap in database
        existing_roadmap = await db.roadmaps.find_one({"student_id": str(current_user.id)})
        if existing_roadmap:
            await db.roadmaps.update_one(
                {"student_id": str(current_user.id)},
                {"$set": roadmap.dict()}
            )
        else:
            await db.roadmaps.insert_one(roadmap.dict())
        
        # Get next milestone information
        next_milestone_info = get_next_milestone_roadmap(roadmap)
        
        logger.info(f"Roadmap generated for user {current_user.email}")
        
        return {
            "roadmap": roadmap.dict(),
            "next_milestone": next_milestone_info,
            "target_role": target_role
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating roadmap: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate roadmap")

@router.put("/roadmap/{week_id}/complete", response_model=Dict[str, Any])
async def complete_milestone(
    week_id: int,
    current_user: User = Depends(get_current_active_user)
):
    """Mark a milestone as completed."""
    try:
        db = get_database()
        
        # Update milestone status
        result = await db.roadmaps.update_one(
            {"student_id": str(current_user.id), "milestones.week": week_id},
            {"$set": {"milestones.$.status": "completed"}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Milestone not found")
        
        # Recalculate progress
        roadmap_doc = await db.roadmaps.find_one({"student_id": str(current_user.id)})
        if roadmap_doc:
            completed_count = sum(1 for m in roadmap_doc["milestones"] if m["status"] == "completed")
            progress = (completed_count / len(roadmap_doc["milestones"])) * 100
            
            await db.roadmaps.update_one(
                {"student_id": str(current_user.id)},
                {"$set": {"progress_percentage": progress, "current_week": completed_count + 1}}
            )
        
        logger.info(f"Milestone {week_id} completed by user {current_user.email}")
        
        return {"message": "Milestone marked as completed", "progress_percentage": progress}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error completing milestone: {e}")
        raise HTTPException(status_code=500, detail="Failed to complete milestone")

@router.get("/roadmap/progress", response_model=Dict[str, Any])
async def get_roadmap_progress(current_user: User = Depends(get_current_active_user)):
    """Get roadmap progress analytics."""
    try:
        db = get_database()
        
        roadmap = await db.roadmaps.find_one({"student_id": str(current_user.id)})
        if not roadmap:
            raise HTTPException(status_code=404, detail="Roadmap not found")
        
        # Calculate progress metrics
        completed_milestones = [m for m in roadmap["milestones"] if m["status"] == "completed"]
        in_progress_milestones = [m for m in roadmap["milestones"] if m["status"] == "in_progress"]
        upcoming_milestones = [m for m in roadmap["milestones"] if m["status"] == "upcoming"]
        
        # Generate progress data for charts
        progress_data = []
        cumulative_progress = 0
        for milestone in roadmap["milestones"]:
            if milestone["status"] == "completed":
                cumulative_progress += (100 / len(roadmap["milestones"]))
            progress_data.append({
                "week": milestone["week"],
                "title": milestone["title"],
                "progress": cumulative_progress
            })
        
        return {
            "overall_progress": roadmap["progress_percentage"],
            "completed_count": len(completed_milestones),
            "in_progress_count": len(in_progress_milestones),
            "upcoming_count": len(upcoming_milestones),
            "current_week": roadmap["current_week"],
            "total_weeks": roadmap["total_weeks"],
            "progress_data": progress_data,
            "estimated_completion": (datetime.utcnow() + timedelta(weeks=roadmap["total_weeks"] - roadmap["current_week"])).strftime("%Y-%m-%d")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting roadmap progress: {e}")
        raise HTTPException(status_code=500, detail="Failed to get roadmap progress")

@router.get("/roadmap/resources/{week_id}", response_model=Dict[str, Any])
async def get_milestone_resources(
    week_id: int,
    current_user: User = Depends(get_current_active_user)
):
    """Get learning resources for a specific milestone."""
    try:
        db = get_database()
        
        roadmap = await db.roadmaps.find_one({"student_id": str(current_user.id)})
        if not roadmap:
            raise HTTPException(status_code=404, detail="Roadmap not found")
        
        # Find the milestone
        milestone = None
        for m in roadmap["milestones"]:
            if m["week"] == week_id:
                milestone = m
                break
        
        if not milestone:
            raise HTTPException(status_code=404, detail="Milestone not found")
        
        # Generate resources based on topics
        resources = []
        for topic in milestone["topics"]:
            resources.extend([
                {
                    "type": "video",
                    "title": f"Understanding {topic}",
                    "url": f"https://example.com/video/{topic.lower().replace(' ', '-')}",
                    "duration": "45 min",
                    "provider": "YouTube"
                },
                {
                    "type": "article",
                    "title": f"{topic} - Complete Guide",
                    "url": f"https://example.com/article/{topic.lower().replace(' ', '-')}",
                    "read_time": "15 min",
                    "provider": "Medium"
                },
                {
                    "type": "practice",
                    "title": f"{topic} Practice Problems",
                    "url": f"https://example.com/practice/{topic.lower().replace(' ', '-')}",
                    "difficulty": "Medium",
                    "provider": "LeetCode"
                }
            ])
        
        return {
            "milestone": milestone,
            "resources": resources,
            "recommended_order": ["video", "article", "practice"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting milestone resources: {e}")
        raise HTTPException(status_code=500, detail="Failed to get milestone resources")
