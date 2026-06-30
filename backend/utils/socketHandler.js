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

const buildLeaderboard = (room) => {
  return [...room.players]
    .sort((a, b) => {
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
      progress: player.progress || 0,
      wpm: player.wpm || 0,
      accuracy: player.accuracy || 0,
      finished: player.finished || false,
      finishedAt: player.finishedAt,
    }));
};

const sanitizeStats = (stats = {}) => ({
  progress: Math.min(Math.max(Number(stats.progress) || 0, 0), 100),
  wpm: Math.max(Number(stats.wpm) || 0, 0),
  accuracy: Math.min(Math.max(Number(stats.accuracy) || 0, 0), 100),
  correctChars: Math.max(Number(stats.correctChars) || 0, 0),
  wrongChars: Math.max(Number(stats.wrongChars) || 0, 0),
});

const isHostPlayer = (room, player, index) =>
  index === 0 ||
  player.user.toString() === room.createdBy.toString() ||
  player.username === room.createdByUsername;

const completeRace = async (io, roomCode) => {
  const room = await Room.findOne({ roomCode });

  if (!room || room.status === "completed") return;

  room.status = "completed";
  room.completedAt = new Date();

  const leaderboard = buildLeaderboard(room);

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

    socket.on("join-room", async (payload = {}, callback) => {
      try {
        const roomCode = normalizeRoomCode(payload.roomCode);
        const userId = socket.user.id;

        const room = await Room.findOne({ roomCode });

        if (!room) {
          return callback?.({ success: false, message: "Room not found." });
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

        callback?.({ success: true, room });
      } catch (error) {
        callback?.({ success: false, message: error.message });
      }
    });

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

        const playerExists = room.players.some(
          (p) => p.user.toString() === String(userId),
        );

        if (!playerExists) {
          return callback?.({
            success: false,
            message: "You are not a member of this room.",
          });
        }

        room.players = room.players.filter(
          (p) => p.user.toString() !== String(userId),
        );

        await room.save();

        io.to(roomCode).emit("room-updated", room);

        callback?.({
          success: true,
          message: "Left room successfully.",
        });
      } catch (error) {
        callback?.({
          success: false,
          message: error.message,
        });
      }
    });

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

        await Room.deleteOne({ roomCode });

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

    socket.on("player-ready", async (payload = {}) => {
      const roomCode = normalizeRoomCode(
        payload.roomCode || socket.data.roomCode,
      );
      const userId = socket.user.id;

      const room = await Room.findOne({ roomCode });

      if (!room || room.status !== "waiting") return;

      const player = room.players.find(
        (p) => p.user.toString() === String(userId),
      );

      if (!player) return;

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


    socket.on("start-race", async (payload = {}, callback) => {
      try {
        const roomCode = normalizeRoomCode(payload.roomCode);
        const userId = socket.user.id;

        const room = await Room.findOne({ roomCode });

        if (!room) {
          return callback?.({ success: false, message: "Room not found." });
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
          if (isHostPlayer(room, player, index)) return true;
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

        room.players.forEach((player) => {
          player.progress = 0;
          player.wpm = 0;
          player.accuracy = 0;
          player.correctChars = 0;
          player.wrongChars = 0;
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

        callback?.({ success: true, room });
      } catch (error) {
        callback?.({ success: false, message: error.message });
      }
    });

    socket.on("typing-progress", async (payload = {}) => {
      const roomCode = normalizeRoomCode(
        payload.roomCode || socket.data.roomCode,
      );
      const userId = socket.user.id;

      const room = await Room.findOne({ roomCode });

      if (!room || room.status !== "running") return;

      const player = room.players.find(
        (p) => p.user.toString() === String(userId),
      );

      if (!player || player.finished) return;

      const stats = sanitizeStats(payload);

      player.progress = stats.progress;
      player.wpm = stats.wpm;
      player.accuracy = stats.accuracy;
      player.correctChars = stats.correctChars;
      player.wrongChars = stats.wrongChars;

      await room.save();

      io.to(roomCode).emit("player-progress", {
        userId: String(player.user),
        username: player.username,
        profilePhoto: player.profilePhoto || "",
        progress: player.progress,
        wpm: player.wpm,
        accuracy: player.accuracy,
      });

      io.to(roomCode).emit("leaderboard-update", buildLeaderboard(room));
    });

    socket.on("player-finished", async (payload = {}) => {
      const roomCode = normalizeRoomCode(
        payload.roomCode || socket.data.roomCode,
      );
      const userId = socket.user.id;

      const room = await Room.findOne({ roomCode });

      if (!room || room.status !== "running") return;

      const player = room.players.find(
        (p) => p.user.toString() === String(userId),
      );

      if (!player || player.finished) return;

      const stats = sanitizeStats({
        ...payload,
        progress: 100,
      });

      player.progress = 100;
      player.wpm = stats.wpm;
      player.accuracy = stats.accuracy;
      player.correctChars = stats.correctChars;
      player.wrongChars = stats.wrongChars;
      player.finished = true;
      player.finishedAt = new Date();

      await room.save();

      io.to(roomCode).emit("player-finished", {
        userId: String(player.user),
        username: player.username,
        profilePhoto: player.profilePhoto || "",
        wpm: player.wpm,
        accuracy: player.accuracy,
        finishedAt: player.finishedAt,
      });

      io.to(roomCode).emit("leaderboard-update", buildLeaderboard(room));

      const allFinished = room.players.every((p) => p.finished);

      if (allFinished) {
        await completeRace(io, roomCode);
      }
    });

    socket.on("disconnect", async () => {
      const roomCode = socket.data.roomCode;
      const userId = socket.user?.id;

      if (!roomCode || !userId) return;

      const room = await Room.findOne({ roomCode });

      if (!room) return;

      const player = room.players.find(
        (p) => p.user.toString() === String(userId),
      );

      if (player) {
        player.socketId = null;
        player.isConnected = false;
        await room.save();

        io.to(roomCode).emit("room-updated", room);
      }

      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};
