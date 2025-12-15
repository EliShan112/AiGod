"use client";

import { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faGear,
  faArrowRightFromBracket,
  faRightFromBracket,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import Button from "../ui/Button";
import useClickOutside from "@/hooks/useClickOutside";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

const MyProfile = () => {
  const router = useRouter();
  const useDropDownRef = useRef<HTMLDivElement>(null);
  const [openMenu, setOpenMenu] = useState(false);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch (error) {
      console.log("Logout request failed, but clearing client anyway", error);
    }
    logout();
    setOpenMenu(false);
    router.push("/auth/login");
  };

  const initials = user
    ? user.username
        .split(" ")
        .map((w) => w[0].toUpperCase())
        .slice(0, 2)
        .join("")
    : "G";

  useClickOutside(useDropDownRef, () => {
    setOpenMenu(false);
  });

  const itemClass =
    "w-[95%] text-left px-4 py-2.5 hover:bg-[#424242] text-sm flex items-center gap-2 rounded-lg text-sm font-medium transition active:scale-95";
  return (
    <div className="relative">
      <div
        onClick={() => setOpenMenu(!openMenu)}
        className="mt-2 pt-2 border-t border-[#303030] px-2 py-3 flex items-center gap-3 hover:bg-[#212121] rounded-lg cursor-pointer transition-colors"
      >
        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
          {initials}
        </div>
        <div className="text-sm font-medium">
          {user
            ? user.username[0].toUpperCase() + user.username.slice(1)
            : "Guest"}
        </div>
      </div>

      {/* Dropdown */}
      {openMenu && (
        <div
          ref={useDropDownRef}
          className="absolute w-full bottom-16 -translate-x-1/2 left-1/2 bg-[#2f2f2f] rounded-xl shadow-xl border border-[#424242] z-50 overflow-hidden py-1.5 flex items-center flex-col"
        >
          {user ? (
            <>
              {/* Account */}
              <Button
                className="w-[95%] text-left px-4 py-2.5 hover:bg-[#424242] text-sm flex items-center gap-2"
                onClick={()=>setOpenMenu(false)}
              >
                <FontAwesomeIcon icon={faUser} className="text-gray-300 w-4" />
                My Account
              </Button>

              {/* logout */}
              <Button
                onClick={handleLogout}
                className="w-[95%] text-left px-4 py-2.5 hover:bg-[#424242] text-sm flex items-center gap-2"
              >
                <FontAwesomeIcon
                  icon={faArrowRightFromBracket}
                  className="w-4"
                />
                Log Out
              </Button>
            </>
          ) : (
            <>
              {/* signup */}

              <Link href={"/auth/signup"} className={itemClass} onClick={()=>setOpenMenu(false)}>
                <FontAwesomeIcon icon={faUserPlus} className="w-4" />
                Sign Up
              </Link>

              {/* Login */}
              <Link href={"/auth/login"} className={itemClass} onClick={()=>setOpenMenu(false)}>
                <FontAwesomeIcon icon={faRightFromBracket} className="w-4" />
                Log In
              </Link>
            </>
          )}

          <Button className="w-[95%] text-left px-4 py-2.5 hover:bg-[#424242] text-sm flex items-center gap-2" onClick={()=>setOpenMenu(false)}>
            <FontAwesomeIcon icon={faGear} className="text-gray-300 w-4" />
            Settings
          </Button>
        </div>
      )}
    </div>
  );
};

export default MyProfile;
