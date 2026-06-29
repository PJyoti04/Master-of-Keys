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

const CLIENT_URL = process.env.CLIENT_URL || "*" || "http://localhost:5173";
const PORT = process.env.PORT || 5000;
const allowedOrigins = [
  "http://localhost:5173",
  "http://192.168.0.57:5173", // frontend running on another PC
];

const server = createServer(app);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});


// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     credentials: true,
//   },
// });

// app.use(
//   cors({
//     origin: "*",
//     credentials: true,
//   })
// );

app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/user", typingRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/rooms", roomRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
  });
});

initializeSocket(io);

app.use(errorHandler);

server.listen(PORT,"0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});