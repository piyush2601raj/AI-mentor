import { useNavigate } from "react-router-dom";

function Topbar() {

    const navigate = useNavigate();

    const username =
        localStorage.getItem("username") ||
        localStorage.getItem("name") ||
        "Student";

    const firstLetter =
        username.charAt(0).toUpperCase();

    return (
        <header className="topbar">

            {/* LEFT */}
            <div className="topbar-title">

                <h2>AI Learning Dashboard</h2>

                <p>
                    Continue your learning journey
                </p>

            </div>


            {/* RIGHT */}
            <div className="topbar-actions">

                {/* SEARCH */}
                <div className="search-box">

                    <span className="search-icon">
                        ⌕
                    </span>

                    <input
                        type="text"
                        placeholder="Search anything..."
                    />

                    <span className="search-shortcut">
                        ⌘ K
                    </span>

                </div>


                {/* NOTIFICATION */}
                <button
                    className="notification-btn"
                    type="button"
                    title="Notifications"
                >
                    ♢

                    <span className="notification-badge">
                        3
                    </span>

                </button>


                {/* PROFILE */}
                <button
                    className="profile-mini"
                    type="button"
                    onClick={() => navigate("/profile")}
                >

                    <div className="avatar">
                        {firstLetter}
                    </div>

                    <div className="profile-info">

                        <strong>
                            {username}
                        </strong>

                        <span>
                            STUDENT
                        </span>

                    </div>

                    <span className="profile-arrow">
                        ˅
                    </span>

                </button>

            </div>

        </header>
    );
}

export default Topbar;