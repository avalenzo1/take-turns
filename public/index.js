import { ViewController, Snackbar, clearEvents, hideElement, showElement } from "./components.js";
import { createClient } from "./client.js";
import environment from "./environment.json" assert { type: "json" };

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
            socket.emit("Server/Room/Create");

            new Snackbar({
              id: "snackbar-container",
              message: "Creating Room",
            });
        },
    },

    "join-view": {
        mounted(view) {
            let form = document.getElementById("join-view/room-form");
            let input = document.getElementById("join-view/room-input");

            form.addEventListener("submit", (e) => {
                e.preventDefault();
                socket.emit("Server/Room/Join", input.value);
            });
        },
        unmounted(view) {},
    },

    "lobby-view": {
        mounted(view) {
            let isolated = document.getElementById("lobby-view/isolated-view");
            let party = document.getElementById("lobby-view/party-view");
            let input = document.getElementById("lobby-view/room-url");
            let title = document.getElementById("lobby-view/room-id");
            let share = document.getElementById("lobby-view/room-share");
            let list = document.getElementById("lobby-view/player-list");
            let counter = document.getElementById("lobby-view/player-count");
            let ready = document.getElementById("lobby-view/player-ready");
            let cancel = view.querySelector('[data-navigate="back"]');
            let loader = document.getElementById("lobby-view/loader");
            let url =  `${window.location.protocol}//${window.location.host}/?join=`;

            let metadata = {
                title: "Take Turns",
                text: "Play Take Turns with Me!",
            };

            cancel.addEventListener("click", () => {
                ready.disabled = false;
                socket.emit("Server/Room/Leave");

                new Snackbar({
                    id: "snackbar-container",
                    message: "Left Room",
                });
            });

            share.addEventListener("click", async() => {
                await navigator.share(metadata);
            });

            input.addEventListener("click", async() => {
                input.select();
                input.setSelectionRange(0, 99999); // For mobile devices

                try {
                    await navigator.clipboard.writeText(input.value);

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

            ready.addEventListener("click", () => {
                socket.emit("Server/Room/Set", { ready: true });

                ready.disabled = true;
            });

            socket.on("Server/Room/State/Start", function(details) {
                controller.mountView("game-view");
            });

            socket.on("Server/Room/State", function(details) {
                hideElement(loader);

                if (details.playerList.length > 1) {
                    hideElement(isolated);
                    showElement(party);
                } else {
                    hideElement(party);
                    showElement(isolated);
                }

                title.innerHTML = details.id;

                metadata.url = input.value =
                    url + details.id;
                list.innerHTML = "";

                counter.innerHTML = details.playerList.length;

                for (let player of details.playerList) {
                    let item = document.createElement("li");
                    item.setAttribute("data-player-id", player.id);
                    item.classList.add("t-list-group-item");
                    item.innerHTML = `${player.name} ${
            player.state.ready
              ? '<span class="material-symbols-sharp" style="color: var(--tt-success)">done</span>'
              : '<span class="material-symbols-sharp">hourglass_top</span>'
          }`;

                    list.appendChild(item);
                }

                console.log(details)
            });
        },
    },
    "game-view": {
        mounted(view) {
            new Snackbar({
                id: "snackbar-container",
                message: "Game Start!",
            });

            client.createStream(view);
        },

        unmounted() {

        },
    },
});

socket.on("Server/Console", function(res) {
  new Snackbar({
      id: "snackbar-container",
      type: res.type,
      message: res.message,
  });

  if (res.type === 'warning') console.warn(res.message);
  if (res.type === 'danger') console.error(res.message);
});

socket.on("Server/Room/Create", function(room) {
  new Snackbar({
      id: "snackbar-container",
      message: "Room Created",
  });

  socket.emit("Server/Room/Join", room.id);
});

socket.on("Server/Room/Join", function() {
  new Snackbar({
    id: "snackbar-container",
    message: "Joined Room",
  });

  controller.mountView("lobby-view");
});

socket.on("connect", () => {
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
});

socket.on("disconnect", () => {
    new Snackbar({
        id: "snackbar-container",
        message: "Disconnected!!?? 🤬",
        type: "danger",
    });
});