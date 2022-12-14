import { ViewController, Snackbar } from './components.js';

const socket = io();

// client-side
socket.on("connect", () => {
  new Snackbar({ id: "snackbar-container", message: "Connected! 😀", type: "success" });
});

socket.on("disconnect", () => {
  new Snackbar({ id: "snackbar-container", message: "Disconnected!!?? 🤬", type: "success" });
});

const mounts = {
  "new-view": {
    mounted(view) {
    },
    
    unmounted(view) {
      
    }
  }
};

const viewController = new ViewController({ id: "view-controller", default: "home-view", mounts: mounts });