import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Make Socket.io available to Express controllers.
app.locals.io = io;

// Authenticate Socket.io connections using the same JWT
// authentication used by the REST API.
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(
        new Error("Authentication token required")
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    socket.userId = decoded.userId;

    return next();
  } catch (error) {
    console.error(
      "Socket authentication error:",
      error.message
    );

    return next(
      new Error("Invalid authentication token")
    );
  }
});

io.on("connection", (socket) => {
  const room = `user:${socket.userId}`;

  // Each user gets a private room.
  // Task events are only sent to users who own those tasks.
  socket.join(room);

  console.log(
    `Socket connected: ${socket.id} (${room})`
  );

  socket.on("disconnect", (reason) => {
    console.log(
      `Socket disconnected: ${socket.id} (${reason})`
    );
  });
});

const startServer = async () => {
  await connectDB();

  httpServer.listen(PORT, () => {
    console.log(
      `CollabBoard API running on port ${PORT}`
    );
  });
};

startServer();