import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const UserDashboard = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login"); // Redirect after logout
  };

  return (
    <div>
      <h2>User Dashboard</h2>
      <button onClick={handleLogout}>Logout</button>
      


    </div>
  );
};

export default UserDashboard;