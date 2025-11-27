import { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import envConfig from "@/config/env";

// Store online users: userId -> socketId
const userSocketMap = new Map<string, string>();

export const getReceiverSocketId = (userId: number): string | undefined => {
  return userSocketMap.get(userId.toString());
};

let io: SocketIOServer | null = null;

export const setupSocketIO = (httpServer: HTTPServer) => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: envConfig.CLIENT_URL,
      credentials: true,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    const userId = socket.handshake.query.userId as string;
    if (userId) {
      userSocketMap.set(userId, socket.id);
      console.log(`User ${userId} mapped to socket ${socket.id}`);

      // Emit online users to all clients
      io?.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
    }

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      if (userId) {
        userSocketMap.delete(userId);
        // Emit updated online users
        io?.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
      }
    });
  });

  return io;
};

export const getIO = (): SocketIOServer | null => {
  return io;
};
