import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./box/Login";
import Signup from "./box/Signup";
import MainDashboard from "./box/MainDashboard";
import UserDashboard from "./pages/user/UserDashboard"
import AdminDashboard from "./pages/admin/AdminDashboard";
import List from "./pages/admin/List";

function App() {
  return (
    <AuthProvider>
        <Routes>
          <Route path="/" element={<MainDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/user" element={<UserDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/list" element={<List />} />
        </Routes>
    </AuthProvider>
  );
}

export default App;