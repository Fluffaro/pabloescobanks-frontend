"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserRole } from "../../../utils/auth";

interface Transaction {
  amount: number;
  type: string;
  date: string;
  tid: number;
}

interface Account {
  balance: number;
  dateCreated: string;
  aid: number;
  sentTransactions: Transaction[];
  receivedTransactions: Transaction[];
}

interface User {
  uid: number;
  name: string;
  username: string;
  email: string;
  mobile: number;
  role: string;
  account: Account;
}

const AccountList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [sortField, setSortField] = useState("balance");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const role = getUserRole(); // ✅ Get role from JWT
    if (role !== "ADMIN") {
      router.push("/unauthorized"); // 🚫 Redirect non-admins
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please log in.");
      setLoading(false);
      return;
    }

    fetch("http://localhost:8080/api/users", {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 403) throw new Error("Forbidden: You don't have permission.");
        if (!res.ok) throw new Error("Failed to fetch users.");
        return res.json();
      })
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading accounts...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  const filteredUsers = users
    .filter((user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    )
    .filter((user) => (filterRole === "All" ? true : user.role === filterRole))
    .sort((a, b) => {
      const aValue = sortField === "balance" ? (a.account?.balance || 0) : new Date(a.account?.dateCreated || "").getTime();
      const bValue = sortField === "balance" ? (b.account?.balance || 0) : new Date(b.account?.dateCreated || "").getTime();
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-4">
      {/* Search & Filters */}
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search by name, username, or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-1 rounded w-1/3"
        />
        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="border px-3 py-1 rounded">
          <option value="All">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="USER">Customer</option>
        </select>
        <select value={sortField} onChange={(e) => setSortField(e.target.value)} className="border px-3 py-1 rounded">
          <option value="balance">Sort by Balance</option>
          <option value="dateCreated">Sort by Date Created</option>
        </select>
        <button onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")} className="border px-3 py-1 rounded">
          {sortOrder === "asc" ? "🔼 Ascending" : "🔽 Descending"}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-200">

              <th className="border px-4 py-2">AID</th>
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Username</th>
              <th className="border px-4 py-2">Email</th>
              <th className="border px-4 py-2">Mobile</th>
              <th className="border px-4 py-2">Balance</th>
              <th className="border px-4 py-2">Date Created</th>

            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user) => (
              <tr
                key={user.uid}
                className="text-center hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  localStorage.setItem("UIDparam", user.uid.toString());
                  router.push("/transaction");
                }}

              >

                <td className="border px-4 py-2">{user.account.aId}</td>
                <td className="border px-4 py-2">{user.name}</td>
                <td className="border px-4 py-2">{user.username}</td>
                <td className="border px-4 py-2">{user.email}</td>
                <td className="border px-4 py-2">{user.mobile}</td>
                <td className="border px-4 py-2">
                  {user.account ? `$${user.account.balance.toFixed(2)}` : "N/A"}
                </td>
                <td className="border px-4 py-2">
                  {user.account ? new Date(user.account.dateCreated).toLocaleDateString() : "N/A"}
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="border px-3 py-1 rounded disabled:opacity-50"
        >
          ◄
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="border px-3 py-1 rounded disabled:opacity-50"
        >
          ►
        </button>
      </div>
    </div>
  );
};

export default AccountList;
