import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./box/Login";
import Signup from "./box/Signup";
import UserDashboard from "./pages/user/UserDashboard"
import AdminDashboard from "./pages/admin/AdminDashboard";
import EditBook from "./pages/admin/EditBook";
import AddBook from "./pages/admin/AddBook";
import Liked from "./pages/user/Liked";

function App() {
  return (
    <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/user" element={<UserDashboard />} />
          <Route path="/liked" element={<Liked />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/edit/:id" element={<EditBook />} />
          <Route path="/add-book" element={<AddBook />} />
        </Routes>
    </AuthProvider>
  );
}

export default App;