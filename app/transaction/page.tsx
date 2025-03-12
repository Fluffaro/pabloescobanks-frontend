    "use client"
    import React, { useEffect, useState } from 'react'
    import Header from '../components/Header'
    import SearchBar from '../components/SearchBar'
    import Table from '../components/TransactionTable'

    export interface Transactions {
        tid: number,
        amount: number,
        date: Date,
        type: String,
        receiver_acc: number,
        sending_acc: number
    }

    const page = () => {
        const [transactions, setTransactions] = useState<Transactions[]>([]);
        const [error, setError] =  useState('');




        useEffect(() => {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');
            async function fetchTransaction() {
                try {
                    const transactionRes = await fetch(`http://localhost:8080/api/transactions/user/${userId}`, {
                    headers: {
                        "Content-Type":"application/json",
                        "Authorization": `Bearer ${token}`
                    }
                });
                if (!transactionRes.ok) throw new Error("Failed to fetch transactions");
                const transactionData = await transactionRes.json();
                setTransactions(transactionData);
                } catch (error: any) {
                console.error(error);
                setError(error.message);
            }
            }
            fetchTransaction();
        }, []);

    return (
        <div className='bg-white flex flex-col h-full min-h-screen w-full min-w-screen'>
            
            {/* Header of the page = to be adjusted*/}
            <Header />


            {/*  Filters and Search => Search by date range filter by type  */}
            <SearchBar />

            {/* Table of transaction made by the user */}
            <Table transactions={transactions} />
        </div>
    )
    }

    export default page