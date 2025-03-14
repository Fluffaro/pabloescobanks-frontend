import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import React from "react";
import MotionButton from "./MotionButton";
import { User } from "../transaction/page";

interface HeaderProps {
  user? : User | null;
}

const Header = ({user} : HeaderProps) => {
  const router = useRouter();
  return (
        <div className="flex justify-between items-center mb-5">
  {/* Left side: Logo and text side by side */}
  <div className="flex items-center space-x-4">
    <motion.img
      src="/logoNoText.png"
      alt="Pablo EscoBANKS Logo"
      className="h-16 w-auto"
      animate={{ rotate: [0, 5, -5, 0] }} // Tilts left and right
      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
    />
  <h1 className="text-xl font-bold">Welcome To Pablo EscoBANKS, {user?.name ?? "ADMIN"}</h1>
  </div>

  {/* Logout Button on the Right */}
  <MotionButton onClick={() => {
    localStorage.removeItem("token");  // Remove token
    localStorage.removeItem("userId"); // Remove userId
    router.push("/"); // Redirect to login page
    }}>Logout</MotionButton>
</div>

  );
};


 


export default Header;
