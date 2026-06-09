import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { BsFillKeyboardFill } from "react-icons/bs";
import { FaUsersLine } from "react-icons/fa6";
import { MdTipsAndUpdates } from "react-icons/md";
import { IoIosArrowDown } from "react-icons/io";
import { UserMenu } from "./ui/UserMenu";

axios.defaults.withCredentials = true; //to include cookies in requests

const Navbar = () => {
  const { user, userInfo, userInitial } = useContext(AuthContext);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const nav = useNavigate();

  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!menuRef.current?.contains(e.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <div className="h-[80px] backdrop-blur- bg-[#181C22] flex items-center justify-between py-7 px-10 text-slate-300 font-mono ">
        {/* Logo */}

        <Link to="/">
          <div className="flex items-center justify-center cursor-pointer gap-2 ">
            <img
              className="h-[30px] "
              src="keyboard-shortcut.1024x1020.png"
              alt="logo"
            />
            <h4 className="text-[orange] text-xl font-bold">m.o.k</h4>
          </div>
        </Link>

        <div className="w-[45%]">
          <ul className="flex justify-between cursor-pointer">
            <li className="hover:uppercase hover:underline hover:text-[orange]">
              <NavLink
                className={({ isActive }) =>
                  `flex items-center gap-2 ${
                    isActive ? "uppercase underline text-[orange]" : ""
                  }`
                }
                to="practice"
              >
                <BsFillKeyboardFill size={20} />
                Practice
              </NavLink>
            </li>
            <li className="hover:uppercase hover:underline hover:text-[orange]">
              <NavLink
                className={({ isActive }) =>
                  `flex items-center gap-2 ${
                    isActive ? "uppercase underline text-[orange]" : ""
                  }`
                }
                to="multiplayer"
              >
                <FaUsersLine size={20} />
                Multiplayer
              </NavLink>
            </li>
            <li className="hover:uppercase hover:underline hover:text-[orange] flex items-center gap-2">
              <MdTipsAndUpdates size={17} />
              Tips
            </li>
          </ul>
        </div>

        <div className="flex gap-8">
          {!user ? (
            <>
              <button className="hover:underline hover:text-[orange]">
                <NavLink
                  className={({ isActive }) =>
                    isActive ? "uppercase underline text-[orange]" : ""
                  }
                  to="/signup"
                >
                  Sign Up
                </NavLink>
              </button>
              <button className="underline text-[orange] hover:underline-offset-2">
                <NavLink
                  className={({ isActive }) =>
                    isActive ? "uppercase underline text-[orange]" : ""
                  }
                  to="/login"
                >
                  Log In
                </NavLink>
              </button>
            </>
          ) : (
            <div ref={menuRef} className="relative">
              <div
                onClick={() => setShowUserMenu((prev) => !prev)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <div className="flex items-center gap-2 text-white font-bold">
                  {userInfo?.profileAvatar ? (
                    <img
                      src={userInfo.profileAvatar}
                      alt="Profile"
                      className="w-10 h-10 object-cover rounded-full border-2 border-orange-500"
                    />
                  ) : (
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-orange-500 font-bold">
                      {userInitial}
                    </div>
                  )}

                  <div className="flex flex-col text-sm">
                    <p className="text-orange-500">{userInfo?.username}</p>
                    <p className="text-xs text-orange-400">{userInfo?.email}</p>
                  </div>
                </div>

                <span
                  className={`text-orange-500 p-1 bg-orange-500/20 rounded-full transition-transform duration-200 ${
                    !showUserMenu ? "rotate-0" : "rotate-180"
                  }`}
                >
                  <IoIosArrowDown size={19} />
                </span>
              </div>

              {showUserMenu && (
                <UserMenu
                  userInfo={userInfo}
                  userInitial={userInitial}
                  onClose={() => setShowUserMenu(false)}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
