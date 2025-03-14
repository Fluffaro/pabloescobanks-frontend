"use client";
import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react"; // Make sure you have lucide-react installed
import { useToast } from "../components/hooks/use-toast";
import ConfirmationModal from "../components/ConfirmationModal";

// -----------------------------------------------------------------------------
// 1) Interfaces
// -----------------------------------------------------------------------------
interface User {
  id?: string;
  name?: string;
  email?: string;
  // If your old code uses userId or username, add them here:
  // userId?: number;
  // username?: string;
}

// -----------------------------------------------------------------------------
// 2) Notification-Related Types (if needed)
// -----------------------------------------------------------------------------
interface MoneyRequest {
  rid: number;
  amount: number;
  requestDate: string;
  status: string;
  requesterAccount: {
    aId: number;
    // any other fields...
  };
  // etc...
}

// -----------------------------------------------------------------------------
// 3) Header Props (if you like to pass user from parent)
// -----------------------------------------------------------------------------
interface HeaderProps {
  user?: User;
}

// -----------------------------------------------------------------------------
// 4) Framer Motion Animations for the header
// -----------------------------------------------------------------------------
const headerVariants = {
  hidden: { y: -20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
};

// -----------------------------------------------------------------------------
// 5) Merged Header with Notification Dropdown + Confirmation Modal
// -----------------------------------------------------------------------------
const Header: React.FC<HeaderProps> = ({ user }) => {
  const router = useRouter();
  const toast = useToast();

  // ---------------------------------------------------------------------------
  // A) States: Dropdown, Notifications, Money Requests
  // ---------------------------------------------------------------------------
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [moneyRequests, setMoneyRequests] = useState<MoneyRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<MoneyRequest | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Toggle user dropdown and notification dropdown
  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);
  const toggleNotification = () => setIsNotificationOpen((prev) => !prev);

  // ---------------------------------------------------------------------------
  // B) Logout (adjust as needed)
  // ---------------------------------------------------------------------------
  const handleLogout = () => {
    // If you clear tokens from localStorage, do it here
    // localStorage.removeItem("token");
    // localStorage.removeItem("userId");
    router.push("/");
  };

  // ---------------------------------------------------------------------------
  // C) Read token and userId from localStorage or from user object
  //    (Adjust to your actual code)
  // ---------------------------------------------------------------------------
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  // If your new user object has `id`:
  // If your old code uses `userId`, adapt accordingly:
  const receiverAccId = user?.id || localStorage.getItem("userId");

  // ---------------------------------------------------------------------------
  // D) Poll the backend for pending money requests every 5s
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!receiverAccId) return;

    const fetchMoneyRequests = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/requests/receiver/${receiverAccId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch money requests");
        const data = await res.json();

        // Filter for pending requests
        const pendingRequests = data.filter(
          (req: MoneyRequest) => req.status.toLowerCase() === "pending"
        );
        setMoneyRequests(pendingRequests);
      } catch (error) {
        console.error(error);
      }
    };

    fetchMoneyRequests();
    const intervalId = setInterval(fetchMoneyRequests, 5000);
    return () => clearInterval(intervalId);
  }, [receiverAccId, token]);

  // ---------------------------------------------------------------------------
  // E) Cancel or Accept logic
  // ---------------------------------------------------------------------------
  // Cancel: marks a request as "Canceled"
  const handleRequestAction = async (requestId: number, action: string) => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/requests/update/${requestId}?statusRequest=${action}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to update money request");
      // Remove from local state
      setMoneyRequests((prev) => prev.filter((req) => req.rid !== requestId));
      toast.toast({
        title: "Request Updated",
        description: `Request #${requestId} was updated successfully.`,
      });
    } catch (error) {
      console.error("Error updating money request", error);
      toast.toast({
        title: "Error",
        description: "Unable to update the request.",
        variant: "destructive",
      });
    }
  };

  // Accept: open confirmation modal
  const handleAcceptClick = (request: MoneyRequest) => {
    setSelectedRequest(request);
    setShowConfirmModal(true);
  };

  // Confirm the request by calling the API
  const handleConfirmRequest = async () => {
    if (!selectedRequest) return;
    try {
      const res = await fetch(
        `http://localhost:8080/api/requests/update/${selectedRequest.rid}?statusRequest=confirm`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to confirm money request");
      // Remove from local state
      setMoneyRequests((prev) => prev.filter((req) => req.rid !== selectedRequest.rid));
      setShowConfirmModal(false);
      setSelectedRequest(null);

      toast.toast({
        title: "Request Accepted",
        description: `Money request #${selectedRequest.rid} has been accepted.`,
      });
    } catch (error) {
      console.error("Error confirming money request", error);
      toast.toast({
        title: "Error",
        description: "Unable to confirm the request.",
        variant: "destructive",
      });
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <motion.header
      className="sticky top-0 z-40 w-full backdrop-blur-lg bg-white/80 border-b border-neutral-200"
      variants={headerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left: Title or Logo */}
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-[#1d1d1f]">
            <span className="text-blue-500">Wallet</span>Dashboard
          </h1>
        </div>

        {/* Right: Notification Bell + User Dropdown */}
        <div className="flex items-center space-x-4">
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={toggleNotification}
              className="p-2 rounded-full hover:bg-neutral-100 focus:outline-none relative"
            >
              <Bell className="h-5 w-5" />
              {moneyRequests.length > 0 && (
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              )}
            </button>
            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white shadow-lg rounded-md border border-neutral-200 z-10">
                <div className="p-3 border-b border-neutral-200">
                  <h3 className="font-semibold">Money Requests</h3>
                </div>
                <ul className="list-none max-h-80 overflow-y-auto">
                  {moneyRequests.length > 0 ? (
                    moneyRequests.map((request) => (
                      <li
                        key={request.rid}
                        className="p-3 border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                      >
                        <div className="flex flex-col">
                          <p className="text-sm">
                            Request of $
                            {request.amount.toFixed(2)} from Account ID:{" "}
                            {request.requesterAccount.aId}
                          </p>
                          <span className="text-xs text-neutral-500 mt-1">
                            {new Date(request.requestDate).toLocaleString()}
                          </span>
                          <div className="flex justify-end space-x-2 mt-2">
                            <button
                              onClick={() => handleAcceptClick(request)}
                              className="text-green-600 text-sm"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleRequestAction(request.rid, "cancel")}
                              className="text-red-600 text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="p-3 text-center text-neutral-500">
                      No money requests
                    </li>
                  )}
                </ul>
                <div className="p-2 text-center border-t border-neutral-100">
                  <button
                    className="text-sm text-blue-600 hover:text-blue-800"
                    onClick={() => setMoneyRequests([])}
                  >
                    Mark all as read
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Avatar + Dropdown */}
          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="px-4 py-2 border border-neutral-300 rounded-lg bg-neutral-100 text-neutral-800 hover:bg-neutral-200 focus:outline-none"
            >
              {user?.name ?? "User"}
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md border border-neutral-200 z-10">
                <ul className="list-none p-2">
                  <li>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-neutral-700 hover:bg-neutral-100 rounded-md"
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
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
              Are you sure you want to accept the money request of $
              {selectedRequest.amount.toFixed(2)} from Account ID:{" "}
              {selectedRequest.requesterAccount.aId}?
            </p>
          </div>
        )}
      </ConfirmationModal>
    </motion.header>
  );
};

export default Header;
