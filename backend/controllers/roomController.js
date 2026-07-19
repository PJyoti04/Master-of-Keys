import Room from "../models/Room.js";
import { generateRoomCode } from "../utils/generateRoomCode.js";

const normalizeRoomCode = (roomCode) =>
  String(roomCode || "")
    .trim()
    .toUpperCase();

const getUserMaxPlayers = (user) => {
  const isPremium =
    user?.isPremium === true ||
    user?.plan === "premium" ||
    user?.role === "premium";

  return isPremium ? 10 : 4;
};

const buildLeaderboard = (room) => {
  return [...(room.players || [])]
    .sort((a, b) => {
      /*
       * Players who completed the text rank above
       * players who did not complete it.
       */
      if (Boolean(a.finished) !== Boolean(b.finished)) {
        return Number(Boolean(b.finished)) - Number(Boolean(a.finished));
      }

      /*
       * When both players completed the text,
       * the player who finished earlier ranks higher.
       */
      if (a.finished && b.finished) {
        const aFinishedAt = a.finishedAt
          ? new Date(a.finishedAt).getTime()
          : Number.MAX_SAFE_INTEGER;

        const bFinishedAt = b.finishedAt
          ? new Date(b.finishedAt).getTime()
          : Number.MAX_SAFE_INTEGER;

        if (aFinishedAt !== bFinishedAt) {
          return aFinishedAt - bFinishedAt;
        }
      }

      const progressDifference =
        (Number(b.progress) || 0) - (Number(a.progress) || 0);

      if (progressDifference !== 0) {
        return progressDifference;
      }

      const wpmDifference = (Number(b.wpm) || 0) - (Number(a.wpm) || 0);

      if (wpmDifference !== 0) {
        return wpmDifference;
      }

      return (Number(b.accuracy) || 0) - (Number(a.accuracy) || 0);
    })
    .map((player, index) => ({
      rank: index + 1,
      userId: player.user,
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

    const trimmedRoomName = String(roomName || "").trim();

    if (!trimmedRoomName) {
      return res.status(400).json({
        success: false,
        message: "Room name is required.",
      });
    }

    if (trimmedRoomName.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Room name cannot exceed 50 characters.",
      });
    }

    const allowedMaxPlayers = getUserMaxPlayers(req.user);

    const requestedMaxPlayers = Number(maxPlayers);

    const finalMaxPlayers = Math.min(
      Math.max(
        Number.isFinite(requestedMaxPlayers)
          ? requestedMaxPlayers
          : allowedMaxPlayers,
        2,
      ),
      allowedMaxPlayers,
    );

    const requestedDuration = Number(duration);

    const finalDuration = Math.min(
      Math.max(Number.isFinite(requestedDuration) ? requestedDuration : 60, 15),
      86400,
    );

    const finalVisibility = ["public", "private"].includes(visibility)
      ? visibility
      : "private";

    const finalStartPolicy = ["host", "anyone"].includes(startPolicy)
      ? startPolicy
      : "host";

    const room = await Room.create({
      roomCode: await generateUniqueRoomCode(),
      roomName: trimmedRoomName,
      createdBy: req.user.id,

      players: [
        {
          user: req.user.id,
          username: req.user.username || req.user.name || "Player",
          profilePhoto: req.user.profile?.avatarUrl || "",
          isConnected: false,
          isReady: true,
        },
      ],

      maxPlayers: finalMaxPlayers,
      duration: finalDuration,
      visibility: finalVisibility,
      startPolicy: finalStartPolicy,
      currentText,
      finalLeaderboard: [],
    });

    return res.status(201).json({
      success: true,
      room,
    });
  } catch (error) {
    next(error);
  }
};

export const getRoom = async (req, res, next) => {
  try {
    const roomCode = normalizeRoomCode(req.params.roomCode);

    if (!roomCode) {
      return res.status(400).json({
        success: false,
        message: "Room code is required.",
      });
    }

    const room = await Room.findOne({ roomCode }).lean();

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found.",
      });
    }

    return res.status(200).json(room);
  } catch (error) {
    next(error);
  }
};

export const joinRoom = async (req, res, next) => {
  try {
    const roomCode = normalizeRoomCode(req.body.roomCode);

    if (!roomCode) {
      return res.status(400).json({
        success: false,
        message: "Room code is required.",
      });
    }

    const room = await Room.findOne({ roomCode });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found.",
      });
    }

    if (room.status !== "waiting") {
      return res.status(400).json({
        success: false,
        message: "Race already started.",
      });
    }

    const userId = String(req.user.id);

    const existingPlayer = room.players.find(
      (player) => String(player.user) === userId,
    );

    if (!existingPlayer) {
      if (room.players.length >= room.maxPlayers) {
        return res.status(400).json({
          success: false,
          message: "Room is full.",
        });
      }

      room.players.push({
        user: req.user.id,
        username: req.user.username || req.user.name || "Player",
        profilePhoto: req.user.profile?.avatarUrl || "",
        isConnected: false,
        isReady: false,
      });

      await room.save();
    }

    return res.status(200).json({
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

    if (!roomCode) {
      return res.status(400).json({
        success: false,
        message: "Room code is required.",
      });
    }

    const room = await Room.findOne({ roomCode });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found.",
      });
    }

    const userId = String(req.user.id);

    const playerIndex = room.players.findIndex(
      (player) => String(player.user) === userId,
    );

    if (playerIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "You are not a member of this room.",
      });
    }

    /*
     * Before the race starts, leaving removes the player
     * from the room completely.
     */
    if (room.status === "waiting") {
      room.players.splice(playerIndex, 1);

      /*
       * Delete the room when the last player leaves.
       */
      if (room.players.length === 0) {
        await Room.deleteOne({ _id: room._id });

        return res.status(200).json({
          success: true,
          deleted: true,
          message: "Room deleted because no players remain.",
        });
      }

      /*
       * If the host leaves, transfer ownership to
       * the first remaining player.
       */
      if (String(room.createdBy) === userId) {
        room.createdBy = room.players[0].user;
        room.players[0].isReady = true;
      }

      await room.save();

      return res.status(200).json({
        success: true,
        removed: true,
        room,
        message: "Left room successfully.",
      });
    }

    /*
     * Once the race starts, preserve the player and
     * their statistics for live and final results.
     */
    const player = room.players[playerIndex];

    player.socketId = null;
    player.isConnected = false;

    await room.save();

    return res.status(200).json({
      success: true,
      removed: false,
      room,
      message:
        room.status === "completed"
          ? "Left room. Your completed result has been preserved."
          : "Disconnected from the room. Your race statistics have been preserved.",
    });
  } catch (error) {
    next(error);
  }
};

export const getRoomResults = async (req, res, next) => {
  try {
    const roomCode = normalizeRoomCode(req.params.roomCode);

    if (!roomCode) {
      return res.status(400).json({
        success: false,
        message: "Room code is required.",
      });
    }

    const room = await Room.findOne({ roomCode }).lean();

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found.",
      });
    }

    if (room.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Race results are not available yet.",
      });
    }

    /*
     * Use the frozen result saved when the race completed.
     *
     * The fallback supports old room records created
     * before finalLeaderboard was introduced.
     */
    const leaderboard =
      Array.isArray(room.finalLeaderboard) && room.finalLeaderboard.length > 0
        ? [...room.finalLeaderboard].sort(
            (a, b) => (Number(a.rank) || 0) - (Number(b.rank) || 0),
          )
        : buildLeaderboard(room);

    return res.status(200).json({
      success: true,
      room,
      leaderboard,
    });
  } catch (error) {
    next(error);
  }
};
