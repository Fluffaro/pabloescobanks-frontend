"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { User } from "../transaction/page";
import Header from "../components/Header";
import ConfirmationModal from "../components/ConfirmationModal";

const API_BASE_URL = "http://localhost:8080/api"; // Change this if needed

const MotionButton: React.FC<{ children: React.ReactNode; onClick?: () => void }> = ({ children, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    className="bg-black text-white px-4 py-2 rounded-md mx-2 transition-all"
    onClick={onClick}
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
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white p-6 rounded-lg shadow-lg w-96 relative"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
          >
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={onClose}>
              ✖
            </button>
            <h2 className="text-xl font-bold text-center mb-4">{title}</h2>
            <div className="bg-gray-100 p-4 rounded-md text-center mb-4">
              <p className="text-gray-600">Current Balance:</p>
              <h2 className="text-2xl font-bold text-green-600">{balance}</h2>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function Dashboard() {
  const router = useRouter();
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  // Extend modalType union to include "request"
  const [modalType, setModalType] = useState<"withdraw" | "send" | "deposit" | "request" | null>(null);

  // Existing confirmation modals
  const [confirmDepositOpen, setConfirmDepositOpen] = useState(false);
  const [confirmWithdrawOpen, setConfirmWithdrawOpen] = useState(false);
  const [confirmSendOpen, setConfirmSendOpen] = useState(false);

  const [balance, setBalance] = useState<string>("₱0.00");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [error, setError] = useState<string>("");
  const [user, setUser] = useState<User>();

  // For deposit, withdraw, send form inputs
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [transferAmount, setTransferAmount] = useState<string>("");
  const [receiverAccountId, setReceiverAccountId] = useState<string>("");

  // NEW: For Request Money inputs
  const [requestReceiverId, setRequestReceiverId] = useState<string>("");
  const [requestAmount, setRequestAmount] = useState<string>("");

  // Sorting state
  const [sortColumn, setSortColumn] = useState<"date" | "type" | "receiver" | "amount">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 5;

  // ---------------------------------------------------------------
  // Fetch user
  async function fetchUser() {


    try {
      const userRes = await fetch(`http://localhost:8080/api/users/${userId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!userRes.ok) throw new Error("Failed to fetch user");
      const userData = await userRes.json();
      setUser(userData);
    } catch (error: any) {
      console.error(error);
      setError(error.message);
    }
  }

  // ---------------------------------------------------------------
  // Sort function
  const handleSort = (column: "date" | "type" | "receiver" | "amount") => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // ---------------------------------------------------------------
  // Fetch account details
  const fetchAccountDetails = async () => {

    try {
      const response = await fetch(`${API_BASE_URL}/accounts/user/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch account details");
      const data = await response.json();
      setBalance(`₱${data.balance.toFixed(2)}`);
    } catch (error) {
      console.error("Error fetching account details:", error);
    }
  };

  // ---------------------------------------------------------------
  // Fetch transaction history
  const fetchTransactions = async () => {

    try {
      const response = await fetch(`${API_BASE_URL}/transactions/user/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch transactions");
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error("⚠️ Error fetching transactions:", error);
    }
  };

  // ---------------------------------------------------------------
  // useEffect: run on mount
  useEffect(() => {
    fetchAccountDetails();
    fetchTransactions();
    fetchUser();
  }, []);

  // ---------------------------------------------------------------
  // The actual deposit API call
  const handleDeposit = async () => {

    const parsedAmount = parseFloat(depositAmount);
    if (!depositAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
      console.error("Invalid deposit amount:", depositAmount);
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
      if (!response.ok) throw new Error("Deposit failed");

      setConfirmDepositOpen(false);
      setDepositAmount("");

      // refresh
      await fetchAccountDetails();
      await fetchTransactions();
    } catch (error) {
      console.error("Deposit failed:", error);
    }
  };

  // ---------------------------------------------------------------
  // The actual withdrawal API call
  const handleWithdraw = async () => {

    const parsedAmount = parseFloat(withdrawAmount);
    if (!withdrawAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
      console.error("Invalid withdrawal amount:", withdrawAmount);
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
        router.push("../error/500");
      }
      setConfirmWithdrawOpen(false);
      setWithdrawAmount("");

      await fetchAccountDetails();
      await fetchTransactions();
    } catch (error) {
      console.error("Withdrawal failed:", error);
    }
  };

  // ---------------------------------------------------------------
  // The actual transfer API call
  const handleTransfer = async () => {
    const parsedAmount = parseFloat(transferAmount);
    const parsedReceiverId = parseInt(receiverAccountId);
    if (!transferAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
      console.error("Invalid transfer amount:", transferAmount);
      return;
    }
    if (!receiverAccountId || isNaN(parsedReceiverId)) {
      console.error("Invalid receiver ID:", receiverAccountId);
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
        router.push("../error/401");
      }
      setConfirmSendOpen(false);
      setTransferAmount("");
      setReceiverAccountId("");

      await fetchAccountDetails();
      await fetchTransactions();
    } catch (error) {
      console.error("Transfer failed:", error);
    }
  };

  // ---------------------------------------------------------------
  // The actual request API call for creating a money request
  const handleRequestMoney = async () => {
    const parsedAmount = parseFloat(requestAmount);
    const parsedReceiverId = parseInt(requestReceiverId);
    if (!requestAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
      console.error("Invalid request amount:", requestAmount);
      return;
    }
    if (!requestReceiverId || isNaN(parsedReceiverId)) {
      console.error("Invalid receiver ID:", requestReceiverId);
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
      if (!response.ok) throw new Error("Failed to create money request");
      // Optionally, you could update a requests state or display a success message.
      setModalType(null);
      setRequestReceiverId("");
      setRequestAmount("");
    } catch (error) {
      console.error("Money request creation failed:", error);
    }
  };

  // ---------------------------------------------------------------
  // Sorting + Pagination
  const totalPages = Math.ceil(transactions.length / transactionsPerPage);
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;

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

  const currentTransactions = sortedTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // ---------------------------------------------------------------
  return (
    <div className="bg-white min-h-screen text-black">
      {/* Header Section */}
      <Header user={user} />

      <h1 className="text-2xl font-bold text-center text-blue-900 mb-4 mt-5">Pablo EscoHUB</h1>
      <div className="flex justify-center gap-6">
        <motion.div 
          className="bg-white w-110 h-30 p-6 rounded-lg shadow-md text-center border border-gray-300 flex flex-col justify-center" 
          whileHover={{ scale: 1.05 }}
        >
          <p className="text-lg text-gray-600 font-medium">Available Balance:</p>
          <h2 className="text-3xl text-black">{balance}</h2>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center mt-6">
        <MotionButton onClick={() => setModalType("send")}>Send Money</MotionButton>
        <MotionButton onClick={() => setModalType("withdraw")}>Withdraw Money</MotionButton>
        <MotionButton onClick={() => setModalType("deposit")}>Deposit Money</MotionButton>
        <MotionButton onClick={() => setModalType("request")}>Request Money</MotionButton>
      </div>

      <h2 className="text-xl font-bold text-center mt-10">Transaction History:</h2>
      <div className="w-max-vh m-10">
        <table className="w-full mt-4 border-collapse border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-200 max-w-50 min-w-50">
              <th className="border cursor-pointer" onClick={() => handleSort("date")}>
                Date {sortColumn === "date" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
              </th>
              <th className="border cursor-pointer" onClick={() => handleSort("type")}>
                Transaction {sortColumn === "type" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
              </th>
              <th className="border cursor-pointer" onClick={() => handleSort("receiver")}>
                Receiver {sortColumn === "receiver" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
              </th>
              <th className="border cursor-pointer" onClick={() => handleSort("amount")}>
                Amount {sortColumn === "amount" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
              </th>
            </tr>
          </thead>
          <tbody>
            {currentTransactions.map((tx, index) => (
              <tr key={index} className="text-center hover:bg-gray-100">
                <td className="border p-5">{new Date(tx.date).toLocaleDateString()}</td>
                <td className="border p-2">{tx.type || "N/A"}</td>
                <td className="border p-2">{tx.receiverAccount ? `To Account ID: ${tx.receiverAccount.aId}` : "N/A"}</td>
                <td className="border p-2">₱{tx.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center mt-4 space-x-4">
        <MotionButton onClick={goToPrevPage} disabled={currentPage === 1}>
          ◄
        </MotionButton>
        <span className="font-bold">
          Page {currentPage} of {totalPages}
        </span>
        <MotionButton onClick={goToNextPage} disabled={currentPage === totalPages}>
          ►
        </MotionButton>
      </div>

      {/* MODALS */}
      <Modal
        isOpen={modalType === "deposit"}
        onClose={() => setModalType(null)}
        title="Deposit Money"
        balance={balance}
      >
        <input
          type="number"
          placeholder="Amount"
          className="w-full p-2 border rounded mb-3"
          value={depositAmount}
          onChange={(e) => setDepositAmount(e.target.value)}
        />
        <MotionButton
          onClick={() => {
            if (!depositAmount || parseFloat(depositAmount) <= 0) {
              console.error("Invalid deposit amount:", depositAmount);
              return;
            }
            setModalType(null);
            setConfirmDepositOpen(true);
          }}
        >
          Next
        </MotionButton>
      </Modal>

      <Modal
        isOpen={modalType === "withdraw"}
        onClose={() => setModalType(null)}
        title="Withdraw Money"
        balance={balance}
      >
        <input
          type="number"
          placeholder="Amount"
          className="w-full p-2 border rounded mb-3"
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(e.target.value)}
        />
        <MotionButton
          onClick={() => {
            if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
              console.error("Invalid withdrawal amount:", withdrawAmount);
              return;
            }
            setModalType(null);
            setConfirmWithdrawOpen(true);
          }}
        >
          Next
        </MotionButton>
      </Modal>

      <Modal
        isOpen={modalType === "send"}
        onClose={() => setModalType(null)}
        title="Send Money"
        balance={balance}
      >
        <input
          type="number"
          placeholder="Receiver ID"
          className="w-full p-2 border rounded mb-3"
          value={receiverAccountId}
          onChange={(e) => setReceiverAccountId(e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount"
          className="w-full p-2 border rounded mb-3"
          value={transferAmount}
          onChange={(e) => setTransferAmount(e.target.value)}
        />
        <MotionButton
          onClick={() => {
            const parsedAmount = parseFloat(transferAmount);
            const parsedReceiverId = parseInt(receiverAccountId);
            if (!transferAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
              console.error("Invalid transfer amount:", transferAmount);
              return;
            }
            if (!receiverAccountId || isNaN(parsedReceiverId)) {
              console.error("Invalid receiver ID:", receiverAccountId);
              return;
            }
            setModalType(null);
            setConfirmSendOpen(true);
          }}
        >
          Next
        </MotionButton>
      </Modal>

      {/* New Request Money Modal */}
      <Modal
        isOpen={modalType === "request"}
        onClose={() => setModalType(null)}
        title="Request Money"
        balance={balance}
      >
        <input
          type="number"
          placeholder="Receiver ID"
          className="w-full p-2 border rounded mb-3"
          value={requestReceiverId}
          onChange={(e) => setRequestReceiverId(e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount"
          className="w-full p-2 border rounded mb-3"
          value={requestAmount}
          onChange={(e) => setRequestAmount(e.target.value)}
        />
        <MotionButton onClick={handleRequestMoney}>
          Next
        </MotionButton>
      </Modal>

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={confirmDepositOpen}
        onClose={() => setConfirmDepositOpen(false)}
        onConfirm={handleDeposit}
        title="Confirm Deposit"
      >
        <p>You are about to deposit <strong>₱{depositAmount}</strong>.</p>
        <p>Are you sure you want to proceed?</p>
      </ConfirmationModal>

      <ConfirmationModal
        isOpen={confirmWithdrawOpen}
        onClose={() => setConfirmWithdrawOpen(false)}
        onConfirm={handleWithdraw}
        title="Confirm Withdrawal"
      >
        <p>You are about to withdraw <strong>₱{withdrawAmount}</strong>.</p>
        <p>Are you sure you want to proceed?</p>
      </ConfirmationModal>

      <ConfirmationModal
        isOpen={confirmSendOpen}
        onClose={() => setConfirmSendOpen(false)}
        onConfirm={handleTransfer}
        title="Confirm Transfer"
      >
        <p>
          Sending <strong>₱{transferAmount}</strong> to Account ID{" "}
          <strong>{receiverAccountId}</strong>.
        </p>
        <p>Are you sure you want to proceed?</p>
      </ConfirmationModal>
    </div>
  );
}
