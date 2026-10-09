import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Progress.css";

function Progress() {
    const navigate = useNavigate();

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    /* =========================================================
       GET CURRENT STUDENT ID
       ========================================================= */

    const getStudentId = useCallback(() => {
        const possibleUsers = [
            localStorage.getItem("ai_mentor_user"),
            localStorage.getItem("user"),
            localStorage.getItem("student"),
            localStorage.getItem("currentUser"),
        ];

        for (const item of possibleUsers) {
            if (!item) continue;

            try {
                const parsed = JSON.parse(item);

                const id =
                    parsed?.id ??
                    parsed?.studentId ??
                    parsed?.userId ??
                    parsed?.user?.id ??
                    parsed?.user?.studentId;

                if (id !== undefined && id !== null && id !== "") {
                    return id;
                }
            } catch {
                console.warn("Invalid user object in localStorage");
            }
        }

        const directId =
            localStorage.getItem("studentId") ||
            localStorage.getItem("userId");

        return directId || null;
    }, []);

    /* =========================================================
       NUMBER HELPER
       ========================================================= */

    const safeNumber = (value, fallback = 0) => {
        const number = Number(value);

        if (!Number.isFinite(number)) {
            return fallback;
        }

        return number;
    };

    /* =========================================================
       LOAD PROGRESS
       ========================================================= */

    const loadProgress = useCallback(
        async (isRefresh = false) => {
            try {
                if (isRefresh) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                setError("");

                const token =
                    localStorage.getItem("token") ||
                    localStorage.getItem("jwtToken") ||
                    localStorage.getItem("accessToken");

                if (!token) {
                    setError(
                        "Your login session has expired. Please login again."
                    );
                    return;
                }

                const studentId = getStudentId();
                console.log("Progress Student ID:", studentId);
                console.log("Token exists:", Boolean(token));

                // Fetch dashboard analytics separately. Roadmap progress below
                // is calculated from the actual module list, like Dashboard.jsx.
                let dashboardData = {};

                if (studentId) {
                    try {
                        const dashboardResponse = await api.get(
                            `/api/dashboard/student/${studentId}`
                        );
                        dashboardData = dashboardResponse?.data || {};
                    } catch (dashboardError) {
                        console.warn(
                            "Dashboard analytics endpoint unavailable; using roadmap data.",
                            dashboardError
                        );
                    }
                }

                // Same roadmap endpoint used by Dashboard.jsx.
                const roadmapResponse = await api.get(
                    "/api/roadmaps/student"
                );
                const roadmapData = roadmapResponse?.data;

                let roadmaps = [];
                if (Array.isArray(roadmapData)) {
                    roadmaps = roadmapData;
                } else if (Array.isArray(roadmapData?.roadmaps)) {
                    roadmaps = roadmapData.roadmaps;
                } else if (roadmapData?.id) {
                    roadmaps = [roadmapData];
                }

                // Prefer the roadmap saved by the roadmap/dashboard flow.
                const savedRoadmapId = localStorage.getItem(
                    "generatedRoadmapId"
                );

                let activeRoadmap = savedRoadmapId
                    ? roadmaps.find(
                          (roadmap) =>
                              String(roadmap?.id) === String(savedRoadmapId)
                      )
                    : null;

                if (!activeRoadmap && roadmaps.length > 0) {
                    activeRoadmap = roadmaps[roadmaps.length - 1];
                }

                if (!activeRoadmap?.id) {
                    console.warn("No active roadmap found for this student.");
                    setDashboard({
                        ...dashboardData,
                        overallProgress: 0,
                        modulesCompleted: 0,
                        completedModules: 0,
                        totalModules: 0,
                        remainingModules: 0,
                    });
                    return;
                }

                const roadmapId = activeRoadmap.id;
                localStorage.setItem(
                    "generatedRoadmapId",
                    String(roadmapId)
                );

                // Load the actual modules for the selected roadmap.
                const modulesResponse = await api.get(
                    `/api/roadmaps/${roadmapId}/modules`
                );
                const moduleData = modulesResponse?.data;

                let modules = [];
                if (Array.isArray(moduleData)) {
                    modules = moduleData;
                } else if (Array.isArray(moduleData?.modules)) {
                    modules = moduleData.modules;
                }

                const isCompleted = (module) => {
                    const status = String(
                        module?.status ?? module?.completionStatus ?? ""
                    ).trim().toUpperCase();

                    if (["COMPLETED", "DONE"].includes(status)) {
                        return true;
                    }

                    const moduleProgress = Number(
                        module?.progress ??
                            module?.progressPercentage ??
                            module?.completionPercentage ??
                            module?.completion ??
                            0
                    );

                    return Number.isFinite(moduleProgress) && moduleProgress >= 100;
                };

                const totalModules = modules.length;
                const completedModules = modules.filter(isCompleted).length;
                const remainingModules = Math.max(
                    totalModules - completedModules,
                    0
                );
                const overallProgress =
                    totalModules > 0
                        ? Number(
                              ((completedModules / totalModules) * 100).toFixed(2)
                          )
                        : 0;

                // Keep all supported field aliases aligned for the existing UI.
                const finalDashboard = {
                    ...dashboardData,
                    overallProgress,
                    overallCompletion: overallProgress,
                    progress: overallProgress,
                    completionPercentage: overallProgress,
                    modulesCompleted: completedModules,
                    completedModules,
                    completedRoadmapModules: completedModules,
                    totalModules,
                    totalRoadmapModules: totalModules,
                    roadmapModules: totalModules,
                    remainingModules,
                };

                console.log("PROGRESS PAGE SYNC COMPLETE:", {
                    roadmapId,
                    totalModules,
                    completedModules,
                    remainingModules,
                    overallProgress,
                    modules,
                });

                setDashboard(finalDashboard);
            } catch (err) {
                console.error("Progress loading error:", err);

                if (err?.response?.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("jwtToken");
                    localStorage.removeItem("accessToken");
                    setError(
                        "Your login session has expired. Please login again."
                    );
                } else {
                    setError(
                        "Unable to load your progress. Please try again. Check the browser console for the failed API request."
                    );
                }
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [getStudentId]
    );

    /* =========================================================
       INITIAL LOAD
       ========================================================= */

    useEffect(() => {
        loadProgress();
    }, [loadProgress]);

    /* =========================================================
       NORMALIZED DATA
       Supports multiple backend field names
       ========================================================= */

    const metrics = useMemo(() => {
        const overall = safeNumber(
            dashboard?.overallProgress ??
                dashboard?.overallCompletion ??
                dashboard?.progress ??
                dashboard?.completionPercentage ??
                0
        );

        const modulesCompleted = safeNumber(
            dashboard?.modulesCompleted ??
                dashboard?.completedModules ??
                dashboard?.completedRoadmapModules ??
                0
        );

        const totalModules = safeNumber(
            dashboard?.totalModules ??
                dashboard?.totalRoadmapModules ??
                dashboard?.roadmapModules ??
                0
        );

        const quiz = safeNumber(
            dashboard?.quizPerformance ??
                dashboard?.quizScore ??
                dashboard?.assessmentScore ??
                dashboard?.averageQuizScore ??
                0
        );

        const skills = safeNumber(
            dashboard?.skills ??
                dashboard?.skillsTracked ??
                dashboard?.totalSkills ??
                dashboard?.skillCount ??
                0
        );

        const notes = safeNumber(
            dashboard?.notes ??
                dashboard?.totalNotes ??
                dashboard?.notesCount ??
                0
        );

        const flashcards = safeNumber(
            dashboard?.flashcards ??
                dashboard?.totalFlashcards ??
                dashboard?.flashcardCount ??
                0
        );

        const assessments = safeNumber(
            dashboard?.assessments ??
                dashboard?.totalAssessments ??
                dashboard?.assessmentCount ??
                0
        );

        const completedAssessments = safeNumber(
            dashboard?.completedAssessments ??
                dashboard?.assessmentsCompleted ??
                0
        );

        return {
            overall: Math.min(Math.max(overall, 0), 100),
            modulesCompleted,
            totalModules,
            quiz: Math.min(Math.max(quiz, 0), 100),
            skills,
            notes,
            flashcards,
            assessments,
            completedAssessments,
        };
    }, [dashboard]);

    const progressWidth = metrics.overall;

    /* =========================================================
       DERIVED DATA
       ========================================================= */

    const modulePercentage =
        metrics.totalModules > 0
            ? Math.min(
                  (metrics.modulesCompleted / metrics.totalModules) * 100,
                  100
              )
            : metrics.overall;

    const assessmentPercentage =
        metrics.assessments > 0
            ? Math.min(
                  (metrics.completedAssessments /
                      metrics.assessments) *
                      100,
                  100
              )
            : metrics.quiz;

    const getProgressLabel = () => {
        if (metrics.overall >= 90) return "Excellent progress";
        if (metrics.overall >= 70) return "Strong progress";
        if (metrics.overall >= 40) return "Good momentum";
        if (metrics.overall > 0) return "Getting started";
        return "Ready to begin";
    };

    const getProgressMessage = () => {
        if (metrics.overall >= 90) {
            return "You're almost at the finish line. Keep your learning momentum going.";
        }

        if (metrics.overall >= 70) {
            return "You're making strong progress across your learning roadmap.";
        }

        if (metrics.overall >= 40) {
            return "You're building a solid foundation. Continue completing your roadmap modules.";
        }

        if (metrics.overall > 0) {
            return "You've started your learning journey. Consistency will help you progress faster.";
        }

        return "Complete your first roadmap module to start building your progress history.";
    };

    /* =========================================================
       LOGIN
       ========================================================= */

    const handleLogin = () => {
        navigate("/login", { replace: true });
    };

    /* =========================================================
       LOADING SCREEN
       ========================================================= */

    if (loading) {
        return (
            <div className="progress-page">
                <div className="progress-container">
                    <div className="progress-skeleton-header">
                        <div>
                            <div className="progress-skeleton-line title" />
                            <div className="progress-skeleton-line subtitle" />
                        </div>

                        <div className="progress-skeleton-button" />
                    </div>

                    <div className="progress-skeleton-stats">
                        {[1, 2, 3, 4].map((item) => (
                            <div
                                className="progress-skeleton-card"
                                key={item}
                            >
                                <div className="skeleton-circle" />

                                <div className="skeleton-content">
                                    <div className="skeleton-line small" />
                                    <div className="skeleton-line medium" />
                                    <div className="skeleton-line large" />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="progress-skeleton-main">
                        <div className="progress-skeleton-large" />
                        <div className="progress-skeleton-large" />
                    </div>
                </div>
            </div>
        );
    }

    /* =========================================================
       ERROR
       ========================================================= */

    if (error) {
        return (
            <div className="progress-page">
                <div className="progress-container">
                    <div className="progress-error-card">
                        <div className="progress-error-icon">
                            <i className="bi bi-cloud-slash" />
                        </div>

                        <span className="progress-error-label">
                            LEARNING ANALYTICS
                        </span>

                        <h2>We couldn't load your progress</h2>

                        <p>{error}</p>

                        <div className="progress-error-actions">
                            <button
                                className="progress-btn secondary"
                                onClick={() => loadProgress(true)}
                            >
                                <i className="bi bi-arrow-clockwise" />
                                Try Again
                            </button>

                            <button
                                className="progress-btn primary"
                                onClick={handleLogin}
                            >
                                <i className="bi bi-box-arrow-in-right" />
                                Login Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /* =========================================================
       MAIN UI
       ========================================================= */

    return (
        <div className="progress-page">
            <div className="progress-container">

                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="progress-header">

                    <div className="progress-header-left">

                        <div className="progress-header-icon">
                            <i className="bi bi-bar-chart-line-fill" />
                        </div>

                        <div>
                            <span className="progress-eyebrow">
                                LEARNING ANALYTICS
                            </span>

                            <h1>Your Progress</h1>

                            <p>
                                Track your learning journey,
                                assessment performance and skill growth.
                            </p>
                        </div>

                    </div>

                    <button
                        className="progress-refresh-btn"
                        onClick={() => loadProgress(true)}
                        disabled={refreshing}
                    >
                        <i
                            className={
                                refreshing
                                    ? "bi bi-arrow-repeat progress-spin"
                                    : "bi bi-arrow-clockwise"
                            }
                        />

                        {refreshing ? "Refreshing..." : "Refresh"}
                    </button>

                </header>


                {/* =================================================
                    TOP STAT CARDS
                ================================================= */}

                <section className="progress-stat-grid">

                    {/* Overall */}

                    <div className="progress-stat-card overall">

                        <div className="progress-stat-top">
                            <div className="progress-stat-icon purple">
                                <i className="bi bi-activity" />
                            </div>

                            <span className="stat-trend positive">
                                <i className="bi bi-arrow-up" />
                                Active
                            </span>
                        </div>

                        <div className="progress-stat-value">
                            {metrics.overall}%
                        </div>

                        <span className="progress-stat-label">
                            OVERALL PROGRESS
                        </span>

                        <div className="mini-progress">
                            <span
                                style={{
                                    width: `${progressWidth}%`,
                                }}
                            />
                        </div>

                        <p>{getProgressLabel()}</p>

                    </div>


                    {/* Modules */}

                    <div className="progress-stat-card">

                        <div className="progress-stat-top">
                            <div className="progress-stat-icon blue">
                                <i className="bi bi-journal-check" />
                            </div>

                            <span className="stat-soft">
                                ROADMAP
                            </span>
                        </div>

                        <div className="progress-stat-value">
                            {metrics.modulesCompleted}
                            {metrics.totalModules > 0 && (
                                <small>
                                    /{metrics.totalModules}
                                </small>
                            )}
                        </div>

                        <span className="progress-stat-label">
                            MODULES COMPLETED
                        </span>

                        <div className="mini-progress blue">
                            <span
                                style={{
                                    width: `${modulePercentage}%`,
                                }}
                            />
                        </div>

                        <p>
                            {modulePercentage.toFixed(0)}% of roadmap
                            completed
                        </p>

                    </div>


                    {/* Quiz */}

                    <div className="progress-stat-card">

                        <div className="progress-stat-top">
                            <div className="progress-stat-icon green">
                                <i className="bi bi-patch-check" />
                            </div>

                            <span className="stat-soft">
                                ASSESSMENTS
                            </span>
                        </div>

                        <div className="progress-stat-value">
                            {metrics.quiz}%
                        </div>

                        <span className="progress-stat-label">
                            QUIZ PERFORMANCE
                        </span>

                        <div className="mini-progress green">
                            <span
                                style={{
                                    width: `${metrics.quiz}%`,
                                }}
                            />
                        </div>

                        <p>
                            Based on completed assessments
                        </p>

                    </div>


                    {/* Skills */}

                    <div className="progress-stat-card">

                        <div className="progress-stat-top">
                            <div className="progress-stat-icon orange">
                                <i className="bi bi-lightbulb" />
                            </div>

                            <span className="stat-soft">
                                KNOWLEDGE
                            </span>
                        </div>

                        <div className="progress-stat-value">
                            {metrics.skills}
                        </div>

                        <span className="progress-stat-label">
                            SKILLS TRACKED
                        </span>

                        <div className="skill-dots">
                            <span />
                            <span />
                            <span />
                            <span />
                            <span />
                        </div>

                        <p>
                            Skills in your learning profile
                        </p>

                    </div>

                </section>


                {/* =================================================
                    MAIN ANALYTICS GRID
                ================================================= */}

                <section className="progress-main-grid">

                    {/* =================================================
                        ROADMAP PROGRESS
                    ================================================= */}

                    <div className="progress-panel roadmap-panel">

                        <div className="panel-header">

                            <div>
                                <span className="panel-eyebrow">
                                    ROADMAP
                                </span>

                                <h2>Learning Roadmap</h2>

                                <p>
                                    Your overall learning completion
                                    across the roadmap.
                                </p>
                            </div>

                            <button
                                className="panel-link"
                                onClick={() =>
                                    navigate("/roadmap")
                                }
                            >
                                View Roadmap
                                <i className="bi bi-arrow-up-right" />
                            </button>

                        </div>


                        <div className="roadmap-content">

                            {/* Circular progress */}

                            <div className="progress-ring-wrapper">

                                <svg
                                    className="progress-ring"
                                    viewBox="0 0 180 180"
                                >
                                    <circle
                                        className="progress-ring-track"
                                        cx="90"
                                        cy="90"
                                        r="72"
                                    />

                                    <circle
                                        className="progress-ring-value"
                                        cx="90"
                                        cy="90"
                                        r="72"
                                        style={{
                                            strokeDashoffset:
                                                452.39 -
                                                (452.39 *
                                                    progressWidth) /
                                                    100,
                                        }}
                                    />
                                </svg>

                                <div className="progress-ring-center">

                                    <strong>
                                        {metrics.overall}%
                                    </strong>

                                    <span>
                                        Complete
                                    </span>

                                </div>

                            </div>


                            {/* Roadmap details */}

                            <div className="roadmap-details">

                                <div className="roadmap-status">
                                    <span className="status-dot" />

                                    <span>
                                        {getProgressLabel()}
                                    </span>
                                </div>

                                <h3>
                                    {getProgressMessage()}
                                </h3>

                                <div className="roadmap-metrics">

                                    <div>
                                        <span>Completed</span>

                                        <strong>
                                            {metrics.modulesCompleted}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Remaining</span>

                                        <strong>
                                            {metrics.totalModules >
                                            0
                                                ? Math.max(
                                                      metrics.totalModules -
                                                          metrics.modulesCompleted,
                                                      0
                                                  )
                                                : "—"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Completion</span>

                                        <strong>
                                            {modulePercentage.toFixed(
                                                0
                                            )}
                                            %
                                        </strong>
                                    </div>

                                </div>

                                <div className="roadmap-bar">

                                    <div
                                        style={{
                                            width: `${modulePercentage}%`,
                                        }}
                                    />

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* =================================================
                        LEARNING HEALTH
                    ================================================= */}

                    <div className="progress-panel health-panel">

                        <div className="panel-header">

                            <div>
                                <span className="panel-eyebrow">
                                    SNAPSHOT
                                </span>

                                <h2>Learning Health</h2>

                                <p>
                                    A quick overview of your learning
                                    activity.
                                </p>
                            </div>

                            <div className="health-header-icon">
                                <i className="bi bi-heart-pulse" />
                            </div>

                        </div>


                        <div className="health-list">

                            {/* Roadmap */}

                            <div className="health-row">

                                <div className="health-row-left">

                                    <div className="health-icon purple">
                                        <i className="bi bi-map" />
                                    </div>

                                    <div>
                                        <strong>Roadmap</strong>

                                        <span>
                                            Learning completion
                                        </span>
                                    </div>

                                </div>

                                <strong className="health-value">
                                    {metrics.overall}%
                                </strong>

                            </div>


                            {/* Assessments */}

                            <div className="health-row">

                                <div className="health-row-left">

                                    <div className="health-icon green">
                                        <i className="bi bi-check2-circle" />
                                    </div>

                                    <div>
                                        <strong>Assessments</strong>

                                        <span>
                                            Quiz performance
                                        </span>
                                    </div>

                                </div>

                                <strong className="health-value">
                                    {metrics.quiz}%
                                </strong>

                            </div>


                            {/* Skills */}

                            <div className="health-row">

                                <div className="health-row-left">

                                    <div className="health-icon orange">
                                        <i className="bi bi-stars" />
                                    </div>

                                    <div>
                                        <strong>Skills</strong>

                                        <span>
                                            Skills being tracked
                                        </span>
                                    </div>

                                </div>

                                <strong className="health-value">
                                    {metrics.skills}
                                </strong>

                            </div>


                            {/* Notes */}

                            <div className="health-row">

                                <div className="health-row-left">

                                    <div className="health-icon blue">
                                        <i className="bi bi-journal-text" />
                                    </div>

                                    <div>
                                        <strong>Notes</strong>

                                        <span>
                                            Learning resources
                                        </span>
                                    </div>

                                </div>

                                <strong className="health-value">
                                    {metrics.notes}
                                </strong>

                            </div>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    PERFORMANCE ANALYTICS
                ================================================= */}

                <section className="progress-panel performance-panel">

                    <div className="panel-header">

                        <div>
                            <span className="panel-eyebrow">
                                PERFORMANCE
                            </span>

                            <h2>Learning Performance</h2>

                            <p>
                                Track how consistently you are
                                progressing through your learning
                                activities.
                            </p>
                        </div>

                        <div className="analytics-live">
                            <span />
                            Live Analytics
                        </div>

                    </div>


                    <div className="performance-grid">

                        {/* Quiz */}

                        <div className="performance-item">

                            <div className="performance-item-header">

                                <div className="performance-title">
                                    <div className="performance-icon purple">
                                        <i className="bi bi-bar-chart" />
                                    </div>

                                    <div>
                                        <strong>
                                            Quiz Performance
                                        </strong>

                                        <span>
                                            Assessment accuracy
                                        </span>
                                    </div>
                                </div>

                                <strong className="performance-number">
                                    {metrics.quiz}%
                                </strong>

                            </div>

                            <div className="performance-bar">
                                <span
                                    style={{
                                        width: `${metrics.quiz}%`,
                                    }}
                                />
                            </div>

                        </div>


                        {/* Roadmap */}

                        <div className="performance-item">

                            <div className="performance-item-header">

                                <div className="performance-title">
                                    <div className="performance-icon blue">
                                        <i className="bi bi-signpost-2" />
                                    </div>

                                    <div>
                                        <strong>
                                            Roadmap Completion
                                        </strong>

                                        <span>
                                            Module completion
                                        </span>
                                    </div>
                                </div>

                                <strong className="performance-number">
                                    {modulePercentage.toFixed(0)}%
                                </strong>

                            </div>

                            <div className="performance-bar blue">
                                <span
                                    style={{
                                        width: `${modulePercentage}%`,
                                    }}
                                />
                            </div>

                        </div>


                        {/* Assessments */}

                        <div className="performance-item">

                            <div className="performance-item-header">

                                <div className="performance-title">
                                    <div className="performance-icon green">
                                        <i className="bi bi-clipboard2-check" />
                                    </div>

                                    <div>
                                        <strong>
                                            Assessment Activity
                                        </strong>

                                        <span>
                                            Completed assessments
                                        </span>
                                    </div>
                                </div>

                                <strong className="performance-number">
                                    {assessmentPercentage.toFixed(
                                        0
                                    )}
                                    %
                                </strong>

                            </div>

                            <div className="performance-bar green">
                                <span
                                    style={{
                                        width: `${assessmentPercentage}%`,
                                    }}
                                />
                            </div>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    KNOWLEDGE OVERVIEW
                ================================================= */}

                <section className="progress-knowledge-grid">

                    {/* Knowledge */}

                    <div className="progress-panel knowledge-panel">

                        <div className="panel-header compact">

                            <div>
                                <span className="panel-eyebrow">
                                    KNOWLEDGE BASE
                                </span>

                                <h2>Learning Resources</h2>
                            </div>

                            <button
                                className="panel-link"
                                onClick={() =>
                                    navigate("/notes")
                                }
                            >
                                Open Notes
                                <i className="bi bi-arrow-right" />
                            </button>

                        </div>


                        <div className="knowledge-cards">

                            <div className="knowledge-card">

                                <div className="knowledge-card-icon purple">
                                    <i className="bi bi-journal-text" />
                                </div>

                                <div>
                                    <span>NOTES</span>
                                    <strong>
                                        {metrics.notes}
                                    </strong>
                                </div>

                            </div>


                            <div className="knowledge-card">

                                <div className="knowledge-card-icon blue">
                                    <i className="bi bi-card-text" />
                                </div>

                                <div>
                                    <span>FLASHCARDS</span>
                                    <strong>
                                        {metrics.flashcards}
                                    </strong>
                                </div>

                            </div>


                            <div className="knowledge-card">

                                <div className="knowledge-card-icon orange">
                                    <i className="bi bi-lightbulb" />
                                </div>

                                <div>
                                    <span>SKILLS</span>
                                    <strong>
                                        {metrics.skills}
                                    </strong>
                                </div>

                            </div>

                        </div>

                    </div>


                    {/* Quick actions */}

                    <div className="progress-panel actions-panel">

                        <div className="panel-header compact">

                            <div>
                                <span className="panel-eyebrow">
                                    QUICK ACTIONS
                                </span>

                                <h2>Keep Learning</h2>
                            </div>

                            <i className="bi bi-lightning-charge-fill actions-title-icon" />

                        </div>


                        <div className="quick-actions">

                            <button
                                onClick={() =>
                                    navigate("/roadmap")
                                }
                            >
                                <span className="quick-action-icon purple">
                                    <i className="bi bi-map" />
                                </span>

                                <span>
                                    <strong>
                                        Continue Roadmap
                                    </strong>

                                    <small>
                                        Continue your next module
                                    </small>
                                </span>

                                <i className="bi bi-chevron-right" />
                            </button>


                            <button
                                onClick={() =>
                                    navigate("/assessments")
                                }
                            >
                                <span className="quick-action-icon green">
                                    <i className="bi bi-patch-question" />
                                </span>

                                <span>
                                    <strong>
                                        Take Assessment
                                    </strong>

                                    <small>
                                        Test your knowledge
                                    </small>
                                </span>

                                <i className="bi bi-chevron-right" />
                            </button>


                            <button
                                onClick={() =>
                                    navigate("/flashcards")
                                }
                            >
                                <span className="quick-action-icon orange">
                                    <i className="bi bi-layers" />
                                </span>

                                <span>
                                    <strong>
                                        Review Flashcards
                                    </strong>

                                    <small>
                                        Strengthen your memory
                                    </small>
                                </span>

                                <i className="bi bi-chevron-right" />
                            </button>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    NEXT STEP
                ================================================= */}

                <section className="next-learning-card">

                    <div className="next-learning-left">

                        <div className="next-learning-icon">
                            <i className="bi bi-stars" />
                        </div>

                        <div>
                            <span>
                                RECOMMENDED NEXT STEP
                            </span>

                            <h3>
                                {metrics.overall === 0
                                    ? "Start your learning roadmap"
                                    : metrics.overall < 50
                                    ? "Build your learning momentum"
                                    : "Continue your learning journey"}
                            </h3>

                            <p>
                                {metrics.overall === 0
                                    ? "Begin your first roadmap module and start building your progress."
                                    : "Complete your next roadmap module or practice an assessment to improve your learning progress."}
                            </p>
                        </div>

                    </div>

                    <button
                        onClick={() =>
                            navigate("/roadmap")
                        }
                    >
                        Continue Learning
                        <i className="bi bi-arrow-right" />
                    </button>

                </section>

            </div>
        </div>
    );
}

export default Progress;