import { ViewController, Snackbar, clearEvents } from "./components.js";
import { Game } from "./take-turns.js";

const socket = io();
const game = new Game();
const controller = new ViewController({
  id: "view-controller",
  default: "homeView",
});

controller.mount({
  homeView: {
    mounted(view) {},
  },

  newView: {
    mounted(view) {
      socket.emit("server/new-room");

      new Snackbar({
        id: "snackbar-container",
        message: "Creating Room",
        type: "success",
      });
    },
  },

  joinView: {
    mounted(view) {
      let input = document.getElementById("join-view/room-input");
      let submit = document.getElementById("join-view/room-submit");

      submit.addEventListener("click", (e) => {
        e.preventDefault();

        socket.emit("server/join-room", input.value);
      });
    },
  },

  lobbyView: {
    events: {
      details(details) {
        let input = document.getElementById("new-view/room-url");
        let share = document.getElementById("new-view/room-share");
        let list = document.getElementById("new-view/player-list");
        let counter = document.getElementById("new-view/player-count");
        let ready = document.getElementById("new-view/player-ready");

        let shareData = {
          title: "Take Turns",
          text: "Play Take Turns with Me!",
          url: "https://take-turns.glitch.me/?join=",
        };

        share.addEventListener("click", async () => {
          await navigator.share(shareData);
        });

        input.addEventListener("click", () => {
          input.select();
          input.setSelectionRange(0, 99999); // For mobile devices

          // Copy the text inside the text field
          navigator.clipboard.writeText(input.value);

          new Snackbar({
            id: "snackbar-container",
            message: "Copied Link",
            type: "success",
          });
        });

        ready.addEventListener("click", () => {
          socket.emit("server/player-ready", game.uid);
          ready.setAttribute("disabled", "");
        });

        shareData.url = input.value =
          "https://take-turns.glitch.me/?join=" + details.uid;
        list.innerHTML = "";

        counter.innerHTML = details.playerList.length;

        for (let player of details.playerList) {
          let li = document.createElement("li");

          li.innerHTML = player.name + " - " + player.ready;

          list.appendChild(li);
        }

        game.uid = details.uid;
      },
    },
    mounted(view) {
      socket.on("server/room-details", this.events.details);
    },

    unmounted(view) {
      socket.off("server/room-details", this.events.details);
    },
  },
});

(function () {
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  });
  const roomUID = params.join;

  if (roomUID) {
    socket.emit("server/join-room", roomUID);
  }
})();

socket.on("server/join-room", function (res) {
  switch (res.type) {
    case "success":
      new Snackbar({
        id: "snackbar-container",
        message: "Joined Room",
        type: "success",
      });
      controller.mountView("lobby-view");
      break;
    case "error":
      new Snackbar({
        id: "snackbar-container",
        message: res.message,
        type: "danger",
      });
  }
  
  
});

// client-side
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
  socket.emit("server/leave-room", socket.id);
});
