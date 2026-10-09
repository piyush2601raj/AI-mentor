import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

// =====================================================
// PUBLIC PAGES
// =====================================================

import Login from "./pages/Login";
import Register from "./pages/Register";

// =====================================================
// PROFILE / STUDENT
// =====================================================

import ProfileSetup from "./pages/ProfileSetup";
import StudentSkill from "./pages/StudentSkill";

// =====================================================
// DASHBOARD
// =====================================================

import Dashboard from "./pages/Dashboard";

// =====================================================
// LEARNING
// =====================================================

import Roadmap from "./pages/Roadmap";
import Module from "./pages/Module";
import ModuleDetails from "./pages/ModuleDetails";

// =====================================================
// AI
// =====================================================

import AIAnalysis from "./pages/AIAnalysis";
import AIMentor from "./pages/AIMentor";

// =====================================================
// PRACTICE
// =====================================================

import DSAPractice from "./pages/DSAPractice";
import InterviewPrep from "./pages/InterviewPrep";

// =====================================================
// WORKSPACE PAGES
// =====================================================

import Progress from "./pages/Progress";
import Projects from "./pages/Projects";
import Resources from "./pages/Resources";
import CodeEditor from "./pages/CodeEditor";
import Notes from "./pages/Notes";
import Flashcards from "./pages/Flashcards";

// =====================================================
// LAYOUT
// =====================================================

import Layout from "./components/Layout";
import Settings from "./pages/Settings";
import OAuthCallback from "./pages/OAuthCallback";

// =====================================================
// PROTECTED ROUTE
// =====================================================

function ProtectedRoute({ children }) {
    const token = localStorage.getItem("token");

    if (!token) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    return children;
}

// =====================================================
// APP
// =====================================================

function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* =================================================
                    PUBLIC ROUTES
                ================================================= */}

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                {/* =================================================
                    PROFILE
                ================================================= */}

                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <ProfileSetup />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/profile-setup"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <ProfileSetup />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                {/* =================================================
                    DASHBOARD

                    LOCAL DEVELOPMENT:
                    Dashboard is intentionally PUBLIC so it can
                    open without backend/token.
                ================================================= */}

                <Route
                    path="/dashboard"
                    element={
                        <Layout>
                            <Dashboard />
                        </Layout>
                    }
                />

                {/* =================================================
                    STUDENT SKILLS / ASSESSMENTS
                ================================================= */}

                <Route
                    path="/assessments"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <StudentSkill />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/student-skill"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <StudentSkill />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/skills"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <StudentSkill />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                {/* =================================================
                    OAUTH CALLBACK
                ================================================= */}

                <Route
                    path="/oauth2/callback"
                    element={<OAuthCallback />}
                />

                {/* =================================================
                    AI ANALYSIS
                ================================================= */}

                <Route
                    path="/ai-analysis"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <AIAnalysis />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                {/* =================================================
                    AI MENTOR
                ================================================= */}

                <Route
                    path="/ai-mentor"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <AIMentor />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                {/* =================================================
                    DSA PRACTICE
                ================================================= */}

                <Route
                    path="/dsa-practice"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <DSAPractice />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                {/* =================================================
                    INTERVIEW PREPARATION
                ================================================= */}

                <Route
                    path="/interview"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <InterviewPrep />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                {/* =================================================
                    ROADMAP
                ================================================= */}

                <Route
                    path="/roadmap"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <Roadmap />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                {/* =================================================
                    MODULE
                ================================================= */}

                <Route
                    path="/module/:moduleId"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <Module />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                {/* =================================================
                    MODULE DETAILS
                ================================================= */}

                <Route
                    path="/module-details/:moduleId"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <ModuleDetails />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                {/* =================================================
                    PROGRESS
                ================================================= */}

                <Route
                    path="/progress"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <Progress />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                {/* =================================================
                    PROJECTS
                ================================================= */}

                <Route
                    path="/projects"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <Projects />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                {/* =================================================
                    RESOURCES
                ================================================= */}

                <Route
                    path="/resources"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <Resources />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                {/* =================================================
                    CODE EDITOR
                ================================================= */}

                <Route
                    path="/code-editor"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <CodeEditor />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                {/* =================================================
                    NOTES
                ================================================= */}

                <Route
                    path="/notes"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <Notes />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                {/* =================================================
                    FLASHCARDS
                ================================================= */}

                <Route
                    path="/flashcards"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <Flashcards />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                {/* =================================================
                    SETTINGS
                ================================================= */}

                <Route
                    path="/settings"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <Settings />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                {/* =================================================
                    DEFAULT ROUTE
                    localhost:5173 → Dashboard
                ================================================= */}

                <Route
                    path="/"
                    element={
                        <Navigate
                            to="/dashboard"
                            replace
                        />
                    }
                />

                {/* =================================================
                    UNKNOWN ROUTE
                    ================================================= */}

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/dashboard"
                            replace
                        />
                    }
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;