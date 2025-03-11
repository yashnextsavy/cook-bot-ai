
import { Navigate } from "react-router-dom";
import { useAuthState } from "../../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuthState();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
}
