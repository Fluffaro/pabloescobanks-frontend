"use client";
import React, { useState, useEffect } from 'react';

const DashboardPage = () => {
  const [balance, setBalance] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [receiverAccountId, setReceiverAccountId] = useState(''); // renamed variable
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  // Fetch account balance and transaction history on mount
  useEffect(() => {
    if (!userId || !token) {
      setError('User is not logged in');
      return;
    }

    const fetchAccountAndTransactions = async () => {
      try {
        const accountRes = await fetch(`http://localhost:8080/api/accounts/user/${userId}`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
        if (!accountRes.ok) throw new Error("Failed to fetch account information");
        const accountData = await accountRes.json();
        setBalance(accountData.balance);

        const txRes = await fetch(`http://localhost:8080/api/transactions/user/${userId}`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
        if (!txRes.ok) throw new Error("Failed to fetch transactions");
        const txData = await txRes.json();
        setTransactions(txData);
      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    };

    fetchAccountAndTransactions();
  }, [userId, token]);

  // Deposit funds
  const handleDeposit = async () => {
    if (!depositAmount) return;
    try {
      const response = await fetch(
        `http://localhost:8080/api/accounts/deposit/${userId}?amount=${depositAmount}`,
        {
          method: 'PUT',
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        }
      );
      if (!response.ok) throw new Error("Deposit failed");
      const data = await response.json();
      setBalance(data.balance);
      setDepositAmount('');
    } catch (err) {
      setError(err.message);
    }
  };

  // Withdraw funds
  const handleWithdraw = async () => {
    if (!withdrawAmount) return;
    try {
      const response = await fetch(
        `http://localhost:8080/api/accounts/withdraw/${userId}?amount=${withdrawAmount}`,
        {
          method: 'PUT',
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        }
      );
      if (!response.ok) throw new Error("Withdrawal failed");
      const data = await response.json();
      setBalance(data.balance);
      setWithdrawAmount('');
    } catch (err) {
      setError(err.message);
    }
  };

  // Transfer funds using the recipient's account ID
  const handleTransfer = async () => {
    if (!transferAmount || !receiverAccountId) return;
    try {
      const response = await fetch(
        `http://localhost:8080/api/transactions/transfer?senderId=${userId}&receiverAccountId=${receiverAccountId}&amount=${transferAmount}`,
        {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        }
      );
      if (!response.ok) throw new Error("Transfer failed");
      await response.json(); // consume response

      // Refresh balance and transactions after transfer
      const accountRes = await fetch(`http://localhost:8080/api/accounts/user/${userId}`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const accountData = await accountRes.json();
      setBalance(accountData.balance);

      const txRes = await fetch(`http://localhost:8080/api/transactions/user/${userId}`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const txData = await txRes.json();
      setTransactions(txData);

      setTransferAmount('');
      setReceiverAccountId('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1>Dashboard</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <section>
        <h2>Current Balance: ${balance}</h2>
      </section>
      <section>
        <h3>Deposit</h3>
        <input
          type="number"
          value={depositAmount}
          onChange={(e) => setDepositAmount(e.target.value)}
          placeholder="Amount"
        />
        <button onClick={handleDeposit}>Deposit</button>
      </section>
      <section>
        <h3>Withdraw</h3>
        <input
          type="number"
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(e.target.value)}
          placeholder="Amount"
        />
        <button onClick={handleWithdraw}>Withdraw</button>
      </section>
      <section>
        <h3>Transfer Funds</h3>
        <input
          type="number"
          value={receiverAccountId}
          onChange={(e) => setReceiverAccountId(e.target.value)}
          placeholder="Receiver Account ID"  // updated placeholder
        />
        <input
          type="number"
          value={transferAmount}
          onChange={(e) => setTransferAmount(e.target.value)}
          placeholder="Amount"
        />
        <button onClick={handleTransfer}>Transfer</button>
      </section>
      <section>
        <h3>Transaction History</h3>
        {transactions && transactions.length > 0 ? (
          <ul>
            {transactions.map((tx, index) => (
              <li key={index}>
                <strong>{new Date(tx.date).toLocaleDateString()}</strong> - {tx.type} of ${tx.amount}
                {tx.sendingAccount && ` from Account ${tx.sendingAccount.aId}`}
                {tx.receiverAccount && ` to Account ${tx.receiverAccount.aId}`}
              </li>
            ))}
          </ul>
        ) : (
          <p>No transactions found</p>
        )}
      </section>
    </div>
  );
};

export default DashboardPage;
