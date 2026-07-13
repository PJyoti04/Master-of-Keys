import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link, NavLink } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { BsFillKeyboardFill } from "react-icons/bs";
import { FaUsersLine } from "react-icons/fa6";
import { MdTipsAndUpdates } from "react-icons/md";
import { IoIosArrowDown } from "react-icons/io";
import { HiOutlineMenuAlt3, HiOutlineX } from "react-icons/hi";
import { UserMenu } from "./ui/UserMenu";

axios.defaults.withCredentials = true;

const Navbar = () => {
  const { user, userInfo, userInitial } = useContext(AuthContext);

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const menuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!menuRef.current?.contains(e.target)) {
        setShowUserMenu(false);
      }

      if (!mobileMenuRef.current?.contains(e.target)) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowMobileMenu(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const closeMobileMenu = () => {
    setShowMobileMenu(false);
  };

  return (
    <>
      <div className="relative z-50 flex h-[80px] items-center justify-between bg-[#181C22] px-4 py-7 font-mono text-slate-300 sm:px-6 md:px-10">
        {/* Logo */}
        <Link to="/" onClick={closeMobileMenu}>
          <div className="flex cursor-pointer items-center justify-center gap-2">
            <img
              className="h-[30px]"
              src="/keyboard-shortcut.1024x1020.png"
              alt="logo"
            />

            <h4 className="text-xl font-bold text-[orange]">m.o.k</h4>
          </div>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden w-[45%] md:block">
          <ul className="flex cursor-pointer justify-between">
            <li className="hover:text-[orange] hover:underline hover:uppercase">
              <NavLink
                className={({ isActive }) =>
                  `flex items-center gap-2 ${
                    isActive ? "text-[orange] underline uppercase" : ""
                  }`
                }
                to="/practice"
              >
                <BsFillKeyboardFill size={20} />
                Practice
              </NavLink>
            </li>

            <li className="hover:text-[orange] hover:underline hover:uppercase">
              <NavLink
                className={({ isActive }) =>
                  `flex items-center gap-2 ${
                    isActive ? "text-[orange] underline uppercase" : ""
                  }`
                }
                to="/multiplayer"
              >
                <FaUsersLine size={20} />
                Multiplayer
              </NavLink>
            </li>

            <li className="flex items-center gap-2 hover:text-[orange] hover:underline hover:uppercase">
              <MdTipsAndUpdates size={17} />
              Tips
            </li>
          </ul>
        </div>

        {/* Desktop authentication/user section */}
        <div className="hidden gap-8 md:flex">
          {!user ? (
            <>
              <button className="hover:text-[orange] hover:underline">
                <NavLink
                  className={({ isActive }) =>
                    isActive ? "text-[orange] underline uppercase" : ""
                  }
                  to="/signup"
                >
                  Sign Up
                </NavLink>
              </button>

              <button className="text-[orange] underline hover:underline-offset-2">
                <NavLink
                  className={({ isActive }) =>
                    isActive ? "text-[orange] underline uppercase" : ""
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
                className="flex cursor-pointer items-center gap-2"
              >
                <div className="flex items-center gap-2 font-bold text-white">
                  {userInfo?.profileAvatar ? (
                    <img
                      src={userInfo.profileAvatar}
                      alt="Profile"
                      className="h-10 w-10 rounded-full border-2 border-orange-500 object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 font-bold">
                      {userInitial}
                    </div>
                  )}

                  <div className="flex flex-col text-sm">
                    <p className="text-orange-500">{userInfo?.username}</p>

                    <p className="text-xs text-orange-400">
                      {userInfo?.email}
                    </p>
                  </div>
                </div>

                <span
                  className={`rounded-full bg-orange-500/20 p-1 text-orange-500 transition-transform duration-200 ${
                    showUserMenu ? "rotate-180" : "rotate-0"
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

        {/* Mobile right section */}
        <div className="flex items-center gap-3 md:hidden">
          {user && (
            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowUserMenu((prev) => !prev);
                  setShowMobileMenu(false);
                }}
                className="flex items-center gap-1"
                aria-label="Open user menu"
                aria-expanded={showUserMenu}
              >
                {userInfo?.profileAvatar ? (
                  <img
                    src={userInfo.profileAvatar}
                    alt="Profile"
                    className="h-9 w-9 rounded-full border-2 border-orange-500 object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
                    {userInitial}
                  </div>
                )}

                <IoIosArrowDown
                  size={16}
                  className={`text-orange-500 transition-transform duration-200 ${
                    showUserMenu ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>

              {showUserMenu && (
                <UserMenu
                  userInfo={userInfo}
                  userInitial={userInitial}
                  onClose={() => setShowUserMenu(false)}
                />
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setShowMobileMenu((prev) => !prev);
              setShowUserMenu(false);
            }}
            className="text-orange-500"
            aria-label={
              showMobileMenu ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={showMobileMenu}
          >
            {showMobileMenu ? (
              <HiOutlineX size={27} />
            ) : (
              <HiOutlineMenuAlt3 size={27} />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {showMobileMenu && (
          <div
            ref={mobileMenuRef}
            className="absolute left-0 right-0 top-[80px] bg-[#181C22] px-5 pb-6 pt-3 shadow-[0_18px_35px_rgba(0,0,0,0.35)] md:hidden"
          >
            {user && (
              <div className="mb-5 flex items-center gap-3 bg-white/[0.03] p-3">
                {userInfo?.profileAvatar ? (
                  <img
                    src={userInfo.profileAvatar}
                    alt="Profile"
                    className="h-10 w-10 rounded-full border-2 border-orange-500 object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 font-bold text-white">
                    {userInitial}
                  </div>
                )}

                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-orange-500">
                    {userInfo?.username}
                  </p>

                  <p className="truncate text-xs text-orange-400">
                    {userInfo?.email}
                  </p>
                </div>
              </div>
            )}

            <ul className="flex flex-col gap-5">
              <li className="hover:text-[orange] hover:underline hover:uppercase">
                <NavLink
                  className={({ isActive }) =>
                    `flex items-center gap-2 ${
                      isActive ? "text-[orange] underline uppercase" : ""
                    }`
                  }
                  to="/practice"
                  onClick={closeMobileMenu}
                >
                  <BsFillKeyboardFill size={20} />
                  Practice
                </NavLink>
              </li>

              <li className="hover:text-[orange] hover:underline hover:uppercase">
                <NavLink
                  className={({ isActive }) =>
                    `flex items-center gap-2 ${
                      isActive ? "text-[orange] underline uppercase" : ""
                    }`
                  }
                  to="/multiplayer"
                  onClick={closeMobileMenu}
                >
                  <FaUsersLine size={20} />
                  Multiplayer
                </NavLink>
              </li>

              <li
                onClick={closeMobileMenu}
                className="flex cursor-pointer items-center gap-2 hover:text-[orange] hover:underline hover:uppercase"
              >
                <MdTipsAndUpdates size={17} />
                Tips
              </li>
            </ul>

            {!user && (
              <div className="mt-6 flex gap-6 border-t border-white/10 pt-5">
                <NavLink
                  className={({ isActive }) =>
                    `hover:text-[orange] hover:underline ${
                      isActive ? "text-[orange] underline uppercase" : ""
                    }`
                  }
                  to="/signup"
                  onClick={closeMobileMenu}
                >
                  Sign Up
                </NavLink>

                <NavLink
                  className={({ isActive }) =>
                    `text-[orange] underline hover:underline-offset-2 ${
                      isActive ? "uppercase" : ""
                    }`
                  }
                  to="/login"
                  onClick={closeMobileMenu}
                >
                  Log In
                </NavLink>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Navbar;
