let fullscreenBtn = document.getElementById("toggle-fullscreen-btn");
let audioBtn = document.getElementById("toggle-audio-btn");
let aboutBtn = document.getElementById("toggle-about-btn");
let aboutModal = document.getElementById("about-modal")

fullscreenBtn.onclick = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
    window.canvas.focus(); 
  } else if (document.exitFullscreen) {
    document.exitFullscreen();
  }
  
  window.canvas.focus();
};

audioBtn.onclick = () => {
  document.defaultView.manifest.muted = !document.defaultView.manifest.muted;
  
  if (document.defaultView.manifest.muted) {
    audioBtn.innerHTML = "<span class='material-symbols-outlined'>volume_off</span>";
  } else {
    audioBtn.innerHTML = "<span class='material-symbols-outlined'>volume_up</span>";
  }
  
  window.canvas.focus();
};

aboutBtn.onclick = () => {
  aboutModal.classList.toggle("hidden");
  
  window.canvas.focus();
};

document.addEventListener("fullscreenchange", () => {
  if (!document.fullscreenElement) {
    fullscreenBtn.innerHTML = "<span class='material-symbols-outlined'>fullscreen</span>";
  } else if (document.exitFullscreen) {
    fullscreenBtn.innerHTML = "<span class='material-symbols-outlined'>close_fullscreen</span>";
  }
});

  window.canvas.focus();
