import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import "./Layout.css";

function Layout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();

    const [searchQuery, setSearchQuery] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const searchWrapRef = useRef(null);
    const searchInputRef = useRef(null);
    const profileWrapRef = useRef(null);

    const userName =
        localStorage.getItem("userName") ||
        localStorage.getItem("name") ||
        "Student";

    const searchItems = [
        {
            title: "Dashboard",
            description: "Your learning dashboard",
            icon: "bi bi-grid-1x2-fill",
            route: "/dashboard"
        },
        {
            title: "Roadmap",
            description: "View your personalized learning roadmap",
            icon: "bi bi-map",
            route: "/roadmap"
        },
        {
            title: "AI Mentor",
            description: "Ask your AI Mentor anything",
            icon: "bi bi-stars",
            route: "/ai-mentor"
        },
        {
            title: "AI Analysis",
            description: "View your AI learning analysis",
            icon: "bi bi-stars",
            route: "/ai-analysis"
        },
        {
            title: "Assessments",
            description: "Check your skill assessments",
            icon: "bi bi-clipboard-check",
            route: "/assessments"
        },
        {
            title: "DSA Practice",
            description: "Practice coding and DSA",
            icon: "bi bi-code-slash",
            route: "/dsa-practice"
        },
        {
            title: "Interview Prep",
            description: "Prepare for technical interviews",
            icon: "bi bi-briefcase",
            route: "/interview"
        },
        {
            title: "Progress",
            description: "Track your learning progress",
            icon: "bi bi-bar-chart-line",
            route: "/progress"
        },
        {
            title: "Projects",
            description: "Build and manage your projects",
            icon: "bi bi-clipboard-check",
            route: "/projects"
        },
        {
            title: "Resources",
            description: "Explore your learning resources",
            icon: "bi bi-briefcase",
            route: "/resources"
        },
        {
            title: "Code Editor",
            description: "Practice and write code",
            icon: "bi bi-code-slash",
            route: "/code-editor"
        },
        {
            title: "Notes",
            description: "View and manage your notes",
            icon: "bi bi-briefcase",
            route: "/notes"
        },
        {
            title: "Profile",
            description: "View and manage your profile",
            icon: "bi bi-person-circle",
            route: "/profile"
        },
        {
            title: "Settings",
            description: "Manage your account settings",
            icon: "bi bi-gear",
            route: "/settings"
        }
    ];

    const normalizedSearchQuery = searchQuery.trim().toLowerCase();

    const filteredSearchItems = searchItems.filter((item) => {
        if (!normalizedSearchQuery) {
            return true;
        }

        return `${item.title} ${item.description}`
            .toLowerCase()
            .includes(normalizedSearchQuery);
    });

    const handleSearchSelect = (route) => {
        if (!route) return;

        setSearchQuery("");
        setSearchOpen(false);
        setProfileOpen(false);

        navigate(route);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("studentId");
        localStorage.removeItem("userId");
        localStorage.removeItem("id");

        setProfileOpen(false);
        setSearchOpen(false);

        navigate("/login", { replace: true });
    };

    useEffect(() => {
        setSearchOpen(false);
        setProfileOpen(false);
        setSearchQuery("");
    }, [location.pathname]);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                searchWrapRef.current &&
                !searchWrapRef.current.contains(event.target)
            ) {
                setSearchOpen(false);
            }

            if (
                profileWrapRef.current &&
                !profileWrapRef.current.contains(event.target)
            ) {
                setProfileOpen(false);
            }
        };

        const handleKeyboard = (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
                event.preventDefault();
                setProfileOpen(false);
                setSearchOpen(true);

                requestAnimationFrame(() => {
                    searchInputRef.current?.focus();
                });
            }

            if (event.key === "Escape") {
                setSearchOpen(false);
                setProfileOpen(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        document.addEventListener("keydown", handleKeyboard);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
            document.removeEventListener("keydown", handleKeyboard);
        };
    }, []);

    return (
        <div className="app-layout">

            {/* ================= SIDEBAR ================= */}
            <aside className="app-sidebar">
                <Sidebar />
            </aside>

            {/* ================= MAIN AREA ================= */}
            <div className="app-main">

                {/* ================= SINGLE GLOBAL TOPBAR ================= */}
                <header className="topbar">

                    <div className="topbar-left">
                        <div className="topbar-title">
                            AI Learning Dashboard
                        </div>

                        <div className="topbar-subtitle">
                            Continue your learning journey
                        </div>
                    </div>

                    <div className="topbar-right">

                        {/* ================= SEARCH ================= */}
                        <div
                            className="topbar-search-wrap"
                            ref={searchWrapRef}
                        >
                            <div className="topbar-search">
                                <i className="bi bi-search"></i>

                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchQuery}
                                    placeholder="Search anything..."
                                    aria-label="Search anything"
                                    onChange={(event) => {
                                        setSearchQuery(event.target.value);
                                        setSearchOpen(true);
                                        setProfileOpen(false);
                                    }}
                                    onFocus={() => {
                                        setSearchOpen(true);
                                        setProfileOpen(false);
                                    }}
                                    onKeyDown={(event) => {
                                        if (
                                            event.key === "Enter" &&
                                            filteredSearchItems.length > 0
                                        ) {
                                            handleSearchSelect(
                                                filteredSearchItems[0].route
                                            );
                                        }

                                        if (event.key === "Escape") {
                                            setSearchOpen(false);
                                        }
                                    }}
                                />

                                {searchQuery && (
                                    <button
                                        type="button"
                                        className="topbar-search-clear"
                                        aria-label="Clear search"
                                        onClick={() => {
                                            setSearchQuery("");
                                            setSearchOpen(false);

                                            requestAnimationFrame(() => {
                                                searchInputRef.current?.focus();
                                            });
                                        }}
                                    >
                                        ×
                                    </button>
                                )}

                                <span className="search-shortcut">
                                    Ctrl K
                                </span>
                            </div>

                            {/* ================= SEARCH RESULTS ================= */}
                            {searchOpen && (
                                <div
                                    className="topbar-search-results"
                                    role="listbox"
                                >
                                    <div className="topbar-search-results-header">
                                        <span>
                                            {normalizedSearchQuery
                                                ? "Search results"
                                                : "Quick navigation"}
                                        </span>

                                        <span>
                                            {filteredSearchItems.length}
                                        </span>
                                    </div>

                                    {filteredSearchItems.length > 0 ? (
                                        filteredSearchItems
                                            .slice(0, 8)
                                            .map((item) => (
                                                <button
                                                    key={item.route}
                                                    type="button"
                                                    className="topbar-search-result"
                                                    onClick={() =>
                                                        handleSearchSelect(item.route)
                                                    }
                                                >
                                                    <span className="topbar-search-result-icon">
                                                        <i className={item.icon}></i>
                                                    </span>

                                                    <span className="topbar-search-result-content">
                                                        <strong>{item.title}</strong>
                                                        <small>{item.description}</small>
                                                    </span>

                                                    <span className="topbar-search-result-arrow">
                                                        →
                                                    </span>
                                                </button>
                                            ))
                                    ) : (
                                        <div className="topbar-search-empty">
                                            <span>⌕</span>
                                            <strong>No results found</strong>
                                            <small>
                                                Try searching for a page or feature.
                                            </small>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ================= NOTIFICATION ================= */}
                        <button
                            type="button"
                            className="topbar-icon-btn"
                            aria-label="Notifications"
                            onClick={() => {
                                setSearchOpen(false);
                                setProfileOpen(false);
                            }}
                        >
                            <i className="bi bi-bell"></i>

                            <span className="notification-badge">
                                0
                            </span>
                        </button>

                        {/* ================= PROFILE ================= */}
                        <div
                            className="topbar-profile-wrap"
                            ref={profileWrapRef}
                        >
                            <button
                                type="button"
                                className={`topbar-profile ${
                                    profileOpen ? "active" : ""
                                }`}
                                aria-haspopup="menu"
                                aria-expanded={profileOpen}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    setProfileOpen((previous) => !previous);
                                    setSearchOpen(false);
                                }}
                            >
                                <div className="profile-avatar">
                                    {userName.charAt(0).toUpperCase()}
                                </div>

                                <div className="profile-info">
                                    <strong>{userName}</strong>
                                    <span>STUDENT</span>
                                </div>

                                <i
                                    className={`bi bi-chevron-down profile-arrow ${
                                        profileOpen ? "open" : ""
                                    }`}
                                ></i>
                            </button>

                            {/* ================= PROFILE MENU ================= */}
                            {profileOpen && (
                                <div
                                    className="topbar-profile-menu"
                                    role="menu"
                                >
                                    <div className="topbar-profile-menu-header">
                                        <div className="topbar-profile-menu-avatar">
                                            {userName.charAt(0).toUpperCase()}
                                        </div>

                                        <div>
                                            <strong>{userName}</strong>
                                            <span>Student Account</span>
                                        </div>
                                    </div>

                                    <div className="topbar-menu-divider"></div>

                                    <button
                                        type="button"
                                        className="topbar-menu-item"
                                        role="menuitem"
                                        onClick={() => {
                                            setProfileOpen(false);
                                            navigate("/profile");
                                        }}
                                    >
                                        <span className="topbar-menu-icon">
                                            <i className="bi bi-person"></i>
                                        </span>

                                        <span className="topbar-menu-content">
                                            <strong>My Profile</strong>
                                            <small>
                                                View and edit your profile
                                            </small>
                                        </span>

                                        <i className="bi bi-arrow-right"></i>
                                    </button>

                                    <button
                                        type="button"
                                        className="topbar-menu-item"
                                        role="menuitem"
                                        onClick={() => {
                                            setProfileOpen(false);
                                            navigate("/settings");
                                        }}
                                    >
                                        <span className="topbar-menu-icon">
                                            <i className="bi bi-gear"></i>
                                        </span>

                                        <span className="topbar-menu-content">
                                            <strong>Settings</strong>
                                            <small>
                                                Manage your account settings
                                            </small>
                                        </span>

                                        <i className="bi bi-arrow-right"></i>
                                    </button>

                                    <div className="topbar-menu-divider"></div>

                                    <button
                                        type="button"
                                        className="topbar-menu-item logout"
                                        role="menuitem"
                                        onClick={handleLogout}
                                    >
                                        <span className="topbar-menu-icon">
                                            <i className="bi bi-box-arrow-right"></i>
                                        </span>

                                        <span className="topbar-menu-content">
                                            <strong>Logout</strong>
                                            <small>
                                                Sign out of your account
                                            </small>
                                        </span>

                                        <i className="bi bi-arrow-right"></i>
                                    </button>
                                </div>
                            )}
                        </div>

                    </div>

                </header>

                {/* ================= PAGE CONTENT ================= */}
                <main className="app-content">
                    {children}
                </main>

            </div>
        </div>
    );
}

export default Layout;
