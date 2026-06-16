import { useEffect, useState } from "react";
import socket from "../utils/socket";
import { useRoom } from "../context/RoomContext";

function RacePage() {
  const { room, loading } = useRoom();

  const [players, setPlayers] = useState([]);

  useEffect(() => {
    if (!room) return;

    setPlayers(
      room.players.map((player) => ({
        userId: player.user,
        username: player.username,
        progress: player.progress || 0,
        wpm: player.wpm || 0,
      }))
    );
  }, [room]);

  useEffect(() => {
    const handleProgress = (playerData) => {
      setPlayers((prev) => {
        const index = prev.findIndex(
          (p) => p.userId === playerData.userId
        );

        if (index === -1) {
          return [...prev, playerData];
        }

        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          ...playerData,
        };

        return updated;
      });
    };

    socket.on("player-progress", handleProgress);

    return () => {
      socket.off(
        "player-progress",
        handleProgress
      );
    };
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-white">
        Loading race...
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
      <h1 className="text-3xl mb-2">
        Race In Progress
      </h1>

      <h2 className="mb-8 text-zinc-400">
        {room.roomName}
      </h2>

      <div className="space-y-6">
        {players.map((player) => (
          <div
            key={player.userId}
            className="bg-zinc-900 p-4 rounded-lg"
          >
            <div className="flex justify-between mb-2">
              <span>{player.username}</span>

              <div className="flex gap-4">
                <span>
                  {player.progress || 0}%
                </span>

                <span>
                  {player.wpm || 0} WPM
                </span>
              </div>
            </div>

            <div className="h-3 bg-zinc-800 rounded overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-200"
                style={{
                  width: `${
                    player.progress || 0
                  }%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RacePage;