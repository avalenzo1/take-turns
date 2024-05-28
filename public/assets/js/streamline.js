class Snackbar {
  constructor({ id, message, type, timeout, opacity }) {
    this.id = id;
    this.message = document.createTextNode(message);
    this.type = type || "secondary";
    this.timeout = timeout || 2000;
    this.opacity = opacity || 1;

    this.mountAlert();
  }

  get element() {
    this.alert = document.createElement("div");
    this.alert.classList.add("t-snackbar");
    this.alert.classList.add("t-snackbar--" + this.type);
    this.alert.classList.add("t-snackbar--fade-in");
    this.alert.append(this.message);
    this.alert.style.opacity = this.opacity;

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

class View {
  constructor(el) {
    this.el = el;
    this.elClone = el?.cloneNode(true);

    // Mount Events
    this.onBeforeMount = undefined;
    this.onMount = undefined;
    this.onAfterMount = undefined;

    // Unmount Events
    this.onBeforeUnmount = undefined;
    this.onUnmount = undefined;
    this.onAfterUnmount = undefined;
  }

  get view() {
    return this.el;
  }

  set view(el) {
    this.el = el;
    this.elClone = el.cloneNode(true);
  }

  reset() {
    this.el.innerHTML = this.elClone.innerHTML;
  }
}

class ViewController {
  constructor({ id, default: defaultView }) {
    this.id = id;

    this.viewController = document.getElementById(this.id);
    this.previousView;
    this.currentView;
    this.defaultView = defaultView;

    this.views = {};
  }

  init() {
    this.searchForViews();

    if (this.defaultView) {
      this.mountView(this.defaultView);
    }
  }

  searchForViews() {
    const views = this.viewController.querySelectorAll(".page-view");

    views.forEach((view) => {
      if (!(this.views[view.dataset.name] instanceof View)) {
        this.views[view.dataset.name] = new View(view);
      } else if (this.views[view.dataset.name].view === undefined) {
        this.views[view.dataset.name].view = view;
      }
    });
  }

  createLinkEvents(view) {
    this.viewLinks = this.currentView.querySelectorAll("[data-link]");

    for (let link of this.viewLinks) {
      let view = link.getAttribute("data-link");

      link.addEventListener("click", () => {
        this.mountView(view);
      });
    }
  }

  mountEvents(callbacks) {
    this.searchForViews();

    for (const view in callbacks) {
      if (!callbacks.hasOwnProperty(view)) continue;

      if (callbacks[view].onMount) {
        this.views[view].onMount = callbacks[view].onMount;
      }

      if (callbacks[view].onUnmount) {
        this.views[view].onUnmount = callbacks[view].onUnmount;
      }
    }
  }

  beforeMount() {
    this.previousView = this.currentView;

    this.viewList = this.viewController.querySelectorAll("[data-name]");

    for (let view of this.viewList) {
      if (view.classList.contains("page-view-mounting")) {
        console.log("Removing mounting class from " + view.dataset.name);
        view.classList.remove("page-view-mounting");
      }

      if (view.classList.contains("page-view-mount")) {
        view.classList.remove("page-view-mount");
      }
    }

    if (this.previousView) {
      let view = this.previousView.dataset.name;

      this.views[view].reset();

      if (this.views[view] && this.views[view].onBeforeMount) {
        this.views[view].onBeforeMount(this.currentView);
      }
    }
  }

  mount(view) {
    this.currentView = this.viewController.querySelector(
      `[data-name='${view}']`
    );

    if (this.currentView === null) {
      throw new Error(`View '${view}' does not exist.`);
    }

    this.currentView.classList.add("page-view-mount");
    this.currentView.classList.add("page-view-mounting");

    const v = this.currentView;

    setTimeout(() => {
      console.log("Removing mounting class from " + v.dataset.name);
      v.classList.remove("page-view-mounting");
    }, 600);

    if (this.currentView) {
      let view = this.currentView.dataset.name;

      if (this.views[view] && this.views[view].onMount) {
        this.views[view].onMount(this.currentView);
      }
    }
  }

  afterMount() {
    this.createLinkEvents();

    if (this.currentView) {
      let view = this.currentView.dataset.name;

      if (this.views[view] && this.views[view].onAfterMount) {
        this.views[view].onAfterMount(this.currentView);
      }
    }
  }

  mountView(view) {
    this.beforeMount();
    this.mount(view);
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

function hideElement(element) {
  element.setAttribute("hidden", "");
}

function showElement(element) {
  element.removeAttribute("hidden");
}
