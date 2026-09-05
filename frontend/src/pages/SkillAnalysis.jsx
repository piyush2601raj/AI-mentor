import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./StudentSkill.css";

const PROFICIENCY_LEVELS = [
    {
        value: "BEGINNER",
        label: "Beginner",
        description: "I'm just starting",
    },
    {
        value: "INTERMEDIATE",
        label: "Intermediate",
        description: "I know the basics",
    },
    {
        value: "ADVANCED",
        label: "Advanced",
        description: "I can build projects",
    },
];

function StudentSkill() {

    const navigate = useNavigate();

    const [skills, setSkills] = useState([]);
    const [selectedSkills, setSelectedSkills] = useState([]);

    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("ALL");

    const [loading, setLoading] = useState(true);

    const [addingSkillId, setAddingSkillId] = useState(null);
    const [updatingSkillId, setUpdatingSkillId] = useState(null);
    const [removingSkillId, setRemovingSkillId] = useState(null);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // =====================================================
    // LOAD DATA
    // =====================================================

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {

        try {

            setLoading(true);
            setError("");

            const [
                skillsResponse,
                selectedSkillsResponse
            ] = await Promise.all([
                api.get("/api/skills"),
                api.get("/api/students/me/skills")
            ]);

            setSkills(
                Array.isArray(skillsResponse.data)
                    ? skillsResponse.data
                    : []
            );

            setSelectedSkills(
                Array.isArray(selectedSkillsResponse.data)
                    ? selectedSkillsResponse.data
                    : []
            );

        } catch (error) {

            console.error("Skill loading error:", error);

            if (error.response?.status === 401) {

                setError(
                    "Your session has expired. Please login again."
                );

            } else if (error.response?.status === 403) {

                setError(
                    "You are not authorized. Please login again."
                );

            } else {

                setError("Unable to load skills.");
            }

        } finally {

            setLoading(false);
        }
    };

    // =====================================================
    // CATEGORY LIST
    // =====================================================

    const categories = useMemo(() => {

        const uniqueCategories = [
            ...new Set(
                skills
                    .map((skill) => skill.category)
                    .filter(Boolean)
            )
        ];

        return uniqueCategories.sort();

    }, [skills]);

    // =====================================================
    // FILTER SKILLS
    // =====================================================

    const filteredSkills = useMemo(() => {

        const searchText =
            search.trim().toLowerCase();

        return skills.filter((skill) => {

            const matchesSearch =
                !searchText ||
                skill.name?.toLowerCase().includes(searchText) ||
                skill.description?.toLowerCase().includes(searchText) ||
                skill.category?.toLowerCase().includes(searchText);

            const matchesCategory =
                selectedCategory === "ALL" ||
                skill.category?.toLowerCase() ===
                selectedCategory.toLowerCase();

            return matchesSearch && matchesCategory;
        });

    }, [skills, search, selectedCategory]);

    // =====================================================
    // GET SELECTED SKILL
    // =====================================================

    const getSelectedSkill = (skillId) => {

        return selectedSkills.find(
            (item) =>
                Number(
                    item.skillId ??
                    item.skill?.id
                ) === Number(skillId)
        );
    };

    const isSkillSelected = (skillId) => {

        return Boolean(
            getSelectedSkill(skillId)
        );
    };

    // =====================================================
    // GET SKILL ID
    // =====================================================

    const getSkillIdFromSelected = (item) => {

        return (
            item.skillId ??
            item.skill?.id ??
            item.id
        );
    };

    // =====================================================
    // ADD SKILL
    // =====================================================

    const addSkill = async (skill) => {

        try {

            setAddingSkillId(skill.id);
            setError("");
            setSuccess("");

            const response = await api.post(
                "/api/students/me/skills",
                null,
                {
                    params: {
                        skillId: skill.id,
                        skillLevel: "BEGINNER"
                    }
                }
            );

            const addedSkill = response.data;

            setSelectedSkills((previous) => {

                const alreadyExists =
                    previous.some(
                        (item) =>
                            Number(
                                getSkillIdFromSelected(item)
                            ) === Number(skill.id)
                    );

                if (alreadyExists) {
                    return previous;
                }

                return [
                    ...previous,
                    addedSkill
                ];
            });

            setSuccess(
                `${skill.name} added successfully.`
            );

            setTimeout(() => {
                setSuccess("");
            }, 3000);

        } catch (error) {

            console.error(
                "Unable to add skill:",
                error
            );

            if (error.response?.status === 401) {

                setError(
                    "Your session has expired. Please login again."
                );

            } else if (error.response?.status === 403) {

                setError(
                    "You are not authorized. Please login again."
                );

            } else {

                setError(
                    error.response?.data?.message ||
                    `Unable to add ${skill.name}.`
                );
            }

        } finally {

            setAddingSkillId(null);
        }
    };

    // =====================================================
    // UPDATE PROFICIENCY
    // =====================================================

    const updateSkillLevel = async (
        skillId,
        skillLevel
    ) => {

        try {

            setUpdatingSkillId(skillId);
            setError("");
            setSuccess("");

            const response = await api.put(
                `/api/students/me/skills/${skillId}`,
                null,
                {
                    params: {
                        skillLevel
                    }
                }
            );

            const updatedSkill = response.data;

            setSelectedSkills((previous) =>
                previous.map((item) => {

                    const currentId =
                        getSkillIdFromSelected(item);

                    if (
                        Number(currentId) ===
                        Number(skillId)
                    ) {
                        return updatedSkill;
                    }

                    return item;
                })
            );

            setSuccess(
                "Skill proficiency updated successfully."
            );

            setTimeout(() => {
                setSuccess("");
            }, 2500);

        } catch (error) {

            console.error(
                "Unable to update skill:",
                error
            );

            if (error.response?.status === 401) {

                setError(
                    "Your session has expired. Please login again."
                );

            } else if (error.response?.status === 403) {

                setError(
                    "You are not authorized to update this skill."
                );

            } else {

                setError(
                    error.response?.data?.message ||
                    "Unable to update skill proficiency."
                );
            }

        } finally {

            setUpdatingSkillId(null);
        }
    };

    // =====================================================
    // REMOVE SKILL
    // =====================================================

    const removeSkill = async (skillId) => {

        try {

            setRemovingSkillId(skillId);
            setError("");
            setSuccess("");

            await api.delete(
                `/api/students/me/skills/${skillId}`
            );

            setSelectedSkills((previous) =>
                previous.filter(
                    (item) =>
                        Number(
                            getSkillIdFromSelected(item)
                        ) !== Number(skillId)
                )
            );

            setSuccess(
                "Skill removed successfully."
            );

            setTimeout(() => {
                setSuccess("");
            }, 2500);

        } catch (error) {

            console.error(
                "Unable to remove skill:",
                error
            );

            if (error.response?.status === 401) {

                setError(
                    "Your session has expired. Please login again."
                );

            } else if (error.response?.status === 403) {

                setError(
                    "You are not authorized to remove this skill."
                );

            } else {

                setError(
                    error.response?.data?.message ||
                    "Unable to remove skill."
                );
            }

        } finally {

            setRemovingSkillId(null);
        }
    };

    // =====================================================
    // GENERATE PERSONALIZED AI ROADMAP
    // =====================================================

    // =====================================================
// GENERATE PERSONALIZED AI ROADMAP
// =====================================================

const handleGenerateRoadmap = () => {

    if (selectedSkills.length === 0) {

        setError(
            "Please add at least one skill before generating your roadmap."
        );

        return;
    }

    try {

        setError("");

        // =================================================
        // CONVERT SELECTED SKILLS
        // =================================================

        const roadmapSkills = selectedSkills.map((item) => {

            const skillId =
                item.skillId ??
                item.skill?.id ??
                item.id;

            const skillName =
                item.skillName ??
                item.skill?.name ??
                "Unknown Skill";

            const category =
                item.category ??
                item.skill?.category ??
                "Technology";

            const description =
                item.description ??
                item.skill?.description ??
                "";

            const skillLevel =
                item.skillLevel ??
                "BEGINNER";

            return {
                skillId,
                skillName,
                category,
                description,
                skillLevel
            };

        });

        // =================================================
        // PRIMARY / FOCUS SKILL
        // =================================================
        //
        // First selected skill becomes the focus skill.
        // UI is NOT changed.
        //

        const focusSkill =
            roadmapSkills[0]?.skillName?.trim();

        if (!focusSkill) {

            setError(
                "Unable to determine the selected focus skill."
            );

            return;
        }

        // =================================================
        // SAVE ROADMAP INPUT
        // =================================================

        localStorage.setItem(
            "aiRoadmapSkills",
            JSON.stringify(roadmapSkills)
        );

        // =================================================
        // SAVE EXACT FOCUS SKILL
        // =================================================

        localStorage.setItem(
            "aiRoadmapFocusSkill",
            focusSkill
        );

        // =================================================
        // REMOVE OLD AI ANALYSIS
        // =================================================

        localStorage.removeItem(
            "aiAnalysisResult"
        );

        // =================================================
        // REMOVE OLD ROADMAP CACHE
        // =================================================

        localStorage.removeItem(
            "currentRoadmap"
        );

        localStorage.removeItem(
            "roadmapData"
        );

        // =================================================
        // DEBUG
        // =================================================

        console.log(
            "================================="
        );

        console.log(
            "AI ROADMAP INPUT"
        );

        console.table(
            roadmapSkills
        );

        console.log(
            "FOCUS SKILL:",
            focusSkill
        );

        console.log(
            "================================="
        );

        // =================================================
        // GO TO AI ANALYSIS
        // =================================================

        navigate("/ai-analysis");

    } catch (error) {

        console.error(
            "Unable to prepare AI roadmap:",
            error
        );

        setError(
            "Unable to prepare your personalized roadmap."
        );

    }
};

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (
            <div className="student-skills-page">

                <div className="student-skills-loading">

                    <div className="loading-spinner"></div>

                    <h3>
                        Loading your skills...
                    </h3>

                    <p>
                        Please wait while we load your
                        personalized skill profile.
                    </p>

                </div>

            </div>
        );
    }

    // =====================================================
    // MAIN UI
    // =====================================================

    return (

        <div className="student-skills-page">

            {/* HEADER */}

            <div className="skills-page-header">

                <div>

                    <span className="page-eyebrow">
                        PERSONALIZATION
                    </span>

                    <h1>
                        Your Skills
                    </h1>

                    <p>
                        Select the technologies and skills
                        you currently know. Your AI mentor
                        will use them to personalize your
                        learning roadmap.
                    </p>

                </div>

                <div className="skills-count-box">

                    <strong>
                        {selectedSkills.length}
                    </strong>

                    <span>
                        Skills selected
                    </span>

                </div>

            </div>

            {/* ERROR */}

            {error && (

                <div className="skill-alert skill-alert-error">

                    <div className="alert-icon">
                        !
                    </div>

                    <div className="alert-content">

                        <strong>
                            Something went wrong
                        </strong>

                        <span>
                            {error}
                        </span>

                    </div>

                    <button
                        type="button"
                        onClick={handleRetry}
                        className="alert-button"
                    >
                        Retry
                    </button>

                </div>
            )}

            {/* SUCCESS */}

            {success && (

                <div className="skill-alert skill-alert-success">

                    <div className="alert-icon">
                        ✓
                    </div>

                    <div className="alert-content">

                        <strong>
                            Success
                        </strong>

                        <span>
                            {success}
                        </span>

                    </div>

                </div>
            )}

            {/* SELECTED SKILLS */}

            <section className="selected-skills-section">

                <div className="section-header">

                    <div>

                        <h2>
                            Your Selected Skills
                        </h2>

                        <p>
                            Manage your current skills
                            and proficiency levels.
                        </p>

                    </div>

                    <div className="section-count">
                        {selectedSkills.length}
                    </div>

                </div>

                {selectedSkills.length === 0 ? (

                    <div className="empty-selected-skills">

                        <div className="empty-icon">
                            +
                        </div>

                        <h3>
                            No skills selected yet
                        </h3>

                        <p>
                            Add skills below to help your
                            AI mentor understand your
                            current knowledge.
                        </p>

                    </div>

                ) : (

                    <div className="selected-skills-grid">

                        {selectedSkills.map(
                            (studentSkill) => {

                                const skillId =
                                    getSkillIdFromSelected(
                                        studentSkill
                                    );

                                const skillName =
                                    studentSkill.skillName ??
                                    studentSkill.skill?.name ??
                                    "Skill";

                                const category =
                                    studentSkill.category ??
                                    studentSkill.skill?.category ??
                                    "Technology";

                                const description =
                                    studentSkill.description ??
                                    studentSkill.skill?.description ??
                                    "";

                                const currentLevel =
                                    studentSkill.skillLevel ??
                                    "BEGINNER";

                                return (

                                    <div
                                        className="selected-skill-card"
                                        key={skillId}
                                    >

                                        <div className="selected-card-top">

                                            <div className="skill-icon">
                                                ✦
                                            </div>

                                            <button
                                                type="button"
                                                className="remove-skill-button"
                                                onClick={() =>
                                                    removeSkill(
                                                        skillId
                                                    )
                                                }
                                                disabled={
                                                    removingSkillId ===
                                                    skillId
                                                }
                                                title="Remove skill"
                                            >
                                                {removingSkillId ===
                                                skillId
                                                    ? "..."
                                                    : "×"}
                                            </button>

                                        </div>

                                        <h3>
                                            {skillName}
                                        </h3>

                                        <span className="skill-category">
                                            {category}
                                        </span>

                                        {description && (

                                            <p className="selected-skill-description">
                                                {description}
                                            </p>

                                        )}

                                        <div className="proficiency-wrapper">

                                            <label>
                                                Proficiency
                                            </label>

                                            <select
                                                value={currentLevel}
                                                disabled={
                                                    updatingSkillId ===
                                                    skillId
                                                }
                                                onChange={(event) =>
                                                    updateSkillLevel(
                                                        skillId,
                                                        event.target.value
                                                    )
                                                }
                                            >

                                                {PROFICIENCY_LEVELS.map(
                                                    (level) => (

                                                        <option
                                                            key={
                                                                level.value
                                                            }
                                                            value={
                                                                level.value
                                                            }
                                                        >
                                                            {level.label}
                                                        </option>

                                                    )
                                                )}

                                            </select>

                                            {updatingSkillId ===
                                                skillId && (

                                                <small>
                                                    Saving...
                                                </small>

                                            )}

                                        </div>

                                    </div>
                                );
                            }
                        )}

                    </div>
                )}

            </section>

            {/* EXPLORE SKILLS */}

            <section className="explore-skills-section">

                <div className="section-header">

                    <div>

                        <h2>
                            Explore Skills
                        </h2>

                        <p>
                            Choose any skills relevant
                            to your learning goals.
                        </p>

                    </div>

                    <div className="available-count">

                        {filteredSkills.length}{" "}
                        {filteredSkills.length === 1
                            ? "skill"
                            : "skills"}{" "}
                        available

                    </div>

                </div>

                {/* FILTERS */}

                <div className="skill-filters">

                    <div className="skill-search">

                        <span>
                            ⌕
                        </span>

                        <input
                            type="text"
                            placeholder="Search skills, technologies..."
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                        />

                        {search && (

                            <button
                                type="button"
                                onClick={() =>
                                    setSearch("")
                                }
                                className="clear-search"
                            >
                                ×
                            </button>

                        )}

                    </div>

                    <select
                        value={selectedCategory}
                        onChange={(event) =>
                            setSelectedCategory(
                                event.target.value
                            )
                        }
                        className="category-select"
                    >

                        <option value="ALL">
                            All Categories
                        </option>

                        {categories.map(
                            (category) => (

                                <option
                                    key={category}
                                    value={category}
                                >
                                    {category}
                                </option>

                            )
                        )}

                    </select>

                </div>

                {/* SKILLS */}

                {filteredSkills.length === 0 ? (

                    <div className="no-skills-found">

                        <div className="no-skills-icon">
                            ⌕
                        </div>

                        <h3>
                            No skills found
                        </h3>

                        <p>
                            Try another search or category.
                        </p>

                    </div>

                ) : (

                    <div className="available-skills-grid">

                        {filteredSkills.map(
                            (skill) => {

                                const selected =
                                    isSkillSelected(
                                        skill.id
                                    );

                                const adding =
                                    addingSkillId ===
                                    skill.id;

                                return (

                                    <div
                                        className={`available-skill-card ${
                                            selected
                                                ? "skill-selected"
                                                : ""
                                        }`}
                                        key={skill.id}
                                    >

                                        <div className="skill-card-icon">
                                            ✦
                                        </div>

                                        <div className="skill-card-content">

                                            <div className="skill-title-row">

                                                <h3>
                                                    {skill.name}
                                                </h3>

                                                {selected && (

                                                    <span className="added-badge">
                                                        ✓ Added
                                                    </span>

                                                )}

                                            </div>

                                            <span className="skill-category">

                                                {skill.category ||
                                                    "Technology"}

                                            </span>

                                            <p>

                                                {skill.description ||
                                                    "Technology skill available for your personalized learning journey."}

                                            </p>

                                        </div>

                                        {selected ? (

                                            <button
                                                type="button"
                                                className="skill-added-button"
                                                onClick={() =>
                                                    removeSkill(
                                                        skill.id
                                                    )
                                                }
                                                disabled={
                                                    removingSkillId ===
                                                    skill.id
                                                }
                                            >

                                                {removingSkillId ===
                                                skill.id
                                                    ? "Removing..."
                                                    : "✓ Added — Remove"}

                                            </button>

                                        ) : (

                                            <button
                                                type="button"
                                                className="add-skill-button"
                                                onClick={() =>
                                                    addSkill(
                                                        skill
                                                    )
                                                }
                                                disabled={
                                                    adding
                                                }
                                            >

                                                {adding ? (

                                                    <>
                                                        <span className="button-spinner"></span>
                                                        Adding...
                                                    </>

                                                ) : (

                                                    <>
                                                        + Add Skill
                                                    </>

                                                )}

                                            </button>

                                        )}

                                    </div>
                                );
                            }
                        )}

                    </div>
                )}

            </section>

            {/* AI INFO */}

            <section className="ai-roadmap-info">

                <div className="ai-info-icon">
                    ✦
                </div>

                <div>

                    <h3>
                        Your skills shape your AI roadmap
                    </h3>

                    <p>
                        Add or remove skills anytime.
                        Your learning recommendations
                        will adapt accordingly.
                    </p>

                </div>

            </section>

            {/* GENERATE */}

            {selectedSkills.length > 0 && (

                <section
                    style={{
                        marginTop: "28px",
                        marginBottom: "40px",
                        padding: "28px",
                        borderRadius: "20px",
                        border: "1px solid #ddd6fe",
                        background:
                            "linear-gradient(135deg, #ffffff 0%, #faf8ff 100%)",
                        boxShadow:
                            "0 10px 30px rgba(79, 70, 229, 0.08)"
                    }}
                >

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "20px",
                            flexWrap: "wrap"
                        }}
                    >

                        <div
                            style={{
                                width: "58px",
                                height: "58px",
                                minWidth: "58px",
                                borderRadius: "16px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "#ede9fe",
                                color: "#6346e5",
                                fontSize: "25px"
                            }}
                        >
                            ✦
                        </div>

                        <div
                            style={{
                                flex: 1,
                                minWidth: "250px"
                            }}
                        >

                            <span
                                style={{
                                    display: "block",
                                    marginBottom: "5px",
                                    color: "#6346e5",
                                    fontSize: "11px",
                                    fontWeight: "700",
                                    letterSpacing: "1.2px"
                                }}
                            >
                                READY TO START?
                            </span>

                            <h2
                                style={{
                                    margin: "0 0 7px",
                                    color: "#111827",
                                    fontSize: "22px",
                                    fontWeight: "700"
                                }}
                            >
                                Generate Your AI Roadmap
                            </h2>

                            <p
                                style={{
                                    margin: 0,
                                    color: "#64748b",
                                    fontSize: "14px",
                                    lineHeight: "1.6"
                                }}
                            >
                                Your selected skills and
                                proficiency levels will be used
                                to create a personalized learning
                                roadmap.
                            </p>

                        </div>

                        <button
                            type="button"
                            onClick={handleGenerateRoadmap}
                            style={{
                                border: "none",
                                borderRadius: "12px",
                                padding: "14px 20px",
                                minWidth: "210px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "12px",
                                background:
                                    "linear-gradient(135deg, #6d3df5, #5531d6)",
                                color: "#ffffff",
                                fontSize: "14px",
                                fontWeight: "700",
                                cursor: "pointer",
                                boxShadow:
                                    "0 8px 20px rgba(99, 70, 229, 0.25)"
                            }}
                        >

                            <span>
                                Generate AI Roadmap
                            </span>

                            <span
                                style={{
                                    fontSize: "19px"
                                }}
                            >
                                →
                            </span>

                        </button>

                    </div>

                </section>
            )}

        </div>
    );
}

export default StudentSkill;