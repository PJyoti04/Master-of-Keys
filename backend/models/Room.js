import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    roomCode: {
      type: String,
      required: true,
      unique: true,
    },

    roomName: {
      type: String,
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    players: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },

        username: String,

        isReady: {
          type: Boolean,
          default: false,
        },

        progress: {
          type: Number,
          default: 0,
        },

        wpm: {
          type: Number,
          default: 0,
        },

        finished: {
          type: Boolean,
          default: false,
        },
      },
    ],

    maxPlayers: {
      type: Number,
      default: 5,
    },

    duration: {
      type: Number,
      default: 60,
    },

    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },

    status: {
      type: String,
      enum: ["waiting", "running", "completed"],
      default: "waiting",
    },

    currentText: String,

    startedAt: Date,

    endedAt: Date,

    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Room", roomSchema);
