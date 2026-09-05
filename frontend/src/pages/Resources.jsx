import { useCallback, useEffect, useMemo, useState } from "react";
import API from "../services/api";
import "./Resources.css";

/*
 * ================================================================
 * AI MENTOR - RESOURCES + LEARNING PROGRESSION
 * ================================================================
 * Backend is intentionally NOT changed.
 * Existing endpoints used by this page:
 *   GET /api/skills
 *   GET /api/skills/all          (fallback only)
 *   GET /api/resources           (ALL backend resources)
 *
 * Important frontend behavior:
 * The Resources page loads the complete backend resource library from
 * /api/resources so all resources stored in PostgreSQL are available.
 * The master skill catalog is loaded separately and every resource is
 * matched to its skill using skillId first and skillName as a fallback.
 * Selecting a skill therefore filters the complete 540-resource library
 * locally instead of depending on the student's personalized /me list.
 * If a master skill genuinely has no backend resource, a local 3-step
 * learning path is displayed so every one of the 55 skills still works.
 * ================================================================
 */

const PER_PAGE = 9;
const STORAGE_KEY = "aiMentorResourceProgress";
const GENERATED_PREFIX = "generated";

/* ---------------------------------------------------------------
 * Helpers
 * --------------------------------------------------------------- */

const text = value => String(value ?? "").trim();
const lower = value => text(value).toLowerCase();

const getStudentId = () => {
    const direct = localStorage.getItem("studentId") || localStorage.getItem("userId");
    if (direct) return direct;

    const possibleKeys = [
        "user",
        "ai_mentor_user",
        "student",
        "loggedInUser",
        "currentUser"
    ];

    for (const key of possibleKeys) {
        const stored = localStorage.getItem(key);
        if (!stored) continue;

        try {
            const user = JSON.parse(stored);
            const id =
                user?.studentId ??
                user?.userId ??
                user?.id ??
                user?.student?.id ??
                user?.user?.id;

            if (id !== undefined && id !== null && text(id)) {
                return id;
            }
        } catch (error) {
            console.warn(`Unable to parse localStorage.${key}`, error);
        }
    }

    return null;
};

const extractArray = response => {
    const payload = response?.data;

    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.content)) return payload.content;
    if (Array.isArray(payload?.resources)) return payload.resources;
    if (Array.isArray(payload?.skills)) return payload.skills;
    if (Array.isArray(payload?.data)) return payload.data;

    return [];
};

const normalizeResource = item => {
    if (!item) return null;

    return {
        ...item,
        id: item.id ?? item.resourceId ?? null,
        title: item.title || item.name || "Learning Resource",
        description:
            item.description ||
            "Explore this resource to strengthen your technical knowledge.",
        url:
            item.url ||
            item.resourceUrl ||
            item.link ||
            item.videoUrl ||
            item.videoLink ||
            "",
        type: item.type || item.resourceType || "Resource",
        category: item.category || item.categoryName || "Technology",
        skillId: item.skillId ?? item.skill?.id ?? null,
        skillName: item.skillName || item.skill?.name || "",
        skillLevel: item.skillLevel || item.level || "BEGINNER",
        thumbnailUrl: item.thumbnailUrl || item.thumbnail || ""
    };
};

const normalizeSkill = item => ({
    id: item?.id ?? item?.skillId ?? null,
    name: item?.name ?? item?.skillName ?? "",
    category: item?.category ?? item?.categoryName ?? "Technology",
    description: item?.description ?? ""
});

const iconFor = category => {
    const value = lower(category);

    if (value.includes("frontend")) return "bi-window";
    if (value.includes("backend")) return "bi-server";
    if (value.includes("database")) return "bi-database";
    if (value.includes("cloud")) return "bi-cloud";
    if (value.includes("devops")) return "bi-git";
    if (value.includes("security")) return "bi-shield-lock";
    if (value.includes("mobile")) return "bi-phone";
    if (value.includes("data")) return "bi-bar-chart";
    if (value.includes("ai") || value.includes("ml")) return "bi-cpu";
    if (value.includes("fundamental")) return "bi-mortarboard";

    return "bi-code-slash";
};

const resourceIcon = type => {
    const value = lower(type);

    if (value.includes("video") || value.includes("course")) {
        return "bi-play-circle-fill";
    }

    if (value.includes("documentation") || value.includes("docs")) {
        return "bi-file-earmark-text-fill";
    }

    if (value.includes("practice") || value.includes("coding")) {
        return "bi-code-square";
    }

    if (value.includes("book") || value.includes("ebook")) {
        return "bi-book-half";
    }

    if (value.includes("github") || value.includes("repository")) {
        return "bi-github";
    }

    if (value.includes("article") || value.includes("blog")) {
        return "bi-newspaper";
    }

    return "bi-link-45deg";
};

const actionText = type => {
    const value = lower(type);

    if (value.includes("video") || value.includes("course")) return "Watch";
    if (value.includes("documentation") || value.includes("docs")) return "Documentation";
    if (value.includes("article") || value.includes("blog")) return "Read Article";
    if (value.includes("book") || value.includes("ebook")) return "Open Book";
    if (value.includes("practice") || value.includes("coding")) return "Practice";

    return "Open Resource";
};

const levelRank = {
    BEGINNER: 1,
    INTERMEDIATE: 2,
    ADVANCED: 3,
    EXPERT: 4
};

const normalizeLevel = value => {
    const v = text(value).toUpperCase();
    if (levelRank[v]) return v;
    return "BEGINNER";
};

/* ---------------------------------------------------------------
 * Local progression fallback
 * ---------------------------------------------------------------
 * This is deliberately frontend-only. It does not insert anything
 * into PostgreSQL and does not change any backend API.
 */

const buildSearchUrl = (skill, query) => {
    const q = `${skill} ${query}`;
    return `https://www.google.com/search?q=${encodeURIComponent(q)}`;
};

