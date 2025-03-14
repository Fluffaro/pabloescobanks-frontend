"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { User } from "../transaction/page";
import Header from "../components/Header";

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

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; balance: string; children: React.ReactNode }> = ({
  isOpen,
  onClose,
  title,
  balance,
  children,
}) => {
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
  const userId = localStorage.getItem("userId"); // 🔹 Example User ID (Replace with actual user authentication)
  const token = localStorage.getItem("token");

  const [modalType, setModalType] = useState<"withdraw" | "send" | "deposit" | null>(null);
  const [balance, setBalance] = useState<string>("₱0.00");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [error, setError] = useState<string>(""); // ✅ Add error handling
  const [user, setUser] = useState<User>();
  // ✅ Define separate state variables
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [transferAmount, setTransferAmount] = useState<string>("");
  const [receiverAccountId, setReceiverAccountId] = useState<string>("");

  // -------------------------------------------------------------------------
  // ✅ SORTING STATE (added without removing any lines)
  const [sortColumn, setSortColumn] = useState<"date" | "type" | "receiver" | "amount">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  async function fetchUser() {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    try {
      const userRes = await fetch(`http://localhost:8080/api/users/${userId}`, {
        headers: {
          'Content-Type' : 'application/json',
          Authorization: `Bearer ${token}`
        }
      })

      if (!userRes.ok)  throw new Error("Failed to fetch user");
      const userData = await userRes.json();
      setUser(userData);
    } catch (error: any) {
      console.error(error);
      setError(error.message);
    }
  }

  // This function toggles sort column & direction
  const handleSort = (column: "date" | "type" | "receiver" | "amount") => {
    if (sortColumn === column) {
      // If we're already sorting by the same column, toggle direction
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      // Otherwise, set the new column and default to ascending
      setSortColumn(column);
      setSortDirection("asc");
    }
  };
  // -------------------------------------------------------------------------

  // ✅ Existing Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 5;
  const totalPages = Math.ceil(transactions.length / transactionsPerPage);
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;



  const reloadPage = () => {
    window.location.reload();
};


  // -------------------------------------------------------------------------
  // ✅ SORT THE TRANSACTIONS BEFORE PAGINATION
  // We create a sorted copy of 'transactions' based on 'sortColumn' & 'sortDirection'
  const sortedTransactions = [...transactions].sort((a, b) => {
    // sort by date
    if (sortColumn === "date") {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    }

    // sort by transaction type (string compare)
    if (sortColumn === "type") {
      const typeA = a.type?.toLowerCase() || "";
      const typeB = b.type?.toLowerCase() || "";
      if (typeA < typeB) return sortDirection === "asc" ? -1 : 1;
      if (typeA > typeB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    }

    // sort by receiver (account ID) – if missing, treat as 0
    if (sortColumn === "receiver") {
      const recvA = a.receiverAccount?.aId || 0;
      const recvB = b.receiverAccount?.aId || 0;
      return sortDirection === "asc" ? recvA - recvB : recvB - recvA;
    }

    // sort by amount (numeric compare)
    if (sortColumn === "amount") {
      const amtA = a.amount || 0;
      const amtB = b.amount || 0;
      return sortDirection === "asc" ? amtA - amtB : amtB - amtA;
    }

    return 0; // fallback (shouldn't happen)
  });

  // Now apply pagination to the sorted results
  const currentTransactions = sortedTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  // -------------------------------------------------------------------------

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // ✅ Remove formData OR only use it for transfer
  const [formData, setFormData] = useState({ amount: "", receiverId: "" });



  // 🔹 Fetch account details
  const fetchAccountDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/user/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // ✅ Include JWT token
        },
      });

      if (!response.ok) throw new Error("Failed to fetch account details");

      const data = await response.json();
      setBalance(`₱${data.balance.toFixed(2)}`);
    } catch (error) {
      console.error("Error fetching account details:", error);
    }
  };

  // 🔹 Fetch transaction history
  const fetchTransactions = async () => {
    console.log("Fetch Transaction: ", userId);
    try {
      const response = await fetch(`${API_BASE_URL}/transactions/user/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
  
      if (!response.ok) throw new Error("Failed to fetch transactions");
  
      const data = await response.json();
      console.log("🔍 Transaction API Response:", JSON.stringify(data, null, 2)); // ✅ Logs API data clearly
      setTransactions(data);
    } catch (error) {
      console.error("⚠️ Error fetching transactions:", error);
    }
  };
  


  useEffect(() => {
    fetchAccountDetails();
    fetchTransactions();
    fetchUser();
    return () => {
    };
  }, []);
  // 🔹 Handle Deposits
  const handleDeposit = async () => {
    const parsedAmount = parseFloat(depositAmount);
  
    if (!depositAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
      console.error("Invalid deposit amount:", depositAmount);
      return;
    }
  
    console.log(`Sending deposit request: userId=${userId}, amount=${parsedAmount}`);
  
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/deposit/${userId}?amount=${parsedAmount}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
  
      if (!response.ok) throw new Error("Deposit failed");
  
      setModalType(null);
      setDepositAmount("");
  
      // ✅ Fetch latest balance and transactions instead of full page reload
      await fetchAccountDetails();
      await fetchTransactions();
    } catch (error) {
      console.error("Deposit failed:", error);
    }
  };
  
  
  
  // 🔹 Handle Withdrawals
  const handleWithdraw = async () => {
    const parsedAmount = parseFloat(withdrawAmount);
  
    if (!withdrawAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
      console.error("Invalid withdrawal amount:", withdrawAmount);
      return;
    }
  
    console.log(`Sending withdrawal request: userId=${userId}, amount=${parsedAmount}`);
  
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/withdraw/${userId}?amount=${parsedAmount}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        }
      });
  
      if (!response.ok){
          router.push("../error/500");

      }
      setModalType(null);
      setWithdrawAmount("");
  
      // ✅ Fetch latest balance and transactions instead of full page reload
      await fetchAccountDetails();
      await fetchTransactions();
    } catch (error) {
      console.error("Withdrawal failed:", error);
    }
  };
  

  // 🔹 Handle Money Transfers
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
  
    console.log(`Sending transfer request: senderId=${userId}, receiverAccountId=${parsedReceiverId}, amount=${parsedAmount}`);
  
    try {
      const response = await fetch(`${API_BASE_URL}/transactions/transfer?senderId=${userId}&receiverAccountId=${parsedReceiverId}&amount=${parsedAmount}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok){
          router.push("../error/401");
      }
  
      setModalType(null);
      setTransferAmount("");
      setReceiverAccountId("");
  
      // ✅ Fetch latest balance and transactions instead of full page reload
      await fetchAccountDetails();
      await fetchTransactions();
    } catch (error) {
      console.error("Transfer failed:", error);
    }
  };
  
  console.log(userId);
  
  
  

  return (
    <div className="">
      
        {/* Header Section */}
    <Header user={user} />

      <h1 className="text-2xl font-bold text-center text-blue-900 mb-4">Pablo EscoHUB</h1>
      <div className="flex justify-center gap-6">
  <motion.div 
    className="bg-white w-110 h-30 p-6 rounded-lg shadow-md text-center border border-gray-300 flex flex-col justify-center" 
    whileHover={{ scale: 1.05 }}
  >
    <p className="text-lg text-gray-600 font-medium">Available Balance:</p>
    <h2 className="text-3xl text-black">{balance}</h2>
  </motion.div>
</div>


      <div className="flex justify-center mt-6">
        <MotionButton onClick={() => setModalType("send")}>Send Money</MotionButton>
        <MotionButton onClick={() => setModalType("withdraw")}>Withdraw Money</MotionButton>
        <MotionButton onClick={() => setModalType("deposit")}>Deposit Money</MotionButton>
      </div>

      <h2 className="text-xl font-bold text-center mt-10">Transaction History:</h2>
      <div className="overflow-x-auto max-w-7xl m-10">
        <table className="w-full mt-4 border-collapse border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-200">
              {/* 🟩 Clickable table headers for sorting */}
              <th 
                className="border p-2 cursor-pointer" 
                onClick={() => handleSort("date")}
              >
                Date {sortColumn === "date" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
              </th>
              <th 
                className="border p-2 cursor-pointer" 
                onClick={() => handleSort("type")}
              >
                Transaction {sortColumn === "type" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
              </th>
              <th 
                className="border p-2 cursor-pointer" 
                onClick={() => handleSort("receiver")}
              >
                Receiver {sortColumn === "receiver" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
              </th>
              <th 
                className="border p-2 cursor-pointer" 
                onClick={() => handleSort("amount")}
              >
                Amount {sortColumn === "amount" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
              </th>
            </tr>
          </thead>
          <tbody>
            {/* ✅ We display currentTransactions (sorted + paginated) */}
            {currentTransactions.map((tx, index) => (
              <tr key={index} className="text-center hover:bg-gray-100">
                <td className="border p-5">{new Date(tx.date).toLocaleDateString()}</td>
                <td className="border p-2">{tx.type || "N/A"}</td>
                <td className="border p-2">
                  {tx.receiverAccount ? `To Account ID:  ${tx.receiverAccount.aId}` : "N/A"} 
                </td> 
                <td className="border p-2">₱{tx.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ PAGINATION CONTROLS */}
      <div className="flex justify-center mt-4 space-x-4">
      <MotionButton 
          onClick={goToPrevPage} 
          disabled={currentPage === 1} 
          className={`px-4 py-2 rounded-md ${
            currentPage === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 text-white"
          }`}
        >
          ◄
        </MotionButton>

        <span className="font-bold">Page {currentPage} of {totalPages}</span>

        <MotionButton 
          onClick={goToNextPage} 
          disabled={currentPage === totalPages} 
          className={`px-4 py-2 rounded-md ${
            currentPage === totalPages ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 text-white"
          }`}
        >
          ►
        </MotionButton>
      </div>

      {/* -- NO LINES REMOVED BELOW THIS POINT -- */}
      <Modal isOpen={modalType === "deposit"} onClose={() => setModalType(null)} title="Deposit Money" balance={balance}>
        <input
          type="number"
          placeholder="Amount"
          className="w-full p-2 border rounded mb-3"
          value={depositAmount}
          onChange={(e) => setDepositAmount(e.target.value)} // ✅ FIX: Update depositAmount directly
        />
        <MotionButton onClick={handleDeposit}>Deposit</MotionButton>
      </Modal>

      <Modal isOpen={modalType === "withdraw"} onClose={() => setModalType(null)} title="Withdraw Money" balance={balance}>
        <input
          type="number"
          placeholder="Amount"
          className="w-full p-2 border rounded mb-3"
          value={withdrawAmount} // ✅ Bind value
          onChange={(e) => setWithdrawAmount(e.target.value)} // ✅ Correctly update withdrawAmount
        />
        <MotionButton onClick={handleWithdraw}>Withdraw</MotionButton>
      </Modal>

      {/* Send Money Modal - ✅ Added this */}
      <Modal isOpen={modalType === "send"} onClose={() => setModalType(null)} title="Send Money" balance={balance}>
        <input
          type="number"
          placeholder="Receiver ID"
          className="w-full p-2 border rounded mb-3"
          value={receiverAccountId} // ✅ Bind value
          onChange={(e) => setReceiverAccountId(e.target.value)} // ✅ Correctly update receiver ID
        />
        <input
          type="number"
          placeholder="Amount"
          className="w-full p-2 border rounded mb-3"
          value={transferAmount} // ✅ Bind value
          onChange={(e) => setTransferAmount(e.target.value)} // ✅ Correctly update transferAmount
        />
        <MotionButton onClick={handleTransfer}>Send Money</MotionButton>
      </Modal>
    </div>
  );
}
