import Sidebar from "./Sidebar";
import "./Layout.css";

function Layout({ children }) {
    return (
        <div className="app-layout">

            {/* ================= SIDEBAR ================= */}
            <aside className="app-sidebar">
                <Sidebar />
            </aside>

            {/* ================= MAIN AREA ================= */}
            <div className="app-main">

                {/* ================= TOPBAR ================= */}
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

                        {/* Search */}
                        <div className="topbar-search">
                            <i className="bi bi-search"></i>

                            <input
                                type="text"
                                placeholder="Search anything..."
                                aria-label="Search"
                            />

                            <span className="search-shortcut">
                                Ctrl K
                            </span>
                        </div>

                        {/* Notification */}
                        <button
                            type="button"
                            className="topbar-icon-btn"
                            aria-label="Notifications"
                        >
                            <i className="bi bi-bell"></i>

                            <span className="notification-badge">
                                0
                            </span>
                        </button>

                        {/* Profile */}
                        <button
                            type="button"
                            className="topbar-profile"
                        >
                            <div className="profile-avatar">
                                S
                            </div>

                            <div className="profile-info">
                                <strong>Student</strong>
                                <span>STUDENT</span>
                            </div>

                            <i className="bi bi-chevron-down profile-arrow"></i>
                        </button>

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