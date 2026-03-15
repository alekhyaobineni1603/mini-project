from fastapi import APIRouter, Depends, HTTPException
from models import User, Interview, InterviewCreate, InterviewQuestion, InterviewFeedback, InterviewType, DifficultyLevel
from auth import get_current_active_user
from database import get_database
from typing import Dict, Any, List
import logging
from datetime import datetime
import random

logger = logging.getLogger(__name__)
router = APIRouter()

# Interview question database
INTERVIEW_QUESTIONS = {
    "technical": {
        "beginner": [
            "What is the difference between list and tuple in Python?",
            "Explain what a REST API is.",
            "What is the difference between SQL and NoSQL databases?",
            "What is the purpose of Git in software development?",
            "Explain the concept of object-oriented programming."
        ],
        "intermediate": [
            "How would you optimize a slow database query?",
            "Explain the difference between synchronous and asynchronous programming.",
            "What is the difference between authentication and authorization?",
            "How would you handle a large-scale data processing task?",
            "Explain the concept of microservices architecture."
        ],
        "advanced": [
            "Design a system for a social media feed like Twitter.",
            "How would you implement a distributed cache system?",
            "Explain the CAP theorem and its implications.",
            "How would you design a rate limiting system?",
            "What are the trade-offs between different database sharding strategies?"
        ]
    },
    "behavioral": {
        "beginner": [
            "Tell me about yourself.",
            "Why do you want to work for our company?",
            "What are your strengths and weaknesses?",
            "How do you handle stress and pressure?",
            "Describe a time you worked in a team."
        ],
        "intermediate": [
            "Tell me about a time you faced a difficult challenge.",
            "How do you handle conflicts with team members?",
            "Describe a project you're proud of and why.",
            "How do you stay updated with technology trends?",
            "What's your approach to learning new technologies?"
        ],
        "advanced": [
            "Tell me about a time you had to make a difficult technical decision.",
            "How do you handle competing priorities and deadlines?",
            "Describe a situation where you had to influence others.",
            "How do you approach problem-solving in complex situations?",
            "Tell me about a time you failed and what you learned."
        ]
    },
    "problem_solving": {
        "beginner": [
            "How many golf balls can fit in a school bus?",
            "Why are manhole covers round?",
            "How would you test a calculator?",
            "How many windows are in New York City?",
            "How would you design a better coffee mug?"
        ],
        "intermediate": [
            "Design an elevator system for a 100-story building.",
            "How would you improve the traffic system in your city?",
            "Design a parking lot system.",
            "How would you organize a large library?",
            "Design a system for online food delivery."
        ],
        "advanced": [
            "Design a global payment system like PayPal.",
            "How would you design a ride-sharing app like Uber?",
            "Design a system for real-time stock trading.",
            "How would you build a scalable video streaming platform?",
            "Design a system for autonomous vehicle coordination."
        ]
    },
    "system_design": {
        "beginner": [
            "Design a URL shortening service.",
            "Design a simple chat application.",
            "Design a basic blogging platform.",
            "Design a todo list application.",
            "Design a simple e-commerce cart."
        ],
        "intermediate": [
            "Design a social media platform like LinkedIn.",
            "Design a ticket booking system.",
            "Design a file sharing service like Dropbox.",
            "Design a real-time messaging app.",
            "Design a content management system."
        ],
        "advanced": [
            "Design a distributed database system.",
            "Design a global CDN system.",
            "Design a real-time analytics platform.",
            "Design a distributed logging system.",
            "Design a microservices monitoring system."
        ]
    }
}

