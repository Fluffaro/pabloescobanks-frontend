import React, { useState } from "react";
import { Transactions } from "../transaction/page";

const Table = ({ transactions }: { transactions: Transactions[] }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(transactions.length / itemsPerPage);

  const currentTransactions = transactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const formatAmount = (amount: number) => {
    return amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return; // Ensure page is within valid range
    setCurrentPage(page);
  };
  console.log("Transaction Table: ", transactions)
  return (
    <div className="overflow-x-auto mx-30 justify-center ">
      <h2 className="text-2xl font-semibold mb-4 text-black text-center">
        Account Transaction History
      </h2>

      {transactions && (
        <table className="min-w-full table-auto text-black border-collapse">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-2 text-left">Transaction ID</th>
              <th className="px-4 py-2 text-left">Amount</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Receiving Account</th>
              <th className="px-4 py-2 text-left">Sending Account</th>
            </tr>
          </thead>

          <tbody>
            {currentTransactions.map((transaction) => (
              <tr
                key={transaction.tid}
                className="hover:bg-gray-200 border-b transition-colors duration-300"
              >
                <td className="px-4 py-2">{transaction.tid}</td>
                <td className="px-4 py-2">
                  Php {formatAmount(transaction.amount)}
                </td>
                <td className="px-4 py-2">
                  {new Date(transaction.date).toLocaleDateString()}
                </td>
                <td className="px-4 py-2">{transaction.type}</td>
                <td className="px-4 py-2">{transaction.receiverAccount.aid}</td>
                <td className="px-4 py-2">{transaction.sendingAccount.aid}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="flex justify-center mt-5">
        <button onClick={() => handlePageChange(currentPage-1)} disabled={currentPage==1}  className="px-4 py-2 mx-2 bg-gray-300 text-black rounded-lg disabled:bg-gray-400">
            Previous
        </button>
        <span className="px-4 py-2 text-black">{`Page ${currentPage} of ${totalPages}` }</span>
        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage==totalPages} className="px-4 py-2 mx-2 bg-gray-300 text-black rounded-lg disabled:bg-gray-400">
            Next
        </button>
      </div>
    </div>
  );
};

export default Table;
