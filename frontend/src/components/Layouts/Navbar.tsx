"use client";

import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faChevronDown,
  faUser,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import Button from "../ui/Button";

const Navbar = () => {
  const [modelOpen, setModelOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState("GPT-5.1");
  const [openProfile, setOpenProfile] = useState(false);

  const models = ["GPT-5.1", "GPT-4.1", "GPT-3.5 Turbo", "GPT-o Mini"];

  // Reference to dropdown container
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setModelOpen(false);
      }
    }

    if (modelOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [modelOpen]);

  return (
    <nav className="w-full h-16 bg-[#212121] border-b border-[#2a2a2a] flex items-center justify-between px-4 text-gray-200 relative z-50">

      {/* Left: Mobile sidebar */}
      <button className="lg:hidden p-2 hover:bg-[#2a2a2a] rounded">
        <FontAwesomeIcon icon={faBars} />
      </button>

      {/* Right section */}
      <div className="flex items-center">

        {/* Model Selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setModelOpen(!modelOpen)}
            className="flex items-center gap-2 px-3 py-2 hover:bg-[#333] rounded-lg cursor-pointer"
          >
            {selectedModel}
            <FontAwesomeIcon icon={faChevronDown} className="text-xs" />
          </button>

          {/* Dropdown */}
          {modelOpen && (
            <div className="absolute left-0 top-12 bg-[#2a2a2a] rounded-lg shadow-lg w-60 p-2 text-sm space-y-1 z-50">

              {models.map((model) => (
                <button
                  key={model}
                  onClick={() => {
                    setSelectedModel(model);
                    setModelOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded hover:bg-[#3a3a3a] cursor-pointer"
                >
                  {model}

                  {/* Tick when selected */}
                  {selectedModel === model && (
                    <FontAwesomeIcon icon={faCheck} className="text-green-400" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
