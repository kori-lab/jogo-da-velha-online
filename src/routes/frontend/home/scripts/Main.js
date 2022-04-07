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
  if (socket.userID === invite && socket.userID !== author) {
    const elementInvite = document.createElement("div");
    elementInvite.classList.add("center");
    elementInvite.innerHTML = `
    <div class="invite-header">
      <div class="invite-header-title">
        <i class="bx bxs-user"></i>
        <span>${author}</span>  
      </div>  
      <div class="invite-header-close"> 
        <i class="bx bx-x"></i>
      </div>
    </div>
    <div class="invite-body">
      <div class="invite-body-text">
        <p>Você tem um novo pedido de <span>${author}</span>, deseja jogar contra esse pobre?</p>
      </div>
      <div class="invite-body-buttons"> 
        <button class="btn btn-primary">
          <i class="bx bx-user"></i>
          <span>Aceitar</span>
        </button>
        <button class="btn btn-danger">
          <i class="bx bx-x"></i>
          <span>Recusar</span>  
        </button>
      </div>
    </div>
  `;
    document.querySelector("#receive-invite").appendChild(elementInvite);
    document.querySelector("#receive-invite").style.display = "block";
  }
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
