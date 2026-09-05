import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    getModule,
    completeModule,
    updateModuleStatus
} from "../services/roadmapService";

import api from "../services/api";

import "./ModuleDetails.css";


function ModuleDetails() {

    const { moduleId } = useParams();
    const navigate = useNavigate();

    const [module, setModule] = useState(null);

    const [learningContent, setLearningContent] = useState([]);

    const [loading, setLoading] = useState(true);
    const [contentLoading, setContentLoading] = useState(true);

    const [error, setError] = useState("");
    const [contentError, setContentError] = useState("");

    const [updating, setUpdating] = useState(false);
    const [completingContentId, setCompletingContentId] = useState(null);


    // =====================================================
    // LOAD MODULE + LEARNING CONTENT
    // =====================================================

    useEffect(() => {

        loadModule();

    }, [moduleId]);


    const loadModule = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await getModule(moduleId);

            console.log("MODULE RESPONSE:", response);

            setModule(response);

            // -------------------------------------------------
            // LOAD ACTUAL LEARNING CONTENT
            // -------------------------------------------------

            await loadLearningContent();

        } catch (err) {

            console.error("MODULE LOAD ERROR:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load this learning module."
            );

        } finally {

            setLoading(false);

        }

    };


    // =====================================================
    // LOAD LEARNING CONTENT
    // =====================================================

    const loadLearningContent = async () => {

        try {

            setContentLoading(true);
            setContentError("");

            const response = await api.get(
                `/learning-content/module/${moduleId}`
            );

            console.log(
                "LEARNING CONTENT RESPONSE:",
                response.data
            );

            setLearningContent(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        } catch (err) {

            console.error(
                "LEARNING CONTENT LOAD ERROR:",
                err
            );

            setContentError(
                err.response?.data?.message ||
                "Unable to load learning content."
            );

            setLearningContent([]);

        } finally {

            setContentLoading(false);

        }

    };


    // =====================================================
    // START MODULE
    // =====================================================

    const handleStartModule = async () => {

        if (!module?.id) return;

        try {

            setUpdating(true);

            const response = await updateModuleStatus(
                module.id,
                "IN_PROGRESS"
            );

            console.log("MODULE STARTED:", response);

            setModule(prev => ({
                ...prev,
                status: "IN_PROGRESS"
            }));

        } catch (err) {

            console.error(
                "START MODULE ERROR:",
                err
            );

            alert(
                err.response?.data?.message ||
                "Unable to start module."
            );

        } finally {

            setUpdating(false);

        }

    };


    // =====================================================
    // COMPLETE LEARNING CONTENT
    // =====================================================

    const handleCompleteContent = async (contentId) => {

        if (!contentId) return;

        try {

            setCompletingContentId(contentId);

            const response = await api.put(
                `/learning-content/${contentId}/complete`
            );

            console.log(
                "CONTENT COMPLETED:",
                response.data
            );

            // -------------------------------------------------
            // UPDATE CONTENT LOCALLY
            // -------------------------------------------------

            setLearningContent(prev =>
                prev.map(item =>
                    item.id === contentId
                        ? {
                            ...item,
                            completed: true
                        }
                        : item
                )
            );

            // -------------------------------------------------
            // CHECK WHETHER ALL CONTENT IS COMPLETED
            // -------------------------------------------------

            const updatedContent = learningContent.map(item =>
                item.id === contentId
                    ? {
                        ...item,
                        completed: true
                    }
                    : item
            );

            const allCompleted =
                updatedContent.length > 0 &&
                updatedContent.every(
                    item =>
                        item.completed === true
                );

            // -------------------------------------------------
            // IF ALL CONTENT COMPLETED
            // MARK MODULE COMPLETED
            // -------------------------------------------------

            if (allCompleted) {

                try {

                    const moduleResponse =
                        await completeModule(module.id);

                    console.log(
                        "MODULE AUTO COMPLETED:",
                        moduleResponse
                    );

                    setModule(prev => ({
                        ...prev,
                        status: "COMPLETED"
                    }));

                } catch (moduleErr) {

                    console.error(
                        "MODULE AUTO COMPLETE ERROR:",
                        moduleErr
                    );

                }

            } else {

                // If module was NOT_STARTED,
                // move it to IN_PROGRESS.

                if (
                    module?.status === "NOT_STARTED"
                ) {

                    setModule(prev => ({
                        ...prev,
                        status: "IN_PROGRESS"
                    }));

                }

            }

        } catch (err) {

            console.error(
                "COMPLETE CONTENT ERROR:",
                err
            );

            alert(
                err.response?.data?.message ||
                "Unable to complete this learning content."
            );

        } finally {

            setCompletingContentId(null);

        }

    };


    // =====================================================
    // COMPLETE MODULE MANUALLY
    // =====================================================

    const handleCompleteModule = async () => {

        if (!module?.id) return;

        try {

            setUpdating(true);

            const response =
                await completeModule(module.id);

            console.log(
                "MODULE COMPLETED:",
                response
            );

            setModule(prev => ({
                ...prev,
                status: "COMPLETED"
            }));

        } catch (err) {

            console.error(
                "COMPLETE MODULE ERROR:",
                err
            );

            alert(
                err.response?.data?.message ||
                "Unable to complete module."
            );

        } finally {

            setUpdating(false);

        }

    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="module-page">

                <div className="module-loading">

                    <div className="spinner-border text-primary mb-4" />

                    <h3>
                        Preparing your learning module
                    </h3>

                    <p>
                        Loading your personalized learning content...
                    </p>

                </div>

            </div>
        );

    }


    // =====================================================
    // ERROR
    // =====================================================

    if (error) {

        return (

            <div className="module-page">

                <div className="module-error">

                    <div className="module-error-icon">
                        !
                    </div>

                    <h2>
                        Module could not be loaded
                    </h2>

                    <p>
                        {error}
                    </p>

                    <div className="d-flex gap-2 justify-content-center">

                        <button
                            className="btn btn-primary"
                            onClick={loadModule}
                        >
                            Try Again
                        </button>

                        <button
                            className="btn btn-outline-secondary"
                            onClick={() =>
                                navigate("/roadmap")
                            }
                        >
                            Back to Roadmap
                        </button>

                    </div>

                </div>

            </div>
        );

    }


    if (!module) return null;


    const isCompleted =
        module.status === "COMPLETED";

    const isInProgress =
        module.status === "IN_PROGRESS";


    // =====================================================
    // LEARNING CONTENT PROGRESS
    // =====================================================

    const completedContentCount =
        learningContent.filter(
            item => item.completed === true
        ).length;

    const totalContentCount =
        learningContent.length;

    const contentProgress =
        totalContentCount > 0
            ? Math.round(
                (completedContentCount /
                    totalContentCount) *
                100
            )
            : 0;


    // =====================================================
    // MAIN UI
    // =====================================================

    return (

        <div className="module-page">

            <div className="container py-4 py-lg-5">

                {/* BACK */}

                <button
                    className="module-back-btn"
                    onClick={() =>
                        navigate("/roadmap")
                    }
                >
                    ← Back to Roadmap
                </button>


                {/* HEADER */}

                <div className="module-hero mt-4">

                    <div className="module-hero-content">

                        <div className="module-badge">
                            WEEK {module.weekNumber || 1}
                        </div>

                        <h1>
                            {module.title}
                        </h1>

                        <p>
                            {module.description}
                        </p>

                        <div className="module-meta">

                            <span>
                                <i className="bi bi-clock" />
                                Learning Module
                            </span>

                            <span>
                                <i className="bi bi-book" />
                                Personalized
                            </span>

                            <span>
                                <i className="bi bi-stars" />
                                AI Powered
                            </span>

                        </div>

                    </div>

                    <div className="module-hero-icon">
                        ✦
                    </div>

                </div>


                {/* STATUS */}

                <div className="module-status-card">

                    <div>

                        <small>
                            MODULE STATUS
                        </small>

                        <h4>

                            {isCompleted
                                ? "Completed"
                                : isInProgress
                                    ? "Currently Learning"
                                    : "Ready to Start"}

                        </h4>

                    </div>

                    <div>

                        {isCompleted ? (

                            <span className="status-completed">
                                ✓ Completed
                            </span>

                        ) : isInProgress ? (

                            <span className="status-progress">
                                ● In Progress
                            </span>

                        ) : (

                            <span className="status-ready">
                                Ready
                            </span>

                        )}

                    </div>

                </div>


                {/* LEARNING CONTENT */}

                <div className="row g-4 mt-1">

                    {/* MAIN */}

                    <div className="col-lg-8">

                        <div className="module-card">

                            <div className="module-card-header">

                                <div className="section-icon">
                                    📚
                                </div>

                                <div>

                                    <h3>
                                        What you'll learn
                                    </h3>

                                    <p>
                                        Follow this module to strengthen
                                        your selected skill.
                                    </p>

                                </div>

                            </div>


                            {/* TOPICS / ACTUAL LEARNING CONTENT */}

                            <div className="learning-topics">

                                {contentLoading ? (

                                    <div className="empty-content">

                                        <div>
                                            📚
                                        </div>

                                        <h5>
                                            Loading learning content
                                        </h5>

                                        <p>
                                            Preparing your personalized
                                            learning materials...
                                        </p>

                                    </div>

                                ) : contentError ? (

                                    <div className="empty-content">

                                        <div>
                                            ⚠️
                                        </div>

                                        <h5>
                                            Learning content unavailable
                                        </h5>

                                        <p>
                                            {contentError}
                                        </p>

                                    </div>

                                ) : learningContent.length > 0 ? (

                                    learningContent.map(
                                        (content, index) => (

                                            <div
                                                className="topic-item"
                                                key={content.id}
                                            >

                                                <div className="topic-number">

                                                    {content.completed
                                                        ? "✓"
                                                        : index + 1}

                                                </div>

                                                <div>

                                                    <h5>
                                                        {content.title ||
                                                            "Learning Content"}
                                                    </h5>

                                                    {content.content && (

                                                        <p>
                                                            {content.content}
                                                        </p>

                                                    )}

                                                    {content.contentType && (

                                                        <small className="text-muted">
                                                            {content.contentType}
                                                        </small>

                                                    )}

                                                    {content.resourceUrl && (

                                                        <div className="mt-2">

                                                            <a
                                                                href={content.resourceUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                Open Resource →
                                                            </a>

                                                        </div>

                                                    )}

                                                    <div className="mt-3">

                                                        {content.completed ? (

                                                            <span className="status-completed">
                                                                ✓ Completed
                                                            </span>

                                                        ) : (

                                                            <button
                                                                className="btn btn-success btn-sm"
                                                                disabled={
                                                                    completingContentId ===
                                                                    content.id
                                                                }
                                                                onClick={() =>
                                                                    handleCompleteContent(
                                                                        content.id
                                                                    )
                                                                }
                                                            >

                                                                {completingContentId ===
                                                                    content.id
                                                                    ? "Completing..."
                                                                    : "✓ Mark as Complete"}

                                                            </button>

                                                        )}

                                                    </div>

                                                </div>

                                            </div>

                                        )
                                    )

                                ) : (

                                    <div className="empty-content">

                                        <div>
                                            📖
                                        </div>

                                        <h5>
                                            Learning content
                                        </h5>

                                        <p>
                                            Start working through this
                                            personalized module.
                                        </p>

                                    </div>

                                )}

                            </div>

                        </div>


                        {/* AI RECOMMENDATION */}

                        <div className="ai-recommendation mt-4">

                            <div className="ai-icon">
                                ✦
                            </div>

                            <div>

                                <h5>
                                    AI Learning Recommendation
                                </h5>

                                <p>
                                    Focus on understanding the concepts
                                    instead of simply memorizing them.
                                    Build a small practical example after
                                    completing each major topic.
                                </p>

                            </div>

                        </div>

                    </div>


                    {/* SIDEBAR */}

                    <div className="col-lg-4">

                        <div className="module-card sticky-lg-top">

                            <h4>
                                Your Progress
                            </h4>


                            <div className="progress-circle">

                                <div>

                                    {isCompleted
                                        ? "100%"
                                        : `${contentProgress}%`}

                                </div>

                            </div>


                            <p className="text-center text-muted">

                                {isCompleted
                                    ? "Module completed"
                                    : totalContentCount > 0
                                        ? `${completedContentCount} of ${totalContentCount} learning items completed`
                                        : "Complete this module to continue"}

                            </p>


                            {/* ACTION */}

                            {!isCompleted && (

                                <div className="d-grid mt-4">

                                    {!isInProgress && (

                                        <button
                                            className="btn btn-primary btn-lg"
                                            disabled={updating}
                                            onClick={handleStartModule}
                                        >

                                            {updating
                                                ? "Starting..."
                                                : "▶ Start Learning"}

                                        </button>

                                    )}


                                    {isInProgress && (

                                        <button
                                            className="btn btn-success btn-lg"
                                            disabled={
                                                updating ||
                                                (
                                                    totalContentCount > 0 &&
                                                    completedContentCount <
                                                    totalContentCount
                                                )
                                            }
                                            onClick={
                                                handleCompleteModule
                                            }
                                        >

                                            {updating
                                                ? "Updating..."
                                                : "✓ Mark as Complete"}

                                        </button>

                                    )}

                                </div>

                            )}


                            {isCompleted && (

                                <div className="completed-box">

                                    <strong>
                                        ✓ Great job!
                                    </strong>

                                    <span>
                                        You completed this module.
                                    </span>

                                </div>

                            )}

                        </div>

                    </div>

                </div>


                {/* BOTTOM */}

                <div className="module-footer mt-5">

                    <button
                        className="btn btn-outline-primary"
                        onClick={() =>
                            navigate("/roadmap")
                        }
                    >
                        ← Back to Learning Journey
                    </button>

                </div>

            </div>

        </div>
    );
}

export default ModuleDetails;