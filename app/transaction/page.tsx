"use client";
import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import Table from "../components/TransactionTable";
import { motion } from "framer-motion";

export interface Transactions {
  tid: number;
  amount: number;
  date: Date;
  type: String;
  receiverAccount: {
    aId: number
  },
  sendingAccount:{
    aId: number
  }
}

export interface User {
  uid: number;
  name: string,
  role: string
  username: string
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

const Page = () => {
  const [transactions, setTransactions] = useState<Transactions[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transactions[]
  >([]);
  const [transactionType, setTransactionType] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User>();
  
  async function fetchUser() {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    try {
      const userRes = await fetch(`http://localhost:8080/api/users/${userId}`, {
        headers: {
          'Content-Type' : 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (!userRes.ok) throw new Error("Failed to fetch user");
      const userData = await userRes.json();
      setUser(userData);
    } catch (error: any) {
      console.error(error);
      setError(error.message);
    }
  }
  
  async function fetchTransaction() {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("UIDparam");
    setLoading(true);
    try {
      const transactionRes = await fetch(
        `http://localhost:8080/api/transactions/user/${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!transactionRes.ok) throw new Error("Failed to fetch transactions");
      const transactionData = await transactionRes.json();
      setTransactions(transactionData);
      setFilteredTransactions(transactionData);
    } catch (error: any) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  const filterTransactions = () => {
    let filtered = [...transactions];

    if (transactionType != "") {
      filtered = filtered.filter(
        (transaction) => transaction.type === transactionType
      );
    }

    if (startDate) {
      filtered = filtered.filter(
        (transaction) => new Date(transaction.date) >= new Date(startDate)
      );
    }

    if (endDate) {
      filtered = filtered.filter(
        (transaction) => new Date(transaction.date) <= new Date(endDate)
      );
    }

    setFilteredTransactions(filtered);
  };

  useEffect(() => {
    fetchTransaction();
    fetchUser();
  }, []);

  function handleFilterChange(type: string, start: string, end: string) {
    setTransactionType(type);
    setStartDate(start);
    setEndDate(end);
  }

  useEffect(() => {
    filterTransactions();
  }, [transactionType, startDate, endDate]);
  
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Header user={user} />

      {loading ? (
        <div className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 mb-4">
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
              <p className="text-neutral-600 font-medium">Loading transactions...</p>
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center text-red-500 mb-4">
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
      ) : (
        <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
          <motion.div 
            className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.03)] overflow-hidden border border-neutral-100 p-6 mb-6"
            variants={fadeIn} 
            initial="hidden" 
            animate="visible"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
              <h1 className="text-2xl font-semibold text-[#1d1d1f]">Transaction History</h1>
              <p className="text-sm text-neutral-500">View and filter your transaction history</p>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.03)] overflow-hidden border border-neutral-100 p-6 mb-10"
            variants={fadeIn} 
            initial="hidden" 
            animate="visible"
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-lg font-medium text-[#1d1d1f] mb-4">Search & Filters</h2>
            <SearchBar onFilterChange={handleFilterChange} />
          </motion.div>

          <motion.section
            variants={slideUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold text-[#1d1d1f]">Transactions</h2>
              <span className="text-sm text-neutral-500">{filteredTransactions.length} transactions found</span>
            </div>

            <Table transactions={filteredTransactions} />
          </motion.section>
        </main>
      )}

      {/* Footer */}
      <footer className="py-6 border-t border-neutral-200 bg-white">
        <div className="container mx-auto px-4 text-center text-neutral-500 text-sm">
          &copy; {new Date().getFullYear()} Pablo EscoBanks. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Page;
