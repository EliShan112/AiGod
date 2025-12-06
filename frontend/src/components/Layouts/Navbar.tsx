"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faBars, 
  faChevronDown, 
  faPenToSquare, // "New Chat" icon
  faUserCircle   // Profile placeholder
} from "@fortawesome/free-solid-svg-icons";

const Navbar = () => {
  const [modelOpen, setModelOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [currentModel, setCurrentModel] = useState("GPT-4o");

  // Helper to close other menus when one opens
  const toggleModel = () => {
    setModelOpen(!modelOpen);
    setProfileOpen(false);
  };

  const toggleProfile = () => {
    setProfileOpen(!profileOpen);
    setModelOpen(false);
  };

  return (
    <nav className="relative w-full h-14 bg-[#212121] flex items-center justify-between px-4 text-gray-300 select-none">
      
      {/* --- LEFT: Sidebar Toggle --- */}
      <div className="flex-1 flex justify-start">
        <button className="p-2 hover:bg-[#2f2f2f] rounded-lg transition-colors">
          <FontAwesomeIcon icon={faBars} className="text-lg" />
        </button>
      </div>

      {/* --- CENTER: Model Selector --- */}
      <div className="relative z-50">
        <button
          onClick={toggleModel}
          className="flex items-center gap-2 px-3 py-2 hover:bg-[#2f2f2f] rounded-lg cursor-pointer transition-colors text-gray-100 font-medium"
        >
          <span>{currentModel}</span>
          <FontAwesomeIcon 
            icon={faChevronDown} 
            className={`text-xs transition-transform duration-200 ${modelOpen ? "rotate-180" : ""}`} 
          />
        </button>

        {/* Model Dropdown */}
        {modelOpen && (
          <>
            {/* Invisible backdrop to close menu when clicking outside */}
            <div className="fixed inset-0 z-40" onClick={() => setModelOpen(false)} />
            
            <div className="absolute left-1/2 -translate-x-1/2 top-12 bg-[#2f2f2f] border border-[#424242] rounded-xl shadow-xl w-64 p-2 text-sm space-y-1 z-50">
               {/* Menu Header */}
              <div className="px-3 py-2 text-xs text-gray-500 font-semibold uppercase tracking-wider">
                Model
              </div>
              
              {["GPT-4o", "GPT-4 Turbo", "GPT-3.5"].map((model) => (
                <button
                  key={model}
                  onClick={() => {
                    setCurrentModel(model);
                    setModelOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-[#424242] transition-colors text-left"
                >
                  <span className={currentModel === model ? "text-white" : "text-gray-300"}>
                    {model}
                  </span>
                  {currentModel === model && (
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* --- RIGHT: New Chat & Profile --- */}
      <div className="flex-1 flex justify-end items-center gap-3">
        
        {/* New Chat Icon */}
        <button className="p-2 text-gray-300 hover:bg-[#2f2f2f] rounded-lg transition-colors" title="New Chat">
          <FontAwesomeIcon icon={faPenToSquare} className="text-lg" />
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={toggleProfile}
            className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center text-white text-xs hover:opacity-80 transition-opacity"
          >
            JM
          </button>

           {/* Profile Menu */}
           {profileOpen && (
            <>
               <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
               <div className="absolute right-0 top-10 bg-[#2f2f2f] border border-[#424242] rounded-xl shadow-xl w-56 p-2 text-sm z-50">
                  <button className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-[#424242] text-gray-200">
                    My Plan
                  </button>
                  <button className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-[#424242] text-gray-200">
                    Settings & Beta
                  </button>
                  <div className="h-px bg-[#424242] my-1 mx-2"></div>
                  <button className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-[#424242] text-red-400">
                    Log out
                  </button>
               </div>
            </>
           )}
        </div>
      </div>

    </nav>
  );
};

export default Navbar;