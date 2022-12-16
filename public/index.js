import { ViewController, Snackbar, clearEvents } from "./components.js";
import { Game } from "./take-turns.js";

const socket = io();
const controller = new ViewController({
  id: "view-controller",
  default: "home-view",
});

let room, player;


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
        type: "success",
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
    mounted() {},
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

(function () {
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
    socket.emit("server/player-state", { ready: true });
  });

  socket.emit("server/room-details", game.uid);

  socket.on("server/room-details", function (details) {
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

    console.log("HELLO?/");
  });
})();

socket.on("server/new-room", function (roomUID) {
  new Snackbar({
    id: "snackbar-container",
    message: "Room Created",
    type: "success",
  });

  socket.emit("server/join-room", roomUID);
});

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
      controller.mountView("home-view");
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
