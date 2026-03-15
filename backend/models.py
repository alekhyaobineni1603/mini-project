from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
from bson import ObjectId


class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")


class UserRole(str, Enum):
    STUDENT = "student"
    ADMIN = "admin"


class InterviewType(str, Enum):
    TECHNICAL = "technical"
    BEHAVIORAL = "behavioral"
    PROBLEM_SOLVING = "problem_solving"
    SYSTEM_DESIGN = "system_design"


class DifficultyLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class CompanySize(str, Enum):
    STARTUP = "startup"
    SMALL = "small"
    MEDIUM = "medium"
    LARGE = "large"


# Base Models
class BaseSchema(BaseModel):
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class TimestampMixin(BaseModel):
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# User Models
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole = UserRole.STUDENT


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None


class User(UserBase, TimestampMixin):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    is_active: bool = True
    hashed_password: str

    class Config:
        populate_by_name = True


# Student Models
class SkillsData(BaseModel):
    programming: int = Field(..., ge=0, le=100)
    data_structures: int = Field(..., ge=0, le=100)
    web_development: int = Field(..., ge=0, le=100)
    database: int = Field(..., ge=0, le=100)
    communication: int = Field(..., ge=0, le=100)
    problem_solving: int = Field(..., ge=0, le=100)


class StudentBase(BaseModel):
    student_id: str
    cgpa: float = Field(..., ge=0.0, le=10.0)
    branch: str
    year: int = Field(..., ge=1, le=4)
    skills: SkillsData
    projects_count: int = Field(default=0, ge=0)
    internships_count: int = Field(default=0, ge=0)


class StudentCreate(StudentBase):
    user_id: str


class StudentUpdate(BaseModel):
    cgpa: Optional[float] = None
    branch: Optional[str] = None
    year: Optional[int] = None
    skills: Optional[SkillsData] = None
    projects_count: Optional[int] = None
    internships_count: Optional[int] = None


class Student(StudentBase, TimestampMixin):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    user_id: str
    readiness_score: float = Field(default=0.0, ge=0.0, le=100.0)
    resume_score: Optional[float] = None
    mock_interviews_count: int = Field(default=0, ge=0)


# Resume Models
class ResumeAnalysis(BaseModel):
    overall_score: float = Field(..., ge=0.0, le=100.0)
    ats_compatibility: float = Field(..., ge=0.0, le=10.0)
    contact_info: bool = True
    professional_summary: bool = True
    skills_section: bool = True
    experience_description: bool = True
    recommendations: List[str] = []


class ResumeBase(BaseModel):
    file_name: str
    file_size: int
    file_type: str


class ResumeCreate(ResumeBase):
    student_id: str
    analysis: ResumeAnalysis


class Resume(ResumeBase, TimestampMixin):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    student_id: str
    analysis: ResumeAnalysis
    file_path: str


# Interview Models
class InterviewQuestion(BaseModel):
    question: str
    question_type: InterviewType
    difficulty: DifficultyLevel
    expected_answer: Optional[str] = None


class InterviewFeedback(BaseModel):
    score: float = Field(..., ge=0.0, le=100.0)
    strengths: List[str] = []
    weaknesses: List[str] = []
    suggestions: List[str] = []


class InterviewBase(BaseModel):
    job_role: str
    interview_type: InterviewType
    difficulty: DifficultyLevel


class InterviewCreate(InterviewBase):
    student_id: str
    questions: List[InterviewQuestion]
    answers: List[str]


class Interview(InterviewBase, TimestampMixin):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    student_id: str
    questions: List[InterviewQuestion]
    answers: List[str]
    feedback: InterviewFeedback
    overall_score: float = Field(..., ge=0.0, le=100.0)
    duration_minutes: int


# Company Models
class CompanyBase(BaseModel):
    name: str
    industry: str
    description: str
    location: str
    size: CompanySize
    website: Optional[str] = None
    roles_offered: List[str] = []


class CompanyCreate(CompanyBase):
    pass


class Company(CompanyBase, TimestampMixin):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")


class CompanyMatch(BaseModel):
    company_id: str
    match_score: float = Field(..., ge=0.0, le=100.0)
    match_reasons: List[str] = []


# Risk Assessment Models
class RiskFactor(BaseModel):
    factor: str
    risk_level: str  # low, medium, high
    score: float = Field(..., ge=0.0, le=100.0)
    description: str
    mitigation_strategy: str


class RiskAssessment(BaseModel):
    overall_risk_level: float = Field(..., ge=0.0, le=100.0)
    success_probability: float = Field(..., ge=0.0, le=100.0)
    months_to_ready: float = Field(..., ge=0.0)
    risk_factors: List[RiskFactor] = []
    mitigation_strategies: List[str] = []


# Roadmap Models
class Milestone(BaseModel):
    week: int
    title: str
    description: str
    topics: List[str] = []
    assignments: int = 0
    status: str = "upcoming"  # completed, in_progress, upcoming


class Roadmap(BaseModel):
    student_id: str
    total_weeks: int = 12
    current_week: int = 1
    progress_percentage: float = Field(default=0.0, ge=0.0, le=100.0)
    milestones: List[Milestone] = []


# API Response Models
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


# Response Models for API
class StudentResponse(BaseModel):
    student: Student
    readiness_score: float


class ResumeResponse(BaseModel):
    resume: Resume
    analysis: ResumeAnalysis


class InterviewResponse(BaseModel):
    interview: Interview
    feedback: InterviewFeedback


class CompanyMatchResponse(BaseModel):
    matches: List[CompanyMatch]


class RiskAssessmentResponse(BaseModel):
    assessment: RiskAssessment


class RoadmapResponse(BaseModel):
    roadmap: Roadmap
