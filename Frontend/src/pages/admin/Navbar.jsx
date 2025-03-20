import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "./Navbar.css";
const Navbar = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/"); 
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">Library</div>

      <div className="navbar-links">
        <Link to="/admin" className="nav-link">Home</Link>
        <Link to="/add-book" className="nav-link">Add Book</Link>
      </div>

      <button className="logout-btn" onClick={handleLogout}>Logout</button>
    </nav>
  );
};

export default Navbar;