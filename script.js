// Placement Readiness System JavaScript

// Global state management
const appState = {
    currentView: 'student',
    currentModule: null,
    currentUser: null,
    studentData: null,
    selectedRole: null,
    isLoading: false,
    error: null
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    initializeCharts();
    // Show role selection dashboard first
    showRoleSelection();
});

function showRoleSelection() {
    // Hide main application and show role selection
    document.getElementById('roleSelectionDashboard').classList.remove('hidden');
    document.getElementById('mainApplication').classList.add('hidden');
    console.log('Role selection dashboard shown');
}

function selectRole(role) {
    appState.selectedRole = role;
    
    // Hide role selection and show login modal
    document.getElementById('roleSelectionDashboard').classList.add('hidden');
    
    // Show appropriate login modal
    if (role === 'student') {
        showStudentLoginModal();
    } else {
        showAdminLoginModal();
    }
}

function showStudentLoginModal() {
    // Create student login modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <div class="text-center mb-6">
                <div class="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-user-graduate text-2xl text-blue-600"></i>
                </div>
                <h2 class="text-2xl font-bold text-gray-800">Student Login</h2>
                <p class="text-gray-600 mt-2">Enter your credentials to access your dashboard</p>
            </div>
            <form id="studentLoginForm" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input type="email" id="studentEmail" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="student@example.com">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <input type="password" id="studentPassword" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••">
                </div>
                <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
                    <i class="fas fa-sign-in-alt mr-2"></i>Login as Student
                </button>
            </form>
            <div class="mt-4 text-center">
                <p class="text-sm text-gray-600">Demo: student@example.com / password123</p>
                <button onclick="showRoleSelection()" class="text-blue-600 hover:text-blue-700 text-sm mt-2">
                    <i class="fas fa-arrow-left mr-1"></i>Back to Role Selection
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Handle login form submission
    document.getElementById('studentLoginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('studentEmail').value;
        const password = document.getElementById('studentPassword').value;
        
        try {
            showLoading(true);
            // Try API login, but fallback to mock login if backend isn't available
            try {
                await api.login(email, password);
                await checkAuthentication();
            } catch (apiError) {
                console.log('Backend not available, using mock login');
                // Mock login for demo
                if (email === 'student@example.com' && password === 'password123') {
                    appState.currentUser = { 
                        email: email, 
                        role: 'student', 
                        full_name: 'Demo Student',
                        id: 'student_001'
                    };
                } else {
                    throw new Error('Invalid credentials');
                }
            }
            document.body.removeChild(modal);
            showMainApplication('student');
        } catch (error) {
            alert('Login failed: ' + error.message);
        } finally {
            showLoading(false);
        }
    });
}

function showAdminLoginModal() {
    // Create admin login modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <div class="text-center mb-6">
                <div class="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-user-shield text-2xl text-purple-600"></i>
                </div>
                <h2 class="text-2xl font-bold text-gray-800">Administrator Login</h2>
                <p class="text-gray-600 mt-2">Enter admin credentials to access dashboard</p>
            </div>
            <form id="adminLoginForm" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input type="email" id="adminEmail" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="admin@example.com">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <input type="password" id="adminPassword" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="••••••••">
                </div>
                <button type="submit" class="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition">
                    <i class="fas fa-sign-in-alt mr-2"></i>Login as Admin
                </button>
            </form>
            <div class="mt-4 text-center">
                <p class="text-sm text-gray-600">Demo: admin@example.com / admin123</p>
                <button onclick="showRoleSelection()" class="text-purple-600 hover:text-purple-700 text-sm mt-2">
                    <i class="fas fa-arrow-left mr-1"></i>Back to Role Selection
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Handle login form submission
    document.getElementById('adminLoginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('adminEmail').value;
        const password = document.getElementById('adminPassword').value;
        
        try {
            showLoading(true);
            // Mock admin login (in real implementation, this would call admin API)
            if (email === 'admin@example.com' && password === 'admin123') {
                appState.currentUser = { email: email, role: 'admin', full_name: 'Administrator' };
                document.body.removeChild(modal);
                showMainApplication('admin');
            } else {
                throw new Error('Invalid admin credentials');
            }
        } catch (error) {
            alert('Login failed: ' + error.message);
        } finally {
            showLoading(false);
        }
    });
}

function showMainApplication(role) {
    // Hide role selection and show main application
    document.getElementById('roleSelectionDashboard').classList.add('hidden');
    document.getElementById('mainApplication').classList.remove('hidden');
    
    // Set initial view based on role
    if (role === 'admin') {
        switchView('admin');
    } else {
        switchView('student');
    }
    
    // Load data and update dashboard
    if (role === 'student') {
        loadStudentData().then(() => {
            updateDashboard();
        });
    } else {
        loadAdminData().then(() => {
            updateAdminDashboard();
        });
    }
}

async function loadAdminData() {
    // Mock admin data
    appState.adminData = {
        totalStudents: 1234,
        avgReadiness: 72,
        placements: 89,
        activeMentors: 15
    };
}

async function loadStudentData() {
    try {
        // Try to get data from API, but fallback to mock data if backend isn't available
        let studentData;
        try {
            studentData = await api.getMyStudentProfile();
        } catch (apiError) {
            console.log('Backend not available, using mock data');
            // Create mock data for demo purposes
            studentData = {
                student_id: 'STU001',
                cgpa: 7.5,
                branch: 'Computer Science',
                year: 3,
                skills: {
                    programming: 75,
                    data_structures: 70,
                    web_development: 65,
                    database: 60,
                    communication: 80,
                    problem_solving: 72
                },
                projects_count: 3,
                internships_count: 1,
                readiness_score: 72,
                resume_score: 85,
                mock_interviews_count: 8
            };
        }
        appState.studentData = studentData;
    } catch (error) {
        console.error('Failed to load student data:', error);
        // Create mock data for demo purposes
        appState.studentData = {
            student_id: 'STU001',
            cgpa: 7.5,
            branch: 'Computer Science',
            year: 3,
            skills: {
                programming: 75,
                data_structures: 70,
                web_development: 65,
                database: 60,
                communication: 80,
                problem_solving: 72
            },
            projects_count: 3,
            internships_count: 1,
            readiness_score: 72,
            resume_score: 85,
            mock_interviews_count: 8
        };
    }
}

function showLoginModal() {
    // Create login modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h2 class="text-2xl font-bold mb-6 text-center">Login to Placement System</h2>
            <form id="loginForm" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input type="email" id="loginEmail" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="student@example.com">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <input type="password" id="loginPassword" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••">
                </div>
                <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
                    Login
                </button>
            </form>
            <div class="mt-4 text-center">
                <p class="text-sm text-gray-600">Demo: Use student@example.com / password123</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Handle login form submission
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        try {
            showLoading(true);
            await api.login(email, password);
            await checkAuthentication();
            document.body.removeChild(modal);
        } catch (error) {
            alert('Login failed: ' + error.message);
        } finally {
            showLoading(false);
        }
    });
}

function showLoading(show) {
    appState.isLoading = show;
    // Update UI loading states
    const loadingElements = document.querySelectorAll('.loading-indicator');
    loadingElements.forEach(el => {
        el.style.display = show ? 'block' : 'none';
    });
}

function initializeApp() {
    console.log('Placement Readiness System initialized');
}

function setupEventListeners() {
    // Navigation buttons - only attach if elements exist
    const studentViewBtn = document.getElementById('studentViewBtn');
    const adminViewBtn = document.getElementById('adminViewBtn');
    
    if (studentViewBtn) {
        studentViewBtn.addEventListener('click', () => switchView('student'));
    }
    if (adminViewBtn) {
        adminViewBtn.addEventListener('click', () => switchView('admin'));
    }
    
    // Logout button - always attach if exists
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Close modal when clicking outside
    const moduleModal = document.getElementById('moduleModal');
    if (moduleModal) {
        moduleModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModule();
            }
        });
    }
}

function handleLogout() {
    // Clear user data
    appState.currentUser = null;
    appState.studentData = null;
    appState.adminData = null;
    appState.selectedRole = null;
    
    // Clear API token
    api.clearToken();
    
    // Show role selection dashboard
    showRoleSelection();
    
    console.log('User logged out successfully');
}

function switchView(view) {
    const studentDashboard = document.getElementById('studentDashboard');
    const adminDashboard = document.getElementById('adminDashboard');
    const studentBtn = document.getElementById('studentViewBtn');
    const adminBtn = document.getElementById('adminViewBtn');

    if (view === 'student') {
        studentDashboard.classList.remove('hidden');
        adminDashboard.classList.add('hidden');
        studentBtn.classList.add('text-blue-600');
        studentBtn.classList.remove('text-gray-600');
        adminBtn.classList.add('text-gray-600');
        adminBtn.classList.remove('text-blue-600');
    } else {
        studentDashboard.classList.add('hidden');
        adminDashboard.classList.remove('hidden');
        adminBtn.classList.add('text-blue-600');
        adminBtn.classList.remove('text-gray-600');
        studentBtn.classList.add('text-gray-600');
        studentBtn.classList.remove('text-blue-600');
    }
    
    appState.currentView = view;
}

function openModule(moduleType) {
    const modal = document.getElementById('moduleModal');
    const title = document.getElementById('moduleTitle');
    const content = document.getElementById('moduleContent');
    
    appState.currentModule = moduleType;
    
    // Load module content based on type
    switch(moduleType) {
        case 'readiness':
            title.textContent = 'Placement Readiness Predictor';
            content.innerHTML = getReadinessPredictorContent();
            break;
        case 'skills':
            title.textContent = 'Skill Gap Analyzer';
            content.innerHTML = getSkillGapAnalyzerContent();
            setTimeout(() => initializeSkillRadarChart(), 100);
            break;
        case 'resume':
            title.textContent = 'Resume Analyzer';
            content.innerHTML = getResumeAnalyzerContent();
            break;
        case 'interview':
            title.textContent = 'Mock Interview Practice';
            content.innerHTML = getMockInterviewContent();
            break;
        case 'roadmap':
            title.textContent = 'Personalized Roadmap';
            content.innerHTML = getRoadmapContent();
            setTimeout(() => initializeRoadmapChart(), 100);
            break;
        case 'companymatching':
            title.textContent = 'Company Matching AI';
            content.innerHTML = getCompanyMatchingContent();
            setTimeout(() => initializeCompanyChart(), 100);
            break;
        case 'riskdetection':
            title.textContent = 'Placement Risk Detection';
            content.innerHTML = getRiskDetectionContent();
            setTimeout(() => initializeRiskChart(), 100);
            break;
    }
    
    modal.classList.remove('hidden');
}

function closeModule() {
    const modal = document.getElementById('moduleModal');
    modal.classList.add('hidden');
    appState.currentModule = null;
}

