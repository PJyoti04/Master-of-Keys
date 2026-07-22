import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  Check,
  Clock,
  Copy,
  Crown,
  Play,
  Users,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import { toast } from "react-toastify";

import socket from "../utils/socket";
import { useRoom } from "../context/RoomContext";
import ConfirmModal from "../components/ui/ConfirmModal";

function RoomLobby() {
  const [
    showCancelModal,
    setShowCancelModal,
  ] = useState(false);

  const {
    room,
    loading,
    currentUser,
    socketConnected,
    socketError,
  } = useRoom();

  const navigate = useNavigate();
  const { roomCode } = useParams();

  const currentUsername =
    currentUser?.username;

  const isPlayerHost = (
    player,
    index,
  ) =>
    index === 0 ||
    player.username ===
      room?.createdByUsername;

  const isHost =
    room?.players?.[0]?.username ===
      currentUsername ||
    room?.createdByUsername ===
      currentUsername;

  const currentPlayer =
    room?.players?.find(
      (player) =>
        player.username ===
        currentUsername,
    );

  const nonHostPlayers =
    useMemo(() => {
      if (
        !Array.isArray(
          room?.players,
        )
      ) {
        return [];
      }

      return room.players.filter(
        (player, index) =>
          !isPlayerHost(
            player,
            index,
          ),
      );
    }, [
      room?.players,
      room?.createdByUsername,
    ]);

  const allPlayersReady =
    room?.players?.length > 1 &&
    nonHostPlayers.length > 0 &&
    nonHostPlayers.every(
      (player) =>
        player.isReady,
    );

  const canStartRace =
    room?.status === "waiting" &&
    socketConnected &&
    allPlayersReady &&
    (isHost ||
      room?.startPolicy ===
        "anyone");

  const connectedPlayers =
    useMemo(() => {
      if (
        !Array.isArray(
          room?.players,
        )
      ) {
        return 0;
      }

      return room.players.filter(
        (player) =>
          player.isConnected,
      ).length;
    }, [room?.players]);

  const readyPlayers =
    useMemo(() => {
      if (
        !Array.isArray(
          room?.players,
        )
      ) {
        return 0;
      }

      return room.players.filter(
        (player, index) =>
          isPlayerHost(
            player,
            index,
          ) ||
          player.isReady,
      ).length;
    }, [
      room?.players,
      room?.createdByUsername,
    ]);

  useEffect(() => {
    if (!roomCode || !room) {
      return undefined;
    }

    window.history.pushState(
      {
        roomLobby: true,
      },
      "",
    );

    const handleBackButton =
      () => {
        setShowCancelModal(
          true,
        );

        window.history.pushState(
          {
            roomLobby: true,
          },
          "",
        );
      };

    window.addEventListener(
      "popstate",
      handleBackButton,
    );

    return () => {
      window.removeEventListener(
        "popstate",
        handleBackButton,
      );
    };
  }, [roomCode, room]);

  useEffect(() => {
    if (!roomCode) {
      return undefined;
    }

    const handleRaceStarted =
      () => {
        navigate(
          `/multiplayer/room/${roomCode}/race`,
          {
            replace: true,
          },
        );
      };

    const handleRoomCancelled =
      (data) => {
        toast.info(
          data?.message ||
            "Room was cancelled by host.",
        );

        navigate(
          "/multiplayer",
          {
            replace: true,
          },
        );
      };

    socket.on(
      "race-started",
      handleRaceStarted,
    );

    socket.on(
      "room-cancelled",
      handleRoomCancelled,
    );

    return () => {
      socket.off(
        "race-started",
        handleRaceStarted,
      );

      socket.off(
        "room-cancelled",
        handleRoomCancelled,
      );
    };
  }, [roomCode, navigate]);

  const startRace = () => {
    if (!allPlayersReady) {
      toast.error(
        "All non-host players must be ready before starting the race.",
      );

      return;
    }

    socket.emit(
      "start-race",
      {
        roomCode,
      },
      (response) => {
        if (
          !response?.success
        ) {
          toast.info(
            response?.message ||
              "Unable to start race.",
          );
        }
      },
    );
  };

  const toggleReady = () => {
    if (!currentPlayer) {
      toast.info(
        "You are not a member of this room.",
      );

      return;
    }

    socket.emit(
      "player-ready",
      {
        roomCode,
        isReady:
          !currentPlayer.isReady,
      },
    );
  };

  const cancelRoom = () => {
    setShowCancelModal(true);
  };

  const confirmCancelRoom =
    () => {
      setShowCancelModal(false);

      if (isHost) {
        socket.emit(
          "cancel-room",
          {
            roomCode,
          },
          (response) => {
            if (
              !response?.success
            ) {
              toast.error(
                response?.message ||
                  "Unable to cancel room.",
              );

              return;
            }

            navigate(
              "/multiplayer",
              {
                replace: true,
              },
            );
          },
        );

        return;
      }

      socket.emit(
        "leave-room",
        {
          roomCode,
        },
        (response) => {
          if (
            !response?.success
          ) {
            toast.error(
              response?.message ||
                "Unable to leave room.",
            );

            return;
          }

          navigate(
            "/multiplayer",
            {
              replace: true,
            },
          );
        },
      );
    };

  const copyRoomCode =
    async () => {
      try {
        await navigator.clipboard.writeText(
          room.roomCode,
        );

        toast.success(
          "Room code copied.",
        );
      } catch {
        toast.error(
          "Unable to copy room code.",
        );
      }
    };

  const getInitials = (
    username = "",
  ) => {
    return username
      .split(" ")
      .filter(Boolean)
      .map(
        (part) => part[0],
      )
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const formatDuration = (
    seconds = 0,
  ) => {
    const safeSeconds =
      Math.max(
        0,
        Number(seconds) || 0,
      );

    if (safeSeconds < 60) {
      return `${safeSeconds}s`;
    }

    const hours =
      Math.floor(
        safeSeconds / 3600,
      );

    const minutes =
      Math.floor(
        (safeSeconds % 3600) /
          60,
      );

    const remainingSeconds =
      safeSeconds % 60;

    if (hours > 0) {
      if (
        minutes === 0 &&
        remainingSeconds === 0
      ) {
        return `${hours} hr`;
      }

      if (
        remainingSeconds === 0
      ) {
        return `${hours}h ${minutes}m`;
      }

      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    }

    if (
      remainingSeconds === 0
    ) {
      return `${minutes} min`;
    }

    return `${minutes}m ${remainingSeconds}s`;
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100dvh-64px)] items-center justify-center bg-[#181C22] px-4 text-white sm:min-h-[calc(100vh-80px)]">
        <div className="flex items-center gap-3 text-sm text-zinc-400">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-700 border-t-orange-500" />

          Loading room...
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex min-h-[calc(100dvh-64px)] items-center justify-center bg-[#181C22] px-4 text-center text-red-400 sm:min-h-[calc(100vh-80px)]">
        Room not found.
      </div>
    );
  }

  return (
    <main className="relative min-h-[calc(100dvh-64px)] overflow-x-hidden bg-[#181C22] pb-28 text-white sm:min-h-[calc(100vh-80px)] sm:pb-8">
      <div className="pointer-events-none absolute -left-24 top-16 h-64 w-64 rounded-full bg-orange-500/[0.05] blur-[100px]" />

      <div className="pointer-events-none absolute -right-24 top-1/2 h-72 w-72 rounded-full bg-orange-500/[0.04] blur-[110px]" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-3 py-3 sm:px-5 sm:py-6 lg:px-8">
        {/* Mobile room header */}
        <section className="mb-3 rounded-2xl border border-white/[0.07] bg-[#20252D]/90 p-3 sm:mb-6 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-orange-500/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-orange-400 sm:text-[10px]">
                  Multiplayer lobby
                </span>

                <span className="rounded-full border border-orange-500/20 bg-orange-500/[0.08] px-2.5 py-1 text-[9px] capitalize text-orange-300 sm:text-[10px]">
                  {room.status}
                </span>
              </div>

              <h1 className="mt-2 truncate text-xl font-black tracking-[-0.03em] text-white sm:text-3xl">
                {room.roomName ||
                  "Typing Room"}
              </h1>

              <p className="mt-1 hidden text-sm text-zinc-500 sm:block">
                Wait for everyone to
                get ready, then start
                the race.
              </p>
            </div>

            <div
              className={`flex shrink-0 items-center gap-1.5 rounded-xl px-2.5 py-2 text-[10px] font-medium sm:px-3 sm:text-xs ${
                socketConnected
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-red-500/10 text-red-400"
              }`}
            >
              {socketConnected ? (
                <Wifi size={14} />
              ) : (
                <WifiOff
                  size={14}
                />
              )}

              <span className="hidden min-[390px]:inline">
                {socketConnected
                  ? "Connected"
                  : "Disconnected"}
              </span>
            </div>
          </div>

          {socketError && (
            <p className="mt-3 rounded-xl bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {socketError}
            </p>
          )}

          {/* Compact room details */}
          <div className="mt-3 lg:hidden grid items-cente justify-betwee grid-cols-2 gap-2 sm:mt-5 sm:grid-cols-4">
            <div className="col-span-2 min-w-0 rounded-xl bg-[#181C22] px-3 py-2.5 sm:px-4 sm:py-3">
              <p className="text-[9px] uppercase tracking-wide text-zinc-600 sm:text-[10px]">
                Room code
              </p>

              <div className="mt-0.5 flex items-center gap-2">
                <strong className="truncate font-mono text-base tracking-[0.16em] text-orange-400 sm:text-lg">
                  {room.roomCode}
                </strong>

                <button
                  type="button"
                  onClick={
                    copyRoomCode
                  }
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-orange-500/10 text-orange-400 transition active:scale-95 hover:bg-orange-500/20"
                  aria-label="Copy room code"
                  title="Copy room code"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>

            <div className="rounded-xl bg-[#181C22] px-3 py-3 text-center sm:px-4 sm:py-3">
              <div className="flex items-center justify-center gap-1.5">
                <Clock
                  size={14}
                  className="text-orange-400"
                />

                <strong className="text-xs sm:text-sm">
                  {formatDuration(
                    room.duration,
                  )}
                </strong>
              </div>

              <p className="mt-0.5 text-[9px] uppercase tracking-wide text-zinc-600">
                Duration
              </p>
            </div>

            <div className="rounded-xl bg-[#181C22] px-4 py-3 text-center sm:px-4 sm:py-3">
              <div className="flex items-center justify-center gap-1.5">
                <Users
                  size={15}
                  className="text-orange-400"
                />

                <strong className="text-xs sm:text-sm">
                  {room.players
                    ?.length || 0}
                  /{room.maxPlayers}
                </strong>
              </div>

              <p className="mt-0.5 text-[9px] uppercase tracking-wide text-zinc-600">
                Players
              </p>
            </div>

            <div className="hidden rounded-xl bg-[#181C22] px-4 py-3 text-center sm:block">
              <div className="flex items-center justify-center gap-1.5">
                <Check
                  size={15}
                  className="text-emerald-400"
                />

                <strong className="text-sm">
                  {readyPlayers}/
                  {room.players
                    ?.length || 0}
                </strong>
              </div>

              <p className="mt-0.5 text-[9px] uppercase tracking-wide text-zinc-600">
                Ready
              </p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-6">
          {/* Desktop room information */}
          <aside className="hidden rounded-2xl border border-white/[0.07] bg-[#20252D] p-4 lg:block">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">
                Room information
              </h2>

              <span className="rounded-full bg-orange-500/10 px-2.5 py-1 text-[9px] uppercase tracking-wide text-orange-400">
                {room.status}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-xl bg-[#181C22] p-3">
                <p className="text-[10px] uppercase tracking-wide text-zinc-600">
                  Room name
                </p>

                <p className="mt-1 break-words font-semibold text-white">
                  {room.roomName}
                </p>
              </div>

              <div className="rounded-xl bg-[#181C22] p-3">
                <p className="text-[10px] uppercase tracking-wide text-zinc-600">
                  Room code
                </p>

                <div className="mt-1 flex items-center justify-between gap-3">
                  <strong className="font-mono tracking-[0.16em] text-orange-400">
                    {room.roomCode}
                  </strong>

                  <button
                    type="button"
                    onClick={
                      copyRoomCode
                    }
                    className="grid h-8 w-8 place-items-center rounded-lg bg-orange-500/10 text-orange-400 transition hover:bg-orange-500/20"
                    title="Copy room code"
                  >
                    <Copy
                      size={15}
                    />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-[#181C22] p-3">
                  <Clock
                    size={17}
                    className="text-orange-400"
                  />

                  <p className="mt-2 text-[10px] text-zinc-500">
                    Duration
                  </p>

                  <p className="text-sm font-semibold">
                    {formatDuration(
                      room.duration,
                    )}
                  </p>
                </div>

                <div className="rounded-xl bg-[#181C22] p-3">
                  <Users
                    size={17}
                    className="text-orange-400"
                  />

                  <p className="mt-2 text-[10px] text-zinc-500">
                    Players
                  </p>

                  <p className="text-sm font-semibold">
                    {room.players
                      ?.length || 0}
                    /{room.maxPlayers}
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-[#181C22] p-3">
                <div className="flex items-center gap-3">
                  {socketConnected ? (
                    <Wifi
                      className="text-emerald-400"
                      size={18}
                    />
                  ) : (
                    <WifiOff
                      className="text-red-400"
                      size={18}
                    />
                  )}

                  <div>
                    <p className="text-[10px] text-zinc-500">
                      Connection
                    </p>

                    <p
                      className={`text-sm font-semibold ${
                        socketConnected
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {socketConnected
                        ? "Connected"
                        : "Disconnected"}
                    </p>
                  </div>
                </div>
              </div>

              {!allPlayersReady &&
                room.status ===
                  "waiting" && (
                  <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/[0.08] p-3 text-xs leading-5 text-yellow-300">
                    Waiting for all
                    non-host players
                    to become ready.
                  </div>
                )}
            </div>
          </aside>

          {/* Players */}
          <section className="min-w-0">
            <div className="mb-3 flex items-end justify-between gap-3 px-1">
              <div>
                <h2 className="text-lg font-semibold sm:text-xl">
                  Players
                </h2>

                <p className="mt-0.5 text-[10px] text-zinc-500 sm:text-xs">
                  {connectedPlayers}{" "}
                  online ·{" "}
                  {readyPlayers} ready
                </p>
              </div>

              <span className="rounded-full bg-black/20 px-2.5 py-1 text-[10px] text-zinc-400 sm:text-xs">
                {room.players
                  ?.length || 0}{" "}
                joined
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
              {room.players.map(
                (
                  player,
                  index,
                ) => {
                  const host =
                    isPlayerHost(
                      player,
                      index,
                    );

                  const isMe =
                    player.username ===
                    currentUsername;

                  return (
                    <article
                      key={
                        player.user ||
                        player.username
                      }
                      className={`relative overflow-hidden rounded-2xl border p-3 transition sm:p-4 ${
                        isMe
                          ? "border-orange-500/30 bg-orange-500/[0.07]"
                          : "border-white/[0.07] bg-[#20252D]"
                      }`}
                    >
                      {isMe && (
                        <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-orange-500" />
                      )}

                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-orange-500/20 bg-orange-500/10 text-sm font-bold text-orange-400 sm:h-14 sm:w-14 sm:rounded-2xl">
                            {player.profilePhoto ? (
                              <img
                                src={
                                  player.profilePhoto
                                }
                                alt={
                                  player.username
                                }
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              getInitials(
                                player.username,
                              )
                            )}
                          </div>

                          <span
                            className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#20252D] ${
                              player.isConnected
                                ? "bg-emerald-400"
                                : "bg-zinc-500"
                            }`}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex min-w-0 items-center gap-1.5">
                            <p className="truncate text-sm font-semibold text-white">
                              {
                                player.username
                              }
                            </p>

                            {isMe && (
                              <span className="shrink-0 rounded-full bg-orange-500/15 px-1.5 py-0.5 text-[8px] font-semibold uppercase text-orange-400">
                                You
                              </span>
                            )}
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            {host && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-2 py-0.5 text-[9px] text-orange-400">
                                <Crown
                                  size={10}
                                />
                                Host
                              </span>
                            )}

                            {!host &&
                              (player.isReady ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] text-emerald-400">
                                  <Check
                                    size={10}
                                  />
                                  Ready
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 px-2 py-0.5 text-[9px] text-yellow-400">
                                  <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
                                  Waiting
                                </span>
                              ))}
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <span
                            className={`text-[9px] font-medium ${
                              player.isConnected
                                ? "text-emerald-400"
                                : "text-zinc-500"
                            }`}
                          >
                            {player.isConnected
                              ? "Online"
                              : "Offline"}
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                },
              )}
            </div>

            {!allPlayersReady &&
              room.status ===
                "waiting" && (
                <div className="mt-3 rounded-xl border border-yellow-500/20 bg-yellow-500/[0.08] px-3 py-2.5 text-center text-xs text-yellow-300 lg:hidden">
                  Waiting for all
                  players to become
                  ready.
                </div>
              )}

            {/* Desktop buttons */}
            <div className="mt-6 hidden items-center justify-end gap-3 sm:flex">
              <button
                type="button"
                onClick={cancelRoom}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#20252D] px-5 py-3 text-sm text-zinc-300 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-white"
              >
                <X size={17} />

                {isHost
                  ? "Dissolve room"
                  : "Leave room"}
              </button>

              {!isHost && (
                <button
                  type="button"
                  onClick={
                    toggleReady
                  }
                  disabled={
                    !socketConnected ||
                    room.status !==
                      "waiting"
                  }
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    currentPlayer?.isReady
                      ? "bg-yellow-500 text-black hover:bg-yellow-400"
                      : "bg-orange-500 text-white hover:bg-orange-600"
                  }`}
                >
                  {currentPlayer?.isReady ? (
                    <>
                      <X
                        size={17}
                      />
                      Cancel ready
                    </>
                  ) : (
                    <>
                      <Check
                        size={17}
                      />
                      Ready
                    </>
                  )}
                </button>
              )}

              {(isHost ||
                room.startPolicy ===
                  "anyone") && (
                <button
                  type="button"
                  onClick={
                    startRace
                  }
                  disabled={
                    !canStartRace
                  }
                  title={
                    !allPlayersReady
                      ? "Players must be ready first"
                      : ""
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Play size={17} />
                  Start race
                </button>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Mobile fixed action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-[#181C22]/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl sm:hidden">
        <div className="mx-auto flex max-w-7xl gap-2">
          <button
            type="button"
            onClick={cancelRoom}
            className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-white/10 bg-[#20252D] text-zinc-300 transition active:scale-95"
            aria-label={
              isHost
                ? "Dissolve room"
                : "Leave room"
            }
            title={
              isHost
                ? "Dissolve room"
                : "Leave room"
            }
          >
            <X size={19} />
          </button>

          {!isHost && (
            <button
              type="button"
              onClick={toggleReady}
              disabled={
                !socketConnected ||
                room.status !==
                  "waiting"
              }
              className={`inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${
                currentPlayer?.isReady
                  ? "bg-yellow-500 text-black"
                  : "bg-orange-500 text-white"
              }`}
            >
              {currentPlayer?.isReady ? (
                <>
                  <X size={18} />
                  Cancel ready
                </>
              ) : (
                <>
                  <Check
                    size={18}
                  />
                  Ready
                </>
              )}
            </button>
          )}

          {(isHost ||
            room.startPolicy ===
              "anyone") && (
            <button
              type="button"
              onClick={startRace}
              disabled={
                !canStartRace
              }
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 text-sm font-semibold text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Play size={18} />

              <span>
                Start race
              </span>
            </button>
          )}
        </div>
      </div>

      <ConfirmModal
        open={showCancelModal}
        title={
          isHost
            ? "Dissolve Room"
            : "Leave Room"
        }
        message={
          isHost
            ? "You are the host. Cancelling this room will remove it permanently and every player will be returned to the multiplayer lobby."
            : "Are you sure you want to leave this room?"
        }
        confirmText={
          isHost
            ? "Dissolve Room"
            : "Leave"
        }
        confirmColor="bg-orange-500 hover:bg-orange-600"
        onCancel={() =>
          setShowCancelModal(
            false,
          )
        }
        onConfirm={
          confirmCancelRoom
        }
      />
    </main>
  );
}

export default RoomLobby;