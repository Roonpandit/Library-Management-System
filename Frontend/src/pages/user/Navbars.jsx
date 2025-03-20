import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "./Navbars.css";
const Navbars = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/"); 
  };

  return (
    <nav className="navbars">
      <div className="navbars-logo">Library</div>

      <div className="navbars-links">
        <Link to="/user" className="navs-link">Home</Link>
        <Link to="/liked" className="navs-link">Liked</Link>
      </div>

      <button className="logout-btn" onClick={handleLogout}>Logout</button>
    </nav>
  );
};

export default Navbars;