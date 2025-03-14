"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "../components/hooks/use-toast";
import Header from "../components/Header";

// ------------------------------------------------------------------------------------
// 1) Interfaces and Types
// ------------------------------------------------------------------------------------
interface User {
  id?: string;
  name?: string;
  email?: string;
}

interface Transaction {
  id: string;
  date: string;
  type: string;
  receiverAccount?: {
    aId: number;
  };
  amount: number;
}

// ------------------------------------------------------------------------------------
// 2) API Base URL - Put your real endpoint here
// ------------------------------------------------------------------------------------
const API_BASE_URL = "http://localhost:8080/api"; // Or your actual endpoint

// ------------------------------------------------------------------------------------
// 3) Framer Motion animation variants
// ------------------------------------------------------------------------------------
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};

const slideUp = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
};

// ------------------------------------------------------------------------------------
// 4) Reusable Components
// ------------------------------------------------------------------------------------
const MotionButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}> = ({ children, onClick, className = "", disabled = false }) => (
  <motion.button
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.97 }}
    className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
      disabled
        ? "bg-neutral-200 text-neutral-500 cursor-not-allowed"
        : "bg-[#f5f5f7] text-[#1d1d1f] shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
    } ${className}`}
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </motion.button>
);

const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  balance: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, balance, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-[#1d1d1f]/20 backdrop-blur-sm flex justify-center items-center z-50 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.2)] max-w-md w-full relative overflow-hidden border border-neutral-100"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 500 }}
          >
            <div className="absolute right-4 top-4">
              <button
                className="h-8 w-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
                onClick={onClose}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
              </button>
            </div>

            <div className="p-6">
              <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-4">{title}</h2>
              <div className="bg-neutral-50 rounded-xl p-5 mb-6 border border-neutral-100">
                <p className="text-neutral-500 text-sm font-medium mb-1">Current Balance</p>
                <h3 className="text-2xl font-semibold text-[#1d1d1f]">{balance}</h3>
              </div>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ------------------------------------------------------------------------------------
// 5) Confirmation Modal (reusable)
// ------------------------------------------------------------------------------------
const ConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, onConfirm, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-[#1d1d1f]/20 backdrop-blur-sm flex justify-center items-center z-50 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.2)] max-w-md w-full relative overflow-hidden border border-neutral-100"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 500 }}
          >
            <div className="absolute right-4 top-4">
              <button
                className="h-8 w-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
                onClick={onClose}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
              </button>
            </div>

            <div className="p-6">
              <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-4">{title}</h2>
              <div className="text-neutral-600 mb-6">{children}</div>
              <div className="flex space-x-3 justify-end">
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-lg text-neutral-500 hover:bg-neutral-100 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  className="px-5 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors font-medium"
                >
                  Confirm
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ------------------------------------------------------------------------------------
// 6) Header Component
// ------------------------------------------------------------------------------------
<Header user={user} />

// ------------------------------------------------------------------------------------
// 7) Main Dashboard Component (new UI + old integration)
// ------------------------------------------------------------------------------------
export default function Dashboard() {
  const toast = useToast();
  const router = useRouter();

  // We'll use the same modals as your new UI
  const [modalType, setModalType] = useState<"withdraw" | "send" | "deposit" | "request" | null>(
    null
  );

  // We'll have 3 separate confirmation modals for deposit, withdraw, and send
  const [confirmDepositOpen, setConfirmDepositOpen] = useState(false);
  const [confirmWithdrawOpen, setConfirmWithdrawOpen] = useState(false);
  const [confirmSendOpen, setConfirmSendOpen] = useState(false);

  // We'll show the user info in the header, and also handle the real data
  const [user, setUser] = useState<User | undefined>();
  const [balance, setBalance] = useState<string>("$0.00");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string>("");

  // For deposit, withdraw, send, request
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [transferAmount, setTransferAmount] = useState<string>("");
  const [receiverAccountId, setReceiverAccountId] = useState<string>("");

  // For request money
  const [requestReceiverId, setRequestReceiverId] = useState<string>("");
  const [requestAmount, setRequestAmount] = useState<string>("");

  // Sorting + pagination
  const [sortColumn, setSortColumn] = useState<"date" | "type" | "receiver" | "amount">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 5;

  // We will read token + userId from localStorage (like your old code).
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // ---------------------------------------------------------------------------
  // Data Fetching: user, account details, transactions
  // ---------------------------------------------------------------------------
  async function fetchUser() {
    try {
      const userRes = await fetch(`${API_BASE_URL}/users/${userId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!userRes.ok) {
        throw new Error("Failed to fetch user");
      }
      const userData = await userRes.json();
      setUser(userData);
    } catch (error: any) {
      console.error(error);
      setError(error.message);
    }
  }

  async function fetchAccountDetails() {
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/user/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch account details");
      }
      const data = await response.json();
      setBalance(`$${data.balance.toFixed(2)}`);
    } catch (error) {
      console.error("Error fetching account details:", error);
    }
  }

  async function fetchTransactions() {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions/user/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  }

  // ---------------------------------------------------------------------------
  // useEffect: fetch data on mount
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!userId || !token) {
      // If not logged in, optionally redirect
      // router.push("/login");
      return;
    }
    fetchUser();
    fetchAccountDetails();
    fetchTransactions();
  }, []);

  // ---------------------------------------------------------------------------
  // Deposit
  // ---------------------------------------------------------------------------
  const handleDeposit = async () => {
    const parsedAmount = parseFloat(depositAmount);
    if (!depositAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.toast({
        title: "Invalid amount",
        description: "Please enter a valid deposit amount",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/accounts/deposit/${userId}?amount=${parsedAmount}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Deposit failed");
      }

      setConfirmDepositOpen(false);
      setModalType(null);
      setDepositAmount("");

      toast.toast({
        title: "Success",
        description: `Deposited $${parsedAmount.toFixed(2)} successfully!`,
      });

      await fetchAccountDetails();
      await fetchTransactions();
    } catch (error: any) {
      console.error("Deposit failed:", error);
      toast.toast({
        title: "Error",
        description: error.message || "Deposit failed",
        variant: "destructive",
      });
    }
  };

  // ---------------------------------------------------------------------------
  // Withdraw
  // ---------------------------------------------------------------------------
  const handleWithdraw = async () => {
    const parsedAmount = parseFloat(withdrawAmount);
    if (!withdrawAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.toast({
        title: "Invalid amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/accounts/withdraw/${userId}?amount=${parsedAmount}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/error/401");
        } else {
          router.push("/error/500");
        }
      }

      setConfirmWithdrawOpen(false);
      setModalType(null);
      setWithdrawAmount("");

      toast.toast({
        title: "Success",
        description: `Withdrew $${parsedAmount.toFixed(2)} successfully!`,
      });

      await fetchAccountDetails();
      await fetchTransactions();
    } catch (error: any) {
      console.error("Withdrawal failed:", error);
      toast.toast({
        title: "Error",
        description: error.message || "Withdrawal failed",
        variant: "destructive",
      });
    }
  };

  // ---------------------------------------------------------------------------
  // Transfer
  // ---------------------------------------------------------------------------
  const handleTransfer = async () => {
    const parsedAmount = parseFloat(transferAmount);
    const parsedReceiverId = parseInt(receiverAccountId);

    if (!transferAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.toast({
        title: "Invalid amount",
        description: "Please enter a valid transfer amount",
        variant: "destructive",
      });
      return;
    }

    if (!receiverAccountId || isNaN(parsedReceiverId)) {
      toast.toast({
        title: "Invalid ID",
        description: "Please enter a valid receiver ID",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/transactions/transfer?senderId=${userId}&receiverAccountId=${parsedReceiverId}&amount=${parsedAmount}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/error/401");
        } else {
          router.push("/error/500");
        }
      }

      setConfirmSendOpen(false);
      setModalType(null);
      setTransferAmount("");
      setReceiverAccountId("");

      toast.toast({
        title: "Success",
        description: `Sent $${parsedAmount.toFixed(2)} to account ${parsedReceiverId}!`,
      });

      await fetchAccountDetails();
      await fetchTransactions();
    } catch (error: any) {
      console.error("Transfer failed:", error);
      toast.toast({
        title: "Error",
        description: error.message || "Transfer failed",
        variant: "destructive",
      });
    }
  };

  // ---------------------------------------------------------------------------
  // Request
  // ---------------------------------------------------------------------------
  const handleRequestMoney = async () => {
    const parsedAmount = parseFloat(requestAmount);
    const parsedReceiverId = parseInt(requestReceiverId);

    if (!requestAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.toast({
        title: "Invalid amount",
        description: "Please enter a valid request amount",
        variant: "destructive",
      });
      return;
    }

    if (!requestReceiverId || isNaN(parsedReceiverId)) {
      toast.toast({
        title: "Invalid ID",
        description: "Please enter a valid receiver ID",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/requests/create?requesterAccId=${userId}&receiverAccId=${parsedReceiverId}&amount=${parsedAmount}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create money request");
      }

      setModalType(null);
      setRequestAmount("");
      setRequestReceiverId("");

      toast.toast({
        title: "Request Sent",
        description: `Requested $${parsedAmount.toFixed(2)} from account ${parsedReceiverId}`,
      });
    } catch (error: any) {
      console.error("Money request creation failed:", error);
      toast.toast({
        title: "Error",
        description: error.message || "Unable to request money",
        variant: "destructive",
      });
    }
  };

  // ---------------------------------------------------------------------------
  // Sorting & Pagination
  // ---------------------------------------------------------------------------
  const handleSort = (column: "date" | "type" | "receiver" | "amount") => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    if (sortColumn === "date") {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    }
    if (sortColumn === "type") {
      const typeA = a.type?.toLowerCase() || "";
      const typeB = b.type?.toLowerCase() || "";
      if (typeA < typeB) return sortDirection === "asc" ? -1 : 1;
      if (typeA > typeB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    }
    if (sortColumn === "receiver") {
      const recvA = a.receiverAccount?.aId || 0;
      const recvB = b.receiverAccount?.aId || 0;
      return sortDirection === "asc" ? recvA - recvB : recvB - recvA;
    }
    if (sortColumn === "amount") {
      const amtA = a.amount || 0;
      const amtB = b.amount || 0;
      return sortDirection === "asc" ? amtA - amtB : amtB - amtA;
    }
    return 0;
  });

  const totalPages = Math.ceil(transactions.length / transactionsPerPage);
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = sortedTransactions.slice(
    indexOfFirstTransaction,
    indexOfLastTransaction
  );

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Header user={user} />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        {/* Balance Card */}
        <motion.section className="mb-10" variants={fadeIn} initial="hidden" animate="visible">
          <motion.div
            className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.03)] overflow-hidden border border-neutral-100"
            whileHover={{ y: -4, boxShadow: "0 10px 40px rgba(0,0,0,0.05)" }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-8 py-10">
              <h2 className="text-sm font-medium text-neutral-500 mb-1">Available Balance</h2>
              <div className="flex items-end space-x-2">
                <h3 className="text-4xl font-semibold text-[#1d1d1f] tracking-tight">{balance}</h3>
                {/* Example growth indicator (optional) */}
                <div className="text-green-500 text-sm font-medium pb-1 flex items-center">
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
                    className="mr-1"
                  >
                    <path d="m6 15 6-6 6 6" />
                  </svg>
                  4.25%
                </div>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* Action Buttons */}
        <motion.section
          className="mb-12"
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MotionButton
              onClick={() => setModalType("send")}
              className="flex items-center justify-center space-x-2 border border-neutral-200 bg-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-500"
              >
                <path d="m5 9 14-5-5 14-3-5-6-4Z" />
                <path d="M14 14H5v5h5v-5Z" />
              </svg>
              <span>Send Money</span>
            </MotionButton>

            <MotionButton
              onClick={() => setModalType("withdraw")}
              className="flex items-center justify-center space-x-2 border border-neutral-200 bg-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-red-500"
              >
                <path d="M12 17V3" />
                <path d="m6 11 6 6 6-6" />
                <path d="M19 21H5" />
              </svg>
              <span>Withdraw</span>
            </MotionButton>

            <MotionButton
              onClick={() => setModalType("deposit")}
              className="flex items-center justify-center space-x-2 border border-neutral-200 bg-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-green-500"
              >
                <path d="M12 7V21" />
                <path d="m6 13 6-6 6 6" />
                <path d="M19 5H5" />
              </svg>
              <span>Deposit</span>
            </MotionButton>

            <MotionButton
              onClick={() => setModalType("request")}
              className="flex items-center justify-center space-x-2 border border-neutral-200 bg-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-purple-500"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M9 10h6" />
                <path d="M9 14h6" />
              </svg>
              <span>Request</span>
            </MotionButton>
          </div>
        </motion.section>

        {/* Transaction History */}
        <motion.section
          variants={slideUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold text-[#1d1d1f]">Transaction History</h2>
          </div>

          {transactions.length > 0 ? (
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-neutral-200">
                      <th
                        className="px-6 py-4 font-medium text-neutral-500 text-sm cursor-pointer"
                        onClick={() => handleSort("date")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Date</span>
                          {sortColumn === "date" && (
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
                              className={`transition-transform ${
                                sortDirection === "asc" ? "rotate-180" : ""
                              }`}
                            >
                              <path d="m6 9 6 6 6-6" />
                            </svg>
                          )}
                        </div>
                      </th>
                      <th
                        className="px-6 py-4 font-medium text-neutral-500 text-sm cursor-pointer"
                        onClick={() => handleSort("type")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Transaction</span>
                          {sortColumn === "type" && (
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
                              className={`transition-transform ${
                                sortDirection === "asc" ? "rotate-180" : ""
                              }`}
                            >
                              <path d="m6 9 6 6 6-6" />
                            </svg>
                          )}
                        </div>
                      </th>
                      <th
                        className="px-6 py-4 font-medium text-neutral-500 text-sm cursor-pointer"
                        onClick={() => handleSort("receiver")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Receiver</span>
                          {sortColumn === "receiver" && (
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
                              className={`transition-transform ${
                                sortDirection === "asc" ? "rotate-180" : ""
                              }`}
                            >
                              <path d="m6 9 6 6 6-6" />
                            </svg>
                          )}
                        </div>
                      </th>
                      <th
                        className="px-6 py-4 font-medium text-neutral-500 text-sm cursor-pointer"
                        onClick={() => handleSort("amount")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Amount</span>
                          {sortColumn === "amount" && (
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
                              className={`transition-transform ${
                                sortDirection === "asc" ? "rotate-180" : ""
                              }`}
                            >
                              <path d="m6 9 6 6 6-6" />
                            </svg>
                          )}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTransactions.map((tx) => (
                      <tr
                        key={tx.id}
                        className="border-b border-neutral-100 last:border-none hover:bg-neutral-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-neutral-600">
                          {new Date(tx.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <div
                              className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                tx.type === "DEPOSIT"
                                  ? "bg-green-100 text-green-600"
                                  : tx.type === "WITHDRAWAL"
                                  ? "bg-red-100 text-red-600"
                                  : "bg-blue-100 text-blue-600"
                              }`}
                            >
                              {tx.type === "DEPOSIT" ? (
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
                                  <path d="m6 9 6-6 6 6" />
                                  <path d="M12 3v14" />
                                  <path d="M6 21h12" />
                                </svg>
                              ) : tx.type === "WITHDRAWAL" ? (
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
                                  <path d="m6 9 6 6 6-6" />
                                  <path d="M12 3v12" />
                                  <path d="M6 21h12" />
                                </svg>
                              ) : (
                                // For TRANSFER or other
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
                                  <path d="M12 19V5" />
                                  <path d="m5 12 7-7 7 7" />
                                </svg>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-[#1d1d1f]">{tx.type}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-neutral-600">
                          {tx.receiverAccount ? `Account ${tx.receiverAccount.aId}` : "—"}
                        </td>
                        <td className="px-6 py-4 font-medium">
                          {/* HERE is the updated snippet:
                              For WITHDRAWAL or TRANSFER => red with “-”
                              For DEPOSIT => green with “+”
                          */}
                          <span
                            className={
                              tx.type === "WITHDRAWAL" || tx.type === "TRANSFER"
                                ? "text-red-600"
                                : "text-green-600"
                            }
                          >
                            {tx.type === "WITHDRAWAL" || tx.type === "TRANSFER" ? "-" : "+"}
                            ${tx.amount.toFixed(2)}
                          </span>
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
                    Showing {indexOfFirstTransaction + 1}-
                    {Math.min(indexOfLastTransaction, transactions.length)} of {transactions.length}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={goToPrevPage}
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
                      onClick={goToNextPage}
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
              <h3 className="text-lg font-medium text-[#1d1d1f] mb-1">No transactions yet</h3>
              <p className="text-neutral-500">Your transaction history will appear here</p>
            </div>
          )}
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-neutral-200 bg-white">
        <div className="container mx-auto px-4 text-center text-neutral-500 text-sm">
          &copy; {new Date().getFullYear()} Pablo EscoBanks. All rights reserved.
        </div>
      </footer>

      {/* Deposit Modal */}
      <Modal
        isOpen={modalType === "deposit"}
        onClose={() => setModalType(null)}
        title="Deposit Money"
        balance={balance}
      >
        <div className="mb-6">
          <label htmlFor="depositAmount" className="block text-sm font-medium text-neutral-500 mb-2">
            Amount to Deposit
          </label>
          <input
            id="depositAmount"
            type="number"
            placeholder="Enter amount"
            className="w-full p-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
          />
        </div>
        <div className="flex justify-end">
          <button
            className="px-5 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
            onClick={() => {
              if (!depositAmount || parseFloat(depositAmount) <= 0) {
                toast.toast({
                  title: "Invalid amount",
                  description: "Please enter a valid deposit amount",
                  variant: "destructive",
                });
                return;
              }
              setModalType(null);
              setConfirmDepositOpen(true);
            }}
          >
            Next
          </button>
        </div>
      </Modal>

      {/* Withdraw Modal */}
      <Modal
        isOpen={modalType === "withdraw"}
        onClose={() => setModalType(null)}
        title="Withdraw Money"
        balance={balance}
      >
        <div className="mb-6">
          <label htmlFor="withdrawAmount" className="block text-sm font-medium text-neutral-500 mb-2">
            Amount to Withdraw
          </label>
          <input
            id="withdrawAmount"
            type="number"
            placeholder="Enter amount"
            className="w-full p-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
          />
        </div>
        <div className="flex justify-end">
          <button
            className="px-5 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
            onClick={() => {
              if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
                toast.toast({
                  title: "Invalid amount",
                  description: "Please enter a valid withdrawal amount",
                  variant: "destructive",
                });
                return;
              }
              setModalType(null);
              setConfirmWithdrawOpen(true);
            }}
          >
            Next
          </button>
        </div>
      </Modal>

      {/* Send Modal */}
      <Modal
        isOpen={modalType === "send"}
        onClose={() => setModalType(null)}
        title="Send Money"
        balance={balance}
      >
        <div className="space-y-4 mb-6">
          <div>
            <label htmlFor="receiverId" className="block text-sm font-medium text-neutral-500 mb-2">
              Receiver ID
            </label>
            <input
              id="receiverId"
              type="number"
              placeholder="Enter receiver ID"
              className="w-full p-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={receiverAccountId}
              onChange={(e) => setReceiverAccountId(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="transferAmount" className="block text-sm font-medium text-neutral-500 mb-2">
              Amount to Send
            </label>
            <input
              id="transferAmount"
              type="number"
              placeholder="Enter amount"
              className="w-full p-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            className="px-5 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
            onClick={() => {
              const parsedAmount = parseFloat(transferAmount);
              const parsedReceiverId = parseInt(receiverAccountId);

              if (!transferAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
                toast.toast({
                  title: "Invalid amount",
                  description: "Please enter a valid transfer amount",
                  variant: "destructive",
                });
                return;
              }

              if (!receiverAccountId || isNaN(parsedReceiverId)) {
                toast.toast({
                  title: "Invalid ID",
                  description: "Please enter a valid receiver ID",
                  variant: "destructive",
                });
                return;
              }

              setModalType(null);
              setConfirmSendOpen(true);
            }}
          >
            Next
          </button>
        </div>
      </Modal>

      {/* Request Modal */}
      <Modal
        isOpen={modalType === "request"}
        onClose={() => setModalType(null)}
        title="Request Money"
        balance={balance}
      >
        <div className="space-y-4 mb-6">
          <div>
            <label htmlFor="requestReceiverId" className="block text-sm font-medium text-neutral-500 mb-2">
              Account ID to Request From
            </label>
            <input
              id="requestReceiverId"
              type="number"
              placeholder="Enter account ID"
              className="w-full p-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={requestReceiverId}
              onChange={(e) => setRequestReceiverId(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="requestAmount" className="block text-sm font-medium text-neutral-500 mb-2">
              Amount to Request
            </label>
            <input
              id="requestAmount"
              type="number"
              placeholder="Enter amount"
              className="w-full p-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={requestAmount}
              onChange={(e) => setRequestAmount(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            className="px-5 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
            onClick={handleRequestMoney}
          >
            Send Request
          </button>
        </div>
      </Modal>

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={confirmDepositOpen}
        onClose={() => setConfirmDepositOpen(false)}
        onConfirm={handleDeposit}
        title="Confirm Deposit"
      >
        <p className="mb-2">
          You are about to deposit <strong>${parseFloat(depositAmount || "0").toFixed(2)}</strong>.
        </p>
        <p>Please confirm to proceed with this transaction.</p>
      </ConfirmationModal>

      <ConfirmationModal
        isOpen={confirmWithdrawOpen}
        onClose={() => setConfirmWithdrawOpen(false)}
        onConfirm={handleWithdraw}
        title="Confirm Withdrawal"
      >
        <p className="mb-2">
          You are about to withdraw <strong>${parseFloat(withdrawAmount || "0").toFixed(2)}</strong>.
        </p>
        <p>Please confirm to proceed with this transaction.</p>
      </ConfirmationModal>

      <ConfirmationModal
        isOpen={confirmSendOpen}
        onClose={() => setConfirmSendOpen(false)}
        onConfirm={handleTransfer}
        title="Confirm Money Transfer"
      >
        <p className="mb-2">
          You are about to send{" "}
          <strong>${parseFloat(transferAmount || "0").toFixed(2)}</strong> to Account ID{" "}
          <strong>{receiverAccountId}</strong>.
        </p>
        <p>Please confirm to proceed with this transaction.</p>
      </ConfirmationModal>
    </div>
  );
}
