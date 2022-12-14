class ViewController {
  constructor({ id, default: defaultView }) {
    this.id = id;
    this.defaultView = defaultView;
    
    this.initController();
  }
  
  initController() {
    this.viewController = document.getElementById(this.id);
    this.setEvents();
    
    if (this.defaultView) {
      this.setCurrentView(this.defaultView);
    }
  }
  
  setEvents() {
    this.viewLinks = this.viewController.querySelectorAll("[data-link]");
    
    for (let link of this.viewLinks) {
      let currentView = link.getAttribute("data-link");
      
      link.onclick = () => {
        this.setCurrentView(currentView);
      };
    }
  }
  
  setCurrentView(currentView) {
    this.viewList = this.viewController.querySelectorAll("[data-view]");
    
    for (let view of this.viewList) {
      view.removeAttribute("data-current-view");
    }
    
    this.currentView = this.viewController.querySelector(`[data-view='${currentView}']`);
    this.currentView.setAttribute("data-current-view", "");
  }
}

export { ViewController };