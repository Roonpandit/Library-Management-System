import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Signup.css";
const Signup = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async () => {
    if (!user.name || !user.email || !user.password) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);

    try {
      await axios.post(import.meta.env.VITE_SIGNUP_ENDPOINT, user);
      alert("Signup successful! Please log in.");
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Signup failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <h2>Signup</h2>

      {error && <p className="error">{error}</p>}

      <input
        type="text"
        placeholder="Name"
        value={user.name}
        required
        onChange={(e) => setUser({ ...user, name: e.target.value })}
      />

      <input
        type="email"
        placeholder="Email"
        value={user.email}
        required
        onChange={(e) =>
          setUser({ ...user, email: e.target.value.toLowerCase() })
        }
      />

      <input
        type="password"
        placeholder="Password"
        value={user.password}
        required
        onChange={(e) => setUser({ ...user, password: e.target.value })}
      />

      <button onClick={handleSignup} disabled={loading}>
        {loading ? "Signing up..." : "Signup"}
      </button>

      <p>
        Already have an account?{" "}
        <span onClick={() => navigate("/")}>Login</span>
      </p>
    </div>
  );
};

export default Signup;
