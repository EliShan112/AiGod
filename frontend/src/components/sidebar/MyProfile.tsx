"use client";

import { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faGear,
  faArrowRightFromBracket,
  faRightFromBracket,
  faUserPlus 
} from "@fortawesome/free-solid-svg-icons";
import Button from "../ui/Button";
import useClickOutside from "@/hooks/useClickOutside";

const MyProfile = () => {
  const useDropDownRef = useRef<HTMLDivElement>(null);
  const [openMenu, setOpenMenu] = useState(false);

  useClickOutside(useDropDownRef, ()=>{
    setOpenMenu(false);
  })
  return (
    <div  className="relative" >
      <div  onClick={()=> setOpenMenu(!openMenu)} className="mt-2 pt-2 border-t border-[#303030] px-2 py-3 flex items-center gap-3 hover:bg-[#212121] rounded-lg cursor-pointer transition-colors">
        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
          ES
        </div>
        <div className="text-sm font-medium">Eli Shan</div>
      </div>

      {/* Dropdown */}
      {openMenu && (
        <div ref={useDropDownRef}
        className="absolute w-full bottom-16 -translate-x-1/2 left-1/2 bg-[#2f2f2f] rounded-xl shadow-xl border border-[#424242] z-50 overflow-hidden py-1.5 flex items-center flex-col" >

          {/* Account */}
          <Button className="w-[95%] text-left px-4 py-2.5 hover:bg-[#424242] text-sm flex items-center gap-2">
            <FontAwesomeIcon icon={faUser} className="text-gray-300 w-4" />
            My Account
          </Button>
            <Button className="w-[95%] text-left px-4 py-2.5 hover:bg-[#424242] text-sm flex items-center gap-2">
              <FontAwesomeIcon icon={faGear} className="text-gray-300 w-4" />
              Settings
            </Button>
            {/* <Button className="w-[95%] text-left px-4 py-2.5 hover:bg-[#424242] text-sm flex items-center gap-2">
              <FontAwesomeIcon icon={faArrowRightFromBracket} className="w-4" />
              Log Out
            </Button> */}
            <Button className="w-[95%] text-left px-4 py-2.5 hover:bg-[#424242] text-sm flex items-center gap-2">
              <FontAwesomeIcon icon={faUserPlus } className="w-4" />
              Sign Up
            </Button>
            <Button className="w-[95%] text-left px-4 py-2.5 hover:bg-[#424242] text-sm flex items-center gap-2">
              <FontAwesomeIcon icon={faRightFromBracket} className="w-4" />
              Log In  
            </Button>
        </div>
      )}
      
    </div>
  );
};

export default MyProfile;
