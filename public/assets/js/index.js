import { createClient } from "./client.js";
import environment from "./../json/environment.json" assert { type: "json" };

const socket = io();
const client = createClient(socket);
const controller = new ViewController({
  id: "main-controller",
  default: "home-view",
});
const timer = new Timer();

controller.mountEvents({
  "home-view": {
    onMount() {
      const usernameInput = document.getElementById("home-view/username");
      
      usernameInput.addEventListener("focusout", () => {
        socket.emit("Player/Username", usernameInput.value);
      });
      
    },
  },
  "new-view": {
    onMount() {
      socket.emit("Room/Create");

      new Snackbar({
        id: "snackbar-container",
        message: "Creating Room",
      });
    },
  },
  "random-view": {
    onMount() {
      socket.emit("Room/Player/Join");

      new Snackbar({
        id: "snackbar-container",
        message: "Joining Random Room",
      });
    },
  },
  "join-view": {
    onMount(view) {
      let form = document.getElementById("join-view/room-form");
      let input = document.getElementById("join-view/room-input");

      form.addEventListener("submit", (e) => {
        e.preventDefault();
        socket.emit("Room/Player/Join", input.value);
      });
    },
    onUnmount(view) {},
  },
  "game-view": {
    onMount(view) {
      let roomId;
      let roomUrl = `${window.location.protocol}//${window.location.host}/?join=`;

      let teamLists = document.getElementById("game-view/team-lists");

      let chatInput = document.getElementById("game-view/chat-input");
      let chatForm = document.getElementById("game-view/chat-form");
      let chatContainer = document.getElementById("game-view/chat-container");

      let isolatedDiv = document.getElementById(
        "game-view/lobby-modal/isolated-view"
      );

      let startGame = document.getElementById(
        "game-view/lobby-modal/player-ready"
      );

      let qrCodeModal = document.getElementById(
        "game-view/lobby-modal/qr-code-modal"
      );
      let qrCodeButton = document.getElementById(
        "game-view/lobby-modal/create-qr-code"
      );

      const currentRoundSpan = document.getElementById(
        "game-view/current-round"
      );
      const totalRoundsSpan = document.getElementById("game-view/total-rounds");
      const countdownTimerSpan = document.getElementById(
        "game-view/countdown-timer"
      );
      const currentWord = document.getElementById("game-view/current-word");

      let wordModal = document.getElementById("game-view/pick-modal");
      let wordContainer = document.getElementById("game-view/pick-modal/words");
      
      let waitModal = document.getElementById("game-view/wait-modal");
      let waitingForPlayerSpan = document.getElementById("game-view/wait-modal/player");

      const viewportNav = document.getElementById("t-viewport-nav");

      let metadata = {
        title: "Take Turns",
        text: "Play Take Turns with Me!",
      };

      let shareButton = document.getElementById(
        "game-view/lobby-modal/room-share"
      );
      let shareUrlInput = document.getElementById(
        "game-view/lobby-modal/room-url"
      );

      timer.addEventListener("secondTenthsUpdated", function (e) {
        countdownTimerSpan.innerHTML = timer
          .getTimeValues()
          .toString(["minutes", "seconds", "secondTenths"]);
      });

      shareButton.addEventListener("click", async () => {
        metadata.url = roomUrl + roomId;

        if (navigator.share && navigator.canShare(metadata)) {
          await navigator.share(metadata);
        }
      });

      qrCodeButton.addEventListener("click", () => {
        qrCodeModal.innerHTML = "";
        showElement(qrCodeModal);

        let qrCodeDialog = document.createElement("div");
        let qrCodeClose = document.createElement("button");

        qrCodeDialog.classList.add("t-modal-dialog");
        qrCodeClose.classList.add("t-btn");

        qrCodeClose.innerHTML = "Close";

        qrCodeClose.addEventListener("click", () => {
          hideElement(qrCodeModal);
          qrCodeModal.innerHTML = "";
        });

        qrCodeDialog.appendChild(qrCodeClose);

        const qrCode = new QRCode(qrCodeDialog, {
          text: roomUrl + roomId,
          width: 200,
          height: 200,
          colorDark: "#000",
          colorLight: "#fff",
          correctLevel: QRCode.CorrectLevel.H,
        });

        qrCodeModal.appendChild(qrCodeDialog);
      });

      shareUrlInput.addEventListener("click", async () => {
        shareUrlInput.value = roomUrl + roomId;

        shareUrlInput.select();
        shareUrlInput.setSelectionRange(0, 99999); // For mobile devices

        try {
          await navigator.clipboard.writeText(shareUrlInput.value);

          new Snackbar({
            id: "snackbar-container",
            message: "Copied Link",
          });
        } catch (e) {
          new Snackbar({
            id: "snackbar-container",
            message: "Couldn't Copy Link",
          });
        }
      });

      client.createStream(view);

      startGame.onclick = () => {
        socket.emit("Room/Player/Ready");
      };

      chatInput.onfocus = () => {
        socket.emit("Room/Chat/Typing");
      };

      chatInput.onblur = () => {
        socket.emit("Room/Chat/StopTyping");
      };

      chatForm.onsubmit = (e) => {
        e.preventDefault();

        socket.emit("Room/Chat/Message", chatInput.value);

        chatInput.value = "";
      };

      socket.on("Room/Game/Round", function (details) {
        totalRoundsSpan.innerHTML = details.totalRounds;
        currentRoundSpan.innerHTML = details.currentRound;
      });

      socket.on("Room/Game/Team", function (details) {
        new Snackbar({
          id: "snackbar-container",
          message: `Team '${details.currentTeam.name}' is starting.`,
        });

        timer.stop();
      });

      socket.on("Room/Game/Pick", function (details) {
        if (details.words) {
          showElement(wordModal);
          
          wordModal.scrollIntoView();
          
          wordContainer.innerHTML = "";

          details.words.forEach((word) => {
            let button = document.createElement("button");

            button.classList.add("t-btn");

            button.innerHTML = word;

            button.addEventListener("click", function () {
              socket.emit("Room/Game/Pick", word);

              hideElement(wordModal);
              wordContainer.innerHTML = "";
            });

            wordContainer.appendChild(button);
          });
        }
        if (details.player) {
          showElement(waitModal);
          
          waitModal.scrollIntoView();
          
          waitingForPlayerSpan.innerHTML = details.player.name;
        }
      });

      socket.on("Room/Game/Player", function (details) {
        hideElement(waitModal);
        hideElement(wordModal);

        if (details.currentPlayer.id == socket.id) {
          showElement(viewportNav);
        } else {
          hideElement(viewportNav);
        }

        const players = document.querySelectorAll(".fa-pen");
        players.forEach((pen) => hideElement(pen));

        timer.stop();

        timer.start({
          precision: "secondTenths",
          countdown: true,
          startValues: { seconds: details.secondsPerPlayer },
        });

        const player = document.getElementById(
          "player-" + details.currentPlayer.id
        );

        const isDrawingIcon = player.querySelector(".fa-pen");

        showElement(isDrawingIcon);

        currentWord.innerHTML = details.word;

        new Snackbar({
          id: "snackbar-container",
          message: `${details.currentPlayer.name} is drawing.`,
        });
      });

      socket.on("Room/Chat/Typing", (id) => {
        let playerListItem = document.getElementById("player-" + id);
        let playerTypingIcon = playerListItem.querySelector(".fa-comment");

        showElement(playerTypingIcon);
      });

      socket.on("Room/Chat/StopTyping", (id) => {
        let playerListItem = document.getElementById("player-" + id);
        let playerTypingIcon = playerListItem.querySelector(".fa-comment");

        hideElement(playerTypingIcon);
      });

      socket.on("Room/Chat/Message", (details) => {
        console.log(details);

        chatContainer.scrollTo(0, chatContainer.scrollHeight + 500);

        if (details.name.toLowerCase() === "server" && !details.isServer) {
          details.name = "Fake Server";
        }

        chatContainer.insertAdjacentHTML(
          "beforeend",
          `
              <li class="t-list-group-item" style="display: block;">
                ${details.isOwner ? '<i class="fa-solid fa-crown"></i>' : ""} ${
            details.isServer ? '<i class="fa-solid fa-server"></i>' : ""
          }
                <strong>${details.name}: </strong>
                <span style="white-space: pre-wrap;">${details.message}</span>
              </li>
            `
        );
      });

      socket.on("Room/Details", (details) => {
        console.log(details);

        teamLists.innerHTML = "";

        for (let team of details.teams) {
          let teamListContainer = document.createElement("div");
          let teamList = document.createElement("ul");
          teamList.classList.add("t-list-group");

          let teamListTitle = document.createElement("strong");
          teamListTitle.innerHTML = `${team.name} (Score: ${team.score})`;

          for (let [id, player] of Object.entries(team.players)) {
            let item = document.createElement("li");
            item.id = "player-" + player.id;
            item.classList.add("t-list-group-item");
            item.innerHTML = `<strong>${
              details.owner.id === player.id
                ? '<i class="fa-solid fa-crown"></i>'
                : ""
            } ${
              player.name
            }</strong> <span class="player-status"> <i class="fa-solid fa-pen" hidden></i> <i class="fa-solid fa-comment" hidden></i></span>`;

            if (socket.id === player.id) {
              item.style = "background-color: var(--tt-success); color: white;";
            }

            teamList.appendChild(item);
          }

          teamListContainer.appendChild(teamListTitle);
          teamListContainer.appendChild(teamList);

          teamLists.append(teamListContainer);
        }

        if (details.playerList.length > 1) {
          hideElement(isolatedDiv);

          if (socket.id === details.owner.id) startGame.disabled = false;
        } else {
          showElement(isolatedDiv);
        }

        roomId = details.id;
      });
    },

    onUnmount() {
      console.log("Removing socket events")
      
      socket.off("Room/Chat/Typing");
      socket.off("Room/Chat/StopTyping");
      socket.off("Room/Chat/Message");

      socket.off("Room/Details");
      socket.off("Room/Game/Round");
      socket.off("Room/Game/Team");
      socket.off("Room/Game/Player");
      socket.off("Room/Game/Pick");
    },
  },
});

