export function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").then((registration) => {
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (!newWorker) return;
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && registration.waiting && navigator.serviceWorker.controller) {
            showUpdateToast(registration);
          }
        });
      });
    });

    let refreshed = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshed) return;
      refreshed = true;
      window.location.reload();
    });
  });
}

function showUpdateToast(registration) {
  const toast = document.getElementById("update-toast");
  if (!toast) return;
  toast.hidden = false;
  toast.onclick = () => {
    registration.waiting.postMessage("skip-waiting");
    toast.hidden = true;
  };
}
