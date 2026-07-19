import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  HiOutlineArrowPath,
  HiOutlineBolt,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineHome,
  HiOutlineTrophy,
  HiOutlineUsers,
  HiOutlineXCircle,
} from "react-icons/hi2";
import { FaCrown, FaMedal } from "react-icons/fa6";
import { IoGameControllerOutline } from "react-icons/io5";

import socket from "../utils/socket";
import { useRoom } from "../context/RoomContext";
import api from "../utils/api";

/*
 * Safely converts a value into a number.
 */
const toNumber = (value, fallback = 0) => {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue)
    ? parsedValue
    : fallback;
};

/*
 * Restricts a value to a given range.
 */
const clamp = (value, minimum, maximum) => {
  return Math.min(
    maximum,
    Math.max(minimum, toNumber(value))
  );
};

/*
 * Converts the room duration into MM:SS or HH:MM:SS.
 */
const formatDuration = (totalSeconds = 0) => {
  const safeSeconds = Math.max(
    0,
    Math.floor(toNumber(totalSeconds))
  );

  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor(
    (safeSeconds % 3600) / 60
  );
  const seconds = safeSeconds % 60;

  const pad = (value) =>
    String(value).padStart(2, "0");

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(
      seconds
    )}`;
  }

  return `${pad(minutes)}:${pad(seconds)}`;
};

/*
 * Finds the complete room player corresponding
 * to a leaderboard entry.
 *
 * The results API currently contains only:
 * rank, userId, username, progress, wpm,
 * accuracy, finished and finishedAt.
 *
 * Additional fields such as profilePhoto,
 * correctChars and wrongChars are taken from
 * room.players.
 */
const findRoomPlayer = (
  leaderboardPlayer,
  roomPlayers = []
) => {
  const leaderboardUserId =
    leaderboardPlayer?.userId ||
    leaderboardPlayer?.user ||
    leaderboardPlayer?._id;

  return roomPlayers.find((roomPlayer) => {
    const roomPlayerUserId =
      roomPlayer?.user ||
      roomPlayer?.userId ||
      roomPlayer?._id;

    if (
      leaderboardUserId &&
      roomPlayerUserId &&
      String(leaderboardUserId) ===
        String(roomPlayerUserId)
    ) {
      return true;
    }

    return (
      leaderboardPlayer?.username &&
      roomPlayer?.username ===
        leaderboardPlayer.username
    );
  });
};

/*
 * Normalizes one leaderboard entry and enriches
 * it with information from room.players.
 */
const normalizePlayer = (
  leaderboardPlayer = {},
  index = 0,
  roomPlayers = []
) => {
  const roomPlayer =
    findRoomPlayer(
      leaderboardPlayer,
      roomPlayers
    ) || {};

  return {
    userId:
      leaderboardPlayer.userId ||
      leaderboardPlayer.user ||
      leaderboardPlayer._id ||
      roomPlayer.user ||
      roomPlayer.userId ||
      roomPlayer._id ||
      null,

    /*
     * Preserve the rank returned by the results API.
     */
    rank:
      toNumber(
        leaderboardPlayer.rank,
        index + 1
      ) || index + 1,

    username:
      leaderboardPlayer.username ||
      roomPlayer.username ||
      "Unknown player",

    /*
     * Your player model uses profilePhoto.
     */
    profilePhoto:
      leaderboardPlayer.profilePhoto ||
      roomPlayer.profilePhoto ||
      "",

    progress: clamp(
      leaderboardPlayer.progress ??
        roomPlayer.progress,
      0,
      100
    ),

    wpm: Math.max(
      0,
      toNumber(
        leaderboardPlayer.wpm ??
          roomPlayer.wpm
      )
    ),

    accuracy: clamp(
      leaderboardPlayer.accuracy ??
        roomPlayer.accuracy,
      0,
      100
    ),

    correctChars: Math.max(
      0,
      toNumber(
        leaderboardPlayer.correctChars ??
          roomPlayer.correctChars
      )
    ),

    wrongChars: Math.max(
      0,
      toNumber(
        leaderboardPlayer.wrongChars ??
          roomPlayer.wrongChars
      )
    ),

    /*
     * backspaceCount is not currently present in
     * the API response or the shown room player
     * objects, so it safely falls back to zero.
     */
    backspaceCount: Math.max(
      0,
      toNumber(
        leaderboardPlayer.backspaceCount ??
          roomPlayer.backspaceCount
      )
    ),

    finished: Boolean(
      leaderboardPlayer.finished ??
        roomPlayer.finished
    ),

    finishedAt:
      leaderboardPlayer.finishedAt ||
      roomPlayer.finishedAt ||
      null,
  };
};

/*
 * For completed results, preserve the API rank.
 */
const normalizeFinalLeaderboard = (
  players = [],
  roomPlayers = []
) => {
  if (!Array.isArray(players)) {
    return [];
  }

  return players
    .map((player, index) =>
      normalizePlayer(
        player,
        index,
        roomPlayers
      )
    )
    .sort(
      (first, second) =>
        first.rank - second.rank
    );
};

/*
 * Used only as a fallback when the final results
 * API cannot be loaded.
 */
const buildFallbackLeaderboard = (
  roomPlayers = []
) => {
  return [...roomPlayers]
    .map((player, index) =>
      normalizePlayer(
        player,
        index,
        roomPlayers
      )
    )
    .sort((first, second) => {
      if (
        first.finished !== second.finished
      ) {
        return (
          Number(second.finished) -
          Number(first.finished)
        );
      }

      if (
        second.progress !== first.progress
      ) {
        return (
          second.progress - first.progress
        );
      }

      if (second.wpm !== first.wpm) {
        return second.wpm - first.wpm;
      }

      return (
        second.accuracy - first.accuracy
      );
    })
    .map((player, index) => ({
      ...player,
      rank: index + 1,
    }));
};

function ResultPage() {
  const { room, loading } = useRoom();
  const navigate = useNavigate();

  const [leaderboard, setLeaderboard] =
    useState([]);

  const [
    fetchingResults,
    setFetchingResults,
  ] = useState(false);

  const [resultError, setResultError] =
    useState("");

  const [hasFinalResults, setHasFinalResults] =
    useState(false);

  const roomCode = room?.roomCode;
  const roomStatus = room?.status;

  /*
   * Fetch the finalized leaderboard from the API.
   *
   * Do not depend on room.players here. A player
   * leaving may update room.players, but that
   * should not trigger the final results to be
   * rebuilt or removed.
   */
  useEffect(() => {
    if (!roomCode) {
      return;
    }

    let isMounted = true;

    const fetchResults = async () => {
      setFetchingResults(true);
      setResultError("");

      try {
        const response = await api.get(
          `/rooms/${roomCode}/results`,
          {
            withCredentials: true,
          }
        );

        if (!isMounted) {
          return;
        }

        const responseRoom =
          response.data?.room || room;

        const responseRoomPlayers =
          responseRoom?.players || [];

        const serverLeaderboard =
          response.data?.leaderboard || [];

        setLeaderboard(
          normalizeFinalLeaderboard(
            serverLeaderboard,
            responseRoomPlayers
          )
        );

        setHasFinalResults(true);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error(
          "Failed to fetch results:",
          error?.response?.data || error
        );

        setResultError(
          error?.response?.data?.message ||
            "Unable to load the finalized results. Showing the latest stored room standings."
        );

        setLeaderboard(
          buildFallbackLeaderboard(
            room?.players || []
          )
        );

        /*
         * The fallback is still treated as fixed
         * when the room is completed.
         */
        setHasFinalResults(
          roomStatus === "completed"
        );
      } finally {
        if (isMounted) {
          setFetchingResults(false);
        }
      }
    };

    fetchResults();

    return () => {
      isMounted = false;
    };
  }, [roomCode, roomStatus]);

  /*
   * Listen to live leaderboard updates only while
   * the race is still active.
   *
   * Once final results have been received, ignore
   * all later leaderboard-update events. This
   * prevents disconnected players from disappearing.
   */
  useEffect(() => {
    const handleLeaderboardUpdate = (
      data
    ) => {
      if (
        roomStatus === "completed" ||
        hasFinalResults
      ) {
        return;
      }

      if (!Array.isArray(data)) {
        return;
      }

      setLeaderboard(
        buildFallbackLeaderboard(data)
      );
    };

    socket.on(
      "leaderboard-update",
      handleLeaderboardUpdate
    );

    return () => {
      socket.off(
        "leaderboard-update",
        handleLeaderboardUpdate
      );
    };
  }, [roomStatus, hasFinalResults]);

  /*
   * Prefer the winner ID stored in the room.
   * Fall back to rank one.
   */
  const winner = useMemo(() => {
    if (leaderboard.length === 0) {
      return null;
    }

    if (room?.winner) {
      const savedWinner =
        leaderboard.find(
          (player) =>
            String(player.userId) ===
            String(room.winner)
        );

      if (savedWinner) {
        return savedWinner;
      }
    }

    return leaderboard.find(
      (player) => player.rank === 1
    ) || leaderboard[0];
  }, [leaderboard, room?.winner]);

  /*
   * The top performers section includes ranks 1–3.
   */
  const topPerformers = useMemo(() => {
    return leaderboard.filter(
      (player) => player.rank <= 3
    );
  }, [leaderboard]);

  /*
   * The remaining leaderboard begins with rank 4,
   * so the first three players are not repeated.
   */
  const remainingPlayers = useMemo(() => {
    return leaderboard.filter(
      (player) => player.rank >= 4
    );
  }, [leaderboard]);

  const raceSummary = useMemo(() => {
    if (leaderboard.length === 0) {
      return {
        totalPlayers: 0,
        finishedPlayers: 0,
        averageWpm: 0,
        averageAccuracy: 0,
        highestWpm: 0,
        totalCorrectChars: 0,
        totalWrongChars: 0,
      };
    }

    const totalPlayers =
      leaderboard.length;

    const finishedPlayers =
      leaderboard.filter(
        (player) => player.finished
      ).length;

    const totalWpm =
      leaderboard.reduce(
        (total, player) =>
          total + player.wpm,
        0
      );

    const totalAccuracy =
      leaderboard.reduce(
        (total, player) =>
          total + player.accuracy,
        0
      );

    const totalCorrectChars =
      leaderboard.reduce(
        (total, player) =>
          total + player.correctChars,
        0
      );

    const totalWrongChars =
      leaderboard.reduce(
        (total, player) =>
          total + player.wrongChars,
        0
      );

    const highestWpm = Math.max(
      0,
      ...leaderboard.map(
        (player) => player.wpm
      )
    );

    return {
      totalPlayers,
      finishedPlayers,
      averageWpm: Math.round(
        totalWpm / totalPlayers
      ),
      averageAccuracy: Math.round(
        totalAccuracy / totalPlayers
      ),
      highestWpm,
      totalCorrectChars,
      totalWrongChars,
    };
  }, [leaderboard]);

  const handleStartNewGame = () => {
    navigate("/multiplayer/create");
  };

  const handleReturnToMultiplayer = () => {
    navigate("/multiplayer");
  };

  if (loading || fetchingResults) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-[#181C22] text-white">
        <div className="flex flex-col items-center gap-4">
          <span className="h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-orange-500" />

          <p className="font-sans text-sm text-zinc-400">
            Preparing final results...
          </p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center bg-[#181C22] px-5 text-center text-white">
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-red-500/10 text-red-400">
          <HiOutlineXCircle size={32} />
        </span>

        <h1 className="mt-5 text-2xl font-bold">
          Room not found
        </h1>

        <p className="mt-2 max-w-md font-sans text-sm leading-6 text-zinc-500">
          The room may have expired or may no
          longer be available.
        </p>

        <button
          type="button"
          onClick={handleReturnToMultiplayer}
          className="mt-6 rounded-xl bg-orange-500 px-5 py-3 font-sans text-sm font-semibold text-[#181C22] transition hover:bg-orange-400"
        >
          Return to multiplayer
        </button>
      </div>
    );
  }

  return (
    <main className="relative min-h-[calc(100vh-80px)] overflow-x-hidden bg-[#181C22] text-white">
      <div className="pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-orange-500/[0.07] blur-[120px]" />

      <div className="pointer-events-none absolute -right-32 top-1/3 h-96 w-96 rounded-full bg-orange-600/[0.05] blur-[130px]" />

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

      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 px-3 py-1.5 font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-orange-400">
                <HiOutlineTrophy size={14} />
                Race completed
              </span>

              <span className="rounded-full bg-black/20 px-3 py-1.5 font-mono text-[10px] text-zinc-500">
                Room {room.roomCode}
              </span>
            </div>

            <h1 className="text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl md:text-5xl">
              Final Results
            </h1>

            <p className="mt-2 font-sans text-sm text-zinc-500 sm:text-base">
              {room.roomName ||
                "Multiplayer Typing Race"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Link
              to="/"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white/[0.05] px-4 font-sans text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.09] hover:text-white"
            >
              <HiOutlineHome size={18} />
              Home
            </Link>

            <button
              type="button"
              onClick={handleReturnToMultiplayer}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white/[0.05] px-4 font-sans text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.09] hover:text-white"
            >
              <IoGameControllerOutline
                size={19}
              />
              Multiplayer
            </button>

            <button
              type="button"
              onClick={handleStartNewGame}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 font-sans text-sm font-bold text-[#181C22] shadow-[0_15px_40px_rgba(249,115,22,0.18)] transition hover:-translate-y-0.5 hover:bg-orange-400"
            >
              <HiOutlineArrowPath size={18} />
              New Game
            </button>
          </div>
        </header>

        {resultError && (
          <div className="mb-6 rounded-2xl bg-orange-500/[0.07] px-4 py-3 font-sans text-xs leading-5 text-orange-300">
            {resultError}
          </div>
        )}

        {leaderboard.length === 0 ? (
          <EmptyResults
            onStartNewGame={handleStartNewGame}
          />
        ) : (
          <>
            {winner && (
              <WinnerBanner winner={winner} />
            )}

            <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <SummaryCard
                label="Players"
                value={
                  raceSummary.totalPlayers
                }
                icon={
                  <HiOutlineUsers size={19} />
                }
                iconClass="text-orange-400"
              />

              <SummaryCard
                label="Finished"
                value={
                  raceSummary.finishedPlayers
                }
                icon={
                  <HiOutlineCheckCircle
                    size={19}
                  />
                }
                iconClass="text-emerald-400"
              />

              <SummaryCard
                label="Duration"
                value={formatDuration(
                  room.duration
                )}
                icon={
                  <HiOutlineClock size={19} />
                }
                iconClass="text-sky-400"
              />

              <SummaryCard
                label="Average WPM"
                value={
                  raceSummary.averageWpm
                }
                icon={
                  <HiOutlineBolt size={19} />
                }
                iconClass="text-orange-400"
              />

              <SummaryCard
                label="Top WPM"
                value={
                  raceSummary.highestWpm
                }
                icon={
                  <HiOutlineTrophy size={19} />
                }
                iconClass="text-yellow-400"
              />

              <SummaryCard
                label="Avg. Accuracy"
                value={`${raceSummary.averageAccuracy}%`}
                icon={
                  <HiOutlineCheckCircle
                    size={19}
                  />
                }
                iconClass="text-emerald-400"
              />
            </section>

            {topPerformers.length > 0 && (
              <section className="mb-8">
                <div className="mb-4 flex items-center gap-2">
                  <FaMedal className="text-orange-400" />

                  <div>
                    <h2 className="text-xl font-bold">
                      Top Performers
                    </h2>

                    <p className="mt-1 font-sans text-xs text-zinc-600">
                      The highest-ranked players
                      from this race.
                    </p>
                  </div>
                </div>

                <div
                  className={`grid grid-cols-1 gap-4 ${
                    topPerformers.length === 2
                      ? "md:grid-cols-2"
                      : topPerformers.length >= 3
                        ? "md:grid-cols-3"
                        : ""
                  }`}
                >
                  {topPerformers.map(
                    (player) => (
                      <PodiumCard
                        key={
                          player.userId ||
                          player.username
                        }
                        player={player}
                      />
                    )
                  )}
                </div>
              </section>
            )}

            {remainingPlayers.length > 0 && (
              <section>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold">
                      Complete Leaderboard
                    </h2>

                    <p className="mt-1 font-sans text-xs text-zinc-600">
                      Rankings beginning from
                      fourth place.
                    </p>
                  </div>

                  <span className="rounded-full bg-black/20 px-3 py-1.5 font-sans text-[10px] text-zinc-500">
                    {remainingPlayers.length}{" "}
                    remaining
                  </span>
                </div>

                <div className="space-y-3">
                  {remainingPlayers.map(
                    (player) => (
                      <LeaderboardRow
                        key={
                          player.userId ||
                          `${player.rank}-${player.username}`
                        }
                        player={player}
                      />
                    )
                  )}
                </div>
              </section>
            )}

            {remainingPlayers.length === 0 && (
              <div className="rounded-2xl bg-black/15 px-5 py-4 text-center font-sans text-xs text-zinc-500">
                All participants are already
                displayed in the top performers
                section.
              </div>
            )}

            <div className="mt-10 flex flex-col items-center justify-center gap-3 rounded-3xl bg-black/15 px-5 py-7 text-center sm:flex-row">
              <div className="sm:mr-auto sm:text-left">
                <h3 className="font-semibold text-white">
                  Ready for another race?
                </h3>

                <p className="mt-1 font-sans text-xs text-zinc-500">
                  Create a new room or return to
                  the multiplayer arena.
                </p>
              </div>

              <button
                type="button"
                onClick={handleReturnToMultiplayer}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-white/[0.05] px-5 font-sans text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.09] hover:text-white sm:w-auto"
              >
                <IoGameControllerOutline
                  size={19}
                />
                Multiplayer Home
              </button>

              <button
                type="button"
                onClick={handleStartNewGame}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 font-sans text-sm font-bold text-[#181C22] transition hover:bg-orange-400 sm:w-auto"
              >
                <HiOutlineArrowPath size={18} />
                Start New Game
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function EmptyResults({ onStartNewGame }) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl bg-black/15 px-5 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-2xl bg-orange-500/10 text-orange-400">
        <HiOutlineUsers size={31} />
      </span>

      <h2 className="mt-5 text-2xl font-bold">
        No results available
      </h2>

      <p className="mt-2 max-w-md font-sans text-sm leading-6 text-zinc-500">
        No player results were recorded for
        this race.
      </p>

      <button
        type="button"
        onClick={onStartNewGame}
        className="mt-6 rounded-xl bg-orange-500 px-5 py-3 font-sans text-sm font-semibold text-[#181C22] transition hover:bg-orange-400"
      >
        Start a new game
      </button>
    </div>
  );
}

function WinnerBanner({ winner }) {
  return (
    <section className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500/20 via-orange-500/[0.07] to-black/10 p-5 sm:p-7">
      <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-orange-500/20 blur-[75px]" />

      <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <PlayerAvatar
            player={winner}
            sizeClass="h-16 w-16 sm:h-20 sm:w-20"
            textClass="text-2xl"
            square
          />

          <div>
            <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-orange-400">
              Race winner
            </p>

            <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">
              {winner.username}
            </h2>

            <p className="mt-1 font-sans text-xs text-zinc-400 sm:text-sm">
              Ranked first with{" "}
              <span className="font-semibold text-orange-400">
                {formatMetric(winner.wpm)} WPM
              </span>{" "}
              and{" "}
              <span className="font-semibold text-emerald-400">
                {formatMetric(winner.accuracy)}%
                accuracy
              </span>
              .
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:min-w-[350px]">
          <SummaryMetric
            label="WPM"
            value={formatMetric(winner.wpm)}
            icon={<HiOutlineBolt size={17} />}
            valueClass="text-orange-400"
          />

          <SummaryMetric
            label="Accuracy"
            value={`${formatMetric(
              winner.accuracy
            )}%`}
            icon={
              <HiOutlineCheckCircle size={17} />
            }
            valueClass="text-emerald-400"
          />

          <SummaryMetric
            label="Progress"
            value={`${formatMetric(
              winner.progress
            )}%`}
            icon={
              <HiOutlineTrophy size={17} />
            }
            valueClass="text-yellow-400"
          />
        </div>
      </div>
    </section>
  );
}

function PlayerAvatar({
  player,
  sizeClass = "h-14 w-14",
  textClass = "text-xl",
  square = false,
}) {
  const borderRadius = square
    ? "rounded-2xl"
    : "rounded-full";

  return (
    <div className="relative shrink-0">
      {player.profilePhoto ? (
        <img
          src={player.profilePhoto}
          alt={`${player.username} profile`}
          className={`${sizeClass} ${borderRadius} object-cover`}
        />
      ) : (
        <span
          className={`grid ${sizeClass} ${borderRadius} place-items-center bg-orange-500/10 font-black uppercase text-orange-400 ${textClass}`}
        >
          {player.username
            ?.charAt(0)
            .toUpperCase() || "?"}
        </span>
      )}

      {player.rank === 1 && square && (
        <span className="absolute -right-2 -top-3 grid h-8 w-8 rotate-12 place-items-center rounded-full bg-yellow-400 text-[#181C22] shadow-lg">
          <FaCrown size={17} />
        </span>
      )}
    </div>
  );
}

function SummaryMetric({
  label,
  value,
  icon,
  valueClass = "text-white",
}) {
  return (
    <div className="rounded-2xl bg-black/20 px-3 py-3 text-center">
      <div className="mb-1 flex items-center justify-center gap-1.5 text-zinc-500">
        {icon}
      </div>

      <strong
        className={`block text-lg font-bold tabular-nums ${valueClass}`}
      >
        {value}
      </strong>

      <span className="font-sans text-[9px] uppercase tracking-wide text-zinc-600">
        {label}
      </span>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  iconClass = "text-orange-400",
}) {
  return (
    <article className="rounded-2xl bg-black/15 px-3 py-4 text-center">
      <span
        className={`mx-auto mb-2 grid h-9 w-9 place-items-center rounded-xl bg-white/[0.04] ${iconClass}`}
      >
        {icon}
      </span>

      <strong className="block text-xl font-bold tabular-nums text-white">
        {value}
      </strong>

      <span className="mt-1 block font-sans text-[9px] uppercase tracking-[0.1em] text-zinc-600">
        {label}
      </span>
    </article>
  );
}

function PodiumCard({ player }) {
  const podiumStyle =
    player.rank === 1
      ? {
          container:
            "bg-gradient-to-b from-yellow-500/[0.12] to-black/15",
          badge:
            "bg-yellow-400 text-[#181C22]",
          icon: "text-yellow-400",
          label: "Champion",
        }
      : player.rank === 2
        ? {
            container:
              "bg-gradient-to-b from-zinc-300/[0.08] to-black/15",
            badge:
              "bg-zinc-300 text-[#181C22]",
            icon: "text-zinc-300",
            label: "Runner-up",
          }
        : {
            container:
              "bg-gradient-to-b from-orange-700/[0.12] to-black/15",
            badge:
              "bg-orange-700 text-white",
            icon: "text-orange-500",
            label: "Third place",
          };

  return (
    <article
      className={`relative overflow-hidden rounded-3xl p-5 ${podiumStyle.container}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="relative">
          <PlayerAvatar
            player={player}
            square
          />

          <span
            className={`absolute -bottom-2 -right-2 grid h-7 w-7 place-items-center rounded-full text-xs font-black ${podiumStyle.badge}`}
          >
            {player.rank}
          </span>
        </div>

        {player.rank === 1 ? (
          <FaCrown
            size={24}
            className={podiumStyle.icon}
          />
        ) : (
          <FaMedal
            size={23}
            className={podiumStyle.icon}
          />
        )}
      </div>

      <p className="mt-5 font-sans text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
        {podiumStyle.label}
      </p>

      <h3 className="mt-1 truncate text-lg font-bold text-white">
        {player.username}
      </h3>

      <p
        className={`mt-1 font-sans text-[10px] ${
          player.finished
            ? "text-emerald-400"
            : "text-zinc-500"
        }`}
      >
        {player.finished
          ? "Completed the passage"
          : "Time expired before completion"}
      </p>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <SmallMetric
          label="WPM"
          value={formatMetric(player.wpm)}
          valueClass="text-orange-400"
        />

        <SmallMetric
          label="Accuracy"
          value={`${formatMetric(
            player.accuracy
          )}%`}
          valueClass="text-emerald-400"
        />

        <SmallMetric
          label="Progress"
          value={`${formatMetric(
            player.progress
          )}%`}
        />
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-black/30">
        <div
          className={`h-full rounded-full ${
            player.finished
              ? "bg-emerald-400"
              : "bg-orange-500"
          }`}
          style={{
            width: `${player.progress}%`,
          }}
        />
      </div>
    </article>
  );
}

