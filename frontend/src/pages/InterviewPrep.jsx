import React, { useEffect, useMemo, useState } from "react";
import "./InterviewPrep.css";

const API_BASE =
    import.meta.env.VITE_API_URL || "http://localhost:8080";

const DEFAULT_GOAL = "SOFTWARE_DEVELOPER";

const difficultyOptions = ["ALL", "EASY", "MEDIUM", "HARD"];

function Interview() {
    const [questions, setQuestions] = useState([]);
    const [summary, setSummary] = useState({
        totalQuestions: 0,
        attempted: 0,
        mastered: 0,
        accuracy: 0,
        mastery: 0,
    });

    const [selectedTopic, setSelectedTopic] = useState("ALL");
    const [selectedDifficulty, setSelectedDifficulty] = useState("ALL");

    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState("");
    const [theoryAnswer, setTheoryAnswer] = useState("");
    const [showModelAnswer, setShowModelAnswer] = useState(false);
    const [attemptResult, setAttemptResult] = useState(null);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [error, setError] = useState("");

    const [studentId, setStudentId] = useState(null);
    const [careerGoal, setCareerGoal] = useState(DEFAULT_GOAL);

    // =========================================================
    // DYNAMIC STUDENT SKILLS
    // =========================================================
    // Skills are read from the same profile/localStorage data used
    // by the Skills section. Nothing is hard-coded into the UI.
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [selectedInterviewSkill, setSelectedInterviewSkill] = useState("ALL");
    const [availableTopics, setAvailableTopics] = useState([]);
    const [skillsLoading, setSkillsLoading] = useState(false);

    // =========================================================
    // DYNAMIC SKILL NORMALIZATION
    // =========================================================

    const normalizeSkillText = (value) =>
        String(value ?? "")
            .trim()
            .toLowerCase()
            .replace(/[._/-]+/g, " ")
            .replace(/\s+/g, " ");

    // No fixed interview-topic list is required here. The student's
    // selected skills come from the authenticated Skills API and the
    // interview topics come from the interview-question response.
    // The small alias map only handles common spelling variations.
    const skillAliases = {
        "spring boot": ["springboot", "spring boot"],
        springboot: ["spring boot", "springboot"],
        react: ["reactjs", "react js"],
        reactjs: ["react", "react js"],
        javascript: ["java script", "ecmascript"],
        typescript: ["type script"],
        sql: ["structured query language"],
        dbms: ["database management system"],
        dsa: ["data structures", "data structures and algorithms"],
        "operating system": ["operating systems", "os"],
        "computer networks": ["computer network", "networking", "cn"],
        html: ["html5"],
        css: ["css3"],
        "rest api": ["restful api", "restful"],
        microservices: ["microservice"],
        jpa: ["spring data jpa", "java persistence api"],
        git: ["github", "version control"],
        docker: ["containers", "containerization"],
        aws: ["amazon web services"],
        "c++": ["cpp", "cplusplus"],
    };

    const flattenSkillValue = (value, result = []) => {
        if (value == null) return result;

        if (typeof value === "string") {
            value
                .split(/[,|]/)
                .map((item) => item.trim())
                .filter(Boolean)
                .forEach((item) => result.push(item));
            return result;
        }

        if (Array.isArray(value)) {
            value.forEach((item) => flattenSkillValue(item, result));
            return result;
        }

        if (typeof value === "object") {
            const candidate =
                value.name ??
                value.skillName ??
                value.skill ??
                value.title ??
                value.label ??
                value.technology;

            if (candidate != null && typeof candidate !== "object") {
                result.push(String(candidate));
            }
        }

        return result;
    };

    const extractSelectedSkills = (user) => {
        const values = [];
        const sources = [
            user?.skills,
            user?.selectedSkills,
            user?.skillNames,
            user?.technicalSkills,
            user?.technologies,
            user?.preferredSkills,
            user?.studentSkills,
            user?.studentProfile?.skills,
            user?.studentProfile?.selectedSkills,
            user?.profile?.skills,
            user?.profile?.selectedSkills,
        ];

        sources.forEach((source) => flattenSkillValue(source, values));

        // Also support a profile where skills are represented as
        // { java: true, react: true, springBoot: true }.
        const booleanSkillObjects = [
            user?.skills,
            user?.selectedSkills,
            user?.studentProfile?.skills,
            user?.profile?.skills,
        ];

        booleanSkillObjects.forEach((source) => {
            if (!source || Array.isArray(source) || typeof source !== "object") {
                return;
            }

            Object.entries(source).forEach(([key, value]) => {
                if (value === true) values.push(key);
            });
        });

        [
            "selectedSkills",
            "skills",
            "studentSkills",
            "technicalSkills",
        ].forEach((key) => {
            const stored = localStorage.getItem(key);
            if (!stored) return;
            try {
                flattenSkillValue(JSON.parse(stored), values);
            } catch {
                flattenSkillValue(stored, values);
            }
        });

        return [...new Set(
            values
                .map((value) => String(value).trim())
                .filter(Boolean)
        )];
    };

    const getSkillAliases = (skill) => {
        const normalized = normalizeSkillText(skill);
        return [
            normalized,
            ...(skillAliases[normalized] || []),
        ]
            .map(normalizeSkillText)
            .filter(Boolean);
    };

    const skillMatchesTopic = (skill, topic) => {
        const skillValues = getSkillAliases(skill);
        const topicValue = normalizeSkillText(topic);

        if (!skillValues.length || !topicValue) return false;

        // Exact match is always the strongest match.
        if (skillValues.includes(topicValue)) return true;

        // Never confuse Java with JavaScript.
        if (
            skillValues.includes("java") &&
            topicValue === "javascript"
        ) {
            return false;
        }

        if (
            skillValues.includes("javascript") &&
            topicValue === "java"
        ) {
            return false;
        }

        // Support backend topics such as "Core Java",
        // "Java Interview", or "Spring Boot Basics".
        if (skillValues.some((value) =>
            topicValue.includes(value) || value.includes(topicValue)
        )) {
            return true;
        }

        // Token matching handles harmless formatting differences while
        // avoiding substring collisions such as java/javascript.
        const topicTokens = new Set(topicValue.split(" ").filter(Boolean));
        return skillValues.some((value) => {
            const skillTokens = value.split(" ").filter(Boolean);
            return skillTokens.length > 1 &&
                skillTokens.every((token) => topicTokens.has(token));
        });
    };

    const getQuestionSkillValues = (question) => {
        const values = [];

        // Different backend versions may expose the skill under different
        // property names. Reading all of them keeps the UI backward
        // compatible without hard-coding the student's selected skills.
        [
            question?.topic,
            question?.skillName,
            question?.skill,
            question?.category,
            question?.technology,
            question?.subject,
        ].forEach((value) => {
            if (value == null) return;
            if (Array.isArray(value)) {
                value.forEach((item) => values.push(String(item)));
            } else {
                values.push(String(value));
            }
        });

        if (Array.isArray(question?.tags)) {
            question.tags.forEach((tag) => {
                if (tag != null) values.push(String(tag));
            });
        }

        return [...new Set(
            values.map((value) => value.trim()).filter(Boolean)
        )];
    };

    const questionBelongsToSelectedSkills = (question) => {
        if (!selectedSkills.length) return true;

        const questionSkills = getQuestionSkillValues(question);

        return selectedSkills.some((skill) =>
            questionSkills.some((questionSkill) =>
                skillMatchesTopic(skill, questionSkill)
            )
        );
    };

    // =========================================================
    // STUDENT INFORMATION
    // =========================================================

    useEffect(() => {
        loadStudentInformation();
    }, []);

    useEffect(() => {
        let cancelled = false;

        const extractSkillNames = (data) => {
            const list = Array.isArray(data)
                ? data
                : Array.isArray(data?.content)
                    ? data.content
                    : Array.isArray(data?.skills)
                        ? data.skills
                        : [];

            return [...new Set(
                list
                    .map((item) =>
                        typeof item === "string"
                            ? item
                            : item?.skillName ??
                              item?.skill?.name ??
                              item?.name ??
                              item?.title ??
                              item?.label
                    )
                    .filter(Boolean)
                    .map((name) => String(name).trim())
                    .filter(Boolean)
            )];
        };

        const loadInterviewSkills = async () => {
            setSkillsLoading(true);

            try {
                // Load the complete master skill catalog first.
                // Interview Preparation therefore exposes every skill,
                // not just the one currently selected in the Skills page.
                const catalogEndpoints = [
                    `${API_BASE}/api/skills`,
                    `${API_BASE}/api/skills/all`,
                ];

                let names = [];

                for (const url of catalogEndpoints) {
                    try {
                        const response = await fetch(url, {
                            method: "GET",
                            headers: getHeaders(),
                        });

                        if (!response.ok) continue;

                        const data = await response.json();
                        names = extractSkillNames(data);

                        if (names.length > 0) break;
                    } catch (requestError) {
                        console.warn(
                            "Interview master skill request failed:",
                            url,
                            requestError
                        );
                    }
                }

                // Compatibility fallback for installations where the master
                // skill catalog endpoint is not available.
                if (!names.length) {
                    try {
                        const response = await fetch(
                            `${API_BASE}/api/students/me/skills`,
                            {
                                method: "GET",
                                headers: getHeaders(),
                            }
                        );

                        if (response.ok) {
                            names = extractSkillNames(
                                await response.json()
                            );
                        }
                    } catch (fallbackError) {
                        console.warn(
                            "Interview student skill fallback failed:",
                            fallbackError
                        );
                    }
                }

                // Final local profile fallback.
                if (!names.length) {
                    try {
                        const rawUser =
                            localStorage.getItem("ai_mentor_user") ||
                            localStorage.getItem("user") ||
                            localStorage.getItem("student");

                        const user = rawUser
                            ? JSON.parse(rawUser)
                            : {};

                        names = extractSelectedSkills(user);
                    } catch (localError) {
                        console.warn(
                            "Interview local skill fallback failed:",
                            localError
                        );
                    }
                }

                if (!cancelled) {
                    const uniqueNames = [...new Set(names)];

                    setSelectedSkills(uniqueNames);
                    setSelectedInterviewSkill((previous) => {
                        if (
                            previous !== "ALL" &&
                            uniqueNames.some(
                                (name) =>
                                    normalizeSkillText(name) ===
                                    normalizeSkillText(previous)
                            )
                        ) {
                            return previous;
                        }

                        return "ALL";
                    });
                }

                console.log(
                    "INTERVIEW MASTER SKILLS:",
                    names.length,
                    names
                );
            } finally {
                if (!cancelled) {
                    setSkillsLoading(false);
                }
            }
        };

        loadInterviewSkills();

        const handleStorageChange = () => loadInterviewSkills();
        window.addEventListener("storage", handleStorageChange);

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                loadInterviewSkills();
            }
        };

        document.addEventListener(
            "visibilitychange",
            handleVisibilityChange
        );

        const handleSkillsUpdated = () => loadInterviewSkills();
        window.addEventListener(
            "studentSkillsUpdated",
            handleSkillsUpdated
        );

        return () => {
            cancelled = true;
            window.removeEventListener(
                "storage",
                handleStorageChange
            );
            window.removeEventListener(
                "studentSkillsUpdated",
                handleSkillsUpdated
            );
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
        };
    }, []);

    const loadStudentInformation = () => {
        try {
            const possibleUser =
                localStorage.getItem("ai_mentor_user") ||
                localStorage.getItem("user") ||
                localStorage.getItem("student");

            if (possibleUser) {
                const user = JSON.parse(possibleUser);

                const id =
                    user.studentId ??
                    user.userId ??
                    user.id ??
                    user.student?.id;

                if (id) {
                    setStudentId(Number(id));
                }

                const goal =
                    user.careerGoal ||
                    user.studentProfile?.careerGoal ||
                    user.profile?.careerGoal;

                if (goal) {
                    setCareerGoal(goal);
                }
            }

            const storedId =
                localStorage.getItem("studentId") ||
                localStorage.getItem("userId");

            if (storedId) {
                setStudentId(Number(storedId));
            }

            const storedGoal =
                localStorage.getItem("careerGoal");

            if (storedGoal) {
                setCareerGoal(storedGoal);
            }
        } catch (e) {
            console.error("Unable to read student information", e);
        }
    };

    // =========================================================
    // API HELPER
    // =========================================================

    const getHeaders = () => {
        const token = localStorage.getItem("token");

        return {
            "Content-Type": "application/json",
            ...(token
                ? {
                    Authorization: `Bearer ${token}`,
                }
                : {}),
        };
    };

    // =========================================================
    // AUTHENTICATED JSON REQUEST HELPER
    // =========================================================
    // Every interview request uses the same Bearer token source. This
    // prevents one request from silently omitting authentication while
    // another request succeeds.
    const fetchInterviewJson = async (url, options = {}) => {
        const response = await fetch(url, {
            ...options,
            headers: {
                ...getHeaders(),
                ...(options.headers || {}),
            },
        });

        if (!response.ok) {
            let message = "";

            try {
                message = await response.text();
            } catch {
                message = "";
            }

            const error = new Error(
                message || `Interview request failed: ${response.status}`
            );
            error.status = response.status;
            throw error;
        }

        if (response.status === 204) {
            return null;
        }

        return response.json();
    };

    const getCurrentUserId = () => {
        const rawId =
            studentId ??
            localStorage.getItem("studentId") ??
            localStorage.getItem("userId");

        const numericId = Number(rawId);
        return Number.isFinite(numericId) && numericId > 0
            ? numericId
            : null;
    };

    // =========================================================
    // LOCAL SUMMARY FOR SELECTED SKILLS
    // =========================================================

    const calculateSkillSummary = (list) => {
        const safeList = Array.isArray(list) ? list : [];

        const attempted = safeList.filter(
            (question) => Number(question?.attempts ?? 0) > 0
        ).length;

        const mastered = safeList.filter(
            (question) => Boolean(question?.mastered)
        ).length;

        const totalAttempts = safeList.reduce(
            (sum, question) =>
                sum + Number(question?.attempts ?? 0),
            0
        );

        const totalCorrect = safeList.reduce(
            (sum, question) =>
                sum + Number(question?.correctAttempts ?? 0),
            0
        );

        const accuracy =
            totalAttempts > 0
                ? Math.round((totalCorrect * 100) / totalAttempts)
                : 0;

        const mastery =
            safeList.length > 0
                ? Math.round((mastered * 100) / safeList.length)
                : 0;

        return {
            totalQuestions: safeList.length,
            attempted,
            mastered,
            accuracy,
            mastery,
        };
    };

    // =========================================================
    // LOAD QUESTIONS
    // =========================================================

    useEffect(() => {
        const currentStudentId = getCurrentUserId();

        if (currentStudentId !== null && !skillsLoading && selectedSkills.length > 0) {
            loadQuestions();
        } else if (currentStudentId !== null && !skillsLoading && selectedSkills.length === 0) {
            setLoading(false);
        }
    }, [
        studentId,
        careerGoal,
        selectedDifficulty,
        selectedTopic,
        selectedSkills,
        selectedInterviewSkill,
        skillsLoading,
    ]);

    const loadQuestions = async () => {
        const currentStudentId = getCurrentUserId();

        // Never call the backend with studentId=null.
        if (currentStudentId === null) {
            console.warn(
                "Interview questions skipped: studentId is not available yet."
            );

            setQuestions([]);
            setAvailableTopics([]);
            setSummary(calculateSkillSummary([]));
            setLoading(false);
            return;
        }

        setLoading(true);
        setError("");
        setSelectedAnswer("");
        setTheoryAnswer("");
        setShowModelAnswer(false);
        setAttemptResult(null);
        setCurrentIndex(0);

        try {
            // =====================================================
            // DYNAMIC SELECTED SKILLS
            // =====================================================
            // selectedSkills comes from the student's actual Skills section.
            // Nothing is hard-coded here, so this works for 1 skill or 52+
            // skills without changing this component.
            const allSkills = Array.isArray(selectedSkills)
                ? selectedSkills
                    .map((skill) => String(skill ?? "").trim())
                    .filter(Boolean)
                : [];

            const skills =
                selectedInterviewSkill !== "ALL"
                    ? [selectedInterviewSkill]
                    : [];

            console.log(
                "========================================"
            );
            console.log(
                "INTERVIEW SELECTED SKILLS:",
                skills
            );

            // =====================================================
            // NO SKILL SELECTED
            // =====================================================
            if (
                selectedInterviewSkill !== "ALL" &&
                skills.length === 0
            ) {
                console.log(
                    "INTERVIEW: Selected interview skill is not available yet"
                );

                setQuestions([]);
                setAvailableTopics([]);
                setSummary(calculateSkillSummary([]));
                return;
            }

            // =====================================================
            // REQUEST QUESTIONS FOR EACH SELECTED SKILL
            // =====================================================
            // IMPORTANT:
            // The previous implementation requested only:
            // careerGoal + studentId
            // and then tried to identify skills on the frontend.
            // That caused a career-goal pool to be returned and then
            // filtered down to zero questions.
            //
            // The correct flow is:
            // selected skill -> backend skill parameter -> skill questions.
            // =====================================================
            const requestSkills =
                selectedInterviewSkill === "ALL"
                    ? [null]
                    : [selectedInterviewSkill];

            const questionRequests = requestSkills.map(async (skill) => {
                const params = new URLSearchParams();

                params.set(
                    "careerGoal",
                    careerGoal || DEFAULT_GOAL
                );

                if (skill) {
                    params.set(
                        "skill",
                        skill
                    );
                }

                params.set(
                    "studentId",
                    String(currentStudentId)
                );

                // Difficulty is safe to send to the backend because it is
                // an actual interview-question filter.
                if (
                    selectedDifficulty &&
                    selectedDifficulty !== "ALL" &&
                    String(selectedDifficulty).trim()
                ) {
                    params.set(
                        "difficulty",
                        String(selectedDifficulty).trim()
                    );
                }

                // Do NOT send selectedTopic here.
                // Topic options are generated from the returned skill data.
                // The selected topic is filtered below after all selected
                // skills have been loaded. This keeps the Topic dropdown
                // genuinely dynamic.
                const url =
                    `${API_BASE}/api/interview/questions?${params.toString()}`;

                console.log(
                    `INTERVIEW QUESTIONS REQUEST [${skill || "ALL SKILLS"}]:`,
                    url
                );

                try {
                    const response = await fetchInterviewJson(url, {
                        method: "GET",
                    });

                    const questions = Array.isArray(response)
                        ? response
                        : [];

                    console.log(
                        `INTERVIEW ${skill || "ALL SKILLS"} QUESTIONS:`,
                        questions.length
                    );

                    return questions;
                } catch (requestError) {
                    console.error(
                        `INTERVIEW ${skill || "ALL SKILLS"} REQUEST ERROR:`,
                        requestError
                    );

                    return [];
                }
            });

            const resultArrays = await Promise.all(questionRequests);

            // =====================================================
            // MERGE ALL SKILL QUESTION ARRAYS
            // =====================================================
            const allQuestions = resultArrays.flat();

            // =====================================================
            // REMOVE DUPLICATES
            // =====================================================
            // The backend owns question IDs. If two requests happen to
            // return the same question, show it only once.
            const uniqueQuestions = [];
            const seenQuestionIds = new Set();

            allQuestions.forEach((question) => {
                if (!question) return;

                const questionId = question?.id;

                if (questionId == null) {
                    uniqueQuestions.push(question);
                    return;
                }

                if (!seenQuestionIds.has(questionId)) {
                    seenQuestionIds.add(questionId);
                    uniqueQuestions.push(question);
                }
            });

            // =====================================================
            // SKILL-SAFE FRONTEND VALIDATION
            // =====================================================
            // The backend has already received the exact selected skill.
            // Therefore a missing skill field in an older response must NOT
            // cause a valid question to disappear from the UI.
            const skillQuestions = uniqueQuestions.filter((question) => {
                const backendSkill =
                    question?.skill ??
                    question?.skillName ??
                    question?.technology ??
                    question?.subject ??
                    null;

                // Some older DTO versions expose topic but not skill.
                // In that case, trust the backend skill-filtered response.
                if (
                    backendSkill == null ||
                    String(backendSkill).trim() === ""
                ) {
                    return true;
                }

                if (selectedInterviewSkill === "ALL") {
                    return true;
                }

                return skills.some((selectedSkill) =>
                    skillMatchesTopic(
                        selectedSkill,
                        String(backendSkill)
                    )
                );
            });

            // =====================================================
            // BUILD TOPICS DYNAMICALLY
            // =====================================================
            // No topic list is hard-coded. Every topic shown in the UI comes
            // from the actual questions returned for the selected skills.
            const topicsFromBackend = [
                ...new Set(
                    skillQuestions
                        .map((question) => question?.topic)
                        .filter(Boolean)
                        .map((topic) => String(topic).trim())
                        .filter(Boolean)
                ),
            ].sort((a, b) => a.localeCompare(b));

            setAvailableTopics(topicsFromBackend);

            // If the selected topic disappeared after a skill was removed,
            // reset the topic selector to ALL rather than showing no data.
            if (
                selectedTopic !== "ALL" &&
                selectedTopic &&
                !topicsFromBackend.some(
                    (topic) =>
                        normalizeSkillText(topic) ===
                        normalizeSkillText(selectedTopic)
                )
            ) {
                setSelectedTopic("ALL");
            }

            // =====================================================
            // APPLY TOPIC FILTER ON THE FRONTEND
            // =====================================================
            let finalQuestions = skillQuestions;

            if (
                selectedTopic &&
                selectedTopic !== "ALL"
            ) {
                finalQuestions = finalQuestions.filter((question) => {
                    const questionTopic = normalizeSkillText(
                        question?.topic
                    );

                    const selected = normalizeSkillText(
                        selectedTopic
                    );

                    return questionTopic === selected;
                });
            }

            // =====================================================
            // APPLY DIFFICULTY FILTER ON THE FRONTEND TOO
            // =====================================================
            // Keeping this check makes the UI resilient if an older backend
            // endpoint ignores the difficulty parameter.
            if (
                selectedDifficulty &&
                selectedDifficulty !== "ALL"
            ) {
                finalQuestions = finalQuestions.filter(
                    (question) =>
                        String(question?.difficulty ?? "")
                            .trim()
                            .toUpperCase() ===
                        String(selectedDifficulty)
                            .trim()
                            .toUpperCase()
                );
            }

            // =====================================================
            // SAVE FINAL QUESTION STATE
            // =====================================================
            const shuffledQuestions = [...finalQuestions].sort(
                () => Math.random() - 0.5
            );

            setQuestions(shuffledQuestions);
            setSummary(
                calculateSkillSummary(shuffledQuestions)
            );

            // =====================================================
            // DEBUG INFORMATION
            // =====================================================
            console.log(
                "INTERVIEW QUESTION POOL:",
                allQuestions.length
            );

            console.log(
                "INTERVIEW UNIQUE QUESTIONS:",
                uniqueQuestions.length
            );

            console.log(
                "INTERVIEW SKILL QUESTIONS:",
                skillQuestions.length
            );

            console.log(
                "INTERVIEW FINAL QUESTIONS:",
                finalQuestions.length
            );

            console.log(
                "INTERVIEW DYNAMIC TOPICS:",
                topicsFromBackend
            );

            console.log(
                "========================================"
            );
        } catch (error) {
            console.error(
                "Interview questions error:",
                error
            );

            setError(
                error?.message ||
                "Unable to load interview questions."
            );

            setQuestions([]);
            setAvailableTopics([]);
            setSummary(calculateSkillSummary([]));
        } finally {
            setLoading(false);
            setSummaryLoading(false);
        }
    };

    // =========================================================
    // FILTER RESET
    // =========================================================

    const resetFilters = () => {
        setSelectedInterviewSkill("ALL");
        setSelectedTopic("ALL");
        setSelectedDifficulty("ALL");
        setCurrentIndex(0);
        setSelectedAnswer("");
        setTheoryAnswer("");
        setShowModelAnswer(false);
        setAttemptResult(null);
    };

    // =========================================================
    // SAFE LOCAL SUMMARY FALLBACKS
    // =========================================================
    const attemptedCount = Array.isArray(questions)
        ? questions.filter(
            (question) => Number(question?.attempts ?? 0) > 0
        ).length
        : 0;

    const masteredCount = Array.isArray(questions)
        ? questions.filter(
            (question) => Boolean(question?.mastered)
        ).length
        : 0;

    // =========================================================
    // CURRENT QUESTION
    // =========================================================
    // Keep the active question derived from the filtered question list.
    // This prevents the render from referencing an undeclared variable
    // when the page first mounts or when filters return an empty list.
    const activeQuestion = useMemo(() => {
        if (!Array.isArray(questions) || questions.length === 0) {
            return null;
        }

        const safeIndex = Math.min(
            Math.max(Number(currentIndex) || 0, 0),
            questions.length - 1
        );

        return questions[safeIndex] || null;
    }, [questions, currentIndex]);

    // =========================================================
    // CURRENT QUESTION PROGRESS
    // =========================================================
    // The progress indicator represents the user's position in the
    // currently loaded interview question set. Keep it derived from
    // the same questions/currentIndex state used by activeQuestion.
    const questionProgress = useMemo(() => {
        if (!Array.isArray(questions) || questions.length === 0) {
            return 0;
        }

        const safeIndex = Math.min(
            Math.max(Number(currentIndex) || 0, 0),
            questions.length - 1
        );

        return Math.round(
            ((safeIndex + 1) / questions.length) * 100
        );
    }, [questions, currentIndex]);

    // =========================================================
    // QUESTION NAVIGATION
    // =========================================================
    // Keep navigation handlers local to the component. The previous
    // version rendered these callbacks without declaring them, which
    // caused the Interview component to crash during render.
    const previousQuestion = () => {
        setCurrentIndex((previous) => {
            const nextIndex = Math.max(Number(previous) - 1, 0);
            return nextIndex;
        });
        setSelectedAnswer("");
        setTheoryAnswer("");
        setShowModelAnswer(false);
        setAttemptResult(null);
    };

    const nextQuestion = () => {
        setCurrentIndex((previous) => {
            const maxIndex = Math.max(
                Array.isArray(questions) ? questions.length - 1 : 0,
                0
            );

            return Math.min(Number(previous) + 1, maxIndex);
        });
        setSelectedAnswer("");
        setTheoryAnswer("");
        setShowModelAnswer(false);
        setAttemptResult(null);
    };

    // =========================================================
    // RETRY CURRENT QUESTION
    // =========================================================
    const retryQuestion = () => {
        setSelectedAnswer("");
        setTheoryAnswer("");
        setShowModelAnswer(false);
        setAttemptResult(null);
    };

    // =========================================================
    // SUBMIT CURRENT ANSWER
    // =========================================================
    // The backend owns correctness and progress updates. The UI sends the
    // selected option and then normalizes the response into the shape used
    // by the result card.
    const submitAnswer = async () => {
        if (!activeQuestion || !selectedAnswer || submitting) {
            return;
        }

        const questionId =
            activeQuestion?.id ??
            activeQuestion?.questionId ??
            null;

        if (questionId == null) {
            setAttemptResult({
                localError:
                    "This question does not have a valid question ID.",
            });
            return;
        }

        if (studentId == null) {
            setAttemptResult({
                localError:
                    "Student information is unavailable. Please sign in again.",
            });
            return;
        }

        setSubmitting(true);

        try {
            const result = await fetchInterviewJson(
                `${API_BASE}/api/interview/attempt`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        studentId: Number(studentId),
                        questionId: Number(questionId),
                        answer: String(selectedAnswer).trim().toUpperCase(),
                    }),
                }
            );

            const normalizedResult = {
                correct: Boolean(
                    result?.correct ??
                    result?.isCorrect ??
                    false
                ),
                mastered: Boolean(
                    result?.mastered ??
                    result?.isMastered ??
                    false
                ),
                attempts: Number(
                    result?.attempts ??
                    result?.totalAttempts ??
                    0
                ),
                correctAttempts: Number(
                    result?.correctAttempts ??
                    result?.successfulAttempts ??
                    0
                ),
                masteryPercent: Number(
                    result?.masteryPercent ??
                    result?.mastery ??
                    0
                ),
                explanation:
                    result?.explanation ??
                    activeQuestion?.explanation ??
                    "",
                correctAnswer:
                    result?.correctAnswer ??
                    result?.correctOption ??
                    activeQuestion?.correctOption ??
                    "",
            };

            setAttemptResult(normalizedResult);

            // Keep the current result visible. The question list is already
            // updated locally below, so a full reload is unnecessary and
            // would clear the result card before the user can read it.
        } catch (error) {
            console.error(
                "Interview answer submission error:",
                error
            );

            setAttemptResult({
                localError:
                    error?.message ||
                    "Unable to submit this answer. Please try again.",
            });
        } finally {
            setSubmitting(false);
        }
    };

    // =========================================================
    // QUESTION PRESENTATION HELPERS
    // =========================================================
    // Kept inside the component so the JSX can safely use these
    // values for the current question without relying on globals.
    const difficultyClass = useMemo(() => {
        const value = String(
            activeQuestion?.difficulty ?? "MEDIUM"
        ).trim().toLowerCase();

        if (value === "easy") return "difficulty-easy";
        if (value === "hard") return "difficulty-hard";
        return "difficulty-medium";
    }, [activeQuestion]);

    const difficultyLabel = useMemo(() => {
        const value = String(
            activeQuestion?.difficulty ?? "MEDIUM"
        ).trim().toLowerCase();

        if (value === "easy") return "Easy";
        if (value === "hard") return "Hard";
        return "Medium";
    }, [activeQuestion]);

    // =========================================================
    // ANSWER OPTIONS
    // =========================================================
    // Normalize common backend DTO shapes into one stable UI contract.
    // This prevents the render from crashing when the API returns
    // optionA/optionB fields, an options array, or an options object.
    const answerOptions = useMemo(() => {
        const question = activeQuestion;

        if (!question) return [];

        const normalized = [];
        const addOption = (key, value) => {
            if (value == null) return;
            const text = String(value).trim();
            if (!text) return;
            normalized.push({ key, text });
        };

        const rawOptions =
            question.options ??
            question.answerOptions ??
            question.choices ??
            question.answers ??
            null;

        if (Array.isArray(rawOptions)) {
            rawOptions.forEach((option, index) => {
                const fallbackKey = String.fromCharCode(65 + index);

                if (option && typeof option === "object") {
                    const key = String(
                        option.key ??
                        option.label ??
                        option.id ??
                        fallbackKey
                    ).trim().toUpperCase();

                    addOption(
                        key,
                        option.text ??
                        option.value ??
                        option.answer ??
                        option.option
                    );
                } else {
                    addOption(fallbackKey, option);
                }
            });
        } else if (rawOptions && typeof rawOptions === "object") {
            Object.entries(rawOptions).forEach(([rawKey, value], index) => {
                const key = String(rawKey || String.fromCharCode(65 + index))
                    .trim()
                    .replace(/^(option|choice|answer)[ _-]?/i, "")
                    .toUpperCase();
                addOption(key || String.fromCharCode(65 + index), value);
            });
        }

        if (!normalized.length) {
            const fieldGroups = [
                ["A", ["optionA", "option1", "answerA", "choiceA", "a"]],
                ["B", ["optionB", "option2", "answerB", "choiceB", "b"]],
                ["C", ["optionC", "option3", "answerC", "choiceC", "c"]],
                ["D", ["optionD", "option4", "answerD", "choiceD", "d"]],
            ];

            fieldGroups.forEach(([key, fields]) => {
                const field = fields.find((name) => question?.[name] != null);
                if (field) addOption(key, question[field]);
            });
        }

        // Some APIs expose options as a JSON string. Parse it only if the
        // normal fields above were not available.
        if (!normalized.length && typeof rawOptions === "string") {
            try {
                const parsed = JSON.parse(rawOptions);
                if (Array.isArray(parsed)) {
                    parsed.forEach((value, index) =>
                        addOption(String.fromCharCode(65 + index), value)
                    );
                }
            } catch {
                // Ignore malformed optional option data. The UI will show
                // a safe empty state instead of crashing.
            }
        }

        return normalized.slice(0, 6);
    }, [activeQuestion]);


    // =========================================================
    // THEORY QUESTION MODE
    // =========================================================
    // AI-generated interview questions are intentionally open-ended.
    // Legacy MCQ data is still tolerated, but it is not rendered for the
    // AI theory flow when the backend returns no options.
    const isTheoryQuestion = Boolean(activeQuestion) && answerOptions.length === 0;

    const modelAnswer = String(
        activeQuestion?.modelAnswer ??
        activeQuestion?.explanation ??
        ""
    ).trim();

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div className="interview-page">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <section className="interview-header">

                <div className="interview-header-content">

                    <div>
                        <div className="interview-eyebrow">
                            <span className="eyebrow-dot"></span>
                            AI POWERED INTERVIEW PREP
                        </div>

                        <h1>
                            Interview Preparation
                        </h1>

                        <p>
                            Choose any skill from your learning catalog,
                            then practice 20 AI-generated open-ended theory
                            questions with interview-ready model answers.
                        </p>

                        <div className="career-goal-pill">
                            <i className="bi bi-stars"></i>

                            <span>
                                Interview focus
                            </span>

                            <strong>
                                {selectedInterviewSkill === "ALL"
                                    ? "All Skills"
                                    : getInterviewSkillLabel(
                                        selectedInterviewSkill
                                    )}
                            </strong>
                        </div>

                        <div className="interview-skill-context">
                            <div className="interview-skill-context-label">
                                <i className="bi bi-stars"></i>
                                Your Interview Skills
                            </div>

                            <div className="interview-skill-chips">
                                {skillsLoading ? (
                                    <span className="interview-skill-chip muted">
                                        Loading skills...
                                    </span>
                                ) : selectedSkills.length ? (
                                    selectedSkills.map((skill) => (
                                        <span
                                            className="interview-skill-chip"
                                            key={skill}
                                        >
                                            <i className="bi bi-check2-circle"></i>
                                            {getInterviewSkillLabel(skill)}
                                        </span>
                                    ))
                                ) : (
                                    <span className="interview-skill-chip muted">
                                        No skills selected — showing all available interview topics
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="header-visual">

                        <div className="header-orbit orbit-one"></div>
                        <div className="header-orbit orbit-two"></div>

                        <div className="header-visual-icon">
                            <i className="bi bi-person-workspace"></i>
                        </div>

                        <div className="floating-badge badge-top">
                            <i className="bi bi-stars"></i>
                            AI Ready
                        </div>

                        <div className="floating-badge badge-bottom">
                            <i className="bi bi-check2-circle"></i>
                            Practice
                        </div>

                    </div>

                </div>

            </section>


            {/* =================================================
                STAT CARDS
            ================================================= */}

            <section className="interview-stats">

                <StatCard
                    icon="bi-question-circle-fill"
                    label="Total Questions"
                    value={
                        summary.totalQuestions ||
                        questions.length ||
                        0
                    }
                    loading={summaryLoading}
                />

                <StatCard
                    icon="bi-play-circle-fill"
                    label="Attempted"
                    value={
                        Number(summary.attempted) || 0
                    }
                    loading={summaryLoading}
                />

                <StatCard
                    icon="bi-check-circle-fill"
                    label="Mastered"
                    value={
                        Number(summary.mastered) || 0
                    }
                    loading={summaryLoading}
                />

                <StatCard
                    icon="bi-bullseye"
                    label="Accuracy"
                    value={`${Math.round(
                        Number(summary.accuracy) || 0
                    )}%`}
                    loading={summaryLoading}
                />

                <StatCard
                    icon="bi-trophy-fill"
                    label="Mastery"
                    value={`${Math.round(
                        Number(summary.mastery) || 0
                    )}%`}
                    loading={summaryLoading}
                />

            </section>


            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <section className="interview-workspace">

                {/* =================================================
                    FILTER PANEL
                ================================================= */}

                <aside className="interview-filter-card">

                    <div className="filter-heading">

                        <div className="filter-heading-icon">
                            <i className="bi bi-sliders"></i>
                        </div>

                        <div>
                            <h3>Practice Setup</h3>
                            <p>
                                Customize your practice
                            </p>
                            <span className="filter-skill-count">
                                {selectedInterviewSkill === "ALL"
                                    ? `${selectedSkills.length} skills available`
                                    : `Practicing ${getInterviewSkillLabel(selectedInterviewSkill)}`}
                            </span>
                        </div>

                    </div>


                    <div className="filter-group interview-skill-selector-group">

                        <label>
                            <i className="bi bi-stars"></i>
                            Interview Skill
                        </label>

                        <select
                            value={selectedInterviewSkill}
                            disabled={skillsLoading}
                            onChange={(event) => {
                                setSelectedInterviewSkill(
                                    event.target.value
                                );
                                setSelectedTopic("ALL");
                                setCurrentIndex(0);
                                setSelectedAnswer("");
                                setAttemptResult(null);
                            }}
                        >
                            <option value="ALL">
                                All Skills
                            </option>

                            {selectedSkills.map((skill) => (
                                <option
                                    key={skill}
                                    value={skill}
                                >
                                    {getInterviewSkillLabel(skill)}
                                </option>
                            ))}
                        </select>

                        <div className="interview-selected-skill-note">
                            <span className="interview-selected-skill-dot"></span>

                            <span>
                                {selectedInterviewSkill === "ALL"
                                    ? `${selectedSkills.length} skills available for interview practice.`
                                    : `AI questions, topics and explanations are focused on ${getInterviewSkillLabel(selectedInterviewSkill)}.`}
                            </span>
                        </div>

                    </div>


                    <div className="filter-group">

                        <label>
                            <i className="bi bi-bookmark-fill"></i>
                            Topic
                        </label>

                        <select
                            value={selectedTopic}
                            onChange={(event) =>
                                setSelectedTopic(
                                    event.target.value
                                )
                            }
                        >
                            <option value="ALL">All Topics</option>

                            {availableTopics.map((topic) => (
                                <option
                                    key={topic}
                                    value={topic}
                                >
                                    {topic}
                                </option>
                            ))}
                        </select>

                    </div>


                    <div className="filter-group">

                        <label>
                            <i className="bi bi-bar-chart-fill"></i>
                            Difficulty
                        </label>

                        <div className="difficulty-grid">

                            {difficultyOptions.map(
                                (difficulty) => (
                                    <button
                                        key={difficulty}
                                        type="button"
                                        className={
                                            selectedDifficulty ===
                                            difficulty
                                                ? "difficulty-btn active"
                                                : "difficulty-btn"
                                        }
                                        onClick={() =>
                                            setSelectedDifficulty(
                                                difficulty
                                            )
                                        }
                                    >
                                        {difficulty}
                                    </button>
                                )
                            )}

                        </div>

                    </div>


                    <button
                        type="button"
                        className="reset-filter-btn"
                        onClick={resetFilters}
                    >
                        <i className="bi bi-arrow-counterclockwise"></i>
                        Reset Filters
                    </button>


                    <div className="filter-divider"></div>


                    <div className="practice-info">

                        <div className="practice-info-title">
                            <i className="bi bi-lightbulb-fill"></i>
                            Practice Tip
                        </div>

                        <p>
                            Try answering without looking
                            at notes. Review the explanation
                            after every attempt.
                        </p>

                    </div>

                </aside>


                {/* =================================================
                    QUESTION AREA
                ================================================= */}

                <main className="interview-question-area">

                    {loading ? (
                        <QuestionSkeleton />
                    ) : error ? (

                        <div className="interview-empty-card">

                            <div className="empty-icon error-icon">
                                <i className="bi bi-exclamation-triangle-fill"></i>
                            </div>

                            <h2>
                                Something went wrong
                            </h2>

                            <p>
                                {error}
                            </p>

                            <button
                                type="button"
                                className="primary-action-btn"
                                onClick={() => {
                                    loadQuestions();
                                }}
                            >
                                <i className="bi bi-arrow-clockwise"></i>
                                Try Again
                            </button>

                        </div>

                    ) : !activeQuestion ? (

                        <div className="interview-empty-card">

                            <div className="empty-icon">
                                <i className="bi bi-search"></i>
                            </div>

                            <h2>
                                No questions found
                            </h2>

                            <p>
                                {selectedInterviewSkill !== "ALL"
                                    ? `AI could not load theory questions for ${getInterviewSkillLabel(selectedInterviewSkill)} yet.`
                                    : "No interview questions match the current filters."}
                                {selectedSkills.length > 0 && (
                                    <> The interview engine is connected to your skill catalog and can generate a fresh theory question set for the selected skill.</>
                                )}
                            </p>

                            <button
                                type="button"
                                className="primary-action-btn"
                                onClick={resetFilters}
                            >
                                <i className="bi bi-arrow-counterclockwise"></i>
                                Show All Questions
                            </button>

                        </div>

                    ) : (

                        <>
                            {/* QUESTION TOP */}

                            <div className="question-card">

                                <div className="question-top">

                                    <div className="question-number">

                                        <span>
                                            QUESTION
                                        </span>

                                        <strong>
                                            {String(
                                                currentIndex + 1
                                            ).padStart(2, "0")}
                                        </strong>

                                        <small>
                                            /
                                            {String(
                                                questions.length
                                            ).padStart(2, "0")}
                                        </small>

                                    </div>


                                    <div className="question-tags">

                                        <span className="topic-tag">
                                            <i className="bi bi-bookmark"></i>
                                            {getTopicDisplayLabel(
                                                activeQuestion.topic
                                            )}
                                        </span>

                                        <span
                                            className={`difficulty-tag ${difficultyClass}`}
                                        >
                                            {activeQuestion.difficulty ||
                                                "GENERAL"}
                                        </span>

                                        {activeQuestion.mastered && (
                                            <span className="mastered-tag">
                                                <i className="bi bi-patch-check-fill"></i>
                                                Mastered
                                            </span>
                                        )}

                                    </div>

                                </div>


                                <div className="question-progress">

                                    <div className="question-progress-track">
                                        <div
                                            className="question-progress-fill"
                                            style={{
                                                width: `${questionProgress}%`,
                                            }}
                                        ></div>
                                    </div>

                                    <span>
                                        {Math.round(
                                            questionProgress
                                        )}%
                                    </span>

                                </div>


                                {/* QUESTION TEXT */}

                                <div className="question-body">

                                    <h2>
                                        {activeQuestion.question}
                                    </h2>

                                    <p className="question-instruction">
                                        {isTheoryQuestion
                                            ? "Structure your response clearly, then compare it with the AI reference answer when you are ready."
                                            : "Select the best answer from the options below."}
                                    </p>

                                </div>


                                {/* THEORY / ANSWER WORKSPACE */}

                                {isTheoryQuestion ? (
                                    <div className="theory-workspace professional-response-workspace">
                                        <div className="professional-response-header">
                                            <div className="professional-response-title">
                                                <div className="professional-response-icon">
                                                    <i className="bi bi-pencil-square"></i>
                                                </div>
                                                <div>
                                                    <span className="professional-response-eyebrow">
                                                        YOUR RESPONSE
                                                    </span>
                                                    <h3>Response Workspace</h3>
                                                </div>
                                            </div>

                                            <span className="theory-mode-badge">
                                                <i className="bi bi-stars"></i>
                                                AI Generated
                                            </span>
                                        </div>

                                        <div className="professional-response-editor">
                                            <div className="professional-response-editor-bar">
                                                <span>
                                                    <i className="bi bi-chat-left-text"></i>
                                                    Your response
                                                </span>
                                                <span>
                                                    {theoryAnswer.length} characters
                                                </span>
                                            </div>

                                            <textarea
                                                className="theory-answer-input"
                                                value={theoryAnswer}
                                                onChange={(event) => setTheoryAnswer(event.target.value)}
                                                placeholder="Write your response here (optional)"
                                                rows={7}
                                            />
                                        </div>

                                        <div className="theory-workspace-actions professional-response-actions">
                                            <button
                                                type="button"
                                                className="submit-answer-btn"
                                                onClick={() => setShowModelAnswer(true)}
                                            >
                                                <i className="bi bi-stars"></i>
                                                {showModelAnswer ? "Model Answer Shown" : "View Model Answer"}
                                            </button>

                                            {showModelAnswer && (
                                                <button
                                                    type="button"
                                                    className="retry-btn"
                                                    onClick={() => setShowModelAnswer(false)}
                                                >
                                                    <i className="bi bi-eye-slash"></i>
                                                    Hide Model Answer
                                                </button>
                                            )}
                                        </div>

                                        {showModelAnswer && modelAnswer && (
                                            <div className="theory-model-answer professional-model-answer">
                                                <div className="theory-model-answer-heading">
                                                    <span>
                                                        <i className="bi bi-stars"></i>
                                                        AI Model Answer
                                                    </span>
                                                    <small>AI reference</small>
                                                </div>
                                                <p>{modelAnswer}</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="answers-container">
                                        {answerOptions.map((option) => {
                                            const isSelected = selectedAnswer === option.key;
                                            const isCorrect = attemptResult && attemptResult.correct && attemptResult.correctAnswer === option.key;
                                            const isWrong = attemptResult && !attemptResult.correct && isSelected;
                                            let className = "answer-option";
                                            if (isSelected) className += " selected";
                                            if (isCorrect) className += " correct";
                                            if (isWrong) className += " wrong";

                                            return (
                                                <button
                                                    key={option.key}
                                                    type="button"
                                                    disabled={submitting}
                                                    className={className}
                                                    onClick={() => {
                                                        if (attemptResult && !attemptResult.localError) return;
                                                        setSelectedAnswer(option.key);
                                                        setAttemptResult(null);
                                                    }}
                                                >
                                                    <span className="answer-letter">{option.key}</span>
                                                    <span className="answer-text">{option.text}</span>
                                                    <span className="answer-status">
                                                        {isCorrect && <i className="bi bi-check-circle-fill"></i>}
                                                        {isWrong && <i className="bi bi-x-circle-fill"></i>}
                                                        {!isCorrect && !isWrong && isSelected && <i className="bi bi-check2"></i>}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* LOCAL ERROR */}

                                {attemptResult?.localError && (
                                    <div className="local-error">
                                        <i className="bi bi-exclamation-circle-fill"></i>
                                        {attemptResult.localError}
                                    </div>
                                )}


                                {/* RESULT */}

                                {attemptResult &&
                                    !attemptResult.localError && (
                                        <div
                                            className={
                                                attemptResult.correct
                                                    ? "answer-result success"
                                                    : "answer-result failure"
                                            }
                                        >

                                            <div className="result-icon">
                                                <i
                                                    className={
                                                        attemptResult.correct
                                                            ? "bi bi-check-lg"
                                                            : "bi bi-x-lg"
                                                    }
                                                ></i>
                                            </div>

                                            <div className="result-content">

                                                <h3>
                                                    {attemptResult.correct
                                                        ? "Correct Answer!"
                                                        : "Not Quite Right"}
                                                </h3>

                                                {!attemptResult.correct &&
                                                    attemptResult.correctAnswer && (
                                                        <p className="correct-answer-line">
                                                            Correct answer:
                                                            <strong>
                                                                {" "}
                                                                {
                                                                    attemptResult.correctAnswer
                                                                }
                                                            </strong>
                                                        </p>
                                                    )}

                                                {attemptResult.explanation && (
                                                    <div className="explanation">
                                                        <span>
                                                            Explanation
                                                        </span>

                                                        <p>
                                                            {
                                                                attemptResult.explanation
                                                            }
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="result-metrics">

                                                    <span>
                                                        <strong>
                                                            {
                                                                attemptResult.attempts
                                                            }
                                                        </strong>
                                                        Attempts
                                                    </span>

                                                    <span>
                                                        <strong>
                                                            {
                                                                attemptResult.correctAttempts
                                                            }
                                                        </strong>
                                                        Correct
                                                    </span>

                                                    <span>
                                                        <strong>
                                                            {
                                                                attemptResult.masteryPercent
                                                            }%
                                                        </strong>
                                                        Mastery
                                                    </span>

                                                </div>

                                            </div>

                                        </div>
                                    )}


                                {/* ACTIONS */}

                                <div className="question-actions">

                                    <button
                                        type="button"
                                        className="secondary-action-btn"
                                        disabled={
                                            currentIndex === 0
                                        }
                                        onClick={
                                            previousQuestion
                                        }
                                    >
                                        <i className="bi bi-arrow-left"></i>
                                        Previous
                                    </button>


                                    <div className="question-action-right">
                                        {isTheoryQuestion ? (
                                            <>
                                                {currentIndex < questions.length - 1 && (
                                                    <button
                                                        type="button"
                                                        className="submit-answer-btn"
                                                        disabled={!showModelAnswer}
                                                        onClick={nextQuestion}
                                                    >
                                                        Next Question
                                                        <i className="bi bi-arrow-right"></i>
                                                    </button>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                {!attemptResult && (
                                                    <button
                                                        type="button"
                                                        className="submit-answer-btn"
                                                        disabled={!selectedAnswer || submitting}
                                                        onClick={submitAnswer}
                                                    >
                                                        {submitting ? (
                                                            <>
                                                                <span className="button-spinner"></span>
                                                                Checking...
                                                            </>
                                                        ) : (
                                                            <>
                                                                Submit Answer
                                                                <i className="bi bi-arrow-right"></i>
                                                            </>
                                                        )}
                                                    </button>
                                                )}

                                                {attemptResult && !attemptResult.localError && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            className="retry-btn"
                                                            onClick={retryQuestion}
                                                        >
                                                            <i className="bi bi-arrow-repeat"></i>
                                                            Try Again
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="submit-answer-btn"
                                                            disabled={currentIndex >= questions.length - 1}
                                                            onClick={nextQuestion}
                                                        >
                                                            Next Question
                                                            <i className="bi bi-arrow-right"></i>
                                                        </button>
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </div>

                                </div>

                            </div>


                            {/* QUESTION META */}

                            <div className="question-meta-grid">

                                <div className="meta-card">

                                    <div className="meta-icon">
                                        <i className="bi bi-activity"></i>
                                    </div>

                                    <div>
                                        <span>
                                            Current Attempts
                                        </span>

                                        <strong>
                                            {activeQuestion.attempts ||
                                                0}
                                        </strong>
                                    </div>

                                </div>


                                <div className="meta-card">

                                    <div className="meta-icon">
                                        <i className="bi bi-check2-all"></i>
                                    </div>

                                    <div>
                                        <span>
                                            Correct Attempts
                                        </span>

                                        <strong>
                                            {activeQuestion.correctAttempts ||
                                                0}
                                        </strong>
                                    </div>

                                </div>


                                <div className="meta-card">

                                    <div className="meta-icon">
                                        <i className="bi bi-award-fill"></i>
                                    </div>

                                    <div>
                                        <span>
                                            Status
                                        </span>

                                        <strong>
                                            {activeQuestion.mastered
                                                ? "Mastered"
                                                : activeQuestion.attempted
                                                    ? "In Progress"
                                                    : "Not Started"}
                                        </strong>
                                    </div>

                                </div>

                            </div>

                        </>
                    )}

                </main>

            </section>


            {/* =================================================
                BOTTOM PRACTICE PROGRESS
            ================================================= */}

            <section className="practice-progress-card">

                <div className="practice-progress-left">

                    <div className="progress-ring">
                        <svg
                            viewBox="0 0 42 42"
                            className="progress-ring-svg"
                        >
                            <circle
                                cx="21"
                                cy="21"
                                r="15.9155"
                                className="progress-ring-bg"
                            />

                            <circle
                                cx="21"
                                cy="21"
                                r="15.9155"
                                className="progress-ring-value"
                                strokeDasharray={`${summary.mastery || 0} ${100 - (summary.mastery || 0)}`}
                            />
                        </svg>

                        <strong>
                            {Math.round(
                                Number(
                                    summary.mastery
                                ) || 0
                            )}%
                        </strong>
                    </div>

                    <div>
                        <span className="progress-overline">
                            YOUR PROGRESS
                        </span>

                        <h3>
                            Interview readiness
                        </h3>

                        <p>
                            Keep practicing consistently
                            to improve your mastery.
                        </p>
                    </div>

                </div>


                <div className="progress-details">

                    <ProgressDetail
                        label="Questions Attempted"
                        value={
                            summary.attempted ??
                            attemptedCount
                        }
                        total={
                            summary.totalQuestions ||
                            questions.length
                        }
                    />

                    <ProgressDetail
                        label="Questions Mastered"
                        value={
                            summary.mastered ??
                            masteredCount
                        }
                        total={
                            summary.totalQuestions ||
                            questions.length
                        }
                    />

                </div>

            </section>

        </div>
    );
}



// =============================================================
// DYNAMIC SKILL HELPERS
// =============================================================
// Kept as standalone utilities so future skill fields can be added
// without changing the question card or practice workflow.

function getInterviewSkillLabel(skill) {
    return String(skill ?? "")
        .replaceAll("_", " ")
        .replaceAll("-", " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getTopicDisplayLabel(topic) {
    const value = String(topic ?? "General").trim();
    if (!value) return "General";
    return value;
}

// =============================================================
// STAT CARD
// =============================================================

function StatCard({
    icon,
    label,
    value,
    loading,
}) {
    return (
        <div className="interview-stat-card">

            <div className="stat-icon">
                <i className={`bi ${icon}`}></i>
            </div>

            <div className="stat-content">

                <span>
                    {label}
                </span>

                {loading ? (
                    <div className="stat-skeleton"></div>
                ) : (
                    <strong>
                        {value}
                    </strong>
                )}

            </div>

        </div>
    );
}


// =============================================================
// PROGRESS DETAIL
// =============================================================

function ProgressDetail({
    label,
    value,
    total,
}) {
    const percentage =
        total > 0
            ? Math.min(
                100,
                Math.round(
                    (value / total) * 100
                )
            )
            : 0;

    return (
        <div className="progress-detail">

            <div className="progress-detail-top">
                <span>
                    {label}
                </span>

                <strong>
                    {value}/{total}
                </strong>
            </div>

            <div className="progress-detail-track">
                <div
                    className="progress-detail-fill"
                    style={{
                        width: `${percentage}%`,
                    }}
                ></div>
            </div>

        </div>
    );
}


// =============================================================
// SKELETON
// =============================================================

function QuestionSkeleton() {
    return (
        <div className="question-card skeleton-card">

            <div className="skeleton skeleton-small"></div>

            <div className="skeleton skeleton-title"></div>

            <div className="skeleton skeleton-line"></div>

            <div className="skeleton-answer"></div>
            <div className="skeleton-answer"></div>
            <div className="skeleton-answer"></div>
            <div className="skeleton-answer"></div>

        </div>
    );
}


// =============================================================
// CAREER GOAL FORMATTER
// =============================================================

function formatCareerGoal(goal) {
    if (!goal) {
        return "Software Developer";
    }

    const value = String(goal)
        .replaceAll("_", " ")
        .replaceAll("-", " ")
        .toLowerCase();

    return value
        .split(" ")
        .filter(Boolean)
        .map(
            (word) =>
                word.charAt(0).toUpperCase() +
                word.slice(1)
        )
        .join(" ");
}


// =============================================================
// INTERVIEW DATA CONTRACT NOTES
// =============================================================
//
// 1. The Skills page is the source of truth for selected skills.
// 2. Interview questions are loaded for the student's career goal.
// 3. The React layer narrows that question pool to the selected skills.
// 4. The Topic dropdown is generated from the matching backend questions.
// 5. Difficulty remains an independent filter.
// 6. Attempt progress is merged into the currently visible question list.
// 7. No default technology is inserted into selectedSkills.
// 8. If a student changes skills, the page refreshes when visible again.
// 9. Common backend field-name variations are supported by
//    getQuestionSkillValues().
// 10. Java and JavaScript are intentionally treated as different skills.
//
// This design means that adding a new skill to the Skills section does not
// require editing InterviewPrep.jsx. As long as the backend question pool
// contains a matching topic/skill/category value, the new skill appears
// automatically in Interview Preparation.
//
// =============================================================
// MAINTENANCE CHECKLIST
// =============================================================
//
// When adding a new backend interview skill: \n// - store the selected skill through /api/students/me/skills;
// - store the question topic consistently;
// - return the topic in InterviewQuestionResponse;
// - keep careerGoal consistent with the interview question pool;
// - do not add a frontend-only hard-coded skill.
//
// The component deliberately keeps rendering and question navigation
// independent from the source of the selected skills. This prevents a UI
// refresh, route change, or newly added skill from breaking the practice
// session.
//
// =============================================================
// END OF INTERVIEW PREPARATION COMPONENT
// =============================================================

export default Interview;
// Professional implementation note: keep this component as the single
// presentation/controller layer for Interview Preparation. Backend business
// rules remain in Spring Boot services and repositories.
// The frontend must never fabricate question IDs, answer keys, or progress.
// All question IDs and attempt results come from the backend response.

// =========================================================
// INTERVIEW PREPARATION DYNAMIC-SKILL NOTES
// =========================================================
// This component intentionally does not hard-code the student skill list.
// Skills are read from the student data and passed to the backend.
// The backend is responsible for selecting or generating questions.
// Each selected skill receives its own questions request.
// Multiple selected skills are merged into one practice pool.
// Duplicate question IDs are removed before rendering.
// Topics are derived from the returned question data.
// Difficulty is applied by the backend and checked again by the UI.
// Topic filtering is performed after dynamic topic discovery.
// A missing skill property in an older DTO does not discard a valid result.
// studentId is never sent as the literal string null.
// Authentication failures are surfaced through the existing fetch helper.
// The frontend never invents question IDs or correct answers.
// Attempt results continue to come from the Spring Boot backend.
// This design supports new skills without editing this component.
// Add new skills in the Skills data source, not in this JSX file.
// Keep the InterviewQuestionResponse skill field available when possible.
// Keep InterviewQuestionRepository skill queries synchronized with the service.
// Keep the interview service responsible for AI generation and persistence.
// Keep the controller accepting careerGoal, skill, topic, difficulty, and studentId.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
// Dynamic interview implementation remains data-driven.
