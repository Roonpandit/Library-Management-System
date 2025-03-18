import { useNavigate } from "react-router-dom";

const MainDashboard = () => {
  const navigate = useNavigate();


  return (
    <div>
      <h1>Welcome to the Main Dashboard</h1>

      <button onClick={() => navigate("/login")}>Login</button>
      <button onClick={() => navigate("/signup")}>Signup</button>
    </div>
  );
};

export default MainDashboard;