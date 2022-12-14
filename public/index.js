import { ViewController, Alert } from './components.js';

const socket = io();

// client-side
socket.on("connect", () => {
  new Alert({ id: "alert-container", message: socket.id, type: "success" });
});

socket.on("disconnect", () => {
  new Alert({ id: "alert-container", message: socket.id, type: "success" });
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