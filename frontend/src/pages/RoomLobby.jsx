import { useNavigate, useParams } from "react-router-dom";
import socket from "../utils/socket";
import { useRoom } from "../context/RoomContext";

function RoomLobby() {
  const { room, loading } = useRoom();

  const navigate = useNavigate();
  const { roomCode } = useParams();

  const startRace = () => {
    socket.emit("start-race", roomCode);

    navigate(`/multiplayer/room/${roomCode}/race`);
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
      <h1 className="text-4xl mb-4">
        {room.roomName}
      </h1>

      <h2 className="mb-8">
        Room Code : {room.roomCode}
      </h2>

      <div className="space-y-3">
        {room.players.map((player) => (
          <div
            key={player.user}
            className="bg-zinc-800 p-4 rounded flex justify-between items-center"
          >
            <span>{player.username}</span>

            <span
              className={`text-sm ${
                player.isReady
                  ? "text-green-500"
                  : "text-yellow-500"
              }`}
            >
              {player.isReady ? "Ready" : "Not Ready"}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={startRace}
        className="mt-8 bg-green-600 px-6 py-3 rounded hover:bg-green-700 transition"
      >
        Start Race
      </button>
    </div>
  );
}

export default RoomLobby;