def generate_interview_questions(interview_type: str, difficulty: str, count: int = 5) -> List[InterviewQuestion]:
    """Generate interview questions based on type and difficulty."""
    questions_pool = INTERVIEW_QUESTIONS.get(interview_type, {}).get(difficulty, [])
    
    if not questions_pool:
        questions_pool = INTERVIEW_QUESTIONS["technical"]["beginner"]
    
    selected_questions = random.sample(questions_pool, min(count, len(questions_pool)))
    
    interview_questions = []
    for i, question_text in enumerate(selected_questions):
        interview_questions.append(InterviewQuestion(
            question=question_text,
            interview_type=interview_type,
            difficulty=difficulty,
            expected_answer=get_sample_answer(question_text, interview_type)
        ))
    
    return interview_questions

def get_sample_answer(question: str, interview_type: str) -> str:
    """Get sample answer for a question (for reference)."""
    return f"Sample answer for: {question[:50]}... (This would be a detailed response in a real system)"

def analyze_interview_performance(questions: List[InterviewQuestion], answers: List[str]) -> InterviewFeedback:
    """Analyze interview performance and provide feedback."""
    if len(questions) != len(answers):
        raise ValueError("Questions and answers count mismatch")
    
    scores = []
    strengths = []
    weaknesses = []
    suggestions = []
    
    for i, (question, answer) in enumerate(zip(questions, answers)):
        # Simple scoring based on answer length and content (in real system, use NLP)
        answer_length = len(answer.split())
        
        if answer_length < 10:
            score = 30  # Very short answer
            weaknesses.append(f"Question {i+1}: Answer too brief")
            suggestions.append("Provide more detailed and comprehensive answers")
        elif answer_length < 30:
            score = 60  # Moderate answer
            suggestions.append(f"Question {i+1}: Add more specific examples")
        else:
            score = 85  # Good answer
            strengths.append(f"Question {i+1}: Well-explained answer")
        
        scores.append(score)
    
    overall_score = sum(scores) / len(scores) if scores else 0
    
    # Generate overall feedback
    if overall_score >= 80:
        strengths.append("Strong communication skills")
        strengths.append("Good technical knowledge")
    elif overall_score >= 60:
        suggestions.append("Practice more technical questions")
        suggestions.append("Work on providing structured answers")
    else:
        weaknesses.append("Need more preparation")
        weaknesses.append("Improve technical fundamentals")
        suggestions.append("Study core concepts thoroughly")
        suggestions.append("Practice mock interviews regularly")
    
    return InterviewFeedback(
        score=round(overall_score, 2),
        strengths=strengths,
        weaknesses=weaknesses,
        suggestions=suggestions
    )

@router.post("/start", response_model=Dict[str, Any])
async def start_mock_interview(
    interview_data: Dict[str, Any],
    current_user: User = Depends(get_current_active_user)
):
    """Start a mock interview session."""
    try:
        job_role = interview_data.get("job_role", "Software Engineer")
        interview_type = interview_data.get("interview_type", "technical")
        difficulty = interview_data.get("difficulty", "intermediate")
        
        # Generate questions
        questions = generate_interview_questions(interview_type, difficulty)
        
        # Create interview session
        interview = Interview(
            student_id=str(current_user.id),
            job_role=job_role,
            interview_type=interview_type,
            difficulty=difficulty,
            questions=questions,
            answers=[],
            feedback=InterviewFeedback(score=0, strengths=[], weaknesses=[], suggestions=[]),
            overall_score=0,
            duration_minutes=0
        )
        
        db = get_database()
        result = await db.interviews.insert_one(interview.dict())
        
        logger.info(f"Mock interview started for user {current_user.email}")
        
        return {
            "interview_id": str(result.inserted_id),
            "job_role": job_role,
            "interview_type": interview_type,
            "difficulty": difficulty,
            "questions": [q.dict() for q in questions],
            "total_questions": len(questions)
        }
        
    except Exception as e:
        logger.error(f"Error starting mock interview: {e}")
        raise HTTPException(status_code=500, detail="Failed to start mock interview")

