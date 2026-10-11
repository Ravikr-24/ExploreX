import { useSelector } from "react-redux";
import "../styles/profile.css";

function Profile() {
  const { user } = useSelector((state) => state.auth);

  return (
    <main className="profile-page">
      <section className="profile-header">
        <p>MY ACCOUNT</p>

        <h1>My Profile</h1>

        <span>Manage your ExploreX account.</span>
      </section>

      <section className="profile-card">
        <div className="profile-avatar">
          {user?.name?.charAt(0).toUpperCase() || "U"}
        </div>

        <div className="profile-info">
          <h2>{user?.name || "User"}</h2>

          <div className="profile-detail">
            <strong>Name</strong>
            <span>{user?.name || "Not available"}</span>
          </div>

          <div className="profile-detail">
            <strong>Email</strong>
            <span>{user?.email || "Not available"}</span>
          </div>

          <div className="profile-detail">
            <strong>Role</strong>
            <span>{user?.role || "user"}</span>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Profile;