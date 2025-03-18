import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [user, setUser] = useState({ name: "", email: "", password: "", role: "user" });
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      await axios.post("https://login-focv.onrender.com/auth/signup", user);
      alert("Signup successful! Please log in.");
      navigate("/login");
    } catch (err) {
      if (err.response) {
        alert(err.response.data.message);
      } else {
        alert("Signup failed. Please try again.");
      }
    }
  };

  return (
    <div>
      <h2>Signup</h2>
      <input type="text" placeholder="Name" onChange={(e) => setUser({ ...user, name: e.target.value })} />
      
      {/* Ensure email is always in lowercase */}
      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setUser({ ...user, email: e.target.value.toLowerCase() })}
      />
      
      <input type="password" placeholder="Password" onChange={(e) => setUser({ ...user, password: e.target.value })} />
      <button onClick={handleSignup}>Signup</button>
    </div>
  );
};

export default Signup;