const generatedProgressionFor = skill => {
    if (!skill) return [];

    const name = text(skill.name);
    const category = text(skill.category) || "Technology";
    const base = lower(name);

    const steps = [
        {
            key: "foundation",
            title: `${name} Fundamentals`,
            description: `Build a strong foundation in ${name}, terminology, syntax and the concepts used throughout the ecosystem.`,
            type: "Learning Path",
            level: "BEGINNER",
            query: `${name} fundamentals beginner tutorial`
        },
        {
            key: "core",
            title: `${name} Core Concepts`,
            description: `Move from fundamentals into the core concepts, patterns and practical workflows expected when working with ${name}.`,
            type: "Guided Study",
            level: "INTERMEDIATE",
            query: `${name} core concepts complete guide`
        },
        {
            key: "practice",
            title: `${name} Hands-on Practice`,
            description: `Strengthen your ${name} knowledge with exercises, projects and interview-oriented practice.`,
            type: "Practice",
            level: "ADVANCED",
            query: `${name} projects practice interview questions`
        }
    ];

    /* Slightly more useful labels for common skill families. */
    if (base.includes("javascript")) {
        steps[0].query = "JavaScript MDN fundamentals";
        steps[1].query = "JavaScript async promises DOM modules";
        steps[2].query = "JavaScript coding projects interview practice";
    }

    if (base === "java") {
        steps[0].query = "Java official documentation fundamentals";
        steps[1].query = "Java collections OOP exceptions streams";
        steps[2].query = "Java coding problems projects interview practice";
    }

    if (base.includes("python")) {
        steps[0].query = "Python official tutorial fundamentals";
        steps[1].query = "Python functions OOP modules exceptions";
        steps[2].query = "Python projects coding interview practice";
    }

    if (base.includes("sql")) {
        steps[0].query = "SQL SELECT JOIN GROUP BY fundamentals";
        steps[1].query = "SQL subqueries CTE window functions indexes";
        steps[2].query = "SQL practice problems interview questions";
    }

    if (base.includes("react")) {
        steps[0].query = "React official documentation learn";
        steps[1].query = "React hooks state routing API integration";
        steps[2].query = "React projects frontend interview practice";
    }

    return steps.map((step, index) => ({
        id: `${GENERATED_PREFIX}-${skill.id}-${step.key}`,
        generated: true,
        title: step.title,
        description: step.description,
        url: buildSearchUrl(name, step.query),
        type: step.type,
        category,
        skillId: skill.id,
        skillName: name,
        skillLevel: step.level,
        thumbnailUrl: "",
        stepNumber: index + 1,
        stepKey: step.key
    }));
};

const resourceMatchesSkill = (resource, skill) => {
    if (!resource || !skill) return false;

    const idMatch =
        resource.skillId !== null &&
        resource.skillId !== undefined &&
        String(resource.skillId) === String(skill.id);

    if (idMatch) return true;

    const resourceSkillName = lower(resource.skillName);
    const skillName = lower(skill.name);

    return Boolean(resourceSkillName && skillName && resourceSkillName === skillName);
};

const generatedKey = resource =>
    `${GENERATED_PREFIX}:${resource.skillId}:${resource.stepKey}`;

const progressKey = resource =>
    resource?.generated
        ? generatedKey(resource)
        : `resource:${String(resource?.id ?? "")}`;

/* ---------------------------------------------------------------
 * Component
 * --------------------------------------------------------------- */

