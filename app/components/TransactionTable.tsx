import React, { useState } from "react";
import { Transactions } from "../transaction/page";
import { motion } from "framer-motion";

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
  
  return (
    <div className="w-full">
      {transactions.length > 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
          <thead>
                <tr className="text-left border-b border-neutral-200 bg-neutral-50">
                  <th className="px-6 py-4 font-medium text-neutral-500 text-sm">Amount</th>
                  <th className="px-6 py-4 font-medium text-neutral-500 text-sm">Date</th>
                  <th className="px-6 py-4 font-medium text-neutral-500 text-sm">Type</th>
                  <th className="px-6 py-4 font-medium text-neutral-500 text-sm">Receiving Account</th>
                  <th className="px-6 py-4 font-medium text-neutral-500 text-sm">Sending Account</th>
            </tr>
          </thead>

          <tbody>
            {currentTransactions.map((transaction) => (
              <tr
                    key={transaction.tid}
                    className="border-b border-neutral-100 last:border-none hover:bg-neutral-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium">
                      <span
                        className={
                          transaction.type === "WITHDRAWAL" || transaction.type === "TRANSFER"
                            ? "text-red-600"
                            : transaction.type === "DEPOSIT" 
                              ? "text-green-600" 
                              : transaction.type === "CANCELED"
                                ? "text-gray-400"
                                : "text-neutral-600"
                        }
                      >
                        {transaction.type === "WITHDRAWAL" || transaction.type === "TRANSFER"
                          ? "-" 
                          : transaction.type === "DEPOSIT" 
                            ? "+" 
                            : transaction.type === "CANCELED"
                              ? "±"
                              : ""}
                        ₱{formatAmount(transaction.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-neutral-600">
                      {new Date(transaction.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            transaction.type === "DEPOSIT"
                              ? "bg-green-100 text-green-600"
                              : transaction.type === "WITHDRAWAL"
                              ? "bg-red-100 text-red-600"
                              : transaction.type === "TRANSFER"
                              ? "bg-red-100 text-red-600"
                              : transaction.type === "CANCELED"
                              ? "bg-gray-100 text-gray-500"
                              : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {transaction.type === "DEPOSIT" ? (
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
                          ) : transaction.type === "WITHDRAWAL" || transaction.type === "TRANSFER" ? (
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
                          ) : transaction.type === "CANCELED" ? (
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
                              <path d="M18 6 6 18"></path>
                              <path d="m6 6 12 12"></path>
                            </svg>
                          ) : (
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
                        <span className="font-medium text-[#1d1d1f]">
                          {transaction.type}
                        </span>
                      </div>
                </td>
                    <td className="px-6 py-4 text-neutral-600">{transaction.receiverAccount?.aId ?? "—"}</td>
                    <td className="px-6 py-4 text-neutral-600">{transaction.sendingAccount?.aId ?? "—"}</td>
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
                {Math.min(currentPage * itemsPerPage, transactions.length)} of {transactions.length}
              </span>
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePageChange(currentPage - 1)}
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
                </motion.button>

                <div className="bg-neutral-100 rounded px-3 flex items-center text-sm font-medium">
                  {currentPage} / {totalPages}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePageChange(currentPage + 1)}
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
                </motion.button>
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
          <h3 className="text-lg font-medium text-[#1d1d1f] mb-1">No transactions found</h3>
          <p className="text-neutral-500">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
};

export default Table;
