export const initializeSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    // Join Room
    socket.on("join-room", (roomCode) => {
      socket.join(roomCode);

      console.log(
        `${socket.id} joined room ${roomCode}`
      );

      io.to(roomCode).emit("player-joined", {
        socketId: socket.id,
      });
    });

    // Leave Room
    socket.on("leave-room", (roomCode) => {
      socket.leave(roomCode);

      io.to(roomCode).emit("player-left", {
        socketId: socket.id,
      });
    });

    // Typing Progress
    socket.on("typing-progress", (data) => {
      const {
        roomCode,
        userId,
        progress,
        wpm,
      } = data;

      socket.to(roomCode).emit(
        "player-progress",
        {
          userId,
          progress,
          wpm,
        }
      );
    });

    // Race Started
    socket.on("start-race", (roomCode) => {
      io.to(roomCode).emit("race-started");
    });

    // Race Finished
    socket.on("finish-race", (data) => {
      io.to(data.roomCode).emit(
        "player-finished",
        data
      );
    });

    socket.on("disconnect", () => {
      console.log(
        `User Disconnected: ${socket.id}`
      );
    });
  });
};