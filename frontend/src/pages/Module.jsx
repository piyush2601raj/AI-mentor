import React, {
useEffect,
useMemo,
useRef,
useState
} from "react";

import {
useNavigate,
useParams
} from "react-router-dom";

import {
getModule,
completeModule,
getModuleProgress
} from "../services/roadmapService";

import api from "../services/api";

import "./Module.css";

/* =====================================================
LEARNING CONTENT SECTION PARSER
===================================================== */

const LEARNING_SECTION_LABELS = [
"Key Concepts",
"Important Topics",
"Practical Learning",
"Coding/Practice Guidance",
"Real-World Applications"
];

function parseLearningSections(rawContent) {

const text =
    String(rawContent || "").trim();

if (!text) {
    return [];
}

const escapedLabels =
    LEARNING_SECTION_LABELS
        .map(label =>
            label.replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            )
        )
        .join("|");

const pattern =
    new RegExp(
        `(${escapedLabels})\\s*:\\s*`,
        "gi"
    );

const matches =
    [...text.matchAll(pattern)];

/*
 * If backend content does not use our standard
 * section labels, keep the complete content intact.
 */
if (matches.length === 0) {

    return [
        {
            title: "Lesson Content",
            content: text,
            icon: "📘"
        }
    ];

}


const iconMap = {

    "Key Concepts":
        "✦",

    "Important Topics":
        "◎",

    "Practical Learning":
        "⚡",

    "Coding/Practice Guidance":
        "⌘",

    "Real-World Applications":
        "◆"

};


return matches
    .map(
        (match, index) => {

            const start =
                match.index +
                match[0].length;

            const end =
                index + 1 <
                matches.length
                    ? matches[index + 1].index
                    : text.length;


            const sectionText =
                text
                    .slice(
                        start,
                        end
                    )
                    .trim()
                    .replace(
                        /^[:\-\s]+/,
                        ""
                    )
                    .trim();


            return {

                title:
                    match[1],

                content:
                    sectionText,

                icon:
                    iconMap[match[1]] ||
                    "•"

            };

        }
    )
    .filter(
        section =>
            section.content
    );

}

/* =====================================================
MODULE COMPONENT
===================================================== */

