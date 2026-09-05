import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {

    const navigate = useNavigate();

    const mainMenu = [
        {
            name: "Dashboard",
            path: "/dashboard",
            icon: "bi-grid-1x2-fill",
        },
        {
            name: "Roadmap",
            path: "/roadmap",
            icon: "bi-map",
        },
        {
            name: "AI Mentor",
            path: "/ai-mentor",
            icon: "bi-stars",
            badge: "AI",
        },
        {
            name: "Assessments",
            path: "/assessments",
            icon: "bi-clipboard-check",
        },
       {
    name: "DSA Practice",
    path: "/dsa-practice",
    icon: "bi-code-slash",
},
        {
            name: "Interview Prep",
            path: "/interview",
            icon: "bi-person-workspace",
        },
        {
            name: "Progress",
            path: "/progress",
            icon: "bi-graph-up-arrow",
        },
        {
            name: "Projects",
            path: "/projects",
            icon: "bi-folder2-open",
        },
        {
            name: "Resources",
            path: "/resources",
            icon: "bi-book",
        },
    ];

    const toolsMenu = [
        {
            name: "Code Editor",
            path: "/code-editor",
            icon: "bi-code-square",
        },
        {
            name: "Notes",
            path: "/notes",
            icon: "bi-journal-text",
        },
        {
            name: "Flashcards",
            path: "/flashcards",
            icon: "bi-layers",
        },
    ];

    const accountMenu = [
        {
            name: "Profile",
            path: "/profile",
            icon: "bi-person-circle",
        },
        {
            name: "Settings",
            path: "/settings",
            icon: "bi-gear",
        },
    ];

    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("ai_mentor_user");

        navigate("/login", {
            replace: true,
        });
    };

    return (
        <div className="sidebar-inner">

            {/* ================= BRAND ================= */}

            <div className="sidebar-brand">

                <div className="brand-logo">
                    <i className="bi bi-stars"></i>
                </div>

                <div className="brand-content">
                    <h5>AI Mentor</h5>
                    <span>Learn Smarter</span>
                </div>

            </div>


            {/* ================= MAIN MENU ================= */}

            <div className="sidebar-section">

                <div className="sidebar-section-title">
                    MAIN MENU
                </div>

                <nav className="sidebar-nav">

                    {mainMenu.map((item) => (

                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `sidebar-link ${
                                    isActive ? "active" : ""
                                }`
                            }
                        >

                            <span className="sidebar-icon">
                                <i
                                    className={`bi ${item.icon}`}
                                ></i>
                            </span>

                            <span className="sidebar-text">
                                {item.name}
                            </span>

                            {item.badge && (
                                <span className="ai-badge">
                                    {item.badge}
                                </span>
                            )}

                        </NavLink>

                    ))}

                </nav>

            </div>


            {/* ================= TOOLS ================= */}

            <div className="sidebar-section">

                <div className="sidebar-section-title">
                    TOOLS
                </div>

                <nav className="sidebar-nav">

                    {toolsMenu.map((item) => (

                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `sidebar-link ${
                                    isActive ? "active" : ""
                                }`
                            }
                        >

                            <span className="sidebar-icon">
                                <i
                                    className={`bi ${item.icon}`}
                                ></i>
                            </span>

                            <span className="sidebar-text">
                                {item.name}
                            </span>

                        </NavLink>

                    ))}

                </nav>

            </div>


            {/* ================= AI PLAN ================= */}

            <div className="ai-plan-card">

                <div className="ai-plan-icon">
                    <i className="bi bi-stars"></i>
                </div>

                <div className="ai-plan-title">
                    AI Plan
                </div>

                <div className="ai-plan-name">
                    Premium
                </div>

                <div className="ai-plan-valid">
                    Valid until your plan ends
                </div>

                <button className="ai-plan-button">
                    Upgrade Plan
                </button>

            </div>


            {/* ================= ACCOUNT ================= */}

            <div className="sidebar-section account-section">

                <div className="sidebar-section-title">
                    ACCOUNT
                </div>

                <nav className="sidebar-nav">

                    {accountMenu.map((item) => (

                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `sidebar-link ${
                                    isActive ? "active" : ""
                                }`
                            }
                        >

                            <span className="sidebar-icon">
                                <i
                                    className={`bi ${item.icon}`}
                                ></i>
                            </span>

                            <span className="sidebar-text">
                                {item.name}
                            </span>

                        </NavLink>

                    ))}


                    <button
                        type="button"
                        className="sidebar-link sidebar-logout"
                        onClick={handleLogout}
                    >

                        <span className="sidebar-icon">
                            <i className="bi bi-box-arrow-right"></i>
                        </span>

                        <span className="sidebar-text">
                            Logout
                        </span>

                    </button>

                </nav>

            </div>

        </div>
    );
}

export default Sidebar;