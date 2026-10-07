import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Dashboard.css";

function Dashboard() {

    const navigate = useNavigate();

    /* =====================================================
       BACKEND DATA

       Currently everything is ZERO / EMPTY.
       Later API response yahan set karna hai.
    ===================================================== */

    const [dashboard, setDashboard] = useState({
        userName: "",

        overallProgress: 0,
        completedModules: 0,
        totalModules: 0,
        remainingModules: 0,

        currentStreak: 0,
        totalStudyMinutes: 0,

        careerGoal: "",
        roadmapDescription: "",
        roadmapProgress: 0,

        currentWeek: 0,
        totalWeeks: 0,

        nextModule: "",
        estimatedCompletion: "",

        continueModule: "",
        continueDescription: "",
        continueProgress: 0,

        recommendationTitle: "",
        recommendationDescription: "",

        skillStrength: [],

        performance: [],

        upcomingTasks: [],

        recentActivity: [],

        streakDays: []
    });


    /* =====================================================
       DASHBOARD ANALYTICS STATE

       These values are derived from the authenticated
       student's roadmap/progress response. Existing UI
       remains unchanged; this only feeds the existing cards.
    ===================================================== */

    const [dashboardAnalytics, setDashboardAnalytics] = useState({
        performance: [],
        skillStrength: [],
        upcomingTasks: [],
        recentActivity: [],
        streakDays: [],
        currentStreak: 0,
        bestStreak: 0
    });


    /* =====================================================
       REAL-TIME DASHBOARD DATA
       =====================================================

       Existing Dashboard UI is intentionally unchanged.

       The Dashboard now reads the authenticated student's
       roadmap and progress from the backend.

       Source of truth:

       1. /api/roadmaps/student
          -> authenticated student's roadmaps

       2. /api/roadmaps/{roadmapId}/modules
          -> modules belonging to that student's roadmap

       3. /api/roadmaps/{roadmapId}/progress
          -> server-calculated roadmap progress

       This prevents completion/progress from being treated
       as a global value shared by every user.
    ===================================================== */


    /*
     * =====================================================
     * SAFE NUMBER
     * =====================================================
     */
    const safeNumber = (
        value,
        fallback = 0
    ) => {

        const numberValue =
            Number(value);


        if (
            !Number.isFinite(
                numberValue
            )
        ) {

            return fallback;

        }


        return numberValue;

    };


    /*
     * =====================================================
     * SAFE STRING
     * =====================================================
     */
    const safeString = (
        value,
        fallback = ""
    ) => {

        if (
            value === null ||
            value === undefined
        ) {

            return fallback;

        }


        return String(
            value
        ).trim();

    };


    /*
     * =====================================================
     * NORMALIZE STATUS
     * =====================================================
     */
    const normalizeStatus = (
        status
    ) => {

        return safeString(
            status,
            "NOT_STARTED"
        ).toUpperCase();

    };


    /*
     * =====================================================
     * COMPLETED MODULE CHECK
     * =====================================================
     */
    const isModuleCompleted = (
        module
    ) => {

        if (!module) {

            return false;

        }


        const status =
            normalizeStatus(
                module.status
            );


        if (
            status === "COMPLETED" ||
            status === "DONE"
        ) {

            return true;

        }


        const moduleProgress =
            safeNumber(
                module?.progress ??
                module?.progressPercentage ??
                module?.completionPercentage,
                0
            );


        return (
            moduleProgress >= 100
        );

    };


    /*
     * =====================================================
     * MODULE WEEK
     * =====================================================
     */
    const getModuleWeek = (
        module
    ) => {

        if (!module) {

            return 0;

        }


        return safeNumber(
            module?.weekNumber ??
            module?.week ??
            module?.weekNo ??
            module?.order ??
            0,
            0
        );

    };


    /*
     * =====================================================
     * MODULE TITLE
     * =====================================================
     */
    const getModuleTitle = (
        module
    ) => {

        if (!module) {

            return "";

        }


        return safeString(
            module?.title ??
            module?.name ??
            module?.moduleTitle,
            ""
        );

    };


    /*
     * =====================================================
     * MODULE DESCRIPTION
     * =====================================================
     */
    const getModuleDescription = (
        module
    ) => {

        if (!module) {

            return "";

        }


        return safeString(
            module?.description ??
            module?.overview ??
            module?.summary,
            ""
        );

    };


    /*
     * =====================================================
     * SORT ROADMAP MODULES
     * =====================================================
     *
     * Never assume module IDs are sequential.
     * The learning order is based on week/order.
     */
    const sortRoadmapModules = (
        modules = []
    ) => {

        if (
            !Array.isArray(
                modules
            )
        ) {

            return [];

        }


        return [
            ...modules
        ].sort(
            (a, b) => {

                const weekA =
                    getModuleWeek(
                        a
                    );


                const weekB =
                    getModuleWeek(
                        b
                    );


                if (
                    weekA !== weekB
                ) {

                    return (
                        weekA -
                        weekB
                    );

                }


                return (
                    safeNumber(
                        a?.id,
                        0
                    ) -
                    safeNumber(
                        b?.id,
                        0
                    )
                );

            }
        );

    };


    /*
     * =====================================================
     * NORMALIZE ROADMAP RESPONSE
     * =====================================================
     */
    const normalizeRoadmaps = (
        data
    ) => {

        if (
            Array.isArray(
                data
            )
        ) {

            return data;

        }


        if (
            Array.isArray(
                data?.roadmaps
            )
        ) {

            return data.roadmaps;

        }


        if (
            data?.id
        ) {

            return [
                data
            ];

        }


        return [];

    };


    /*
     * =====================================================
     * NORMALIZE MODULE RESPONSE
     * =====================================================
     */
    const normalizeModules = (
        data
    ) => {

        if (
            Array.isArray(
                data
            )
        ) {

            return data;

        }


        if (
            Array.isArray(
                data?.modules
            )
        ) {

            return data.modules;

        }


        return [];

    };


    /*
     * =====================================================
     * PICK ACTIVE ROADMAP
     * =====================================================
     *
     * The /student endpoint is already scoped to the
     * authenticated user. A stored roadmap ID is only
     * accepted when it actually belongs to that response.
     */
    const pickActiveRoadmap = (
        roadmaps
    ) => {

        if (
            !Array.isArray(
                roadmaps
            ) ||
            roadmaps.length === 0
        ) {

            return null;

        }


        const storedRoadmapId =
            safeString(
                localStorage.getItem(
                    "generatedRoadmapId"
                ),
                ""
            );


        if (
            storedRoadmapId
        ) {

            const matchingRoadmap =
                roadmaps.find(
                    roadmap =>
                        String(
                            roadmap?.id
                        ) ===
                        storedRoadmapId
                );


            if (
                matchingRoadmap
            ) {

                return matchingRoadmap;

            }

        }


        /*
         * Latest roadmap returned by the student-scoped
         * endpoint is the safe fallback.
         */
        return (
            roadmaps[
                roadmaps.length - 1
            ] || null
        );

    };


    /*
     * =====================================================
     * NORMALIZE PROGRESS
     * =====================================================
     */
    const calculateProgressSummary = (
        progressData,
        modules
    ) => {

        const moduleList =
            Array.isArray(
                modules
            )
                ? modules
                : [];


        const totalFromBackend =
            safeNumber(
                progressData?.totalModules,
                -1
            );


        const totalModules =
            totalFromBackend >= 0
                ? totalFromBackend
                : moduleList.length;


        const completedFromBackend =
            safeNumber(
                progressData?.completedModules,
                -1
            );


        const completedModules =
            completedFromBackend >= 0
                ? completedFromBackend
                : moduleList.filter(
                    isModuleCompleted
                ).length;


        const remainingFromBackend =
            safeNumber(
                progressData?.remainingModules,
                -1
            );


        const remainingModules =
            remainingFromBackend >= 0
                ? remainingFromBackend
                : Math.max(
                    totalModules -
                    completedModules,
                    0
                );


        const calculatedProgress =
            totalModules > 0
                ? Math.round(
                    (
                        completedModules /
                        totalModules
                    ) *
                    100
                )
                : 0;


        const backendProgress =
            safeNumber(
                progressData?.progressPercentage,
                -1
            );


        const overallProgress =
            backendProgress >= 0
                ? Math.min(
                    100,
                    Math.max(
                        0,
                        backendProgress
                    )
                )
                : calculatedProgress;


        return {

            totalModules,

            completedModules,

            remainingModules,

            overallProgress

        };

    };


    /*
     * =====================================================
     * BUILD DASHBOARD ANALYTICS
     * =====================================================
     *
     * Uses backend values whenever they are available and
     * derives the remaining dashboard widgets from the same
     * authenticated student's roadmap modules. No global or
     * hard-coded student data is introduced.
     */
    const buildDashboardAnalytics = (
        modules = [],
        progressData = null
    ) => {

        const moduleList = Array.isArray(modules)
            ? modules
            : [];

        const getModuleProgressValue = (module) => {
            const status = normalizeStatus(module?.status);

            if (status === "COMPLETED" || status === "DONE") {
                return 100;
            }

            return Math.min(
                100,
                Math.max(
                    0,
                    safeNumber(
                        module?.progress ??
                        module?.progressPercentage ??
                        module?.completionPercentage ??
                        module?.completion ??
                        0,
                        0
                    )
                )
            );
        };

        const completedModules = moduleList.filter(
            module => getModuleProgressValue(module) >= 100
        );

        const incompleteModules = moduleList.filter(
            module => getModuleProgressValue(module) < 100
        );

        /* -----------------------------------------------------
           PERFORMANCE
           Backend performance history is preferred when present.
        ----------------------------------------------------- */
        let performanceSource =
            progressData?.performance ??
            progressData?.performanceHistory ??
            progressData?.weeklyProgress ??
            progressData?.progressHistory ??
            progressData?.history ??
            [];

        if (!Array.isArray(performanceSource)) {
            performanceSource = [];
        }

        let performance = performanceSource
            .map((item, index) => {
                const value = safeNumber(
                    item?.value ??
                    item?.score ??
                    item?.progress ??
                    item?.percentage ??
                    item?.progressPercentage,
                    0
                );

                return {
                    label:
                        item?.label ??
                        item?.month ??
                        item?.week ??
                        `W${index + 1}`,
                    value: Math.round(
                        Math.min(100, Math.max(0, value))
                    )
                };
            })
            .filter(item => Number.isFinite(item.value));

        if (performance.length === 0) {
            performance = moduleList
                .slice(0, 8)
                .map((module, index) => ({
                    label:
                        getModuleWeek(module) > 0
                            ? `W${getModuleWeek(module)}`
                            : `${index + 1}`,
                    value: Math.round(
                        getModuleProgressValue(module)
                    )
                }));
        }

        /* -----------------------------------------------------
           SKILL STRENGTH
           Uses explicit skill/technology fields first, then
           safely identifies common technologies from titles.
        ----------------------------------------------------- */
        const skillMap = new Map();

        const addSkillValue = (name, value) => {
            const cleanName = safeString(name, "");

            if (!cleanName) return;

            const key = cleanName.toLowerCase();

            if (!skillMap.has(key)) {
                skillMap.set(key, {
                    name: cleanName,
                    total: 0,
                    count: 0
                });
            }

            const entry = skillMap.get(key);
            entry.total += value;
            entry.count += 1;
        };

        moduleList.forEach(module => {
            const value = getModuleProgressValue(module);

            const explicitSkills =
                module?.skills ??
                module?.skillNames ??
                module?.technologies ??
                module?.technology ??
                module?.skillName ??
                module?.skill?.name;

            if (Array.isArray(explicitSkills)) {
                explicitSkills.forEach(skill => {
                    addSkillValue(
                        typeof skill === "object"
                            ? skill?.name ?? skill?.title
                            : skill,
                        value
                    );
                });
            } else if (explicitSkills) {
                addSkillValue(explicitSkills, value);
            }

            const searchableText =
                `${getModuleTitle(module)} ${getModuleDescription(module)}`
                    .toLowerCase();

            const knownSkills = [
                "Java",
                "Spring Boot",
                "React",
                "JavaScript",
                "SQL",
                "DBMS",
                "DSA",
                "Git",
                "Docker",
                "AWS",
                "HTML",
                "CSS",
                "Hibernate",
                "REST API",
                "System Design"
            ];

            knownSkills.forEach(skill => {
                if (searchableText.includes(skill.toLowerCase())) {
                    addSkillValue(skill, value);
                }
            });
        });

        const skillStrength = Array.from(skillMap.values())
            .map(entry => ({
                name: entry.name,
                value: Math.round(
                    entry.count > 0
                        ? entry.total / entry.count
                        : 0
                )
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6);

        /* -----------------------------------------------------
           UPCOMING TASKS
        ----------------------------------------------------- */
        const upcomingTasks = incompleteModules
            .slice(0, 4)
            .map((module, index) => ({
                title:
                    getModuleTitle(module) ||
                    `Learning Module ${index + 1}`,
                due:
                    getModuleProgressValue(module) > 0
                        ? "Continue today"
                        : index === 0
                            ? "Recommended next"
                            : getModuleWeek(module) > 0
                                ? `Week ${getModuleWeek(module)}`
                                : "Upcoming",
                priority:
                    index === 0
                        ? "High"
                        : index === 1
                            ? "Medium"
                            : "Low"
            }));

        /* -----------------------------------------------------
           RECENT ACTIVITY
           If backend activity exists, preserve it. Otherwise
           completed roadmap modules provide meaningful history.
        ----------------------------------------------------- */
        let recentActivitySource =
            progressData?.recentActivity ??
            progressData?.activities ??
            progressData?.activity ??
            [];

        if (!Array.isArray(recentActivitySource)) {
            recentActivitySource = [];
        }

        let recentActivity = recentActivitySource
            .slice(0, 5)
            .map(item => ({
                title:
                    item?.title ??
                    item?.description ??
                    item?.activity ??
                    "Learning activity",
                time:
                    item?.time ??
                    item?.relativeTime ??
                    item?.createdAt ??
                    "Recently"
            }));

        if (recentActivity.length === 0) {
            recentActivity = completedModules
                .slice(-5)
                .reverse()
                .map((module, index) => ({
                    title:
                        `Completed: ${
                            getModuleTitle(module) ||
                            "Learning Module"
                        }`,
                    time:
                        index === 0
                            ? "Recently completed"
                            : `${index + 1} learning days ago`
                }));
        }

        /* -----------------------------------------------------
           STREAK
           Prefer backend streak fields. If unavailable, use
           completion activity only as a conservative fallback.
        ----------------------------------------------------- */
        const currentStreak = Math.max(
            0,
            Math.round(
                safeNumber(
                    progressData?.currentStreak ??
                    progressData?.streak ??
                    progressData?.currentStreakDays ??
                    dashboard.currentStreak,
                    0
                )
            )
        );

        const bestStreak = Math.max(
            currentStreak,
            Math.round(
                safeNumber(
                    progressData?.bestStreak ??
                    progressData?.longestStreak ??
                    progressData?.bestStreakDays,
                    currentStreak
                )
            )
        );

       /*
 * -----------------------------------------------------
 * STREAK DAYS
 * -----------------------------------------------------
 * Backend returns activityDates.
 *
 * The existing M T W T F S S UI is kept unchanged.
 * Only the active state is calculated from actual
 * learning activity dates.
 */
const activityDates = Array.isArray(
    progressData?.activityDates
)
    ? progressData.activityDates
    : [];

const parseActivityDate = (value) => {

    if (!value) {
        return null;
    }

    const parts = String(value).split("-");

    if (parts.length !== 3) {
        return null;
    }

    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);

    if (
        !Number.isInteger(year) ||
        !Number.isInteger(month) ||
        !Number.isInteger(day)
    ) {
        return null;
    }

    return new Date(
        year,
        month - 1,
        day
    );
};

const today = new Date();

/*
 * JavaScript:
 * Sunday = 0
 * Monday = 1
 * ...
 *
 * Convert it so Monday becomes index 0.
 */
const todayDayIndex =
    (today.getDay() + 6) % 7;

const monday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - todayDayIndex
);

const activityDateSet =
    new Set(
        activityDates
            .map(parseActivityDate)
            .filter(Boolean)
            .map(date =>
                `${date.getFullYear()}-${String(
                    date.getMonth() + 1
                ).padStart(2, "0")}-${String(
                    date.getDate()
                ).padStart(2, "0")}`
            )
    );

const streakDays = [
    "M", "T", "W", "T", "F", "S", "S"
].map((_, index) => {

    const date = new Date(
        monday.getFullYear(),
        monday.getMonth(),
        monday.getDate() + index
    );

    const dateKey =
        `${date.getFullYear()}-${String(
            date.getMonth() + 1
        ).padStart(2, "0")}-${String(
            date.getDate()
        ).padStart(2, "0")}`;

    return activityDateSet.has(
        dateKey
    );
});

        return {
            performance,
            skillStrength,
            upcomingTasks,
            recentActivity,
            streakDays,
            currentStreak,
            bestStreak
        };
    };


    /*
     * =====================================================
     * LOAD AUTHENTICATED STUDENT ROADMAP
     * =====================================================
     *
     * This is the main Dashboard data synchronization
     * function. It only updates existing React state.
     */
    const loadDashboardRoadmapState =
        async () => {

            try {

                console.log(
                    "===================================="
                );

                console.log(
                    "DASHBOARD ROADMAP SYNC"
                );

                console.log(
                    "===================================="
                );


                /*
                 * STEP 1:
                 * Get only the current authenticated user's
                 * roadmaps.
                 */
                const roadmapResponse =
                    await api.get(
                        "/api/roadmaps/student"
                    );


                const roadmaps =
                    normalizeRoadmaps(
                        roadmapResponse?.data
                    );


                const activeRoadmap =
                    pickActiveRoadmap(
                        roadmaps
                    );


                /*
                 * No roadmap yet.
                 *
                 * Preserve the existing Dashboard UI and
                 * simply keep roadmap values empty.
                 */
                if (
                    !activeRoadmap?.id
                ) {

                    setDashboard(
                        previous => ({

                            ...previous,

                            overallProgress: 0,

                            completedModules: 0,

                            totalModules: 0,

                            remainingModules: 0,

                            roadmapDescription: "",

                            roadmapProgress: 0,

                            currentWeek: 0,

                            totalWeeks: 0,

                            nextModule: "",

                            estimatedCompletion: "",

                            continueModule: "",

                            continueDescription: "",

                            continueProgress: 0,

                            skillStrength: [],

                            performance: [],

                            upcomingTasks: [],

                            recentActivity: [],

                            streakDays: [],

                            currentStreak: 0,

                            bestStreak: 0

                        })
                    );


                    return;

                }


                const roadmapId =
                    activeRoadmap.id;


                /*
                 * Store only the roadmap returned for the
                 * currently authenticated user.
                 */
                localStorage.setItem(
                    "generatedRoadmapId",
                    String(
                        roadmapId
                    )
                );


                /*
                 * STEP 2:
                 * Get this roadmap's modules.
                 */
                const modulesResponse =
                    await api.get(
                        `/api/roadmaps/${roadmapId}/modules`
                    );


                const modules =
                    sortRoadmapModules(
                        normalizeModules(
                            modulesResponse?.data
                        )
                    );


                /*
                 * STEP 3:
                 * Get backend-calculated roadmap progress.
                 *
                 * If this endpoint temporarily fails,
                 * modules are still sufficient for a safe
                 * fallback calculation.
                 */
                let progressData =
                    null;


                try {

                    const progressResponse =
                        await api.get(
                            `/api/roadmaps/${roadmapId}/progress`
                        );


                    progressData =
                        progressResponse?.data ||
                        null;

                } catch (
                    progressError
                ) {

                    console.warn(
                        "Dashboard progress API unavailable. Using module fallback.",
                        progressError
                    );

                }


                const summary =
                    calculateProgressSummary(
                        progressData,
                        modules
                    );


                /*
                 * Build the existing Dashboard widgets from the
                 * same authenticated roadmap/progress data.
                 */
                const analytics =
                    buildDashboardAnalytics(
                        modules,
                        progressData
                    );


                /*
                 * STEP 4:
                 * Current module is the first module that
                 * is not completed.
                 */
                const currentModule =
                    modules.find(
                        module =>
                            !isModuleCompleted(
                                module
                            )
                    ) || null;


                /*
                 * STEP 5:
                 * Next module is the next module after the
                 * current module in roadmap order.
                 */
                let nextModule =
                    null;


                if (
                    currentModule?.id
                ) {

                    const currentIndex =
                        modules.findIndex(
                            module =>
                                String(
                                    module?.id
                                ) ===
                                String(
                                    currentModule.id
                                )
                        );


                    if (
                        currentIndex >= 0 &&
                        currentIndex <
                            modules.length - 1
                    ) {

                        nextModule =
                            modules[
                                currentIndex + 1
                            ];

                    }

                }


                /*
                 * If all modules are complete, there is no
                 * next module.
                 */
                if (
                    !currentModule
                ) {

                    nextModule = null;

                }


                /*
                 * STEP 6:
                 * Resolve existing display data.
                 *
                 * These values feed the EXISTING JSX only.
                 * No new Dashboard UI is being introduced.
                 */
                const roadmapTitle =
                    safeString(
                        activeRoadmap?.title,
                        ""
                    );


                const roadmapDescription =
                    safeString(
                        activeRoadmap?.description,
                        ""
                    );


                const currentWeek =
                    currentModule
                        ? getModuleWeek(
                            currentModule
                        )
                        : summary.totalModules;


                const totalWeeks =
                    safeNumber(
                        activeRoadmap?.durationWeeks,
                        summary.totalModules
                    );


                const currentModuleTitle =
                    currentModule
                        ? getModuleTitle(
                            currentModule
                        )
                        : "";


                const currentModuleDescription =
                    currentModule
                        ? getModuleDescription(
                            currentModule
                        )
                        : "";


                const nextModuleTitle =
                    nextModule
                        ? getModuleTitle(
                            nextModule
                        )
                        : "";


                /*
                 * STEP 7:
                 * Keep the existing state object intact and
                 * update only values that the Dashboard already
                 * renders.
                 */
                setDashboard(
                    previous => ({

                        ...previous,

                        overallProgress:
                            summary.overallProgress,

                        completedModules:
                            summary.completedModules,

                        totalModules:
                            summary.totalModules,

                        remainingModules:
                            summary.remainingModules,

                        careerGoal:
                            roadmapTitle ||
                            previous.careerGoal,

                        roadmapDescription:
                            roadmapDescription ||
                            previous.roadmapDescription,

                        roadmapProgress:
                            summary.overallProgress,

                        currentWeek:
                            currentWeek,

                        totalWeeks:
                            totalWeeks,

                        nextModule:
                            nextModuleTitle ||
                            (
                                !currentModule &&
                                summary.totalModules > 0
                                    ? "All modules completed"
                                    : "Not available"
                            ),

                        estimatedCompletion:
                            currentModule
                                ? `Week ${currentWeek} of ${totalWeeks}`
                                : (
                                    summary.totalModules > 0 &&
                                    summary.completedModules ===
                                        summary.totalModules
                                )
                                    ? "Completed"
                                    : previous.estimatedCompletion,

                        continueModule:
                            currentModuleTitle ||
                            (
                                !currentModule &&
                                summary.totalModules > 0 &&
                                summary.completedModules ===
                                    summary.totalModules
                                    ? "Roadmap completed"
                                    : previous.continueModule
                            ),

                        continueDescription:
                            currentModuleDescription ||
                            roadmapDescription ||
                            previous.continueDescription,

                        continueProgress:
                            summary.overallProgress,

                        recommendationTitle:
                            currentModule
                                ? `Continue Week ${currentWeek}`
                                : (
                                    summary.totalModules > 0 &&
                                    summary.completedModules ===
                                        summary.totalModules
                                )
                                    ? "Roadmap completed"
                                    : previous.recommendationTitle,

                        recommendationDescription:
                            currentModule
                                ? `Continue ${currentModuleTitle} to keep your learning progress moving forward.`
                                : (
                                    summary.totalModules > 0 &&
                                    summary.completedModules ===
                                        summary.totalModules
                                )
                                    ? "Excellent work. You have completed your personalized learning roadmap."
                                    : previous.recommendationDescription,

                        skillStrength:
                            analytics.skillStrength,

                        performance:
                            analytics.performance,

                        upcomingTasks:
                            analytics.upcomingTasks,

                        recentActivity:
                            analytics.recentActivity,

                        streakDays:
                            analytics.streakDays,

                        currentStreak:
                            analytics.currentStreak,

                        bestStreak:
                            analytics.bestStreak

                    })
                );


                console.log(
                    "DASHBOARD ROADMAP SYNC COMPLETE:",
                    {

                        roadmapId,

                        totalModules:
                            summary.totalModules,

                        completedModules:
                            summary.completedModules,

                        remainingModules:
                            summary.remainingModules,

                        overallProgress:
                            summary.overallProgress,

                        currentWeek

                    }
                );


            } catch (
                dashboardError
            ) {

                /*
                 * Important:
                 * A dashboard refresh failure must not destroy
                 * or clear existing visible data.
                 *
                 * The existing Dashboard remains usable and
                 * another refresh will retry automatically.
                 */
                console.error(
                    "Dashboard roadmap sync failed:",
                    dashboardError
                );

            }

        };


    /*
     * =====================================================
     * REAL-TIME DASHBOARD SYNC
     * =====================================================
     *
     * Module.jsx dispatches a custom event after successful
     * completion. The Dashboard reacts immediately.
     *
     * Additional focus/visibility/polling listeners provide
     * safe fallback behaviour for:
     *
     * - another browser tab
     * - another window
     * - returning from a module
     * - temporary event delivery issues
     */
    useEffect(() => {

        let refreshTimer =
            null;


        /*
         * Initial dashboard load.
         */
        loadDashboardRoadmapState();


        /*
         * Immediate refresh after module completion.
         */
        const handleLearningProgressUpdated =
            (
                event
            ) => {

                console.log(
                    "Dashboard progress event received:",
                    event?.detail
                );


                loadDashboardRoadmapState();

            };


        /*
         * Refresh whenever the window becomes focused.
         */
        const handleWindowFocus =
            () => {

                loadDashboardRoadmapState();

            };


        /*
         * Refresh whenever the tab becomes visible.
         */
        const handleVisibilityChange =
            () => {

                if (
                    document.visibilityState ===
                    "visible"
                ) {

                    loadDashboardRoadmapState();

                }

            };


        /*
         * Listen globally for Module completion.
         */
        window.addEventListener(
            "learning-progress-updated",
            handleLearningProgressUpdated
        );


        /*
         * Window focus fallback.
         */
        window.addEventListener(
            "focus",
            handleWindowFocus
        );


        /*
         * Tab visibility fallback.
         */
        document.addEventListener(
            "visibilitychange",
            handleVisibilityChange
        );


        /*
         * Backend polling fallback.
         *
         * This keeps the Dashboard dynamically synchronized
         * even if a module is completed in another tab/window.
         */
        refreshTimer =
            window.setInterval(
                () => {

                    loadDashboardRoadmapState();

                },
                5000
            );


        /*
         * Clean every listener/timer when Dashboard unmounts.
         */
        return () => {

            window.removeEventListener(
                "learning-progress-updated",
                handleLearningProgressUpdated
            );


            window.removeEventListener(
                "focus",
                handleWindowFocus
            );


            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );


            if (
                refreshTimer
            ) {

                window.clearInterval(
                    refreshTimer
                );

            }

        };

    }, []);


        /* =====================================================
       HELPERS
    ===================================================== */

    const formatStudyTime = (minutes = 0) => {

        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;

        return `${hours}h ${mins}m`;
    };


    const progress =
        Number(
            dashboard.overallProgress ||
            0
        );


    /*
     * =====================================================
     * EXISTING DISPLAY SAFETY HELPERS
     * =====================================================
     *
     * These helpers do not change the visual design.
     * They only normalize data before it is displayed.
     */


    const normalizedProgress =
        Math.min(
            100,
            Math.max(
                0,
                safeNumber(
                    progress,
                    0
                )
            )
        );


    const normalizedCompletedModules =
        Math.max(
            0,
            safeNumber(
                dashboard.completedModules,
                0
            )
        );


    const normalizedTotalModules =
        Math.max(
            0,
            safeNumber(
                dashboard.totalModules,
                0
            )
        );


    const normalizedRemainingModules =
        Math.max(
            0,
            safeNumber(
                dashboard.remainingModules,
                0
            )
        );


    const normalizedRoadmapProgress =
        Math.min(
            100,
            Math.max(
                0,
                safeNumber(
                    dashboard.roadmapProgress,
                    0
                )
            )
        );


    /*
     * Existing JSX still uses `dashboard` so the UI structure
     * remains byte-for-byte conceptually unchanged.
     *
     * These values simply document the normalized calculations
     * and provide safe fallbacks for future Dashboard widgets.
     */
    const hasActiveRoadmap =
        normalizedTotalModules >
        0;


    const hasCompletedRoadmap =
        hasActiveRoadmap &&
        normalizedCompletedModules >=
            normalizedTotalModules;


    const dashboardStatus =
        hasCompletedRoadmap
            ? "COMPLETED"
            : normalizedProgress > 0
                ? "IN_PROGRESS"
                : "NOT_STARTED";


    const currentWeekLabel =
        dashboard.currentWeek > 0
            ? `Week ${dashboard.currentWeek}`
            : "Not started";


    const progressLabel =
        `${Math.round(
            normalizedProgress
        )}%`;


        return (

        <div className="dashboard-page">

            {/* =================================================
                HEADER / GREETING
            ================================================= */}

            <section className="dashboard-header">

                <div>

                    <span className="dashboard-welcome">
                        Welcome back,
                    </span>

                    <h1>
                        Hi, {dashboard.userName || "Student"}! 👋
                    </h1>

                    <p>
                        Continue your learning journey and achieve your goals.
                    </p>

                </div>


                <button
                    className="continue-learning-btn"
                    onClick={() => navigate("/roadmap")}
                >
                    <i className="bi bi-play-circle"></i>

                    Continue Learning

                    <i className="bi bi-arrow-right"></i>
                </button>

            </section>


            {/* =================================================
                STAT CARDS
            ================================================= */}

            <section className="stats-grid">


                {/* OVERALL */}

                <div className="stat-card">

                    <div className="progress-circle">

                        <svg viewBox="0 0 42 42">

                            <circle
                                className="progress-bg"
                                cx="21"
                                cy="21"
                                r="17"
                            />

                            <circle
                                className="progress-value"
                                cx="21"
                                cy="21"
                                r="17"
                                style={{
                                    strokeDasharray: `${progress} 100`
                                }}
                            />

                        </svg>

                        <span>
                            {progress}%
                        </span>

                    </div>


                    <div className="stat-info">

                        <span className="stat-label">
                            Overall Progress
                        </span>

                        <strong>
                            {progress}%
                        </strong>

                        <small>
                            {dashboard.completedModules} of{" "}
                            {dashboard.totalModules} modules
                        </small>

                    </div>

                </div>


                {/* COMPLETED */}

                <div className="stat-card">

                    <div className="stat-icon green">
                        <i className="bi bi-check2-circle"></i>
                    </div>

                    <div className="stat-info">

                        <span className="stat-label">
                            Completed
                        </span>

                        <strong>
                            {dashboard.completedModules}
                        </strong>

                        <small>
                            Modules completed
                        </small>

                    </div>

                </div>


                {/* REMAINING */}

                <div className="stat-card">

                    <div className="stat-icon orange">
                        <i className="bi bi-hourglass-split"></i>
                    </div>

                    <div className="stat-info">

                        <span className="stat-label">
                            Remaining
                        </span>

                        <strong>
                            {dashboard.remainingModules}
                        </strong>

                        <small>
                            Modules left
                        </small>

                    </div>

                </div>


                {/* STREAK */}

                <div className="stat-card">

                    <div className="stat-icon red">
                        <i className="bi bi-fire"></i>
                    </div>

                    <div className="stat-info">

                        <span className="stat-label">
                            Current Streak
                        </span>

                        <strong>
                            {dashboard.currentStreak} days
                        </strong>

                        <small>
                            Keep it up!
                        </small>

                    </div>

                </div>


                {/* STUDY TIME */}

                <div className="stat-card">

                    <div className="stat-icon blue">
                        <i className="bi bi-clock"></i>
                    </div>

                    <div className="stat-info">

                        <span className="stat-label">
                            Total Study Time
                        </span>

                        <strong>
                            {formatStudyTime(
                                dashboard.totalStudyMinutes
                            )}
                        </strong>

                        <small>
                            This month
                        </small>

                    </div>

                </div>

            </section>


            {/* =================================================
                MAIN DASHBOARD GRID
            ================================================= */}

            <section className="dashboard-grid">


                {/* =================================================
                    LEFT COLUMN
                ================================================= */}

                <div className="dashboard-left">


                    {/* ROADMAP */}

                    <div className="dashboard-card roadmap-card">

                        <div className="card-header">

                            <h2>
                                Your Learning Roadmap
                            </h2>

                            <button
                                className="text-button"
                                onClick={() => navigate("/roadmap")}
                            >
                                View Full Roadmap
                                <i className="bi bi-arrow-right"></i>
                            </button>

                        </div>


                        <div className="roadmap-main">

                            <div className="roadmap-icon">
                                <i className="bi bi-code-slash"></i>
                            </div>


                            <div className="roadmap-details">

                                <h3>
                                    {dashboard.careerGoal ||
                                        "Your Career Roadmap"}
                                </h3>

                                <p>
                                    {dashboard.roadmapDescription ||
                                        "Your personalized learning roadmap will appear here."}
                                </p>


                                <div className="roadmap-progress">

                                    <div className="progress-track">

                                        <div
                                            className="progress-fill"
                                            style={{
                                                width: `${dashboard.roadmapProgress || 0}%`
                                            }}
                                        />

                                    </div>

                                    <div className="progress-meta">

                                        <span>
                                            {dashboard.roadmapProgress || 0}% Complete
                                        </span>

                                        <span>
                                            {dashboard.completedModules} of{" "}
                                            {dashboard.totalModules} modules
                                        </span>

                                    </div>

                                </div>

                            </div>

                        </div>


                        <div className="roadmap-meta">

                            <div>
                                <span>
                                    <i className="bi bi-calendar3"></i>
                                    Current Week
                                </span>

                                <strong>
                                    Week {dashboard.currentWeek || 0} of{" "}
                                    {dashboard.totalWeeks || 0}
                                </strong>
                            </div>


                            <div>
                                <span>
                                    <i className="bi bi-book"></i>
                                    Next Module
                                </span>

                                <strong>
                                    {dashboard.nextModule || "Not available"}
                                </strong>
                            </div>


                            <div>
                                <span>
                                    <i className="bi bi-clock"></i>
                                    Est. Completion
                                </span>

                                <strong>
                                    {dashboard.estimatedCompletion ||
                                        "Not available"}
                                </strong>
                            </div>

                        </div>

                    </div>


                    {/* AI RECOMMENDATION */}

                    <div className="dashboard-card recommendation-card">

                        <div className="recommendation-heading">

                            <i className="bi bi-stars"></i>

                            <div>

                                <h3>
                                    AI Recommendations
                                </h3>

                                <p>
                                    Based on your progress and performance
                                </p>

                            </div>

                        </div>


                        <div className="recommendation-box">

                            <div>

                                <h3>
                                    {dashboard.recommendationTitle ||
                                        "Personalized recommendation"}
                                </h3>

                                <p>
                                    {dashboard.recommendationDescription ||
                                        "AI recommendations will appear based on your learning progress."}
                                </p>

                            </div>


                            <button className="primary-small-btn">
                                Practice Now
                            </button>

                        </div>

                    </div>


                    {/* PERFORMANCE */}

                    <div className="dashboard-card performance-card">

                        <div className="card-header">

                            <div>

                                <h2>
                                    Performance Overview
                                </h2>

                                <p>
                                    Your performance over time
                                </p>

                            </div>

                            <button className="month-button">
                                This Month
                                <i className="bi bi-chevron-down"></i>
                            </button>

                        </div>


                        <div className="performance-chart">

                            <div className="chart-y">

                                <span>100%</span>
                                <span>75%</span>
                                <span>50%</span>
                                <span>25%</span>
                                <span>0%</span>

                            </div>


                            <div className="chart-area">

                                <div className="chart-line"></div>

                                {dashboard.performance?.length > 0 ? (

                                    <svg
                                        className="dashboard-performance-svg"
                                        viewBox="0 0 700 220"
                                        preserveAspectRatio="none"
                                        aria-label="Learning performance chart"
                                    >

                                        <defs>
                                            <linearGradient
                                                id="dashboardPerformanceFill"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="0%"
                                                    stopColor="#6c63ff"
                                                    stopOpacity="0.20"
                                                />
                                                <stop
                                                    offset="100%"
                                                    stopColor="#6c63ff"
                                                    stopOpacity="0"
                                                />
                                            </linearGradient>
                                        </defs>

                                        {(() => {
                                            const points =
                                                dashboard.performance
                                                    .slice(-8);

                                            const width = 700;
                                            const height = 220;
                                            const paddingX = 18;
                                            const paddingY = 18;
                                            const usableWidth =
                                                width - paddingX * 2;
                                            const usableHeight =
                                                height - paddingY * 2;

                                            const coordinates =
                                                points.map((item, index) => {
                                                    const x =
                                                        points.length === 1
                                                            ? width / 2
                                                            : paddingX +
                                                              (usableWidth * index) /
                                                              (points.length - 1);

                                                    const y =
                                                        height -
                                                        paddingY -
                                                        (Math.min(100, Math.max(0, Number(item.value) || 0)) / 100) *
                                                            usableHeight;

                                                    return {
                                                        ...item,
                                                        x,
                                                        y
                                                    };
                                                });

                                            const linePoints =
                                                coordinates
                                                    .map(point => `${point.x},${point.y}`)
                                                    .join(" ");

                                            const areaPoints =
                                                coordinates.length > 0
                                                    ? `${paddingX},${height - paddingY} ${linePoints} ${coordinates[coordinates.length - 1].x},${height - paddingY}`
                                                    : "";

                                            return (
                                                <>
                                                    <polygon
                                                        points={areaPoints}
                                                        fill="url(#dashboardPerformanceFill)"
                                                    />

                                                    <polyline
                                                        points={linePoints}
                                                        fill="none"
                                                        stroke="#6258dc"
                                                        strokeWidth="4"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />

                                                    {coordinates.map((point, index) => (
                                                        <circle
                                                            key={index}
                                                            cx={point.x}
                                                            cy={point.y}
                                                            r="5"
                                                            fill="#ffffff"
                                                            stroke="#6258dc"
                                                            strokeWidth="3"
                                                        />
                                                    ))}
                                                </>
                                            );
                                        })()}

                                    </svg>

                                ) : (

                                    <div className="chart-placeholder">
                                        <i className="bi bi-bar-chart"></i>

                                        <span>
                                            Complete roadmap modules to build your performance history
                                        </span>
                                    </div>

                                )}

                            </div>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    RIGHT COLUMN
                ================================================= */}

                <div className="dashboard-right">


                    {/* CONTINUE LEARNING */}

                    <div className="continue-card">

                        <div className="continue-top">

                            <span>
                                CONTINUE LEARNING
                            </span>

                            <i className="bi bi-stars"></i>

                        </div>


                        <h2>
                            {dashboard.continueModule ||
                                "Start your learning journey"}
                        </h2>

                        <p>
                            {dashboard.continueDescription ||
                                "Your next recommended learning module will appear here."}
                        </p>


                        <div className="continue-details">

                            <span>
                                <i className="bi bi-calendar"></i>
                                Week {dashboard.currentWeek || 0}
                            </span>

                            <span>
                                <i className="bi bi-clock"></i>
                                0 min
                            </span>

                            <span>
                                <i className="bi bi-bar-chart"></i>
                                Beginner
                            </span>

                        </div>


                        <button
                            onClick={() => navigate("/roadmap")}
                            className="start-learning-btn"
                        >
                            Start Learning

                            <i className="bi bi-play-fill"></i>
                        </button>

                    </div>


                    {/* STREAK */}

                    <div className="dashboard-card streak-card">

                        <div className="card-header">

                            <div>

                                <h2>
                                    Learning Streak
                                </h2>

                            </div>

                        </div>


                        <div className="streak-number">
                            {dashboard.currentStreak}
                            <span>days</span>
                        </div>

                        <small>
                            Current streak
                        </small>


                        <div className="streak-days">

                            {["M", "T", "W", "T", "F", "S", "S"].map(
                                (day, index) => {

                                    const active =
                                        dashboard.streakDays?.[index] ||
                                        false;

                                    return (

                                        <div
                                            className="streak-day"
                                            key={index}
                                        >

                                            <span>
                                                {day}
                                            </span>

                                            <div
                                                className={
                                                    active
                                                        ? "day-circle active"
                                                        : "day-circle"
                                                }
                                            >
                                                {active && (
                                                    <i className="bi bi-check"></i>
                                                )}
                                            </div>

                                        </div>

                                    );
                                }
                            )}

                        </div>


                        <p className="best-streak">
                            Best streak: {dashboard.bestStreak || dashboard.currentStreak || 0} days
                        </p>

                    </div>


                    {/* SKILL STRENGTH */}

                    <div className="dashboard-card">

                        <div className="card-header">

                            <div>

                                <h2>
                                    Skill Strength
                                </h2>

                                <p>
                                    Your skill levels
                                </p>

                            </div>

                        </div>


                        <div className="skills-list">

                            {dashboard.skillStrength.length === 0 ? (

                                <div className="empty-state">
                                    <i className="bi bi-bar-chart"></i>

                                    <span>
                                        Skill data will appear here
                                    </span>
                                </div>

                            ) : (

                                dashboard.skillStrength.map(
                                    (skill, index) => (

                                        <div
                                            className="skill-row"
                                            key={index}
                                        >

                                            <span>
                                                {skill.name}
                                            </span>

                                            <div className="skill-track">

                                                <div
                                                    style={{
                                                        width: `${skill.value || 0}%`
                                                    }}
                                                />

                                            </div>

                                            <strong>
                                                {skill.value || 0}%
                                            </strong>

                                        </div>

                                    )
                                )

                            )}

                        </div>

                    </div>


                    {/* UPCOMING TASKS */}

                    <div className="dashboard-card">

                        <div className="card-header">

                            <h2>
                                Upcoming Tasks
                            </h2>

                            <button
                                className="text-button"
                                type="button"
                                onClick={() => navigate("/roadmap")}
                            >
                                View all
                            </button>

                        </div>


                        <div className="tasks-list">

                            {dashboard.upcomingTasks.length === 0 ? (

                                <div className="empty-state">
                                    <i className="bi bi-check2-square"></i>

                                    <span>
                                        No upcoming tasks
                                    </span>
                                </div>

                            ) : (

                                dashboard.upcomingTasks.map(
                                    (task, index) => (

                                        <div
                                            className="task-item"
                                            key={index}
                                        >

                                            <div className="task-icon">
                                                <i className="bi bi-calendar-event"></i>
                                            </div>

                                            <div className="task-content">

                                                <strong>
                                                    {task.title}
                                                </strong>

                                                <span>
                                                    {task.due}
                                                </span>

                                            </div>

                                            <span className="priority">
                                                {task.priority}
                                            </span>

                                        </div>

                                    )
                                )

                            )}

                        </div>

                    </div>


                    {/* RECENT ACTIVITY */}

                    <div className="dashboard-card">

                        <div className="card-header">

                            <h2>
                                Recent Activity
                            </h2>

                            <button
                                className="text-button"
                                type="button"
                                onClick={() => navigate("/roadmap")}
                            >
                                View all
                            </button>

                        </div>


                        <div className="activity-list">

                            {dashboard.recentActivity.length === 0 ? (

                                <div className="empty-state">
                                    <i className="bi bi-clock-history"></i>

                                    <span>
                                        No recent activity
                                    </span>
                                </div>

                            ) : (

                                dashboard.recentActivity.map(
                                    (activity, index) => (

                                        <div
                                            className="activity-item"
                                            key={index}
                                        >

                                            <div className="activity-icon">
                                                <i className="bi bi-check-circle"></i>
                                            </div>

                                            <div>

                                                <strong>
                                                    {activity.title}
                                                </strong>

                                                <span>
                                                    {activity.time}
                                                </span>

                                            </div>

                                        </div>

                                    )
                                )

                            )}

                        </div>

                    </div>

                </div>

            </section>


            {/* =================================================
                BOTTOM ACHIEVEMENT
            ================================================= */}

            <section className="achievement-banner">

                <div className="achievement-icon">
                    <i className="bi bi-trophy-fill"></i>
                </div>

                <div>

                    <h2>
                        You're making great progress! 🎉
                    </h2>

                    <p>
                        Keep learning consistently to achieve your goals.
                    </p>

                </div>

                <button>
                    <i className="bi bi-trophy"></i>
                    View Achievements
                </button>

            </section>

        </div>
    );
}

export default Dashboard;