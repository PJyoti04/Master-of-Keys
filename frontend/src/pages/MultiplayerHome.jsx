import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { toast } from "react-toastify";

import { FaPlus } from "react-icons/fa6";
import { HiUsers } from "react-icons/hi2";

function MultiplayerHome() {
  const navigate = useNavigate();

  const [showJoinInput, setShowJoinInput] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [joining, setJoining] = useState(false);
  // const [joinError, setJoinError] = useState("");

  const handleJoinRoom = async () => {
  if (!roomId.trim()) {
    toast.error("Please enter a room code");
    return;
  }

  try {
    setJoining(true);

    const res = await api.post(
      "http://localhost:5000/api/rooms/join",
      {
        roomCode: roomId.trim().toUpperCase(),
      },
      {
        withCredentials: true,
      }
    );

    toast.success("Joined room successfully");

    navigate(
      `/multiplayer/room/${res.data.roomCode}`
    );
  } catch (error) {
    toast.error(
      error?.response?.data?.message ||
      "Unable to join room"
    );
  } finally {
    setJoining(false);
  }
};

  return (
    <div
      className="
        relative
        h-[calc(100vh-80px)]
        overflow-hidden
        bg-[#181C22]
        bg-[url('./MOK_Multiplayer2.png')]
        bg-cover
        bg-center
      "
    >
      {/* Main dark overlay */}
      <div className="absolute inset-0 bg-black/45" />

      {/* Top Blend */}
      <div
        className="
          absolute
          inset-x-0
          top-0
          h-72
          bg-gradient-to-b
          from-[#181C22]
          via-[#181C22]
          via-10%
          to-transparent
        "
      />

      {/* Bottom Blend */}
      <div
        className="
          absolute
          inset-x-0
          bottom-0
          h-40
          bg-gradient-to-t
          from-[#181C22]
          to-transparent
        "
      />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center px-6">
        <div
          className="
            max-w-2xl
            w-full
            text-center
            p-10
            rounded-3xl
            pt-0
          "
        >
          <p className="uppercase italic tracking-[0.4em] text-orange-400 text-sm mb-4">
            Competitive Typing Arena
          </p>

          <h1
            style={{ fontFamily: "Chelsea Market, system-ui" }}
            className="text-6xl md:text-7xl font-extrabold mb-3"
          >
            <span className="text-orange-400">Master</span>
            <span className="text-white"> of Keys</span>
          </h1>

          <h2
            style={{
              fontFamily: "Lobster Two, sans-serif",
            }}
            className="text-3xl italic font-bold text-gray-200 mb-6"
          >
            Multiplayer Mode
          </h2>

          <p className="text-gray-400 text-lg leading-relaxed max-w-xl mx-auto mb-10">
            Race against friends or challenge players worldwide in real-time
            typing battles. Create a room, invite your squad, or join an
            existing arena and prove your speed.
          </p>

          <div
            className={`flex justify-center items-center ${
              showJoinInput ? "gap-4" : "gap-12"
            } mt-10`}
          >
            {/* CREATE BUTTON */}
            <Link
              to="create"
              className={`
                flex items-center justify-center gap-2
                font-bold text-lg text-white
                bg-gradient-to-r
                from-orange-500
                to-orange-600
                rounded-full
                group
                hover:scale-105
                hover:shadow-[0_0_25px_rgba(249,115,22,0.5)]
                transition-all duration-200
                ${showJoinInput ? "w-14 h-14 px-0" : "px-7 py-4 min-w-36"}
              `}
            >
              <FaPlus
                size={22}
                className="transition-transform duration-500 group-hover:rotate-90"
              />

              {!showJoinInput && <span>Create</span>}
            </Link>

            {/* JOIN INPUT */}
            {showJoinInput && (
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-3 animate-in fade-in duration-300">
                  <div className="w-72 transition-all duration-500">
                    <input
                      value={roomId}
                      onChange={(e) => {
                        setRoomId(e.target.value.toUpperCase());

                        // if (joinError) setJoinError("");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleJoinRoom();
                        }
                      }}
                      placeholder="Enter Room ID"
                      className="
                        w-full
                        h-14
                        px-5
                        rounded-full
                        bg-white/10
                        backdrop-blur-md
                        border
                        border-orange-500/30
                        text-white
                        outline-none
                        placeholder:text-gray-400
                        focus:border-orange-500
                        focus:shadow-[0_0_20px_rgba(249,115,22,0.25)]
                        transition-all
                      "
                    />
                  </div>

                  {/* CLOSE */}
                  <button
                    onClick={() => {
                      setShowJoinInput(false);
                      setRoomId("");
                      // setJoinError("");
                    }}
                    className="
                      h-12
                      w-12
                      rounded-full
                      bg-white/10
                      border
                      border-white/10
                      flex
                      items-center
                      justify-center
                      text-gray-300
                      hover:text-white
                      hover:bg-white/15
                      transition-all
                    "
                  >
                    ✕
                  </button>
                </div>

                {/* <p
                  className={`text-red-400 text-sm mt-2 ml-2 h-5 transition-opacity duration-200 ${
                    joinError ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {joinError || "placeholder"}
                </p> */}
              </div>
            )}

            {/* JOIN BUTTON */}
            <button
              disabled={joining}
              onClick={() => {
                if (showJoinInput) {
                  handleJoinRoom();
                } else {
                  setShowJoinInput(true);
                }
              }}
              className={`
                min-w-36
                px-8
                py-4
                rounded-full
                font-bold
                text-lg
                text-white
                border
                border-orange-500/20
                hover:bg-orange-500/10
                hover:scale-105
                transition-all
                duration-300
                flex
                items-center
                justify-center
                gap-2
                ${showJoinInput ? "bg-orange-500" : "bg-orange-500/20"}
                ${joining ? "opacity-70 cursor-not-allowed" : ""}
              `}
            >
              <HiUsers size={22} />

              <span>
                {showJoinInput ? (joining ? "Joining..." : "Join") : "Join"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MultiplayerHome;
