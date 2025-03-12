import React from 'react'
import { Transactions } from '../transaction/page'

const Table = ({transactions} : {transactions: Transactions[]}) => {
  return (
    <div className='overflow-x-auto mx-30 justify-center '>
        <h2 className='text-2xl font-semibold mb-4 text-black text-center'>Account Transaction History</h2>
        {transactions && <table className='min-w-full table-auto text-black border-collapse'>
            <thead>
                <tr className='border-b'>
                    <th className='px-4 py-2 text-left'>Transaction ID</th>
                    <th className='px-4 py-2 text-left'>Amount</th>
                    <th className='px-4 py-2 text-left'>Date</th>
                    <th className='px-4 py-2 text-left'>Type</th>
                    <th className='px-4 py-2 text-left'>Receiving Account</th>
                    <th className='px-4 py-2 text-left'>Sending Account</th>
                </tr>
            </thead>

            <tbody>
                {transactions.map( (transaction) => (
                    <tr key={transaction.tid} className='hover:bg-gray-200 border-b transition-colors duration-300'>
                        <td className="px-4 py-2">{transaction.tid}</td>
                        <td className="px-4 py-2">{transaction.amount}</td>
                        <td className="px-4 py-2">{new Date(transaction.date).toLocaleDateString()}</td>
                        <td className="px-4 py-2">{transaction.type}</td>
                        <td className="px-4 py-2">{transaction.receiver_acc}</td>
                        <td className="px-4 py-2">{transaction.sending_acc}</td>

                    </tr>
                ))}
               
            </tbody>
        </table> }
        

    </div>
  )
}

export default Table