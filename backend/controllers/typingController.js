import TypingSession from "../models/TypingSession.js";

const saveSession = async (req, res) => {
  try {
    const {
      wpm,
      accuracy,
      text,
      correctCharacters,
      incorrectCharacters,
      backspaceCount,
      score,
      penalty,
      completionPercentage,
      typedText,
      graphData,
      duration
    } = req.body;

    const session = await TypingSession.create({
      userId: req.user.id,

      wpm,
      accuracy,
      text,

      correctCharacters,
      incorrectCharacters,
      backspaceCount,
      score,
      penalty,
      completionPercentage,
      typedText,
      graphData,
      duration
    });

    res.status(201).json({
      success: true,
      message: "Session saved successfully",
      session,
    });
  } catch (error) {
    console.error("Save Session Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getHistory = async (req, res) => {
  try {
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const sessions = await TypingSession.find({ userId: req.user.id })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  saveSession,
  getHistory,
}