function SmallMetric({
  label,
  value,
  valueClass = "text-white",
}) {
  return (
    <div className="rounded-xl bg-black/20 px-2 py-2 text-center">
      <strong
        className={`block text-sm font-bold tabular-nums ${valueClass}`}
      >
        {value}
      </strong>

      <span className="font-sans text-[8px] uppercase tracking-wide text-zinc-600">
        {label}
      </span>
    </div>
  );
}

function LeaderboardRow({ player }) {
  return (
    <article className="relative overflow-hidden rounded-2xl bg-black/15 p-4 transition hover:bg-black/20 sm:p-5">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 bg-orange-500/[0.025]"
        style={{
          width: `${player.progress}%`,
        }}
      />

      <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="flex min-w-0 items-center gap-3 lg:w-[280px]">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/[0.05] text-sm font-black text-zinc-400">
            {player.rank}
          </span>

          <PlayerAvatar
            player={player}
            sizeClass="h-11 w-11"
            textClass="text-base"
          />

          <div className="min-w-0">
            <h3 className="truncate font-semibold text-white">
              {player.username}
            </h3>

            <p
              className={`mt-1 flex items-center gap-1.5 font-sans text-[10px] ${
                player.finished
                  ? "text-emerald-400"
                  : "text-zinc-500"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  player.finished
                    ? "bg-emerald-400"
                    : "bg-zinc-600"
                }`}
              />

              {player.finished
                ? "Finished the race"
                : "Did not finish"}
            </p>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-3 gap-2 sm:grid-cols-6">
          <ResultMetric
            label="Progress"
            value={`${formatMetric(
              player.progress
            )}%`}
          />

          <ResultMetric
            label="WPM"
            value={formatMetric(player.wpm)}
            valueClass="text-orange-400"
          />

          <ResultMetric
            label="Accuracy"
            value={`${formatMetric(
              player.accuracy
            )}%`}
            valueClass="text-emerald-400"
          />

          <ResultMetric
            label="Correct"
            value={player.correctChars}
            valueClass="text-emerald-400"
          />

          <ResultMetric
            label="Wrong"
            value={player.wrongChars}
            valueClass="text-red-400"
          />

          <ResultMetric
            label="Backspaces"
            value={player.backspaceCount}
          />
        </div>
      </div>

      <div className="relative z-10 mt-4 h-1.5 overflow-hidden rounded-full bg-black/30">
        <div
          className={`h-full rounded-full ${
            player.finished
              ? "bg-emerald-400"
              : "bg-gradient-to-r from-orange-600 to-orange-400"
          }`}
          style={{
            width: `${player.progress}%`,
          }}
        />
      </div>
    </article>
  );
}

function ResultMetric({
  label,
  value,
  valueClass = "text-white",
}) {
  return (
    <div className="rounded-xl bg-black/15 px-2 py-2.5 text-center">
      <strong
        className={`block text-sm font-bold tabular-nums ${valueClass}`}
      >
        {value}
      </strong>

      <span className="mt-0.5 block font-sans text-[8px] uppercase tracking-wide text-zinc-600">
        {label}
      </span>
    </div>
  );
}

/*
 * Keeps decimal values such as 0.23 visible,
 * while displaying whole numbers without .00.
 */
function formatMetric(value) {
  const numericValue = toNumber(value);

  if (Number.isInteger(numericValue)) {
    return numericValue;
  }

  return Number(numericValue.toFixed(2));
}

export default ResultPage;
