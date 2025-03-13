import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import React from "react";
import MotionButton from "./MotionButton";
import { User } from "../transaction/page";

interface HeaderProps {
  user? : User;
}
const Header = ({user} : HeaderProps) => {
  const router = useRouter();
  return (
    <div className="flex justify-between items-center m-10 text-black">
  {/* Bank Name on the Left */}
  <h1 className="text-xl font-bold">Welcome To Pablo EscoBANKS, {user?.name}</h1>
 
  {/* Tilting Logo in the Center */}
  <motion.img
    src="/pablologo.png"
    alt="Pablo EscoBANKS Logo"
    className="h-40 w-auto mr-22"
    animate={{ rotate: [0, 5, -5, 0] }} // Tilts left and right
    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
  />
 
  {/* Logout Button on the Right */}
  <MotionButton onClick={() => router.push("/")}>Logout</MotionButton>
</div>
  );
};


 


export default Header;
