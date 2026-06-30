import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import socket from "../utils/socket";
import { useRoom } from "../context/RoomContext";

import TypingEngine from "../components/multiplayer/TypingEngine";

function RacePage() {
  const { room, loading, currentUser } = useRoom();
  const navigate = useNavigate();

  const [players, setPlayers] = useState([]);
  const [raceStarted, setRaceStarted] = useState(false);

  const roomCode = room?.roomCode;

  const textToType = useMemo(() => {
    return (
      room?.currentText ||
      "The quick brown fox jumps over the lazy dog while the rain falls softly outside."
    );
  }, [room?.currentText]);

  useEffect(() => {
    if (!room) return;

    if (room.status === "waiting") {
      navigate(`/multiplayer/room/${room.roomCode}`, {replace: true});
      return;
    }

    if (room.status === "completed") {
      navigate(`/multiplayer/room/${room.roomCode}/results`, { replace: true });
      return;
    }

    setRaceStarted(room.status === "running");

    setPlayers(
      room.players.map((player) => ({
        username: player.username,
        progress: player.progress || 0,
        wpm: player.wpm || 0,
        accuracy: player.accuracy || 0,
        correctChars: player.correctChars || 0,
        wrongChars: player.wrongChars || 0,
        finished: player.finished || false,
      }))
    );
  }, [room, navigate]);

  useEffect(() => {
    if (!roomCode) return;

    const handleProgress = (playerData) => {
      setPlayers((prev) => {
        const index = prev.findIndex(
          (p) => p.username === playerData.username
        );

        if (index === -1) {
          return [
            ...prev,
            {
              username: playerData.username,
              progress: playerData.progress || 0,
              wpm: playerData.wpm || 0,
              accuracy: playerData.accuracy || 0,
              correctChars: playerData.correctChars || 0,
              wrongChars: playerData.wrongChars || 0,
              finished: playerData.finished || false,
            },
          ];
        }

        const updated = [...prev];

        updated[index] = {
          ...updated[index],
          ...playerData,
          progress: playerData.progress ?? updated[index].progress ?? 0,
          wpm: playerData.wpm ?? updated[index].wpm ?? 0,
          accuracy: playerData.accuracy ?? updated[index].accuracy ?? 0,
          correctChars:
            playerData.correctChars ?? updated[index].correctChars ?? 0,
          wrongChars: playerData.wrongChars ?? updated[index].wrongChars ?? 0,
          finished: playerData.finished ?? updated[index].finished ?? false,
        };

        return updated;
      });
    };

    const handleLeaderboardUpdate = (leaderboard) => {
      if (!Array.isArray(leaderboard)) return;

      setPlayers(
        leaderboard.map((player) => ({
          username: player.username,
          progress: player.progress || 0,
          wpm: player.wpm || 0,
          accuracy: player.accuracy || 0,
          correctChars: player.correctChars || 0,
          wrongChars: player.wrongChars || 0,
          finished: player.finished || false,
        }))
      );
    };

    const handleRaceStarted = () => {
      setRaceStarted(true);
    };

    const handleRaceCompleted = () => {
      navigate(`/multiplayer/room/${roomCode}/results`);
    };

    socket.on("player-progress", handleProgress);
    socket.on("leaderboard-update", handleLeaderboardUpdate);
    socket.on("race-started", handleRaceStarted);
    socket.on("race-completed", handleRaceCompleted);

    return () => {
      socket.off("player-progress", handleProgress);
      socket.off("leaderboard-update", handleLeaderboardUpdate);
      socket.off("race-started", handleRaceStarted);
      socket.off("race-completed", handleRaceCompleted);
    };
  }, [roomCode, navigate]);

  const handleTypingProgress = (stats) => {
    if (!roomCode || !raceStarted) return;

    socket.emit("typing-progress", {
      roomCode,
      progress: stats.progress,
      wpm: stats.wpm,
      accuracy: stats.accuracy,
      correctChars: stats.correctChars,
      wrongChars: stats.wrongChars,
    });
  };

  const handleFinish = (stats) => {
    if (!roomCode) return;

    socket.emit("player-finished", {
      roomCode,
      progress: 100,
      wpm: stats.wpm,
      accuracy: stats.accuracy,
      correctChars: stats.correctChars,
      wrongChars: stats.wrongChars,
    });
  };

  const sortedPlayers = [...players].sort((a, b) => {
    if ((b.progress || 0) !== (a.progress || 0)) {
      return (b.progress || 0) - (a.progress || 0);
    }

    if ((b.wpm || 0) !== (a.wpm || 0)) {
      return (b.wpm || 0) - (a.wpm || 0);
    }

    return (b.accuracy || 0) - (a.accuracy || 0);
  });

  if (loading) {
    return <div className="text-white p-8">Loading...</div>;
  }

  if (!room) {
    return <div className="text-red-500 p-8">Room not found</div>;
  }

  return (
    <div className="p-8 text-white">
      <h1 className="text-3xl mb-2">Race In Progress</h1>

      <h2 className="mb-8 text-zinc-400">{room.roomName}</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {raceStarted ? (
            <TypingEngine
              text={textToType}
              onProgress={handleTypingProgress}
              onFinish={handleFinish}
            />
          ) : (
            <div className="bg-zinc-900 p-8 rounded-lg text-zinc-400">
              Waiting for race to start...
            </div>
          )}
        </div>

        <div>
          <h3 className="text-xl mb-4">Live Ranking</h3>

          <div className="space-y-4">
            {sortedPlayers.map((player, index) => (
              <div key={player.username} className="bg-zinc-900 p-4 rounded-lg">
                <div className="flex justify-between gap-4">
                  <span>
                    #{index + 1} {player.username}
                    {currentUser?.username === player.username ? " (You)" : ""}
                  </span>

                  <span>{Math.round(player.wpm || 0)} WPM</span>
                </div>

                <div className="mt-2 h-2 bg-zinc-700 rounded">
                  <div
                    className="h-full bg-green-500 rounded"
                    style={{
                      width: `${Math.min(player.progress || 0, 100)}%`,
                    }}
                  />
                </div>

                <div className="mt-2 flex justify-between text-xs text-zinc-400">
                  <span>Progress: {Math.round(player.progress || 0)}%</span>
                  <span>Accuracy: {Math.round(player.accuracy || 0)}%</span>
                </div>

                {player.finished && (
                  <div className="mt-2 text-xs text-green-400">Finished</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RacePage;