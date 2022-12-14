import { ViewController } from './components.js';

let mountController = {
  "home-view": {
    mounted() {
      
    },
    
    unmounted() {
    
    }
  }
};

let viewController = new ViewController({ id: "view-controller", default: "home-view", mount: mountController });