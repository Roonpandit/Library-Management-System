import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // State for error message
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post("https://login-focv.onrender.com/auth/login", { email, password });

      //  Extract values correctly
      const { accessToken, refreshToken, role, redirectPath } = res.data;

      login(accessToken, refreshToken, role);

      // ✅ Use `redirectPath` from response
      if (redirectPath) {
        navigate(redirectPath);
      } else {
        console.error("No redirect path found in response");
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message); // Set error message from backend
      } else {
        setError("Login failed. Please try again.");
      }
    }
  };

  return (
    <div>
      <h2>Login</h2>

      {error && <p style={{ color: "red" }}>{error}</p>} {/* ✅ Show error if exists */}

      <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Login;