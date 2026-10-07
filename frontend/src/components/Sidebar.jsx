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
        localStorage.removeItem("studentId");
        localStorage.removeItem("userId");
        localStorage.removeItem("id");
        localStorage.removeItem("ai_mentor_user");

        navigate("/login", {
            replace: true,
        });
    };

    const renderMenu = (items) => (
        <nav className="ai-sidebar-nav">
            {items.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                        `ai-sidebar-link ${isActive ? "active" : ""}`
                    }
                >
                    <span className="ai-sidebar-icon">
                        <i className={`bi ${item.icon}`}></i>
                    </span>

                    <span className="ai-sidebar-label">
                        {item.name}
                    </span>

                    {item.badge && (
                        <span className="ai-sidebar-badge">
                            {item.badge}
                        </span>
                    )}

                    <i className="bi bi-chevron-right ai-sidebar-arrow"></i>
                </NavLink>
            ))}
        </nav>
    );

    return (
        <div className="ai-sidebar-inner">

            {/* BRAND */}
            <div className="ai-sidebar-brand">
                <div className="ai-sidebar-brand-logo">
                    <i className="bi bi-stars"></i>
                </div>

                <div className="ai-sidebar-brand-content">
                    <div className="ai-sidebar-brand-title">
                        AI Mentor
                    </div>

                    <div className="ai-sidebar-brand-subtitle">
                        Learn Smarter
                    </div>
                </div>
            </div>

            {/* MAIN MENU */}
            <section className="ai-sidebar-section">
                <div className="ai-sidebar-section-title">
                    MAIN MENU
                </div>

                {renderMenu(mainMenu)}
            </section>

            {/* TOOLS */}
            <section className="ai-sidebar-section">
                <div className="ai-sidebar-section-title">
                    TOOLS
                </div>

                {renderMenu(toolsMenu)}
            </section>

            {/* AI PLAN */}
            <div className="ai-sidebar-plan">

                <div className="ai-sidebar-plan-glow"></div>

                <div className="ai-sidebar-plan-icon">
                    <i className="bi bi-stars"></i>
                </div>

                <div className="ai-sidebar-plan-label">
                    AI PLAN
                </div>

                <div className="ai-sidebar-plan-name">
                    Premium
                </div>

                <div className="ai-sidebar-plan-description">
                    Unlock smarter learning tools and personalized guidance.
                </div>

                <button
                    type="button"
                    className="ai-sidebar-plan-button"
                    onClick={() => navigate("/settings")}
                >
                    <span>Manage Plan</span>
                    <i className="bi bi-arrow-up-right"></i>
                </button>
            </div>

            {/* ACCOUNT */}
            <section className="ai-sidebar-section ai-sidebar-account">

                <div className="ai-sidebar-section-title">
                    ACCOUNT
                </div>

                {renderMenu(accountMenu)}

                <button
                    type="button"
                    className="ai-sidebar-link ai-sidebar-logout"
                    onClick={handleLogout}
                >
                    <span className="ai-sidebar-icon">
                        <i className="bi bi-box-arrow-right"></i>
                    </span>

                    <span className="ai-sidebar-label">
                        Logout
                    </span>

                    <i className="bi bi-chevron-right ai-sidebar-arrow"></i>
                </button>
            </section>

        </div>
    );
}

export default Sidebar;