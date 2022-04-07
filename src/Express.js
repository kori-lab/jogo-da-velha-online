const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const routes = require("./Routes.js");
const users_connecteds = [];
var connectedUsers = 0;

module.exports = () => {
  app.use(routes);
  app.use(express.static(__dirname + "/routes/frontend"));

  io.on("connection", (socket) => {
    ++connectedUsers;
    const userID = generateRandomString(6);

    io.emit("userConnected", connectedUsers);

    socket.emit("ready", userID);
    socket.emit("getIP");

    socket.on("ip", (ip) => {
      console.log(`user connected ${ip}`);
      socket.ip = ip;
      users_connecteds.push({ socket_id: socket.id, userID, ip });
    });

    socket.on("disconnect", (ip) => {
      --connectedUsers;
      io.emit("userLeaved", connectedUsers);
      console.log(`user disconnected ${socket.ip}`);
      users_connecteds.splice(
        users_connecteds.findIndex((user) => user.socket_id === socket.id),
        1
      );
    });

    socket.on("invite", (targetID, author) => {
      const target = users_connecteds.find((user) => user.userID === targetID);
      io.to(target.socket_id).emit("receive-invite", userID, author);
      io.emit("receive-invite", targetID, author);
    });
  }); 

  server.listen(process.env.PORT || 443, () => {
    console.log("listening on http://localhost:80");
  });
};

function generateRandomString(lengthString) {
  const listCaracter = [
    ...String.fromCharCode(...[...Array(26)].map((_) => i++, (i = 97))).split(
      ""
    ),
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    0,
  ];
  var resultString = "";

  while (resultString.length < lengthString) {
    resultString +=
      listCaracter[Math.floor(Math.random() * (listCaracter.length - 1))];
  }

  return resultString.toUpperCase();
}
