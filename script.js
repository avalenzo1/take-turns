class ViewController {
  constructor({ id, default: defaultView }) {
    this.id = id;
    this.defaultView = defaultView;
    
    this.initController();
  }
  
  initController() {
    this.viewController = document.getElementById(this.id);
    this.viewLinks = this.viewController.querySelectorAll()
    
    if (this.defaultView) {
      this.setCurrentView(this.defaultView);
    }
  }
  
  setCurrentView(currentView) {
    for (let view of this.viewList) {
      view.removeAttribute("data-current-view");
    }
    
    this.currentView = this.viewController.querySelector(`[data-view='${currentView}']`);
    this.currentView.setAttribute("data-current-view", "");
  }
}

let viewController = new ViewController({ id: "view-controller", default: "home-view" });