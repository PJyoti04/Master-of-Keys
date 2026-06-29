import mongoose from "mongoose";

const playerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    username: {
      type: String,
      required: true,
      trim: true,
    },

    socketId: {
      type: String,
      default: null,
    },

    isConnected: {
      type: Boolean,
      default: false,
    },

    isReady: {
      type: Boolean,
      default: false,
    },

    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    wpm: {
      type: Number,
      default: 0,
      min: 0,
    },

    accuracy: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    correctChars: {
      type: Number,
      default: 0,
    },

    wrongChars: {
      type: Number,
      default: 0,
    },

    finished: {
      type: Boolean,
      default: false,
    },

    finishedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const roomSchema = new mongoose.Schema(
  {
    roomCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    roomName: {
      type: String,
      required: true,
      trim: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    players: [playerSchema],

    maxPlayers: {
      type: Number,
      default: 4,
      min: 2,
      max: 10,
    },

    duration: {
      type: Number,
      default: 60,
      min: 15,
      max: 86400,
    },

    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "private",
    },

    startPolicy: {
      type: String,
      enum: ["host", "anyone"],
      default: "host",
    },

    status: {
      type: String,
      enum: ["waiting", "running", "completed"],
      default: "waiting",
    },

    currentText: {
      type: String,
      default:
        "The quick brown fox jumps over the lazy dog while the rain falls softly outside.",
    },

    startedAt: {
      type: Date,
      default: null,
    },

    endedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Room", roomSchema);