const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  wpm:      Number,
  accuracy: Number,
  text:     String,
  date:     { type: Date, default: Date.now }
});

module.exports = mongoose.model('TypingSession', sessionSchema);