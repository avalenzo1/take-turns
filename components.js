class ViewController {
  constructor({ id }) {
    this.id = id;
    
    this.initController();
  }
  
  initController() {
    this.viewController = document.getElementById(this.id);
  }
}

export { ViewController };