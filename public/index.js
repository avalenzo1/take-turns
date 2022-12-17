import { ViewController, Snackbar, clearEvents } from "./components.js";
import { Game } from "./take-turns.js";
import environment from "./environment.json" assert { type: "json" };

const socket = io();
const controller = new ViewController({
  id: "view-controller",
  default: "home-view",
});

let room, player;
const game = new Game();

controller.mount({
  "home-view": {
    mounted() {},
  },

  "new-view": {
    mounted() {
      socket.emit("server/new-room");
      new Snackbar({
        id: "snackbar-container",
        message: "Creating Room",
      });
    },
  },

  "join-view": {
    elements: {
      submit: document.getElementById("join-view/room-submit"),
    },
    events: {
      submit(e) {
        e.preventDefault();
        socket.emit(
          "server/join-room",
          document.getElementById("join-view/room-input").value
        );
      },
    },
    mounted(view) {
      this.elements.submit.addEventListener("click", this.events.submit);
    },
    unmounted(view) {
      this.elements.submit.removeEventListener("click", this.events.submit);
    },
  },

  "lobby-view": {
    mounted(view) {
      let input = document.getElementById("new-view/room-url");
      let share = document.getElementById("new-view/room-share");
      let list = document.getElementById("new-view/player-list");
      let counter = document.getElementById("new-view/player-count");
      let ready = document.getElementById("new-view/player-ready");
      let cancel = view.querySelector('[data-navigate="back"]');

      let metadata = {
        title: "Take Turns",
        text: "Play Take Turns with Me!",
        url: "https://take-turns.glitch.me/?join=",
      };

      cancel.addEventListener("click", () => {
        socket.emit("server/leave-room", room.id);
        
        new Snackbar({
          id: "snackbar-container",
          message: "Left Room",
        });
      });

      share.addEventListener("click", async () => {
        await navigator.share(metadata);
      });

      input.addEventListener("click", async () => {
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
        socket.emit("server/player-state", {
          id: room.id,
          state: {
            ready: true,
          },
        });
        
        ready.disabled = true;
        
        // controller.mountView("game-view");
      });

      socket.on("server/room-details", function (details) {
        metadata.url = input.value =
          "https://take-turns.glitch.me/?join=" + details.id;
        list.innerHTML = "";

        counter.innerHTML = details.playerList.length;

        for (let player of details.playerList) {
          let li = document.createElement("li");
          
          li.innerHTML = `${player.name} ${ player.ready ? '<span class="material-symbols-sharp">done</span>' : '<span class="material-symbols-sharp">hourglass_top</span>' }`;

          list.appendChild(li);
        }
      });

      socket.emit("server/room-details", room.id);
    },
  },
  "game-view": {
    mounted() {
      alert("game start!")
    }
  }
});

(function () {
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  });
  const id = params.join;

  if (id) {
    socket.emit("server/join-room", id);
  }
})();

(function () {})();

socket.on("server/new-room", function (id) {
  new Snackbar({
    id: "snackbar-container",
    message: "Room Created",
  });

  socket.emit("server/join-room", id);
});

socket.on("server/join-room", function (res) {
  switch (res.type) {
    case "success":
      new Snackbar({
        id: "snackbar-container",
        message: "Joined Room",
      });
      room = res.room;

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
