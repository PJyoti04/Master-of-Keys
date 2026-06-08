import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  wpm:      Number,
  accuracy: Number,
  text:     String,
  date:     { type: Date, default: Date.now }
});

const TypingSession = mongoose.model('TypingSession', sessionSchema);
 export default TypingSession;