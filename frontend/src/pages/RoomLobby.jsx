import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Check,
  Clock,
  Copy,
  Crown,
  Play,
  Shield,
  Users,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";

import socket from "../utils/socket";
import { useRoom } from "../context/RoomContext";
import { toast } from "react-toastify";
import { useState } from "react";
import ConfirmModal from "../components/ui/ConfirmModal";

function RoomLobby() {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const { room, loading, currentUser, socketConnected, socketError } = useRoom();

  const navigate = useNavigate();
  const { roomCode } = useParams();

  const currentUsername = currentUser?.username;

  const isPlayerHost = (player, index) =>
    index === 0 || player.username === room?.createdByUsername;

  const isHost =
    room?.players?.[0]?.username === currentUsername ||
    room?.createdByUsername === currentUsername;

  const currentPlayer = room?.players?.find(
    (player) => player.username === currentUsername
  );

  const nonHostPlayers = room?.players?.filter(
    (player, index) => !isPlayerHost(player, index)
  );

  const allPlayersReady =
    room?.players?.length > 1 &&
    nonHostPlayers?.length > 0 &&
    nonHostPlayers.every((player) => player.isReady);

  const canStartRace =
    room?.status === "waiting" &&
    socketConnected &&
    allPlayersReady &&
    (isHost || room?.startPolicy === "anyone");


  useEffect(() => {
  if (!roomCode || !room) return;

  window.history.pushState({ roomLobby: true }, "");

  const handleBackButton = () => {
    setShowCancelModal(true);

    // Prevent browser from leaving immediately
    window.history.pushState({ roomLobby: true }, "");
  };

  window.addEventListener("popstate", handleBackButton);

  return () => {
    window.removeEventListener("popstate", handleBackButton);
  };
}, [roomCode, room]);

  useEffect(() => {
    if (!roomCode) return;

    const handleRaceStarted = () => {
      navigate(`/multiplayer/room/${roomCode}/race`, { replace: true });
    };

    const handleRoomCancelled = (data) => {
      toast.info(data?.message || "Room was cancelled by host.");
      navigate("/multiplayer", { replace: true });
    };
    
    socket.on("race-started", handleRaceStarted);
    socket.on("room-cancelled", handleRoomCancelled);

    return () => {
      socket.off("race-started", handleRaceStarted);
      socket.off("room-cancelled", handleRoomCancelled);
    };
  }, [roomCode, navigate]);

  const startRace = () => {
    if (!allPlayersReady) {
      toast.error("All non-host players must be ready before starting the race.");
      return;
    }

    socket.emit("start-race", { roomCode }, (response) => {
      if (!response?.success) {
        toast.info(response?.message || "Unable to start race.");
      }
    });
  };

  const toggleReady = () => {
    if (!currentPlayer) {
      toast.info("You are not a member of this room.");
      return;
    }

    socket.emit("player-ready", {
      roomCode,
      isReady: !currentPlayer.isReady,
    });
  };

  const cancelRoom = () => {
    setShowCancelModal(true);
  };

const confirmCancelRoom = () => {
  setShowCancelModal(false);

  if (isHost) {
    socket.emit("cancel-room", { roomCode }, (response) => {
      if (!response?.success) {
        toast.error(response?.message || "Unable to cancel room.");
        return;
      }

      navigate("/multiplayer", { replace: true });
    });

    return;
  }

  socket.emit("leave-room", { roomCode }, (response) => {
    if (!response?.success) {
      toast.error(response?.message || "Unable to leave room.");
      return;
    }

    navigate("/multiplayer", { replace: true });
  });
};

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(room.roomCode);
      toast.success("Copied")
    } catch {
      toast.error("Unable to copy room code.");
    }
  };

  const getInitials = (username = "") => {
    return username
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const formatDuration = (seconds = 0) => {
    if (seconds < 60) return `${seconds}s`;

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (remainingSeconds === 0) return `${minutes} min`;

    return `${minutes}m ${remainingSeconds}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#181C22] flex items-center justify-center text-white">
        Loading room...
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-[#181C22] flex items-center justify-center text-red-400">
        Room not found
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#181C22] text-white py-2">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4">
          {/* <p className="text-2xl text-center text-orange-400 underline font-semibold mb-2">
            Multiplayer Lobby
          </p> */}

          {/* <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            {room.roomName}
          </h1> */}

          {socketError && (
            <p className="text-sm text-red-400">Error: {socketError}</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          <div>
            <div className="flex items-center justify-between mb-5 px-3">
              <h2 className="text-lg font-semibold">Room Info</h2>

              <span className="text-xs px-3 py-1 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30 capitalize">
                {room.status}
              </span>
            </div>
            <aside className="bg-[#20252D] border border-white/10 rounded-2xl p-5 h-fit">
              <div className="space-y-4">
                <div className="bg-[#181C22] rounded-xl p-4 border border-white/10">
                  <p className="text-xs text-zinc-400 mb-1">Room Name</p>
                  <p className="text-xl font-bold tracking-widest text-orange-400">
                    {room?.roomName}
                  </p>
                </div>

                <div className="bg-[#181C22] rounded-xl p-4 border border-white/10">
                  <p className="text-xs text-zinc-400 mb-1">Room Code</p>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xl font-bold tracking-widest text-orange-400">
                      {room.roomCode}
                    </span>

                    <button
                      type="button"
                      onClick={copyRoomCode}
                      className="p-2 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 transition"
                      title="Copy room code"
                    >
                      <Copy size={17} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#181C22] rounded-xl p-4 border border-white/10">
                    <Clock className="text-orange-400 mb-3" size={20} />
                    <p className="text-xs text-zinc-400">Duration</p>
                    <p className="font-semibold">
                      {formatDuration(room.duration)}
                    </p>
                  </div>

                  <div className="bg-[#181C22] rounded-xl p-4 border border-white/10">
                    <Users className="text-orange-400 mb-3" size={20} />
                    <p className="text-xs text-zinc-400">Players</p>
                    <p className="font-semibold">
                      {room.players?.length || 0}/{room.maxPlayers}
                    </p>
                  </div>
                </div>

                <div className="bg-[#181C22] rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-3">
                    {socketConnected ? (
                      <Wifi className="text-green-400" size={20} />
                    ) : (
                      <WifiOff className="text-red-400" size={20} />
                    )}

                    <div>
                      {/* <p className="text-xs text-zinc-400">Socket</p> */}
                      <p
                        className={`font-semibold ${
                          socketConnected ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {socketConnected ? "Connected" : "Disconnected"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* <div className="bg-[#181C22] rounded-xl p-4 border border-white/10">
                  <Shield className="text-orange-400 mb-3" size={20} />
                  <p className="text-xs text-zinc-400">Start Policy</p>
                  <p className="font-semibold capitalize">
                    {room.startPolicy === "anyone"
                      ? "Anyone can start"
                      : "Host only"}
                  </p>
                </div> */}

                {!allPlayersReady && room.status === "waiting" && (
                  <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-300">
                    Waiting for players to be ready.
                  </div>
                )}
              </div>
            </aside>
          </div>

          <main>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Players</h2>

              <span className="text-sm text-zinc-400">
                {room.players?.length || 0} joined
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 px-4">
              {room.players.map((player, index) => {
                const host = isPlayerHost(player, index);
                const isMe = player.username === currentUsername;

                return (
                  <div
                    key={player.user || player.username}
                    className="relative bg-[#20252D] border border-white/10 rounded-2xl p-4 hover:border-orange-500/40 transition"
                  >
                    <div
                      className={`absolute top-4 right-4 flex items-center gap-1 text-[11px] px-2 py-1 rounded-full border ${
                        player.isConnected
                          ? "bg-green-500/10 text-green-400 border-green-500/30"
                          : "bg-zinc-500/10 text-zinc-400 border-zinc-500/30"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          player.isConnected ? "bg-green-400" : "bg-zinc-500"
                        }`}
                      />
                      {player.isConnected ? "Online" : "Offline"}
                    </div>

                    {host && (
                      <span
                        className="inline-flex absolute -left-3 -top-1.5 -rotate-12 items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-orange-500 text-white"
                        title="Host"
                      >
                        <Crown size={12} />
                        Host
                      </span>
                    )}

                    <div className="flex items-center gap-4 pr-20">
                      <div className="h-14 w-14 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center overflow-hidden text-orange-400 font-bold">
                        {player.profilePhoto ? (
                          <img
                            src={player.profilePhoto}
                            alt={player.username}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          getInitials(player.username)
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold truncate">
                            {player.username}
                            {isMe ? " (You)" : ""}
                          </p>
                        </div>

                        <div className="mt-2">
                          {/* {host ? (
                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30">
                              Host controls race
                            </span>
                          ) :  */}
                          {player.isReady ? (
                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/30">
                              <span className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center text-white">
                                <Check size={11} />
                              </span>
                              Ready
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
                              <span className="h-2 w-2 rounded-full bg-yellow-400" />
                              Waiting
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row justify-end gap-3">
              <button
                type="button"
                onClick={cancelRoom}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#20252D] border border-white/10 text-zinc-300 hover:text-white hover:border-red-500/40 hover:bg-red-500/10 transition"
              >
                <X size={18} />
                Cancel
              </button>

              {!isHost && (
                <button
                  type="button"
                  onClick={toggleReady}
                  disabled={!socketConnected || room.status !== "waiting"}
                  className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed ${
                    currentPlayer?.isReady
                      ? "bg-yellow-500 text-black hover:bg-yellow-400"
                      : "bg-orange-500 text-white hover:bg-orange-600"
                  }`}
                >
                  {currentPlayer?.isReady ? (
                    <>
                      <X size={18} />
                      Cancel Ready
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      Ready
                    </>
                  )}
                </button>
              )}

              {(isHost || room.startPolicy === "anyone") && (
                <button
                  type="button"
                  onClick={startRace}
                  disabled={!canStartRace}
                  title={!allPlayersReady ? "Players must be ready first" : ""}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play size={18} />
                  Start Race
                </button>
              )}
            </div>
          </main>
        </div>
      </div>
      <ConfirmModal
        open={showCancelModal}
        title={isHost ? "Dissolve Room" : "Leave Room"}
        message={
          isHost
            ? "You are the host. Cancelling this room will remove it permanently and every player will be returned to the multiplayer lobby."
            : "Are you sure you want to leave this room?"
        }
        confirmText={isHost ? "Dissolve Room" : "Leave"}
        confirmColor="bg-orange-500 hover:bg-orange-600"
        onCancel={() => setShowCancelModal(false)}
        onConfirm={confirmCancelRoom}
      />
    </div>
  );
}

export default RoomLobby;