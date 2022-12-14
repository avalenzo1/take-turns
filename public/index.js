import { ViewController } from './components.js';

const mounts = {
  "home-view": {
    mounted() {
      alert("home mounted");
    },
    
    unmounted() {
      alert("home unmounted");
    }
  }
};

const viewController = new ViewController({ id: "view-controller", default: "home-view", mounts: mounts });