export default function Resources() {
    const [resources, setResources] = useState([]);
    const [skills, setSkills] = useState([]);

    const [loading, setLoading] = useState(true);
    const [skillsLoading, setSkillsLoading] = useState(true);

    const [notice, setNotice] = useState("");
    const [resourceError, setResourceError] = useState("");

    const [search, setSearch] = useState("");
    const [selectedSkill, setSelectedSkill] = useState("ALL");
    const [selectedType, setSelectedType] = useState("ALL");
    const [selectedCategory, setSelectedCategory] = useState("ALL");
    const [sortBy, setSortBy] = useState("LATEST");

    const [view, setView] = useState("grid");
    const [tab, setTab] = useState("library");
    const [page, setPage] = useState(1);

    const [done, setDone] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
        } catch {
            return {};
        }
    });

    /* -----------------------------------------------------------
     * Load master 55 skills
     * ----------------------------------------------------------- */

    const loadSkills = useCallback(async () => {
        setSkillsLoading(true);
        setResourceError("");

        try {
            let response;

            try {
                response = await API.get("/api/skills");
            } catch (firstError) {
                console.info("/api/skills failed; trying /api/skills/all", firstError?.response?.status);
                response = await API.get("/api/skills/all");
            }

            const uniqueSkills = [
                ...new Map(
                    extractArray(response)
                        .map(normalizeSkill)
                        .filter(skill => skill.id !== null && text(skill.name))
                        .map(skill => [String(skill.id), skill])
                ).values()
            ];

            uniqueSkills.sort((a, b) =>
                text(a.name).localeCompare(text(b.name))
            );

            setSkills(uniqueSkills);

            if (!uniqueSkills.length) {
                setResourceError("No skills were returned by the master skill API.");
            }
        } catch (error) {
            console.error("Master skills loading failed", error);
            setSkills([]);
            setResourceError("Unable to load the master skill catalog.");
        } finally {
            setSkillsLoading(false);
        }
    }, []);

    /* -----------------------------------------------------------
     * Load student's personalized resources
     * ----------------------------------------------------------- */

    const loadResources = useCallback(async () => {
        setLoading(true);
        setResourceError("");
        setNotice("");

        try {
            /*
             * IMPORTANT:
             * Load the complete resource library.
             *
             * Do NOT use /api/resources/me here because that endpoint is
             * personalized for one student and may return fewer rows than
             * the master resource catalog. The database currently contains
             * resources for the skill catalog, so the frontend should load
             * the complete list and filter it by skill locally.
             */
            const response = await API.get("/api/resources");

            const rawResources = extractArray(response);

            const normalized = rawResources
                .map(normalizeResource)
                .filter(resource => resource && resource.url);

            console.log("📚 ALL RESOURCES FROM BACKEND:", rawResources.length);
            console.log("📚 VALID RESOURCES AFTER NORMALIZATION:", normalized.length);

            setResources(normalized);

            if (normalized.length === 0) {
                setResourceError(
                    "No resources were returned by the resource API."
                );
            } else if (skills.length > 0) {
                const coveredSkills = skills.filter(skill =>
                    normalized.some(resource =>
                        resourceMatchesSkill(resource, skill)
                    )
                ).length;

                const missingSkills = skills.length - coveredSkills;

                console.log(
                    `🎯 Resource coverage: ${coveredSkills}/${skills.length} skills`
                );

                if (missingSkills > 0) {
                    setNotice(
                        `${normalized.length} resources loaded across ${coveredSkills} of ${skills.length} skills. ${missingSkills} skill${missingSkills === 1 ? "" : "s"} will use a generated learning path.`
                    );
                } else {
                    setNotice(
                        `${normalized.length} resources loaded across all ${skills.length} skills.`
                    );
                }
            } else {
                setNotice(`${normalized.length} resources loaded successfully.`);
            }
        } catch (error) {
            console.error("❌ All resources loading failed", error);
            setResources([]);

            const status = error?.response?.status;

            if (status === 401) {
                setResourceError("Your session has expired. Please login again.");
            } else if (status === 403) {
                setResourceError(
                    "You do not have permission to access the resources."
                );
            } else if (status === 404) {
                setResourceError(
                    "The resources API was not found. Check ResourceController and the API base URL."
                );
            } else if (status === 500) {
                setResourceError(
                    "The backend returned an error while loading resources."
                );
            } else {
                setResourceError(
                    "Unable to load resources. Check that the Spring Boot backend is running."
                );
            }
        } finally {
            setLoading(false);
        }
    }, [skills]);

    useEffect(() => {
        loadSkills();
    }, [loadSkills]);

    useEffect(() => {
        loadResources();
    }, [loadResources]);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(done));
        } catch (error) {
            console.warn("Unable to save resource progress", error);
        }
    }, [done]);

    /* -----------------------------------------------------------
     * Selected skill
     * ----------------------------------------------------------- */

    const selectedSkillObject = useMemo(
        () =>
            skills.find(
                skill => String(skill.id) === String(selectedSkill)
            ) || null,
        [skills, selectedSkill]
    );

    /* -----------------------------------------------------------
     * Resource set for current selection
     * ----------------------------------------------------------- */

    const selectedSkillResources = useMemo(() => {
        if (!selectedSkillObject) return resources;
        return resources.filter(resource =>
            resourceMatchesSkill(resource, selectedSkillObject)
        );
    }, [resources, selectedSkillObject]);

    const selectedSkillGeneratedResources = useMemo(() => {
        if (!selectedSkillObject) return [];

        if (selectedSkillResources.length > 0) return [];

        return generatedProgressionFor(selectedSkillObject);
    }, [selectedSkillObject, selectedSkillResources]);

    const generatedFallbackCount = useMemo(
        () =>
            skills.filter(skill =>
                !resources.some(resource => resourceMatchesSkill(resource, skill))
            ).length,
        [skills, resources]
    );

    /* -----------------------------------------------------------
     * Types and categories
     * ----------------------------------------------------------- */

    const types = useMemo(() => {
        const source =
            selectedSkill !== "ALL"
                ? selectedSkillResources
                : resources;

        return [
            ...new Set(
                source
                    .map(resource => text(resource.type))
                    .filter(Boolean)
            )
        ].sort((a, b) => a.localeCompare(b));
    }, [resources, selectedSkill, selectedSkillResources]);

    const categories = useMemo(() => {
        return [
            ...new Set([
                ...skills.map(skill => text(skill.category)),
                ...resources.map(resource => text(resource.category))
            ].filter(Boolean))
        ].sort((a, b) => a.localeCompare(b));
    }, [skills, resources]);

    /* -----------------------------------------------------------
     * Search/filter/sort
     * ----------------------------------------------------------- */

    const filteredResources = useMemo(() => {
        const selectedSource =
            selectedSkill === "ALL"
                ? resources
                : selectedSkillResources.length > 0
                    ? selectedSkillResources
                    : selectedSkillGeneratedResources;

        let result = [...selectedSource];
        const query = lower(search);

        if (query) {
            result = result.filter(resource => {
                const searchable = [
                    resource.title,
                    resource.description,
                    resource.skillName,
                    resource.category,
                    resource.type,
                    resource.skillLevel
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

                return searchable.includes(query);
            });
        }

        if (selectedType !== "ALL") {
            result = result.filter(
                resource =>
                    lower(resource.type) === lower(selectedType)
            );
        }

        if (selectedCategory !== "ALL") {
            result = result.filter(
                resource =>
                    lower(resource.category) === lower(selectedCategory)
            );
        }

        if (sortBy === "TITLE") {
            result.sort((a, b) =>
                text(a.title).localeCompare(text(b.title))
            );
        } else if (sortBy === "SKILL") {
            result.sort((a, b) =>
                text(a.skillName).localeCompare(text(b.skillName))
            );
        } else if (sortBy === "LEVEL") {
            result.sort(
                (a, b) =>
                    (levelRank[normalizeLevel(a.skillLevel)] || 9) -
                    (levelRank[normalizeLevel(b.skillLevel)] || 9)
            );
        } else {
            result.sort(
                (a, b) => Number(b.id || 0) - Number(a.id || 0)
            );
        }

        return result;
    }, [
        resources,
        search,
        selectedSkill,
        selectedSkillResources,
        selectedSkillGeneratedResources,
        selectedType,
        selectedCategory,
        sortBy
    ]);

    useEffect(() => {
        setPage(1);
    }, [
        search,
        selectedSkill,
        selectedType,
        selectedCategory,
        sortBy
    ]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredResources.length / PER_PAGE)
    );

    const currentPage = Math.min(page, totalPages);

    const pageItems = filteredResources.slice(
        (currentPage - 1) * PER_PAGE,
        currentPage * PER_PAGE
    );

    /* -----------------------------------------------------------
     * Progress
     * ----------------------------------------------------------- */

    const isDone = useCallback(
        resource => Boolean(done[progressKey(resource)]),
        [done]
    );

    const toggleDone = useCallback(resource => {
        const key = progressKey(resource);

        setDone(previous => ({
            ...previous,
            [key]: !previous[key]
        }));
    }, []);

    const progressFor = useCallback(
        skillId => {
            const skill = skills.find(
                item => String(item.id) === String(skillId)
            );

            if (!skill) return 0;

            const actual = resources.filter(resource =>
                resourceMatchesSkill(resource, skill)
            );

            if (actual.length > 0) {
                const completed = actual.filter(resource =>
                    isDone(resource)
                ).length;

                return Math.round((completed / actual.length) * 100);
            }

            const generated = generatedProgressionFor(skill);
            if (!generated.length) return 0;

            const completed = generated.filter(resource =>
                isDone(resource)
            ).length;

            return Math.round((completed / generated.length) * 100);
        },
        [skills, resources, isDone]
    );

    const completedResources = useMemo(
        () => resources.filter(resource => isDone(resource)).length,
        [resources, isDone]
    );

    const completedGeneratedSteps = useMemo(
        () =>
            skills.reduce((total, skill) => {
                const actual = resources.filter(resource =>
                    resourceMatchesSkill(resource, skill)
                );

                if (actual.length > 0) return total;

                const generated = generatedProgressionFor(skill);
                return (
                    total +
                    generated.filter(resource => isDone(resource)).length
                );
            }, 0),
        [skills, resources, isDone]
    );

    const progressUnits = resources.length + generatedFallbackCount * 3;
    const completedUnits = completedResources + completedGeneratedSteps;
    const overall = progressUnits
        ? Math.round((completedUnits / progressUnits) * 100)
        : 0;

    const completedSkills = skills.filter(
        skill => progressFor(skill.id) === 100
    ).length;

    /* -----------------------------------------------------------
     * UI actions
     * ----------------------------------------------------------- */

    const chooseSkill = skill => {
        setSelectedSkill(String(skill.id));
        setSelectedType("ALL");
        setSelectedCategory("ALL");
        setSearch("");
        setPage(1);
        setTab("library");

        window.setTimeout(() => {
            document
                .getElementById("resource-library")
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
        }, 60);
    };

    const clearSkill = () => {
        setSelectedSkill("ALL");
        setSelectedType("ALL");
        setSelectedCategory("ALL");
        setSearch("");
        setPage(1);
    };

    const reset = () => {
        setSearch("");
        setSelectedSkill("ALL");
        setSelectedType("ALL");
        setSelectedCategory("ALL");
        setSortBy("LATEST");
        setPage(1);
    };

    const retry = () => {
        loadSkills();
        loadResources();
    };

    /* -----------------------------------------------------------
     * Loading screen
     * ----------------------------------------------------------- */

    if (loading && skillsLoading) {
        return (
            <div className="resources-page">
                <div className="resources-container">
                    <div className="resource-loader">
                        <div className="loader-icon">
                            <i className="bi bi-stars" />
                        </div>
                        <h2>Building your learning universe</h2>
                        <p>
                            Loading your complete skill and resource library...
                        </p>
                        <div className="loader-bar">
                            <span />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /* -----------------------------------------------------------
     * Main page
     * ----------------------------------------------------------- */

    return (
        <div className="resources-page">
            <style>{`
                .resources-page{--rp-primary:#4f46e5;--rp-primary2:#7c3aed;--rp-ink:#111827;--rp-muted:#64748b;--rp-line:#e7ebf2;background:#f5f7fb!important;min-height:100vh;color:var(--rp-ink)}
                .resources-page *{box-sizing:border-box}
                .resources-container{max-width:1480px!important;margin:0 auto!important;padding:28px 34px 52px!important}
                .resources-hero{position:relative;overflow:hidden;display:flex;justify-content:space-between;gap:36px;padding:42px 46px!important;border-radius:28px!important;color:#fff!important;background:linear-gradient(135deg,#111827 0%,#312e81 55%,#4f46e5 100%)!important;box-shadow:0 24px 65px rgba(15,23,42,.16)!important;isolation:isolate}
                .resources-hero:before,.resources-hero:after{content:"";position:absolute;border-radius:50%;pointer-events:none;z-index:-1;background:rgba(255,255,255,.08)}
                .resources-hero:before{width:380px;height:380px;right:-120px;top:-190px}.resources-hero:after{width:250px;height:250px;left:42%;bottom:-175px}
                .hero-copy{max-width:720px}.eyebrow{display:inline-flex!important;align-items:center;gap:8px;padding:8px 13px!important;border:1px solid rgba(255,255,255,.16)!important;border-radius:999px!important;background:rgba(255,255,255,.08)!important;color:#fff!important;font-size:10px!important;font-weight:850!important;letter-spacing:.12em!important}
                .hero-copy h1{margin:17px 0 10px!important;font-size:clamp(38px,4vw,56px)!important;line-height:1.02!important;font-weight:850!important;letter-spacing:-.045em!important}.hero-copy p{margin:0!important;max-width:650px;color:rgba(255,255,255,.76)!important;font-size:15px!important;line-height:1.75!important}
                .hero-pills{display:flex;flex-wrap:wrap;gap:9px;margin-top:24px}.hero-pills span{display:inline-flex!important;align-items:center;gap:7px;padding:9px 12px!important;border:1px solid rgba(255,255,255,.1);border-radius:999px;background:rgba(255,255,255,.08);color:rgba(255,255,255,.88);font-size:10px;font-weight:750}
                .hero-progress{display:flex!important;align-items:center!important;gap:20px!important;min-width:360px!important;align-self:center}.ring{width:122px!important;height:122px!important;flex:0 0 122px!important;border-radius:50%;display:grid;place-items:center;background:conic-gradient(#fff var(--p),rgba(255,255,255,.13) 0)!important;position:relative}.ring:before{content:"";position:absolute;inset:9px;border-radius:50%;background:#27245e}.ring>div{position:relative;z-index:1;text-align:center}.ring strong{display:block;font-size:27px!important;line-height:1}.ring span{display:block;margin-top:6px;font-size:9px!important;opacity:.7}.hero-progress-copy{max-width:225px}.hero-progress-copy h3{margin:8px 0 7px!important;font-size:18px!important;line-height:1.35}.hero-progress-copy p{margin:0!important;color:rgba(255,255,255,.62)!important;font-size:12px!important;line-height:1.6}
                .stats-grid{display:grid!important;grid-template-columns:repeat(4,1fr)!important;gap:16px!important;margin:18px 0!important}.stat-card{background:#fff!important;border:1px solid var(--rp-line)!important;border-radius:18px!important;padding:20px!important;display:grid!important;grid-template-columns:44px 1fr!important;column-gap:13px;box-shadow:0 7px 25px rgba(15,23,42,.045)!important;transition:.2s ease}.stat-card:hover{transform:translateY(-3px);box-shadow:0 15px 35px rgba(15,23,42,.08)!important}.stat-card i{grid-row:span 2;width:44px!important;height:44px!important;border-radius:13px!important;display:grid;place-items:center;background:#eef2ff!important;color:#4f46e5!important;font-size:18px}.stat-card span{align-self:end;color:#718096!important;font-size:10px!important;font-weight:750}.stat-card strong{margin-top:4px;font-size:25px!important;line-height:1}
                .library-banner{display:flex!important;align-items:center!important;gap:20px!important;margin:22px 0!important;padding:23px 25px!important;border:1px solid #e6e7ff!important;border-radius:20px!important;background:linear-gradient(110deg,#fff,#f8f7ff)!important;box-shadow:0 8px 26px rgba(79,70,229,.05)!important}.banner-icon{width:54px!important;height:54px!important;flex:0 0 54px!important;border-radius:15px!important;display:grid;place-items:center;background:#ede9fe!important;color:#6d28d9!important;font-size:21px}.banner-copy{flex:1}.banner-copy span{font-size:9px!important;letter-spacing:.12em;font-weight:850;color:#6366f1}.banner-copy h2{margin:5px 0 4px!important;font-size:19px!important;letter-spacing:-.025em}.banner-copy p{margin:0!important;color:var(--rp-muted)!important;font-size:12px!important}.banner-count{text-align:right;min-width:105px}.banner-count strong{display:block;font-size:28px!important}.banner-count small{color:var(--rp-muted)!important;font-size:10px!important;font-weight:750}
                .notice{display:flex!important;align-items:center;gap:10px;margin:13px 0!important;padding:13px 16px!important;border-radius:13px!important;background:#eef2ff!important;border:1px solid #dfe4ff!important;color:#3730a3!important;font-size:12px!important}.error-notice{background:#fff1f2!important;border-color:#ffe0e4!important;color:#be123c!important}.error-notice button{margin-left:auto;border:0;border-radius:9px;padding:7px 13px;background:#be123c;color:#fff;font-weight:750;cursor:pointer}
                .tabs{display:flex!important;gap:5px!important;margin:25px 0 21px!important;padding:5px!important;width:max-content!important;max-width:100%;border:1px solid var(--rp-line)!important;border-radius:13px!important;background:#fff!important;box-shadow:0 5px 20px rgba(15,23,42,.04)!important}.tabs button{border:0!important;background:transparent!important;color:#64748b!important;padding:10px 17px!important;border-radius:9px!important;font-weight:750!important;font-size:12px!important;cursor:pointer;transition:.2s}.tabs button.active{background:#111827!important;color:#fff!important;box-shadow:0 6px 16px rgba(17,24,39,.16)!important}
                .section-head{display:flex!important;justify-content:space-between!important;align-items:flex-end!important;gap:20px!important;margin:31px 0 16px!important}.section-eyebrow{color:#6366f1!important;font-size:9px!important;letter-spacing:.12em;font-weight:850}.section-head h2{margin:4px 0 5px!important;font-size:25px!important;letter-spacing:-.035em}.section-head p{margin:0!important;color:var(--rp-muted)!important;font-size:12px!important}.count-pill{padding:9px 13px!important;border-radius:999px!important;background:#fff!important;border:1px solid var(--rp-line)!important;font-size:11px!important;white-space:nowrap}
                .skills-grid{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:12px!important}.skill-card{width:100%!important;display:flex!important;align-items:center!important;gap:13px!important;text-align:left!important;padding:15px!important;border:1px solid var(--rp-line)!important;border-radius:16px!important;background:#fff!important;cursor:pointer;transition:.2s ease;box-shadow:0 5px 18px rgba(15,23,42,.035)!important}.skill-card:hover{transform:translateY(-2px);border-color:#c7d2fe!important;box-shadow:0 13px 30px rgba(79,70,229,.09)!important}.skill-card.active{border-color:#818cf8!important;box-shadow:0 0 0 3px rgba(99,102,241,.1),0 13px 30px rgba(79,70,229,.09)!important}.skill-icon{width:44px!important;height:44px!important;flex:0 0 44px!important;display:grid!important;place-items:center!important;border-radius:13px!important;background:#f1f5ff!important;color:#4f46e5!important;font-size:18px}.skill-details{min-width:0;flex:1}.skill-details b{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px!important}.skill-details small{display:block;margin-top:4px;color:#7b8798!important;font-size:9px!important;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.skill-details em{display:block;height:4px;margin-top:9px;border-radius:99px;background:#eef1f5;overflow:hidden}.skill-details em span{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#4f46e5,#8b5cf6)}.skill-percent{display:flex!important;align-items:center;gap:6px;color:#475569!important;font-size:10px!important;font-weight:850}
                .selected-panel{display:flex!important;justify-content:space-between!important;gap:24px!important;margin:20px 0!important;padding:22px!important;border-radius:20px!important;color:#fff!important;background:linear-gradient(120deg,#111827,#312e81)!important;box-shadow:0 15px 36px rgba(49,46,129,.15)!important}.selected-main{display:flex;gap:15px;align-items:center;min-width:0}.selected-icon{width:50px!important;height:50px!important;flex:0 0 50px!important;display:grid;place-items:center;border-radius:14px;background:rgba(255,255,255,.1);font-size:21px}.selected-main>div>span{font-size:8px!important;letter-spacing:.13em;opacity:.6;font-weight:850}.selected-main h3{margin:3px 0 5px!important;font-size:21px!important}.selected-main p{margin:0!important;color:rgba(255,255,255,.63)!important;font-size:11px!important;line-height:1.55}.selected-progress{width:275px!important;align-self:center}.selected-progress>div:first-child{display:flex;justify-content:space-between;font-size:10px;color:rgba(255,255,255,.65)}.selected-progress .progress-track{margin-top:8px;height:6px;background:rgba(255,255,255,.12);border-radius:99px;overflow:hidden}.selected-progress .progress-track span{display:block;height:100%;background:#fff;border-radius:inherit}.selected-progress button{margin-top:10px;border:0;background:transparent;color:rgba(255,255,255,.65);font-size:10px;float:right;cursor:pointer}
                .toolbar{display:flex!important;align-items:center!important;gap:11px!important;margin:22px 0 12px!important;padding:13px!important;border:1px solid var(--rp-line)!important;background:#fff!important;border-radius:16px!important;box-shadow:0 6px 22px rgba(15,23,42,.04)!important}.search-box{flex:1;min-width:240px;display:flex!important;align-items:center;gap:9px;padding:0 12px;height:42px;border:1px solid #e3e8f0!important;border-radius:10px!important;background:#fafbfc!important}.search-box>i{color:#94a3b8}.search-box input{width:100%;border:0;outline:0;background:transparent;font-size:12px;color:#111827}.search-box button{border:0;background:transparent;color:#94a3b8;cursor:pointer}.filters{display:flex!important;gap:8px!important;flex-wrap:wrap;justify-content:flex-end}.filters select{height:42px;min-width:115px;padding:0 29px 0 11px;border:1px solid #e3e8f0!important;border-radius:10px!important;background:#fff;color:#475569;font-size:11px;font-weight:650;outline:0}.view-toggle{display:flex;padding:3px;border:1px solid #e3e8f0;border-radius:10px}.view-toggle button{width:35px;height:35px;border:0;border-radius:7px;background:transparent;color:#94a3b8;cursor:pointer}.view-toggle button.active{background:#eef2ff;color:#4f46e5}
                .results-row{display:flex!important;justify-content:space-between;align-items:center;margin:16px 2px;color:#7b8798;font-size:11px}.results-row b{color:#111827}.results-row button{border:0;background:transparent;color:#4f46e5;font-weight:750;cursor:pointer}
                .resource-grid{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:16px!important}.resource-list{display:grid!important;grid-template-columns:1fr!important;gap:11px!important}.resource-card{position:relative;overflow:hidden;display:flex!important;flex-direction:column!important;min-height:292px;border:1px solid var(--rp-line)!important;border-radius:18px!important;background:#fff!important;box-shadow:0 7px 25px rgba(15,23,42,.045)!important;transition:.22s ease}.resource-card:hover{transform:translateY(-3px);border-color:#d5daf5!important;box-shadow:0 18px 40px rgba(15,23,42,.09)!important}.resource-card.completed{border-color:#c7ead7!important}.resource-card:before{content:"";position:absolute;inset:0 0 auto;height:3px;background:linear-gradient(90deg,#4f46e5,#8b5cf6)}.card-top{display:flex!important;justify-content:space-between;align-items:center;padding:18px 18px 8px!important}.resource-icon{width:43px!important;height:43px!important;display:grid;place-items:center;border-radius:12px;background:#f1f5ff;color:#4f46e5;font-size:18px}.type-badge{padding:6px 8px;border-radius:7px;background:#f8fafc;color:#64748b;font-size:8px;font-weight:850;letter-spacing:.06em}.card-body{padding:8px 18px 16px!important;flex:1}.resource-skill{display:inline-flex;align-items:center;gap:5px;color:#6366f1;font-size:9px;font-weight:850}.card-body h3{margin:9px 0 7px!important;font-size:15px!important;line-height:1.4!important;letter-spacing:-.02em}.card-body p{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;min-height:55px;margin:0;color:#718096!important;font-size:11px!important;line-height:1.58!important}.meta{display:flex!important;justify-content:space-between;align-items:center;gap:8px;margin-top:15px;color:#94a3b8;font-size:9px}.meta span:first-child{display:flex;align-items:center;gap:5px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.level{padding:5px 7px;border-radius:6px;background:#f8fafc;color:#64748b;font-weight:850;font-size:8px}.level.beginner{background:#ecfdf5;color:#047857}.level.intermediate{background:#eff6ff;color:#1d4ed8}.level.advanced{background:#fff7ed;color:#c2410c}.level.expert{background:#fdf2f8;color:#be185d}.card-footer{display:flex!important;justify-content:space-between;align-items:center;gap:8px;padding:12px 18px!important;border-top:1px solid #f0f2f6;background:#fcfdff!important}.done-btn,.card-footer>a{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:34px;padding:0 10px;border-radius:8px;font-size:10px;font-weight:750;text-decoration:none;cursor:pointer}.done-btn{border:1px solid #e2e8f0;background:#fff;color:#64748b}.done-btn.done{border-color:#bbf7d0;background:#f0fdf4;color:#15803d}.card-footer>a{border:1px solid #4f46e5;background:#4f46e5;color:#fff}.card-footer>a:hover{background:#4338ca}.generated-card{background:linear-gradient(180deg,#fff,#faf9ff)!important}
                .generated-banner{display:flex!important;align-items:center;gap:13px;margin:14px 0;padding:14px 16px;border:1px solid #ddd6fe;border-radius:14px;background:#faf5ff}.generated-banner-icon{width:38px;height:38px;display:grid;place-items:center;border-radius:10px;background:#ede9fe;color:#7c3aed}.generated-banner>div:nth-child(2){flex:1}.generated-banner span{display:block;color:#7c3aed;font-size:8px;font-weight:850;letter-spacing:.1em}.generated-banner strong{display:block;margin-top:2px;font-size:11px}.generated-banner p{margin:3px 0 0;color:#7c8798;font-size:10px}.generated-banner>b{padding:7px 9px;border-radius:8px;background:#fff;color:#7c3aed;font-size:9px}.pagination{display:flex!important;justify-content:center;align-items:center;gap:5px;margin-top:25px}.pagination button{min-width:35px;height:35px;border:1px solid #e3e8f0;border-radius:9px;background:#fff;color:#64748b;font-size:10px;font-weight:750;cursor:pointer}.pagination button.active{border-color:#4f46e5;background:#4f46e5;color:#fff}.pagination button:disabled{opacity:.4;cursor:not-allowed}.empty-state{margin:20px 0;padding:60px 20px;text-align:center;border:1px dashed #dbe1ea;border-radius:18px;background:#fff}.empty-state>div{width:54px;height:54px;margin:0 auto 13px;display:grid;place-items:center;border-radius:15px;background:#f1f5f9;color:#64748b;font-size:20px}.empty-state h2{margin:0 0 7px;font-size:18px}.empty-state p{max-width:530px;margin:0 auto 17px;color:#7b8798;font-size:11px;line-height:1.6}.empty-state button{border:0;border-radius:9px;padding:9px 14px;background:#111827;color:#fff;font-size:10px;font-weight:750;cursor:pointer}
                .progression-grid{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:14px!important}.progression-card{border:1px solid var(--rp-line)!important;border-radius:17px!important;background:#fff!important;padding:17px!important;text-align:left;cursor:pointer;transition:.2s;box-shadow:0 6px 22px rgba(15,23,42,.04)!important}.progression-card:hover{transform:translateY(-2px);border-color:#c7d2fe!important}.progression-card.complete{border-color:#bbf7d0!important;background:#fbfffc!important}.progression-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}.progression-top b{color:#4f46e5;font-size:11px}.progression-card>strong{display:block;font-size:14px}.progression-card>small{display:block;margin-top:4px;color:#94a3b8;font-size:9px}.progression-card .progress-track{height:5px;margin:14px 0;border-radius:99px;background:#eef1f5;overflow:hidden}.progression-card .progress-track span{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#4f46e5,#8b5cf6)}.progression-card footer{display:flex;justify-content:space-between;color:#7b8798;font-size:9px}
                .resources-footer{display:flex!important;justify-content:space-between;gap:15px;margin-top:38px!important;padding-top:18px!important;border-top:1px solid #e8edf5!important;color:#94a3b8!important;font-size:9px!important}.resources-footer span:first-child{color:#64748b;font-weight:750}
                .resource-loader{border-radius:24px!important;background:#fff!important;border:1px solid var(--rp-line)!important;box-shadow:0 20px 50px rgba(15,23,42,.07)!important}
                @media(max-width:1100px){.resources-hero{flex-direction:column}.hero-progress{min-width:0!important}.skills-grid,.resource-grid,.progression-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}.stats-grid{grid-template-columns:repeat(2,1fr)!important}.toolbar{align-items:stretch!important;flex-direction:column!important}.filters{justify-content:flex-start!important}}
                @media(max-width:700px){.resources-container{padding:16px 14px 30px!important}.resources-hero{padding:27px 22px!important;border-radius:21px!important}.hero-progress{flex-direction:row!important}.hero-progress-copy{max-width:none}.stats-grid,.skills-grid,.resource-grid,.progression-grid{grid-template-columns:1fr!important}.library-banner,.selected-panel{align-items:flex-start!important;flex-direction:column!important}.banner-count{text-align:left}.selected-progress{width:100%!important}.filters select{flex:1;min-width:0}.search-box{min-width:0}.resources-footer{flex-direction:column!important}}
            `}</style>
            <div className="resources-container">
                {/* =====================================================
                    HERO
                ====================================================== */}
                <header className="resources-hero">
                    <div className="hero-copy">
                        <span className="eyebrow">
                            <i className="bi bi-stars" />
                            PERSONALIZED LEARNING
                        </span>

                        <h1>Learning Resources</h1>

                        <p>
                            Discover curated technical resources matched to your skills,
                            learning goals and progression path.
                        </p>

                        <div className="hero-pills">
                            <span>
                                <i className="bi bi-person-check" />
                                Personalized for you
                            </span>
                            <span>
                                <i className="bi bi-diagram-3" />
                                {skills.length} master skills
                            </span>
                            <span>
                                <i className="bi bi-arrow-repeat" />
                                Progress tracked
                            </span>
                        </div>
                    </div>

                    <div className="hero-progress">
                        <div
                            className="ring"
                            style={{ "--p": `${overall * 3.6}deg` }}
                        >
                            <div>
                                <strong>{overall}%</strong>
                                <span>progress</span>
                            </div>
                        </div>

                        <div className="hero-progress-copy">
                            <span className="progress-label">
                                YOUR LEARNING JOURNEY
                            </span>
                            <h3>
                                {completedUnits} learning steps completed
                            </h3>
                            <p>
                                Continue your path and mark resources complete as you learn.
                            </p>
                        </div>
                    </div>
                </header>

                {/* =====================================================
                    STATS
                ====================================================== */}
                <section className="stats-grid">
                    <div className="stat-card">
                        <i className="bi bi-collection-play" />
                        <span>Learning Resources</span>
                        <strong>{resources.length}</strong>
                    </div>

                    <div className="stat-card">
                        <i className="bi bi-stars" />
                        <span>Master Skills</span>
                        <strong>{skills.length}</strong>
                    </div>

                    <div className="stat-card">
                        <i className="bi bi-grid-1x2" />
                        <span>Categories</span>
                        <strong>{categories.length}</strong>
                    </div>

                    <div className="stat-card">
                        <i className="bi bi-trophy" />
                        <span>Skills Completed</span>
                        <strong>{completedSkills}</strong>
                    </div>
                </section>

                {/* =====================================================
                    LIBRARY BANNER
                ====================================================== */}
                <section className="library-banner">
                    <div className="banner-icon">
                        <i className="bi bi-lightbulb-fill" />
                    </div>

                    <div className="banner-copy">
                        <span>YOUR LEARNING LIBRARY</span>
                        <h2>Resources organized for your learning path</h2>
                        <p>
                            Videos, courses, documentation, articles and hands-on practice
                            organized around the skills available on the platform.
                        </p>
                    </div>

                    <div className="banner-count">
                        <strong>{skills.length}</strong>
                        <small>skills covered</small>
                    </div>
                </section>

                {/* =====================================================
                    NOTICE / ERROR
                ====================================================== */}
                {notice && (
                    <div className="notice">
                        <i className="bi bi-info-circle-fill" />
                        <span>{notice}</span>
                    </div>
                )}

                {resourceError && (
                    <div className="notice error-notice">
                        <i className="bi bi-exclamation-triangle-fill" />
                        <span>{resourceError}</span>
                        <button onClick={retry}>Retry</button>
                    </div>
                )}

                {/* =====================================================
                    TABS
                ====================================================== */}
                <div className="tabs">
                    <button
                        className={tab === "library" ? "active" : ""}
                        onClick={() => setTab("library")}
                    >
                        <i className="bi bi-collection" />
                        Resource Library
                    </button>

                    <button
                        className={tab === "progression" ? "active" : ""}
                        onClick={() => setTab("progression")}
                    >
                        <i className="bi bi-signpost-2" />
                        Learning Progression
                    </button>
                </div>

                {/* =====================================================
                    PROGRESSION TAB
                ====================================================== */}
                {tab === "progression" ? (
                    <section className="progression-section">
                        <div className="section-head">
                            <div>
                                <span className="section-eyebrow">
                                    AI MENTOR PATH
                                </span>
                                <h2>Your Skill Progression</h2>
                                <p>
                                    Every master skill gets a clear path from fundamentals to
                                    practical mastery.
                                </p>
                            </div>

                            <strong>
                                {completedSkills}/{skills.length} completed
                            </strong>
                        </div>

                        <div className="progression-grid">
                            {skills.map(skill => {
                                const progress = progressFor(skill.id);
                                const actualCount = resources.filter(resource =>
                                    resourceMatchesSkill(resource, skill)
                                ).length;
                                const stepCount = actualCount || 3;

                                return (
                                    <button
                                        type="button"
                                        key={skill.id}
                                        className={`progression-card ${
                                            progress === 100 ? "complete" : ""
                                        }`}
                                        onClick={() => chooseSkill(skill)}
                                    >
                                        <div className="progression-top">
                                            <span className="skill-icon">
                                                <i className={`bi ${iconFor(skill.category)}`} />
                                            </span>
                                            <b>{progress}%</b>
                                        </div>

                                        <strong>{skill.name}</strong>
                                        <small>{skill.category}</small>

                                        <div className="progress-track">
                                            <span
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>

                                        <footer>
                                            <span>
                                                {stepCount} learning {actualCount ? "resources" : "steps"}
                                            </span>
                                            <i className="bi bi-arrow-right" />
                                        </footer>
                                    </button>
                                );
                            })}
                        </div>
                    </section>
                ) : (
                    <section id="resource-library">
                        {/* =================================================
                            SKILL UNIVERSE
                        ================================================== */}
                        <div className="section-head">
                            <div>
                                <span className="section-eyebrow">
                                    PLATFORM CATALOG
                                </span>
                                <h2>Your Skill Universe</h2>
                                <p>
                                    Browse all skills available on the AI Mentor platform.
                                </p>
                            </div>

                            <strong className="count-pill">
                                {skills.length} Skills
                            </strong>
                        </div>

                        <div className="skills-grid">
                            {skills.map(skill => {
                                const progress = progressFor(skill.id);
                                const resourceCount = resources.filter(resource =>
                                    resourceMatchesSkill(resource, skill)
                                ).length;

                                return (
                                    <button
                                        type="button"
                                        key={skill.id}
                                        className={`skill-card ${
                                            String(selectedSkill) === String(skill.id)
                                                ? "active"
                                                : ""
                                        }`}
                                        onClick={() => chooseSkill(skill)}
                                        title={skill.description || skill.name}
                                    >
                                        <span className="skill-icon">
                                            <i className={`bi ${iconFor(skill.category)}`} />
                                        </span>

                                        <span className="skill-details">
                                            <b>{skill.name}</b>
                                            <small>
                                                {skill.category}
                                                {resourceCount === 0
                                                    ? " • Generated path"
                                                    : ` • ${resourceCount} resources`}
                                            </small>

                                            <em>
                                                <span
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </em>
                                        </span>

                                        <span className="skill-percent">
                                            {progress}%
                                            <i className="bi bi-chevron-right" />
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* =================================================
                            SELECTED SKILL
                        ================================================== */}
                        {selectedSkillObject && (
                            <div className="selected-panel">
                                <div className="selected-main">
                                    <span className="selected-icon">
                                        <i
                                            className={`bi ${iconFor(
                                                selectedSkillObject.category
                                            )}`}
                                        />
                                    </span>

                                    <div>
                                        <span>SELECTED SKILL</span>
                                        <h3>{selectedSkillObject.name}</h3>
                                        <p>
                                            {selectedSkillObject.description ||
                                                `Follow your ${selectedSkillObject.name} learning progression from fundamentals to hands-on practice.`}
                                        </p>
                                    </div>
                                </div>

                                <div className="selected-progress">
                                    <div>
                                        <span>Skill progress</span>
                                        <b>
                                            {progressFor(selectedSkillObject.id)}%
                                        </b>
                                    </div>

                                    <div className="progress-track">
                                        <span
                                            style={{
                                                width: `${progressFor(
                                                    selectedSkillObject.id
                                                )}%`
                                            }}
                                        />
                                    </div>

                                    <button onClick={clearSkill} type="button">
                                        Clear
                                        <i className="bi bi-x-lg" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* =================================================
                            TOOLBAR
                        ================================================== */}
                        <div className="toolbar">
                            <div className="search-box">
                                <i className="bi bi-search" />

                                <input
                                    value={search}
                                    onChange={event => setSearch(event.target.value)}
                                    placeholder="Search resources, skills or topics..."
                                    aria-label="Search resources"
                                />

                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => setSearch("")}
                                        aria-label="Clear search"
                                    >
                                        <i className="bi bi-x-circle-fill" />
                                    </button>
                                )}
                            </div>

                            <div className="filters">
                                <select
                                    value={selectedSkill}
                                    onChange={event => {
                                        const value = event.target.value;
                                        if (value === "ALL") {
                                            clearSkill();
                                        } else {
                                            const skill = skills.find(
                                                item => String(item.id) === value
                                            );
                                            if (skill) chooseSkill(skill);
                                        }
                                    }}
                                >
                                    <option value="ALL">
                                        All Skills ({skills.length})
                                    </option>
                                    {skills.map(skill => (
                                        <option key={skill.id} value={skill.id}>
                                            {skill.name}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={selectedType}
                                    onChange={event =>
                                        setSelectedType(event.target.value)
                                    }
                                >
                                    <option value="ALL">All Types</option>
                                    {types.map(typeValue => (
                                        <option key={typeValue} value={typeValue}>
                                            {typeValue}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={selectedCategory}
                                    onChange={event =>
                                        setSelectedCategory(event.target.value)
                                    }
                                >
                                    <option value="ALL">All Categories</option>
                                    {categories.map(category => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={sortBy}
                                    onChange={event => setSortBy(event.target.value)}
                                >
                                    <option value="LATEST">Latest</option>
                                    <option value="TITLE">Title</option>
                                    <option value="SKILL">Skill</option>
                                    <option value="LEVEL">Level</option>
                                </select>

                                <div className="view-toggle">
                                    <button
                                        type="button"
                                        className={view === "grid" ? "active" : ""}
                                        onClick={() => setView("grid")}
                                        aria-label="Grid view"
                                    >
                                        <i className="bi bi-grid-3x3-gap-fill" />
                                    </button>

                                    <button
                                        type="button"
                                        className={view === "list" ? "active" : ""}
                                        onClick={() => setView("list")}
                                        aria-label="List view"
                                    >
                                        <i className="bi bi-list-ul" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* =================================================
                            RESULTS HEADER
                        ================================================== */}
                        <div className="results-row">
                            <span>
                                <b>{filteredResources.length}</b> learning steps available
                                {selectedSkillObject ? (
                                    <>
                                        {" "}for <b>{selectedSkillObject.name}</b>
                                    </>
                                ) : null}
                            </span>

                            {(search ||
                                selectedSkill !== "ALL" ||
                                selectedType !== "ALL" ||
                                selectedCategory !== "ALL") && (
                                <button type="button" onClick={reset}>
                                    <i className="bi bi-arrow-counterclockwise" />
                                    Reset filters
                                </button>
                            )}
                        </div>

                        {/* =================================================
                            EMPTY / GENERATED PATH / RESOURCE CARDS
                        ================================================== */}
                        {filteredResources.length === 0 ? (
                            <div className="empty-state">
                                <div>
                                    <i className="bi bi-search" />
                                </div>
                                <h2>No matching resources</h2>
                                <p>
                                    Change the filters or select another skill. Every master
                                    skill has a frontend learning progression even when the
                                    backend has not assigned a resource to it yet.
                                </p>
                                <button type="button" onClick={reset}>
                                    Reset Filters
                                </button>
                            </div>
                        ) : (
                            <>
                                {selectedSkillObject &&
                                    selectedSkillResources.length === 0 &&
                                    !search &&
                                    selectedType === "ALL" &&
                                    selectedCategory === "ALL" && (
                                        <div className="generated-banner">
                                            <div className="generated-banner-icon">
                                                <i className="bi bi-stars" />
                                            </div>
                                            <div>
                                                <span>LEARNING PATH GENERATED</span>
                                                <strong>
                                                    No backend resource is assigned to {selectedSkillObject.name} yet.
                                                </strong>
                                                <p>
                                                    We kept your backend untouched and generated a 3-step
                                                    frontend progression for this skill.
                                                </p>
                                            </div>
                                            <b>3 steps</b>
                                        </div>
                                    )}

                                <div
                                    className={
                                        view === "grid"
                                            ? "resource-grid"
                                            : "resource-list"
                                    }
                                >
                                    {pageItems.map(resource => {
                                        const completed = isDone(resource);
                                        const generated = Boolean(resource.generated);

                                        return (
                                            <article
                                                key={`${resource.id}-${resource.skillId}`}
                                                className={`resource-card ${
                                                    completed ? "completed" : ""
                                                } ${generated ? "generated-card" : ""}`}
                                            >
                                                <div className="card-top">
                                                    <span className="resource-icon">
                                                        <i
                                                            className={`bi ${
                                                                generated
                                                                    ? "bi-stars"
                                                                    : resourceIcon(resource.type)
                                                            }`}
                                                        />
                                                    </span>

                                                    <span className="type-badge">
                                                        {generated
                                                            ? "GENERATED"
                                                            : text(resource.type).toUpperCase()}
                                                    </span>
                                                </div>

                                                <div className="card-body">
                                                    <span className="resource-skill">
                                                        <i className="bi bi-lightning-charge-fill" />
                                                        {resource.skillName || "Learning Resource"}
                                                    </span>

                                                    <h3>{resource.title}</h3>

                                                    <p>{resource.description}</p>

                                                    <div className="meta">
                                                        <span>
                                                            <i className="bi bi-folder2-open" />
                                                            {resource.category}
                                                        </span>

                                                        <span
                                                            className={`level ${lower(
                                                                normalizeLevel(resource.skillLevel)
                                                            )}`}
                                                        >
                                                            {normalizeLevel(resource.skillLevel)}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="card-footer">
                                                    <button
                                                        type="button"
                                                        className={`done-btn ${
                                                            completed ? "done" : ""
                                                        }`}
                                                        onClick={() => toggleDone(resource)}
                                                    >
                                                        <i
                                                            className={`bi ${
                                                                completed
                                                                    ? "bi-check-circle-fill"
                                                                    : "bi-circle"
                                                            }`}
                                                        />
                                                        {completed ? "Completed" : "Mark done"}
                                                    </button>

                                                    <a
                                                        href={resource.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        {generated
                                                            ? "Explore Step"
                                                            : actionText(resource.type)}
                                                        <i className="bi bi-arrow-up-right" />
                                                    </a>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>

                                {/* =================================================
                                    PAGINATION
                                ================================================== */}
                                {totalPages > 1 && (
                                    <div className="pagination">
                                        <button
                                            type="button"
                                            disabled={currentPage === 1}
                                            onClick={() => setPage(currentPage - 1)}
                                            aria-label="Previous page"
                                        >
                                            <i className="bi bi-chevron-left" />
                                        </button>

                                        {Array.from(
                                            { length: totalPages },
                                            (_, index) => index + 1
                                        ).map(pageNumber => (
                                            <button
                                                type="button"
                                                key={pageNumber}
                                                className={
                                                    currentPage === pageNumber
                                                        ? "active"
                                                        : ""
                                                }
                                                onClick={() => setPage(pageNumber)}
                                            >
                                                {pageNumber}
                                            </button>
                                        ))}

                                        <button
                                            type="button"
                                            disabled={currentPage === totalPages}
                                            onClick={() => setPage(currentPage + 1)}
                                            aria-label="Next page"
                                        >
                                            <i className="bi bi-chevron-right" />
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </section>
                )}

                {/* =====================================================
                    FOOTER
                ====================================================== */}
                <footer className="resources-footer">
                    <span>
                        <i className="bi bi-stars" />
                        AI Mentor Learning Library
                    </span>
                    <span>
                        {skills.length} skills • {resources.length} resources • {overall}% overall progress
                    </span>
                </footer>
            </div>
        </div>
    );
}
