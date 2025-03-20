import React, { useState } from "react";
import { motion } from "framer-motion";

interface SearchBarProps {
    onFilterChange: (type: string, start: string, end: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({onFilterChange}) => {
    const [type, setType] = useState<string>("");
    const [start, setStart] = useState<string>("");
    const [end, setEnd] = useState<string>("");

    const handleSearch = () => {
        onFilterChange(type, start, end);
    }

    const handleReset = () => {
        setType("");
        setStart("");
        setEnd("");
        onFilterChange("", "", "");
    }

  return (
        <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                    <label htmlFor="transaction-type" className="block text-sm font-medium text-neutral-500 mb-2">Transaction Type</label>
                    <select 
                        id="transaction-type"
                        className="w-full p-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                        value={type} 
                        onChange={(e) => setType(e.target.value)}
                    >
                        <option value="">All Types</option>
                        <option value="WITHDRAWAL">Withdrawal</option>
                        <option value="TRANSFER">Transfer</option>
                        <option value="DEPOSIT">Deposit</option>
                        <option value="CANCELED">Canceled</option>
        </select>
                </div>

                <div>
                    <label htmlFor="start-date" className="block text-sm font-medium text-neutral-500 mb-2">Start Date</label>
                    <input 
                        id="start-date"
                        type="date" 
                        className="w-full p-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                        value={start} 
                        onChange={(e) => setStart(e.target.value)}
                    />
                </div>

                <div>
                    <label htmlFor="end-date" className="block text-sm font-medium text-neutral-500 mb-2">End Date</label>
                    <input 
                        id="end-date"
                        type="date" 
                        className="w-full p-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                        value={end} 
                        onChange={(e) => setEnd(e.target.value)}
                    />
                </div>

                <div className="flex flex-col justify-end">
                    <div className="flex space-x-2">
                        <motion.button 
                            className="flex-1 p-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={handleSearch}
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
                                className="mr-2"
                            >
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.35-4.35" />
                            </svg>
          Search
                        </motion.button>
                        
                        <motion.button 
                            className="p-3 border border-neutral-200 text-neutral-600 rounded-lg hover:bg-neutral-50 transition-colors flex items-center justify-center"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={handleReset}
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
                                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                <path d="M3 3v5h5" />
                            </svg>
                        </motion.button>
                    </div>
                </div>
      </div>
    </div>
  );
};

export default SearchBar;
