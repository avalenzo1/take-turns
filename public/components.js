class Snackbar {
  constructor({ id, message, type, timeout }) {
    this.id = id;
    this.message = document.createTextNode(message);
    this.type = type || "info";
    this.timeout = timeout || 2000;
    
    this.mountAlert();
  }
  
  get element() {
    this.alert = document.createElement("div");
    this.alert.classList.add("t-snackbar");
    this.alert.classList.add("t-snackbar--fade-in");
    this.alert.append(this.message);
    
    this.alert.addEventListener('animationend', () => {
      if (this.alert.classList.contains("t-snackbar--fade-in")) {
        this.alert.classList.remove("t-snackbar--fade-in");
        
        setTimeout(() => {
          this.alert.classList.add("t-snackbar--fade-out");
        }, this.timeout);
      } else {
        this.alert.remove();
      }
    });
    
    return this.alert;
  }
  
  mountAlert() {
    this.parent = document.getElementById(this.id);
    this.parent.appendChild(this.element);
  }
}

class ViewController {
  constructor({ id, default: defaultView }) {
    this.id = id;
    this.defaultView = defaultView;
    this.callbackList = [];
    
    this.initController();
  }
  
  initController() {
    this.viewController = document.getElementById(this.id);
    
    if (this.defaultView) {
      this.mountView(this.defaultView);
      this.mountEvents();
    }
  }
  
  mount(callbackList) {
    this.callbackList = callbackList;
  }
  
  mountEvents() {
    this.viewLinks = this.viewController.querySelectorAll("[data-link]");
    
    for (let link of this.viewLinks) {
      let view = link.getAttribute("data-link");
      
      link.addEventListener("click", () => {
        this.mountView(view);
      });
    }
  }
  
  mountView(view) {
    if (this.currentView) {
      let oldView = this.currentView.getAttribute("data-view");
      
      if (this.callbackList[oldView] && this.callbackList[oldView].unmounted) this.callbackList[oldView].unmounted(this.currentView);
    }
    
    this.viewList = this.viewController.querySelectorAll("[data-view]");
    
    for (let view of this.viewList) {
      view.removeAttribute("data-current-view");
    }
    
    this.currentView = this.viewController.querySelector(`[data-view='${view}']`);
    this.currentView.setAttribute("data-current-view", "");
    
    if (this.callbackList[view] && this.callbackList[view].mounted) {
      this.callbackList[view].mounted(this.currentView);
    }
  }
}

function clearEvents(querySelector) {
  this.parent = document.querySelector(querySelector);
  
  
}

export { ViewController, Snackbar, clearEvents };