function getReadinessPredictorContent() {
    // Check if user is admin
    const isAdmin = appState.currentUser?.role === 'admin';
    
    if (isAdmin) {
        return `
            <div class="space-y-6">
                <div class="bg-blue-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-blue-800 mb-2">Admin Panel - Readiness Settings</h4>
                    <p class="text-blue-700 text-sm">Adjust student readiness parameters and scores. Changes will be reflected in student dashboards.</p>
                </div>
                
                <form id="readinessForm" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">CGPA/Percentage</label>
                        <input type="range" id="cgpa" min="0" max="100" value="75" class="w-full" oninput="updateReadinessScore()">
                        <div class="flex justify-between text-sm text-gray-600">
                            <span>0%</span>
                            <span id="cgpaValue" class="font-bold">75%</span>
                            <span>100%</span>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Technical Skills</label>
                        <input type="range" id="technicalSkills" min="0" max="100" value="70" class="w-full" oninput="updateReadinessScore()">
                        <div class="flex justify-between text-sm text-gray-600">
                            <span>Beginner</span>
                            <span id="technicalValue" class="font-bold">70%</span>
                            <span>Expert</span>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Communication Skills</label>
                        <input type="range" id="communicationSkills" min="0" max="100" value="80" class="w-full" oninput="updateReadinessScore()">
                        <div class="flex justify-between text-sm text-gray-600">
                            <span>Poor</span>
                            <span id="communicationValue" class="font-bold">80%</span>
                            <span>Excellent</span>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Projects/Internships</label>
                        <input type="range" id="projects" min="0" max="100" value="65" class="w-full" oninput="updateReadinessScore()">
                        <div class="flex justify-between text-sm text-gray-600">
                            <span>None</span>
                            <span id="projectsValue" class="font-bold">65%</span>
                            <span>Multiple</span>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Aptitude & Problem Solving</label>
                        <input type="range" id="aptitude" min="0" max="100" value="72" class="w-full" oninput="updateReadinessScore()">
                        <div class="flex justify-between text-sm text-gray-600">
                            <span>Needs Work</span>
                            <span id="aptitudeValue" class="font-bold">72%</span>
                            <span>Excellent</span>
                        </div>
                    </div>
                </form>
                
                <div class="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 class="font-semibold text-gray-800 mb-4">Current Readiness Score</h4>
                    
                    <div class="text-center mb-6">
                        <div class="text-5xl font-bold text-blue-600" id="readinessScore">72%</div>
                        <p class="text-gray-600">Overall Placement Readiness</p>
                    </div>
                    
                    <div class="w-full bg-gray-200 rounded-full h-4 mb-6">
                        <div id="readinessProgressBar" class="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-300" style="width: 72%"></div>
                    </div>
                    
                    <div id="readinessMessage" class="bg-blue-50 p-4 rounded-lg mb-6">
                        <p class="text-blue-800">Good progress! Keep improving to reach your goals.</p>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="bg-green-50 p-4 rounded-lg">
                            <h5 class="font-semibold text-green-800 mb-2">Strengths</h5>
                            <ul class="text-sm text-green-700 space-y-1">
                                <li>• Strong communication skills</li>
                                <li>• Good problem-solving ability</li>
                                <li>• Consistent academic performance</li>
                            </ul>
                        </div>
                        <div class="bg-yellow-50 p-4 rounded-lg">
                            <h5 class="font-semibold text-yellow-800 mb-2">Areas for Improvement</h5>
                            <ul class="text-sm text-yellow-700 space-y-1">
                                <li>• More hands-on projects needed</li>
                                <li>• Technical skills can be enhanced</li>
                                <li>• Consider internships</li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <div class="flex space-x-4">
                    <button onclick="saveReadinessSettings()" class="btn-primary">
                        <i class="fas fa-save mr-2"></i>Save Settings
                    </button>
                    <button onclick="resetToDefaults()" class="btn-secondary">
                        <i class="fas fa-undo mr-2"></i>Reset to Defaults
                    </button>
                </div>
            </div>
        `;
    } else {
        // Student view - read-only
        return `
            <div class="space-y-6">
                <div class="bg-blue-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-blue-800 mb-2">Your Placement Readiness Score</h4>
                    <p class="text-blue-700 text-sm">View your current placement readiness assessment based on your academic and skills profile.</p>
                </div>
                
                <div class="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 class="font-semibold text-gray-800 mb-4">Readiness Assessment</h4>
                    
                    <div class="text-center mb-6">
                        <div class="text-5xl font-bold text-blue-600" id="readinessScore">${Math.round(appState.studentData?.readiness_score || 72)}%</div>
                        <p class="text-gray-600">Overall Placement Readiness</p>
                    </div>
                    
                    <div class="w-full bg-gray-200 rounded-full h-4 mb-6">
                        <div id="readinessProgressBar" class="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-300" style="width: ${appState.studentData?.readiness_score || 72}%"></div>
                    </div>
                    
                    <div id="readinessMessage" class="bg-blue-50 p-4 rounded-lg mb-6">
                        <p class="text-blue-800">Good progress! Keep improving to reach your goals.</p>
                    </div>
                    
                    <div class="space-y-4">
                        <div class="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <span class="font-medium text-gray-700">CGPA/Percentage</span>
                            <span class="font-bold text-blue-600">${(appState.studentData?.cgpa || 7.5) * 10}%</span>
                        </div>
                        
                        <div class="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <span class="font-medium text-gray-700">Technical Skills</span>
                            <span class="font-bold text-blue-600">${appState.studentData?.skills?.programming || 75}%</span>
                        </div>
                        
                        <div class="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <span class="font-medium text-gray-700">Communication Skills</span>
                            <span class="font-bold text-blue-600">${appState.studentData?.skills?.communication || 80}%</span>
                        </div>
                        
                        <div class="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <span class="font-medium text-gray-700">Projects/Internships</span>
                            <span class="font-bold text-blue-600">${(appState.studentData?.projects_count || 3) * 25}%</span>
                        </div>
                        
                        <div class="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <span class="font-medium text-gray-700">Aptitude & Problem Solving</span>
                            <span class="font-bold text-blue-600">${appState.studentData?.skills?.data_structures || 70}%</span>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <div class="bg-green-50 p-4 rounded-lg">
                            <h5 class="font-semibold text-green-800 mb-2">Your Strengths</h5>
                            <ul class="text-sm text-green-700 space-y-1">
                                <li>• Strong communication skills</li>
                                <li>• Good problem-solving ability</li>
                                <li>• Consistent academic performance</li>
                            </ul>
                        </div>
                        <div class="bg-yellow-50 p-4 rounded-lg">
                            <h5 class="font-semibold text-yellow-800 mb-2">Areas for Improvement</h5>
                            <ul class="text-sm text-yellow-700 space-y-1">
                                <li>• More hands-on projects needed</li>
                                <li>• Technical skills can be enhanced</li>
                                <li>• Consider internships</li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <div class="bg-gray-50 p-4 rounded-lg text-center">
                    <p class="text-gray-600 text-sm">
                        <i class="fas fa-info-circle mr-2"></i>
                        Contact your administrator to update your readiness parameters
                    </p>
                </div>
            </div>
        `;
    }
}

