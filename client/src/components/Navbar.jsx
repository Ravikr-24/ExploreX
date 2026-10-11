import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authSlice";


import "./Navbar.css";

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { token, user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    const currentPath = location.pathname;

    dispatch(logout());

    navigate("/login", {
      state: {
        from: {
          pathname: currentPath,
        },
      },
    });
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          ExploreX
        </Link>

        <nav className="navbar-links">
          <Link to="/" className="navbar-link">
            Home
          </Link>

          <Link to="/explore" className="navbar-link">
            Explore
          </Link>

          {token && (
            <>
              <Link to="/favorites" className="navbar-link">
                Favorites
              </Link>

              <Link to="/travel-plans" className="navbar-link">
                Travel Plans
              </Link>

              <Link to="/profile" className="navbar-link">
                Profile
              </Link>

              {user?.role === "admin" && (
                <Link to="/admin" className="navbar-link">
                  Admin Dashboard
                </Link>
              )}
            </>
          )}
        </nav>

        <div className="navbar-actions">
          {token ? (
            <>
              <span className="navbar-user">
                Hi, {user?.name || "User"}
              </span>

              <button
                type="button"
                className="logout-button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="login-button">
                Login
              </Link>

              <Link to="/register" className="register-button">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;