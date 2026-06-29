import { useEffect, useState } from "react";
import socket from "../utils/socket";
import { useRoom } from "../context/RoomContext";
import api from "../utils/api";

function ResultPage() {
  const { room, loading } = useRoom();

  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    if (!room?.roomCode) return;

    const fetchResults = async () => {
      try {
        const res = await api.get(`/rooms/${room.roomCode}/results`, {
          withCredentials: true,
        });

        setLeaderboard(res.data.leaderboard || []);
      } catch (error) {
        console.error("Failed to fetch results:", error);

        const fallbackLeaderboard = [...(room.players || [])]
          .sort((a, b) => (b.wpm || 0) - (a.wpm || 0))
          .map((player, index) => ({
            rank: index + 1,
            username: player.username,
            progress: player.progress || 0,
            wpm: player.wpm || 0,
            accuracy: player.accuracy || 0,
            finished: player.finished || false,
          }));

        setLeaderboard(fallbackLeaderboard);
      }
    };

    fetchResults();
  }, [room]);

  useEffect(() => {
    const handleLeaderboardUpdate = (data) => {
      setLeaderboard(data);
    };

    socket.on("leaderboard-update", handleLeaderboardUpdate);

    return () => {
      socket.off("leaderboard-update", handleLeaderboardUpdate);
    };
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-white">
        Loading results...
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
      <h1 className="text-4xl mb-2">Final Results</h1>

      <h2 className="text-zinc-400 mb-8">{room.roomName}</h2>

      <div className="space-y-4">
        {leaderboard.map((player) => (
          <div
            key={player.userId || player.rank}
            className="bg-zinc-800 p-5 rounded-lg flex justify-between items-center"
          >
            <div>
              <h3 className="text-xl font-semibold">
                #{player.rank} {player.username}
              </h3>

              <p className="text-sm text-zinc-400">
                {player.finished ? "Finished" : "Not finished"}
              </p>
            </div>

            <div className="flex gap-8">
              <div>
                <p className="text-sm text-zinc-400">Progress</p>
                <p className="text-lg">{player.progress || 0}%</p>
              </div>

              <div>
                <p className="text-sm text-zinc-400">WPM</p>
                <p className="text-lg">{player.wpm || 0}</p>
              </div>

              <div>
                <p className="text-sm text-zinc-400">Accuracy</p>
                <p className="text-lg">{player.accuracy || 0}%</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {leaderboard.length > 0 && (
        <div className="mt-8 bg-green-900/20 border border-green-700 rounded-lg p-4">
          <h2 className="text-xl font-bold text-green-400">
            🏆 Winner: {leaderboard[0].username}
          </h2>

          <p className="text-zinc-300 mt-1">
            {leaderboard[0].wpm || 0} WPM • {leaderboard[0].accuracy || 0}%
            Accuracy
          </p>
        </div>
      )}
    </div>
  );
}

export default ResultPage;