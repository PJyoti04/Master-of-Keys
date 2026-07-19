import jwt from "jsonwebtoken";
import cookie from "cookie";
import Room from "../models/Room.js";

const activeTimers = new Map();

const normalizeRoomCode = (roomCode) =>
  String(roomCode || "")
    .trim()
    .toUpperCase();

const getTokenFromSocket = (socket) => {
  const cookies = cookie.parse(socket.handshake.headers.cookie || "");

  return (
    cookies.token ||
    cookies.jwt ||
    cookies.accessToken ||
    socket.handshake.auth?.token
  );
};

/*
|--------------------------------------------------------------------------
| Leaderboard
|--------------------------------------------------------------------------
|
| Ranking priority
|
| 1. Finished players first
| 2. Earlier finish time
| 3. Higher progress
| 4. Higher WPM
| 5. Higher Accuracy
|
*/

const buildLeaderboard = (room) => {
  return [...room.players]
    .sort((a, b) => {
      if (Boolean(a.finished) !== Boolean(b.finished)) {
        return Number(b.finished) - Number(a.finished);
      }

      if (a.finished && b.finished) {
        const aTime = a.finishedAt
          ? new Date(a.finishedAt).getTime()
          : Number.MAX_SAFE_INTEGER;

        const bTime = b.finishedAt
          ? new Date(b.finishedAt).getTime()
          : Number.MAX_SAFE_INTEGER;

        if (aTime !== bTime) {
          return aTime - bTime;
        }
      }

      if ((b.progress || 0) !== (a.progress || 0)) {
        return (b.progress || 0) - (a.progress || 0);
      }

      if ((b.wpm || 0) !== (a.wpm || 0)) {
        return (b.wpm || 0) - (a.wpm || 0);
      }

      return (b.accuracy || 0) - (a.accuracy || 0);
    })
    .map((player, index) => ({
      rank: index + 1,

      userId: player.user.toString(),

      username: player.username,

      profilePhoto: player.profilePhoto || "",

      progress: Number(player.progress) || 0,

      wpm: Number(player.wpm) || 0,

      accuracy: Number(player.accuracy) || 0,

      correctChars: Number(player.correctChars) || 0,

      wrongChars: Number(player.wrongChars) || 0,

      backspaceCount: Number(player.backspaceCount) || 0,

      finished: Boolean(player.finished),

      finishedAt: player.finishedAt || null,
    }));
};

const sanitizeStats = (stats = {}) => ({
  progress: Math.min(Math.max(Number(stats.progress) || 0, 0), 100),

  wpm: Math.max(Number(stats.wpm) || 0, 0),

  accuracy: Math.min(Math.max(Number(stats.accuracy) || 0, 0), 100),

  correctChars: Math.max(Number(stats.correctChars) || 0, 0),

  wrongChars: Math.max(Number(stats.wrongChars) || 0, 0),

  backspaceCount: Math.max(Number(stats.backspaceCount) || 0, 0),
});

const isHostPlayer = (room, player, index) =>
  index === 0 ||
  player.user.toString() === room.createdBy.toString() ||
  player.username === room.createdByUsername;

/*
|--------------------------------------------------------------------------
| Complete Race
|--------------------------------------------------------------------------
*/

const completeRace = async (io, roomCode) => {
  const room = await Room.findOne({ roomCode });

  if (!room || room.status === "completed") {
    return;
  }

  room.status = "completed";
  room.completedAt = new Date();

  const leaderboard = buildLeaderboard(room);

  room.finalLeaderboard = leaderboard.map((player) => ({
    rank: player.rank,

    userId: player.userId,

    username: player.username,

    profilePhoto: player.profilePhoto,

    progress: player.progress,

    wpm: player.wpm,

    accuracy: player.accuracy,

    correctChars: player.correctChars,

    wrongChars: player.wrongChars,

    backspaceCount: player.backspaceCount,

    finished: player.finished,

    finishedAt: player.finishedAt,
  }));

  if (leaderboard.length > 0) {
    room.winner = leaderboard[0].userId;
  }

  await room.save();

  if (activeTimers.has(roomCode)) {
    clearTimeout(activeTimers.get(roomCode));
    activeTimers.delete(roomCode);
  }

  io.to(roomCode).emit("room-updated", room);

  io.to(roomCode).emit("leaderboard-update", leaderboard);

  io.to(roomCode).emit("race-completed", {
    roomCode,
    leaderboard,
  });
};

