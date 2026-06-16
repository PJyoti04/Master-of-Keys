import Room from "../models/Room.js";
import { generateRoomCode } from "../utils/generateRoomCode.js";

export const createRoom = async (req, res, next) => {
  try {
    const {
      roomName,
      maxPlayers,
      duration,
      visibility,
    } = req.body;

    const room = await Room.create({
      roomCode: generateRoomCode(),
      roomName,
      createdBy: req.user.id,

      players: [
        {
          user: req.user.id,
          username: req.user.username,
        },
      ],

      maxPlayers,
      duration,
      visibility,
    });

    res.status(201).json(room);
  } catch (err) {
    next(err);
  }
};

export const getRoom = async (req, res, next) => {
  try {
    const room = await Room.findOne({
      roomCode: req.params.roomCode,
    }).lean();

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    res.status(200).json(room);
  } catch (error) {
    next(error);
  }
};


export const joinRoom = async (req, res, next) => {
  try {
    const { roomCode } = req.body;

    const room = await Room.findOne({
      roomCode: roomCode.toUpperCase(),
    });

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    if (room.status !== "waiting") {
      return res.status(400).json({
        message: "Race already started",
      });
    }

    if (room.players.length >= room.maxPlayers) {
      return res.status(400).json({
        message: "Room is full",
      });
    }

    const alreadyJoined = room.players.find(
      (player) =>
        player.user.toString() === req.user.id
    );

    if (!alreadyJoined) {
      room.players.push({
        user: req.user.id,
        username: req.user.username,
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