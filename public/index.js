import { ViewController } from './components.js';

const socket = io();

const mounts = {
  "new-view": {
    mounted(view) {
      // client-side
      socket.on("connect", () => {
        console.log(socket.id); // x8WIv7-mJelg7on_ALbx
      });

      socket.on("disconnect", () => {
        console.log(socket.id); // undefined
      });
    },
    
    unmounted(view) {
      
    }
  }
};

const viewController = new ViewController({ id: "view-controller", default: "home-view", mounts: mounts });