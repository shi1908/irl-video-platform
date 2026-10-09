import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = Number(process.env.PORT) || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => handle(req, res));

  const allowedOrigins = [
    process.env.CLIENT_URL,
    "http://localhost:3000",
  ].filter(Boolean) as string[];

  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join-room", (roomId: string) => {
      if (!roomId) return;

      const room = io.sockets.adapter.rooms.get(roomId);
      const peopleInRoom = room?.size ?? 0;
      const isHost = peopleInRoom === 0;

      socket.join(roomId);

      socket.emit("room-joined", {
        roomId,
        participants: peopleInRoom,
        isHost,
      });

      socket.to(roomId).emit("user-joined", {
        socketId: socket.id,
        isHost: false,
      });
    });

    socket.on("offer", ({ target, offer }) => {
      if (target && offer) {
        io.to(target).emit("offer", { sender: socket.id, offer });
      }
    });

    socket.on("answer", ({ target, answer }) => {
      if (target && answer) {
        io.to(target).emit("answer", { sender: socket.id, answer });
      }
    });

    socket.on("ice-candidate", ({ target, candidate }) => {
      if (target && candidate) {
        io.to(target).emit("ice-candidate", {
          sender: socket.id,
          candidate,
        });
      }
    });

    socket.on("leave-room", (roomId: string) => {
      if (!roomId) return;

      socket.to(roomId).emit("user-left", {
        socketId: socket.id,
      });

      socket.leave(roomId);
    });

    socket.on("moderation-remove", ({ target }) => {
      if (target) {
        io.to(target).emit("moderation-remove", {
          sender: socket.id,
        });
      }
    });

    socket.on("moderation-mute", ({ target }) => {
      if (target) {
        io.to(target).emit("moderation-mute", {
          sender: socket.id,
        });
      }
    });

    socket.on("disconnecting", () => {
      for (const roomId of socket.rooms) {
        if (roomId !== socket.id) {
          socket.to(roomId).emit("user-left", {
            socketId: socket.id,
          });
        }
      }
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });

  httpServer.listen(port, hostname, () => {
    console.log(`IRL server listening on ${hostname}:${port}`);
  });
});