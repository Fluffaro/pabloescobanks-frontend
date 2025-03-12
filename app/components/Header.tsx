import React from "react";

const Header = () => {
  return (
    <header className="text-black m-10">
      <h1 className="text-1xl font-bold">Pablo EscoBank</h1>
      <div className="flex items-center">
        <button className="absolute m-10 top-0 right-0 rounded-full border-2 border-transparent hover:ring-4  hover:ring-blue-500 focus:outline-none">
          <img
            src="/pablologo.png"
            alt="pablo"
            className="w-10 h-10 rounded-full"
          />
        </button>
        <span className=" font-semibold">USERNAME</span>
      </div>
    </header>
  );
};

export default Header;
