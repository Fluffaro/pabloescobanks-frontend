"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import type { User } from "../transaction/page";
import { Bell } from "lucide-react";
import ConfirmationModal from "../components/ConfirmationModal";

interface HeaderProps {
  user?: User | null;
}

const Header = ({ user }: HeaderProps) => {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  // State to hold dynamic money requests (only pending ones)
  const [moneyRequests, setMoneyRequests] = useState<any[]>([]);
  // State for the selected money request (for Accept confirmation)
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const toggleNotification = () => setIsNotificationOpen(!isNotificationOpen);

  const handleLogout = () => {
    router.push("/");
  };

  // Get token from localStorage
  const token = localStorage.getItem("token");

  // Determine the receiver account ID from the user object or fallback to localStorage.
  // (Make sure you are storing the proper account id. Adjust as needed.)
  const receiverAccId = user?.userId || localStorage.getItem("userId");

  // Poll the backend API for money requests every 5 seconds.
  useEffect(() => {
    console.log("Receiver Account ID:", receiverAccId);
    if (!receiverAccId) return;

    const fetchMoneyRequests = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/requests/receiver/${receiverAccId}`, {
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error("Failed to fetch money requests");
        const data = await res.json();
        // Only set requests that are still "Pending"
        const pendingRequests = data.filter((req: any) => req.status.toLowerCase() === "pending");
        setMoneyRequests(pendingRequests);
      } catch (error) {
        console.error(error);
      }
    };

    fetchMoneyRequests();
    const intervalId = setInterval(fetchMoneyRequests, 5000);
    return () => clearInterval(intervalId);
  }, [receiverAccId, token]);

  // Call the update endpoint to update a request's status.
  // For "cancel", this marks the request as "Canceled" and it will no longer appear.
  const handleRequestAction = async (requestId: number, action: string) => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/requests/update/${requestId}?statusRequest=${action}`,
        {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        }
      );
      if (!res.ok) throw new Error("Failed to update money request");
      // Remove the updated request from the pending list.
      setMoneyRequests(prev => prev.filter(req => req.rid !== requestId));
    } catch (error) {
      console.error("Error updating money request", error);
    }
  };

  // When Accept is clicked, open the confirmation modal.
  const handleAcceptClick = (request: any) => {
    setSelectedRequest(request);
    setShowConfirmModal(true);
  };

  // When confirmation modal is confirmed, call the update endpoint to "confirm" the request.
  const handleConfirmRequest = async () => {
    if (!selectedRequest) return;
    try {
      const res = await fetch(
        `http://localhost:8080/api/requests/update/${selectedRequest.rid}?statusRequest=confirm`,
        {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        }
      );
      if (!res.ok) throw new Error("Failed to confirm money request");
      // After a successful update, remove the request from the pending list.
      setMoneyRequests(prev => prev.filter(req => req.rid !== selectedRequest.rid));
      setShowConfirmModal(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error("Error confirming money request", error);
    }
  };

  return (
<div className="sticky top-0 z-50 flex justify-between items-center px-5 text-black shadow-lg bg-[#fffff2]">
      <div className="flex flex-row justify-items-center items-center">
        <motion.img
          src="/pablologo.png"
          alt="Pablo EscoBANKS Logo"
          className="h-12 w-auto"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3, ease: "easeInOut" }}
        />
        <h1 className="text-xl font-bold">Welcome, {user?.name}</h1>
      </div>
      <div className="flex items-center space-x-4">
        {/* Notification Button */}
        <div className="relative">
          <button onClick={toggleNotification} className="p-2 rounded-full hover:bg-gray-200 focus:outline-none relative">
            <Bell className="h-5 w-5" />
            {moneyRequests.length > 0 && (
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            )}
          </button>
          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white shadow-lg rounded-md border border-gray-200 z-10">
              <div className="p-3 border-b border-gray-200">
                <h3 className="font-semibold">Money Requests</h3>
              </div>
              <ul className="list-none max-h-80 overflow-y-auto">
                {moneyRequests.length > 0 ? (
                  moneyRequests.map((request) => (
                    <li key={request.rid} className="p-3 border-b border-gray-100 hover:bg-gray-50">
                      <div className="flex flex-col">
                        <p className="text-sm">
                          Money request of ₱{request.amount.toFixed(2)} from Account ID: {request.requesterAccount.aId}
                        </p>
                        <span className="text-xs text-gray-500 mt-1">
                          {new Date(request.requestDate).toLocaleString()}
                        </span>
                        <div className="flex justify-end space-x-2 mt-2">
                          <button onClick={() => handleAcceptClick(request)} className="text-green-600 text-sm">
                            Accept
                          </button>
                          <button onClick={() => handleRequestAction(request.rid, "cancel")} className="text-red-600 text-sm">
                            Cancel
                          </button>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="p-3 text-center text-gray-500">No money requests</li>
                )}
              </ul>
              <div className="p-2 text-center border-t border-gray-100">
                <button className="text-sm text-blue-600 hover:text-blue-800" onClick={() => setMoneyRequests([])}>
                  Mark all as read
                </button>
              </div>
            </div>
          )}
        </div>
        {/* User Dropdown */}
        <div className="relative">
          <button onClick={toggleDropdown} className="px-4 py-2 border rounded bg-gray-200 text-black hover:bg-gray-300 focus:outline-none">
            {user?.username ?? "Admin"}
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md border border-gray-200 z-10">
              <ul className="list-none p-2">
                <li>
                  <button onClick={handleLogout} className="w-full px-4 py-2 text-left text-black hover:bg-gray-200 rounded-md">
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
      {/* Confirmation Modal for Accepting Money Request */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setSelectedRequest(null);
        }}
        onConfirm={handleConfirmRequest}
        title="Confirm Money Request"
      >
        {selectedRequest && (
          <div>
            <p>
              Are you sure you want to accept the money request of ₱{selectedRequest.amount.toFixed(2)} from Account ID: {selectedRequest.requesterAccount.aId}?
            </p>
          </div>
        )}
      </ConfirmationModal>
    </div>
  );
};

export default Header;
