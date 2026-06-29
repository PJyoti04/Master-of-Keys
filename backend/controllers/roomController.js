import Room from "../models/Room.js";
import { generateRoomCode } from "../utils/generateRoomCode.js";

const normalizeRoomCode = (roomCode) => String(roomCode || "").trim().toUpperCase();

const getUserMaxPlayers = (user) => {
  const isPremium =
    user?.isPremium === true ||
    user?.plan === "premium" ||
    user?.role === "premium";

  return isPremium ? 10 : 4;
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
      userId: player.user,
      username: player.username,
      progress: player.progress || 0,
      wpm: player.wpm || 0,
      accuracy: player.accuracy || 0,
      finished: player.finished || false,
      finishedAt: player.finishedAt,
    }));
};

const generateUniqueRoomCode = async () => {
  let roomCode;
  let exists = true;

  while (exists) {
    roomCode = generateRoomCode().toUpperCase();
    exists = await Room.exists({ roomCode });
  }

  return roomCode;
};

export const createRoom = async (req, res, next) => {
  try {
    const {
      roomName,
      maxPlayers,
      duration = 60,
      visibility = "private",
      startPolicy = "host",
      currentText,
    } = req.body;

    if (!roomName?.trim()) {
      return res.status(400).json({ message: "Room name is required." });
    }

    const allowedMaxPlayers = getUserMaxPlayers(req.user);
    const finalMaxPlayers = Math.min(
      Number(maxPlayers) || allowedMaxPlayers,
      allowedMaxPlayers
    );

    const finalDuration = Math.min(Math.max(Number(duration) || 60, 15), 86400);

    const room = await Room.create({
      roomCode: await generateUniqueRoomCode(),
      roomName: roomName.trim(),
      createdBy: req.user.id,
      players: [
        {
          user: req.user.id,
          username: req.user.username || req.user.name || "Player",
          isConnected: false,
        },
      ],
      maxPlayers: finalMaxPlayers,
      duration: finalDuration,
      visibility,
      startPolicy,
      currentText,
    });

    res.status(201).json({
      success: true,
      room,
    });
  } catch (err) {
    next(err);
  }
};

export const getRoom = async (req, res, next) => {
  try {
    const roomCode = normalizeRoomCode(req.params.roomCode);

    const room = await Room.findOne({ roomCode }).lean();

    if (!room) {
      return res.status(404).json({ message: "Room not found." });
    }

    res.status(200).json(room);
  } catch (error) {
    next(error);
  }
};

export const joinRoom = async (req, res, next) => {
  try {
    const roomCode = normalizeRoomCode(req.body.roomCode);

    if (!roomCode) {
      return res.status(400).json({ message: "Room code is required." });
    }

    const room = await Room.findOne({ roomCode });

    if (!room) {
      return res.status(404).json({ message: "Room not found." });
    }

    if (room.status !== "waiting") {
      return res.status(400).json({ message: "Race already started." });
    }

    const alreadyJoined = room.players.some(
      (player) => player.user.toString() === req.user.id
    );

    if (!alreadyJoined) {
      if (room.players.length >= room.maxPlayers) {
        return res.status(400).json({ message: "Room is full." });
      }

      room.players.push({
        user: req.user.id,
        username: req.user.username || req.user.name || "Player",
      });

      await room.save();
    }

    res.status(200).json({
      success: true,
      roomCode: room.roomCode,
      room,
    });
  } catch (error) {
    next(error);
  }
};

export const leaveRoom = async (req, res, next) => {
  try {
    const roomCode = normalizeRoomCode(req.body.roomCode);

    const room = await Room.findOne({ roomCode });

    if (!room) {
      return res.status(404).json({ message: "Room not found." });
    }

    if (room.status !== "waiting") {
      return res.status(400).json({
        message: "Cannot leave after race has started.",
      });
    }

    room.players = room.players.filter(
      (player) => player.user.toString() !== req.user.id
    );

    if (room.players.length === 0) {
      await room.deleteOne();
      return res.status(200).json({ success: true, deleted: true });
    }

    if (room.createdBy.toString() === req.user.id) {
      room.createdBy = room.players[0].user;
    }

    await room.save();

    res.status(200).json({
      success: true,
      room,
    });
  } catch (error) {
    next(error);
  }
};

export const getRoomResults = async (req, res, next) => {
  try {
    const roomCode = normalizeRoomCode(req.params.roomCode);

    const room = await Room.findOne({ roomCode }).lean();

    if (!room) {
      return res.status(404).json({ message: "Room not found." });
    }

    res.status(200).json({
      success: true,
      room,
      leaderboard: buildLeaderboard(room),
    });
  } catch (error) {
    next(error);
  }
};