import React, { useEffect, useState } from "react";
import { api } from "../api/api";
import UserTable from "../components/UserTable";
import Navbar from "../components/Navbar";

function Dashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data.users || res.data); // adjust based on backend
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="p-4">
        <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
        {loading ? <p>Loading users...</p> : <UserTable users={users} refresh={fetchUsers} />}
      </div>
    </div>
  );
}

export default Dashboard;