function getSkillGapAnalyzerContent() {
    return `
        <div class="space-y-6">
            <div class="bg-green-50 p-4 rounded-lg">
                <h4 class="font-semibold text-green-800 mb-2">Skill Analysis</h4>
                <p class="text-green-700 text-sm">Comprehensive analysis of your technical and soft skills to identify gaps.</p>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <h4 class="font-semibold text-gray-800 mb-4">Skill Radar Chart</h4>
                    <div class="chart-container">
                        <canvas id="skillRadarChart"></canvas>
                    </div>
                </div>
                
                <div>
                    <h4 class="font-semibold text-gray-800 mb-4">Skill Breakdown</h4>
                    <div class="space-y-3">
                        <div class="skill-item">
                            <div class="flex justify-between mb-1">
                                <span class="text-sm font-medium">Programming</span>
                                <span class="text-sm text-gray-600">85%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 85%"></div>
                            </div>
                        </div>
                        
                        <div class="skill-item">
                            <div class="flex justify-between mb-1">
                                <span class="text-sm font-medium">Data Structures</span>
                                <span class="text-sm text-gray-600">72%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 72%"></div>
                            </div>
                        </div>
                        
                        <div class="skill-item">
                            <div class="flex justify-between mb-1">
                                <span class="text-sm font-medium">Web Development</span>
                                <span class="text-sm text-gray-600">68%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 68%"></div>
                            </div>
                        </div>
                        
                        <div class="skill-item">
                            <div class="flex justify-between mb-1">
                                <span class="text-sm font-medium">Database</span>
                                <span class="text-sm text-gray-600">60%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 60%"></div>
                            </div>
                        </div>
                        
                        <div class="skill-item">
                            <div class="flex justify-between mb-1">
                                <span class="text-sm font-medium">Communication</span>
                                <span class="text-sm text-gray-600">80%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 80%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="bg-blue-50 p-4 rounded-lg">
                <h4 class="font-semibold text-blue-800 mb-3">Recommended Learning Path</h4>
                <div class="space-y-2">
                    <div class="flex items-start">
                        <span class="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">1</span>
                        <div>
                            <p class="font-medium">Advanced Data Structures</p>
                            <p class="text-sm text-gray-600">Focus on trees, graphs, and dynamic programming</p>
                        </div>
                    </div>
                    <div class="flex items-start">
                        <span class="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">2</span>
                        <div>
                            <p class="font-medium">Database Optimization</p>
                            <p class="text-sm text-gray-600">Learn SQL optimization and NoSQL databases</p>
                        </div>
                    </div>
                    <div class="flex items-start">
                        <span class="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">3</span>
                        <div>
                            <p class="font-medium">System Design</p>
                            <p class="text-sm text-gray-600">Understanding scalable architecture patterns</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getResumeAnalyzerContent() {
    return `
        <div class="space-y-6">
            <div class="bg-purple-50 p-4 rounded-lg">
                <h4 class="font-semibold text-purple-800 mb-2">AI Resume Analysis</h4>
                <p class="text-purple-700 text-sm">Upload your resume for instant AI-powered analysis and optimization suggestions.</p>
            </div>
            
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <i class="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
                <h4 class="text-lg font-semibold text-gray-700 mb-2">Upload Your Resume</h4>
                <p class="text-gray-500 mb-4">Drag and drop your resume here, or click to browse</p>
                <input type="file" id="resumeUpload" accept=".pdf,.doc,.docx" class="hidden">
                <button onclick="document.getElementById('resumeUpload').click()" class="btn-primary">
                    <i class="fas fa-upload mr-2"></i>Choose File
                </button>
                <p class="text-xs text-gray-500 mt-2">Supported formats: PDF, DOC, DOCX (Max size: 5MB)</p>
            </div>
            
            <div id="resumeAnalysisResults" class="space-y-4 hidden">
                <div class="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 class="font-semibold text-gray-800 mb-4">Analysis Results</h4>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div class="text-center">
                            <div class="text-3xl font-bold text-green-600">85%</div>
                            <p class="text-sm text-gray-600">Overall Score</p>
                        </div>
                        <div class="text-center">
                            <div class="text-3xl font-bold text-blue-600">7.2</div>
                            <p class="text-sm text-gray-600">ATS Compatibility</p>
                        </div>
                    </div>
                    
                    <div class="space-y-3">
                        <div class="analysis-item">
                            <div class="flex justify-between items-center mb-2">
                                <span class="font-medium">Contact Information</span>
                                <span class="text-green-600"><i class="fas fa-check-circle"></i> Complete</span>
                            </div>
                        </div>
                        
                        <div class="analysis-item">
                            <div class="flex justify-between items-center mb-2">
                                <span class="font-medium">Professional Summary</span>
                                <span class="text-green-600"><i class="fas fa-check-circle"></i> Good</span>
                            </div>
                        </div>
                        
                        <div class="analysis-item">
                            <div class="flex justify-between items-center mb-2">
                                <span class="font-medium">Skills Section</span>
                                <span class="text-yellow-600"><i class="fas fa-exclamation-circle"></i> Needs Improvement</span>
                            </div>
                        </div>
                        
                        <div class="analysis-item">
                            <div class="flex justify-between items-center mb-2">
                                <span class="font-medium">Experience Description</span>
                                <span class="text-green-600"><i class="fas fa-check-circle"></i> Detailed</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="bg-blue-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-blue-800 mb-3">AI Recommendations</h4>
                    <ul class="space-y-2 text-sm">
                        <li class="flex items-start">
                            <i class="fas fa-lightbulb text-blue-600 mr-2 mt-1"></i>
                            <span>Add quantifiable achievements to your experience section (e.g., "Increased efficiency by 30%")</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-lightbulb text-blue-600 mr-2 mt-1"></i>
                            <span>Include more technical keywords relevant to your target roles</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-lightbulb text-blue-600 mr-2 mt-1"></i>
                            <span>Consider adding a certifications section to highlight your qualifications</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    `;
}

function getMockInterviewContent() {
    return `
        <div class="space-y-6">
            <div class="bg-red-50 p-4 rounded-lg">
                <h4 class="font-semibold text-red-800 mb-2">Mock Interview Practice</h4>
                <p class="text-red-700 text-sm">Practice with AI-powered mock interviews tailored to your target companies and roles.</p>
            </div>
            
            <div id="interviewSetup" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Job Role</label>
                        <select class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option>Software Engineer</option>
                            <option>Data Scientist</option>
                            <option>Product Manager</option>
                            <option>DevOps Engineer</option>
                            <option>UI/UX Designer</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
                        <select class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option>Beginner</option>
                            <option>Intermediate</option>
                            <option>Advanced</option>
                        </select>
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Interview Type</label>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <label class="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" class="rounded text-blue-600">
                            <span class="text-sm">Technical</span>
                        </label>
                        <label class="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" class="rounded text-blue-600">
                            <span class="text-sm">Behavioral</span>
                        </label>
                        <label class="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" class="rounded text-blue-600">
                            <span class="text-sm">Problem Solving</span>
                        </label>
                        <label class="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" class="rounded text-blue-600">
                            <span class="text-sm">System Design</span>
                        </label>
                    </div>
                </div>
                
                <button onclick="startMockInterview()" class="btn-primary w-full">
                    <i class="fas fa-video mr-2"></i>Start Mock Interview
                </button>
            </div>
            
            <div id="interviewSession" class="hidden space-y-4">
                <div class="bg-white border border-gray-200 rounded-lg p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h4 class="font-semibold text-gray-800">Interview Session</h4>
                        <div class="flex items-center space-x-2">
                            <span class="bg-red-100 text-red-800 text-sm px-3 py-1 rounded-full">
                                <i class="fas fa-circle text-red-500 mr-1"></i>Recording
                            </span>
                            <span id="interviewTimer" class="font-mono text-sm">00:00</span>
                        </div>
                    </div>
                    
                    <div class="mb-6">
                        <div class="bg-blue-50 p-4 rounded-lg">
                            <h5 class="font-semibold text-blue-800 mb-2">Question 1 of 5</h5>
                            <p class="text-gray-800" id="currentQuestion">Can you explain the difference between REST and GraphQL APIs?</p>
                        </div>
                    </div>
                    
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Your Answer</label>
                            <textarea id="interviewAnswer" rows="4" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Type your answer here..."></textarea>
                        </div>
                        
                        <div class="flex justify-between">
                            <button onclick="skipQuestion()" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                Skip Question
                            </button>
                            <button onclick="submitAnswer()" class="btn-primary">
                                Submit Answer <i class="fas fa-arrow-right ml-2"></i>
                            </button>
                        </div>
                    </div>
                </div>
                
                <div id="interviewFeedback" class="hidden bg-green-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-green-800 mb-2">AI Feedback</h4>
                    <p class="text-green-700">Your answer has been analyzed. Great job explaining the concepts! Consider adding more specific examples to strengthen your response.</p>
                </div>
            </div>
        </div>
    `;
}

function getRoadmapContent() {
    return `
        <div class="space-y-6">
            <div class="bg-indigo-50 p-4 rounded-lg">
                <h4 class="font-semibold text-indigo-800 mb-2">Your Personalized Roadmap</h4>
                <p class="text-indigo-700 text-sm">AI-generated learning path tailored to your career goals and current skill level.</p>
            </div>
            
            <div class="bg-white border border-gray-200 rounded-lg p-6">
                <div class="flex justify-between items-center mb-6">
                    <h4 class="font-semibold text-gray-800">12-Week Learning Journey</h4>
                    <div class="flex items-center space-x-4">
                        <span class="text-sm text-gray-600">Progress:</span>
                        <div class="progress-bar w-32">
                            <div class="progress-fill" style="width: 35%"></div>
                        </div>
                        <span class="text-sm font-medium">35%</span>
                    </div>
                </div>
                
                <div class="chart-container mb-6">
                    <canvas id="roadmapChart"></canvas>
                </div>
                
                <div class="space-y-4">
                    <div class="flex items-start space-x-4 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                        <div class="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">✓</div>
                        <div class="flex-1">
                            <h5 class="font-semibold text-gray-800">Week 1-2: Foundation Strengthening</h5>
                            <p class="text-sm text-gray-600 mb-2">Core programming concepts and data structures</p>
                            <div class="flex items-center space-x-4 text-xs">
                                <span class="text-green-600"><i class="fas fa-check-circle"></i> Completed</span>
                                <span class="text-gray-500">8 lessons, 5 assignments</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                        <div class="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</div>
                        <div class="flex-1">
                            <h5 class="font-semibold text-gray-800">Week 3-4: Web Development</h5>
                            <p class="text-sm text-gray-600 mb-2">Frontend and backend technologies with hands-on projects</p>
                            <div class="flex items-center space-x-4 text-xs">
                                <span class="text-blue-600"><i class="fas fa-clock"></i> In Progress</span>
                                <span class="text-gray-500">6 lessons, 3 assignments</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg border-l-4 border-gray-300">
                        <div class="bg-gray-300 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">5</div>
                        <div class="flex-1">
                            <h5 class="font-semibold text-gray-800">Week 5-6: Database Management</h5>
                            <p class="text-sm text-gray-600 mb-2">SQL and NoSQL databases with optimization techniques</p>
                            <div class="flex items-center space-x-4 text-xs">
                                <span class="text-gray-500"><i class="fas fa-lock"></i> Upcoming</span>
                                <span class="text-gray-500">7 lessons, 4 assignments</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg border-l-4 border-gray-300">
                        <div class="bg-gray-300 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">7</div>
                        <div class="flex-1">
                            <h5 class="font-semibold text-gray-800">Week 7-8: System Design</h5>
                            <p class="text-sm text-gray-600 mb-2">Architectural patterns and scalable system design</p>
                            <div class="flex items-center space-x-4 text-xs">
                                <span class="text-gray-500"><i class="fas fa-lock"></i> Upcoming</span>
                                <span class="text-gray-500">5 lessons, 2 projects</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="mt-6 p-4 bg-yellow-50 rounded-lg">
                    <h5 class="font-semibold text-yellow-800 mb-2">Next Milestone</h5>
                    <p class="text-sm text-yellow-700">Complete the Web Development module by end of Week 4 to unlock advanced topics and interview preparation materials.</p>
                </div>
            </div>
        </div>
    `;
}

function getCompanyMatchingContent() {
    return `
        <div class="space-y-6">
            <div class="bg-teal-50 p-4 rounded-lg">
                <h4 class="font-semibold text-teal-800 mb-2">AI-Powered Company Matching</h4>
                <p class="text-teal-700 text-sm">Our AI analyzes your skills, preferences, and profile to match you with the best companies.</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Preferred Industry</label>
                    <select id="preferredIndustry" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                        <option>Technology</option>
                        <option>Finance</option>
                        <option>Healthcare</option>
                        <option>E-commerce</option>
                        <option>Consulting</option>
                    </select>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Job Role</label>
                    <select id="jobRole" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                        <option>Software Engineer</option>
                        <option>Data Scientist</option>
                        <option>Product Manager</option>
                        <option>DevOps Engineer</option>
                        <option>UI/UX Designer</option>
                    </select>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Location Preference</label>
                    <select id="locationPreference" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                        <option>Remote</option>
                        <option>Bangalore</option>
                        <option>Mumbai</option>
                        <option>Pune</option>
                        <option>Hyderabad</option>
                    </select>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Company Size</label>
                    <select id="companySize" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                        <option>Startup (1-50)</option>
                        <option>Small (51-200)</option>
                        <option>Medium (201-1000)</option>
                        <option>Large (1000+)</option>
                    </select>
                </div>
            </div>
            
            <button onclick="findCompanyMatches()" class="btn-primary w-full">
                <i class="fas fa-search mr-2"></i>Find Company Matches
            </button>
            
            <div id="companyMatchesContainer" class="space-y-4 hidden">
                <div class="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 class="font-semibold text-gray-800 mb-4">Top Company Matches</h4>
                    <div id="companyMatchesList" class="space-y-4">
                        <!-- Dynamic company matches will be inserted here -->
                    </div>
                </div>
                
                <div class="chart-container">
                    <canvas id="companyChart"></canvas>
                </div>
            </div>
        </div>
    `;
}

function getRiskDetectionContent() {
    return `
        <div class="space-y-6">
            <div class="bg-red-50 p-4 rounded-lg">
                <h4 class="font-semibold text-red-800 mb-2">Placement Risk Assessment</h4>
                <p class="text-red-700 text-sm">AI-powered risk detection to identify potential challenges and provide mitigation strategies.</p>
            </div>
            
            <div class="bg-white border border-gray-200 rounded-lg p-6">
                <h4 class="font-semibold text-gray-800 mb-4">Risk Analysis Results</h4>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div class="text-center p-4 bg-red-50 rounded-lg">
                        <div class="text-3xl font-bold text-red-600 mb-2">32%</div>
                        <p class="text-sm text-gray-600">Overall Risk Level</p>
                        <div class="mt-2">
                            <span class="bg-red-100 text-red-800 text-sm px-3 py-1 rounded-full">Moderate Risk</span>
                        </div>
                    </div>
                    
                    <div class="text-center p-4 bg-yellow-50 rounded-lg">
                        <div class="text-3xl font-bold text-yellow-600 mb-2">68%</div>
                        <p class="text-sm text-gray-600">Success Probability</p>
                        <div class="mt-2">
                            <span class="bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded-full">Good Chance</span>
                        </div>
                    </div>
                    
                    <div class="text-center p-4 bg-green-50 rounded-lg">
                        <div class="text-3xl font-bold text-green-600 mb-2">4.2</div>
                        <p class="text-sm text-gray-600">Months to Ready</p>
                        <div class="mt-2">
                            <span class="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">On Track</span>
                        </div>
                    </div>
                </div>
                
                <div class="space-y-4 mb-6">
                    <div class="risk-item">
                        <div class="flex justify-between items-center mb-2">
                            <span class="font-medium">Technical Skills Gap</span>
                            <span class="text-red-600 font-medium">High Risk</span>
                        </div>
                        <div class="progress-bar">
                            <div class="bg-red-500 rounded-full h-2" style="width: 75%"></div>
                        </div>
                        <p class="text-sm text-gray-600 mt-1">Advanced data structures and algorithms need improvement</p>
                    </div>
                    
                    <div class="risk-item">
                        <div class="flex justify-between items-center mb-2">
                            <span class="font-medium">Interview Performance</span>
                            <span class="text-yellow-600 font-medium">Medium Risk</span>
                        </div>
                        <div class="progress-bar">
                            <div class="bg-yellow-500 rounded-full h-2" style="width: 50%"></div>
                        </div>
                        <p class="text-sm text-gray-600 mt-1">Mock interview scores show room for improvement</p>
                    </div>
                    
                    <div class="risk-item">
                        <div class="flex justify-between items-center mb-2">
                            <span class="font-medium">Communication Skills</span>
                            <span class="text-green-600 font-medium">Low Risk</span>
                        </div>
                        <div class="progress-bar">
                            <div class="bg-green-500 rounded-full h-2" style="width: 25%"></div>
                        </div>
                        <p class="text-sm text-gray-600 mt-1">Strong verbal and written communication abilities</p>
                    </div>
                    
                    <div class="risk-item">
                        <div class="flex justify-between items-center mb-2">
                            <span class="font-medium">Project Experience</span>
                            <span class="text-yellow-600 font-medium">Medium Risk</span>
                        </div>
                        <div class="progress-bar">
                            <div class="bg-yellow-500 rounded-full h-2" style="width: 45%"></div>
                        </div>
                        <p class="text-sm text-gray-600 mt-1">Need more hands-on project experience</p>
                    </div>
                </div>
                
                <div class="chart-container mb-6">
                    <canvas id="riskChart"></canvas>
                </div>
                
                <div class="bg-blue-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-blue-800 mb-3">AI-Recommended Mitigation Strategies</h4>
                    <div class="space-y-3">
                        <div class="flex items-start">
                            <span class="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">1</span>
                            <div>
                                <p class="font-medium">Focus on Advanced Algorithms</p>
                                <p class="text-sm text-gray-600">Dedicate 2 hours daily to practice complex problem-solving</p>
                            </div>
                        </div>
                        <div class="flex items-start">
                            <span class="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">2</span>
                            <div>
                                <p class="font-medium">Increase Mock Interview Frequency</p>
                                <p class="text-sm text-gray-600">Schedule 3 mock interviews per week with different mentors</p>
                            </div>
                        </div>
                        <div class="flex items-start">
                            <span class="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">3</span>
                            <div>
                                <p class="font-medium">Build Portfolio Projects</p>
                                <p class="text-sm text-gray-600">Complete 2 industry-relevant projects in the next 6 weeks</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function updateReadinessScore() {
    const cgpa = document.getElementById('cgpa').value;
    const technical = document.getElementById('technicalSkills').value;
    const communication = document.getElementById('communicationSkills').value;
    const projects = document.getElementById('projects').value;
    const aptitude = document.getElementById('aptitude').value;
    
    // Update display values
    document.getElementById('cgpaValue').textContent = cgpa + '%';
    document.getElementById('technicalValue').textContent = technical + '%';
    document.getElementById('communicationValue').textContent = communication + '%';
    document.getElementById('projectsValue').textContent = projects + '%';
    document.getElementById('aptitudeValue').textContent = aptitude + '%';
    
    try {
        showLoading(true);
        
        // Try to call API, but fallback to local calculation if backend isn't available
        try {
            // Prepare data for API
            const skillsData = {
                programming: parseInt(technical),
                data_structures: parseInt(aptitude),
                web_development: 70, // Mock data
                database: 65, // Mock data
                communication: parseInt(communication),
                problem_solving: parseInt(aptitude)
            };
            
            const readinessData = {
                cgpa: parseFloat(cgpa) / 10, // Convert percentage to CGPA scale
                skills: skillsData,
                projects_count: Math.floor(parseInt(projects) / 25), // Convert percentage to count
                internships_count: 1 // Mock data
            };
            
            // Call API
            const response = await api.calculateReadiness(readinessData);
            
            // Update display with API response
            const score = response.readiness_score;
            document.getElementById('readinessScore').textContent = Math.round(score) + '%';
            document.getElementById('readinessProgressBar').style.width = Math.round(score) + '%';
            
            // Update message based on score
            let message = '';
            if (score >= 80) {
                message = response.feedback.message || 'Excellent! You are well-prepared for placements.';
            } else if (score >= 60) {
                message = response.feedback.message || 'Good progress! Keep improving to reach your goals.';
            } else if (score >= 40) {
                message = response.feedback.message || 'You\'re on the right track. Focus on weak areas.';
            } else {
                message = response.feedback.message || 'More effort needed. Consider our personalized roadmap.';
            }
            
            document.getElementById('readinessMessage').textContent = message;
            
            // Update strengths and weaknesses
            updateStrengthsWeaknesses(response.feedback);
        } catch (apiError) {
            console.log('Backend not available, using local calculation');
            // Fallback to local calculation
            calculateReadinessLocally(cgpa, technical, communication, projects, aptitude);
        }
        
    } catch (error) {
        console.error('Failed to calculate readiness score:', error);
        // Fallback to local calculation
        calculateReadinessLocally(cgpa, technical, communication, projects, aptitude);
    } finally {
        showLoading(false);
    }
}

function calculateReadinessLocally(cgpa, technical, communication, projects, aptitude) {
    // Calculate weighted average
    const weights = {
        cgpa: 0.25,
        technical: 0.25,
        communication: 0.20,
        projects: 0.15,
        aptitude: 0.15
    };
    
    const score = Math.round(
        cgpa * weights.cgpa +
        technical * weights.technical +
        communication * weights.communication +
        projects * weights.projects +
        aptitude * weights.aptitude
    );
    
    // Update display
    document.getElementById('readinessScore').textContent = score + '%';
    document.getElementById('readinessProgressBar').style.width = score + '%';
    
    // Update message based on score
    let message = '';
    if (score >= 80) {
        message = 'Excellent! You are well-prepared for placements.';
    } else if (score >= 60) {
        message = 'Good progress! Keep improving to reach your goals.';
    } else if (score >= 40) {
        message = 'You\'re on the right track. Focus on weak areas.';
    } else {
        message = 'More effort needed. Consider our personalized roadmap.';
    }
    
    document.getElementById('readinessMessage').textContent = message;
}

function updateStrengthsWeaknesses(feedback) {
    // Update strengths section
    const strengthsList = document.querySelector('.bg-green-50 ul');
    if (feedback.strengths && feedback.strengths.length > 0) {
        strengthsList.innerHTML = feedback.strengths.map(strength => `<li>• ${strength}</li>`).join('');
    }
    
    // Update weaknesses section
    const weaknessesList = document.querySelector('.bg-orange-50 ul');
    if (feedback.improvements && feedback.improvements.length > 0) {
        weaknessesList.innerHTML = feedback.improvements.map(improvement => `<li>• ${improvement}</li>`).join('');
    }
}

function initializeSkillRadarChart() {
    const ctx = document.getElementById('skillRadarChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Programming', 'Data Structures', 'Web Development', 'Database', 'Communication', 'Problem Solving'],
            datasets: [{
                label: 'Current Skills',
                data: [85, 72, 68, 60, 80, 75],
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(59, 130, 246, 1)'
            }, {
                label: 'Required Skills',
                data: [80, 85, 75, 80, 85, 90],
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                borderColor: 'rgba(239, 68, 68, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(239, 68, 68, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(239, 68, 68, 1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 20
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function initializeRoadmapChart() {
    const ctx = document.getElementById('roadmapChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Week 9', 'Week 10', 'Week 11', 'Week 12'],
            datasets: [{
                label: 'Skill Progress',
                data: [20, 35, 35, 50, 50, 65, 65, 75, 75, 85, 85, 95],
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                borderColor: 'rgba(99, 102, 241, 1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Skill Level (%)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Timeline'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function initializeCharts() {
    // Initialize admin dashboard charts
    const placementCtx = document.getElementById('placementChart');
    if (placementCtx) {
        new Chart(placementCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Placements',
                    data: [12, 19, 15, 25, 22, 30],
                    backgroundColor: 'rgba(34, 197, 94, 0.2)',
                    borderColor: 'rgba(34, 197, 94, 1)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
    
    const skillCtx = document.getElementById('skillChart');
    if (skillCtx) {
        new Chart(skillCtx, {
            type: 'doughnut',
            data: {
                labels: ['Programming', 'Database', 'Web Dev', 'Mobile', 'Cloud'],
                datasets: [{
                    data: [30, 20, 25, 15, 10],
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(168, 85, 247, 0.8)',
                        'rgba(251, 146, 60, 0.8)',
                        'rgba(239, 68, 68, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
}

function initializeCompanyChart() {
    const ctx = document.getElementById('companyChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['TechCorp', 'DataTech', 'CloudSoft', 'InnoSys', 'NextGen'],
            datasets: [{
                label: 'Match Score',
                data: [92, 85, 78, 72, 68],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(251, 191, 36, 0.8)',
                    'rgba(168, 85, 247, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Match Score (%)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function initializeRiskChart() {
    const ctx = document.getElementById('riskChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Current', 'Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6'],
            datasets: [{
                label: 'Risk Level',
                data: [32, 28, 24, 18, 12, 8, 5],
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                borderColor: 'rgba(239, 68, 68, 1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 40,
                    title: {
                        display: true,
                        text: 'Risk Level (%)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Timeline'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function updateAdminDashboard() {
    if (!appState.adminData) return;
    
    // Update admin welcome section
    const adminWelcomeSection = document.querySelector('#adminDashboard .bg-gradient-to-r');
    if (adminWelcomeSection) {
        adminWelcomeSection.innerHTML = `
            <div class="flex justify-between items-center">
                <div>
                    <h2 class="text-2xl font-bold mb-2">Welcome back, Administrator!</h2>
                    <p class="text-purple-100">System Overview: <span class="text-3xl font-bold">${appState.adminData.totalStudents}</span> students enrolled</p>
                </div>
                <div class="text-right">
                    <p class="text-sm text-purple-100 mb-1">Avg Readiness</p>
                    <p class="text-lg font-semibold">${appState.adminData.avgReadiness}%</p>
                </div>
            </div>
        `;
    }
    
    // Update admin quick stats
    updateAdminQuickStats();
    
    console.log('Admin dashboard updated with latest data');
}

function updateAdminQuickStats() {
    const stats = [
        {
            id: 'totalStudents',
            label: 'Total Students',
            value: appState.adminData.totalStudents.toLocaleString(),
            icon: 'fa-users',
            color: 'blue'
        },
        {
            id: 'avgReadiness',
            label: 'Avg Readiness',
            value: appState.adminData.avgReadiness + '%',
            icon: 'fa-chart-line',
            color: 'green'
        },
        {
            id: 'placements',
            label: 'Placements',
            value: appState.adminData.placements,
            icon: 'fa-briefcase',
            color: 'purple'
        },
        {
            id: 'activeMentors',
            label: 'Active Mentors',
            value: appState.adminData.activeMentors,
            icon: 'fa-chalkboard-teacher',
            color: 'orange'
        }
    ];
    
    const statsContainer = document.querySelector('#adminDashboard .grid.grid-cols-1.md\\:grid-cols-4.gap-6');
    if (statsContainer) {
        statsContainer.innerHTML = stats.map(stat => `
            <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-gray-600">${stat.label}</p>
                        <p class="text-2xl font-bold text-gray-900">${stat.value}</p>
                    </div>
                    <div class="bg-${stat.color}-100 p-3 rounded-full">
                        <i class="fas ${stat.icon} text-${stat.color}-600"></i>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function updateQuickStats() {
    const stats = [
        {
            id: 'skillsAnalyzed',
            label: 'Skills Analyzed',
            value: Object.keys(appState.studentData?.skills || {}).length,
            icon: 'fa-chart-line',
            color: 'blue'
        },
        {
            id: 'mockInterviews',
            label: 'Mock Interviews',
            value: appState.studentData?.mock_interviews_count || 0,
            icon: 'fa-video',
            color: 'green'
        },
        {
            id: 'resumeScore',
            label: 'Resume Score',
            value: Math.round(appState.studentData?.resume_score || 0) + '%',
            icon: 'fa-file-alt',
            color: 'purple'
        },
        {
            id: 'careerResources',
            label: 'Career Resources',
            value: '12',
            icon: 'fa-book',
            color: 'orange'
        }
    ];
    
    const statsContainer = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-4.gap-6');
    if (statsContainer) {
        statsContainer.innerHTML = stats.map(stat => `
            <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-gray-600">${stat.label}</p>
                        <p class="text-2xl font-bold text-gray-900">${stat.value}</p>
                    </div>
                    <div class="bg-${stat.color}-100 p-3 rounded-full">
                        <i class="fas ${stat.icon} text-${stat.color}-600"></i>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function updateDashboard() {
    if (!appState.studentData) return;
    
    // Update welcome section with real data
    const welcomeSection = document.querySelector('#studentDashboard .bg-gradient-to-r');
    if (welcomeSection) {
        welcomeSection.innerHTML = `
            <div class="flex justify-between items-center">
                <div>
                    <h2 class="text-2xl font-bold mb-2">Welcome back, ${appState.currentUser?.full_name || 'Student'}!</h2>
                    <p class="text-blue-100">Your placement readiness score: <span class="text-3xl font-bold">${Math.round(appState.studentData.readiness_score || 0)}%</span></p>
                </div>
                <div class="text-right">
                    <p class="text-sm text-blue-100 mb-1">Next Assessment</p>
                    <p class="text-lg font-semibold">in 3 days</p>
                </div>
            </div>
        `;
    }
    
    // Update quick stats with real data
    updateQuickStats();
    
    console.log('Dashboard updated with latest data');
}

// Mock functions for interactions
function startMockInterview() {
    document.getElementById('interviewSetup').classList.add('hidden');
    document.getElementById('interviewSession').classList.remove('hidden');
    
    // Start timer
    let seconds = 0;
    setInterval(() => {
        seconds++;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        document.getElementById('interviewTimer').textContent = 
            `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, 1000);
}

function submitAnswer() {
    const answer = document.getElementById('interviewAnswer').value.trim();
    const feedbackDiv = document.getElementById('interviewFeedback');
    
    if (!answer) {
        alert('Please type your answer before submitting');
        return;
    }
    
    // Analyze answer and provide feedback
    const wordCount = answer.split(/\s+/).length;
    let feedback = '';
    let feedbackClass = '';
    let score = 0;
    
    if (wordCount < 15) {
        score = 30;
        feedbackClass = 'bg-red-50';
        feedback = `
            <h4 class="font-semibold text-red-800 mb-2"><i class="fas fa-exclamation-circle mr-2"></i>Needs Improvement</h4>
            <p class="text-red-700 mb-2">Your answer is too brief (${wordCount} words). Try to provide more detail and examples.</p>
            <ul class="text-sm text-red-600 list-disc list-inside">
                <li>Expand on key concepts</li>
                <li>Add specific examples from your experience</li>
                <li>Explain your thought process</li>
            </ul>
            <div class="mt-3 text-center">
                <span class="text-2xl font-bold text-red-600">${score}/100</span>
            </div>
        `;
    } else if (wordCount < 40) {
        score = 60;
        feedbackClass = 'bg-yellow-50';
        feedback = `
            <h4 class="font-semibold text-yellow-800 mb-2"><i class="fas fa-minus-circle mr-2"></i>Decent - Can Improve</h4>
            <p class="text-yellow-700 mb-2">Good effort (${wordCount} words), but you could strengthen your answer.</p>
            <ul class="text-sm text-yellow-600 list-disc list-inside">
                <li>Add more specific technical details</li>
                <li>Include real-world examples</li>
                <li>Structure your answer better</li>
            </ul>
            <div class="mt-3 text-center">
                <span class="text-2xl font-bold text-yellow-600">${score}/100</span>
            </div>
        `;
    } else if (wordCount < 80) {
        score = 80;
        feedbackClass = 'bg-blue-50';
        feedback = `
            <h4 class="font-semibold text-blue-800 mb-2"><i class="fas fa-check-circle mr-2"></i>Good Answer</h4>
            <p class="text-blue-700 mb-2">Well done! Your answer (${wordCount} words) shows good understanding.</p>
            <ul class="text-sm text-blue-600 list-disc list-inside">
                <li>Clear explanation of concepts</li>
                <li>Good level of detail</li>
                <li>Minor improvements possible</li>
            </ul>
            <div class="mt-3 text-center">
                <span class="text-2xl font-bold text-blue-600">${score}/100</span>
            </div>
        `;
    } else {
        score = 95;
        feedbackClass = 'bg-green-50';
        feedback = `
            <h4 class="font-semibold text-green-800 mb-2"><i class="fas fa-star mr-2"></i>Excellent Answer!</h4>
            <p class="text-green-700 mb-2">Outstanding! Your comprehensive answer (${wordCount} words) demonstrates deep knowledge.</p>
            <ul class="text-sm text-green-600 list-disc list-inside">
                <li>Thorough explanation</li>
                <li>Excellent examples</li>
                <li>Strong communication skills</li>
            </ul>
            <div class="mt-3 text-center">
                <span class="text-2xl font-bold text-green-600">${score}/100</span>
            </div>
        `;
    }
    
    // Update feedback display
    feedbackDiv.className = `${feedbackClass} p-4 rounded-lg mb-4`;
    feedbackDiv.innerHTML = feedback;
    feedbackDiv.classList.remove('hidden');
    
    // Store score for overall interview result
    if (!window.interviewScores) window.interviewScores = [];
    window.interviewScores.push(score);
    
    // Disable submit button and show next question button
    const submitBtn = document.querySelector('button[onclick="submitAnswer()"]');
    if (submitBtn) {
        submitBtn.innerHTML = 'Next Question <i class="fas fa-arrow-right ml-2"></i>';
        submitBtn.onclick = nextInterviewQuestion;
    }
}

function nextInterviewQuestion() {
    // Hide feedback
    document.getElementById('interviewFeedback').classList.add('hidden');
    document.getElementById('interviewAnswer').value = '';
    
    // Update question counter
    const currentQuestionEl = document.getElementById('currentQuestion');
    const questionHeader = document.querySelector('#interviewSession h5');
    
    // Get current question number
    let currentNum = 1;
    if (questionHeader) {
        const match = questionHeader.textContent.match(/Question (\d+)/);
        if (match) currentNum = parseInt(match[1]);
    }
    
    if (currentNum >= 5) {
        // Interview complete - show final results
        showInterviewResults();
        return;
    }
    
    // Load next question
    const questions = [
        "Can you explain the difference between REST and GraphQL APIs?",
        "How would you optimize a slow database query?",
        "Describe a challenging project you worked on.",
        "How do you handle conflicts in a team?",
        "What are your career goals for the next 5 years?"
    ];
    
    const nextNum = currentNum + 1;
    if (questionHeader) {
        questionHeader.textContent = `Question ${nextNum} of 5`;
    }
    currentQuestionEl.textContent = questions[currentNum] || questions[0];
    
    // Reset submit button
    const submitBtn = document.querySelector('button[onclick="nextInterviewQuestion()"]');
    if (submitBtn) {
        submitBtn.innerHTML = 'Submit Answer <i class="fas fa-arrow-right ml-2"></i>';
        submitBtn.onclick = submitAnswer;
    }
}

function showInterviewResults() {
    const scores = window.interviewScores || [];
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    
    let resultMessage = '';
    let resultClass = '';
    
    if (avgScore >= 80) {
        resultClass = 'bg-green-50 border-green-500';
        resultMessage = `<h3 class="text-2xl font-bold text-green-800 mb-2"><i class="fas fa-trophy mr-2"></i>Excellent Performance!</h3>
            <p class="text-green-700">You're well-prepared for interviews. Keep it up!</p>`;
    } else if (avgScore >= 60) {
        resultClass = 'bg-blue-50 border-blue-500';
        resultMessage = `<h3 class="text-2xl font-bold text-blue-800 mb-2"><i class="fas fa-thumbs-up mr-2"></i>Good Job!</h3>
            <p class="text-blue-700">You're on the right track. Practice a bit more to improve.</p>`;
    } else {
        resultClass = 'bg-yellow-50 border-yellow-500';
        resultMessage = `<h3 class="text-2xl font-bold text-yellow-800 mb-2"><i class="fas fa-graduation-cap mr-2"></i>Keep Practicing</h3>
            <p class="text-yellow-700">More practice needed. Focus on providing detailed answers.</p>`;
    }
    
    const interviewSession = document.getElementById('interviewSession');
    interviewSession.innerHTML = `
        <div class="bg-white border-2 ${resultClass} rounded-lg p-8 text-center">
            ${resultMessage}
            <div class="my-6">
                <div class="text-5xl font-bold text-gray-800 mb-2">${avgScore}%</div>
                <p class="text-gray-600">Overall Interview Score</p>
            </div>
            <div class="grid grid-cols-5 gap-2 mb-6">
                ${scores.map((s, i) => `
                    <div class="p-2 rounded ${s >= 80 ? 'bg-green-100 text-green-800' : s >= 60 ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}">
                        <div class="text-xs">Q${i+1}</div>
                        <div class="font-bold">${s}</div>
                    </div>
                `).join('')}
            </div>
            <button onclick="restartInterview()" class="btn-primary">
                <i class="fas fa-redo mr-2"></i>Start New Interview
            </button>
        </div>
    `;
}

function restartInterview() {
    window.interviewScores = [];
    document.getElementById('interviewSession').classList.add('hidden');
    document.getElementById('interviewSetup').classList.remove('hidden');
}

function skipQuestion() {
    // Record skipped question as 0 score
    if (!window.interviewScores) window.interviewScores = [];
    window.interviewScores.push(0);
    
    // Move to next question
    nextInterviewQuestion();
}

// File upload handler
document.addEventListener('change', function(e) {
    if (e.target && e.target.id === 'resumeUpload') {
        const file = e.target.files[0];
        if (file) {
            handleResumeUpload(file);
        }
    }
});

function handleResumeUpload(file) {
    // Validate file
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) {
        alert('Please upload a PDF, DOC, or DOCX file');
        return;
    }
    
    if (file.size > maxSize) {
        alert('File size must be less than 5MB');
        return;
    }
    
    // Show upload progress
    showLoading(true);
    
    // Update UI to show file selected
    const uploadArea = document.querySelector('.border-2.border-dashed');
    if (uploadArea) {
        uploadArea.innerHTML = `
            <div class="text-center">
                <i class="fas fa-file-alt text-4xl text-blue-600 mb-4"></i>
                <h4 class="text-lg font-semibold text-gray-700 mb-2">File Selected</h4>
                <p class="text-gray-600 mb-2">${file.name}</p>
                <p class="text-sm text-gray-500">Size: ${(file.size / 1024).toFixed(2)} KB</p>
                <button onclick="analyzeResume('${file.name}')" class="btn-primary mt-4">
                    <i class="fas fa-search mr-2"></i>Analyze Resume
                </button>
            </div>
        `;
    }
    
    showLoading(false);
}

function analyzeResume(fileName) {
    showLoading(true);
    
    // Simulate resume analysis
    setTimeout(() => {
        // Show analysis results
        const resultsDiv = document.getElementById('resumeAnalysisResults');
        if (resultsDiv) {
            resultsDiv.classList.remove('hidden');
            
            // Update file name in results
            const fileNameElement = resultsDiv.querySelector('.text-gray-600');
            if (fileNameElement) {
                fileNameElement.textContent = `File: ${fileName}`;
            }
            
            // Generate random scores for demonstration
            const overallScore = Math.floor(Math.random() * 30) + 70; // 70-100
            const atsScore = (Math.random() * 2 + 6).toFixed(1); // 6.0-8.0
            
            // Update scores
            const scoreElements = resultsDiv.querySelectorAll('.text-3xl');
            if (scoreElements[0]) scoreElements[0].textContent = overallScore + '%';
            if (scoreElements[1]) scoreElements[1].textContent = atsScore;
            
            // Update analysis items based on score
            updateAnalysisItems(resultsDiv, overallScore);
            
            // Add reset button
            addResetButton();
        }
        
        showLoading(false);
    }, 2000);
}

function addResetButton() {
    const uploadArea = document.querySelector('.border-2.border-dashed');
    if (uploadArea && !uploadArea.querySelector('.reset-btn')) {
        const resetBtn = document.createElement('button');
        resetBtn.className = 'reset-btn btn-secondary mt-4';
        resetBtn.innerHTML = '<i class="fas fa-redo mr-2"></i>Upload Different Resume';
        resetBtn.onclick = resetResumeUpload;
        uploadArea.appendChild(resetBtn);
    }
}

function resetResumeUpload() {
    // Reset upload area
    const uploadArea = document.querySelector('.border-2.border-dashed');
    if (uploadArea) {
        uploadArea.innerHTML = `
            <div class="text-center">
                <i class="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
                <h4 class="text-lg font-semibold text-gray-700 mb-2">Upload Your Resume</h4>
                <p class="text-gray-500 mb-4">Drag and drop your resume here, or click to browse</p>
                <input type="file" id="resumeUpload" accept=".pdf,.doc,.docx" class="hidden">
                <button onclick="document.getElementById('resumeUpload').click()" class="btn-primary">
                    <i class="fas fa-upload mr-2"></i>Choose File
                </button>
                <p class="text-xs text-gray-500 mt-2">Supported formats: PDF, DOC, DOCX (Max size: 5MB)</p>
            </div>
        `;
    }
    
    // Hide analysis results
    const resultsDiv = document.getElementById('resumeAnalysisResults');
    if (resultsDiv) {
        resultsDiv.classList.add('hidden');
    }
}

function updateAnalysisItems(resultsDiv, score) {
    const items = resultsDiv.querySelectorAll('.analysis-item');
    
    // Update analysis items based on score
    const analyses = [
        { label: 'Contact Information', status: score > 60 ? 'Complete' : 'Missing', icon: 'check-circle', color: 'green' },
        { label: 'Professional Summary', status: score > 70 ? 'Good' : 'Needs Work', icon: score > 70 ? 'check-circle' : 'exclamation-circle', color: score > 70 ? 'green' : 'yellow' },
        { label: 'Skills Section', status: score > 80 ? 'Excellent' : score > 60 ? 'Good' : 'Needs Improvement', icon: score > 80 ? 'check-circle' : 'exclamation-circle', color: score > 80 ? 'green' : 'yellow' },
        { label: 'Experience Description', status: score > 75 ? 'Detailed' : 'Vague', icon: score > 75 ? 'check-circle' : 'exclamation-circle', color: score > 75 ? 'green' : 'yellow' }
    ];
    
    items.forEach((item, index) => {
        if (analyses[index]) {
            const analysis = analyses[index];
            const labelElement = item.querySelector('.font-medium');
            const statusElement = item.querySelector('span:last-child');
            
            if (labelElement) labelElement.textContent = analysis.label;
            if (statusElement) {
                statusElement.className = `text-${analysis.color}-600`;
                statusElement.innerHTML = `<i class="fas fa-${analysis.icon}"></i> ${analysis.status}`;
            }
        }
    });
}

function saveReadinessSettings() {
    showLoading(true);
    
    // Get current values
    const cgpa = document.getElementById('cgpa').value;
    const technical = document.getElementById('technicalSkills').value;
    const communication = document.getElementById('communicationSkills').value;
    const projects = document.getElementById('projects').value;
    const aptitude = document.getElementById('aptitude').value;
    
    // Simulate saving to backend
    setTimeout(() => {
        // Update student data
        if (appState.studentData) {
            appState.studentData.cgpa = parseFloat(cgpa) / 10;
            appState.studentData.skills = {
                ...appState.studentData.skills,
                programming: parseInt(technical),
                communication: parseInt(communication),
                data_structures: parseInt(aptitude)
            };
            appState.studentData.projects_count = Math.floor(parseInt(projects) / 25);
            appState.studentData.readiness_score = parseInt(cgpa) * 0.3 + parseInt(technical) * 0.25 + parseInt(communication) * 0.2 + parseInt(projects) * 0.15 + parseInt(aptitude) * 0.1;
        }
        
        showLoading(false);
        alert('Readiness settings saved successfully!');
    }, 1000);
}

function resetToDefaults() {
    // Reset sliders to default values
    document.getElementById('cgpa').value = 75;
    document.getElementById('technicalSkills').value = 70;
    document.getElementById('communicationSkills').value = 80;
    document.getElementById('projects').value = 65;
    document.getElementById('aptitude').value = 72;
    
    // Update display
    updateReadinessScore();
    
    alert('Settings reset to defaults!');
}

// Company database with categorized companies
const companyDatabase = [
    // Technology - Software Engineer
    { name: "Google India", industry: "Technology", role: "Software Engineer", location: "Bangalore", size: "Large (1000+)", match: 98 },
    { name: "Microsoft IDC", industry: "Technology", role: "Software Engineer", location: "Hyderabad", size: "Large (1000+)", match: 96 },
    { name: "Amazon India", industry: "Technology", role: "Software Engineer", location: "Bangalore", size: "Large (1000+)", match: 94 },
    { name: "Flipkart", industry: "Technology", role: "Software Engineer", location: "Bangalore", size: "Large (1000+)", match: 92 },
    { name: "Ola Cabs", industry: "Technology", role: "Software Engineer", location: "Bangalore", size: "Medium (201-1000)", match: 88 },
    { name: "Zomato", industry: "Technology", role: "Software Engineer", location: "Remote", size: "Medium (201-1000)", match: 86 },
    { name: "Razorpay", industry: "Technology", role: "Software Engineer", location: "Bangalore", size: "Medium (201-1000)", match: 90 },
    { name: "CRED", industry: "Technology", role: "Software Engineer", location: "Bangalore", size: "Small (51-200)", match: 87 },
    { name: "PhonePe", industry: "Technology", role: "Software Engineer", location: "Bangalore", size: "Large (1000+)", match: 93 },
    { name: "Freshworks", industry: "Technology", role: "Software Engineer", location: "Chennai", size: "Large (1000+)", match: 89 },
    { name: "Postman", industry: "Technology", role: "Software Engineer", location: "Bangalore", size: "Medium (201-1000)", match: 91 },
    { name: "Hasura", industry: "Technology", role: "Software Engineer", location: "Bangalore", size: "Small (51-200)", match: 85 },
    { name: "Glance", industry: "Technology", role: "Software Engineer", location: "Bangalore", size: "Startup (1-50)", match: 82 },
    
    // Technology - Data Scientist
    { name: "Fractal Analytics", industry: "Technology", role: "Data Scientist", location: "Mumbai", size: "Large (1000+)", match: 95 },
    { name: "Mu Sigma", industry: "Technology", role: "Data Scientist", location: "Bangalore", size: "Large (1000+)", match: 90 },
    { name: "Analytics Vidhya", industry: "Technology", role: "Data Scientist", location: "Remote", size: "Small (51-200)", match: 84 },
    { name: "Tiger Analytics", industry: "Technology", role: "Data Scientist", location: "Chennai", size: "Medium (201-1000)", match: 88 },
    { name: "LatentView", industry: "Technology", role: "Data Scientist", location: "Chennai", size: "Medium (201-1000)", match: 86 },
    { name: "Bridgei2i", industry: "Technology", role: "Data Scientist", location: "Bangalore", size: "Medium (201-1000)", match: 87 },
    { name: "H2O.ai", industry: "Technology", role: "Data Scientist", location: "Remote", size: "Small (51-200)", match: 89 },
    { name: "DataWeave", industry: "Technology", role: "Data Scientist", location: "Bangalore", size: "Small (51-200)", match: 85 },
    
    // Technology - Product Manager
    { name: "Swiggy", industry: "Technology", role: "Product Manager", location: "Bangalore", size: "Large (1000+)", match: 93 },
    { name: "Paytm", industry: "Technology", role: "Product Manager", location: "Noida", size: "Large (1000+)", match: 91 },
    { name: "PolicyBazaar", industry: "Technology", role: "Product Manager", location: "Gurgaon", size: "Large (1000+)", match: 89 },
    { name: "MakeMyTrip", industry: "Technology", role: "Product Manager", location: "Gurgaon", size: "Large (1000+)", match: 88 },
    { name: "BYJU'S", industry: "Technology", role: "Product Manager", location: "Bangalore", size: "Large (1000+)", match: 87 },
    { name: "Unacademy", industry: "Technology", role: "Product Manager", location: "Bangalore", size: "Medium (201-1000)", match: 86 },
    { name: "Meesho", industry: "Technology", role: "Product Manager", location: "Bangalore", size: "Medium (201-1000)", match: 90 },
    { name: "Urban Company", industry: "Technology", role: "Product Manager", location: "Gurgaon", size: "Medium (201-1000)", match: 88 },
    
    // Technology - DevOps Engineer
    { name: "Infosys", industry: "Technology", role: "DevOps Engineer", location: "Pune", size: "Large (1000+)", match: 90 },
    { name: "Wipro", industry: "Technology", role: "DevOps Engineer", location: "Hyderabad", size: "Large (1000+)", match: 88 },
    { name: "TCS", industry: "Technology", role: "DevOps Engineer", location: "Mumbai", size: "Large (1000+)", match: 87 },
    { name: "Tech Mahindra", industry: "Technology", role: "DevOps Engineer", location: "Pune", size: "Large (1000+)", match: 85 },
    { name: "Cognizant", industry: "Technology", role: "DevOps Engineer", location: "Chennai", size: "Large (1000+)", match: 86 },
    { name: "Mindtree", industry: "Technology", role: "DevOps Engineer", location: "Bangalore", size: "Large (1000+)", match: 88 },
    { name: "L&T Infotech", industry: "Technology", role: "DevOps Engineer", location: "Mumbai", size: "Large (1000+)", match: 84 },
    { name: "Mphasis", industry: "Technology", role: "DevOps Engineer", location: "Bangalore", size: "Large (1000+)", match: 85 },
    
    // Technology - UI/UX Designer
    { name: "Adobe India", industry: "Technology", role: "UI/UX Designer", location: "Bangalore", size: "Large (1000+)", match: 96 },
    { name: "Figma", industry: "Technology", role: "UI/UX Designer", location: "Remote", size: "Medium (201-1000)", match: 94 },
    { name: "Canva", industry: "Technology", role: "UI/UX Designer", location: "Remote", size: "Large (1000+)", match: 93 },
    { name: "Zeta Suite", industry: "Technology", role: "UI/UX Designer", location: "Bangalore", size: "Medium (201-1000)", match: 89 },
    { name: "Practo", industry: "Technology", role: "UI/UX Designer", location: "Bangalore", size: "Medium (201-1000)", match: 87 },
    { name: "InMobi", industry: "Technology", role: "UI/UX Designer", location: "Bangalore", size: "Medium (201-1000)", match: 88 },
    { name: "ShareChat", industry: "Technology", role: "UI/UX Designer", location: "Bangalore", size: "Medium (201-1000)", match: 86 },
    
    // Finance - Software Engineer
    { name: "HDFC Bank", industry: "Finance", role: "Software Engineer", location: "Mumbai", size: "Large (1000+)", match: 91 },
    { name: "ICICI Bank", industry: "Finance", role: "Software Engineer", location: "Hyderabad", size: "Large (1000+)", match: 89 },
    { name: "Axis Bank", industry: "Finance", role: "Software Engineer", location: "Mumbai", size: "Large (1000+)", match: 88 },
    { name: "SBI Cards", industry: "Finance", role: "Software Engineer", location: "Gurgaon", size: "Large (1000+)", match: 87 },
    { name: "Bajaj Finserv", industry: "Finance", role: "Software Engineer", location: "Pune", size: "Large (1000+)", match: 86 },
    { name: "Lendingkart", industry: "Finance", role: "Software Engineer", location: "Ahmedabad", size: "Medium (201-1000)", match: 85 },
    { name: "ZestMoney", industry: "Finance", role: "Software Engineer", location: "Bangalore", size: "Small (51-200)", match: 84 },
    { name: "Slice", industry: "Finance", role: "Software Engineer", location: "Bangalore", size: "Small (51-200)", match: 86 },
    
    // Finance - Data Scientist
    { name: "Goldman Sachs", industry: "Finance", role: "Data Scientist", location: "Bangalore", size: "Large (1000+)", match: 95 },
    { name: "JP Morgan", industry: "Finance", role: "Data Scientist", location: "Mumbai", size: "Large (1000+)", match: 93 },
    { name: "Morgan Stanley", industry: "Finance", role: "Data Scientist", location: "Mumbai", size: "Large (1000+)", match: 92 },
    { name: "Barclays", industry: "Finance", role: "Data Scientist", location: "Pune", size: "Large (1000+)", match: 90 },
    { name: "Deutsche Bank", industry: "Finance", role: "Data Scientist", location: "Pune", size: "Large (1000+)", match: 89 },
    { name: "Citibank", industry: "Finance", role: "Data Scientist", location: "Mumbai", size: "Large (1000+)", match: 91 },
    { name: "Kotak Securities", industry: "Finance", role: "Data Scientist", location: "Mumbai", size: "Large (1000+)", match: 87 },
    
    // Finance - Product Manager
    { name: "PhonePe", industry: "Finance", role: "Product Manager", location: "Bangalore", size: "Large (1000+)", match: 94 },
    { name: "Paytm", industry: "Finance", role: "Product Manager", location: "Noida", size: "Large (1000+)", match: 93 },
    { name: "Groww", industry: "Finance", role: "Product Manager", location: "Bangalore", size: "Medium (201-1000)", match: 91 },
    { name: "Zerodha", industry: "Finance", role: "Product Manager", location: "Bangalore", size: "Medium (201-1000)", match: 90 },
    { name: "Upstox", industry: "Finance", role: "Product Manager", location: "Mumbai", size: "Medium (201-1000)", match: 88 },
    { name: "CoinDCX", industry: "Finance", role: "Product Manager", location: "Mumbai", size: "Medium (201-1000)", match: 87 },
    { name: "Jupiter Money", industry: "Finance", role: "Product Manager", location: "Bangalore", size: "Small (51-200)", match: 86 },
    
    // Healthcare - Software Engineer
    { name: "Practo", industry: "Healthcare", role: "Software Engineer", location: "Bangalore", size: "Medium (201-1000)", match: 89 },
    { name: "PharmEasy", industry: "Healthcare", role: "Software Engineer", location: "Mumbai", size: "Large (1000+)", match: 88 },
    { name: "1mg", industry: "Healthcare", role: "Software Engineer", location: "Gurgaon", size: "Medium (201-1000)", match: 87 },
    { name: "NetMeds", industry: "Healthcare", role: "Software Engineer", location: "Chennai", size: "Medium (201-1000)", match: 86 },
    { name: "Cure.fit", industry: "Healthcare", role: "Software Engineer", location: "Bangalore", size: "Large (1000+)", match: 90 },
    { name: "Lybrate", industry: "Healthcare", role: "Software Engineer", location: "Delhi", size: "Small (51-200)", match: 84 },
    { name: "Docplexus", industry: "Healthcare", role: "Software Engineer", location: "Hyderabad", size: "Startup (1-50)", match: 82 },
    
    // Healthcare - Data Scientist
    { name: "Niramai", industry: "Healthcare", role: "Data Scientist", location: "Bangalore", size: "Small (51-200)", match: 91 },
    { name: "SigTuple", industry: "Healthcare", role: "Data Scientist", location: "Bangalore", size: "Small (51-200)", match: 89 },
    { name: "Qure.ai", industry: "Healthcare", role: "Data Scientist", location: "Mumbai", size: "Small (51-200)", match: 90 },
    { name: "HealthifyMe", industry: "Healthcare", role: "Data Scientist", location: "Bangalore", size: "Medium (201-1000)", match: 88 },
    { name: "Orange Health", industry: "Healthcare", role: "Data Scientist", location: "Bangalore", size: "Small (51-200)", match: 87 },
    { name: "Pristyn Care", industry: "Healthcare", role: "Data Scientist", location: "Gurgaon", size: "Medium (201-1000)", match: 86 },
    
    // E-commerce - Software Engineer
    { name: "Amazon India", industry: "E-commerce", role: "Software Engineer", location: "Bangalore", size: "Large (1000+)", match: 95 },
    { name: "Flipkart", industry: "E-commerce", role: "Software Engineer", location: "Bangalore", size: "Large (1000+)", match: 94 },
    { name: "Myntra", industry: "E-commerce", role: "Software Engineer", location: "Bangalore", size: "Large (1000+)", match: 92 },
    { name: "Nykaa", industry: "E-commerce", role: "Software Engineer", location: "Mumbai", size: "Large (1000+)", match: 90 },
    { name: "Ajio", industry: "E-commerce", role: "Software Engineer", location: "Mumbai", size: "Large (1000+)", match: 88 },
    { name: "Snapdeal", industry: "E-commerce", role: "Software Engineer", location: "Delhi", size: "Medium (201-1000)", match: 85 },
    { name: "Lenskart", industry: "E-commerce", role: "Software Engineer", location: "Delhi", size: "Large (1000+)", match: 89 },
    { name: "FirstCry", industry: "E-commerce", role: "Software Engineer", location: "Pune", size: "Large (1000+)", match: 87 },
    { name: "Boat Lifestyle", industry: "E-commerce", role: "Software Engineer", location: "Delhi", size: "Medium (201-1000)", match: 88 },
    { name: "Sugar Cosmetics", industry: "E-commerce", role: "Software Engineer", location: "Mumbai", size: "Medium (201-1000)", match: 86 },
    
    // E-commerce - Data Scientist
    { name: "Walmart Labs", industry: "E-commerce", role: "Data Scientist", location: "Bangalore", size: "Large (1000+)", match: 94 },
    { name: "Target India", industry: "E-commerce", role: "Data Scientist", location: "Bangalore", size: "Large (1000+)", match: 92 },
    { name: "BigBasket", industry: "E-commerce", role: "Data Scientist", location: "Bangalore", size: "Large (1000+)", match: 90 },
    { name: "Blinkit", industry: "E-commerce", role: "Data Scientist", location: "Gurgaon", size: "Medium (201-1000)", match: 88 },
    { name: "Dunzo", industry: "E-commerce", role: "Data Scientist", location: "Bangalore", size: "Medium (201-1000)", match: 87 },
    { name: "Instamart", industry: "E-commerce", role: "Data Scientist", location: "Bangalore", size: "Large (1000+)", match: 89 },
    
    // E-commerce - Product Manager
    { name: "Meesho", industry: "E-commerce", role: "Product Manager", location: "Bangalore", size: "Large (1000+)", match: 92 },
    { name: "DealShare", industry: "E-commerce", role: "Product Manager", location: "Bangalore", size: "Medium (201-1000)", match: 88 },
    { name: "CityMall", industry: "E-commerce", role: "Product Manager", location: "Gurgaon", size: "Small (51-200)", match: 86 },
    { name: "ElasticRun", industry: "E-commerce", role: "Product Manager", location: "Pune", size: "Medium (201-1000)", match: 87 },
    { name: "Udaan", industry: "E-commerce", role: "Product Manager", location: "Bangalore", size: "Large (1000+)", match: 89 },
    
    // Consulting - Software Engineer
    { name: "McKinsey Digital", industry: "Consulting", role: "Software Engineer", location: "Gurgaon", size: "Large (1000+)", match: 93 },
    { name: "BCG Gamma", industry: "Consulting", role: "Software Engineer", location: "Mumbai", size: "Large (1000+)", match: 91 },
    { name: "Bain Capability", industry: "Consulting", role: "Software Engineer", location: "Bangalore", size: "Large (1000+)", match: 90 },
    { name: "Accenture", industry: "Consulting", role: "Software Engineer", location: "Bangalore", size: "Large (1000+)", match: 89 },
    { name: "Deloitte Digital", industry: "Consulting", role: "Software Engineer", location: "Hyderabad", size: "Large (1000+)", match: 88 },
    { name: "KPMG", industry: "Consulting", role: "Software Engineer", location: "Mumbai", size: "Large (1000+)", match: 87 },
    { name: "PwC", industry: "Consulting", role: "Software Engineer", location: "Gurgaon", size: "Large (1000+)", match: 86 },
    { name: "EY", industry: "Consulting", role: "Software Engineer", location: "Bangalore", size: "Large (1000+)", match: 87 },
    { name: "TCS Consulting", industry: "Consulting", role: "Software Engineer", location: "Mumbai", size: "Large (1000+)", match: 85 },
    { name: "Infosys Consulting", industry: "Consulting", role: "Software Engineer", location: "Bangalore", size: "Large (1000+)", match: 86 },
    
    // Consulting - Data Scientist
    { name: "Fractal Analytics", industry: "Consulting", role: "Data Scientist", location: "Mumbai", size: "Large (1000+)", match: 94 },
    { name: "Absolutdata", industry: "Consulting", role: "Data Scientist", location: "Gurgaon", size: "Medium (201-1000)", match: 89 },
    { name: "BRIDGEi2i", industry: "Consulting", role: "Data Scientist", location: "Bangalore", size: "Medium (201-1000)", match: 88 },
    { name: "LatentView", industry: "Consulting", role: "Data Scientist", location: "Chennai", size: "Medium (201-1000)", match: 87 },
    { name: "Tiger Analytics", industry: "Consulting", role: "Data Scientist", location: "Chennai", size: "Medium (201-1000)", match: 90 },
    { name: "Mu Sigma", industry: "Consulting", role: "Data Scientist", location: "Bangalore", size: "Large (1000+)", match: 91 },
    
    // Consulting - Product Manager
    { name: "McKinsey", industry: "Consulting", role: "Product Manager", location: "Gurgaon", size: "Large (1000+)", match: 92 },
    { name: "BCG Platinion", industry: "Consulting", role: "Product Manager", location: "Mumbai", size: "Large (1000+)", match: 90 },
    { name: "Bain", industry: "Consulting", role: "Product Manager", location: "Bangalore", size: "Large (1000+)", match: 89 },
    { name: "Strategy&", industry: "Consulting", role: "Product Manager", location: "Mumbai", size: "Large (1000+)", match: 88 },
    { name: "Kearney", industry: "Consulting", role: "Product Manager", location: "Bangalore", size: "Large (1000+)", match: 87 },
    { name: "Oliver Wyman", industry: "Consulting", role: "Product Manager", location: "Mumbai", size: "Medium (201-1000)", match: 86 }
];

function findCompanyMatches() {
    showLoading(true);
    
    // Get selected preferences
    const industry = document.getElementById('preferredIndustry')?.value || 'Technology';
    const role = document.getElementById('jobRole')?.value || 'Software Engineer';
    const location = document.getElementById('locationPreference')?.value || 'Bangalore';
    const size = document.getElementById('companySize')?.value || 'Large (1000+)';
    
    console.log('Finding company matches for:', { industry, role, location, size });
    
    // Filter companies based on preferences
    let matchedCompanies = companyDatabase.filter(company => {
        let score = 0;
        
        // Industry match (weight: 30%)
        if (company.industry === industry) score += 30;
        else if (company.industry === 'Technology' && industry === 'E-commerce') score += 15;
        
        // Role match (weight: 30%)
        if (company.role === role) score += 30;
        
        // Location match (weight: 20%)
        if (company.location === location) score += 20;
        else if (location === 'Remote' && ['Bangalore', 'Hyderabad', 'Pune'].includes(company.location)) score += 15;
        else if (company.location === 'Bangalore') score += 10; // Bangalore is tech hub
        
        // Size match (weight: 20%)
        if (company.size === size) score += 20;
        
        // Store calculated match score
        company.calculatedMatch = Math.min(98, Math.max(65, score + Math.floor(Math.random() * 10)));
        
        return score >= 40; // Minimum threshold to be considered a match
    });
    
    // If no companies match, show some fallback options from the same industry or role
    if (matchedCompanies.length === 0) {
        matchedCompanies = companyDatabase
            .filter(c => c.industry === industry || c.role === role)
            .slice(0, 3)
            .map(c => ({ ...c, calculatedMatch: Math.floor(Math.random() * 20) + 65 }));
    }
    
    // Sort by match score
    matchedCompanies.sort((a, b) => b.calculatedMatch - a.calculatedMatch);
    
    // Take top 5
    const topMatches = matchedCompanies.slice(0, 5);
    
    // Render results
    renderCompanyMatches(topMatches);
    
    // Update chart
    updateCompanyChart(topMatches);
    
    showLoading(false);
}

function renderCompanyMatches(companies) {
    const container = document.getElementById('companyMatchesContainer');
    const list = document.getElementById('companyMatchesList');
    
    if (!container || !list) return;
    
    // Show container
    container.classList.remove('hidden');
    
    // Generate HTML for each company
    const companiesHTML = companies.map((company, index) => {
        const matchScore = company.calculatedMatch || company.match;
        let borderColor, bgColor, badgeColor, badgeText;
        
        if (matchScore >= 90) {
            borderColor = 'border-green-500';
            bgColor = 'bg-green-50';
            badgeColor = 'bg-green-100 text-green-800';
            badgeText = 'Excellent Match';
        } else if (matchScore >= 80) {
            borderColor = 'border-blue-500';
            bgColor = 'bg-blue-50';
            badgeColor = 'bg-blue-100 text-blue-800';
            badgeText = 'Good Match';
        } else if (matchScore >= 70) {
            borderColor = 'border-yellow-500';
            bgColor = 'bg-yellow-50';
            badgeColor = 'bg-yellow-100 text-yellow-800';
            badgeText = 'Fair Match';
        } else {
            borderColor = 'border-gray-400';
            bgColor = 'bg-gray-50';
            badgeColor = 'bg-gray-100 text-gray-800';
            badgeText = 'Possible Match';
        }
        
        return `
            <div class="flex items-center justify-between p-4 ${bgColor} rounded-lg border-l-4 ${borderColor}">
                <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 rounded bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                        ${company.name.charAt(0)}
                    </div>
                    <div>
                        <h5 class="font-semibold text-gray-800">${company.name}</h5>
                        <p class="text-sm text-gray-600">${company.role} • ${company.location} • ${company.size}</p>
                        <div class="flex items-center mt-1 space-x-2">
                            <div class="w-16 bg-gray-200 rounded-full h-1.5">
                                <div class="bg-gradient-to-r from-teal-500 to-blue-500 h-1.5 rounded-full" style="width: ${matchScore}%"></div>
                            </div>
                            <span class="text-xs font-medium text-gray-600">${matchScore}% Match</span>
                        </div>
                    </div>
                </div>
                <div class="text-right">
                    <div class="${badgeColor} text-sm px-3 py-1 rounded-full mb-2">${badgeText}</div>
                    <button onclick="viewCompanyDetails('${company.name}')" class="text-teal-600 hover:text-teal-800 text-sm font-medium">
                        <i class="fas fa-info-circle mr-1"></i>View Details
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    list.innerHTML = companiesHTML || '<p class="text-center text-gray-500 py-4">No matching companies found. Try adjusting your preferences.</p>';
}

function updateCompanyChart(companies) {
    const ctx = document.getElementById('companyChart');
    if (!ctx) return;
    
    // Destroy existing chart if any
    if (window.companyChartInstance) {
        window.companyChartInstance.destroy();
    }
    
    const labels = companies.map(c => c.name.length > 12 ? c.name.substring(0, 12) + '...' : c.name);
    const data = companies.map(c => c.calculatedMatch || c.match);
    const colors = data.map(score => {
        if (score >= 90) return 'rgba(34, 197, 94, 0.8)';
        if (score >= 80) return 'rgba(59, 130, 246, 0.8)';
        if (score >= 70) return 'rgba(251, 191, 36, 0.8)';
        return 'rgba(156, 163, 175, 0.8)';
    });
    
    window.companyChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Match Score (%)',
                data: data,
                backgroundColor: colors,
                borderRadius: 6,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Match Score (%)'
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        afterLabel: function(context) {
                            const company = companies[context.dataIndex];
                            return `Role: ${company.role}\nLocation: ${company.location}\nSize: ${company.size}`;
                        }
                    }
                }
            }
        }
    });
}

function viewCompanyDetails(companyName) {
    const company = companyDatabase.find(c => c.name === companyName);
    if (!company) return;
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-xl p-6 max-w-lg w-full">
            <div class="flex justify-between items-start mb-4">
                <div class="flex items-center space-x-3">
                    <div class="w-14 h-14 rounded bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold text-2xl">
                        ${company.name.charAt(0)}
                    </div>
                    <div>
                        <h3 class="text-xl font-bold text-gray-800">${company.name}</h3>
                        <p class="text-sm text-gray-600">${company.industry} • ${company.size}</p>
                    </div>
                </div>
                <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-gray-50 p-3 rounded-lg">
                        <p class="text-xs text-gray-500">Role</p>
                        <p class="font-medium text-gray-800">${company.role}</p>
                    </div>
                    <div class="bg-gray-50 p-3 rounded-lg">
                        <p class="text-xs text-gray-500">Location</p>
                        <p class="font-medium text-gray-800">${company.location}</p>
                    </div>
                </div>
                
                <div class="bg-teal-50 p-4 rounded-lg">
                    <div class="flex justify-between items-center">
                        <span class="font-medium text-teal-800">Match Score</span>
                        <span class="text-2xl font-bold text-teal-600">${company.calculatedMatch || company.match}%</span>
                    </div>
                    <div class="w-full bg-teal-200 rounded-full h-2 mt-2">
                        <div class="bg-teal-500 h-2 rounded-full" style="width: ${company.calculatedMatch || company.match}%"></div>
                    </div>
                </div>
                
                <div class="bg-blue-50 p-3 rounded-lg">
                    <h4 class="font-medium text-blue-800 mb-2"><i class="fas fa-lightbulb mr-2"></i>Why this match?</h4>
                    <ul class="text-sm text-blue-700 space-y-1">
                        <li>• Industry: ${company.industry}</li>
                        <li>• Role: ${company.role}</li>
                        <li>• Location: ${company.location}</li>
                        <li>• Company Size: ${company.size}</li>
                    </ul>
                </div>
            </div>
            
            <div class="mt-6 flex space-x-3">
                <button onclick="alert('Application started for ${company.name}!')" class="flex-1 bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition">
                    <i class="fas fa-paper-plane mr-2"></i>Apply Now
                </button>
                <button onclick="this.closest('.fixed').remove()" class="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition">
                    Close
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Dashboard Stats Detail View Functions
function showSkillsDetails() {
    const skills = [
        { name: 'JavaScript', score: 92 },
        { name: 'Python', score: 88 },
        { name: 'React', score: 85 },
        { name: 'Node.js', score: 82 },
        { name: 'SQL', score: 80 },
        { name: 'Java', score: 78 },
        { name: 'HTML/CSS', score: 90 },
        { name: 'Git', score: 85 },
        { name: 'Docker', score: 72 },
        { name: 'AWS', score: 70 },
        { name: 'Data Structures', score: 75 },
        { name: 'Algorithms', score: 73 }
    ];
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-6">
                <div class="flex items-center space-x-3">
                    <div class="bg-blue-100 p-3 rounded-lg">
                        <i class="fas fa-chart-line text-blue-600 text-xl"></i>
                    </div>
                    <h3 class="text-2xl font-bold text-gray-800">12 Skills Analyzed</h3>
                </div>
                <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            
            <div class="space-y-4">
                ${skills.map(skill => `
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <div class="flex justify-between items-center mb-2">
                            <span class="font-semibold text-gray-800">${skill.name}</span>
                            <span class="font-bold text-blue-600">${skill.score}%</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-3">
                            <div class="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full" style="width: ${skill.score}%"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="mt-6 flex justify-center">
                <button onclick="this.closest('.fixed').remove()" class="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                    Close
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function showInterviewDetails() {
    const interviews = [
        { id: 1, date: '2024-01-15', score: 85, topic: 'Technical - JavaScript', feedback: 'Good understanding of closures and async programming' },
        { id: 2, date: '2024-01-10', score: 78, topic: 'System Design', feedback: 'Need to improve on scalability concepts' },
        { id: 3, date: '2024-01-05', score: 92, topic: 'Behavioral', feedback: 'Excellent communication and problem-solving approach' },
        { id: 4, date: '2023-12-28', score: 75, topic: 'Data Structures', feedback: 'Practice more tree and graph problems' },
        { id: 5, date: '2023-12-20', score: 88, topic: 'React & Frontend', feedback: 'Strong knowledge of component lifecycle' },
        { id: 6, date: '2023-12-15', score: 82, topic: 'Node.js & Backend', feedback: 'Good understanding of event loop and middleware' },
        { id: 7, date: '2023-12-10', score: 79, topic: 'Database & SQL', feedback: 'Review join operations and indexing' },
        { id: 8, date: '2023-12-05', score: 90, topic: 'Full Stack', feedback: 'Comprehensive understanding of web development' }
    ];
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-6">
                <div class="flex items-center space-x-3">
                    <div class="bg-green-100 p-3 rounded-lg">
                        <i class="fas fa-video text-green-600 text-xl"></i>
                    </div>
                    <h3 class="text-2xl font-bold text-gray-800">8 Mock Interview Reviews</h3>
                </div>
                <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            
            <div class="space-y-4">
                ${interviews.map(interview => `
                    <div class="border-l-4 ${interview.score >= 85 ? 'border-green-500 bg-green-50' : interview.score >= 75 ? 'border-blue-500 bg-blue-50' : 'border-yellow-500 bg-yellow-50'} p-4 rounded-r-lg">
                        <div class="flex justify-between items-start mb-2">
                            <div>
                                <span class="text-sm text-gray-500">#${interview.id} • ${interview.date}</span>
                                <h4 class="font-semibold text-gray-800">${interview.topic}</h4>
                            </div>
                            <div class="bg-white px-3 py-1 rounded-full text-sm font-bold ${interview.score >= 85 ? 'text-green-600' : interview.score >= 75 ? 'text-blue-600' : 'text-yellow-600'}">
                                ${interview.score}%
                            </div>
                        </div>
                        <p class="text-gray-700 text-sm"><i class="fas fa-comment-alt mr-2"></i>${interview.feedback}</p>
                    </div>
                `).join('')}
            </div>
            
            <div class="mt-6 flex justify-center">
                <button onclick="this.closest('.fixed').remove()" class="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                    Close
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function showResumeDetails() {
    const analysisItems = [
        { category: 'Contact Information', score: 95, status: 'Complete', icon: 'check-circle', color: 'green' },
        { category: 'Professional Summary', score: 88, status: 'Good', icon: 'check-circle', color: 'green' },
        { category: 'Skills Section', score: 82, status: 'Comprehensive', icon: 'check-circle', color: 'green' },
        { category: 'Work Experience', score: 85, status: 'Well Detailed', icon: 'check-circle', color: 'green' },
        { category: 'Education', score: 100, status: 'Complete', icon: 'check-circle', color: 'green' },
        { category: 'Projects', score: 78, status: 'Good', icon: 'info-circle', color: 'blue' },
        { category: 'Certifications', score: 70, status: 'Could Add More', icon: 'info-circle', color: 'blue' },
        { category: 'ATS Compatibility', score: 85, status: 'Optimized', icon: 'check-circle', color: 'green' }
    ];
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-6">
                <div class="flex items-center space-x-3">
                    <div class="bg-purple-100 p-3 rounded-lg">
                        <i class="fas fa-file-alt text-purple-600 text-xl"></i>
                    </div>
                    <div>
                        <h3 class="text-2xl font-bold text-gray-800">Resume Analysis</h3>
                        <p class="text-purple-600 font-semibold">Overall Score: 85%</p>
                    </div>
                </div>
                <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div class="bg-purple-50 p-4 rounded-lg text-center">
                    <div class="text-4xl font-bold text-purple-600">85%</div>
                    <p class="text-gray-600">Overall Score</p>
                </div>
                <div class="bg-blue-50 p-4 rounded-lg text-center">
                    <div class="text-4xl font-bold text-blue-600">7.2</div>
                    <p class="text-gray-600">ATS Compatibility</p>
                </div>
            </div>
            
            <div class="space-y-3">
                <h4 class="font-semibold text-gray-800 mb-3">Detailed Breakdown</h4>
                ${analysisItems.map(item => `
                    <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span class="font-medium text-gray-700">${item.category}</span>
                        <div class="flex items-center space-x-3">
                            <div class="w-24 bg-gray-200 rounded-full h-2">
                                <div class="bg-${item.color}-500 h-2 rounded-full" style="width: ${item.score}%"></div>
                            </div>
                            <span class="text-${item.color}-600 text-sm font-semibold">
                                <i class="fas fa-${item.icon} mr-1"></i>${item.status}
                            </span>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="mt-6 flex justify-center">
                <button onclick="this.closest('.fixed').remove()" class="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                    Close
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function showResourcesDetails() {
    const resources = [
        { title: 'Resume Writing Guide', type: 'Guide', icon: 'file-alt', color: 'blue' },
        { title: 'Technical Interview Prep', type: 'Course', icon: 'code', color: 'green' },
        { title: 'Behavioral Interview Tips', type: 'Video', icon: 'video', color: 'red' },
        { title: 'Salary Negotiation Handbook', type: 'E-Book', icon: 'book', color: 'purple' },
        { title: 'LinkedIn Optimization', type: 'Guide', icon: 'linkedin', color: 'blue' },
        { title: 'System Design Fundamentals', type: 'Course', icon: 'sitemap', color: 'indigo' },
        { title: 'Python for Beginners', type: 'Course', icon: 'python', color: 'yellow' },
        { title: 'JavaScript Advanced Concepts', type: 'Video', icon: 'js', color: 'yellow' },
        { title: 'Database Design Patterns', type: 'Article', icon: 'database', color: 'orange' },
        { title: 'Cloud Computing Basics', type: 'Course', icon: 'cloud', color: 'blue' },
        { title: 'Agile Methodology Guide', type: 'E-Book', icon: 'tasks', color: 'green' },
        { title: 'Career Growth Roadmap', type: 'Template', icon: 'map-marked-alt', color: 'teal' }
    ];
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-6">
                <div class="flex items-center space-x-3">
                    <div class="bg-orange-100 p-3 rounded-lg">
                        <i class="fas fa-book text-orange-600 text-xl"></i>
                    </div>
                    <h3 class="text-2xl font-bold text-gray-800">12 Career Resources</h3>
                </div>
                <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${resources.map((resource, index) => `
                    <div class="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-${resource.color}-50 transition cursor-pointer group">
                        <div class="bg-${resource.color}-100 p-3 rounded-lg group-hover:bg-${resource.color}-200 transition">
                            <i class="fas fa-${resource.icon} text-${resource.color}-600"></i>
                        </div>
                        <div class="flex-1">
                            <h4 class="font-semibold text-gray-800 text-sm">${resource.title}</h4>
                            <span class="text-xs text-gray-500 bg-white px-2 py-1 rounded">${resource.type}</span>
                        </div>
                        <button class="text-gray-400 hover:text-${resource.color}-600 transition" onclick="alert('Opening: ${resource.title}')">
                            <i class="fas fa-external-link-alt"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
            
            <div class="mt-6 flex justify-center">
                <button onclick="this.closest('.fixed').remove()" class="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                    Close
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}
