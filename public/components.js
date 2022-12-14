class View {
  constructor() {
    
  }
}

class ViewController {
  constructor({ id, default: defaultView, mounts }) {
    this.id = id;
    this.defaultView = defaultView;
    this.callbackList = mounts;
    
    this.initController();
  }
  
  initController() {
    this.viewController = document.getElementById(this.id);
    
    if (this.defaultView) {
      this.mountView(this.defaultView);
      this.mountEvents();
    }
  }
  
  mountEvents() {
    this.viewLinks = this.viewController.querySelectorAll("[data-link]");
    
    for (let link of this.viewLinks) {
      let view = link.getAttribute("data-link");
      
      link.onclick = () => {
        this.mountView(view);
      };
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

export { ViewController };