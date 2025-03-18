import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(localStorage.getItem("accessToken"));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem("refreshToken"));
  const [role, setRole] = useState(localStorage.getItem("role"));
  const navigate = useNavigate();

  useEffect(() => {
    const checkTokenExpiration = () => {
      if (!accessToken) return;

      const decodedToken = jwtDecode(accessToken);
      const currentTime = Date.now() / 1000; // Convert to seconds

      if (decodedToken.exp < currentTime) {
        console.log("Access token expired. Attempting refresh...");
        refreshAccessToken();
      }
    };

    const interval = setInterval(checkTokenExpiration, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [accessToken]);

  const refreshAccessToken = async () => {
    try {
      const res = await axios.post("https://login-focv.onrender.com/auth/refresh", { refreshToken });
      setAccessToken(res.data.accessToken);
      localStorage.setItem("accessToken", res.data.accessToken);
    } catch (error) {
      console.log("Session expired. Logging out.");
      logout();
    }
  };

  const login = (newAccessToken, newRefreshToken, userRole) => {
    setAccessToken(newAccessToken);
    setRefreshToken(newRefreshToken);
    setRole(userRole);

    localStorage.setItem("accessToken", newAccessToken);
    localStorage.setItem("refreshToken", newRefreshToken);
    localStorage.setItem("role", userRole);
  };

  const logout = () => {
    setAccessToken(null);
    setRefreshToken(null);
    setRole(null);

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");

    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ accessToken, login, logout, role }}>
      {children}
    </AuthContext.Provider>
  );
};