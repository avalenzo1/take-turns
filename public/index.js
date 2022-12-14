import { ViewController, Snackbar } from './components.js';

const socket = io();

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

const mounts = {
  "new-view": {
    mounted(view) {
      socket.emit("server/new-room");
      
      socket.on("server/new-room", function() {
        console.log("hello!!");
      });
    },
    
    unmounted(view) {
      
    }
  }
};

const viewController = new ViewController({ id: "view-controller", default: "home-view", mounts: mounts });