export const initializeSocket = (io) => {
  io.use((socket, next) => {
    try {
      const token = getTokenFromSocket(socket);

      if (!token) {
        return next(new Error("Unauthorized: token missing"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      socket.user = {
        id: decoded.id || decoded._id || decoded.userId,
        username: decoded.username,
      };

      if (!socket.user.id) {
        return next(new Error("Unauthorized: invalid token"));
      }

      next();
    } catch (error) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.user.username}`);

    /*
    |--------------------------------------------------------------------------
    | Join Room
    |--------------------------------------------------------------------------
    */

    socket.on("join-room", async (payload = {}, callback) => {
      try {
        const roomCode = normalizeRoomCode(payload.roomCode);
        const userId = socket.user.id;

        const room = await Room.findOne({ roomCode });

        if (!room) {
          return callback?.({
            success: false,
            message: "Room not found.",
          });
        }

        const player = room.players.find(
          (p) => p.user.toString() === String(userId),
        );

        if (!player) {
          return callback?.({
            success: false,
            message: "You are not a member of this room.",
          });
        }

        socket.data.roomCode = roomCode;
        socket.data.userId = userId;

        socket.join(roomCode);

        player.socketId = socket.id;
        player.isConnected = true;

        const playerIndex = room.players.findIndex(
          (p) => p.user.toString() === String(userId),
        );

        if (isHostPlayer(room, player, playerIndex)) {
          player.isReady = true;
        }

        await room.save();

        io.to(roomCode).emit("room-updated", room);

        callback?.({
          success: true,
          room,
        });
      } catch (error) {
        callback?.({
          success: false,
          message: error.message,
        });
      }
    });

    /*
    |--------------------------------------------------------------------------
    | Leave Room
    |--------------------------------------------------------------------------
    */

    socket.on("leave-room", async (payload = {}, callback) => {
      try {
        const roomCode = normalizeRoomCode(
          payload.roomCode || socket.data.roomCode,
        );

        const userId = socket.user.id;

        if (!roomCode) {
          return callback?.({
            success: false,
            message: "Room code is required.",
          });
        }

        socket.leave(roomCode);

        const room = await Room.findOne({ roomCode });

        if (!room) {
          return callback?.({
            success: false,
            message: "Room not found.",
          });
        }

        const playerIndex = room.players.findIndex(
          (p) => p.user.toString() === String(userId),
        );

        if (playerIndex === -1) {
          return callback?.({
            success: false,
            message: "You are not a member of this room.",
          });
        }

        /*
         * Waiting room
         * Remove player completely.
         */

        if (room.status === "waiting") {
          room.players.splice(playerIndex, 1);

          if (room.players.length === 0) {
            await Room.deleteOne({ _id: room._id });

            return callback?.({
              success: true,
              deleted: true,
              message: "Room deleted.",
            });
          }

          /*
           * Host left before race.
           * Transfer ownership.
           */

          if (room.createdBy.toString() === String(userId)) {
            room.createdBy = room.players[0].user;
            room.players[0].isReady = true;
          }

          await room.save();

          io.to(roomCode).emit("room-updated", room);

          return callback?.({
            success: true,
            removed: true,
            message: "Left room successfully.",
          });
        }

        /*
         * Running / Completed
         * Preserve player statistics.
         */

        const player = room.players[playerIndex];

        player.socketId = null;
        player.isConnected = false;

        await room.save();

        io.to(roomCode).emit("room-updated", room);

        callback?.({
          success: true,
          removed: false,
          message:
            room.status === "completed"
              ? "Result preserved."
              : "Disconnected from room.",
        });
      } catch (error) {
        callback?.({
          success: false,
          message: error.message,
        });
      }
    });

    /*
    |--------------------------------------------------------------------------
    | Cancel Room
    |--------------------------------------------------------------------------
    */

    socket.on("cancel-room", async (payload = {}, callback) => {
      try {
        const roomCode = normalizeRoomCode(
          payload.roomCode || socket.data.roomCode,
        );

        const userId = socket.user.id;

        if (!roomCode) {
          return callback?.({
            success: false,
            message: "Room code is required.",
          });
        }

        const room = await Room.findOne({ roomCode });

        if (!room) {
          return callback?.({
            success: false,
            message: "Room not found.",
          });
        }

        const isHost = room.createdBy.toString() === String(userId);

        if (!isHost) {
          return callback?.({
            success: false,
            message: "Only host can cancel this room.",
          });
        }

        if (activeTimers.has(roomCode)) {
          clearTimeout(activeTimers.get(roomCode));
          activeTimers.delete(roomCode);
        }

        io.to(roomCode).emit("room-cancelled", {
          roomCode,
          message: "Host cancelled the room.",
        });

        await Room.deleteOne({
          roomCode,
        });

        io.in(roomCode).socketsLeave(roomCode);

        callback?.({
          success: true,
          message: "Room cancelled successfully.",
        });
      } catch (error) {
        callback?.({
          success: false,
          message: error.message,
        });
      }
    });

    /*
    |--------------------------------------------------------------------------
    | Ready Toggle
    |--------------------------------------------------------------------------
    */

    socket.on("player-ready", async (payload = {}) => {
      const roomCode = normalizeRoomCode(
        payload.roomCode || socket.data.roomCode,
      );

      const userId = socket.user.id;

      const room = await Room.findOne({
        roomCode,
      });

      if (!room || room.status !== "waiting") {
        return;
      }

      const player = room.players.find(
        (p) => p.user.toString() === String(userId),
      );

      if (!player) {
        return;
      }

      const playerIndex = room.players.findIndex(
        (p) => p.user.toString() === String(userId),
      );

      if (isHostPlayer(room, player, playerIndex)) {
        player.isReady = true;

        await room.save();

        io.to(roomCode).emit("room-updated", room);

        return;
      }

      player.isReady = Boolean(payload.isReady);

      await room.save();

      io.to(roomCode).emit("room-updated", room);
    });

    /*
     * START-RACE CONTINUES HERE...
     */
    socket.on("start-race", async (payload = {}, callback) => {
      try {
        const roomCode = normalizeRoomCode(payload.roomCode);
        const userId = socket.user.id;

        const room = await Room.findOne({ roomCode });

        if (!room) {
          return callback?.({
            success: false,
            message: "Room not found.",
          });
        }

        if (room.status !== "waiting") {
          return callback?.({
            success: false,
            message: "Race already started.",
          });
        }

        if (room.players.length < 2) {
          return callback?.({
            success: false,
            message: "At least 2 players are required to start the race.",
          });
        }

        const isMember = room.players.some(
          (player) => player.user.toString() === String(userId),
        );

        if (!isMember) {
          return callback?.({
            success: false,
            message: "You are not a member of this room.",
          });
        }

        const isHost = room.createdBy.toString() === String(userId);

        if (room.startPolicy === "host" && !isHost) {
          return callback?.({
            success: false,
            message: "Only host can start this race.",
          });
        }

        const allPlayersReady = room.players.every((player, index) => {
          if (isHostPlayer(room, player, index)) {
            return true;
          }

          return player.isReady;
        });

        if (!allPlayersReady) {
          return callback?.({
            success: false,
            message: "All players must be ready before starting the race.",
          });
        }

        const now = new Date();

        room.status = "running";
        room.startedAt = now;
        room.endedAt = new Date(now.getTime() + room.duration * 1000);

        room.completedAt = null;

        room.winner = null;

        /*
         * NEW
         * Clear previous race snapshot.
         */
        room.finalLeaderboard = [];

        room.players.forEach((player) => {
          player.progress = 0;
          player.wpm = 0;
          player.accuracy = 0;

          player.correctChars = 0;

          player.wrongChars = 0;

          /*
           * NEW
           */
          player.backspaceCount = 0;

          player.finished = false;

          player.finishedAt = null;
        });

        await room.save();

        io.to(roomCode).emit("room-updated", room);

        io.to(roomCode).emit("race-started", {
          roomCode,

          startedAt: room.startedAt,

          endedAt: room.endedAt,

          duration: room.duration,

          text: room.currentText,
        });

        if (activeTimers.has(roomCode)) {
          clearTimeout(activeTimers.get(roomCode));
        }

        const timer = setTimeout(() => {
          completeRace(io, roomCode).catch(console.error);
        }, room.duration * 1000);

        activeTimers.set(roomCode, timer);

        callback?.({
          success: true,
          room,
        });
      } catch (error) {
        callback?.({
          success: false,
          message: error.message,
        });
      }
    });

    socket.on("typing-progress", async (payload = {}) => {
      const roomCode = normalizeRoomCode(
        payload.roomCode || socket.data.roomCode,
      );

      const userId = socket.user.id;

      const room = await Room.findOne({ roomCode });

      if (!room || room.status !== "running") {
        return;
      }

      const player = room.players.find(
        (p) => p.user.toString() === String(userId),
      );

      if (!player || player.finished) {
        return;
      }

      const stats = sanitizeStats(payload);

      player.progress = stats.progress;
      player.wpm = stats.wpm;
      player.accuracy = stats.accuracy;

      player.correctChars = stats.correctChars;
      player.wrongChars = stats.wrongChars;

      /*
       * NEW
       */
      player.backspaceCount = stats.backspaceCount;

      await room.save();

      io.to(roomCode).emit("player-progress", {
        userId: String(player.user),

        username: player.username,

        profilePhoto: player.profilePhoto || "",

        progress: player.progress,

        wpm: player.wpm,

        accuracy: player.accuracy,

        correctChars: player.correctChars,

        wrongChars: player.wrongChars,

        backspaceCount: player.backspaceCount,
      });

      /*
       * Leaderboard is rebuilt every update.
       * Frontend should ignore this after
       * race-completed.
       */
      io.to(roomCode).emit("leaderboard-update", buildLeaderboard(room));
    });

    socket.on("player-finished", async (payload = {}) => {
      const roomCode = normalizeRoomCode(
        payload.roomCode || socket.data.roomCode,
      );

      const userId = socket.user.id;

      const room = await Room.findOne({ roomCode });

      if (!room || room.status !== "running") {
        return;
      }

      const player = room.players.find(
        (p) => p.user.toString() === String(userId),
      );

      if (!player || player.finished) {
        return;
      }

      const stats = sanitizeStats({
        ...payload,
        progress: 100,
      });

      player.progress = 100;

      player.wpm = stats.wpm;

      player.accuracy = stats.accuracy;

      player.correctChars = stats.correctChars;

      player.wrongChars = stats.wrongChars;

      /*
       * NEW
       */
      player.backspaceCount = stats.backspaceCount;

      player.finished = true;

      player.finishedAt = new Date();

      await room.save();

      io.to(roomCode).emit("player-finished", {
        userId: String(player.user),

        username: player.username,

        profilePhoto: player.profilePhoto || "",

        wpm: player.wpm,

        accuracy: player.accuracy,

        correctChars: player.correctChars,

        wrongChars: player.wrongChars,

        backspaceCount: player.backspaceCount,

        finishedAt: player.finishedAt,
      });

      /*
       * Live leaderboard while race is running.
       * completeRace() will store the frozen snapshot.
       */
      io.to(roomCode).emit("leaderboard-update", buildLeaderboard(room));

      const allFinished = room.players.every((p) => p.finished);

      if (allFinished) {
        await completeRace(io, roomCode);
      }
    });

    /*
    |--------------------------------------------------------------------------
    | Disconnect
    |--------------------------------------------------------------------------
    */

    socket.on("disconnect", async () => {
      const roomCode = socket.data.roomCode;
      const userId = socket.user?.id;

      if (!roomCode || !userId) {
        return;
      }

      const room = await Room.findOne({ roomCode });

      if (!room) {
        return;
      }

      const player = room.players.find(
        (p) => p.user.toString() === String(userId),
      );

      if (!player) {
        return;
      }

      player.socketId = null;
      player.isConnected = false;

      await room.save();

      /*
       * Do NOT remove players on disconnect.
       * This preserves completed race results.
       */
      io.to(roomCode).emit("room-updated", room);

      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};
