import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [accessToken, setAccessToken] = useState(localStorage.getItem("accessToken"));
  const [role, setRole] = useState(localStorage.getItem("role"));

  // ✅ Check token expiration every 5 seconds
  useEffect(() => {
    const checkTokenExpiration = () => {
      if (!accessToken) return;

      try {
        const decodedToken = jwtDecode(accessToken);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp < currentTime) {
          console.log("⏳ Access token expired. Logging out...");
          logout();
        }
      } catch (error) {
        console.error("❌ Error decoding token:", error);
        logout();
      }
    };

    const interval = setInterval(checkTokenExpiration, 5000);
    return () => clearInterval(interval);
  }, [accessToken]);

  const login = (token, role) => {
    if (!token) {
      console.error("❌ Token is missing! Login failed.");
      return;
    }
  
    setAccessToken(token);
    setRole(role);
    localStorage.setItem("accessToken", token);  // Keep "accessToken" for local storage consistency
    localStorage.setItem("role", role);
  };

  // ✅ Logout function (when token expires)
  const logout = () => {
    console.log("🔴 Logging out user...");
    
    setAccessToken(null);
    setRole(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");

    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ accessToken, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};