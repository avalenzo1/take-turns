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

    this.alert.addEventListener("animationend", () => {
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
    
    this.previousView;
    this.currentView;
    this.defaultView = defaultView;
    
    this.historyList = [];
    this.callbackList = [];

    this.initController();
  }

  initController() {
    this.viewController = document.getElementById(this.id);

    if (this.defaultView) {
      this.mountView(this.defaultView);
    }
  }

  mount(callbackList) {
    this.callbackList = callbackList;
  }

  beforeMount() {
    this.previousView = this.currentView;
    
    if (this.previousView) {
      let view = this.previousView.getAttribute("data-view");

      clearEvents(this.previousView);
      
      if (this.callbackList[view] && this.callbackList[view].unmounted) {
        this.callbackList[view].unmounted(this.currentView);
      }
    }
  }

  afterMount() {
    if (this.currentView) {
      let view = this.currentView.getAttribute("data-view");
      
      if (this.callbackList[view] && this.callbackList[view].mounted) {
        this.callbackList[view].mounted(this.currentView);
      }
    }
  }

  mountLinks(view) {
    for (let link of this.viewLinks) {
      let view = link.getAttribute("data-link");

      link.addEventListener("click", () => {
        this.mountView(view);
      });
    }
  }

  mountView(view) {
    // View Unmounted
    this.beforeMount();

    this.viewList = this.viewController.querySelectorAll("[data-view]");

    for (let view of this.viewList) {
      view.classList.remove("page-view-mount");
    }

    this.currentView = this.viewController.querySelector(
      `[data-view='${view}']`
    );
    this.currentView.classList.add("page-view-mount");

    this.viewLinks = this.currentView.querySelectorAll("[data-link]");

    this.mountLinks();
    this.afterMount();
  }
}

function getDescendantNodes(node, all = []) {
  all.push(...node.childNodes);
  for (const child of node.childNodes) getDescendantNodes(child, all);
  return all;
}

function clearEvents(parent) {
  let nodes = [];

  getDescendantNodes(parent, nodes);

  for (let node of nodes) {
    let clone = node.cloneNode(true);
    node.parentNode.replaceChild(clone, node);
  }
}

export { ViewController, Snackbar, clearEvents };