function Module() {

const {
    moduleId
} = useParams();

const navigate =
    useNavigate();


/* =====================================================
   STATE
   ===================================================== */

const [
    module,
    setModule
] = useState(null);


const [
    moduleProgress,
    setModuleProgress
] = useState(null);


const [
    learningContents,
    setLearningContents
] = useState([]);


const [
    activeContent,
    setActiveContent
] = useState(null);


/*
 * Backend lesson index.
 */
const [
    activeLessonIndex,
    setActiveLessonIndex
] = useState(0);


/*
 * Virtual learning step index.
 *
 * Example:
 *
 * One LearningContent
 *       ↓
 * Key Concepts
 * Important Topics
 * Practical Learning
 * Coding/Practice
 * Real World
 */
const [
    activeSectionIndex,
    setActiveSectionIndex
] = useState(0);


/* =====================================================
   NOTES
   ===================================================== */

const [
    notesOpen,
    setNotesOpen
] = useState(false);


const [
    notes,
    setNotes
] = useState("");


const [
    notesSaved,
    setNotesSaved
] = useState(false);


/* =====================================================
   LOADING / ERROR STATES
   ===================================================== */

const [
    loading,
    setLoading
] = useState(true);


const [
    contentLoading,
    setContentLoading
] = useState(true);


const [
    progressLoading,
    setProgressLoading
] = useState(true);


const [
    completing,
    setCompleting
] = useState(false);


const [
    completingLesson,
    setCompletingLesson
] = useState(false);


const [
    error,
    setError
] = useState("");


const [
    contentError,
    setContentError
] = useState("");

/* =====================================================
   STUDY TIME TRACKER
   -----------------------------------------------------
   Counts only the time while this module page is visible.
   Total seconds are stored locally so the Dashboard can
   display the accumulated study time.
   ===================================================== */

const studyStartRef = useRef(null);

const saveStudyTime = () => {

    if (!studyStartRef.current) {
        return;
    }

    const elapsedSeconds =
        Math.floor(
            (Date.now() -
                studyStartRef.current) / 1000
        );

    if (elapsedSeconds <= 0) {
        return;
    }

    const previousSeconds =
        Number(
            window.localStorage.getItem(
                "aiMentorStudySeconds"
            ) || 0
        );

    window.localStorage.setItem(
        "aiMentorStudySeconds",
        String(
            previousSeconds +
            elapsedSeconds
        )
    );

    studyStartRef.current =
        Date.now();

    window.dispatchEvent(
        new Event(
            "study-time-updated"
        )
    );
};

useEffect(() => {

    if (!moduleId) {
        return;
    }

    studyStartRef.current =
        Date.now();

    const timer =
        window.setInterval(
            saveStudyTime,
            15000
        );

    const handleVisibilityChange =
        () => {

            if (document.hidden) {

                saveStudyTime();

                studyStartRef.current =
                    null;

            } else {

                studyStartRef.current =
                    Date.now();

            }
        };

    document.addEventListener(
        "visibilitychange",
        handleVisibilityChange
    );

    return () => {

        window.clearInterval(timer);

        saveStudyTime();

        document.removeEventListener(
            "visibilitychange",
            handleVisibilityChange
        );

        studyStartRef.current =
            null;
    };

}, [moduleId]);



/* =====================================================
   MODULE UNLOCK / NEXT MODULE HELPERS
   ===================================================== */

const loadStudentRoadmapModules =
    async () => {

        const response =
            await api.get(
                "/api/roadmaps/student"
            );

        const roadmaps =
            Array.isArray(response?.data)
                ? response.data
                : [];

        if (roadmaps.length === 0) {
            return [];
        }

        const latestRoadmap =
            roadmaps[roadmaps.length - 1];

        return Array.isArray(
            latestRoadmap?.modules
        )
            ? latestRoadmap.modules
            : [];
    };


const getModuleWeek =
    (item) =>
        Number(
            item?.weekNumber ??
            item?.week ??
            item?.weekNo ??
            0
        );


const isModuleCompleted =
    (item) =>
        String(
            item?.status ||
            ""
        ).toUpperCase() ===
        "COMPLETED";


const ensureModuleUnlocked =
    async (currentModule) => {

        const currentWeek =
            getModuleWeek(currentModule);

        /*
         * Week 1 is always available.
         * Existing completed modules must also remain accessible.
         */
        if (
            currentWeek <= 1 ||
            isModuleCompleted(currentModule)
        ) {
            return true;
        }

        try {

            const roadmapModules =
                await loadStudentRoadmapModules();

            /*
             * The student roadmap already returns its modules.
             * If the endpoint is temporarily empty, do not break
             * the current module page.
             */
            if (roadmapModules.length === 0) {
                return true;
            }

            const earlierModules =
                roadmapModules.filter(
                    item =>
                        getModuleWeek(item) <
                        currentWeek
                );

            const allEarlierCompleted =
                earlierModules.length === 0 ||
                earlierModules.every(
                    isModuleCompleted
                );

            if (!allEarlierCompleted) {

                console.warn(
                    "MODULE LOCKED: Complete the previous module first."
                );

                navigate(
                    "/roadmap",
                    { replace: true }
                );

                return false;
            }

        } catch (unlockError) {

            console.warn(
                "MODULE UNLOCK CHECK ERROR:",
                unlockError
            );

            /*
             * Keep the existing module behaviour if the roadmap
             * status endpoint is temporarily unavailable.
             */
        }

        return true;
    };


const navigateToNextModule =
    async () => {

        try {

            const roadmapModules =
                await loadStudentRoadmapModules();

            const currentWeek =
                getModuleWeek(module);

            const sortedModules =
                [...roadmapModules].sort(
                    (a, b) =>
                        getModuleWeek(a) -
                        getModuleWeek(b)
                );

            const nextModule =
                sortedModules.find(
                    item =>
                        getModuleWeek(item) >
                        currentWeek &&
                        !isModuleCompleted(item)
                );

            if (nextModule?.id) {

                console.log(
                    "NEXT MODULE UNLOCKED:",
                    nextModule
                );

                navigate(
                    `/module/${nextModule.id}`,
                    { replace: true }
                );

                return;
            }

            /* Final module completed. Return to the roadmap. */
            navigate(
                "/roadmap",
                { replace: true }
            );

        } catch (nextModuleError) {

            console.warn(
                "NEXT MODULE LOAD ERROR:",
                nextModuleError
            );

            /* Completion already succeeded; refresh roadmap. */
            navigate(
                "/roadmap",
                { replace: true }
            );
        }
    };


/* =====================================================
   LOAD MODULE
   ===================================================== */

useEffect(() => {

    const loadModule =
        async () => {

            if (!moduleId) {

                setError(
                    "Module ID is missing."
                );

                setLoading(false);

                return;

            }


            try {

                setLoading(true);

                setError("");


                const data =
                    await getModule(
                        moduleId
                    );


                console.log(
                    "MODULE RESPONSE:",
                    data
                );


                const moduleUnlocked =
                    await ensureModuleUnlocked(
                        data
                    );

                if (!moduleUnlocked) {
                    return;
                }


                setModule(data);


            } catch (err) {

                console.error(
                    "MODULE LOAD ERROR:",
                    err
                );


                setError(
                    err?.response?.data?.message ||
                    err?.response?.data ||
                    "Unable to load this module."
                );


            } finally {

                setLoading(false);

            }

        };


    loadModule();

}, [
    moduleId
]);


/* =====================================================
   LOAD LEARNING CONTENT
   ===================================================== */

useEffect(() => {

    const loadLearningContent =
        async () => {

            if (!moduleId) {
                return;
            }


            try {

                setContentLoading(
                    true
                );

                setContentError("");


                const response =
                    await api.get(
                        `/api/learning-content/module/${moduleId}`
                    );


                console.log(
                    "LEARNING CONTENT RESPONSE:",
                    response.data
                );


                const rawData =
                    Array.isArray(
                        response.data
                    )
                        ? response.data
                        : [];


                /*
                 * Normalize backend response.
                 */
                const normalizedData =
                    rawData.map(
                        (
                            item,
                            index
                        ) => ({

                            ...item,

                            _index:
                                index,

                            _title:
                                item?.title ||
                                item?.name ||
                                item?.lessonTitle ||
                                `Lesson ${index + 1}`,

                            _description:
                                item?.description ||
                                item?.overview ||
                                "",

                            _content:
                                item?.content ||
                                item?.body ||
                                item?.lessonContent ||
                                "",

                            _resourceUrl:
                                item?.resourceUrl ||
                                item?.url ||
                                item?.link ||
                                "",

                            _type:
                                item?.contentType ||
                                item?.type ||
                                "LESSON",

                            _duration:
                                item?.duration ||
                                item?.estimatedMinutes ||
                                item?.durationMinutes ||
                                null

                        })
                    );


                setLearningContents(
                    normalizedData
                );


                if (
                    normalizedData.length > 0
                ) {

                    setActiveLessonIndex(
                        0
                    );

                    setActiveSectionIndex(
                        0
                    );

                    setActiveContent(
                        normalizedData[0]
                    );

                } else {

                    setActiveLessonIndex(
                        0
                    );

                    setActiveSectionIndex(
                        0
                    );

                    setActiveContent(
                        null
                    );

                }


            } catch (err) {

                console.error(
                    "LEARNING CONTENT ERROR:",
                    err
                );


                setLearningContents(
                    []
                );

                setActiveLessonIndex(
                    0
                );

                setActiveSectionIndex(
                    0
                );

                setActiveContent(
                    null
                );


                setContentError(
                    err?.response?.data?.message ||
                    "Learning content could not be loaded."
                );


            } finally {

                setContentLoading(
                    false
                );

            }

        };


    loadLearningContent();

}, [
    moduleId
]);


/* =====================================================
   LOAD MODULE PROGRESS
   ===================================================== */

const loadProgress =
    async () => {

        if (!moduleId) {
            return;
        }


        try {

            setProgressLoading(
                true
            );


            const data =
                await getModuleProgress(
                    moduleId
                );


            console.log(
                "MODULE PROGRESS:",
                data
            );


            setModuleProgress(
                data
            );


        } catch (err) {

            console.warn(
                "MODULE PROGRESS ERROR:",
                err
            );


        } finally {

            setProgressLoading(
                false
            );

        }

    };


useEffect(() => {

    loadProgress();

}, [
    moduleId
]);


/* =====================================================
   NORMALIZED MODULE DATA
   ===================================================== */

const title =
    module?.title ||
    module?.name ||
    "Learning Module";


const description =
    module?.description ||
    module?.overview ||
    "Build your knowledge step by step through this personalized learning module.";


const week =
    module?.weekNumber ??
    module?.week ??
    module?.weekNo ??
    "-";


const status =
    String(
        moduleProgress?.status ||
        module?.status ||
        "NOT_STARTED"
    ).toUpperCase();


/* =====================================================
   PROGRESS
   ===================================================== */

const progressValue =
    useMemo(
        () => {

            if (
                status === "COMPLETED" ||
                Number(
                    moduleProgress?.progressPercentage
                ) === 100
            ) {

                return 100;

            }


            const value =
                moduleProgress?.progressPercentage ??
                moduleProgress?.progress ??
                module?.progress ??
                0;


            return Math.min(
                Math.max(
                    Number(value) || 0,
                    0
                ),
                100
            );

        },
        [
            status,
            moduleProgress,
            module
        ]
    );


/* =====================================================
   TOPICS
   ===================================================== */

const topics =
    module?.topics ||
    module?.topicList ||
    module?.skills ||
    [];


const topicArray =
    Array.isArray(topics)
        ? topics
        : typeof topics === "string"
            ? topics
                .split(",")
                .map(
                    item =>
                        item.trim()
                )
                .filter(Boolean)
            : [];


/* =====================================================
   ACTIVE LESSON
   ===================================================== */

const activeIndex =
    learningContents.length > 0
        ? Math.min(
            Math.max(
                activeLessonIndex,
                0
            ),
            learningContents.length - 1
        )
        : -1;


/* =====================================================
   ACTIVE LEARNING SECTIONS
   ===================================================== */

const activeSections =
    useMemo(
        () =>
            parseLearningSections(
                activeContent?._content
            ),
        [
            activeContent?._content
        ]
    );


const safeSectionIndex =
    activeSections.length > 0
        ? Math.min(
            Math.max(
                activeSectionIndex,
                0
            ),
            activeSections.length - 1
        )
        : 0;


const activeSection =
    activeSections[
        safeSectionIndex
    ] || null;


/*
 * If only one backend content row exists but
 * it contains the five standard learning sections,
 * navigation works through those sections.
 */
const hasVirtualSections =
    learningContents.length === 1 &&
    activeSections.length > 1;


const isFirstLesson =
    hasVirtualSections
        ? safeSectionIndex === 0
        : activeIndex <= 0;


const isLastLesson =
    hasVirtualSections
        ? safeSectionIndex ===
          activeSections.length - 1
        : activeIndex ===
          learningContents.length - 1;


const navigationLabel =
    hasVirtualSections
        ? `${safeSectionIndex + 1}/${activeSections.length}`
        : `${activeIndex + 1}/${learningContents.length}`;


/* =====================================================
   SELECT LESSON
   ===================================================== */

const handleSelectContent =
    (
        content,
        index
    ) => {

        if (
            !content ||
            typeof index !== "number" ||
            index < 0
        ) {

            return;

        }


        setActiveLessonIndex(
            index
        );


        setActiveSectionIndex(
            0
        );


        setActiveContent(
            content
        );


        setTimeout(
            () => {

                document
                    .getElementById(
                        "lesson-viewer"
                    )
                    ?.scrollIntoView({
                        behavior:
                            "smooth",
                        block:
                            "start"
                    });

            },
            50
        );

    };


/* =====================================================
   NEXT
   ===================================================== */

const handleNextLesson =
    async () => {

        if (
            learningContents.length === 0
        ) {

            return;

        }


        /*
         * One backend content →
         * multiple learning steps.
         */
        if (
            hasVirtualSections
        ) {

            if (
                safeSectionIndex <
                activeSections.length - 1
            ) {

                setActiveSectionIndex(
                    safeSectionIndex + 1
                );


                setTimeout(
                    () => {

                        document
                            .getElementById(
                                "lesson-viewer"
                            )
                            ?.scrollIntoView({
                                behavior:
                                    "smooth",
                                block:
                                    "start"
                            });

                    },
                    50
                );


                return;

            }


            /*
             * Last learning step.
             * Finish the actual backend lesson.
             */
            if (
                !activeContent.completed
            ) {

                await handleCompleteLesson();

            }


            return;

        }


        /*
         * Multiple backend lessons.
         */
        if (
            activeIndex <
            learningContents.length - 1
        ) {

            const nextIndex =
                activeIndex + 1;


            const next =
                learningContents[
                    nextIndex
                ];


            if (!next) {
                return;
            }


            setActiveLessonIndex(
                nextIndex
            );


            setActiveSectionIndex(
                0
            );


            setActiveContent(
                next
            );


            setTimeout(
                () => {

                    document
                        .getElementById(
                            "lesson-viewer"
                        )
                        ?.scrollIntoView({
                            behavior:
                                "smooth",
                            block:
                                "start"
                        });

                },
                50
            );


            return;

        }


        /*
         * Last actual lesson.
         */
        if (
            !activeContent.completed
        ) {

            await handleCompleteLesson();

        }

    };


/* =====================================================
   PREVIOUS
   ===================================================== */

const handlePreviousLesson =
    () => {

        if (
            learningContents.length === 0
        ) {

            return;

        }


        /*
         * Previous virtual learning step.
         */
        if (
            hasVirtualSections
        ) {

            if (
                safeSectionIndex <= 0
            ) {

                return;

            }


            setActiveSectionIndex(
                safeSectionIndex - 1
            );


            setTimeout(
                () => {

                    document
                        .getElementById(
                            "lesson-viewer"
                        )
                        ?.scrollIntoView({
                            behavior:
                                "smooth",
                            block:
                                "start"
                        });

                },
                50
            );


            return;

        }


        /*
         * Previous backend lesson.
         */
        if (
            activeIndex <= 0
        ) {

            return;

        }


        const previousIndex =
            activeIndex - 1;


        const previous =
            learningContents[
                previousIndex
            ];


        if (!previous) {
            return;
        }


        setActiveLessonIndex(
            previousIndex
        );


        setActiveSectionIndex(
            0
        );


        setActiveContent(
            previous
        );


        setTimeout(
            () => {

                document
                    .getElementById(
                        "lesson-viewer"
                    )
                    ?.scrollIntoView({
                        behavior:
                            "smooth",
                        block:
                            "start"
                    });

            },
            50
        );

    };


/* =====================================================
   COMPLETE LESSON
   ===================================================== */

const handleCompleteLesson =
    async () => {

        if (
            !activeContent?.id ||
            completingLesson ||
            activeContent.completed
        ) {

            return;

        }


        try {

            setCompletingLesson(
                true
            );

            setContentError("");


            const response =
                await api.put(
                    `/api/learning-content/${activeContent.id}/complete`
                );


            const updatedContent =
                response?.data ||
                {
                    ...activeContent,
                    completed: true
                };


            const completedContent = {

                ...activeContent,

                ...updatedContent,

                completed: true

            };


            setLearningContents(
                previous =>
                    previous.map(
                        item =>
                            item.id ===
                            activeContent.id
                                ? completedContent
                                : item
                    )
            );


            setActiveContent(
                completedContent
            );


            await loadProgress();


            /*
             * After finishing the final learning step,
             * move the user to the module completion section.
             */
            if (
                isLastLesson
            ) {

                setTimeout(
                    () => {

                        document
                            .getElementById(
                                "module-completion-card"
                            )
                            ?.scrollIntoView({
                                behavior:
                                    "smooth",
                                block:
                                    "center"
                            });

                    },
                    250
                );

            }


        } catch (err) {

            console.error(
                "LESSON COMPLETE ERROR:",
                err
            );


            setContentError(
                err?.response?.data?.message ||
                err?.response?.data ||
                "Unable to complete this lesson. Please try again."
            );


        } finally {

            setCompletingLesson(
                false
            );

        }

    };


/* =====================================================
   COMPLETE MODULE
   ===================================================== */

const handleComplete =
    async () => {

        if (
            !module ||
            completing ||
            status === "COMPLETED"
        ) {

            return;

        }


        try {

            setCompleting(
                true
            );

            setError("");


            console.log(
                "COMPLETING MODULE:",
                moduleId
            );


            const response =
                await completeModule(
                    moduleId
                );


            console.log(
                "MODULE COMPLETED:",
                response
            );


            setModule(
                previous => ({

                    ...previous,

                    ...(response &&
                    typeof response ===
                        "object"
                        ? response
                        : {}),

                    status:
                        "COMPLETED",

                    progress:
                        100

                })
            );


            await loadProgress();


            /*
             * REAL-TIME PROGRESS SYNC
             * -----------------------------------------------
             * The completion has already been persisted in the
             * backend. Notify the Roadmap and Dashboard pages
             * so their server-backed progress can be refreshed
             * immediately without changing the learning flow.
             */
            window.dispatchEvent(
                new CustomEvent(
                    "learning-progress-updated",
                    {
                        detail: {
                            moduleId: Number(moduleId),
                            status: "COMPLETED"
                        }
                    }
                )
            );

            localStorage.setItem(
                "learningProgressUpdatedAt",
                String(Date.now())
            );

            /*
             * IMPORTANT:
             * Do NOT automatically navigate to the next module.
             * Return to the roadmap so the user can see the newly
             * completed module, updated progress, and the next
             * module becoming unlocked.
             */
            navigate(
                "/roadmap",
                { replace: true }
            );


        } catch (err) {

            console.error(
                "MODULE COMPLETE ERROR:",
                err
            );


            setError(
                err?.response?.data?.message ||
                err?.response?.data ||
                "Unable to complete this module. Please try again."
            );


        } finally {

            setCompleting(
                false
            );

        }

    };


/* =====================================================
   NOTES
   ===================================================== */

useEffect(() => {

    if (
        !moduleId ||
        !activeContent?.id
    ) {

        setNotes("");

        return;

    }


    try {

        const key =
            `ai-mentor:module:${moduleId}:lesson:${activeContent.id}:notes`;


        const savedNotes =
            window.localStorage.getItem(
                key
            ) || "";


        setNotes(
            savedNotes
        );


        setNotesSaved(
            Boolean(
                savedNotes
            )
        );


    } catch (err) {

        console.warn(
            "NOTES LOAD ERROR:",
            err
        );


        setNotes("");

        setNotesSaved(
            false
        );

    }

}, [
    moduleId,
    activeContent?.id
]);


const handleSaveNotes =
    () => {

        if (
            !moduleId ||
            !activeContent?.id
        ) {

            return;

        }


        try {

            const key =
                `ai-mentor:module:${moduleId}:lesson:${activeContent.id}:notes`;


            window.localStorage.setItem(
                key,
                notes
            );


            setNotesSaved(
                true
            );


        } catch (err) {

            console.warn(
                "NOTES SAVE ERROR:",
                err
            );

        }

    };


const handleClearNotes =
    () => {

        if (
            !moduleId ||
            !activeContent?.id
        ) {

            return;

        }


        try {

            const key =
                `ai-mentor:module:${moduleId}:lesson:${activeContent.id}:notes`;


            window.localStorage.removeItem(
                key
            );


        } catch (err) {

            console.warn(
                "NOTES CLEAR ERROR:",
                err
            );

        }


        setNotes("");

        setNotesSaved(
            false
        );

    };


/* =====================================================
   BACK TO ROADMAP
   ===================================================== */

const handleBack =
    () => {

        navigate(
            "/roadmap"
        );

    };


/* =====================================================
   AI MENTOR
   ===================================================== */

const handleAskMentor =
    () => {

        navigate(
            "/ai-mentor",
            {

                state: {

                    moduleId,

                    moduleTitle:
                        title,

                    lessonTitle:
                        activeContent?._title ||
                        "Current lesson",

                    lessonContent:
                        activeSection?.content ||
                        activeContent?._content ||
                        "",

                    source:
                        "module-learning"

                }

            }
        );

    };


/* =====================================================
   LOADING
   ===================================================== */

if (loading) {

    return (

        <div className="module-page">

            <div className="module-loading">

                <div className="loading-card">

                    <div className="loading-logo">
                        ✦
                    </div>

                    <div className="loading-spinner" />

                    <h2>
                        Preparing your learning module
                    </h2>

                    <p>
                        Loading your personalized
                        learning experience...
                    </p>

                </div>

            </div>

        </div>

    );

}


/* =====================================================
   ERROR
   ===================================================== */

if (
    error &&
    !module
) {

    return (

        <div className="module-page">

            <div className="module-error">

                <div className="error-card">

                    <div className="error-icon">
                        !
                    </div>

                    <span className="eyebrow">
                        SOMETHING WENT WRONG
                    </span>

                    <h2>
                        Module couldn't be loaded
                    </h2>

                    <p>
                        {error}
                    </p>

                    <div className="error-actions">

                        <button
                            className="btn-primary"
                            onClick={() =>
                                window.location.reload()
                            }
                        >
                            Try Again
                        </button>

                        <button
                            className="btn-secondary"
                            onClick={
                                handleBack
                            }
                        >
                            Back to Roadmap
                        </button>

                    </div>

                </div>

            </div>

        </div>

    );

}


/* =====================================================
   MAIN UI
   ===================================================== */

return (

    <div className="module-page">


        {/* =================================================
            TOP NAVIGATION
        ================================================= */}

        <div className="module-topbar">

            <div className="module-topbar-left">

                <button
                    className="back-btn"
                    onClick={
                        handleBack
                    }
                >

                    <span>
                        ←
                    </span>

                    Roadmap

                </button>


                <div className="breadcrumb">

                    <span>
                        Learning Path
                    </span>

                    <b>
                        /
                    </b>

                    <strong>
                        Module {week}
                    </strong>

                </div>

            </div>


            <div className="module-status">

                <span
                    className={
                        status ===
                        "COMPLETED"
                            ? "status-pill completed"
                            : status ===
                              "IN_PROGRESS"
                                ? "status-pill progress"
                                : "status-pill pending"
                    }
                >

                    <span className="status-dot" />

                    {
                        status ===
                        "COMPLETED"
                            ? "Completed"
                            : status ===
                              "IN_PROGRESS"
                                ? "In Progress"
                                : "Not Started"
                    }

                </span>

            </div>

        </div>


        <main className="module-container">


            {/* =================================================
                HERO
            ================================================= */}

            <section className="module-hero">

                <div className="hero-decoration hero-decoration-one" />

                <div className="hero-decoration hero-decoration-two" />


                <div className="hero-content">

                    <div className="hero-left">

                        <div className="week-badge">
                            ✦ WEEK {week}
                        </div>


                        <h1>
                            {title}
                        </h1>


                        <p className="hero-description">
                            {description}
                        </p>


                        <div className="hero-stats">

                            <div
                                className="hero-stat"
                                style={{
                                    minWidth: "105px",
                                    padding: "12px 16px",
                                    borderRadius: "14px",
                                    background: "rgba(255, 255, 255, 0.13)",
                                    border: "1px solid rgba(255, 255, 255, 0.22)",
                                    boxSizing: "border-box"
                                }}
                            >

                                <span style={{
                                    display: "block",
                                    color: "rgba(255, 255, 255, 0.72)",
                                    fontSize: "9px",
                                    fontWeight: 800,
                                    letterSpacing: "1px",
                                    marginBottom: "5px"
                                }}>
                                    LESSONS
                                </span>

                                <strong style={{
                                    display: "block",
                                    color: "#ffffff",
                                    fontSize: "20px",
                                    fontWeight: 900,
                                    lineHeight: 1.15
                                }}>
                                    {
                                        learningContents.length
                                    }
                                </strong>

                            </div>


                            <div
                                className="hero-stat"
                                style={{
                                    minWidth: "105px",
                                    padding: "12px 16px",
                                    borderRadius: "14px",
                                    background: "rgba(255, 255, 255, 0.13)",
                                    border: "1px solid rgba(255, 255, 255, 0.22)",
                                    boxSizing: "border-box"
                                }}
                            >

                                <span style={{
                                    display: "block",
                                    color: "rgba(255, 255, 255, 0.72)",
                                    fontSize: "9px",
                                    fontWeight: 800,
                                    letterSpacing: "1px",
                                    marginBottom: "5px"
                                }}>
                                    TOPICS
                                </span>

                                <strong style={{
                                    display: "block",
                                    color: "#ffffff",
                                    fontSize: "20px",
                                    fontWeight: 900,
                                    lineHeight: 1.15
                                }}>
                                    {
                                        topicArray.length
                                    }
                                </strong>

                            </div>


                            <div
                                className="hero-stat"
                                style={{
                                    minWidth: "105px",
                                    padding: "12px 16px",
                                    borderRadius: "14px",
                                    background: "rgba(255, 255, 255, 0.13)",
                                    border: "1px solid rgba(255, 255, 255, 0.22)",
                                    boxSizing: "border-box"
                                }}
                            >

                                <span style={{
                                    display: "block",
                                    color: "rgba(255, 255, 255, 0.72)",
                                    fontSize: "9px",
                                    fontWeight: 800,
                                    letterSpacing: "1px",
                                    marginBottom: "5px"
                                }}>
                                    PROGRESS
                                </span>

                                <strong style={{
                                    display: "block",
                                    color: "#ffffff",
                                    fontSize: "20px",
                                    fontWeight: 900,
                                    lineHeight: 1.15
                                }}>
                                    {progressValue}%
                                </strong>

                            </div>

                        </div>

                    </div>


                    <div className="hero-progress-card">

                        <div
                            className="progress-circle"
                            style={{
                                "--progress":
                                    `${progressValue * 3.6}deg`
                            }}
                        >

                            <div className="progress-circle-inner">

                                <strong>
                                    {progressValue}%
                                </strong>

                                <span>
                                    Complete
                                </span>

                            </div>

                        </div>

                        <span>
                            Your module progress
                        </span>

                    </div>

                </div>


                <div className="hero-progress">

                    <div className="progress-label-row">

                        <span>
                            Module progress
                        </span>

                        <strong>
                            {progressValue}%
                        </strong>

                    </div>


                    <div className="progress-track">

                        <div
                            className="progress-fill"
                            style={{
                                width:
                                    `${progressValue}%`
                            }}
                        />

                    </div>

                </div>

            </section>


            {/* =================================================
                ERROR ALERT
            ================================================= */}

            {error && (

                <div className="module-alert">

                    <span>
                        !
                    </span>

                    <p>
                        {error}
                    </p>

                </div>

            )}


            {/* =================================================
                MAIN GRID
            ================================================= */}

            <div className="module-grid">


                {/* =================================================
                    LEFT COLUMN
                ================================================= */}

                <div className="module-main">


                    {/* =================================================
                        WHAT YOU WILL LEARN
                    ================================================= */}

                    <section className="content-card">

                        <div className="card-heading">

                            <div className="card-heading-icon">
                                ◇
                            </div>

                            <div>

                                <span className="eyebrow">
                                    MODULE OVERVIEW
                                </span>

                                <h2>
                                    What you'll learn
                                </h2>

                            </div>

                        </div>


                        <div className="overview-box">

                            <p>
                                {description}
                            </p>

                        </div>


                        {topicArray.length > 0 && (

                            <div className="topics-section">

                                <div className="sub-heading">
                                    Skills covered
                                </div>


                                <div className="topic-grid">

                                    {topicArray.map(
                                        (
                                            topic,
                                            index
                                        ) => (

                                            <div
                                                className="topic-chip"
                                                key={index}
                                            >

                                                <span>
                                                    ✓
                                                </span>

                                                {topic}

                                            </div>

                                        )
                                    )}

                                </div>

                            </div>

                        )}

                    </section>


                    {/* =================================================
                        LEARNING CONTENT
                    ================================================= */}

                    <section
                        className="content-card learning-card"
                    >

                        <div className="learning-header">

                            <div className="card-heading">

                                <div className="card-heading-icon purple">
                                    📚
                                </div>

                                <div>

                                    <span className="eyebrow">
                                        LEARNING CONTENT
                                    </span>

                                    <h2>
                                        Start Learning
                                    </h2>

                                </div>

                            </div>


                            {learningContents.length > 0 && (

                                <div className="lesson-count">

                                    {
                                        learningContents.length
                                    }

                                    {" "}

                                    {
                                        learningContents.length === 1
                                            ? "lesson"
                                            : "lessons"
                                    }

                                </div>

                            )}

                        </div>


                        {/* =================================================
                            LOADING
                        ================================================= */}

                        {contentLoading && (

                            <div className="content-loading">

                                <div className="content-spinner" />

                                <h3>
                                    Preparing your lessons
                                </h3>

                                <p>
                                    Loading learning content for this module...
                                </p>

                            </div>

                        )}


                        {/* =================================================
                            CONTENT ERROR
                        ================================================= */}

                        {!contentLoading &&
                            contentError && (

                                <div className="content-empty">

                                    <div className="empty-icon">
                                        !
                                    </div>

                                    <h3>
                                        Learning content unavailable
                                    </h3>

                                    <p>
                                        {contentError}
                                    </p>

                                </div>

                            )}


                        {/* =================================================
                            LESSONS + VIEWER
                        ================================================= */}

                        {!contentLoading &&
                            !contentError &&
                            learningContents.length > 0 && (

                                <div className="learning-layout">


                                    {/* =================================================
                                        LESSON LIST
                                    ================================================= */}

                                    <div className="lesson-list">

                                        <div className="lesson-list-title">
                                            MODULE LESSONS
                                        </div>


                                        {learningContents.map(
                                            (
                                                item,
                                                index
                                            ) => {

                                                const active =
                                                    index ===
                                                    activeIndex;


                                                return (

                                                    <button
                                                        key={
                                                            item?.id ||
                                                            index
                                                        }
                                                        className={
                                                            active
                                                                ? "lesson-item active"
                                                                : "lesson-item"
                                                        }
                                                        onClick={() =>
                                                            handleSelectContent(
                                                                item,
                                                                index
                                                            )
                                                        }
                                                    >

                                                        <div
                                                            className={
                                                                active
                                                                    ? "lesson-number active"
                                                                    : "lesson-number"
                                                            }
                                                        >

                                                            {
                                                                String(
                                                                    index + 1
                                                                ).padStart(
                                                                    2,
                                                                    "0"
                                                                )
                                                            }

                                                        </div>


                                                        <div className="lesson-info">

                                                            <strong>
                                                                {
                                                                    item._title
                                                                }
                                                            </strong>

                                                            <span>

                                                                {
                                                                    item._duration
                                                                        ? `${item._duration} min`
                                                                        : item._type
                                                                }

                                                            </span>

                                                        </div>


                                                        <span className="lesson-arrow">
                                                            →
                                                        </span>

                                                    </button>

                                                );

                                            }
                                        )}

                                    </div>


                                    {/* =================================================
                                        LESSON VIEWER
                                    ================================================= */}

                                    <div
                                        className="lesson-viewer"
                                        id="lesson-viewer"
                                    >

                                        {activeContent ? (

                                            <>


                                                {/* =================================================
                                                    VIEWER HEADER
                                                ================================================= */}

                                                <div className="viewer-top">

                                                    <div>

                                                        <span className="lesson-badge">

                                                            {
                                                                hasVirtualSections
                                                                    ? `STEP ${safeSectionIndex + 1}`
                                                                    : `LESSON ${activeIndex + 1}`
                                                            }

                                                        </span>


                                                        <h3>
                                                            {
                                                                activeContent._title
                                                            }
                                                        </h3>

                                                    </div>


                                                    <div className="viewer-position">

                                                        {
                                                            navigationLabel
                                                        }

                                                    </div>

                                                </div>


                                                {/* =================================================
                                                    META
                                                ================================================= */}

                                                <div className="viewer-meta">

                                                    <span>
                                                        📖
                                                        {" "}
                                                        {
                                                            activeContent._type
                                                        }
                                                    </span>


                                                    {activeContent._duration && (

                                                        <span>
                                                            ⏱
                                                            {" "}
                                                            {
                                                                activeContent._duration
                                                            }
                                                            {" "}
                                                            min
                                                        </span>

                                                    )}

                                                </div>


                                                {/* =================================================
                                                    LESSON BODY
                                                ================================================= */}

                                                <div className="lesson-body">


                                                    {activeContent._description && (

                                                        <p className="lesson-description">

                                                            {
                                                                activeContent._description
                                                            }

                                                        </p>

                                                    )}


                                                    {/* =================================================
                                                        PROFESSIONAL LEARNING CARD
                                                    ================================================= */}

                                                    {activeSection ? (

                                                        <div
                                                            className="lesson-content-text"
                                                            style={{
                                                                display:
                                                                    "grid",
                                                                gap:
                                                                    "14px"
                                                            }}
                                                        >

                                                            <article
                                                                style={{
                                                                    padding:
                                                                        "22px 24px",

                                                                    border:
                                                                        "1px solid rgba(99, 74, 230, 0.12)",

                                                                    borderRadius:
                                                                        "18px",

                                                                    background:
                                                                        "linear-gradient(145deg, #ffffff 0%, #f8f7ff 100%)",

                                                                    boxShadow:
                                                                        "0 10px 28px rgba(35, 24, 90, 0.06)"
                                                                }}
                                                            >

                                                                <div
                                                                    style={{
                                                                        display:
                                                                            "flex",

                                                                        alignItems:
                                                                            "center",

                                                                        gap:
                                                                            "12px",

                                                                        marginBottom:
                                                                            "12px"
                                                                    }}
                                                                >

                                                                    <span
                                                                        style={{
                                                                            width:
                                                                                "40px",

                                                                            height:
                                                                                "40px",

                                                                            minWidth:
                                                                                "40px",

                                                                            borderRadius:
                                                                                "12px",

                                                                            display:
                                                                                "inline-flex",

                                                                            alignItems:
                                                                                "center",

                                                                            justifyContent:
                                                                                "center",

                                                                            background:
                                                                                "rgba(99, 74, 230, 0.10)",

                                                                            color:
                                                                                "#5b3fd6",

                                                                            fontWeight:
                                                                                800,

                                                                            fontSize:
                                                                                "17px"
                                                                        }}
                                                                    >

                                                                        {
                                                                            activeSection.icon
                                                                        }

                                                                    </span>


                                                                    <div>

                                                                        <span
                                                                            style={{
                                                                                display:
                                                                                    "block",

                                                                                fontSize:
                                                                                    "10px",

                                                                                letterSpacing:
                                                                                    "0.12em",

                                                                                textTransform:
                                                                                    "uppercase",

                                                                                fontWeight:
                                                                                    800,

                                                                                color:
                                                                                    "#8c84a8",

                                                                                marginBottom:
                                                                                    "3px"
                                                                            }}
                                                                        >

                                                                            Learning step{" "}
                                                                            {
                                                                                safeSectionIndex + 1
                                                                            }

                                                                        </span>


                                                                        <h4
                                                                            style={{
                                                                                margin:
                                                                                    0,

                                                                                fontSize:
                                                                                    "17px",

                                                                                fontWeight:
                                                                                    800,

                                                                                color:
                                                                                    "#1d1833"
                                                                            }}
                                                                        >

                                                                            {
                                                                                activeSection.title
                                                                            }

                                                                        </h4>

                                                                    </div>

                                                                </div>


                                                                <p
                                                                    style={{
                                                                        margin:
                                                                            0,

                                                                        color:
                                                                            "#5f5a72",

                                                                        lineHeight:
                                                                            1.75,

                                                                        fontSize:
                                                                            "14px",

                                                                        whiteSpace:
                                                                            "pre-line"
                                                                    }}
                                                                >

                                                                    {
                                                                        activeSection.content
                                                                    }

                                                                </p>

                                                            </article>

                                                        </div>

                                                    ) : activeContent._content ? (

                                                        <div className="lesson-content-text">

                                                            {
                                                                String(
                                                                    activeContent._content
                                                                )
                                                            }

                                                        </div>

                                                    ) : (

                                                        <div className="lesson-placeholder">

                                                            <div>
                                                                📘
                                                            </div>

                                                            <h4>
                                                                Learning material ready
                                                            </h4>

                                                            <p>
                                                                Continue with this lesson
                                                                and use the learning resource
                                                                below to study the topic.
                                                            </p>

                                                        </div>

                                                    )}


                                                    {/* =================================================
                                                        RESOURCES + NOTES
                                                    ================================================= */}

                                                    <div
                                                        style={{
                                                            display:
                                                                "flex",

                                                            flexWrap:
                                                                "wrap",

                                                            gap:
                                                                "10px",

                                                            marginTop:
                                                                "18px"
                                                        }}
                                                    >

                                                        {activeContent._resourceUrl && (

                                                            <a
                                                                href={
                                                                    activeContent._resourceUrl
                                                                }
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="resource-btn"
                                                            >

                                                                <span>
                                                                    Open Learning Resource
                                                                </span>

                                                                <b>
                                                                    ↗
                                                                </b>

                                                            </a>

                                                        )}


                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setNotesOpen(
                                                                    previous =>
                                                                        !previous
                                                                )
                                                            }
                                                            style={{
                                                                border:
                                                                    "1px solid rgba(99, 74, 230, 0.18)",

                                                                background:
                                                                    "#fff",

                                                                color:
                                                                    "#5b3fd6",

                                                                borderRadius:
                                                                    "12px",

                                                                padding:
                                                                    "11px 15px",

                                                                fontWeight:
                                                                    800,

                                                                cursor:
                                                                    "pointer"
                                                            }}
                                                        >

                                                            📝
                                                            {" "}
                                                            {
                                                                notesOpen
                                                                    ? "Hide Notes"
                                                                    : "My Notes"
                                                            }

                                                        </button>

                                                    </div>


                                                    {/* =================================================
                                                        NOTES PANEL
                                                    ================================================= */}

                                                    {notesOpen && (

                                                        <div
                                                            style={{
                                                                marginTop:
                                                                    "14px",

                                                                padding:
                                                                    "18px",

                                                                borderRadius:
                                                                    "16px",

                                                                background:
                                                                    "#fbfaff",

                                                                border:
                                                                    "1px solid rgba(99, 74, 230, 0.14)"
                                                            }}
                                                        >

                                                            <div
                                                                style={{
                                                                    display:
                                                                        "flex",

                                                                    justifyContent:
                                                                        "space-between",

                                                                    gap:
                                                                        "12px",

                                                                    alignItems:
                                                                        "center",

                                                                    marginBottom:
                                                                        "10px"
                                                                }}
                                                            >

                                                                <div>

                                                                    <strong
                                                                        style={{
                                                                            color:
                                                                                "#1d1833"
                                                                        }}
                                                                    >
                                                                        Your notes
                                                                    </strong>

                                                                    <div
                                                                        style={{
                                                                            color:
                                                                                "#8c84a8",

                                                                            fontSize:
                                                                                "12px",

                                                                            marginTop:
                                                                                "3px"
                                                                        }}
                                                                    >
                                                                        Notes are saved locally for this lesson.
                                                                    </div>

                                                                </div>


                                                                {notesSaved && (

                                                                    <span
                                                                        style={{
                                                                            fontSize:
                                                                                "12px",

                                                                            fontWeight:
                                                                                700,

                                                                            color:
                                                                                "#198754"
                                                                        }}
                                                                    >
                                                                        ✓ Saved
                                                                    </span>

                                                                )}

                                                            </div>


                                                            <textarea
                                                                value={
                                                                    notes
                                                                }
                                                                onChange={
                                                                    event => {

                                                                        setNotes(
                                                                            event.target.value
                                                                        );

                                                                        setNotesSaved(
                                                                            false
                                                                        );

                                                                    }
                                                                }
                                                                placeholder="Write your key points, questions or examples here..."
                                                                rows={5}
                                                                style={{
                                                                    width:
                                                                        "100%",

                                                                    resize:
                                                                        "vertical",

                                                                    border:
                                                                        "1px solid #e4e0f2",

                                                                    borderRadius:
                                                                        "12px",

                                                                    padding:
                                                                        "13px 14px",

                                                                    outline:
                                                                        "none",

                                                                    color:
                                                                        "#28233d",

                                                                    background:
                                                                        "#fff",

                                                                    lineHeight:
                                                                        1.6,

                                                                    boxSizing:
                                                                        "border-box"
                                                                }}
                                                            />


                                                            <div
                                                                style={{
                                                                    display:
                                                                        "flex",

                                                                    justifyContent:
                                                                        "flex-end",

                                                                    gap:
                                                                        "8px",

                                                                    marginTop:
                                                                        "10px"
                                                                }}
                                                            >

                                                                <button
                                                                    type="button"
                                                                    onClick={
                                                                        handleClearNotes
                                                                    }
                                                                    style={{
                                                                        border:
                                                                            "1px solid #e4e0f2",

                                                                        background:
                                                                            "#fff",

                                                                        color:
                                                                            "#6f6980",

                                                                        borderRadius:
                                                                            "10px",

                                                                        padding:
                                                                            "9px 13px",

                                                                        fontWeight:
                                                                            700,

                                                                        cursor:
                                                                            "pointer"
                                                                    }}
                                                                >
                                                                    Clear
                                                                </button>


                                                                <button
                                                                    type="button"
                                                                    onClick={
                                                                        handleSaveNotes
                                                                    }
                                                                    style={{
                                                                        border:
                                                                            "none",

                                                                        background:
                                                                            "linear-gradient(135deg, #6847e8, #5135cf)",

                                                                        color:
                                                                            "#fff",

                                                                        borderRadius:
                                                                            "10px",

                                                                        padding:
                                                                            "9px 15px",

                                                                        fontWeight:
                                                                            800,

                                                                        cursor:
                                                                            "pointer",

                                                                        boxShadow:
                                                                            "0 8px 18px rgba(99, 74, 230, 0.20)"
                                                                    }}
                                                                >
                                                                    Save Notes
                                                                </button>

                                                            </div>

                                                        </div>

                                                    )}


                                                    {/* =================================================
                                                        COMPLETE LESSON
                                                    ================================================= */}

                                                    <div className="lesson-actions">

                                                        <button
                                                            type="button"
                                                            className={
                                                                activeContent.completed
                                                                    ? "lesson-complete-btn completed"
                                                                    : "lesson-complete-btn"
                                                            }
                                                            onClick={
                                                                handleCompleteLesson
                                                            }
                                                            disabled={
                                                                completingLesson ||
                                                                activeContent.completed
                                                            }
                                                        >

                                                            {completingLesson ? (

                                                                <>

                                                                    <span className="button-spinner" />

                                                                    Saving...

                                                                </>

                                                            ) : activeContent.completed ? (

                                                                <>
                                                                    ✓ Lesson Completed
                                                                </>

                                                            ) : (

                                                                <>
                                                                    ✓ Mark Lesson Complete
                                                                </>

                                                            )}

                                                        </button>

                                                    </div>

                                                </div>


                                                {/* =================================================
                                                    PREVIOUS / NEXT
                                                ================================================= */}

                                                <div className="lesson-navigation">

                                                    <button
                                                        type="button"
                                                        className="lesson-nav-btn"
                                                        onClick={
                                                            handlePreviousLesson
                                                        }
                                                        disabled={
                                                            isFirstLesson
                                                        }
                                                    >

                                                        ←

                                                        <span>
                                                            Previous
                                                        </span>

                                                    </button>


                                                    <div className="lesson-dots">

                                                        {hasVirtualSections
                                                            ? activeSections.map(
                                                                (
                                                                    section,
                                                                    index
                                                                ) => (

                                                                    <button
                                                                        type="button"
                                                                        key={
                                                                            `${section.title}-${index}`
                                                                        }
                                                                        className={
                                                                            index ===
                                                                            safeSectionIndex
                                                                                ? "lesson-dot active"
                                                                                : "lesson-dot"
                                                                        }
                                                                        onClick={() => {

                                                                            setActiveSectionIndex(
                                                                                index
                                                                            );

                                                                            setTimeout(
                                                                                () => {

                                                                                    document
                                                                                        .getElementById(
                                                                                            "lesson-viewer"
                                                                                        )
                                                                                        ?.scrollIntoView({
                                                                                            behavior:
                                                                                                "smooth",
                                                                                            block:
                                                                                                "start"
                                                                                        });

                                                                                },
                                                                                50
                                                                            );

                                                                        }}
                                                                        aria-label={
                                                                            `Go to learning step ${index + 1}`
                                                                        }
                                                                    />

                                                                )
                                                            )
                                                            : learningContents.map(
                                                                (
                                                                    _,
                                                                    index
                                                                ) => (

                                                                    <button
                                                                        type="button"
                                                                        key={
                                                                            index
                                                                        }
                                                                        className={
                                                                            index ===
                                                                            activeIndex
                                                                                ? "lesson-dot active"
                                                                                : "lesson-dot"
                                                                        }
                                                                        onClick={() =>
                                                                            handleSelectContent(
                                                                                learningContents[
                                                                                    index
                                                                                ],
                                                                                index
                                                                            )
                                                                        }
                                                                        aria-label={
                                                                            `Go to lesson ${index + 1}`
                                                                        }
                                                                    />

                                                                )
                                                            )}

                                                    </div>


                                                    <button
                                                        type="button"
                                                        className="lesson-nav-btn next"
                                                        onClick={
                                                            handleNextLesson
                                                        }
                                                        disabled={
                                                            isLastLesson &&
                                                            activeContent.completed
                                                        }
                                                    >

                                                        <span>

                                                            {
                                                                isLastLesson
                                                                    ? activeContent.completed
                                                                        ? "Completed"
                                                                        : "Finish Lesson"
                                                                    : "Next"
                                                            }

                                                        </span>

                                                        {
                                                            isLastLesson
                                                                ? "✓"
                                                                : "→"
                                                        }

                                                    </button>

                                                </div>

                                            </>

                                        ) : (

                                            <div className="viewer-empty">

                                                <div>
                                                    📖
                                                </div>

                                                <h3>
                                                    Select a lesson
                                                </h3>

                                                <p>
                                                    Choose a lesson from the left
                                                    to start learning.
                                                </p>

                                            </div>

                                        )}

                                    </div>

                                </div>

                            )}


                        {/* =================================================
                            NO CONTENT
                        ================================================= */}

                        {!contentLoading &&
                            !contentError &&
                            learningContents.length === 0 && (

                                <div className="content-empty">

                                    <div className="empty-icon">
                                        📚
                                    </div>

                                    <h3>
                                        Learning content is being prepared
                                    </h3>

                                    <p>
                                        Your module has been created,
                                        but learning lessons have not
                                        been added yet.
                                    </p>

                                </div>

                            )}

                    </section>


                    {/* =================================================
                        COMPLETE MODULE
                    ================================================= */}

                    <section
                        id="module-completion-card"
                        className={
                            status ===
                            "COMPLETED"
                                ? "completion-card completed"
                                : "completion-card"
                        }
                    >

                        <div className="completion-left">

                            <div className="completion-icon">

                                {
                                    status ===
                                    "COMPLETED"
                                        ? "✓"
                                        : "○"
                                }

                            </div>


                            <div>

                                <span className="eyebrow">

                                    {
                                        status ===
                                        "COMPLETED"
                                            ? "MODULE COMPLETED"
                                            : "READY TO FINISH?"
                                    }

                                </span>


                                <h3>

                                    {
                                        status ===
                                        "COMPLETED"
                                            ? "Excellent work! 🎉"
                                            : "Complete this module"
                                    }

                                </h3>


                                <p>

                                    {
                                        status ===
                                        "COMPLETED"
                                            ? "Your progress has been saved successfully. You can continue with the next module."
                                            : "Finish the lessons and mark this module complete when you're ready."
                                    }

                                </p>

                            </div>

                        </div>


                        {status !== "COMPLETED" && (

                            <button
                                className="complete-btn"
                                onClick={
                                    handleComplete
                                }
                                disabled={
                                    completing
                                }
                            >

                                {completing ? (

                                    <>

                                        <span className="button-spinner" />

                                        Completing...

                                    </>

                                ) : (

                                    <>
                                        ✓
                                        Mark Complete
                                    </>

                                )}

                            </button>

                        )}

                    </section>

                </div>


                {/* =================================================
                    RIGHT SIDEBAR
                ================================================= */}

                <aside className="module-sidebar">


                    {/* =================================================
                        PROGRESS
                    ================================================= */}

                    <section className="sidebar-card">

                        <span className="eyebrow">
                            YOUR PROGRESS
                        </span>

                        <h3>
                            Module Progress
                        </h3>


                        <div className="sidebar-progress">

                            <div
                                className="sidebar-progress-fill"
                                style={{
                                    width:
                                        `${progressValue}%`
                                }}
                            />

                        </div>


                        <div className="sidebar-progress-row">

                            <strong>
                                {progressValue}%
                            </strong>

                            <span>
                                {
                                    progressLoading
                                        ? "Updating..."
                                        : "completed"
                                }
                            </span>

                        </div>

                    </section>


                    {/* =================================================
                        MODULE DETAILS
                    ================================================= */}

                    <section className="sidebar-card">

                        <span className="eyebrow">
                            MODULE DETAILS
                        </span>

                        <h3>
                            Quick Info
                        </h3>


                        <div className="details-list">

                            <div className="detail-row">

                                <span>
                                    Week
                                </span>

                                <strong>
                                    {week}
                                </strong>

                            </div>


                            <div className="detail-row">

                                <span>
                                    Lessons
                                </span>

                                <strong>
                                    {
                                        learningContents.length
                                    }
                                </strong>

                            </div>


                            <div className="detail-row">

                                <span>
                                    Topics
                                </span>

                                <strong>
                                    {
                                        topicArray.length
                                    }
                                </strong>

                            </div>


                            <div className="detail-row">

                                <span>
                                    Status
                                </span>

                                <strong
                                    className={
                                        status ===
                                        "COMPLETED"
                                            ? "status-success"
                                            : "status-warning"
                                    }
                                >

                                    {
                                        status ===
                                        "COMPLETED"
                                            ? "Completed"
                                            : status ===
                                              "IN_PROGRESS"
                                                ? "In Progress"
                                                : "Not Started"
                                    }

                                </strong>

                            </div>

                        </div>

                    </section>


                    {/* =================================================
                        LEARNING JOURNEY
                    ================================================= */}

                    <section className="sidebar-card journey-card">

                        <div className="journey-icon">
                            🎯
                        </div>

                        <span className="eyebrow">
                            LEARNING JOURNEY
                        </span>

                        <h3>
                            One step at a time
                        </h3>

                        <p>
                            Complete each lesson and keep
                            building your knowledge toward
                            your career goal.
                        </p>


                        <div className="journey-line">

                            <span className="journey-line-fill" />

                        </div>


                        <small>
                            {progressValue}% of this module completed
                        </small>

                    </section>


                    {/* =================================================
                        AI MENTOR
                    ================================================= */}

                    <section className="ai-mentor-card">

                        <div className="ai-mentor-glow" />


                        <div className="ai-mentor-icon">
                            ✦
                        </div>


                        <span>
                            AI MENTOR
                        </span>


                        <h3>
                            Stuck on something?
                        </h3>


                        <p>
                            Ask your AI Mentor to explain
                            a difficult concept or guide you
                            through this module.
                        </p>


                        <button
                            type="button"
                            onClick={
                                handleAskMentor
                            }
                        >

                            Ask AI Mentor

                            <span>
                                →
                            </span>

                        </button>

                    </section>

                </aside>

            </div>


            {/* =================================================
                BOTTOM NAVIGATION
            ================================================= */}

            <div className="module-bottom">

                <button
                    type="button"
                    onClick={
                        handleBack
                    }
                >

                    ←

                    <span>
                        Back to Roadmap
                    </span>

                </button>


                <span>
                    Keep learning. Keep progressing.
                </span>

            </div>

        </main>

    </div>

);

}

export default Module;

/* =====================================================
REAL-TIME PROGRESS INTEGRATION NOTE
Existing module UI, lesson flow, virtual sections,
content handling and styling structure are preserved.
Only the module-completion transition is changed so
progress is synchronized before returning to Roadmap.