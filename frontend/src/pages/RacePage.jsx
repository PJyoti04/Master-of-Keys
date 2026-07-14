import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import {
  HiOutlineBolt,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineSignal,
  HiOutlineTrophy,
  HiOutlineUsers,
} from "react-icons/hi2";
import { IoChevronDown } from "react-icons/io5";

import socket from "../utils/socket";
import { useRoom } from "../context/RoomContext";

import TypingEngine from "../components/multiplayer/TypingEngine";

const normalizePlayer = (player = {}) => ({
  username: player.username || "Unknown player",

  profileAvatar:
    player.profileAvatar ||
    player.avatar ||
    null,

  progress: Number(player.progress) || 0,
  wpm: Number(player.wpm) || 0,
  accuracy: Number(player.accuracy) || 0,

  correctChars:
    Number(player.correctChars) || 0,

  wrongChars:
    Number(player.wrongChars) || 0,

  backspaceCount:
    Number(player.backspaceCount) || 0,

  finished: Boolean(player.finished),

  isConnected:
    player.isConnected !== false,
});

function RacePage() {
  const {
    room,
    loading,
    currentUser,
  } = useRoom();

  const navigate = useNavigate();

  const [players, setPlayers] = useState([]);
  const [raceStarted, setRaceStarted] =
    useState(false);

  const [timeLeft, setTimeLeft] =
    useState(0);

  const [
    showMobileRanking,
    setShowMobileRanking,
  ] = useState(false);

  const lastProgressSentRef = useRef(0);

  const roomCode = room?.roomCode;

  /*
   * All players must receive the same text
   * from the server through room.currentText.
   */
  const textToType = useMemo(() => {
    return room?.currentText?.trim() || "";
  }, [room?.currentText]);

  /*
   * Race duration provided by the server.
   *
   * Change this fallback if your backend uses
   * another property name.
   */
  const raceTimeLimit = useMemo(() => {
    return Number(
      room?.timeLimit ??
        room?.duration ??
        room?.raceDuration ??
        0
    );
  }, [
    room?.timeLimit,
    room?.duration,
    room?.raceDuration,
  ]);

  /*
   * Server timestamp indicating when the race started.
   */
  const raceStartedAt = useMemo(() => {
    return (
      room?.startedAt ||
      room?.raceStartedAt ||
      null
    );
  }, [
    room?.startedAt,
    room?.raceStartedAt,
  ]);

  /*
   * Calculate time from the shared server start time.
   *
   * This avoids timer drift when:
   * - a player joins late
   * - a browser tab becomes inactive
   * - clients load at different times
   */
  const calculateRemainingTime =
    useCallback(() => {
      if (
        !raceStartedAt ||
        !raceTimeLimit
      ) {
        return 0;
      }

      const startedAtMilliseconds =
        new Date(raceStartedAt).getTime();

      if (
        Number.isNaN(
          startedAtMilliseconds
        )
      ) {
        return 0;
      }

      const raceEndsAt =
        startedAtMilliseconds +
        raceTimeLimit * 1000;

      return Math.max(
        0,
        Math.ceil(
          (raceEndsAt - Date.now()) /
            1000
        )
      );
    }, [
      raceStartedAt,
      raceTimeLimit,
    ]);

  const formatTime = (
    totalSeconds
  ) => {
    const safeSeconds = Math.max(
      0,
      Number(totalSeconds) || 0
    );

    const hours = Math.floor(
      safeSeconds / 3600
    );

    const minutes = Math.floor(
      (safeSeconds % 3600) / 60
    );

    const seconds =
      safeSeconds % 60;

    const pad = (value) =>
      String(value).padStart(2, "0");

    if (hours > 0) {
      return `${pad(hours)}:${pad(
        minutes
      )}:${pad(seconds)}`;
    }

    return `${pad(minutes)}:${pad(
      seconds
    )}`;
  };

  /*
   * Initialize room state.
   */
  useEffect(() => {
    if (!room) {
      return;
    }

    if (room.status === "waiting") {
      navigate(
        `/multiplayer/room/${room.roomCode}`,
        {
          replace: true,
        }
      );

      return;
    }

    if (
      room.status === "completed"
    ) {
      navigate(
        `/multiplayer/room/${room.roomCode}/results`,
        {
          replace: true,
        }
      );

      return;
    }

    const isRunning =
      room.status === "running";

    setRaceStarted(isRunning);

    if (isRunning) {
      setTimeLeft(
        calculateRemainingTime()
      );
    }

    setPlayers(
      Array.isArray(room.players)
        ? room.players.map(
            normalizePlayer
          )
        : []
    );
  }, [
    room,
    navigate,
    calculateRemainingTime,
  ]);

  /*
   * Keep the timer synchronized with the
   * server-provided startedAt timestamp.
   *
   * The interval runs more frequently than
   * once per second so the displayed second
   * changes near the correct boundary.
   */
  useEffect(() => {
    if (
      !raceStarted ||
      !raceStartedAt ||
      !raceTimeLimit
    ) {
      return undefined;
    }

    const updateTimer = () => {
      setTimeLeft(
        calculateRemainingTime()
      );
    };

    updateTimer();

    const interval =
      window.setInterval(
        updateTimer,
        250
      );

    return () => {
      window.clearInterval(interval);
    };
  }, [
    raceStarted,
    raceStartedAt,
    raceTimeLimit,
    calculateRemainingTime,
  ]);

  /*
   * Socket event listeners.
   */
  useEffect(() => {
    if (!roomCode) {
      return undefined;
    }

    const handleProgress = (
      playerData
    ) => {
      if (!playerData?.username) {
        return;
      }

      setPlayers(
        (previousPlayers) => {
          const playerIndex =
            previousPlayers.findIndex(
              (player) =>
                player.username ===
                playerData.username
            );

          if (playerIndex === -1) {
            return [
              ...previousPlayers,
              normalizePlayer(
                playerData
              ),
            ];
          }

          const updatedPlayers = [
            ...previousPlayers,
          ];

          updatedPlayers[playerIndex] =
            normalizePlayer({
              ...updatedPlayers[
                playerIndex
              ],
              ...playerData,
            });

          return updatedPlayers;
        }
      );
    };

    const handleLeaderboardUpdate = (
      leaderboard
    ) => {
      if (
        !Array.isArray(leaderboard)
      ) {
        return;
      }

      setPlayers(
        leaderboard.map(
          normalizePlayer
        )
      );
    };

    /*
     * The server should send startedAt and
     * timeLimit with this event.
     *
     * RoomContext should also update room,
     * but local timer data can be handled here.
     */
    const handleRaceStarted = (
      raceData = {}
    ) => {
      setRaceStarted(true);

      const eventStartedAt =
        raceData.startedAt ||
        raceData.raceStartedAt;

      const eventTimeLimit =
        Number(
          raceData.timeLimit ??
            raceData.duration ??
            raceData.raceDuration
        ) || 0;

      if (
        eventStartedAt &&
        eventTimeLimit > 0
      ) {
        const startedAtMilliseconds =
          new Date(
            eventStartedAt
          ).getTime();

        const endsAt =
          startedAtMilliseconds +
          eventTimeLimit * 1000;

        setTimeLeft(
          Math.max(
            0,
            Math.ceil(
              (endsAt - Date.now()) /
                1000
            )
          )
        );
      }
    };

    const handleRaceCompleted = () => {
      setTimeLeft(0);

      navigate(
        `/multiplayer/room/${roomCode}/results`,
        {
          replace: true,
        }
      );
    };

    const handlePlayerDisconnected = (
      playerData
    ) => {
      if (!playerData?.username) {
        return;
      }

      setPlayers(
        (previousPlayers) =>
          previousPlayers.map(
            (player) =>
              player.username ===
              playerData.username
                ? {
                    ...player,
                    isConnected: false,
                  }
                : player
          )
      );
    };

    const handlePlayerReconnected = (
      playerData
    ) => {
      if (!playerData?.username) {
        return;
      }

      setPlayers(
        (previousPlayers) =>
          previousPlayers.map(
            (player) =>
              player.username ===
              playerData.username
                ? {
                    ...player,
                    isConnected: true,
                  }
                : player
          )
      );
    };

    socket.on(
      "player-progress",
      handleProgress
    );

    socket.on(
      "leaderboard-update",
      handleLeaderboardUpdate
    );

    socket.on(
      "race-started",
      handleRaceStarted
    );

    socket.on(
      "race-completed",
      handleRaceCompleted
    );

    socket.on(
      "player-disconnected",
      handlePlayerDisconnected
    );

    socket.on(
      "player-reconnected",
      handlePlayerReconnected
    );

    return () => {
      socket.off(
        "player-progress",
        handleProgress
      );

      socket.off(
        "leaderboard-update",
        handleLeaderboardUpdate
      );

      socket.off(
        "race-started",
        handleRaceStarted
      );

      socket.off(
        "race-completed",
        handleRaceCompleted
      );

      socket.off(
        "player-disconnected",
        handlePlayerDisconnected
      );

      socket.off(
        "player-reconnected",
        handlePlayerReconnected
      );
    };
  }, [
    roomCode,
    navigate,
  ]);

  /*
   * Send the current player's typing
   * progress to the server.
   */
  const handleTypingProgress = (
    stats
  ) => {
    if (
      !roomCode ||
      !raceStarted ||
      timeLeft <= 0
    ) {
      return;
    }

    const now = Date.now();

    /*
     * Prevent accidental duplicate events.
     */
    if (
      now -
        lastProgressSentRef.current <
      80
    ) {
      return;
    }

    lastProgressSentRef.current = now;

    socket.emit(
      "typing-progress",
      {
        roomCode,

        progress:
          stats.progress,

        wpm:
          stats.wpm,

        accuracy:
          stats.accuracy,

        correctChars:
          stats.correctChars,

        wrongChars:
          stats.wrongChars,

        backspaceCount:
          stats.backspaceCount,
      }
    );
  };

  /*
   * Tell the server when the local player
   * has completed the text.
   */
  const handleFinish = (stats) => {
    if (
      !roomCode ||
      timeLeft <= 0
    ) {
      return;
    }

    socket.emit(
      "player-finished",
      {
        roomCode,

        progress: 100,

        wpm:
          stats.wpm,

        accuracy:
          stats.accuracy,

        correctChars:
          stats.correctChars,

        wrongChars:
          stats.wrongChars,

        backspaceCount:
          stats.backspaceCount,
      }
    );
  };

  /*
   * Rank players by:
   * 1. Finished state
   * 2. Progress
   * 3. WPM
   * 4. Accuracy
   */
  const sortedPlayers =
    useMemo(() => {
      return [...players].sort(
        (first, second) => {
          if (
            first.finished !==
            second.finished
          ) {
            return (
              Number(
                second.finished
              ) -
              Number(
                first.finished
              )
            );
          }

          if (
            second.progress !==
            first.progress
          ) {
            return (
              second.progress -
              first.progress
            );
          }

          if (
            second.wpm !==
            first.wpm
          ) {
            return (
              second.wpm -
              first.wpm
            );
          }

          return (
            second.accuracy -
            first.accuracy
          );
        }
      );
    }, [players]);

  const currentPlayer =
    useMemo(() => {
      return players.find(
        (player) =>
          player.username ===
          currentUser?.username
      );
    }, [
      players,
      currentUser?.username,
    ]);

  const finishedPlayers =
    players.filter(
      (player) =>
        player.finished
    ).length;

  const averageProgress =
    players.length > 0
      ? Math.round(
          players.reduce(
            (
              total,
              player
            ) =>
              total +
              player.progress,
            0
          ) / players.length
        )
      : 0;

  /*
   * The server remains responsible for
   * emitting race-completed.
   *
   * The local timer only disables typing
   * when it reaches zero.
   */
  const typingDisabled =
    !raceStarted ||
    timeLeft <= 0;

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-[#181C22] text-white">
        <div className="flex items-center gap-3 text-sm text-zinc-400">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-700 border-t-orange-500" />

          Loading race...
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-[#181C22] px-5 text-center text-red-400">
        Room not found.
      </div>
    );
  }

  return (
    <main className="relative min-h-[calc(100vh-80px)] overflow-x-hidden bg-[#181C22] text-white">
      {/* Decorative background */}
      <div className="pointer-events-none absolute -left-28 top-20 h-72 w-72 rounded-full bg-orange-600/[0.06] blur-[110px]" />

      <div className="pointer-events-none absolute -right-32 top-1/3 h-80 w-80 rounded-full bg-orange-500/[0.05] blur-[120px]" />

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          opacity-20
          [background-image:linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)]
          [background-size:48px_48px]
        "
      />

      <div className="relative z-10 mx-auto w-full max-w-[1500px] px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
        {/* Race header */}
        <header className="mb-4 flex flex-col gap-4 sm:mb-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3 py-1 font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-orange-400">
                <HiOutlineSignal
                  size={13}
                  className={
                    raceStarted
                      ? "animate-pulse"
                      : ""
                  }
                />

                {raceStarted
                  ? "Live race"
                  : "Preparing race"}
              </span>

              <span className="rounded-full bg-black/20 px-3 py-1 font-mono text-[10px] text-zinc-500">
                Room {room.roomCode}
              </span>
            </div>

            <h1 className="truncate text-2xl font-black tracking-[-0.04em] text-white sm:text-3xl">
              {room.roomName ||
                "Typing Race"}
            </h1>

            <p className="mt-1 font-sans text-xs text-zinc-500 sm:text-sm">
              Type the shared passage and
              follow every player&apos;s
              progress in real time.
            </p>
          </div>

          {/* Race summary */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            {/* Timer */}
            <div
              className={`rounded-xl bg-black/20 px-3 py-2 text-center sm:min-w-[100px] ${
                timeLeft <= 10 &&
                raceStarted
                  ? "bg-red-500/[0.06]"
                  : ""
              }`}
            >
              <div className="flex items-center justify-center gap-1.5">
                <HiOutlineClock
                  size={15}
                  className={
                    timeLeft <= 10 &&
                    raceStarted
                      ? "animate-pulse text-red-400"
                      : "text-orange-400"
                  }
                />

                <strong
                  className={`text-sm font-bold tabular-nums sm:text-base ${
                    timeLeft <= 10 &&
                    raceStarted
                      ? "animate-pulse text-red-400"
                      : "text-orange-400"
                  }`}
                >
                  {formatTime(timeLeft)}
                </strong>
              </div>

              <span className="font-sans text-[9px] uppercase tracking-wide text-zinc-600">
                Time left
              </span>
            </div>

            {/* Players */}
            <div className="rounded-xl bg-black/20 px-3 py-2 text-center sm:min-w-[86px]">
              <div className="flex items-center justify-center gap-1.5">
                <HiOutlineUsers
                  size={15}
                  className="text-orange-400"
                />

                <strong className="text-sm tabular-nums">
                  {players.length}
                </strong>
              </div>

              <span className="font-sans text-[9px] uppercase tracking-wide text-zinc-600">
                Players
              </span>
            </div>

            {/* Finished */}
            <div className="rounded-xl bg-black/20 px-3 py-2 text-center sm:min-w-[86px]">
              <div className="flex items-center justify-center gap-1.5">
                <HiOutlineCheckCircle
                  size={15}
                  className="text-emerald-400"
                />

                <strong className="text-sm tabular-nums">
                  {finishedPlayers}
                </strong>
              </div>

              <span className="font-sans text-[9px] uppercase tracking-wide text-zinc-600">
                Finished
              </span>
            </div>

            {/* Average race progress */}
            <div className="rounded-xl bg-black/20 px-3 py-2 text-center sm:min-w-[86px]">
              <div className="flex items-center justify-center gap-1.5">
                <HiOutlineBolt
                  size={15}
                  className="text-orange-400"
                />

                <strong className="text-sm tabular-nums">
                  {averageProgress}%
                </strong>
              </div>

              <span className="font-sans text-[9px] uppercase tracking-wide text-zinc-600">
                Race
              </span>
            </div>
          </div>
        </header>

        {/* Time expired message */}
        {raceStarted &&
          timeLeft <= 0 && (
            <div className="mb-4 rounded-2xl bg-red-500/[0.08] px-4 py-3 text-center font-sans text-sm text-red-300">
              Time is over. Waiting for
              the server to finalize the
              race results.
            </div>
          )}

        {/* Mobile ranking summary */}
        <div className="mb-4 lg:hidden">
          <button
            type="button"
            onClick={() =>
              setShowMobileRanking(
                (previous) =>
                  !previous
              )
            }
            className="flex w-full items-center justify-between rounded-2xl bg-black/20 px-4 py-3 text-left"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-orange-500/10 text-orange-400">
                <HiOutlineTrophy
                  size={19}
                />
              </span>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">
                  Live ranking
                </p>

                <p className="truncate font-sans text-[10px] text-zinc-500">
                  {currentPlayer
                    ? `You: ${Math.round(
                        currentPlayer.progress
                      )}% · ${Math.round(
                        currentPlayer.wpm
                      )} WPM`
                    : `${players.length} players racing`}
                </p>
              </div>
            </div>

            <IoChevronDown
              size={18}
              className={`shrink-0 text-orange-400 transition-transform ${
                showMobileRanking
                  ? "rotate-180"
                  : "rotate-0"
              }`}
            />
          </button>

          {showMobileRanking && (
            <div className="mt-2 max-h-[300px] space-y-2 overflow-y-auto rounded-2xl bg-black/10 p-2">
              {sortedPlayers.map(
                (
                  player,
                  index
                ) => (
                  <PlayerRankingCard
                    key={
                      player.username
                    }
                    player={player}
                    rank={index + 1}
                    isCurrentUser={
                      currentUser?.username ===
                      player.username
                    }
                    compact
                  />
                )
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_350px] xl:grid-cols-[minmax(0,1fr)_390px]">
          {/* Typing race */}
          <section className="min-w-0">
            {raceStarted ? (
              textToType ? (
                <TypingEngine
                  text={textToType}
                  onProgress={
                    handleTypingProgress
                  }
                  onFinish={
                    handleFinish
                  }
                  disabled={
                    typingDisabled
                  }
                />
              ) : (
                <div className="flex min-h-[320px] items-center justify-center rounded-2xl bg-black/20 px-5 text-center">
                  <div>
                    <p className="font-semibold text-red-400">
                      Race text is
                      unavailable.
                    </p>

                    <p className="mt-2 max-w-md font-sans text-xs leading-5 text-zinc-500">
                      Assign a random
                      paragraph to
                      room.currentText
                      before emitting the
                      race-started event.
                    </p>
                  </div>
                </div>
              )
            ) : (
              <div className="flex min-h-[320px] items-center justify-center rounded-2xl bg-black/20 px-5 text-center sm:min-h-[400px]">
                <div>
                  <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-orange-500/10 text-orange-400">
                    <HiOutlineSignal
                      size={27}
                      className="animate-pulse"
                    />
                  </span>

                  <h2 className="mt-5 text-xl font-bold">
                    Waiting for the race
                  </h2>

                  <p className="mt-2 font-sans text-sm text-zinc-500">
                    Typing will become
                    available as soon as
                    the race starts.
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Desktop live ranking */}
          <aside className="sticky top-4 hidden max-h-[calc(100vh-110px)] overflow-hidden rounded-2xl bg-black/15 lg:block">
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-2">
                <HiOutlineTrophy
                  size={19}
                  className="text-orange-400"
                />

                <h2 className="font-semibold">
                  Live Ranking
                </h2>
              </div>

              <span className="rounded-full bg-orange-500/10 px-2.5 py-1 font-sans text-[9px] uppercase tracking-wide text-orange-400">
                Live
              </span>
            </div>

            <div className="scrollbar-hidden max-h-[calc(100vh-180px)] space-y-2 overflow-y-auto px-2 pb-3">
              {sortedPlayers.length >
              0 ? (
                sortedPlayers.map(
                  (
                    player,
                    index
                  ) => (
                    <PlayerRankingCard
                      key={
                        player.username
                      }
                      player={player}
                      rank={index + 1}
                      isCurrentUser={
                        currentUser?.username ===
                        player.username
                      }
                    />
                  )
                )
              ) : (
                <p className="px-4 py-8 text-center font-sans text-sm text-zinc-600">
                  No players available.
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function PlayerRankingCard({
  player,
  rank,
  isCurrentUser,
  compact = false,
}) {
  const progress = Math.min(
    Math.max(
      Number(player.progress) || 0,
      0
    ),
    100
  );

  const rankStyle =
    rank === 1
      ? "bg-amber-500/15 text-amber-400"
      : rank === 2
        ? "bg-zinc-300/10 text-zinc-300"
        : rank === 3
          ? "bg-orange-700/15 text-orange-400"
          : "bg-white/[0.04] text-zinc-500";

  return (
    <article
      className={`relative overflow-hidden rounded-xl transition ${
        isCurrentUser
          ? "bg-orange-500/[0.08] shadow-[inset_0_0_0_1px_rgba(249,115,22,0.18)]"
          : "bg-[#181C22]/70"
      } ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 bg-orange-500/[0.025] transition-[width] duration-200"
        style={{
          width: `${progress}%`,
        }}
      />

      <div className="relative z-10">
        <div className="flex items-center gap-3">
          <span
            className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-bold ${rankStyle}`}
          >
            {rank}
          </span>

          {player.profileAvatar ? (
            <img
              src={
                player.profileAvatar
              }
              alt={`${player.username} profile`}
              className="h-9 w-9 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-orange-500/10 text-sm font-bold uppercase text-orange-400">
              {player.username?.charAt(
                0
              ) || "?"}
            </span>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold text-white">
                {player.username}
              </p>

              {isCurrentUser && (
                <span className="rounded-full bg-orange-500/15 px-1.5 py-0.5 font-sans text-[8px] font-semibold uppercase text-orange-400">
                  You
                </span>
              )}
            </div>

            <div className="mt-0.5 flex items-center gap-2 font-sans text-[9px] text-zinc-600">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  player.isConnected
                    ? "bg-emerald-400"
                    : "bg-red-400"
                }`}
              />

              <span>
                {player.finished
                  ? "Finished"
                  : player.isConnected
                    ? "Racing"
                    : "Disconnected"}
              </span>
            </div>
          </div>

          <div className="shrink-0 text-right">
            <strong className="block text-sm tabular-nums text-white">
              {Math.round(
                player.wpm || 0
              )}
            </strong>

            <span className="font-sans text-[8px] uppercase tracking-wide text-zinc-600">
              WPM
            </span>
          </div>
        </div>

        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/30">
          <div
            className={`h-full rounded-full transition-[width] duration-200 ${
              player.finished
                ? "bg-emerald-400"
                : "bg-gradient-to-r from-orange-600 to-orange-400"
            }`}
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        <div className="mt-2 flex items-center justify-between gap-2 font-sans text-[9px] text-zinc-500">
          <span className="tabular-nums">
            {Math.round(progress)}%
            complete
          </span>

          <span className="tabular-nums">
            {Math.round(
              player.accuracy || 0
            )}
            % accuracy
          </span>
        </div>

        {!compact && (
          <div className="mt-2 flex items-center gap-3 font-sans text-[9px] text-zinc-600">
            <span>
              <strong className="text-emerald-400">
                {player.correctChars ||
                  0}
              </strong>{" "}
              correct
            </span>

            <span>
              <strong className="text-red-400">
                {player.wrongChars ||
                  0}
              </strong>{" "}
              wrong
            </span>
          </div>
        )}
      </div>
    </article>
  );
}

export default RacePage;
