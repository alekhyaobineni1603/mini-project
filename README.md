# Placement Readiness System

A comprehensive AI-powered placement readiness system designed to help students prepare for campus placements and career opportunities.

## 🚀 Features

### Core Modules (8)

1. **Placement Readiness Predictor** - Interactive form with sliders for CGPA, technical skills, communication, projects, and aptitude with real-time readiness score calculation
2. **Skill Gap Analyzer** - Visual radar chart showing skill strengths/weaknesses with improvement suggestions
3. **Resume Analyzer** - File upload interface with simulated NLP analysis and scoring
4. **Mock Interview Practice** - Question-answer flow with feedback mechanism
5. **Personalized Roadmap** - Timeline view with weekly milestones and resources
6. **Admin Dashboard** - Analytics charts and student performance metrics
7. **Company Matching AI** - AI-powered company recommendations based on skills and preferences
8. **Placement Risk Detection** - AI-powered risk detection based on skills and preferences

## 🛠️ Technology Stack

### Frontend
- **HTML5** - Semantic markup
- **Tailwind CSS** - Modern, utility-first CSS framework
- **JavaScript (ES6+)** - Modern JavaScript with modular architecture
- **Chart.js** - Interactive data visualization
- **Font Awesome** - Professional icons

### Backend
- **FastAPI** - Modern Python web framework
- **MongoDB** - NoSQL database with Motor (async)
- **Pydantic** - Data validation and serialization
- **JWT** - Authentication tokens
- **Python-Multipart** - File upload handling

### Design Features
- Responsive design for all screen sizes
- Modern card-based layout
- Smooth animations and transitions
- Professional color palette
- Clean typography
- Loading states and error handling

## 📦 Installation & Setup

### Prerequisites
- Node.js (optional, for live server)
- Python 3.8+
- MongoDB (local or Atlas)

### Frontend Setup
1. Navigate to project directory
2. Open `index.html` in browser
   - Or run `npm install && npm start` for live server

### Backend Setup
1. **Navigate to backend directory**
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
   # Update .env file with your settings
   ```

5. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

6. **Run the backend server**
   ```bash
   python run.py
   ```

## 📚 API Documentation

### Interactive Docs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key API Endpoints

#### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user

#### Core Features
- `POST /api/v1/readiness/calculate` - Calculate readiness score
- `POST /api/v1/skills/analyze` - Analyze skill gaps
- `POST /api/v1/resume/upload` - Upload and analyze resume
- `POST /api/v1/mentor/chat/start` - Start chat session
- `POST /api/v1/interview/start` - Start mock interview
- `GET /api/v1/roadmap/my-roadmap` - Get personalized roadmap
- `POST /api/v1/company/match` - Find company matches
- `POST /api/v1/risk/assess` - Assess placement risk
- `GET /api/v1/admin/dashboard` - Admin dashboard data

## 🎯 Usage

### For Students
1. **Login**: Use credentials or register new account
2. **Dashboard**: View placement readiness score and quick stats
3. **Modules**: Click on any module card to access features
4. **Interactive Tools**: Use sliders, forms, and chat interfaces
5. **Progress Tracking**: Monitor improvement over time

### For Administrators
1. **Switch View**: Click "Admin View" to access admin dashboard
2. **Analytics**: View student performance and placement trends
3. **Management**: Monitor system usage and student progress

## �️ Database Schema

### Collections
- **users**: User authentication and profile
- **students**: Student academic and skill data
- **resumes**: Resume uploads and analysis
- **interviews**: Mock interview sessions
- **chat_sessions**: AI mentor chat sessions
- **companies**: Company database
- **applications**: Job applications
- **roadmaps**: Personalized learning roadmaps
- **risk_assessments**: Risk assessment data
- **reports**: Admin reports

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- CORS configuration
- Input validation with Pydantic
- File upload security

## �📊 Data & Analytics

### Mock Data
The system uses realistic mock data for demonstration:
- Student profiles and performance metrics
- Company information and match scores
- Risk assessment calculations
- Learning progress tracking

### Charts & Visualizations
- **Radar Charts**: Skill analysis and comparison
- **Line Charts**: Progress tracking and trends
- **Bar Charts**: Company match scores
- **Doughnut Charts**: Skill distribution
- **Progress Bars**: Visual skill levels

## � Deployment

### Frontend
- GitHub Pages
- Netlify
- Vercel
- Any static hosting service

### Backend
- Docker support included
- Environment variables for production
- MongoDB Atlas for cloud database

## 🎨 UI/UX Features

### Design Principles
- **Modern & Clean**: Professional appearance for hackathons
- **Responsive**: Works seamlessly on desktop, tablet, and mobile
- **Interactive**: Smooth animations and micro-interactions
- **Accessible**: Semantic HTML and ARIA-friendly components
- **Intuitive**: Clear navigation and user flow

### Components
- Card-based module layout
- Modal windows for detailed views
- Interactive forms with real-time validation
- Chat interface with typing indicators
- Progress tracking with visual feedback

## 🧪 Testing

### Frontend
- Manual testing in browser
- Responsive design testing
- Cross-browser compatibility

### Backend
- API testing with Postman
- Automated testing framework ready
- Error handling validation

## � Performance

### Frontend
- Lazy loading of modules
- Optimized chart rendering
- Efficient DOM manipulation
- Minimal bundle size

### Backend
- Async/await for all operations
- Database connection pooling
- Efficient aggregation pipelines
- Pagination for large datasets

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## 📄 License

MIT License - feel free to use and modify for your projects

## 🆘 Support

For questions, suggestions, or issues:
- Check API documentation
- Review code comments
- Create issue with detailed information

## 🎯 Perfect For

- **Hackathons**: Complete, impressive demonstration
- **Educational Institutions**: Career services and placement cells
- **Training Centers**: Skill development programs
- **Corporate Training**: Employee readiness assessment

---

**Built with ❤️ for student success and career development**

### Quick Start Commands

```bash
# Frontend
npm start

# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

### Demo Credentials
- **Email**: student@example.com
- **Password**: password123
