const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const routes = require("./Routes.js");
const users_connecteds = [];
const active_matches = [];

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
      if (targetID === author) {
        socket.emit("inviteError", "You can't invite yourself");
      } else {
        const target = users_connecteds.find((user) => user.userID == targetID);

        if (target?.socket_id) {
          io.to(target?.socket_id).emit("receive-invite", userID, author);
        }
      }
    });

    socket.on("accept-invite", (targetID, author) => {
      const target_socket = users_connecteds.find(
        (user) => user.userID == targetID
      );
      const author_socket = users_connecteds.find(
        (user) => user.userID == author
      );

      if (target_socket?.socket_id && author_socket?.socket_id) {
        const battle = initBattle(author_socket, target_socket);
        console.log("batalha iniciada:", battle);
        active_matches.push(battle);

        io.to(target_socket?.socket_id).emit("start-battle", battle);
        io.to(author_socket?.socket_id).emit("start-battle", battle);
      }
    });

    socket.on("reject-invite", (targetID, author) => {
      const target_socket = users_connecteds.find(
        (user) => user.userID == targetID
      );
      const author_socket = users_connecteds.find(
        (user) => user.userID == author
      );

      if (target_socket?.socket_id && author_socket?.socket_id) {
        io.to(target_socket?.socket_id).emit("reject-invite", author);
        io.to(author_socket?.socket_id).emit("reject-invite", targetID);
      }
    });

    socket.on("click-cell", (request_battle) => {
      const battle = active_matches.find(
        (battle) =>
          battle.author.user_id == request_battle.author.user_id &&
          battle.player.user_id == request_battle.player.user_id
      );

      if (battle) {
        const winner = checkWinner(battle);

        if (winner) {
          io.to(battle.player1.socket_id).emit("end-battle", winner);
          io.to(battle.player2.socket_id).emit("end-battle", winner);

          active_matches.splice(
            active_matches.findIndex((battle) => battle.id === battle.id),
            1
          );
        } else if (!winner) {
          var index_battle = active_matches.findIndex(
            (battle) =>
              battle.author.user_id == request_battle.author.user_id &&
              battle.player.user_id == request_battle.player.user_id
          );
          active_matches[index_battle].turn =
            battle.turn == battle.author.user_id
              ? battle.player.user_id
              : battle.author.user_id;
          active_matches[index_battle].arena = request_battle.arena;

          io.to(battle.player.socket_id).emit(
            "update-battle",
            active_matches[index_battle]
          );
          io.to(battle.author.socket_id).emit(
            "update-battle",
            active_matches[index_battle]
          );
        }
      }
    });
  });

  server.listen(process.env.PORT || 443, () => {
    console.log("listening on http://localhost:443");
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

function initBattle(author, target) {
  return {
    player: {
      part: "O",
      socket_id: target?.socket_id,
      user_id: target?.userID,
    },
    author: {
      part: "X",
      socket_id: author?.socket_id,
      user_id: author?.userID,
    },
    arena: [
      ["", "", ""],
      ["", "", ""],
      ["", "", ""],
    ],
    turn: author?.userID,
  };
}

function checkWinner() {
  return null;
}
