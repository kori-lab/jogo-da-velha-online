const socket = io();

const refreshUsersCount = (countUsers) => {
  document.querySelector(
    "p#onlineInfo"
  ).innerHTML = `<i class='bx bxs-user' style='color:#494949' ></i> <span style="color:rgb(148, 148, 148)">${countUsers}</span> usuários online`;
};

socket.on("ready", (userID) => {
  if (!userID) return location.reload();
  socket.userID = userID;
  document.querySelector(
    "#user-id"
  ).innerHTML = `User id: <span>${userID}</span>`;
});

socket.on("userConnected", (countUsers) => {
  refreshUsersCount(countUsers);
});

socket.on("userLeaved", (countUsers) => {
  refreshUsersCount(countUsers);
});

socket.on("getIP", async () => {
  const ip = (await (await fetch("https://httpbin.org/ip")).json()).origin;
  socket.ip = ip;
  socket.emit("ip", ip);
});

socket.on("receive-invite", (invite, author) => {
  console.log(invite, author, socket.userID);

  const elementInvite = document.createElement("div");
  elementInvite.classList.add("center");
  elementInvite.innerHTML = `
    <div class="invite-header">
      <div class="invite-header-title">
      <i class='bx bxs-user' style='color:#494949' ></i>
        Convite de jogo
      </div> 
      <div class="invite-body-text">
        <p>Você tem um pedido de <span style='color:#494949;font-weight: bold;'>${author}</span>, deseja duelar contra ele(a)?</p>
      </div>
      <button id="accept-invite">
        Aceitar
      </button>
      <button id="recuse-invite">
        Recusar
      </button>
    </div>
  `;

  document.querySelector("#receive-invite").appendChild(elementInvite);
  document.querySelector("#accept-invite").addEventListener("click", () => {
    socket.emit("accept-invite", invite, socket.userID);
    document.querySelector("#receive-invite").style.display = "none";
    elementInvite.remove();
  });
  document.querySelector("#recuse-invite").addEventListener("click", () => {
    socket.emit("recuse-invite", invite, socket.userID);
    document.querySelector("#receive-invite").style.display = "none";
    elementInvite.remove();
  });
  document.querySelector("#receive-invite").style.display = "block";
});

document.querySelector("#inviter-button").addEventListener("click", () => {
  document.querySelector("#invite-page").style.display = "block";

  document.querySelector(".close-invite").addEventListener("click", () => {
    document.querySelector("#invite-page").style.display = "none";
  });

  document.querySelector("#form-invite").addEventListener("submit", (e) => {
    e.preventDefault();

    const userID = document.querySelector("#form-invite > input").value;
    socket.emit("invite", userID, socket.userID);

    document.querySelector("#invite-page").style.display = "none";
  });
});

socket.on("start-battle", (battle) => {
  document.querySelector("#battle-arena").style.display = "block";
  document.querySelector("#receive-invite").style.display = "none";
  document.querySelector("#invite-page").style.display = "none";

  if (battle.turn == socket.userID) {
    document.querySelector("#info-battle").innerHTML = "sua vez";
    var part = battle.player.user_id == socket.userID ? "O" : "X";

    renderizeArena(battle, part);
  } else {
    document.querySelector("#info-battle").innerHTML = "turno do adversário";
    renderizeArena(battle);
  }
});

socket.on("update-battle", (battle) => {
  if (battle.turn == socket.userID) {
    document.querySelector("#info-battle").innerHTML = "sua vez";
    var part = battle.player.user_id == socket.userID ? "O" : "X";

    renderizeArena(battle, part);
  } else {
    document.querySelector("#info-battle").innerHTML = "turno do adversário";
    renderizeArena(battle);
  }
});

socket.on("end-battle", (battle_result) => {
  if (battle_result.winner == socket.userID) {
    document.querySelector("#info-battle").innerHTML = "Você venceu!";
  } else if (battle_result.winner == "draw") {
    document.querySelector("#info-battle").innerHTML = "Empate!";
  } else {
    document.querySelector("#info-battle").innerHTML = "Você perdeu!";
  }

  renderizeArena(battle_result);
});

function renderizeArena(battle, player) {
  console.log("renderizando arena", battle, player);

  const arena_element = document.querySelector("#arena");
  arena_element.innerHTML = "";

  var index_row = 0;
  for (const row of battle.arena) {
    const row_element = document.createElement("div");
    row_element.classList.add("arena-row");
    row_element.id = `row${index_row}`;

    var index_cell = 0;
    for (const button of row) {
      const button_element = document.createElement("button");
      button_element.id = `arena-cell-${index_row}-${index_cell}`;
      button_element.innerHTML = button;
      button_element.classList.add("arena-cell");

      if (button == "" && player) {
        /**
         * @param {MouseEvent} elem
         */
        button_element.addEventListener("click", (elem) => {
          console.log(
            button,
            player,
            button_element.id[button_element.id.length - 1],
            row_element.id[row_element.id.length - 1]
          );

          elem.target.innerHTML = player;

          var arena = showTable();
          battle.arena = arena;

          socket.emit("click-cell", battle);
        });
      }

      row_element.appendChild(button_element);

      ++index_cell;
    }

    ++index_row;
    arena_element.appendChild(row_element);
  }
}

function showTable() {
  const table = [];
  for (const row of document
    .getElementById("arena")
    .querySelectorAll(".arena-row")) {
    const line = [];
    for (const button of document
      .getElementById(row.id)
      .querySelectorAll("button")) {
      line.push(button.textContent);
    }
    table.push(line);
  }
  return table;
}
