import React from "react";
import { api } from "../api/api";

function UserTable({ users, refresh }) {
  const lockUser = async id => {
    await api.put(`/admin/lock/${id}`);
    refresh();
  };

  const unlockUser = async id => {
    await api.put(`/admin/unlock/${id}`);
    refresh();
  };

  const forceReset = async id => {
    await api.put(`/admin/force-reset/${id}`);
    refresh();
  };

  return (
    <table className="min-w-full bg-white border">
      <thead className="bg-gray-200">
        <tr>
          <th className="p-2 border">ID</th>
          <th className="p-2 border">Username</th>
          <th className="p-2 border">Role</th>
          <th className="p-2 border">Locked</th>
          <th className="p-2 border">Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map(u => (
          <tr key={u.id}>
            <td className="p-2 border">{u.id}</td>
            <td className="p-2 border">{u.username}</td>
            <td className="p-2 border">{u.role}</td>
            <td className="p-2 border">{u.locked ? "Yes" : "No"}</td>
            <td className="p-2 border space-x-2">
              {u.locked ? (
                <button onClick={() => unlockUser(u.id)} className="bg-green-500 px-2 py-1 rounded text-white">
                  Unlock
                </button>
              ) : (
                <button onClick={() => lockUser(u.id)} className="bg-red-500 px-2 py-1 rounded text-white">
                  Lock
                </button>
              )}
              <button onClick={() => forceReset(u.id)} className="bg-yellow-500 px-2 py-1 rounded text-white">
                Force Reset
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default UserTable;
