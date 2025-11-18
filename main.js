
const STATUS = document.getElementById("online-status");
// --- Helper functions to change the status text/color ---
function setChecking() {
  STATUS.textContent = "Checking…";
  STATUS.style.background = "#c9a300"; // yellow-ish
}
function setOnline() {
  STATUS.textContent = "Online";
  STATUS.style.background = "#4CAF50"; // green
}
function setOffline() {
  STATUS.textContent = "Offline";
  STATUS.style.background = "#d32f2f"; // red
}

// --- Main connection-checking wrapper ---
async function startApp() {
  setChecking();
  // 1. Browser offline?
  if (!navigator.onLine) {
    setOffline();
    return;
  }
  // 2. Check if server responds
  try {
    const response = await fetch("https://node.vts.artomic.art/", {
      method: "HEAD",
      cache: "no-store"
    });
    if (!response.ok) {
      setOffline();
      return;
    }
  } catch (e) {
    // Fetch failed silently
    setOffline();
    return;
  }
  // 3. All good → online
  setOnline();
  // Run the rest of your JS
  runEverything();
}

// --- Your real app code here ---
function runEverything() {
  console.log("App is online!");

// Fetch the VAPID public key from the server
fetch('/vapid-public-key')
  .then(response => response.json())
  .then(data => {
    const PUBLIC_VAPID_KEY = data.publicKey;

    // Function to convert base64 to Uint8Array
    function urlBase64ToUint8Array(base64String) {
      const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
      const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

      const raw = atob(base64);
      const output = new Uint8Array(raw.length);

      for (let i = 0; i < raw.length; i++) {
        output[i] = raw.charCodeAt(i);
      }
      return output;
    }
    
  document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("overlay");
  const pushbutton = document.getElementById("ush");

  // Show overlay if notifications not yet accepted
  if (Notification.permission !== "granted" && localStorage.getItem("notificationsAccepted") !== "true") {
    overlay.classList.add('show');
  }

  pushbutton.addEventListener("click", async () => {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      localStorage.setItem("notificationsAccepted", "true");
      overlay.classList.remove('show');

      // Push subscription
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
      });

      await fetch("/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription)
      });
    } else {
      alert("Notifications not enabled");
    }
  });
});

  });   
}

// Start the logic
startApp();

  // (main.js logic here)
  if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      // Register the service worker
      const reg = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker registered:', reg);

      // Wait for the service worker to be ready
      const readyReg = await navigator.serviceWorker.ready;

      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log('Notifications not allowed');
        return;
      }

    } catch (err) {
      console.error('Service Worker / Push setup failed:', err);
    }
  });
}











 