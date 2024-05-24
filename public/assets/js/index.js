import {
  ViewController,
  Snackbar,
  clearEvents,
  hideElement,
  showElement,
} from "./components.js";
import { createClient } from "./client.js";
import environment from "./../json/environment.json" assert { type: "json" };

const socket = io();
const client = createClient(socket);
const controller = new ViewController({
  id: "main-controller",
  default: "home-view",
});

controller.mount({
  "home-view": {
    mounted() {},
  },

  "new-view": {
    mounted() {
      socket.emit("Room/Create");

      new Snackbar({
        id: "snackbar-container",
        message: "Creating Room",
      });
    },
  },

  "random-view": {
    mounted() {
      socket.emit("Room/Player/Join");

      new Snackbar({
        id: "snackbar-container",
        message: "Joining Random Room",
      });
    },
  },

  "join-view": {
    mounted(view) {
      let form = document.getElementById("join-view/room-form");
      let input = document.getElementById("join-view/room-input");

      form.addEventListener("submit", (e) => {
        e.preventDefault();
        socket.emit("Room/Player/Join", input.value);
      });
    },
    unmounted(view) {},
  },

//   "lobby-view": {
//     mounted(view) {
//       let isolated = document.getElementById("lobby-view/isolated-view");
//       let party = document.getElementById("lobby-view/party-view");
//       let input = document.getElementById("lobby-view/room-url");
//       let title = document.getElementById("lobby-view/room-id");
//       let share = document.getElementById("lobby-view/room-share");
//       let list = document.getElementById("lobby-view/player-list");
//       let counter = document.getElementById("lobby-view/player-count");
//       let ready = document.getElementById("lobby-view/player-ready");
//       let cancel = view.querySelector('[data-navigate="back"]');
//       let loader = document.getElementById("lobby-view/loader");
//       let url = `${window.location.protocol}//${window.location.host}/?join=`;

//       let metadata = {
//         title: "Take Turns",
//         text: "Play Take Turns with Me!",
//       };

//       cancel.addEventListener("click", () => {
//         ready.disabled = false;
//         socket.emit("Room/Player/Leave");

//         new Snackbar({
//           id: "snackbar-container",
//           message: "Left Room",
//         });
//       });

//       share.addEventListener("click", async () => {
//         if (navigator.share && navigator.canShare(metadata)) {
//           await navigator.share(metadata);
//         }
//       });

//       input.addEventListener("click", async () => {
//         input.select();
//         input.setSelectionRange(0, 99999); // For mobile devices

//         try {
//           await navigator.clipboard.writeText(input.value);

//           new Snackbar({
//             id: "snackbar-container",
//             message: "Copied Link",
//           });
//         } catch (e) {
//           new Snackbar({
//             id: "snackbar-container",
//             message: "Couldn't Copy Link",
//           });
//         }
//       });

//       ready.addEventListener("click", () => {
//         socket.emit("Room/Player/Ready");

//         ready.disabled = true;
//       });

//       socket.on("Room/Details", function (details) {
//         hideElement(loader);

//         console.log("Details! " + new Date());

//         if (details.playerList.length > 1) {
//           hideElement(isolated);
//           showElement(party);
//         } else {
//           hideElement(party);
//           showElement(isolated);
//         }

//         title.innerHTML = details.id;

//         metadata.url = input.value = url + details.id;
//         list.innerHTML = "";

//         counter.innerHTML = details.playerList.length;

//         for (let player of details.playerList) {
//           let item = document.createElement("li");
//           item.setAttribute("data-player-id", player.id);
//           item.classList.add("t-list-group-item");
//           item.innerHTML = `${player.name} ${
//             player.ready
//               ? '<span class="material-symbols-sharp" style="color: var(--tt-success)">done</span>'
//               : '<span class="material-symbols-sharp">hourglass_top</span>'
//           }`;

//           list.appendChild(item);
//         }

//         console.log(details);
//       });
//     },

//     unmounted() {
//       socket.off("Room/Details");
//     },
//   },
  "game-view": {
    mounted(view) {
      let roomId;
      let roomUrl = `${window.location.protocol}//${window.location.host}/?join=`;
      
      let teamLists = document.getElementById("game-view/team-lists");
      
      let chatInput = document.getElementById("game-view/chat-input");
      let chatForm = document.getElementById("game-view/chat-form");
      let chatContainer = document.getElementById("game-view/chat-container");
      
      let isolatedDiv = document.getElementById("game-view/lobby-modal/isolated-view");
      
      let startGame = document.getElementById("game-view/lobby-modal/player-ready");
      
      let isolatedImage = document.getElementById("game-view/lobby-modal/isolated-image");
      let qrCodeContainer = document.getElementById("game-view/lobby-modal/qr-code-container");
      let qrCodeButton = document.getElementById("game-view/lobby-modal/create-qr-code");
      
      let metadata = {
        title: "Take Turns",
        text: "Play Take Turns with Me!",
      };
      
      let shareButton = document.getElementById("game-view/lobby-modal/room-share");
      let shareUrlInput = document.getElementById("game-view/lobby-modal/room-url");
      
      shareButton.addEventListener("click", async () => {
        metadata.url = roomUrl + roomId;
        
        if (navigator.share && navigator.canShare(metadata)) {
          await navigator.share(metadata);
        }
      });
      
      qrCodeButton.addEventListener("click", () => {
        qrCodeContainer.innerHTML = "";
        
        isolatedImage.setAttribute("hidden", "");
        
        new QRCode(qrCodeContainer, {
          text: roomUrl + roomId,
          width: 240,
          height: 240,
          colorDark : '#000',
          colorLight : '#fff',
          correctLevel : QRCode.CorrectLevel.H
        });
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
      }

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

      socket.on("Room/Chat/Typing", (id) => {
        let playerListItem = document.getElementById("player-" + id);
        let playerStatus = playerListItem.querySelector(".player-status");
        
        playerStatus.innerHTML = '<i class="fa-solid fa-comment"></i>';
        
      });

      socket.on("Room/Chat/StopTyping", (id) => {
        let playerListItem = document.getElementById("player-" + id);
        let playerStatus = playerListItem.querySelector(".player-status");
        
        
        playerStatus.innerHTML = "";
        ;
      });

      socket.on("Room/Chat/Message", (details) => {
        console.log(details);
        
        chatContainer.scrollTo(0, chatContainer.scrollHeight + 500);

        chatContainer.insertAdjacentHTML(
          "beforeend",
          `
              <li class="t-list-group-item" style="display: block;">
                <i class="fa-solid fa-crown"></i>
                <strong>${details.name}: </strong>
                <span style="white-space: pre-wrap;">${details.message}</span>
              </li>
            `
        );
      });
      
      socket.on("Room/Details", (details) => {
        console.log(details)
        
        teamLists.innerHTML = "";
        
        for (let team of details.teams) {
          let teamListContainer = document.createElement("div");
          let teamList = document.createElement("ul");
              teamList.classList.add("t-list-group");
          
          let teamListTitle = document.createElement("strong");
              teamListTitle.innerHTML = team.name;
          
          for (let player of team.players) {
            let item = document.createElement("li");
            item.id = "player-" + player.id;
            item.classList.add("t-list-group-item");
            item.innerHTML = `<strong>${(details.owner.id === player.id) ? '<i class="fa-solid fa-crown"></i>' : ''} ${player.name}</strong> <span class="player-status"></span>`;

            teamList.appendChild(item);
          }
        
          teamListContainer.appendChild(teamListTitle);
          teamListContainer.appendChild(teamList);
          
          teamLists.append(teamListContainer);
        }
        
        if (details.playerList.length > 1) {
          isolatedDiv.setAttribute("hidden", "");
          
          if (socket.id === details.owner.id) startGame.disabled = false;
        }
        else {
          isolatedDiv.removeAttribute("hidden");
        }

        roomId = details.id;
      });
    },

    unmounted() {
      socket.off("Room/Chat/Typing");
      socket.off("Room/Chat/StopTyping");
      socket.off("Room/Chat/Message");
      
      socket.off("Room/Details");
    },
  },
});

socket.on("Room/Game/Start", function () {
  let lobbyModal = document.getElementById("game-view/lobby-modal");
  
  lobbyModal.setAttribute("hidden", "");

  new Snackbar({
    id: "snackbar-container",
    message: "Game start!",
  });
});

socket.on("Room/Game/Resume", function () {
  let lobbyModal = document.getElementById("game-view/lobby-modal");
  
  lobbyModal.setAttribute("hidden", "");

  new Snackbar({
    id: "snackbar-container",
    message: "Game resume",
  });
});

socket.on("Room/Game/Pause", function () {
  let lobbyModal = document.getElementById("game-view/lobby-modal");
  
  lobbyModal.removeAttribute("hidden");

  new Snackbar({
    id: "snackbar-container",
    message: "Game was paused due to insufficient players.",
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
  socket.emit("Player/Sync");

  new Snackbar({
    id: "snackbar-container",
    message: "Connected! 😀",
    type: "success",
  });
});

socket.on("connect_error", (err) => {
  new Snackbar({
    id: "snackbar-container",
    message: `An Error Occured: ${err.message}`,
    type: "danger",
  });

  controller.mountView("home-view");
});

socket.on("disconnect", () => {
  new Snackbar({
    id: "snackbar-container",
    message: "Disconnected!!?? 🤬",
    type: "danger",
  });
});
