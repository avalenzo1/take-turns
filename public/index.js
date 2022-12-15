import { ViewController, Snackbar } from './components.js';
import { Game } from './take-turns.js';

const socket = io();
const controller = new ViewController({ id: "view-controller", default: "home-view" });
const game = new Game();

controller.mount({
  "new-view": {
    mounted(view) {
      socket.emit("server/new-room");
      new Snackbar({ id: "snackbar-container", message: "Creating Room", type: "success" });
      
      socket.on("server/new-room", function(roomUID) {
        new Snackbar({ id: "snackbar-container", message: "Room Created", type: "success" });
        
        socket.emit("server/join-room", roomUID);
      });
    },
    
    unmounted(view) {
      
      
    }
  },
      
  "lobby-view": {
    mounted(view) {
      
    },
    
    unmounted(view) {
      
    }
  }
});

let input = document.getElementById("new-view/room-url");
let list =  document.getElementById("new-view/player-list");
let counter = document.getElementById("new-view/player-count");

socket.on("server/room-details", function (details) {
  console.log(details);
  
  input.value = 'https://take-turns.glitch.me/?join-room=' + details.uid;
  list.innerHTML = '';
  
  counter.innerHTML = details.playerList.length;
  
  for (let player of details.playerList) {
    let li = document.createElement("li");
    
    li.innerHTML = player.id;
    
    list.appendChild(li);
    
  }
});

socket.on("server/join-room", function(res) {
  switch (res.type) {
    case 'success':
      new Snackbar({ id: "snackbar-container", message: "Joined Room", type: "success" });
      controller.mountView("lobby-view");
      break;
    case 'error':
      new Snackbar({ id: "snackbar-container", message: res.message, type: "danger" });
  }
});

// client-side
socket.on("connect", () => {
  new Snackbar({ id: "snackbar-container", message: "Connected! 😀", type: "success" });
});

socket.on("connect_error", (err) => {
  new Snackbar({ id: "snackbar-container", message: `An Error Occured: ${err.message}`, type: "danger" });
});

socket.on("disconnect", () => {
  new Snackbar({ id: "snackbar-container", message: "Disconnected!!?? 🤬", type: "danger" });
});

