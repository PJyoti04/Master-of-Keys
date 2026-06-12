import { useState } from "react";
import { Link } from "react-router-dom";
import { FaPlus } from "react-icons/fa6";
import { HiUsers } from "react-icons/hi2";

function MultiplayerHome() {
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [roomId, setRoomId] = useState("");
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

      {/* Smooth blend from navbar color */}
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

      {/* Optional bottom fade */}
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
            // borde border-whie/10
            // bg-white/
            // backdrop-blur-m
            // shadw-[0_0_50px_rgba(0,0,0,0.45)]
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
            style={{ fontFamily: "Lobster Two, sans-serif" }}
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
            className={`flex justify-center items-center ${showJoinInput ? "gap-4" : "gap-12"} mt-10`}
          >
            {/* Create Button */}
            <Link
              to="create"
              className={`
                flex items-center justify-center gap-2
                font-bold
                text-lg
              text-white
                bg-gradient-to-r
              from-orange-500
              to-orange-600
                rounded-full
                group
                hover:scale-105
                hover:shadow-[0_0_25px_rgba(249,115,22,0.5)]
                transition-all
                duration-200
                ${showJoinInput ? "w-14 h-14 px-0" : "px-7 py-4 min-w-36"}
              `}
            >
              <FaPlus size={22} className="transition-transform duration-500 group-hover:rotate-90" />
              {!showJoinInput && <span>Create</span>}
            </Link>

            {/* Join Flow */}
            {showJoinInput && (
              <div className="flex items-center gap-3 animate-in fade-in duration-300">
                {/* Input */}
                <div className="w-72 transition-all duration-500">
                  <input
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    placeholder="Enter Room ID"
                    className="w-full h-14 px-5 rounded-full bg-white/10 backdrop-blur-md border border-orange-500/30 text-white outline-none placeholder:text-gray-400 focus:border-orange-500 focus:shadow-[0_0_20px_rgba(249,115,22,0.25)] transition-all"
                  />
                </div>

                {/* Close Button */}
                <button
                  onClick={() => {
                    setShowJoinInput(false);
                    setRoomId("");
                  }}
                  className="h-12 w-12 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/15 transition-all duration-300"
                >
                  ✕
                </button>
              </div>
            )}

            <button
              onClick={() => setShowJoinInput(true)}
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
                  flex items-center justify-center gap-2
                  ${showJoinInput ? "w-10 h-14 px-0 bg-orange-500" : "bg-orange-500/20"}
                `}
            >
              <HiUsers size={22} />
              Join
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MultiplayerHome;
