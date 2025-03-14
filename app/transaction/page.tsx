"use client";
import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import Table from "../components/TransactionTable";

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

const page = () => {
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
      })

      if (!userRes.ok)  throw new Error("Failed to fetch user");
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
    <div className="bg-white flex flex-col h-full min-h-screen w-full min-w-screen">
      {/* Header of the page = to be adjusted*/}

      {loading ? (
        <div className="flex flex-col justify-center items-center my-8 min-h-screen">
            <img src="/pablologo.png" alt="Loading logo" className="animate-spin w-40 h-40 mb-4"/>
            <span className="ml-4 text-lg text-gray-500">Loading Transactions...</span>
        </div>
      ) : error ? (
        <div className="text-center text-red-500">
          <p>Error: {error}</p>
        </div>
      ) : (
        <div>
   
          <Header user={user}/>
          {/*  Filters and Search => Search by date range filter by type  */}
          <SearchBar onFilterChange={handleFilterChange} />
          {/* Table of transaction made by the user */}
          <Table transactions={filteredTransactions} />{" "}
        </div>
      )}
    </div>
  );
};

export default page;