controller.init();

socket.on("Room/Game/Start", function () {
  let lobbyModal = document.getElementById("game-view/lobby-modal");

  hideElement(lobbyModal);

  new Snackbar({
    id: "snackbar-container",
    message: "Game start!",
  });
});

socket.on("Room/Game/Resume", function () {
  let lobbyModal = document.getElementById("game-view/lobby-modal");

  hideElement(lobbyModal);

  new Snackbar({
    id: "snackbar-container",
    message: "Game resume",
  });
});

socket.on("Room/Game/End", function (winner) {
  let resultsModal = document.getElementById("game-view/results-modal");

  showElement(resultsModal);

  resultsModal.innerHTML = `${winner.name} won this one!`;

  new Snackbar({
    id: "snackbar-container",
    message: "Game end!",
  });
});

socket.on("Room/Console", function (res) {
  new Snackbar({
    id: "snackbar-container",
    type: res.type,
    message: res.message,
  });

  if (res.type === "warning") console.warn(res.message);
  if (res.type === "danger") console.error(res.message);
});

socket.on("Room/Create", function (room) {
  new Snackbar({
    id: "snackbar-container",
    message: "Room Created",
  });

  socket.emit("Room/Player/Join", room.id);
});

socket.on("Room/Player/Leave", function() {
  new Snackbar({
    id: "snackbar-container",
    message: "Left Room",
  });

  controller.mountView("home-view");
});

socket.on("Room/Player/Join", function () {
  new Snackbar({
    id: "snackbar-container",
    message: "Joined Room",
  });

  controller.mountView("game-view");
});

socket.on("Server/Console", (message) => {
  console.log(message);
});

socket.on("connect", () => {
  new Snackbar({
    id: "snackbar-container",
    message: "Connected! 😀",
    type: "success",
  });
  
  socket.emit("Room/Player/Sync");
});

socket.on("connect_error", (err) => {
  new Snackbar({
    id: "snackbar-container",
    message: `An Error Occured: ${err.message}`,
    type: "danger",
  });

  controller.mountView("home-view");

  socket.emit("Room/Player/Sync");
});

socket.on("disconnect", () => {
  new Snackbar({
    id: "snackbar-container",
    message: "Disconnected!!?? 🤬",
    type: "danger",
  });

  socket.emit("Room/Player/Sync");
});
