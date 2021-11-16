const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

let users = {};

io.on("connection", (socket) => {
  if (!users[socket.id]) {
    users[socket.id] = { id: socket.id };
  }
  socket.emit("user_id", socket.id);

  socket.on("update_user", (data) => {
    users = { ...users, [data.id]: { ...users[data.id], name: data.name } };
    io.sockets.emit("online_user_list", users);
  });

  socket.on("call_someone", (data) => {
    io.to(data.callId).emit("someone_calling", {
      signal: data.data,
      from: data.callerId,
      name: data?.name,
    });
  });

  socket.on("answer_call", (data) => {
    io.to(data.to).emit("call_accepted", data.signal);
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
    io.sockets.emit("online_users_report", users);
  });
});

server.listen(8000, () => console.log("server is running on port 8000"));
