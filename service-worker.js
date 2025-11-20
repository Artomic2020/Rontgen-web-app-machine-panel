// -------------------------------
// CONFIG
// -------------------------------
const SW_VERSION = "v4";
const CACHE_NAME = `app-shell-${SW_VERSION}`;


self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
  self.clients.claim();  // take control of all pages immediately
});


const APP_SHELL = [
  "/",
  "/index.html",
  "/css/styles.css",
  "/js/main.js",
  "/js/script.js",
  "/icons/favicon180.png",
  "/images/nodejs-icon.jpg",
  "/images/express.png",
  "/images/OIP.png",
  "/images/colorOIP.png",
  "/images/turn.png",
  "/images/fan.png",
  "/images/cone_1.png",
  "/images/column.png",
  "/images/speaker.png",
  "/images/knob_Base.png",
  "/images/wider.png",
  "/images/PNG/isometric_set_0011_TDC_1200_isometric_0deg_1.png"

];

// -------------------------------
// INSTALL EVENT
// -------------------------------



self.addEventListener('install', (e) => {
  console.log('Service Worker installing...');
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});



// -------------------------------
// FETCH HANDLER
// -------------------------------
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;  // ← ADD THIS LINE

  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    (async () => {
      try {
        const cached = await caches.match(event.request);
        if (cached) return cached;

        const response = await fetch(event.request);
        if (!response.ok) throw new Error();

        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, response.clone());
        return response;
      } catch (err) {
        console.warn('Fetch failed:', err);
        return Response.error();
      }
    })()
  );
});


// -------------------------------
// PUSH HANDLER
// -------------------------------
self.addEventListener("push", event => {
  if (!event.data) {
    console.warn("Push received, but no data.");
    return;
  }

  let data;

  // Try JSON first
  try {
    data = event.data.json();
  } catch {
    // Fallback: treat as text
    const text = event.data.text();
    console.warn("Non-JSON push received, treating as text:", text);

    data = {
      title: "Notification",
      body: text
    };
  }

  const title = data.title || "Notification";
  const body = data.body || "(No message)";

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/icons/favicon180.png"
    })
  );
});








