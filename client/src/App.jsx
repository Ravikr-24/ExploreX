import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

import { useEffect } from "react";
import { useDispatch } from "react-redux";

import "./App.css";



// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

// Redux
import { logout } from "./redux/authSlice";

// Public Pages
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import DestinationDetails from "./pages/DestinationDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Favorites from "./pages/Favorites";
import TravelPlans from "./pages/TravelPlans";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminDashboard from "./admin/AdminDashboard";
import AdminDestinations from "./admin/AdminDestinations";
import AddDestination from "./admin/AddDestination";
import EditDestination from "./admin/EditDestination";
import AdminUsers from "./admin/AdminUsers";
import AdminReviews from "./admin/AdminReviews";


// Handles automatic logout when the JWT becomes invalid
function AuthHandler() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthLogout = () => {
      // Clear authentication state from Redux
      dispatch(logout());

      // Redirect user to login page
      navigate("/login", {
        replace: true,
      });
    };

    window.addEventListener(
      "auth:logout",
      handleAuthLogout
    );

    return () => {
      window.removeEventListener(
        "auth:logout",
        handleAuthLogout
      );
    };
  }, [dispatch, navigate]);

  return null;
}


function App() {
  return (
    <BrowserRouter>
      {/* Handles expired/invalid JWT sessions */}
      <AuthHandler />

      {/* Navigation */}
      <Navbar />

      {/* Application Routes */}
      <Routes>

        {/* Public Routes */}
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/explore"
          element={<Explore />}
        />

        <Route
          path="/destination/:id"
          element={<DestinationDetails />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* Protected User Routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <Favorites />
            </ProtectedRoute>
          }
        />

        <Route
          path="/travel-plans"
          element={
            <ProtectedRoute>
              <TravelPlans />
            </ProtectedRoute>
          }
        />


        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/destinations"
          element={
            <AdminRoute>
              <AdminDestinations />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/destinations/add"
          element={
            <AdminRoute>
              <AddDestination />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/destinations/edit/:id"
          element={
            <AdminRoute>
              <EditDestination />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/reviews"
          element={
            <AdminRoute>
              <AdminReviews />
            </AdminRoute>
          }
        />


        {/* 404 Route */}
        <Route
          path="*"
          element={<NotFound />}
        />

      </Routes>

      {/* Footer */}
      <Footer />
    </BrowserRouter>
  );
}

export default App;