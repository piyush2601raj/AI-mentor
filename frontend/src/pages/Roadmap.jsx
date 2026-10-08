import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import api from "../services/api";
import { generateAIRoadmap } from "../services/roadmapService";
import "./Roadmap.css";

function Roadmap() {

    const navigate = useNavigate();

    // =====================================================
    // STATES
    // =====================================================

    const [roadmap, setRoadmap] = useState(null);

    const [modules, setModules] = useState([]);

    const [progress, setProgress] = useState(null);

    const [loading, setLoading] = useState(true);

    // UI-only state for the AI generation animation.
    // It does not change roadmap generation or backend functionality.
    const [loadingStage, setLoadingStage] = useState(0);

    const [error, setError] = useState("");

    const [selectedModule, setSelectedModule] = useState(null);


    // =====================================================
    // CURRENT STUDENT ROADMAP (BACKEND SOURCE OF TRUTH)
    // =====================================================
    // LocalStorage is treated only as a cache. The logged-in
    // student's roadmap and module progress are resolved from
    // the authenticated backend so one user's completion cannot
    // appear for another user who selects the same skill.
    const loadLatestStudentRoadmap = async (focusSkill = null) => {

        try {

            const response =
                await api.get(
                    "/api/roadmaps/student"
                );

            const roadmapList =
                Array.isArray(response?.data)
                    ? response.data
                    : response?.data
                        ? [response.data]
                        : [];

            if (roadmapList.length === 0) {
                return null;
            }

            const normalizedFocusSkill =
                typeof focusSkill === "string"
                    ? focusSkill.trim().toLowerCase()
                    : "";

            const roadmapMatchesSkill = (item) => {

                if (!normalizedFocusSkill) {
                    return true;
                }

                const candidates = [
                    item?.skillName,
                    item?.focusSkill,
                    item?.skill,
                    item?.selectedSkill,
                    item?.careerGoal,
                    item?.title
                ]
                    .filter(Boolean)
                    .map(value =>
                        String(value)
                            .trim()
                            .toLowerCase()
                    );

                if (candidates.length === 0) {
                    return true;
                }

                return candidates.some(value =>
                    value === normalizedFocusSkill ||
                    value.includes(normalizedFocusSkill) ||
                    normalizedFocusSkill.includes(value)
                );
            };

            const matchingRoadmaps =
                roadmapList.filter(
                    roadmapItem =>
                        roadmapMatchesSkill(roadmapItem)
                );

            const anyRoadmapHasSkillMetadata =
                roadmapList.some(item =>
                    Boolean(
                        item?.skillName ||
                        item?.focusSkill ||
                        item?.skill ||
                        item?.selectedSkill ||
                        item?.careerGoal ||
                        item?.title
                    )
                );

            const usableRoadmaps =
                matchingRoadmaps.length > 0
                    ? matchingRoadmaps
                    : anyRoadmapHasSkillMetadata
                        ? []
                        : roadmapList;

            const sortedRoadmaps =
                [...usableRoadmaps].sort(
                    (a, b) =>
                        Number(a?.id || 0) -
                        Number(b?.id || 0)
                );

            return (
                sortedRoadmaps[
                    sortedRoadmaps.length - 1
                ] || null
            );

        } catch (studentRoadmapError) {

            console.warn(
                "CURRENT STUDENT ROADMAP COULD NOT BE LOADED:",
                studentRoadmapError
            );

            return null;
        }
    };


    const loadBackendRoadmapState = async (roadmapData) => {

        if (!roadmapData?.id) {
            return {
                modules: [],
                progress: null
            };
        }

        let latestModules = [];
        let latestProgress = null;

        try {

            const moduleResponse =
                await api.get(
                    `/api/roadmaps/${roadmapData.id}/modules`
                );

            latestModules =
                Array.isArray(moduleResponse?.data)
                    ? moduleResponse.data
                    : [];

        } catch (moduleError) {

            console.warn(
                "Backend modules could not be loaded:",
                moduleError
            );

            latestModules =
                Array.isArray(roadmapData?.modules)
                    ? roadmapData.modules
                    : [];
        }

        try {

            const progressResponse =
                await api.get(
                    `/api/roadmaps/${roadmapData.id}/progress`
                );

            latestProgress =
                progressResponse?.data || null;

        } catch (progressError) {

            console.warn(
                "Backend roadmap progress could not be loaded:",
                progressError
            );

            latestProgress = null;
        }

        return {
            modules: latestModules,
            progress: latestProgress
        };
    };


    // =====================================================
    // LOAD ROADMAP WHEN PAGE OPENS
    // =====================================================

    useEffect(() => {

        loadRoadmap();

        // eslint-disable-next-line react-hooks/exhaustive-deps

    }, []);



    // =====================================================
    // AI LOADING STAGE ANIMATION
    // =====================================================
    // This only drives the visual loading experience while the
    // existing Gemini/backend request is running.
    useEffect(() => {
        if (!loading) {
            setLoadingStage(3);
            return undefined;
        }

        setLoadingStage(0);

        const stageTimer = window.setInterval(() => {
            setLoadingStage(previous =>
                previous >= 2
                    ? 2
                    : previous + 1
            );
        }, 1800);

        return () => {
            window.clearInterval(stageTimer);
        };
    }, [loading]);

    // =====================================================
    // GET SELECTED SKILL
    // =====================================================

    const getSelectedFocusSkill = () => {

        const savedSkills =
            localStorage.getItem("aiRoadmapSkills");

        console.log(
            "Saved AI Roadmap Skills:",
            savedSkills
        );

        if (!savedSkills) {
            return null;
        }

        let selectedSkills;

        try {

            selectedSkills =
                JSON.parse(savedSkills);

        } catch (parseError) {

            console.error(
                "Invalid aiRoadmapSkills:",
                parseError
            );

            localStorage.removeItem(
                "aiRoadmapSkills"
            );

            return null;
        }


        if (
            !Array.isArray(selectedSkills) ||
            selectedSkills.length === 0
        ) {

            return null;
        }


        // =================================================
        // FIRST SELECTED SKILL
        // =================================================

        const firstSkill =
            selectedSkills[0];


        let focusSkill =
            firstSkill?.skillName ||
            firstSkill?.skill?.name ||
            firstSkill?.name ||
            firstSkill?.skill ||
            firstSkill?.title ||
            firstSkill?.label ||
            firstSkill?.value;


        // =================================================
        // HANDLE OBJECT
        // =================================================

        if (
            typeof focusSkill === "object" &&
            focusSkill !== null
        ) {

            focusSkill =
                focusSkill.name ||
                focusSkill.skillName ||
                focusSkill.skill ||
                focusSkill.title ||
                focusSkill.label ||
                focusSkill.value;
        }


        // =================================================
        // NORMALIZE
        // =================================================

        if (
            typeof focusSkill === "string"
        ) {

            focusSkill =
                focusSkill.trim();
        }


        if (
            !focusSkill ||
            typeof focusSkill !== "string"
        ) {

            return null;
        }


        return focusSkill.trim();
    };


    // =====================================================
    // LOAD ROADMAP
    // =====================================================

    const loadRoadmap = async () => {

        try {

            setLoading(true);

            setError("");

            setRoadmap(null);

            setModules([]);

            setProgress(null);


            console.log(
                "===================================="
            );

            console.log(
                "LOADING PERSONALIZED AI ROADMAP"
            );

            console.log(
                "===================================="
            );


            // =================================================
            // STEP 1
            // GET SELECTED SKILL
            // =================================================

            const focusSkill =
                getSelectedFocusSkill();


            console.log(
                "FINAL SELECTED FOCUS SKILL:",
                focusSkill
            );


            if (!focusSkill) {

                setError(
                    "No selected skill found. Please go back to Skill Assessment and select a skill."
                );

                return;
            }


            // =================================================
            // STEP 1.5
            // BACKEND-FIRST ROADMAP RESOLUTION
            // =================================================
            // Prefer the roadmap belonging to the authenticated
            // student. This prevents stale LocalStorage data from
            // leaking a previous user's roadmap/progress.
            const backendStudentRoadmap =
                await loadLatestStudentRoadmap(
                    focusSkill
                );

            if (backendStudentRoadmap?.id) {

                console.log(
                    "===================================="
                );

                console.log(
                    "USING CURRENT STUDENT ROADMAP FROM BACKEND"
                );

                console.log(
                    "ROADMAP ID:",
                    backendStudentRoadmap.id
                );

                console.log(
                    "FOCUS SKILL:",
                    focusSkill
                );

                console.log(
                    "===================================="
                );

                setRoadmap(
                    backendStudentRoadmap
                );

                try {

                    localStorage.setItem(
                        "generatedRoadmap",
                        JSON.stringify(
                            backendStudentRoadmap
                        )
                    );

                    localStorage.setItem(
                        "generatedRoadmapSkill",
                        focusSkill
                    );

                    localStorage.setItem(
                        "generatedRoadmapId",
                        String(
                            backendStudentRoadmap.id
                        )
                    );

                } catch (storageError) {

                    console.warn(
                        "Roadmap cache could not be synchronized:",
                        storageError
                    );
                }

                const backendState =
                    await loadBackendRoadmapState(
                        backendStudentRoadmap
                    );

                setModules(
                    backendState.modules
                );

                setProgress(
                    backendState.progress
                );

                return;
            }


            // =================================================
            // STEP 2
            // CHECK SAVED GENERATED ROADMAP (FALLBACK CACHE)
            // =================================================

            const savedGeneratedRoadmap =
                localStorage.getItem(
                    "generatedRoadmap"
                );

            const savedGeneratedSkill =
                localStorage.getItem(
                    "generatedRoadmapSkill"
                );


            console.log(
                "Saved Generated Skill:",
                savedGeneratedSkill
            );


            // =================================================
            // STEP 3
            // USE SAVED ROADMAP ONLY IF SAME SKILL
            // =================================================

            if (
                savedGeneratedRoadmap &&
                savedGeneratedSkill &&
                savedGeneratedSkill
                    .trim()
                    .toLowerCase() ===
                focusSkill
                    .trim()
                    .toLowerCase()
            ) {

                try {

                    const existingRoadmap =
                        JSON.parse(
                            savedGeneratedRoadmap
                        );


                    if (
                        existingRoadmap &&
                        existingRoadmap.id
                    ) {

                        console.log(
                            "===================================="
                        );

                        console.log(
                            "USING EXISTING ROADMAP"
                        );

                        console.log(
                            "ROADMAP ID:",
                            existingRoadmap.id
                        );

                        console.log(
                            "ROADMAP SKILL:",
                            savedGeneratedSkill
                        );

                        console.log(
                            "SELECTED SKILL:",
                            focusSkill
                        );

                        console.log(
                            "===================================="
                        );


                        setRoadmap(
                            existingRoadmap
                        );


                        // =================================================
                        // GET MODULES FROM BACKEND
                        // =================================================

                        try {

                            const moduleResponse =
                                await api.get(
                                    `/api/roadmaps/${existingRoadmap.id}/modules`
                                );


                            const backendModules =
                                Array.isArray(
                                    moduleResponse.data
                                )
                                    ? moduleResponse.data
                                    : [];


                            console.log(
                                "Backend Modules:",
                                backendModules
                            );


                            setModules(
                                backendModules
                            );

                        } catch (moduleError) {

                            console.warn(
                                "Backend modules could not be loaded:",
                                moduleError
                            );


                            // fallback to roadmap response

                            const fallbackModules =
                                Array.isArray(
                                    existingRoadmap.modules
                                )
                                    ? existingRoadmap.modules
                                    : [];


                            setModules(
                                fallbackModules
                            );
                        }


                        // =================================================
                        // LOAD PROGRESS
                        // =================================================

                        try {

                            const progressResponse =
                                await api.get(
                                    `/api/roadmaps/${existingRoadmap.id}/progress`
                                );


                            console.log(
                                "Roadmap Progress:",
                                progressResponse.data
                            );


                            setProgress(
                                progressResponse.data
                            );

                        } catch (progressError) {

                            console.warn(
                                "Progress could not be loaded:",
                                progressError
                            );

                            setProgress(null);
                        }


                        return;
                    }

                } catch (parseError) {

                    console.warn(
                        "Saved generated roadmap is invalid."
                    );


                    localStorage.removeItem(
                        "generatedRoadmap"
                    );

                    localStorage.removeItem(
                        "generatedRoadmapSkill"
                    );
                }
            }


            // =================================================
            // STEP 4
            // SELECTED SKILL CHANGED
            // =================================================

            if (
                savedGeneratedSkill &&
                savedGeneratedSkill
                    .trim()
                    .toLowerCase() !==
                focusSkill
                    .trim()
                    .toLowerCase()
            ) {

                console.log(
                    "===================================="
                );

                console.log(
                    "SELECTED SKILL CHANGED"
                );

                console.log(
                    "OLD SKILL:",
                    savedGeneratedSkill
                );

                console.log(
                    "NEW SKILL:",
                    focusSkill
                );

                console.log(
                    "OLD ROADMAP WILL NOT BE USED"
                );

                console.log(
                    "===================================="
                );


                localStorage.removeItem(
                    "generatedRoadmap"
                );

                localStorage.removeItem(
                    "generatedRoadmapSkill"
                );
            }


            // =================================================
            // STEP 5
            // GENERATE NEW GEMINI ROADMAP
            // =================================================

            console.log(
                "===================================="
            );

            console.log(
                "GENERATING GEMINI AI ROADMAP"
            );

            console.log(
                "FOCUS SKILL:",
                focusSkill
            );

            console.log(
                "===================================="
            );


            const generatedRoadmap =
                await generateAIRoadmap(
                    focusSkill
                );


            console.log(
                "===================================="
            );

            console.log(
                "GEMINI ROADMAP RESPONSE"
            );

            console.log(
                generatedRoadmap
            );

            console.log(
                "===================================="
            );


            // =================================================
            // STEP 6
            // VALIDATE
            // =================================================

            if (
                !generatedRoadmap ||
                !generatedRoadmap.id
            ) {

                throw new Error(
                    "Backend returned an invalid roadmap."
                );
            }


            // =================================================
            // STEP 7
            // SET ROADMAP
            // =================================================

            setRoadmap(
                generatedRoadmap
            );


            // =================================================
            // STEP 8
            // GET MODULES FROM BACKEND
            // =================================================

            try {

                const moduleResponse =
                    await api.get(
                        `/api/roadmaps/${generatedRoadmap.id}/modules`
                    );


                const backendModules =
                    Array.isArray(
                        moduleResponse.data
                    )
                        ? moduleResponse.data
                        : [];


                console.log(
                    "Generated Roadmap Modules:",
                    backendModules
                );


                setModules(
                    backendModules
                );

            } catch (moduleError) {

                console.warn(
                    "Could not load modules from backend:",
                    moduleError
                );


                // fallback

                const fallbackModules =
                    Array.isArray(
                        generatedRoadmap.modules
                    )
                        ? generatedRoadmap.modules
                        : [];


                setModules(
                    fallbackModules
                );
            }


            // =================================================
            // STEP 9
            // SAVE ROADMAP
            // =================================================

            localStorage.setItem(
                "generatedRoadmap",
                JSON.stringify(
                    generatedRoadmap
                )
            );


            // =================================================
            // STEP 10
            // SAVE SKILL
            // =================================================

            localStorage.setItem(
                "generatedRoadmapSkill",
                focusSkill
            );


            // =================================================
            // STEP 11
            // SAVE ROADMAP ID
            // =================================================

            localStorage.setItem(
                "generatedRoadmapId",
                String(
                    generatedRoadmap.id
                )
            );


            // =================================================
            // STEP 12
            // LOAD PROGRESS
            // =================================================

            try {

                const progressResponse =
                    await api.get(
                        `/api/roadmaps/${generatedRoadmap.id}/progress`
                    );


                console.log(
                    "Roadmap Progress:",
                    progressResponse.data
                );


                setProgress(
                    progressResponse.data
                );

            } catch (progressError) {

                console.warn(
                    "Progress could not be loaded:",
                    progressError
                );

                setProgress(null);
            }


        } catch (err) {

            console.error(
                "===================================="
            );

            console.error(
                "PERSONALIZED ROADMAP ERROR"
            );

            console.error(
                "===================================="
            );

            console.error(
                err
            );

            console.error(
                "Status:",
                err.response?.status
            );

            console.error(
                "Backend Response:",
                err.response?.data
            );


            // =================================================
            // ERROR HANDLING
            // =================================================

            if (
                err.response?.status === 401
            ) {

                setError(
                    "Your login session has expired. Please login again."
                );

            } else if (
                err.response?.status === 403
            ) {

                setError(
                    "You are not authorized. Please login again."
                );

            } else if (
                err.response?.status === 404
            ) {

                setError(
                    "AI roadmap generation endpoint was not found. Please restart the Spring Boot backend."
                );

            } else if (
                err.response?.status === 429
            ) {

                setError(
                    "Gemini AI request limit has been reached. Please try again later or switch to another AI provider."
                );

            } else if (
                err.response?.status === 500
            ) {

                setError(
                    err.response?.data?.message ||
                    err.response?.data ||
                    "Gemini AI roadmap generation failed on the server."
                );

            } else {

                setError(
                    err.response?.data?.message ||
                    err.response?.data ||
                    err.message ||
                    "Unable to generate your personalized AI roadmap."
                );
            }

        } finally {

            setLoading(false);
        }
    };


    // =====================================================
    // REFRESH MODULES + PROGRESS
    // =====================================================

    const refreshRoadmapProgress = async () => {

        if (!roadmap?.id) {
            return;
        }

        try {

            const [moduleResponse, progressResponse] =
                await Promise.all([
                    api.get(`/api/roadmaps/${roadmap.id}/modules`),
                    api.get(`/api/roadmaps/${roadmap.id}/progress`)
                ]);


            const latestModules =
                Array.isArray(moduleResponse.data)
                    ? moduleResponse.data
                    : [];


            setModules(
                latestModules
            );

            setProgress(
                progressResponse.data
            );


            // Keep the browser cache aligned with the authoritative
            // backend state. This does not alter the existing UI.
            try {

                const refreshedRoadmap = {
                    ...(roadmap || {}),
                    modules: latestModules
                };

                localStorage.setItem(
                    "generatedRoadmap",
                    JSON.stringify(
                        refreshedRoadmap
                    )
                );

                if (refreshedRoadmap?.id) {

                    localStorage.setItem(
                        "generatedRoadmapId",
                        String(
                            refreshedRoadmap.id
                        )
                    );
                }

            } catch (cacheRefreshError) {

                console.warn(
                    "Roadmap cache refresh skipped:",
                    cacheRefreshError
                );
            }


            console.log(
                "Roadmap progress refreshed:",
                progressResponse.data
            );

        } catch (refreshError) {

            console.warn(
                "Could not refresh roadmap progress:",
                refreshError
            );
        }
    };


    // =====================================================
    // REFRESH WHEN USER RETURNS TO ROADMAP
    // =====================================================

    useEffect(() => {

        if (!roadmap?.id) {
            return undefined;
        }

        const handleWindowFocus = () => {

            refreshRoadmapProgress();
        };


        const handleVisibilityChange = () => {

            if (
                document.visibilityState ===
                "visible"
            ) {

                refreshRoadmapProgress();
            }
        };


        // Module.jsx emits this event after the backend confirms
        // lesson/module completion. Refresh immediately so the next
        // module becomes unlocked without a manual page reload.
        const handleLearningProgressUpdated = (
            event
        ) => {

            const eventRoadmapId =
                event?.detail?.roadmapId;

            if (
                eventRoadmapId &&
                Number(eventRoadmapId) !==
                    Number(roadmap.id)
            ) {
                return;
            }

            refreshRoadmapProgress();
        };


        // Also synchronize another browser tab/window logged in as
        // the same student.
        const handleStorage = (event) => {

            if (
                event.key ===
                    "learningProgressUpdatedAt" ||
                event.key ===
                    "generatedRoadmapId"
            ) {

                refreshRoadmapProgress();
            }
        };


        window.addEventListener(
            "focus",
            handleWindowFocus
        );


        document.addEventListener(
            "visibilitychange",
            handleVisibilityChange
        );


        window.addEventListener(
            "learning-progress-updated",
            handleLearningProgressUpdated
        );


        window.addEventListener(
            "storage",
            handleStorage
        );


        // Backend polling is a safety net for progress changes made
        // from another screen or another browser tab.
        const progressPollingTimer =
            window.setInterval(
                () => {

                    if (
                        document.visibilityState ===
                        "visible"
                    ) {

                        refreshRoadmapProgress();
                    }
                },
                5000
            );


        return () => {

            window.removeEventListener(
                "focus",
                handleWindowFocus
            );


            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );


            window.removeEventListener(
                "learning-progress-updated",
                handleLearningProgressUpdated
            );


            window.removeEventListener(
                "storage",
                handleStorage
            );


            window.clearInterval(
                progressPollingTimer
            );
        };


        // eslint-disable-next-line react-hooks/exhaustive-deps

    }, [roadmap?.id]);


    // =====================================================
    // OPEN MODULE
    // =====================================================

    const handleOpenModule = (module) => {

        if (!module) {

            console.warn(
                "No module selected."
            );

            return;
        }


        if (!module.id) {

            console.warn(
                "Selected module does not have a valid ID:",
                module
            );

            return;
        }


        // =================================================
        // SEQUENTIAL MODULE LOCK
        // Only completed modules and the first incomplete
        // module can be opened. Future modules stay locked.
        // =================================================

        const moduleIndex =
            sortedModules.findIndex(
                item =>
                    item.id === module.id
            );


        const moduleCompleted =
            String(
                module.status || ""
            ).toUpperCase() ===
            "COMPLETED";


        const moduleUnlocked =
            moduleCompleted ||
            moduleIndex <=
            currentModuleIndex;


        if (!moduleUnlocked) {

            console.log(
                "Module is locked until all previous modules are completed.",
                module
            );

            return;
        }


        console.log(
            "===================================="
        );

        console.log(
            "SELECTED MODULE"
        );

        console.log(
            "Module ID:",
            module.id
        );

        console.log(
            "Module Title:",
            module.title
        );

        console.log(
            "Week:",
            module.weekNumber
        );

        console.log(
            "===================================="
        );


        setSelectedModule(
            module
        );
    };


    // =====================================================
    // CLOSE MODULE
    // =====================================================

    const handleCloseModule = () => {

        setSelectedModule(
            null
        );
    };


    // =====================================================
    // START MODULE
    // =====================================================

    const handleStartModule = () => {

        if (!selectedModule) {

            console.warn(
                "Cannot start module. No module selected."
            );

            return;
        }


        if (!selectedModule.id) {

            console.error(
                "Selected module ID is missing:",
                selectedModule
            );

            return;
        }


        const moduleId =
            selectedModule.id;


        console.log(
            "===================================="
        );

        console.log(
            "STARTING LEARNING MODULE"
        );

        console.log(
            "Module ID:",
            moduleId
        );

        console.log(
            "Module Title:",
            selectedModule.title
        );

        console.log(
            "===================================="
        );


        setSelectedModule(
            null
        );


        // =================================================
        // IMPORTANT
        //
        // App.jsx route is:
        //
        // /module/:moduleId
        //
        // NOT:
        //
        // /roadmap/modules/:moduleId
        // =================================================

        navigate(
            `/module/${moduleId}`
        );
    };


    // =====================================================
    // GO TO ASSESSMENT
    // =====================================================

    const handleBackToAssessment = () => {

        navigate(
            "/assessments"
        );
    };


    // =====================================================
    // FULL-SCREEN RESPONSIVE AI LOADING SCREEN
    // =====================================================
    // Render through a portal directly into document.body. This
    // prevents parent Layout/Dashboard transforms, overflow rules,
    // or stacking contexts from clipping the loading screen.
    if (loading) {

        const loadingStages = [
            {
                title: "Analyzing your skills",
                text: "Understanding your selected skill and learning level."
            },
            {
                title: "Structuring your modules",
                text: "Organizing concepts into a clear step-by-step journey."
            },
            {
                title: "Creating your learning journey",
                text: "Gemini AI is preparing your personalized roadmap."
            }
        ];

        const activeStage =
            loadingStages[
                Math.min(
                    loadingStage,
                    loadingStages.length - 1
                )
            ];

        return createPortal(
            <div
                role="status"
                aria-live="polite"
                aria-busy="true"
                style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 2147483647,
                    width: "100vw",
                    height: "100dvh",
                    minHeight: "100vh",
                    maxHeight: "100vh",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "clamp(12px, 2.5vw, 36px)",
                    boxSizing: "border-box",
                    background: `
                        radial-gradient(circle at 12% 12%, rgba(59,130,246,.18), transparent 30%),
                        radial-gradient(circle at 88% 18%, rgba(99,102,241,.16), transparent 30%),
                        radial-gradient(circle at 50% 105%, rgba(14,165,233,.13), transparent 38%),
                        linear-gradient(135deg, #f8fbff 0%, #eef4ff 48%, #f8faff 100%)
                    `,
                    isolation: "isolate"
                }}
            >
                {/* =================================================
                    DECORATIVE BACKGROUND
                ================================================= */}
                <div
                    aria-hidden="true"
                    style={{
                        position: "absolute",
                        inset: 0,
                        pointerEvents: "none",
                        overflow: "hidden"
                    }}
                >
                    <div
                        style={{
                            position: "absolute",
                            width: "clamp(180px, 28vw, 430px)",
                            height: "clamp(180px, 28vw, 430px)",
                            borderRadius: "50%",
                            top: "-12%",
                            left: "-7%",
                            background: "rgba(37,99,235,.09)",
                            filter: "blur(8px)"
                        }}
                    />

                    <div
                        style={{
                            position: "absolute",
                            width: "clamp(220px, 32vw, 500px)",
                            height: "clamp(220px, 32vw, 500px)",
                            borderRadius: "50%",
                            bottom: "-18%",
                            right: "-8%",
                            background: "rgba(99,102,241,.09)",
                            filter: "blur(10px)"
                        }}
                    />

                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            opacity: 0.34,
                            backgroundImage: `
                                linear-gradient(rgba(37,99,235,.035) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(37,99,235,.035) 1px, transparent 1px)
                            `,
                            backgroundSize: "42px 42px"
                        }}
                    />

                    <div
                        aria-hidden="true"
                        style={{
                            position: "absolute",
                            width: "clamp(90px, 10vw, 150px)",
                            height: "clamp(90px, 10vw, 150px)",
                            borderRadius: "50%",
                            top: "16%",
                            right: "10%",
                            border: "1px solid rgba(37,99,235,.10)",
                            animation: "roadmapFloatOne 7s ease-in-out infinite"
                        }}
                    />

                    <div
                        aria-hidden="true"
                        style={{
                            position: "absolute",
                            width: "clamp(70px, 8vw, 120px)",
                            height: "clamp(70px, 8vw, 120px)",
                            borderRadius: "30%",
                            bottom: "15%",
                            left: "9%",
                            border: "1px solid rgba(79,70,229,.10)",
                            transform: "rotate(20deg)",
                            animation: "roadmapFloatTwo 8s ease-in-out infinite"
                        }}
                    />
                </div>


                {/* =================================================
                    MAIN LOADING PANEL
                ================================================= */}
                <div
                    className="roadmap-loading-panel"
                    style={{
                        position: "relative",
                        zIndex: 2,
                        width: "min(940px, 100%)",
                        maxHeight: "calc(100dvh - clamp(24px, 5vw, 72px))",
                        overflowY: "auto",
                        overflowX: "hidden",
                        borderRadius: "clamp(22px, 3vw, 36px)",
                        border: "1px solid rgba(255,255,255,.92)",
                        background: "rgba(255,255,255,.82)",
                        backdropFilter: "blur(26px)",
                        WebkitBackdropFilter: "blur(26px)",
                        boxShadow: "0 34px 100px rgba(30,64,175,.18), 0 12px 34px rgba(15,23,42,.08)",
                        padding: "clamp(22px, 4vw, 58px)",
                        boxSizing: "border-box"
                    }}
                >
                    {/* Top brand row */}
                    <div
                        className="d-flex align-items-center justify-content-between gap-3"
                        style={{
                            marginBottom: "clamp(22px, 4vw, 42px)"
                        }}
                    >
                        <div className="d-flex align-items-center gap-2">
                            <div
                                style={{
                                    width: "clamp(40px, 5vw, 54px)",
                                    height: "clamp(40px, 5vw, 54px)",
                                    borderRadius: 16,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#fff",
                                    fontSize: "clamp(18px, 2vw, 24px)",
                                    fontWeight: 800,
                                    background: "linear-gradient(135deg,#2563eb,#4f46e5)",
                                    boxShadow: "0 10px 25px rgba(37,99,235,.25)",
                                    flexShrink: 0
                                }}
                            >
                                ✦
                            </div>

                            <div>
                                <div
                                    style={{
                                        fontWeight: 800,
                                        color: "#172554",
                                        fontSize: "clamp(14px, 1.6vw, 17px)",
                                        lineHeight: 1.2
                                    }}
                                >
                                    AI Mentor
                                </div>

                                <div
                                    style={{
                                        color: "#64748b",
                                        fontSize: "clamp(10px, 1.2vw, 13px)",
                                        marginTop: 3
                                    }}
                                >
                                    Personalized Learning
                                </div>
                            </div>
                        </div>

                        <span
                            className="badge rounded-pill flex-shrink-0"
                            style={{
                                color: "#1d4ed8",
                                background: "#dbeafe",
                                border: "1px solid #bfdbfe",
                                padding: "9px 14px",
                                fontWeight: 700,
                                letterSpacing: ".04em",
                                fontSize: "clamp(9px, 1.1vw, 12px)"
                            }}
                        >
                            AI GENERATING
                        </span>
                    </div>


                    {/* Main content */}
                    <div className="text-center">

                        {/* Animated AI orb */}
                        <div
                            style={{
                                width: "clamp(82px, 10vw, 116px)",
                                height: "clamp(82px, 10vw, 116px)",
                                margin: "0 auto clamp(20px, 3vw, 32px)",
                                borderRadius: "50%",
                                padding: 7,
                                background: "linear-gradient(135deg, rgba(37,99,235,.10), rgba(79,70,229,.16))",
                                boxSizing: "border-box",
                                animation: "roadmapOrbPulse 2.2s ease-in-out infinite"
                            }}
                        >
                            <div
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    background: "#fff",
                                    boxShadow: "inset 0 0 0 1px rgba(37,99,235,.08), 0 12px 35px rgba(37,99,235,.10)"
                                }}
                            >
                                <div
                                    style={{
                                        width: "clamp(38px, 5vw, 56px)",
                                        height: "clamp(38px, 5vw, 56px)",
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "#fff",
                                        fontSize: "clamp(19px, 2.5vw, 28px)",
                                        fontWeight: 800,
                                        background: "linear-gradient(135deg,#2563eb,#4f46e5)",
                                        boxShadow: "0 10px 25px rgba(37,99,235,.25)"
                                    }}
                                >
                                    ✦
                                </div>
                            </div>
                        </div>


                        <span
                            className="badge rounded-pill"
                            style={{
                                color: "#2563eb",
                                background: "linear-gradient(90deg,#e0edff,#eef2ff)",
                                border: "1px solid #cfe0ff",
                                padding: "10px 17px",
                                fontWeight: 800,
                                fontSize: "clamp(10px, 1.2vw, 13px)",
                                letterSpacing: ".06em"
                            }}
                        >
                            ✦ AI ROADMAP
                        </span>


                        <h1
                            style={{
                                margin: "clamp(16px, 2.5vw, 26px) auto 12px",
                                maxWidth: 760,
                                color: "#0f172a",
                                fontSize: "clamp(30px, 5vw, 58px)",
                                lineHeight: 1.08,
                                fontWeight: 800,
                                letterSpacing: "-0.035em"
                            }}
                        >
                            Building your learning path
                        </h1>


                        <p
                            style={{
                                maxWidth: 650,
                                margin: "0 auto",
                                color: "#64748b",
                                fontSize: "clamp(14px, 1.8vw, 19px)",
                                lineHeight: 1.65
                            }}
                        >
                            Gemini AI is creating a personalized roadmap based on your selected skill.
                        </p>


                        {/* Current processing stage */}
                        <div
                            style={{
                                margin: "clamp(22px, 3.5vw, 36px) auto 0",
                                maxWidth: 650,
                                padding: "clamp(15px, 2vw, 20px)",
                                borderRadius: 18,
                                background: "rgba(239,246,255,.72)",
                                border: "1px solid rgba(191,219,254,.72)",
                                textAlign: "left"
                            }}
                        >
                            <div className="d-flex align-items-center gap-3">
                                <div
                                    style={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: "50%",
                                        background: "#2563eb",
                                        boxShadow: "0 0 0 6px rgba(37,99,235,.10)",
                                        flexShrink: 0,
                                        animation: "roadmapDotPulse 1.4s ease-in-out infinite"
                                    }}
                                />

                                <div style={{ minWidth: 0 }}>
                                    <div
                                        style={{
                                            color: "#1e3a8a",
                                            fontSize: "clamp(12px, 1.35vw, 14px)",
                                            fontWeight: 800
                                        }}
                                    >
                                        {activeStage.title}
                                    </div>

                                    <div
                                        style={{
                                            color: "#64748b",
                                            fontSize: "clamp(10px, 1.2vw, 12px)",
                                            marginTop: 3,
                                            lineHeight: 1.45
                                        }}
                                    >
                                        {activeStage.text}
                                    </div>
                                </div>
                            </div>
                        </div>


                        {/* Animated progress */}
                        <div
                            style={{
                                maxWidth: 650,
                                margin: "clamp(22px, 3vw, 32px) auto 0",
                                textAlign: "left"
                            }}
                        >
                            <div
                                className="d-flex align-items-center justify-content-between gap-3 mb-2"
                            >
                                <span
                                    style={{
                                        color: "#334155",
                                        fontSize: "clamp(11px, 1.3vw, 13px)",
                                        fontWeight: 700
                                    }}
                                >
                                    Creating your learning journey
                                </span>

                                <span
                                    style={{
                                        color: "#2563eb",
                                        fontSize: "clamp(11px, 1.3vw, 13px)",
                                        fontWeight: 800,
                                        whiteSpace: "nowrap"
                                    }}
                                >
                                    AI working…
                                </span>
                            </div>

                            <div
                                style={{
                                    height: 9,
                                    overflow: "hidden",
                                    borderRadius: 999,
                                    background: "#e8eef9",
                                    boxShadow: "inset 0 1px 3px rgba(15,23,42,.06)"
                                }}
                            >
                                <div
                                    style={{
                                        width: "42%",
                                        height: "100%",
                                        borderRadius: 999,
                                        background: "linear-gradient(90deg,#2563eb,#4f46e5,#0ea5e9)",
                                        backgroundSize: "200% 100%",
                                        animation: "roadmapLoadingProgress 2s ease-in-out infinite, roadmapGradientMove 2.5s linear infinite"
                                    }}
                                />
                            </div>
                        </div>


                        {/* Processing stages */}
                        <div
                            className="d-flex flex-wrap justify-content-center align-items-center"
                            style={{
                                gap: "10px 18px",
                                marginTop: "clamp(22px, 3vw, 32px)",
                                color: "#64748b",
                                fontSize: "clamp(10px, 1.25vw, 14px)"
                            }}
                        >
                            <span
                                style={{
                                    color:
                                        loadingStage >= 0
                                            ? "#2563eb"
                                            : "#94a3b8",
                                    fontWeight:
                                        loadingStage >= 0
                                            ? 700
                                            : 500
                                }}
                            >
                                {loadingStage > 0 ? "✓" : "◌"} Analyzing skills
                            </span>

                            <span
                                className="d-none d-sm-inline"
                                style={{ color: "#cbd5e1" }}
                            >
                                •
                            </span>

                            <span
                                style={{
                                    color:
                                        loadingStage >= 1
                                            ? "#2563eb"
                                            : "#94a3b8",
                                    fontWeight:
                                        loadingStage >= 1
                                            ? 700
                                            : 500
                                }}
                            >
                                {loadingStage > 1 ? "✓" : "✦"} Structuring modules
                            </span>

                            <span
                                className="d-none d-sm-inline"
                                style={{ color: "#cbd5e1" }}
                            >
                                •
                            </span>

                            <span
                                style={{
                                    color:
                                        loadingStage >= 2
                                            ? "#2563eb"
                                            : "#94a3b8",
                                    fontWeight:
                                        loadingStage >= 2
                                            ? 700
                                            : 500
                                }}
                            >
                                ◌ Creating your journey
                            </span>
                        </div>

                    </div>


                    {/* Bottom reassurance */}
                    <div
                        className="text-center"
                        style={{
                            marginTop: "clamp(26px, 4vw, 42px)",
                            paddingTop: "clamp(16px, 2.5vw, 22px)",
                            borderTop: "1px solid rgba(148,163,184,.18)"
                        }}
                    >
                        <small
                            style={{
                                color: "#94a3b8",
                                fontSize: "clamp(10px, 1.15vw, 12px)"
                            }}
                        >
                            Please keep this page open while your personalized roadmap is being prepared.
                        </small>
                    </div>

                </div>


                {/* =================================================
                    LOADING ANIMATION STYLES
                ================================================= */}
                <style>{`
                    @keyframes roadmapLoadingProgress {
                        0%   { transform: translateX(-115%); width: 38%; }
                        50%  { transform: translateX(105%); width: 62%; }
                        100% { transform: translateX(260%); width: 38%; }
                    }

                    @keyframes roadmapGradientMove {
                        0%   { background-position: 0% 50%; }
                        100% { background-position: 200% 50%; }
                    }

                    @keyframes roadmapOrbPulse {
                        0%, 100% {
                            transform: scale(1);
                            box-shadow: 0 0 0 rgba(37,99,235,0);
                        }
                        50% {
                            transform: scale(1.035);
                            box-shadow: 0 18px 45px rgba(37,99,235,.12);
                        }
                    }

                    @keyframes roadmapDotPulse {
                        0%, 100% {
                            transform: scale(.9);
                            opacity: .65;
                        }
                        50% {
                            transform: scale(1.15);
                            opacity: 1;
                        }
                    }

                    @keyframes roadmapFloatOne {
                        0%, 100% { transform: translate3d(0,0,0); }
                        50% { transform: translate3d(-12px,16px,0); }
                    }

                    @keyframes roadmapFloatTwo {
                        0%, 100% { transform: translate3d(0,0,0) rotate(20deg); }
                        50% { transform: translate3d(12px,-14px,0) rotate(28deg); }
                    }

                    @media (max-width: 575.98px) {
                        .roadmap-loading-panel {
                            border-radius: 22px !important;
                            max-height: calc(100dvh - 20px) !important;
                        }
                    }

                    @media (max-height: 650px) and (min-width: 576px) {
                        .roadmap-loading-panel {
                            max-height: calc(100dvh - 18px) !important;
                            padding-top: 22px !important;
                            padding-bottom: 22px !important;
                        }
                    }

                    @media (prefers-reduced-motion: reduce) {
                        *, *::before, *::after {
                            animation-duration: .01ms !important;
                            animation-iteration-count: 1 !important;
                        }
                    }
                `}</style>

            </div>,
            document.body
        );
    }

    // =====================================================
    // ERROR
    // =====================================================

    if (error) {

        return (

            <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center p-4">

                <div
                    className="card border-0 shadow-lg rounded-4 text-center"
                    style={{
                        maxWidth: "600px",
                        width: "100%"
                    }}
                >

                    <div className="card-body p-5">

                        <div
                            className="rounded-circle bg-danger-subtle text-danger d-flex align-items-center justify-content-center mx-auto mb-4"
                            style={{
                                width: "70px",
                                height: "70px",
                                fontSize: "30px"
                            }}
                        >

                            !

                        </div>


                        <span className="badge bg-danger-subtle text-danger px-3 py-2 rounded-pill">

                            ROADMAP ERROR

                        </span>


                        <h2 className="fw-bold mt-3">

                            Roadmap could not be loaded

                        </h2>


                        <p className="text-secondary">

                            {error}

                        </p>


                        <div className="d-flex gap-2 justify-content-center flex-wrap mt-4">

                            <button
                                className="btn btn-primary px-4 rounded-3"
                                onClick={loadRoadmap}
                            >

                                Try Again

                            </button>


                            <button
                                className="btn btn-outline-secondary px-4 rounded-3"
                                onClick={
                                    handleBackToAssessment
                                }
                            >

                                Back to Assessment

                            </button>

                        </div>

                    </div>

                </div>

            </div>
        );
    }


    // =====================================================
    // NO ROADMAP
    // =====================================================

    if (!roadmap) {

        return (

            <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center p-4">

                <div
                    className="card border-0 shadow-lg rounded-4 text-center"
                    style={{
                        maxWidth: "600px",
                        width: "100%"
                    }}
                >

                    <div className="card-body p-5">

                        <div className="display-4 mb-3">

                            ✦

                        </div>


                        <h2 className="fw-bold">

                            No AI Roadmap Found

                        </h2>


                        <p className="text-secondary">

                            Complete your skill assessment first.
                            Gemini AI will then create a personalized
                            learning roadmap for you.

                        </p>


                        <button
                            className="btn btn-primary px-4 py-2 rounded-3 mt-3"
                            onClick={
                                handleBackToAssessment
                            }
                        >

                            Go to Skill Assessment →

                        </button>

                    </div>

                </div>

            </div>
        );
    }


    // =====================================================
    // PROGRESS CALCULATION
    // =====================================================

    const totalModules =
        progress?.totalModules ??
        modules.length;


    const completedModules =
        progress?.completedModules ??
        modules.filter(
            module =>
                module.status ===
                "COMPLETED"
        ).length;


    const remainingModules =
        progress?.remainingModules ??
        Math.max(
            totalModules -
            completedModules,
            0
        );


    const progressPercentage =
        progress?.progressPercentage ??
        (
            totalModules > 0
                ? Math.round(
                    (
                        completedModules /
                        totalModules
                    ) * 100
                )
                : 0
        );


    const safeProgress =
        Math.min(
            Math.max(
                Number(progressPercentage) || 0,
                0
            ),
            100
        );


    // =====================================================
    // SORT MODULES
    // =====================================================

    const sortedModules =
        [...modules].sort(
            (a, b) =>
                (
                    a.weekNumber || 0
                ) -
                (
                    b.weekNumber || 0
                )
        );


    // =====================================================
    // SEQUENTIAL MODULE UNLOCKING
    // =====================================================

    const firstIncompleteModuleIndex =
        sortedModules.findIndex(
            module =>
                String(
                    module.status || ""
                ).toUpperCase() !==
                "COMPLETED"
        );


    const currentModuleIndex =
        firstIncompleteModuleIndex === -1
            ? sortedModules.length - 1
            : firstIncompleteModuleIndex;


    // =====================================================
    // MAIN UI
    // =====================================================

    return (

        <div className="professional-roadmap">

            <div className="roadmap-topbar">

                <div className="roadmap-topbar-title">

                    <h2>
                        AI Learning Roadmap
                    </h2>

                    <span>
                        Your personalized path to skill mastery
                    </span>

                </div>


                <div className="roadmap-topbar-right">

                    <div className="roadmap-search">

                        <i className="bi bi-search"></i>

                        <input
                            type="text"
                            placeholder="Search topics, skills..."
                            aria-label="Search topics and skills"
                        />

                    </div>


                    <button
                        type="button"
                        className="roadmap-notification"
                        aria-label="Notifications"
                    >
                        <i className="bi bi-bell"></i>
                    </button>


                    <div className="roadmap-user">

                        <div className="roadmap-user-avatar" aria-label="Student profile">
                            <i className="bi bi-person-fill" aria-hidden="true"></i>
                        </div>

                        <div>
                            <strong>
                                Student Workspace
                            </strong>

                            <span>
                                Personalized Learning
                            </span>
                        </div>

                    </div>

                </div>

            </div>


            <div className="professional-roadmap-content">


                {/* =================================================
                    HERO
                ================================================= */}

                <section className="roadmap-hero">

                    <div className="roadmap-hero-content">

                        <div className="roadmap-hero-badge">

                            <i className="bi bi-bullseye"></i>

                            YOUR PERSONALIZED ROADMAP

                        </div>


                        <h1>
                            {roadmap.title}
                        </h1>


                        <p>
                            {roadmap.description ||
                                "A step-by-step learning path tailored to your current skill level and career goal. Track your progress and build real-world skills with AI guidance."
                            }
                        </p>

                    </div>


                    <div className="roadmap-hero-side">

                        <div className="hero-info-item">

                            <div className="hero-info-icon">
                                <i className="bi bi-code-slash"></i>
                            </div>

                            <div>

                                <span>
                                    Focus Skill
                                </span>

                                <strong>
                                    {
                                        roadmap.skillName ||
                                        roadmap.focusSkill ||
                                        roadmap.skill ||
                                        "Personalized Learning"
                                    }
                                </strong>

                            </div>

                        </div>


                        <div className="hero-info-item">

                            <div className="hero-info-icon">
                                <i className="bi bi-clock"></i>
                            </div>

                            <div>

                                <span>
                                    Estimated Time
                                </span>

                                <strong>
                                    {roadmap.durationWeeks || 0} Weeks
                                </strong>

                            </div>

                        </div>


                        <button
                            type="button"
                            className="hero-update-btn"
                            onClick={handleBackToAssessment}
                        >

                            <i className="bi bi-bullseye"></i>

                            Update Goal

                        </button>

                    </div>

                </section>


                {/* =================================================
                    TWO COLUMN AREA
                ================================================= */}

                <div className="roadmap-main-grid">


                    {/* LEFT */}

                    <div className="roadmap-left-column">


                        <section className="roadmap-panel">

                            <div className="panel-heading">

                                <div className="panel-heading-left">

                                    <div className="panel-icon purple">
                                        <i className="bi bi-bar-chart-fill"></i>
                                    </div>

                                    <h2>
                                        Roadmap Overview
                                    </h2>

                                </div>


                                <span className="on-track-badge">
                                    {safeProgress >= 50
                                        ? "You're on track! 🎯"
                                        : "Keep going! 🎯"}
                                </span>

                            </div>


                            <div className="overview-progress">

                                <div className="overview-progress-top">

                                    <strong>
                                        Overall Progress
                                    </strong>

                                    <span>
                                        {safeProgress}%
                                    </span>

                                </div>


                                <div className="overview-progress-track">

                                    <div
                                        className="overview-progress-fill"
                                        style={{
                                            width: `${safeProgress}%`
                                        }}
                                    />

                                </div>

                            </div>


                            <div className="overview-stats">

                                <div className="overview-stat">

                                    <div className="overview-stat-icon blue">
                                        <i className="bi bi-book"></i>
                                    </div>

                                    <strong>
                                        {totalModules}
                                    </strong>

                                    <span>
                                        Modules in Roadmap
                                    </span>

                                </div>


                                <div className="overview-stat">

                                    <div className="overview-stat-icon green">
                                        <i className="bi bi-check-circle-fill"></i>
                                    </div>

                                    <strong>
                                        {completedModules}
                                    </strong>

                                    <span>
                                        Completed Modules
                                    </span>

                                </div>


                                <div className="overview-stat">

                                    <div className="overview-stat-icon orange">
                                        <i className="bi bi-play-fill"></i>
                                    </div>

                                    <strong>
                                        {
                                            currentModuleIndex >= 0 &&
                                            completedModules < totalModules
                                                ? 1
                                                : 0
                                        }
                                    </strong>

                                    <span>
                                        Active Module
                                    </span>

                                </div>


                                <div className="overview-stat">

                                    <div className="overview-stat-icon purple">
                                        <i className="bi bi-pie-chart-fill"></i>
                                    </div>

                                    <strong>
                                        {remainingModules}
                                    </strong>

                                    <span>
                                        Modules Remaining
                                    </span>

                                </div>

                            </div>

                        </section>


                        <section className="roadmap-panel current-level-panel">

                            <div className="panel-heading">

                                <div className="panel-heading-left">

                                    <div className="panel-icon blue">
                                        <i className="bi bi-person-fill"></i>
                                    </div>

                                    <h2>
                                        Your Current Level
                                    </h2>

                                </div>


                                <span className="level-badge">
                                    {roadmap.level ||
                                        roadmap.learningLevel ||
                                        "Intermediate"}
                                </span>

                            </div>


                            <p className="current-level-description">
                                Your current skill level is aligned with this learning path.
                                This roadmap is designed to strengthen your fundamentals,
                                build practical skills, and guide you through hands-on,
                                real-world projects.
                            </p>

                        </section>


                        <section className="roadmap-panel">

                            <div className="panel-heading">

                                <div className="panel-heading-left">

                                    <div className="panel-icon yellow">
                                        <i className="bi bi-lightning-fill"></i>
                                    </div>

                                    <h2>
                                        Recommended Next Steps
                                    </h2>

                                </div>

                            </div>


                            <div className="next-step-list">

                                <div className="next-step">

                                    <span className="step-number blue-bg">
                                        1
                                    </span>

                                    <span>
                                        Complete your current module
                                    </span>

                                    <i className="bi bi-chevron-right"></i>

                                </div>


                                <div className="next-step">

                                    <span className="step-number green-bg">
                                        2
                                    </span>

                                    <span>
                                        Practice DSA questions
                                    </span>

                                    <i className="bi bi-chevron-right"></i>

                                </div>


                                <div className="next-step">

                                    <span className="step-number yellow-bg">
                                        3
                                    </span>

                                    <span>
                                        Build a mini project
                                    </span>

                                    <i className="bi bi-chevron-right"></i>

                                </div>


                                <div className="next-step">

                                    <span className="step-number purple-bg">
                                        4
                                    </span>

                                    <span>
                                        Take an assessment
                                    </span>

                                    <i className="bi bi-chevron-right"></i>

                                </div>

                            </div>

                        </section>

                    </div>


                    {/* RIGHT — LEARNING PATH */}

                    <section className="roadmap-panel learning-path-panel">

                        <div className="panel-heading">

                            <div className="panel-heading-left">

                                <div className="panel-icon blue">
                                    <i className="bi bi-map-fill"></i>
                                </div>

                                <h2>
                                    Learning Path
                                </h2>

                            </div>

                        </div>


                        <div className="learning-timeline">

                            {sortedModules.map(
                                (module, index) => {

                                    const isCompleted =
                                        String(
                                            module.status || ""
                                        ).toUpperCase() ===
                                        "COMPLETED";


                                    const isCurrent =
                                        !isCompleted &&
                                        index === currentModuleIndex;


                                    const isUnlocked =
                                        isCompleted ||
                                        index <= currentModuleIndex;


                                    const isLocked =
                                        !isUnlocked;


                                    return (

                                        <div
                                            className={`learning-step ${
                                                isCompleted
                                                    ? "completed"
                                                    : isCurrent
                                                        ? "current"
                                                        : "locked"
                                            }`}
                                            key={
                                                module.id ||
                                                index
                                            }
                                        >

                                            <div className="learning-step-side">

                                                <div className="learning-step-dot">

                                                    {isCompleted
                                                        ? "✓"
                                                        : isLocked
                                                            ? "🔒"
                                                            : (
                                                                module.weekNumber ||
                                                                index + 1
                                                            )}

                                                </div>

                                            </div>


                                            <div className="learning-module-card">

                                                <div className="learning-module-icon">

                                                    {isCompleted ? (
                                                        <i className="bi bi-check-circle-fill"></i>
                                                    ) : isCurrent ? (
                                                        <i className="bi bi-gear-fill"></i>
                                                    ) : (
                                                        <i className="bi bi-book"></i>
                                                    )}

                                                </div>


                                                <div className="learning-module-content">

                                                    <div className="learning-module-title-row">

                                                        <div>

                                                            <h3>
                                                                {index + 1}.{" "}
                                                                {module.title}
                                                            </h3>

                                                            <p>
                                                                {module.description}
                                                            </p>

                                                        </div>


                                                        <span
                                                            className={`learning-status ${
                                                                isCompleted
                                                                    ? "status-completed"
                                                                    : isCurrent
                                                                        ? "status-current"
                                                                        : "status-upcoming"
                                                            }`}
                                                        >

                                                            {isCompleted
                                                                ? "Completed"
                                                                : isCurrent
                                                                    ? "In Progress"
                                                                    : "Upcoming"}

                                                        </span>

                                                    </div>


                                                    <div className="learning-module-action">

                                                        <span>
                                                            Week{" "}
                                                            {module.weekNumber ||
                                                                index + 1}
                                                        </span>


                                                        <button
                                                            type="button"
                                                            disabled={isLocked}
                                                            onClick={() =>
                                                                handleOpenModule(
                                                                    module
                                                                )
                                                            }
                                                        >

                                                            {isLocked
                                                                ? "Locked"
                                                                : isCompleted
                                                                    ? "Review"
                                                                    : "Open"}

                                                            <i className="bi bi-chevron-right"></i>

                                                        </button>

                                                    </div>

                                                </div>

                                            </div>

                                        </div>

                                    );

                                }
                            )}

                        </div>

                    </section>

                </div>

            </div>


            {/* =====================================================
                MODULE MODAL
            ===================================================== */}

            {selectedModule && (

                <div
                    className="modal d-block"
                    tabIndex="-1"
                    style={{
                        background:
                            "rgba(15,23,42,0.65)"
                    }}
                    onClick={
                        handleCloseModule
                    }
                >

                    <div
                        className="modal-dialog modal-dialog-centered modal-lg"
                        onClick={
                            (e) =>
                                e.stopPropagation()
                        }
                    >

                        <div className="modal-content border-0 rounded-4 shadow-lg">

                            <div className="modal-header border-0 p-4">

                                <div>

                                    <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-2">

                                        WEEK{" "}

                                        {
                                            selectedModule.weekNumber
                                        }

                                    </span>


                                    <h3 className="fw-bold mt-3 mb-0">

                                        {
                                            selectedModule.title
                                        }

                                    </h3>

                                </div>


                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={
                                        handleCloseModule
                                    }
                                />

                            </div>


                            <div className="modal-body px-4 pb-4">

                                <p className="text-secondary fs-6">

                                    {
                                        selectedModule.description
                                    }

                                </p>


                                <div className="alert alert-primary border-0 rounded-4 d-flex gap-3 align-items-start">

                                    <span className="fs-4">

                                        ✦

                                    </span>


                                    <div>

                                        <strong>

                                            Gemini AI Recommendation

                                        </strong>


                                        <p className="mb-0 mt-1">

                                            This module was personalized
                                            for your selected learning path.

                                        </p>

                                    </div>

                                </div>

                            </div>


                            <div className="modal-footer border-0 p-4">

                                <button
                                    type="button"
                                    className="btn btn-outline-secondary rounded-3 px-4"
                                    onClick={
                                        handleCloseModule
                                    }
                                >

                                    Close

                                </button>


                                <button
                                    type="button"
                                    className="btn btn-primary rounded-3 px-4"
                                    onClick={
                                        handleStartModule
                                    }
                                >

                                    Start Module →

                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}
        </div>

    );
}

export default Roadmap;
