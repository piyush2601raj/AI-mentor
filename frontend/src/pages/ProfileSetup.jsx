import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./ProfileSetup.css";

/* =====================================================
   CAREER GOAL MAPPING
===================================================== */

const careerGoalMapping = {
    "Java Full Stack Developer": "SOFTWARE_DEVELOPER",
    "Java Backend Developer": "SOFTWARE_DEVELOPER",
    "Software Developer": "SOFTWARE_DEVELOPER",

    "Data Scientist": "DATA_SCIENTIST",

    "AI / ML Engineer": "AI_ML_ENGINEER",
    "AI/ML Engineer": "AI_ML_ENGINEER",
    "Machine Learning": "AI_ML_ENGINEER",

    "Cybersecurity": "CYBERSECURITY",

    "Mobile Developer": "MOBILE_DEVELOPER",

    "Web Developer": "WEB_DEVELOPER",

    "Cloud Engineer": "CLOUD_ENGINEER",

    "Data Analyst": "DATA_ANALYST",

    "DevOps Engineer": "DEVOPS_ENGINEER"
};


/* =====================================================
   BACKEND → FRONTEND CAREER GOAL
===================================================== */

const careerGoalDisplayMapping = {
    SOFTWARE_DEVELOPER: "Java Full Stack Developer",
    DATA_SCIENTIST: "Data Scientist",
    AI_ML_ENGINEER: "AI / ML Engineer",
    CYBERSECURITY: "Cybersecurity",
    MOBILE_DEVELOPER: "Mobile Developer",
    WEB_DEVELOPER: "Web Developer",
    CLOUD_ENGINEER: "Cloud Engineer",
    DATA_ANALYST: "Data Analyst",
    DEVOPS_ENGINEER: "DevOps Engineer",
    OTHER: ""
};


/* =====================================================
   COMPONENT
===================================================== */

