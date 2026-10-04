import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./AiAnalysis.css";

function AIAnalysis() {

    const navigate = useNavigate();

    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =====================================================
    // PREVENT DUPLICATE AI REQUEST
    // =====================================================

    const analysisRequestStarted = useRef(false);

    // =====================================================
    // GENERATE AI ANALYSIS
    // =====================================================

    const generateAnalysis = async () => {

        try {

            setLoading(true);
            setError("");

            console.log("=================================");
            console.log("AI ANALYSIS REQUEST");
            console.log(
                "POST /api/ai-analysis/generate"
            );
            console.log("=================================");

            /*
             * api instance is used here.
             *
             * api.js automatically adds:
             *
             * Authorization: Bearer <JWT>
             *
             * Therefore backend can identify the
             * currently logged-in student and load
             * his/her selected skills from database.
             */

            const response = await api.post(
                "/api/ai-analysis/generate"
            );

            console.log("=================================");
            console.log("AI ANALYSIS SUCCESS");
            console.log("Status:", response.status);
            console.log("Response:", response.data);
            console.log("=================================");

            // -------------------------------------------------
            // CHECK RESPONSE
            // -------------------------------------------------

            if (!response.data) {

                throw new Error(
                    "Backend returned an empty AI analysis response."
                );
            }

            // -------------------------------------------------
            // SAVE ANALYSIS IN STATE
            // -------------------------------------------------

            setAnalysis(response.data);

            // -------------------------------------------------
            // SAVE SAME AI RESPONSE FOR ROADMAP
            // -------------------------------------------------

            localStorage.setItem(
                "aiAnalysis",
                JSON.stringify(response.data)
            );

            console.log(
                "AI analysis saved for Roadmap.jsx"
            );

        } catch (err) {

            console.error("=================================");
            console.error("AI ANALYSIS ERROR");
            console.error("=================================");

            console.error(
                "Error:",
                err
            );

            console.error(
                "Status:",
                err.response?.status
            );

            console.error(
                "Response:",
                err.response?.data
            );

            console.error(
                "Message:",
                err.message
            );

            let errorMessage =
                "Unable to generate AI analysis.";

            // -------------------------------------------------
            // 401
            // -------------------------------------------------

            if (err.response?.status === 401) {

                errorMessage =
                    "Your login session has expired. Please login again.";
            }

            // -------------------------------------------------
            // 403
            // -------------------------------------------------

            else if (err.response?.status === 403) {

                errorMessage =
                    "Access denied. Please login again and try generating the analysis.";
            }

            // -------------------------------------------------
            // 404
            // -------------------------------------------------

            else if (err.response?.status === 404) {

                errorMessage =
                    "AI Analysis endpoint was not found. Please restart the Spring Boot backend.";
            }

            // -------------------------------------------------
            // 429 - GEMINI QUOTA / RATE LIMIT
            // -------------------------------------------------

            else if (err.response?.status === 429) {

                errorMessage =
                    err.response?.data?.message ||
                    "Gemini AI request limit has been reached. Please try again later.";
            }

            // -------------------------------------------------
            // 500
            // -------------------------------------------------

            else if (err.response?.status === 500) {

                errorMessage =
                    err.response?.data?.message ||
                    "AI analysis generation failed on the server.";
            }

            // -------------------------------------------------
            // BACKEND MESSAGE
            // -------------------------------------------------

            else if (err.response?.data?.message) {

                errorMessage =
                    err.response.data.message;
            }

            // -------------------------------------------------
            // BACKEND ERROR
            // -------------------------------------------------

            else if (err.response?.data?.error) {

                errorMessage =
                    err.response.data.error;
            }

            // -------------------------------------------------
            // AXIOS ERROR
            // -------------------------------------------------

            else if (err.message) {

                errorMessage =
                    err.message;
            }

            setError(errorMessage);

        } finally {

            setLoading(false);
        }
    };


    // =====================================================
    // LOAD AI ANALYSIS WHEN PAGE OPENS
    // =====================================================

    useEffect(() => {

        /*
         * React development mode / StrictMode can execute
         * effects more than once.
         *
         * This guard makes sure Gemini receives only
         * ONE request for this page mount.
         */

        if (analysisRequestStarted.current) {

            console.log(
                "AI analysis request already started. Skipping duplicate request."
            );

            return;
        }

        analysisRequestStarted.current = true;

        generateAnalysis();

    }, []);


    // =====================================================
    // CONTINUE TO ROADMAP
    // =====================================================
    //
    // IMPORTANT:
    //
    // DO NOT call generateAIRoadmap() here.
    //
    // AI Analysis already contains the complete roadmap.
    //
    // We simply open Roadmap.jsx and let it read the same
    // AI response from localStorage.
    //
    // =====================================================

    const handleContinueToRoadmap = () => {

        if (!analysis) {

            alert(
                "AI analysis is not available. Please generate the analysis first."
            );

            return;
        }

        // Save latest analysis again before navigation
        localStorage.setItem(
            "aiAnalysis",
            JSON.stringify(analysis)
        );

        console.log(
            "================================="
        );

        console.log(
            "CONTINUING TO ROADMAP"
        );

        console.log(
            "Using SAME AI analysis"
        );

        console.log(
            "Career Goal:",
            analysis.careerGoal
        );

        console.log(
            "Roadmap:",
            analysis.roadmap
        );

        console.log(
            "================================="
        );

        navigate("/roadmap");
    };


    // =====================================================
    // LOADING SCREEN
    // =====================================================

    if (loading) {

        return (

            <div className="ai-analysis-page">

                <div className="ai-loading-card">

                    <div className="ai-loader">
                        ✦
                    </div>

                    <h2>
                        AI Mentor is analyzing your skills
                    </h2>

                    <p>
                        AI is creating a personalized
                        learning roadmap based on your
                        selected skills and proficiency
                        levels...
                    </p>

                    <div className="loading-bar">
                        <div />
                    </div>

                </div>

            </div>
        );
    }


    // =====================================================
    // ERROR SCREEN
    // =====================================================

    if (error) {

        return (

            <div className="ai-analysis-page">

                <div className="ai-error-card">

                    <div className="error-icon">
                        !
                    </div>

                    <h2>
                        Analysis could not be generated
                    </h2>

                    <p>
                        {error}
                    </p>

                    <div className="error-actions">

                        <button
                            onClick={generateAnalysis}
                            className="primary-btn"
                        >
                            Try Again
                        </button>

                        <button
                            onClick={() =>
                                navigate("/assessments")
                            }
                            className="secondary-btn"
                        >
                            Back to Assessment
                        </button>

                    </div>

                </div>

            </div>
        );
    }


    // =====================================================
    // MAIN AI ANALYSIS PAGE
    // =====================================================

    return (

        <div className="ai-analysis-page">

            <div className="analysis-container">


                {/* =====================================================
                    HERO
                ===================================================== */}

                <section className="analysis-hero">

                    <div>

                        <span className="ai-badge">
                            ✦ AI POWERED
                        </span>

                        <h1>
                            Your Personalized
                            <span>
                                {" "}Learning Roadmap
                            </span>
                        </h1>

                        <p>
                            Your AI Mentor analyzed your selected
                            skills and created a personalized
                            learning path based on your current
                            skill levels.
                        </p>

                    </div>

                    <div className="ai-hero-icon">
                        ✦
                    </div>

                </section>


                {/* =====================================================
                    CAREER GOAL
                ===================================================== */}

                <section className="career-card">

                    <div className="section-icon">
                        🎯
                    </div>

                    <div>

                        <span className="section-label">
                            RECOMMENDED CAREER
                        </span>

                        <h2>
                            {analysis?.careerGoal ||
                                "Personalized Career Path"}
                        </h2>

                        <p>
                            {analysis?.summary ||
                                "Your AI Mentor created this learning path based on your selected skills."}
                        </p>

                    </div>

                </section>


                {/* =====================================================
                    STRENGTHS + SKILL GAPS
                ===================================================== */}

                <div className="analysis-grid">


                    {/* =================================================
                        STRENGTHS
                    ================================================= */}

                    <section className="info-card">

                        <div className="card-heading">

                            <span>
                                ✓
                            </span>

                            <h3>
                                Your Strengths
                            </h3>

                        </div>

                        <div className="tag-list">

                            {analysis?.strengths?.length > 0 ? (

                                analysis.strengths.map(
                                    (strength, index) => (

                                        <span
                                            className="strength-tag"
                                            key={index}
                                        >
                                            ✓ {strength}
                                        </span>

                                    )
                                )

                            ) : (

                                <span className="strength-tag">
                                    No strengths identified
                                </span>

                            )}

                        </div>

                    </section>


                    {/* =================================================
                        SKILL GAPS
                    ================================================= */}

                    <section className="info-card">

                        <div className="card-heading">

                            <span>
                                ◈
                            </span>

                            <h3>
                                Skill Gaps
                            </h3>

                        </div>

                        <div className="tag-list">

                            {analysis?.skillGaps?.length > 0 ? (

                                analysis.skillGaps.map(
                                    (gap, index) => (

                                        <span
                                            className="gap-tag"
                                            key={index}
                                        >
                                            + {gap}
                                        </span>

                                    )
                                )

                            ) : (

                                <span className="gap-tag">
                                    No major skill gaps identified
                                </span>

                            )}

                        </div>

                    </section>

                </div>


                {/* =====================================================
                    ROADMAP PREVIEW
                ===================================================== */}

                <section className="roadmap-section">

                    <div className="section-header">

                        <div>

                            <span className="section-label">
                                AI GENERATED
                            </span>

                            <h2>
                                Your Learning Roadmap
                            </h2>

                        </div>

                        <span className="phase-count">

                            {analysis?.roadmap?.length || 0}
                            {" "}Phases

                        </span>

                    </div>


                    <div className="roadmap">

                        {analysis?.roadmap?.length > 0 ? (

                            analysis.roadmap.map(
                                (phase, index) => (

                                    <div
                                        className="roadmap-item"
                                        key={index}
                                    >

                                        {/* ============================
                                            TIMELINE
                                        ============================ */}

                                        <div className="timeline">

                                            <div className="phase-number">
                                                {phase.phase}
                                            </div>

                                            {index !==
                                                analysis.roadmap.length - 1 && (

                                                <div className="timeline-line" />

                                            )}

                                        </div>


                                        {/* ============================
                                            PHASE CARD
                                        ============================ */}

                                        <div className="phase-card">

                                            <div className="phase-top">

                                                <div>

                                                    <span className="phase-label">
                                                        PHASE {phase.phase}
                                                    </span>

                                                    <h3>
                                                        {phase.title}
                                                    </h3>

                                                </div>

                                                <span className="phase-status">
                                                    Recommended
                                                </span>

                                            </div>


                                            <p>
                                                {phase.description}
                                            </p>


                                            {/* ============================
                                                TOPICS
                                            ============================ */}

                                            <div className="topic-list">

                                                {phase.topics?.length > 0 ? (

                                                    phase.topics.map(
                                                        (
                                                            topic,
                                                            topicIndex
                                                        ) => (

                                                            <div
                                                                className="topic"
                                                                key={topicIndex}
                                                            >

                                                                <span>
                                                                    ✓
                                                                </span>

                                                                {topic}

                                                            </div>

                                                        )
                                                    )

                                                ) : (

                                                    <div className="topic">
                                                        No topics available
                                                    </div>

                                                )}

                                            </div>

                                        </div>

                                    </div>

                                )

                            )

                        ) : (

                            <div className="phase-card">

                                <h3>
                                    No roadmap available
                                </h3>

                                <p>
                                    Please select at least one
                                    skill and generate the
                                    analysis again.
                                </p>

                            </div>

                        )}

                    </div>

                </section>


                {/* =====================================================
                    RECOMMENDATIONS
                ===================================================== */}

                <section className="recommendation-card">

                    <div className="recommendation-icon">
                        ✦
                    </div>

                    <div>

                        <span className="section-label">
                            AI MENTOR RECOMMENDATIONS
                        </span>

                        <h2>
                            What you should do next
                        </h2>

                        <div className="recommendation-list">

                            {analysis?.recommendations?.length > 0 ? (

                                analysis.recommendations.map(
                                    (
                                        recommendation,
                                        index
                                    ) => (

                                        <div
                                            className="recommendation"
                                            key={index}
                                        >

                                            <span>
                                                {index + 1}
                                            </span>

                                            <p>
                                                {recommendation}
                                            </p>

                                        </div>

                                    )
                                )

                            ) : (

                                <div className="recommendation">

                                    <span>
                                        ✓
                                    </span>

                                    <p>
                                        Continue learning the
                                        skills included in your
                                        roadmap.
                                    </p>

                                </div>

                            )}

                        </div>

                    </div>

                </section>


                {/* =====================================================
                    ACTION BUTTONS
                ===================================================== */}

                <div className="bottom-actions">

                    <button
                        className="secondary-btn"
                        onClick={() =>
                            navigate("/assessments")
                        }
                    >
                        ← Update My Skills
                    </button>


                    <button
                        className="primary-btn"
                        onClick={
                            handleContinueToRoadmap
                        }
                    >
                        Continue to Roadmap →
                    </button>

                </div>

            </div>

        </div>
    );
}

export default AIAnalysis;