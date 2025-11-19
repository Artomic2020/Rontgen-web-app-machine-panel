// Clear inputs on load
window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('input, textarea').forEach(el => {
    el.value = '';
  });
});

// --------------
// IMAGE HOVER
// --------------
const img = document.getElementById('hoverImg');
const originalSrc = 'images/OIP.png';
const hoverSrc = 'images/colorOIP.png';

img.addEventListener('mouseenter', () => img.src = hoverSrc);
img.addEventListener('mouseleave', () => img.src = originalSrc);

// --------------
// FULLSCREEN
// --------------
function openFullscreen() {
  const elem = document.documentElement;
  if (elem.requestFullscreen) elem.requestFullscreen();
  else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
  else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
}

// --------------
// CLOCK
// --------------
function updateClock() {
  const now = new Date();

  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  const day = now.getDate().toString().padStart(2, "0");
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const year = now.getFullYear();

  document.getElementById("time").textContent = `${hours}:${minutes} ${ampm}`;
  document.getElementById("date").textContent = `${day}.${month}.${year}`;
}
setInterval(updateClock, 1000);
updateClock();

// --------------
// BENCHMARK UI
// --------------
const startBtn = document.getElementById('start');
const progressBar = document.getElementById('progress');
const statusEl = document.getElementById('status');

let pollingInterval = null;

startBtn.onclick = async () => {
  startBtn.disabled = true;
  statusEl.textContent = 'Starting...';
  progressBar.style.width = '0%';

  try {
    const res = await fetch("/benchmark")
;
    if (!res.ok) throw new Error('Failed to start benchmark');

    pollingInterval = setInterval(async () => {
      try {
        const statusRes = await fetch("/benchmark-status")
        const data = await statusRes.json();

        progressBar.style.width = `${data.progress}%`;

        let text = `${data.lastMessage || ''}\n\n`;

        if (data.workers) {
          text += "Workers:\n";
          for (const id in data.workers) {
            const w = data.workers[id];
            text += `  • Worker ${id}: job ${w.job ?? 'idle'} — ${w.progress || 0}%\n`;
          }
        }

        statusEl.textContent = text.trim();

        if (data.status === 'done' || data.status === 'error') {
          clearInterval(pollingInterval);
          startBtn.disabled = false;
        }

      } catch (err) {
        console.error("Polling error", err);
      }
    }, 1000);

  } catch (err) {
    console.error(err);
    statusEl.textContent = "Failed to start benchmark";
    startBtn.disabled = false;
  }
};


    document.getElementById("openModal").addEventListener("click", function () {
      document.getElementById("overlay").style.display = "flex";
    });
    document.getElementById("overlay").addEventListener("click", function (e) {
      if (e.target.id === "overlay") {
        document.getElementById("overlay").style.display = "block";
      }
    });
    document.getElementById("push").addEventListener("click", function () {
      document.getElementById("overlay").style.display = "none";
    });
    

