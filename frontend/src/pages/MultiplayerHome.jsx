import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { toast } from "react-toastify";

import { FaPlus } from "react-icons/fa6";
import { HiUsers } from "react-icons/hi2";

function MultiplayerHome() {
  const navigate = useNavigate();

  const [showJoinInput, setShowJoinInput] = useState(false);
  const [showMobileJoinModal, setShowMobileJoinModal] = useState(false);
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
        "/rooms/join",
        {
          roomCode: roomId.trim().toUpperCase(),
        },
        {
          withCredentials: true,
        }
      );

      toast.success("Joined room successfully");

      setShowMobileJoinModal(false);
      setShowJoinInput(false);

      navigate(`/multiplayer/room/${res.data.roomCode}`);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Unable to join room"
      );
    } finally {
      setJoining(false);
    }
  };

  const handleJoinButtonClick = () => {
    /*
     * Small screens:
     * Open the responsive modal instead of expanding
     * the inline desktop input.
     */
    if (window.innerWidth < 768) {
      setShowMobileJoinModal(true);
      setShowJoinInput(false);
      return;
    }

    /*
     * Desktop/tablet:
     * Keep the existing inline join behavior.
     */
    if (showJoinInput) {
      handleJoinRoom();
    } else {
      setShowJoinInput(true);
    }
  };

  const closeMobileJoinModal = () => {
    if (joining) return;

    setShowMobileJoinModal(false);
    setRoomId("");
    // setJoinError("");
  };

  return (
    <div
      className="
        relative
        h-[calc(100vh-80px)]
        overflow-hidden
        bg-[#181C22]
        bg-[url('/MOK_Multiplayer2.png')]
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
      <div className="relative z-10 flex h-full items-center justify-center md:px-6">
        <div className="w-full max-w-2xl rounded-3xl p-4 pt-0 text-center sm:p-6 md:p-10 md:pt-0">
          <p className="mb-4 text-xs uppercase italic tracking-[0.2em] text-orange-400 md:text-sm md:tracking-[0.4em]">
            Competitive Typing Arena
          </p>

          <h1
            style={{
              fontFamily: "Chelsea Market, system-ui",
            }}
            className="mb-3 text-4xl font-extrabold sm:text-5xl md:text-7xl"
          >
            <span className="text-white">Master of</span>

            <span className="text-orange-500 [text-shadow:0_0_45px_rgba(249,115,22,0.18)]">
              {" "}
              Keys
            </span>
          </h1>

          <h2
            // style={{
            //   fontFamily: "Lobster Two, sans-serif",
            // }}
            className="mb-6 text-lg font-bold text-gray-200 md:text-3xl"
          >
            Multiplayer Mode
          </h2>

          <p className="mx-auto mb-8 max-w-xl text-sm leading-relaxed text-gray-400 sm:mb-10 md:text-lg">
            Race against friends or challenge players worldwide in real-time
            typing battles. Create a room, invite your squad, or join an
            existing arena and prove your speed.
          </p>

          <div
            className={`mt-8 flex items-center justify-center sm:mt-10 ${
              showJoinInput ? "gap-4" : "gap-5 sm:gap-12"
            }`}
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
                ${
                  showJoinInput
                    ? "h-14 w-14 px-0"
                    : "min-w-32 px-5 py-3.5 sm:min-w-36 sm:px-7 sm:py-4"
                }
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
              <div className="hidden flex-col items-start md:flex">
                <div className="flex animate-in items-center gap-3 fade-in duration-300">
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
                    type="button"
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
                    aria-label="Close join room input"
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
              type="button"
              disabled={joining}
              onClick={handleJoinButtonClick}
              className={`
                min-w-32
                px-5
                py-3.5
                sm:min-w-36
                sm:px-8
                sm:py-4
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
                {showJoinInput
                  ? joining
                    ? "Joining..."
                    : "Join"
                  : "Join"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE JOIN MODAL */}
      {showMobileJoinModal && (
        <div
          className="
            fixed
            inset-0
            z-[1000]
            flex
            items-center
            justify-center
            bg-black/75
            px-4
            py-6
            backdrop-blur-sm
            md:hidden
          "
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-join-room-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeMobileJoinModal();
            }
          }}
        >
          <div
            className="
              relative
              w-full
              max-w-[380px]
              overflow-hidden
              rounded-3xl
              bg-[#181C22]
              p-6
              shadow-[0_25px_80px_rgba(0,0,0,0.65)]
            "
          >
            {/* Modal background glow */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-orange-500/15 blur-[60px]" />

            <div className="relative z-10">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-orange-400">
                    Multiplayer arena
                  </p>

                  <h2
                    id="mobile-join-room-title"
                    className="text-2xl font-bold text-white"
                  >
                    Join a room
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-gray-400">
                    Enter the room code shared by the room creator.
                  </p>
                </div>

                {/* CLOSE */}
                <button
                  type="button"
                  onClick={closeMobileJoinModal}
                  disabled={joining}
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-white/10
                    text-gray-300
                    transition-all
                    hover:bg-white/15
                    hover:text-white
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                  aria-label="Close join room modal"
                >
                  ✕
                </button>
              </div>

              <label
                htmlFor="mobile-room-code"
                className="mb-2 block text-sm font-semibold text-gray-200"
              >
                Room code
              </label>

              <input
                id="mobile-room-code"
                value={roomId}
                onChange={(e) => {
                  setRoomId(e.target.value.toUpperCase());

                  // if (joinError) setJoinError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !joining) {
                    handleJoinRoom();
                  }
                }}
                placeholder="Enter Room ID"
                autoFocus
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                disabled={joining}
                className="
                  h-14
                  w-full
                  rounded-2xl
                  bg-white/10
                  px-5
                  text-center
                  text-base
                  font-semibold
                  uppercase
                  tracking-[0.16em]
                  text-white
                  outline-none
                  placeholder:normal-case
                  placeholder:tracking-normal
                  placeholder:text-gray-500
                  focus:bg-white/[0.13]
                  focus:shadow-[0_0_20px_rgba(249,115,22,0.18)]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                  transition-all
                "
              />

              {/* <p
                className={`text-red-400 text-sm mt-2 ml-2 h-5 transition-opacity duration-200 ${
                  joinError ? "opacity-100" : "opacity-0"
                }`}
              >
                {joinError || "placeholder"}
              </p> */}

              <div className="mt-6 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleJoinRoom}
                  disabled={joining}
                  className={`
                    flex
                    min-h-12
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-full
                    bg-gradient-to-r
                    from-orange-500
                    to-orange-600
                    px-6
                    font-bold
                    text-white
                    transition-all
                    duration-300
                    hover:shadow-[0_0_25px_rgba(249,115,22,0.4)]
                    ${
                      joining
                        ? "cursor-not-allowed opacity-70"
                        : "hover:scale-[1.02]"
                    }
                  `}
                >
                  <HiUsers size={21} />

                  <span>{joining ? "Joining..." : "Join Room"}</span>
                </button>

                <button
                  type="button"
                  onClick={closeMobileJoinModal}
                  disabled={joining}
                  className="
                    min-h-11
                    w-full
                    rounded-full
                    bg-white/[0.06]
                    px-6
                    text-sm
                    font-semibold
                    text-gray-300
                    transition-all
                    hover:bg-white/10
                    hover:text-white
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MultiplayerHome;
