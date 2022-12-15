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
      
      socket.on("server/new-room", function(room) {
        new Snackbar({ id: "snackbar-container", message: "Room Created", type: "success" });
        
        game.room = room;
      });
      
      controller.mountView("lobby-view");
    },
    
    unmounted(view) {
      
    }
  },
      
  "lobby-view": {
    mounted(view) {
      
    }
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