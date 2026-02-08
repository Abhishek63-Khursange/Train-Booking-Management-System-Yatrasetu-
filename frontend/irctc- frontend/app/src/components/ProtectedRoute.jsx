// components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
const ProtectedRoute = ({ children, adminOnly = false }) => {
  console.log("ProtectedRoute rendering... adminOnly:", adminOnly);
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    console.log("User from localStorage:", user);

    if (!user) {
      console.log("No user found, redirecting to login...");
      return <Navigate to="/login" />;
    }

    if (adminOnly && user.role !== "ADMIN") {
      console.log("User is not admin, redirecting to home...");
      return <Navigate to="/home" />
    }

    console.log("User is authorized, rendering children...");
    return children;
  } catch (error) {
    console.error("Error parsing user from localStorage:", error);
    return <Navigate to="/login" />;
  }
};

export default ProtectedRoute; // ✅ Default export here
