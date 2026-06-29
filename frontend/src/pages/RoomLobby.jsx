import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import socket from "../utils/socket";
import { useRoom } from "../context/RoomContext";

function RoomLobby() {
  const { room, loading, currentUser, socketConnected, socketError } = useRoom();

  const navigate = useNavigate();
  const { roomCode } = useParams();

  const currentUsername = currentUser?.username;

  const isHost =
    room?.players?.[0]?.username === currentUsername ||
    room?.createdByUsername === currentUsername;

  const currentPlayer = room?.players?.find(
    (player) => player.username === currentUsername
  );

  const allPlayersReady =
    room?.players?.length > 0 &&
    room.players.every((player) => player.isReady);

  const canStartRace =
    room?.status === "waiting" &&
    socketConnected &&
    allPlayersReady &&
    (isHost || room?.startPolicy === "anyone");

  useEffect(() => {
    if (!roomCode) return;

    const handleRaceStarted = () => {
      navigate(`/multiplayer/room/${roomCode}/race`);
    };

    socket.on("race-started", handleRaceStarted);

    return () => {
      socket.off("race-started", handleRaceStarted);
    };
  }, [roomCode, navigate]);

  const startRace = () => {
    if (!allPlayersReady) {
      alert("All players must be ready before starting the race.");
      return;
    }

    socket.emit("start-race", { roomCode }, (response) => {
      if (!response?.success) {
        alert(response?.message || "Unable to start race.");
      }
    });
  };

  const toggleReady = () => {
    if (!currentPlayer) {
      alert("You are not a member of this room.");
      return;
    }

    socket.emit("player-ready", {
      roomCode,
      isReady: !currentPlayer.isReady,
    });
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-white">
        Loading room...
      </div>
    );
  }

  if (!room) {
    return (
      <div className="h-full flex items-center justify-center text-red-500">
        Room not found
      </div>
    );
  }

  return (
    <div className="p-8 text-white">
      <div className="mb-8">
        <h1 className="text-4xl mb-3">{room.roomName}</h1>

        <p className="text-zinc-400">
          Room Code:{" "}
          <span className="text-white font-semibold">{room.roomCode}</span>
        </p>

        <p className="text-zinc-400">
          Status: <span className="text-white">{room.status}</span>
        </p>

        <p className="text-zinc-400">
          Socket:{" "}
          <span className={socketConnected ? "text-green-400" : "text-red-400"}>
            {socketConnected ? "Connected" : "Disconnected"}
          </span>
        </p>

        {socketError && (
          <p className="text-red-400 mt-2">Socket Error: {socketError}</p>
        )}

        <p className="text-zinc-400">
          Duration: <span className="text-white">{room.duration}s</span>
        </p>

        <p className="text-zinc-400">
          Players:{" "}
          <span className="text-white">
            {room.players?.length || 0}/{room.maxPlayers}
          </span>
        </p>

        {!allPlayersReady && (
          <p className="text-yellow-400 mt-2">
            Waiting for all players to be ready.
          </p>
        )}
      </div>

      <div className="space-y-3">
        {room.players.map((player, index) => {
          const host = index === 0 || player.username === room.createdByUsername;
          const isMe = player.username === currentUsername;

          return (
            <div
              key={player.user || player.username}
              className="bg-zinc-800 p-4 rounded flex justify-between items-center"
            >
              <div>
                <span className="font-medium">
                  {player.username}
                  {isMe ? " (You)" : ""}
                </span>

                {host && (
                  <span className="ml-2 text-xs bg-blue-600 px-2 py-1 rounded">
                    Host
                  </span>
                )}
              </div>

              <div className="flex gap-3 items-center">
                <span
                  className={`text-sm ${
                    player.isConnected ? "text-green-500" : "text-zinc-500"
                  }`}
                >
                  {player.isConnected ? "Online" : "Offline"}
                </span>

                <span
                  className={`text-sm ${
                    player.isReady ? "text-green-500" : "text-yellow-500"
                  }`}
                >
                  {player.isReady ? "Ready" : "Not Ready"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex gap-4">
        <button
          onClick={toggleReady}
          disabled={!socketConnected || room.status !== "waiting"}
          className="bg-zinc-700 px-6 py-3 rounded hover:bg-zinc-600 transition disabled:opacity-50"
        >
          {currentPlayer?.isReady ? "Mark Not Ready" : "Ready"}
        </button>

        {(isHost || room.startPolicy === "anyone") && (
          <button
            onClick={startRace}
            disabled={!canStartRace}
            className="bg-green-600 px-6 py-3 rounded hover:bg-green-700 transition disabled:opacity-50"
            title={!allPlayersReady ? "All players must be ready first" : ""}
          >
            Start Race
          </button>
        )}
      </div>
    </div>
  );
}

export default RoomLobby;