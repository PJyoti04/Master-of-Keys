import { LayoutDashboard, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProfileUpload from "./ProfileUpload";
import api from "../../utils/api";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

export const UserMenu = ({ userInfo, userInitial, onClose }) => {
  const nav = useNavigate();
  const { fetchUser } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      await api.post("auth/logout");
      await fetchUser();
      nav("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div
      className="
        absolute right-0 top-full mt-3
        md:w-80 w-[260px] rounded-3xl
        bg-[#1f1f1f]
        border border-gray-700
        shadow-2xl
        z-50
        overflow-hidden
      "
    >
      {/* Header */}
      <div className="p-6 flex flex-col items-center">
        {/* {userInfo?.profileAvatar ? (
          <img
            src={userInfo.profileAvatar}
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover border-4 border-orange-500"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center text-3xl font-bold text-white">
            {userInitial}
          </div>
        )} */}

        <ProfileUpload />

        <h3 className="mt-4 text-white font-semibold">{userInfo?.username}</h3>

        <p className="text-gray-400 text-sm">{userInfo?.email}</p>
      </div>

      {/* Actions */}
      <div className="border-t border-gray-700">
        <button
          onClick={() => {
            nav("/dashboard");
            onClose();
          }}
          className="w-full flex items-center gap-3 px-5 py-4 text-white hover:bg-white/5"
        >
          <LayoutDashboard size={18} />
          Dashboard
        </button>

        {/* <button
          onClick={() => {
            nav("/dashboard/profile");
            onClose();
          }}
          className="w-full flex items-center gap-3 px-5 py-4 text-white hover:bg-white/5"
        >
          <User size={18} />
          Manage Profile
        </button> */}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-5 py-4 text-red-400 hover:bg-red-500/10"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
};
