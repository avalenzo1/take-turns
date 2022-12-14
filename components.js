class ViewController {
  constructor({ id, default: defaultView }) {
    this.id = id;
    this.defaultView = defaultView;
    
    this.initController();
  }
  
  initController() {
    this.viewController = document.getElementById(this.id);
    this.viewList = this.viewController.querySelectorAll("[data-view]");
  }
  
  setCurrentView(currentView) {
    for (let view of this.viewList) {
      view.removeAttribute("data-current-view");
    }
    
    this.currentView = this.viewList.querySelect(`[data-view='${currentView}']`);
    this.currentView.setAttribute("data-current-view", "");
    
  }
}

export { ViewController };