// API Configuration and Service Layer-test
class APIService {
    constructor() {
        this.baseURL = 'http://localhost:8000/api/v1';
        this.token = localStorage.getItem('token');
    }

    // Utility methods
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'API request failed');
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    }

    clearToken() {
        this.token = null;
        localStorage.removeItem('token');
    }

    // Authentication APIs
    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }

    async login(email, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
        });
        
        if (data.access_token) {
            this.setToken(data.access_token);
        }
        
        return data;
    }

    async getCurrentUser() {
        return this.request('/auth/me');
    }

    async updateCurrentUser(userData) {
        return this.request('/auth/me', {
            method: 'PUT',
            body: JSON.stringify(userData),
        });
    }

    async logout() {
        try {
            await this.request('/auth/logout', { method: 'POST' });
        } finally {
            this.clearToken();
        }
    }

    // Student APIs
    async createStudent(studentData) {
        return this.request('/students/', {
            method: 'POST',
            body: JSON.stringify(studentData),
        });
    }

    async getMyStudentProfile() {
        return this.request('/students/me');
    }

    async updateMyStudentProfile(studentData) {
        return this.request('/students/me', {
            method: 'PUT',
            body: JSON.stringify(studentData),
        });
    }

    // Readiness Predictor APIs
    async calculateReadiness(data) {
        return this.request('/readiness/calculate', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getMyReadinessScore() {
        return this.request('/readiness/my-score');
    }

    async getReadinessAnalytics() {
        return this.request('/readiness/analytics');
    }

    // Skills APIs
    async analyzeSkills(data) {
        return this.request('/skills/analyze', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getMySkills() {
        return this.request('/skills/my-skills');
    }

    async updateMySkills(skillsData) {
        return this.request('/skills/my-skills', {
            method: 'PUT',
            body: JSON.stringify(skillsData),
        });
    }

    async getSkillRecommendations(targetRole = 'Software Engineer') {
        return this.request(`/skills/recommendations?target_role=${targetRole}`);
    }

    // Resume APIs
    async uploadResume(file) {
        const formData = new FormData();
        formData.append('file', file);

        return this.request('/resume/upload', {
            method: 'POST',
            headers: {}, // Let browser set Content-Type for FormData
            body: formData,
        });
    }

    async getMyResumes() {
        return this.request('/resume/my-resumes');
    }

    async getResumeAnalysis(resumeId) {
        return this.request(`/resume/${resumeId}/analysis`);
    }

    async deleteResume(resumeId) {
        return this.request(`/resume/${resumeId}`, {
            method: 'DELETE',
        });
    }

    // Mock Interview APIs
    async startMockInterview(interviewData) {
        return this.request('/interview/start', {
            method: 'POST',
            body: JSON.stringify(interviewData),
        });
    }

    async submitInterviewAnswers(interviewId, answers) {
        return this.request(`/interview/${interviewId}/submit`, {
            method: 'POST',
            body: JSON.stringify(answers),
        });
    }

    async getInterviewDetails(interviewId) {
        return this.request(`/interview/${interviewId}`);
    }

    async getMyInterviews() {
        return this.request('/interview/my-interviews');
    }

    async getInterviewQuestions() {
        return this.request('/interview/questions');
    }

    // Roadmap APIs
    async getMyRoadmap(targetRole = 'Software Engineer') {
        return this.request(`/roadmap/my-roadmap?target_role=${targetRole}`);
    }

    async completeMilestone(weekId) {
        return this.request(`/roadmap/roadmap/${weekId}/complete`, {
            method: 'PUT',
        });
    }

    async getRoadmapProgress() {
        return this.request('/roadmap/roadmap/progress');
    }

    async getMilestoneResources(weekId) {
        return this.request(`/roadmap/roadmap/resources/${weekId}`);
    }

    // Company Matching APIs
    async findCompanyMatches(preferences) {
        return this.request('/company/match', {
            method: 'POST',
            body: JSON.stringify(preferences),
        });
    }

    async getAllCompanies() {
        return this.request('/company/companies');
    }

    async getCompanyDetails(companyId) {
        return this.request(`/company/companies/${companyId}`);
    }

    async getMatchingPreferences() {
        return this.request('/company/preferences');
    }

    async applyToCompany(companyId, applicationData) {
        return this.request(`/company/companies/${companyId}/apply`, {
            method: 'POST',
            body: JSON.stringify(applicationData),
        });
    }

    async getMyApplications() {
        return this.request('/company/applications');
    }

    // Risk Detection APIs
    async assessPlacementRisk() {
        return this.request('/risk/assess', {
            method: 'POST',
        });
    }

    async getMyRiskAssessment() {
        return this.request('/risk/my-assessment');
    }

    async getRiskTrends() {
        return this.request('/risk/risk-trends');
    }

    async getMitigationPlan() {
        return this.request('/risk/mitigation-plan');
    }

    // Admin APIs
    async getAdminDashboard() {
        return this.request('/admin/dashboard');
    }

    async getAllStudents(options = {}) {
        const params = new URLSearchParams(options);
        return this.request(`/admin/students?${params}`);
    }

    async getPerformanceAnalytics() {
        return this.request('/admin/analytics/performance');
    }

    async generateReport(reportType, format = 'json') {
        return this.request(`/admin/reports/generate?report_type=${reportType}&format=${format}`, {
            method: 'POST',
        });
    }
}

// Create global API service instance
const api = new APIService();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
} else {
    window.api = api;
}
