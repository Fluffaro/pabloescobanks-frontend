"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserRole } from "../../../utils/auth";
import Header from "@/app/components/Header";
import { motion } from "framer-motion";

interface Transaction {
  amount: number;
  type: string;
  date: string;
  tid: number;
}

interface Account {
  balance: number;
  dateCreated: string;
  aId: number;
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

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};

const slideUp = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
};

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

    const role = getUserRole(); // ✅ Get role from JWT noice
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

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col">
        <Header user={null} />
        <div className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" />
                  <path d="M12 8v4" />
                  <path d="M12 16h.01" />
                </svg>
              </div>
              <p className="text-neutral-600 font-medium">Loading accounts...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col">
        <Header user={null} />
        <div className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-500 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 9v4" />
                  <path d="M12 17h.01" />
                  <path d="m9 3 1.5 5h3L15 3" />
                  <path d="M9 6c0 9.6 1.9 11.5 4.5 14" />
                  <path d="M14.994 18c.001 1.13-.734 4-.734 4" />
                </svg>
              </div>
              <p className="text-red-600 font-medium mb-2">Error</p>
              <p className="text-neutral-600">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredUsers = users
    .filter((user) =>
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.username?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase())
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
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Header user={null} />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <motion.div 
          className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.03)] overflow-hidden border border-neutral-100 p-6 mb-6"
          variants={fadeIn} 
          initial="hidden" 
          animate="visible"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <h1 className="text-2xl font-semibold text-[#1d1d1f]">Admin Dashboard</h1>
            <p className="text-sm text-neutral-500">Manage user accounts</p>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.03)] overflow-hidden border border-neutral-100 p-6 mb-10"
          variants={fadeIn} 
          initial="hidden" 
          animate="visible"
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-lg font-medium text-[#1d1d1f] mb-4">Filters & Search</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-neutral-500 mb-2">Search</label>
        <input
                id="search"
          type="text"
          placeholder="Search by name, username, or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
                className="w-full p-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-neutral-500 mb-2">Role</label>
              <select 
                id="role"
                value={filterRole} 
                onChange={(e) => setFilterRole(e.target.value)} 
                className="w-full p-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
              >
          <option value="All">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="USER">Customer</option>
        </select>
            </div>
            <div>
              <label htmlFor="sortField" className="block text-sm font-medium text-neutral-500 mb-2">Sort By</label>
              <select 
                id="sortField"
                value={sortField} 
                onChange={(e) => setSortField(e.target.value)} 
                className="w-full p-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
              >
                <option value="balance">Balance</option>
                <option value="dateCreated">Date Created</option>
        </select>
            </div>
            <div>
              <label htmlFor="sortOrder" className="block text-sm font-medium text-neutral-500 mb-2">Order</label>
              <button 
                id="sortOrder"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")} 
                className="w-full p-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all flex items-center justify-center"
              >
                <span className="mr-2">{sortOrder === "asc" ? "Ascending" : "Descending"}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transition-transform ${sortOrder === "asc" ? "rotate-180" : ""}`}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
        </button>
            </div>
          </div>
        </motion.div>

        <motion.section
          variants={slideUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold text-[#1d1d1f]">Accounts List</h2>
            <span className="text-sm text-neutral-500">{filteredUsers.length} accounts found</span>
      </div>

          {paginatedUsers.length > 0 ? (
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
                <table className="w-full">
          <thead>
                    <tr className="text-left border-b border-neutral-200 bg-neutral-50">
                      <th className="px-6 py-4 font-medium text-neutral-500 text-sm">AID</th>
                      <th className="px-6 py-4 font-medium text-neutral-500 text-sm">Name</th>
                      <th className="px-6 py-4 font-medium text-neutral-500 text-sm">Username</th>
                      <th className="px-6 py-4 font-medium text-neutral-500 text-sm">Email</th>
                      <th className="px-6 py-4 font-medium text-neutral-500 text-sm">Mobile</th>
                      <th className="px-6 py-4 font-medium text-neutral-500 text-sm">Balance</th>
                      <th className="px-6 py-4 font-medium text-neutral-500 text-sm">Date Created</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user) => (
              <tr
                key={user.uid}
                        className="border-b border-neutral-100 last:border-none hover:bg-neutral-50 transition-colors cursor-pointer"
                onClick={() => {
                  localStorage.setItem("UIDparam", user.uid.toString());
                  router.push("/transaction");
                }}
                      >
                        <td className="px-6 py-4 text-neutral-600">{user.account?.aId || 'N/A'}</td>
                        <td className="px-6 py-4 text-neutral-600">{user.name}</td>
                        <td className="px-6 py-4 text-neutral-600">{user.username}</td>
                        <td className="px-6 py-4 text-neutral-600">{user.email}</td>
                        <td className="px-6 py-4 text-neutral-600">{user.mobile}</td>
                        <td className="px-6 py-4 font-medium text-green-600">
                          ₱{user.account?.balance.toFixed(2) || '0.00'}
                </td>
                        <td className="px-6 py-4 text-neutral-600">
                          {user.account?.dateCreated 
                            ? new Date(user.account.dateCreated).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : 'N/A'
                          }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-neutral-100 flex justify-between items-center">
                  <span className="text-sm text-neutral-500">
                    Showing {(currentPage - 1) * itemsPerPage + 1}-
                    {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length}
                  </span>
                  <div className="flex space-x-2">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
                      className={`h-8 w-8 rounded flex items-center justify-center ${
                        currentPage === 1
                          ? "text-neutral-300 cursor-not-allowed"
                          : "text-neutral-600 hover:bg-neutral-100"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m15 18-6-6 6-6" />
                      </svg>
        </button>

                    <div className="bg-neutral-100 rounded px-3 flex items-center text-sm font-medium">
                      {currentPage} / {totalPages}
                    </div>

        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
                      className={`h-8 w-8 rounded flex items-center justify-center ${
                        currentPage === totalPages
                          ? "text-neutral-300 cursor-not-allowed"
                          : "text-neutral-600 hover:bg-neutral-100"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m9 18 6-6-6-6" />
                      </svg>
        </button>
      </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center">
              <div className="flex justify-center mb-3">
                <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="M8 12h8" />
                    <path d="M12 8v8" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-medium text-[#1d1d1f] mb-1">No accounts found</h3>
              <p className="text-neutral-500">Try adjusting your search or filters</p>
            </div>
          )}
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-neutral-200 bg-white">
        <div className="container mx-auto px-4 text-center text-neutral-500 text-sm">
          &copy; {new Date().getFullYear()} Pablo EscoBanks Admin. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default AccountList;
