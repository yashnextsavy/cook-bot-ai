
import { Navigate } from "react-router-dom";
import { useAuthState } from "../../context/AuthContext";
import Loader from "../Loader/Loader";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuthState();

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
}
