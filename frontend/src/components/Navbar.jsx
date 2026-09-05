function Navbar() {

    return (

        <header className="top-navbar">

            <div className="navbar-search">

                <span>⌕</span>

                <input
                    type="text"
                    placeholder="Search anything..."
                />

            </div>


            <div className="navbar-right">

                <button className="notification-btn">
                    ♢
                </button>

                <div className="user-avatar">
                    U
                </div>

            </div>

        </header>

    );
}

export default Navbar;