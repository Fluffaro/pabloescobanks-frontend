import React, { useState } from "react";

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
  return (
    <div className="flex flex-col items-center text-black p-5">
      <div className="flex space-x-4 mb-4 items-center">
        <select className="p-2 border rounded" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">Select Transaction Type</option>
          <option value="withdraw">Withdraw</option>
          <option value="transfer">Transfer</option>
          <option value="deposit">Deposit</option>
        </select>

        <label>From: </label>
        <input type="date" className="p-2 border rounded" value={start} onChange={(e) => setStart(e.target.value)} />
        <label>To: </label>
        <input type="date" className="p-2 border rounded" value={end} onChange={(e) => setEnd(e.target.value)}/>
        <button className="px-6 py-2 bg-black text-white rounded" onClick={handleSearch}>
          Search
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
