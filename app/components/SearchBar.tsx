import React from 'react'

const SearchBar = () => {
  return (
    <div className='flex flex-col items-center text-black p-5'>
        <div className='text-xl mb-4'>List of Transactions</div>
        <div className='flex space-x-4 mb-4 items-center'>
            <select className='p-2 border rounded'>
                <option value="">Select Transaction Type</option>
                <option value="withdraw">Withdraw</option>
                <option value="transfer">Transfer</option>
                <option value="deposit">Deposit</option>

            </select>

            <label>From: </label>
            <input type='date' className='p-2 border rounded'/>
            <label>To: </label>
            <input type='date' className='p-2 border rounded'/>
        </div>
        <button className='px-6 py-2 bg-black text-white rounded '>
            Search
        </button>
    </div>
  )
}

export default SearchBar