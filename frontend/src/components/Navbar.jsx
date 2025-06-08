import { useContext } from "react";
import axios from 'axios';
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from '../context/AuthContext'


axios.defaults.withCredentials = true; //to include cookies in requests

const Navbar = () => {
  const {user,userInitial} = useContext(AuthContext);
  const nav = useNavigate();



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
                  isActive ? "uppercase underline text-[orange]" : ""
                }
                to="practice"
              >
                Practice
              </NavLink>
            </li>
            <li className="hover:uppercase hover:underline hover:text-[orange]">
              <NavLink
                className={({ isActive }) =>
                  isActive ? "uppercase underline text-[orange]" : ""
                }
                to="multiplayer"
              >
                Multiplayer
              </NavLink>
            </li>
            <li className="hover:uppercase hover:underline hover:text-[orange]">
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
            <div className="flex items-center gap-2">
              <div
              onClick={() => nav('/dashboard')}
               className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold cursor-pointer">
                {userInitial}
              </div>
              {/* <button onClick={handleLogout} className="text-white"> */}
                {/* Log Out
              </button> */}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
