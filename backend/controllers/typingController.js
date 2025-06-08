const TypingSession = require('../models/TypingSession');

exports.saveSession = async (req, res) => {
  const { wpm, accuracy, text } = req.body;
  try {
    const session = await TypingSession.create({ userId: req.user.id, wpm, accuracy, text });
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getHistory = async (req, res) => {
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
