import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handle = () => {
    logout();
    navigate("/login");
  };

  return (
    <button
      onClick={handle}
      className="px-3 py-1 bg-red-500 text-white rounded"
    >
      Logout
    </button>
  );
}