@router.post("/interview/{interview_id}/submit", response_model=Dict[str, Any])
async def submit_interview_answers(
    interview_id: str,
    answers: List[str],
    current_user: User = Depends(get_current_active_user)
):
    """Submit interview answers and get feedback."""
    try:
        db = get_database()
        
        # Get interview
        interview = await db.interviews.find_one({
            "_id": interview_id,
            "student_id": str(current_user.id)
        })
        
        if not interview:
            raise HTTPException(status_code=404, detail="Interview not found")
        
        # Convert questions to InterviewQuestion objects
        questions = [InterviewQuestion(**q) for q in interview["questions"]]
        
        # Analyze performance
        feedback = analyze_interview_performance(questions, answers)
        
        # Update interview with results
        await db.interviews.update_one(
            {"_id": interview_id},
            {
                "$set": {
                    "answers": answers,
                    "feedback": feedback.dict(),
                    "overall_score": feedback.score,
                    "completed_at": datetime.utcnow()
                }
            }
        )
        
        # Update student's interview count
        await db.students.update_one(
            {"user_id": str(current_user.id)},
            {"$inc": {"mock_interviews_count": 1}}
        )
        
        logger.info(f"Interview answers submitted for user {current_user.email}, score: {feedback.score}")
        
        return {
            "interview_id": interview_id,
            "feedback": feedback.dict(),
            "overall_score": feedback.score,
            "completed_at": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error submitting interview answers: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit answers")

@router.get("/interview/{interview_id}", response_model=Dict[str, Any])
async def get_interview_details(
    interview_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Get interview details and feedback."""
    try:
        db = get_database()
        
        interview = await db.interviews.find_one({
            "_id": interview_id,
            "student_id": str(current_user.id)
        })
        
        if not interview:
            raise HTTPException(status_code=404, detail="Interview not found")
        
        return {
            "interview_id": str(interview["_id"]),
            "job_role": interview["job_role"],
            "interview_type": interview["interview_type"],
            "difficulty": interview["difficulty"],
            "questions": interview["questions"],
            "answers": interview.get("answers", []),
            "feedback": interview.get("feedback"),
            "overall_score": interview.get("overall_score"),
            "created_at": interview["created_at"],
            "completed_at": interview.get("completed_at")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting interview details: {e}")
        raise HTTPException(status_code=500, detail="Failed to get interview details")

@router.get("/my-interviews", response_model=List[Dict[str, Any]])
async def get_my_interviews(current_user: User = Depends(get_current_active_user)):
    """Get all mock interviews for the current user."""
    try:
        db = get_database()
        interviews = await db.interviews.find(
            {"student_id": str(current_user.id)}
        ).sort("created_at", -1).to_list(20)
        
        interview_list = []
        for interview in interviews:
            interview_list.append({
                "interview_id": str(interview["_id"]),
                "job_role": interview["job_role"],
                "interview_type": interview["interview_type"],
                "difficulty": interview["difficulty"],
                "overall_score": interview.get("overall_score"),
                "created_at": interview["created_at"],
                "completed_at": interview.get("completed_at"),
                "status": "completed" if interview.get("completed_at") else "in_progress"
            })
        
        return interview_list
        
    except Exception as e:
        logger.error(f"Error getting interviews: {e}")
        raise HTTPException(status_code=500, detail="Failed to get interviews")

@router.get("/questions", response_model=Dict[str, Any])
async def get_interview_questions():
    """Get available interview question types and difficulties."""
    return {
        "interview_types": [
            {"value": "technical", "label": "Technical"},
            {"value": "behavioral", "label": "Behavioral"},
            {"value": "problem_solving", "label": "Problem Solving"},
            {"value": "system_design", "label": "System Design"}
        ],
        "difficulty_levels": [
            {"value": "beginner", "label": "Beginner"},
            {"value": "intermediate", "label": "Intermediate"},
            {"value": "advanced", "label": "Advanced"}
        ],
        "job_roles": [
            "Software Engineer",
            "Data Scientist",
            "Product Manager",
            "DevOps Engineer",
            "UI/UX Designer"
        ]
    }
