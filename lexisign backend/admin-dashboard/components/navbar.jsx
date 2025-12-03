import React from "react";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("adminToken");
    navigate("/login");
  };

  return (
    <nav className="bg-blue-500 text-white p-4 flex justify-between">
      <h1 className="font-bold">Admin Panel</h1>
      <button onClick={logout} className="bg-red-500 px-3 py-1 rounded hover:bg-red-600">
        Logout
      </button>
    </nav>
  );
}

export default Navbar;