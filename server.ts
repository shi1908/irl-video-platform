import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = Number(process.env.PORT) || 3000;

const app = next({
  dev,
  hostname,
  port,
});

const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: `http://${hostname}:${port}`,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);
    
    socket.on(
  "moderation-remove",
  ({ target }: { target: string }) => {
    io.to(target).emit("moderation-remove", {
      sender: target,
    });
  }
);

socket.on(
  "moderation-mute",
  ({ target }: { target: string }) => {
    io.to(target).emit("moderation-mute", {
      sender: target,
    });
  }
);
  socket.on("join-room", (roomId: string) => {
  if (!roomId) return;

  const room = io.sockets.adapter.rooms.get(roomId);
  const peopleInRoom = room ? room.size : 0;

  // First person joining = host
  const isHost = peopleInRoom === 0;

  socket.join(roomId);

  console.log(
    `${socket.id} joined room ${roomId} | Host: ${isHost}`
  );

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
   

    socket.on(
      "offer",
      ({
        target,
        offer,
      }: {
        target: string;
        offer: RTCSessionDescriptionInit;
      }) => {
        io.to(target).emit("offer", {
          sender: socket.id,
          offer,
        });
      }
    );

    socket.on(
      "answer",
      ({
        target,
        answer,
      }: {
        target: string;
        answer: RTCSessionDescriptionInit;
      }) => {
        io.to(target).emit("answer", {
          sender: socket.id,
          answer,
        });
      }
    );

    socket.on(
      "ice-candidate",
      ({
        target,
        candidate,
      }: {
        target: string;
        candidate: RTCIceCandidateInit;
      }) => {
        io.to(target).emit(
          "ice-candidate",
          {
            sender: socket.id,
            candidate,
          }
        );
      }
    );

    socket.on(
      "leave-room",
      (roomId: string) => {
        if (!roomId) return;

        socket.leave(roomId);

        socket
          .to(roomId)
          .emit("user-left", {
            socketId: socket.id,
          });

        console.log(
          `${socket.id} left room ${roomId}`
        );
      }
    );

    socket.on("disconnect", () => {
      console.log(
        "Socket disconnected:",
        socket.id
      );

      socket.broadcast.emit(
        "user-disconnected",
        {
          socketId: socket.id,
        }
      );
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(
        `> IRL server ready on http://${hostname}:${port}`
      );
    });
});