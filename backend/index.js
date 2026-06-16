import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/authRoutes.js";
import typingRoutes from "./routes/typingRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";

import errorHandler from "./middleware/errorHandler.js";
import connectDB from "./config/db.js";
import { initializeSocket } from "./utils/socketHandler.js";

connectDB();

const app = express();

// Create HTTP Server
const server = createServer(app);

// Create Socket.IO Server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/user", typingRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/rooms", roomRoutes);

app.use(errorHandler);

// Initialize Socket Events
initializeSocket(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});