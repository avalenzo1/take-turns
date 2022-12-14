import { ViewController } from './components.js';


let viewController = new ViewController({ id: "view-controller", default: "home-view" });

viewController.mounted({
  "home-view": function() {
    console.log("Hello!");
  }
});