function ProfileSetup() {

    const navigate = useNavigate();

    /* =====================================================
       FORM STATE
    ===================================================== */

    const [form, setForm] = useState({
        fullName: "",
        careerGoal: "",
        education: "",
        college: "",
        graduationYear: "",
        experienceLevel: "BEGINNER",
        dailyStudyHours: 2,
        preferredDomain: "",
        bio: ""
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    /* =====================================================
       GET STUDENT ID
    ===================================================== */

    const getStudentId = () => {

        const studentId =
            localStorage.getItem("studentId") ||
            localStorage.getItem("userId");

        console.log("Logged-in Student ID:", studentId);

        return studentId;
    };


    /* =====================================================
       LOAD PROFILE
    ===================================================== */

    useEffect(() => {
        loadProfile();
    }, []);


    const loadProfile = async () => {

        try {

            setLoading(true);
            setError("");

            const studentId = getStudentId();

            if (!studentId) {

                setError(
                    "Student ID not found. Please login again."
                );

                return;
            }

            console.log(
                "Loading profile for student:",
                studentId
            );

            const response = await api.get(
                `/students/${studentId}/profile`
            );

            const data = response.data;

            console.log(
                "Existing student profile:",
                data
            );

            const displayCareerGoal =
                careerGoalDisplayMapping[data.careerGoal] ||
                data.careerGoal ||
                "";

            setForm({

                fullName:
                    data.studentName ||
                    data.fullName ||
                    "",

                careerGoal:
                    displayCareerGoal,

                education:
                    data.education || "",

                college:
                    data.college || "",

                graduationYear:
                    data.graduationYear || "",

                experienceLevel:
                    data.experienceLevel ||
                    "BEGINNER",

                dailyStudyHours:
                    data.learningHoursPerDay ||
                    data.dailyStudyHours ||
                    2,

                preferredDomain:
                    data.preferredDomain || "",

                bio:
                    data.bio || ""

            });

        } catch (err) {

            if (err.response?.status === 404) {

                console.log(
                    "No profile found. New profile will be created."
                );

                setForm({
                    fullName: "",
                    careerGoal: "",
                    education: "",
                    college: "",
                    graduationYear: "",
                    experienceLevel: "BEGINNER",
                    dailyStudyHours: 2,
                    preferredDomain: "",
                    bio: ""
                });

            } else {

                console.error(
                    "Profile loading error:",
                    err
                );

                setError(
                    err.response?.data?.message ||
                    "Unable to load profile."
                );
            }

        } finally {

            setLoading(false);

        }
    };


    /* =====================================================
       INPUT CHANGE
    ===================================================== */

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setForm(prev => ({
            ...prev,
            [name]: value
        }));

    };


    /* =====================================================
       SAVE PROFILE
    ===================================================== */

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");

        /* =================================================
           VALIDATION
        ================================================= */

        if (!form.fullName.trim()) {

            setError(
                "Please enter your full name."
            );

            return;
        }

        if (!form.careerGoal.trim()) {

            setError(
                "Please enter your career goal."
            );

            return;
        }

        if (!form.experienceLevel) {

            setError(
                "Please select your experience level."
            );

            return;
        }

        if (!form.dailyStudyHours) {

            setError(
                "Please select daily study hours."
            );

            return;
        }


        try {

            setSaving(true);

            const studentId = getStudentId();

            if (!studentId) {

                setError(
                    "Student ID not found. Please login again."
                );

                return;
            }

            console.log(
                "Saving profile for student:",
                studentId
            );

            console.log(
                "Frontend profile data:",
                form
            );


            /* =================================================
               CONVERT CAREER GOAL TO BACKEND ENUM
            ================================================= */

            const backendCareerGoal =
                careerGoalMapping[form.careerGoal] ||
                "OTHER";


            /* =================================================
               BACKEND PAYLOAD
            ================================================= */

            const payload = {

                careerGoal:
                    backendCareerGoal,

                experienceLevel:
                    form.experienceLevel,

                dailyStudyHours:
                    Number(form.dailyStudyHours)

            };


            console.log(
                "Backend profile payload:",
                payload
            );


            /* =================================================
               SAVE PROFILE
            ================================================= */

            await api.put(
                `/students/${studentId}/profile`,
                payload
            );


            console.log(
                "Profile saved successfully."
            );


            /* =================================================
               SUCCESS
            ================================================= */

            setSuccess(
                "Profile saved successfully!"
            );


            /*
             * FLOW:
             *
             * Profile
             *      ↓
             * Skill Assessment
             *      ↓
             * AI Analysis
             *      ↓
             * Roadmap
             */

            setTimeout(() => {

                /*
                 * IMPORTANT:
                 * App.jsx me route /assessments hai.
                 */
                navigate("/assessments");

            }, 1000);


        } catch (err) {

            console.error(
                "Profile save error:",
                err
            );

            console.error(
                "Backend response:",
                err.response?.data
            );

            setError(

                err.response?.data?.message ||

                err.response?.data ||

                "Unable to save profile. Please try again."

            );

        } finally {

            setSaving(false);

        }

    };


    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {

        return (

            <div className="profile-setup-page">

                <div className="profile-loading">

                    <div className="profile-spinner"></div>

                    <h3>
                        Loading your profile...
                    </h3>

                    <p>
                        Preparing your personalized
                        learning profile.
                    </p>

                </div>

            </div>

        );
    }


    /* =====================================================
       UI
    ===================================================== */

    return (

        <div className="profile-setup-page">

            <div className="profile-setup-container">


                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="profile-header">

                    <div className="profile-header-icon">
                        ✦
                    </div>

                    <div>

                        <span className="profile-label">
                            STEP 1 • PROFILE SETUP
                        </span>

                        <h1>
                            Build Your Learning Profile
                        </h1>

                        <p>
                            Tell us about yourself so AI Mentor
                            can personalize your learning journey.
                        </p>

                    </div>

                </div>


                {/* =================================================
                    PROGRESS
                ================================================= */}

                <div className="setup-progress">

                    <div className="progress-step active">

                        <span>1</span>

                        Profile

                    </div>

                    <div className="progress-line"></div>

                    <div className="progress-step">

                        <span>2</span>

                        Assessment

                    </div>

                    <div className="progress-line"></div>

                    <div className="progress-step">

                        <span>3</span>

                        AI Analysis

                    </div>

                    <div className="progress-line"></div>

                    <div className="progress-step">

                        <span>4</span>

                        Roadmap

                    </div>

                </div>


                {/* =================================================
                    FORM
                ================================================= */}

                <form
                    className="profile-form-card"
                    onSubmit={handleSubmit}
                >


                    {/* =================================================
                        PERSONAL INFORMATION
                    ================================================= */}

                    <div className="form-section">

                        <div className="form-section-title">

                            <span>01</span>

                            Personal Information

                        </div>


                        <div className="form-grid">


                            {/* FULL NAME */}

                            <div className="form-group">

                                <label>
                                    Full Name *
                                </label>

                                <input
                                    type="text"
                                    name="fullName"
                                    value={form.fullName}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                />

                            </div>


                            {/* CAREER GOAL */}

                            <div className="form-group">

                                <label>
                                    Career Goal *
                                </label>

                                <select
                                    name="careerGoal"
                                    value={form.careerGoal}
                                    onChange={handleChange}
                                >

                                    <option value="">
                                        Select career goal
                                    </option>

                                    <option>
                                        Java Full Stack Developer
                                    </option>

                                    <option>
                                        Java Backend Developer
                                    </option>

                                    <option>
                                        Software Developer
                                    </option>

                                    <option>
                                        Data Scientist
                                    </option>

                                    <option>
                                        AI / ML Engineer
                                    </option>

                                    <option>
                                        Cybersecurity
                                    </option>

                                    <option>
                                        Mobile Developer
                                    </option>

                                    <option>
                                        Web Developer
                                    </option>

                                    <option>
                                        Cloud Engineer
                                    </option>

                                    <option>
                                        Data Analyst
                                    </option>

                                    <option>
                                        DevOps Engineer
                                    </option>

                                </select>

                            </div>


                            {/* EDUCATION */}

                            <div className="form-group">

                                <label>
                                    Education
                                </label>

                                <select
                                    name="education"
                                    value={form.education}
                                    onChange={handleChange}
                                >

                                    <option value="">
                                        Select education
                                    </option>

                                    <option value="BTECH">
                                        B.Tech / B.E.
                                    </option>

                                    <option value="BCA">
                                        BCA
                                    </option>

                                    <option value="MCA">
                                        MCA
                                    </option>

                                    <option value="BSC">
                                        B.Sc.
                                    </option>

                                    <option value="MSC">
                                        M.Sc.
                                    </option>

                                    <option value="OTHER">
                                        Other
                                    </option>

                                </select>

                            </div>


                            {/* COLLEGE */}

                            <div className="form-group">

                                <label>
                                    College / University
                                </label>

                                <input
                                    type="text"
                                    name="college"
                                    value={form.college}
                                    onChange={handleChange}
                                    placeholder="Enter college name"
                                />

                            </div>


                            {/* GRADUATION YEAR */}

                            <div className="form-group">

                                <label>
                                    Graduation Year
                                </label>

                                <select
                                    name="graduationYear"
                                    value={form.graduationYear}
                                    onChange={handleChange}
                                >

                                    <option value="">
                                        Select year
                                    </option>

                                    {Array.from(
                                        { length: 8 },
                                        (_, i) => 2025 + i
                                    ).map(year => (

                                        <option
                                            key={year}
                                            value={year}
                                        >
                                            {year}
                                        </option>

                                    ))}

                                </select>

                            </div>


                            {/* EXPERIENCE */}

                            <div className="form-group">

                                <label>
                                    Experience Level
                                </label>

                                <select
                                    name="experienceLevel"
                                    value={form.experienceLevel}
                                    onChange={handleChange}
                                >

                                    <option value="BEGINNER">
                                        Beginner
                                    </option>

                                    <option value="INTERMEDIATE">
                                        Intermediate
                                    </option>

                                    <option value="ADVANCED">
                                        Advanced
                                    </option>

                                </select>

                            </div>


                            {/* DAILY STUDY HOURS */}

                            <div className="form-group">

                                <label>
                                    Daily Study Hours *
                                </label>

                                <select
                                    name="dailyStudyHours"
                                    value={form.dailyStudyHours}
                                    onChange={handleChange}
                                >

                                    <option value="1">
                                        1 hour
                                    </option>

                                    <option value="2">
                                        2 hours
                                    </option>

                                    <option value="3">
                                        3 hours
                                    </option>

                                    <option value="4">
                                        4 hours
                                    </option>

                                    <option value="5">
                                        5 hours
                                    </option>

                                    <option value="6">
                                        6 hours
                                    </option>

                                    <option value="8">
                                        8+ hours
                                    </option>

                                </select>

                            </div>

                        </div>

                    </div>


                    {/* =================================================
                        LEARNING PREFERENCES
                    ================================================= */}

                    <div className="form-section">

                        <div className="form-section-title">

                            <span>02</span>

                            Learning Preferences

                        </div>


                        <div className="domain-grid">

                            {[
                                "Software Development",
                                "Artificial Intelligence",
                                "Machine Learning",
                                "Cybersecurity",
                                "Data Science",
                                "Cloud & DevOps"
                            ].map(domain => (

                                <button
                                    type="button"
                                    key={domain}
                                    className={
                                        form.preferredDomain === domain
                                            ? "domain-option selected"
                                            : "domain-option"
                                    }
                                    onClick={() =>
                                        setForm(prev => ({
                                            ...prev,
                                            preferredDomain:
                                                domain
                                        }))
                                    }
                                >

                                    <span className="domain-icon">
                                        ✦
                                    </span>

                                    <span>
                                        {domain}
                                    </span>

                                </button>

                            ))}

                        </div>

                    </div>


                    {/* =================================================
                        BIO
                    ================================================= */}

                    <div className="form-section">

                        <div className="form-section-title">

                            <span>03</span>

                            About You

                        </div>


                        <div className="form-group">

                            <label>
                                Short Bio
                            </label>

                            <textarea
                                name="bio"
                                value={form.bio}
                                onChange={handleChange}
                                placeholder="Tell AI Mentor about your interests, current skills and what you want to achieve..."
                                rows="5"
                            />

                        </div>

                    </div>


                    {/* =================================================
                        ERROR
                    ================================================= */}

                    {error && (

                        <div className="form-error">

                            ⚠ {error}

                        </div>

                    )}


                    {/* =================================================
                        SUCCESS
                    ================================================= */}

                    {success && (

                        <div className="form-success">

                            ✓ {success}

                        </div>

                    )}


                    {/* =================================================
                        FOOTER
                    ================================================= */}

                    <div className="form-footer">

                        <div>

                            <strong>
                                Your profile powers AI personalization
                            </strong>

                            <p>
                                We'll use this information to create
                                your skill assessment and learning path.
                            </p>

                        </div>


                        <button
                            type="submit"
                            className="save-profile-btn"
                            disabled={saving}
                        >

                            {saving
                                ? "Saving..."
                                : "Save & Continue →"
                            }

                        </button>

                    </div>


                </form>

            </div>

        </div>

    );
}


export default ProfileSetup;