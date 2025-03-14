import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import MotionButton from "./MotionButton";
import { User } from "../transaction/page";

interface HeaderProps {
  user? : User;
}


const Header = ({user} : HeaderProps) => {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleLogout = () => {
    router.push("/");
  }
  
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
  <div className="relative">
    <button onClick={toggleDropdown} className="px-4 py-2 border rounded bg-gray-200 text-black hover:bg-gray-300 focus:outline-none">
      {user?.username ?? "Admin"}
    </button>

    {isDropdownOpen && 
      <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg  rounded-md border border-gray-200">
        <ul className="list-none p-2">
          <li>
              <button onClick={handleLogout} className="w-full px-4 py-2 text-left text-black hover:bg-gray-200 rounded-md ">
                Logout
              </button>

          </li>
        </ul>
      </div>
      }
  </div>
  {/* Logout Button on the Right */}
</div>
  );
};


 


export default Header;
