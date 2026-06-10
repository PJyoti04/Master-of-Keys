import mongoose from "mongoose";

const graphPointSchema = new mongoose.Schema(
  {
    second: {
      type: Number,
      required: true,
    },

    wpm: {
      type: Number,
      required: true,
    },

    correct: {
      type: Number,
      default: 0,
    },

    wrong: {
      type: Number,
      default: 0,
    },

    backspace: {
      type: Number,
      default: 0,
    },
  },
  { _id: false },
);

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Core Metrics
    wpm: {
      type: Number,
      default: 0,
    },

    accuracy: {
      type: Number,
      default: 0,
    },

    score: {
      type: Number,
      default: 0,
    },

    penalty: {
      type: Number,
      default: 0,
    },

    // Character Statistics
    correctCharacters: {
      type: Number,
      default: 0,
    },

    incorrectCharacters: {
      type: Number,
      default: 0,
    },

    backspaceCount: {
      type: Number,
      default: 0,
    },

    totalTypedCharacters: {
      type: Number,
      default: 0,
    },

    completionPercentage: {
      type: Number,
      default: 0,
    },

    // Test Information
    duration: {
      type: Number, // seconds
      default: 60,
    },

    text: {
      type: String,
      default: "",
    },

    typedText: {
      type: String,
      default: "",
    },

    // Graph Data
    graphData: {
      type: [graphPointSchema],
      default: [],
    },

    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

const TypingSession = mongoose.model("TypingSession", sessionSchema);

export default TypingSession;
