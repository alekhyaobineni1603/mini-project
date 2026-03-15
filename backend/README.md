# Placement Readiness System Backend

FastAPI-based backend for the AI-powered placement readiness system.

## 🚀 Features

- **Authentication & Authorization**: JWT-based user management
- **Student Management**: Complete student profile and data management
- **Placement Readiness Predictor**: AI-powered readiness scoring
- **Skill Gap Analyzer**: Comprehensive skill analysis and recommendations
- **Resume Analyzer**: File upload and AI analysis
- **AI Mentor Chatbot**: Real-time chat with AI mentors
- **Mock Interview System**: Interactive interview practice
- **Personalized Roadmap**: Learning path generation
- **Company Matching AI**: Smart company recommendations
- **Risk Detection**: Placement risk assessment
- **Admin Dashboard**: Analytics and management

## 🛠️ Technology Stack

- **FastAPI**: Modern Python web framework
- **MongoDB**: NoSQL database with Motor (async)
- **Pydantic**: Data validation and serialization
- **JWT**: Authentication tokens
- **Python-Multipart**: File upload handling
- **PyPDF2 & python-docx**: Resume text extraction

## 📦 Installation

### Prerequisites
- Python 3.8+
- MongoDB (local or Atlas)

### Setup

1. **Clone and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # Unix/MacOS
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   # Copy .env file and update settings
   cp .env.example .env
   ```

5. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

6. **Run the server**
   ```bash
   python run.py
   ```

## 🔧 Configuration

### Environment Variables

```env
# Database
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=placement_readiness_db

# JWT
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# API
API_V1_STR=/api/v1
PROJECT_NAME=Placement Readiness System

# File Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
ALLOWED_EXTENSIONS=.pdf,.doc,.docx

# CORS
ALLOWED_ORIGINS=["http://localhost:3000"]
```

## 📚 API Documentation

### Interactive Docs
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### API Endpoints

#### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user
- `PUT /api/v1/auth/me` - Update user profile

#### Students
- `POST /api/v1/students/` - Create student profile
- `GET /api/v1/students/me` - Get student profile
- `PUT /api/v1/students/me` - Update student profile

#### Readiness Predictor
- `POST /api/v1/readiness/calculate` - Calculate readiness score
- `GET /api/v1/readiness/my-score` - Get current score
- `GET /api/v1/readiness/analytics` - Get readiness analytics

#### Skills Analysis
- `POST /api/v1/skills/analyze` - Analyze skill gaps
- `GET /api/v1/skills/my-skills` - Get current skills
- `PUT /api/v1/skills/my-skills` - Update skills

#### Resume Analyzer
- `POST /api/v1/resume/upload` - Upload and analyze resume
- `GET /api/v1/resume/my-resumes` - Get uploaded resumes
- `GET /api/v1/resume/{id}/analysis` - Get detailed analysis

#### AI Mentor
- `POST /api/v1/mentor/chat/start` - Start chat session
- `POST /api/v1/mentor/chat/{id}/message` - Send message
- `GET /api/v1/mentor/chat/{id}` - Get chat session

#### Mock Interview
- `POST /api/v1/interview/start` - Start mock interview
- `POST /api/v1/interview/{id}/submit` - Submit answers
- `GET /api/v1/interview/{id}` - Get interview details

#### Roadmap
- `GET /api/v1/roadmap/my-roadmap` - Get personalized roadmap
- `PUT /api/v1/roadmap/{week}/complete` - Complete milestone

#### Company Matching
- `POST /api/v1/company/match` - Find company matches
- `GET /api/v1/company/companies` - Get all companies
- `POST /api/v1/company/{id}/apply` - Apply to company

#### Risk Detection
- `POST /api/v1/risk/assess` - Assess placement risk
- `GET /api/v1/risk/my-assessment` - Get risk assessment
- `GET /api/v1/risk/mitigation-plan` - Get mitigation plan

#### Admin Dashboard
- `GET /api/v1/admin/dashboard` - Admin dashboard data
- `GET /api/v1/admin/students` - Get all students
- `GET /api/v1/admin/analytics/performance` - Performance analytics

## 🗄️ Database Schema

### Collections

1. **users**: User authentication and profile
2. **students**: Student academic and skill data
3. **resumes**: Resume uploads and analysis
4. **interviews**: Mock interview sessions
5. **chat_sessions**: AI mentor chat sessions
6. **companies**: Company database
7. **applications**: Job applications
8. **roadmaps**: Personalized learning roadmaps
9. **risk_assessments**: Risk assessment data
10. **reports**: Admin reports

### Indexes

- Users: email (unique), student_id (unique)
- Students: user_id, student_id (unique)
- Resumes: student_id, uploaded_at
- Interviews: student_id, interview_date
- Chat Messages: student_id, timestamp

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- CORS configuration
- Input validation with Pydantic
- File upload security
- Rate limiting ready

## 🧪 Testing

### Running Tests
```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest tests/

# Run with coverage
pytest --cov=app tests/
```

### Postman Collection
Import the provided Postman collection to test all API endpoints.

## 📊 Monitoring & Logging

- Structured logging with Python logging
- Request/response logging
- Error tracking
- Performance monitoring ready

## 🚀 Deployment

### Docker
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Variables for Production
```env
DEBUG=False
ENVIRONMENT=production
SECRET_KEY=your-production-secret-key
MONGODB_URL=mongodb+srv://user:pass@cluster.mongodb.net/db
```

## 🔄 API Rate Limiting

Ready for rate limiting implementation:
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.get("/api/v1/protected")
@limiter.limit("100/minute")
async def protected_endpoint():
    return {"message": "This is rate limited"}
```

## 📈 Performance Optimization

- Async/await for all database operations
- Connection pooling with MongoDB
- Efficient aggregation pipelines
- Pagination for large datasets
- Caching ready implementation

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## 📄 License

MIT License

## 🆘 Support

For issues and questions:
1. Check the API documentation
2. Review the logs
3. Create an issue with detailed information

---

**Built with ❤️ using FastAPI and MongoDB**
