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
const originalSrc = "/images/OIP.png";
const hoverSrc = "/images/colorOIP.png";

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


let benchmarkStatus = null;

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


   // document.getElementById("openModal").addEventListener("click", function () {
   //   document.getElementById("overlay").style.display = "flex";
   // });
    document.getElementById("overlay").addEventListener("click", function (e) {
      if (e.target.id === "overlay") {
        document.getElementById("overlay").style.display = "block";
     }
    });
    document.getElementById("push").addEventListener("click", function () {
      document.getElementById("overlay").style.display = "none";
    });
    

    

/* -----------------------------------------------------------
   Helper: Refresh dropdown list with keys from localStorage
----------------------------------------------------------- */
function refreshDropdown() {
    const dropdown = document.getElementById("storedFilesDropdown");
    dropdown.innerHTML = "files";

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        // Only list JSON entries
        if (key.startsWith("json_")) {
            const option = document.createElement("option");
            option.value = key;
            option.textContent = key.replace("json_", "");
            dropdown.appendChild(option);
        }
    }
}






      /* -----------------------------------------------------------
   1. Upload multiple JSON files → save to localStorage
----------------------------------------------------------- */
      document.getElementById("saveFilesBtn").addEventListener("click", () => {
        const files = document.getElementById("jsonUpload").files;

        if (!files.length) {
          alert("Please select at least one JSON file.");
          return;
        }

        [...files].forEach((file) => {
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const parsed = JSON.parse(reader.result);
              localStorage.setItem("json_" + file.name, JSON.stringify(parsed));
            } catch (e) {
              alert(`Invalid JSON in file: ${file.name}`);
            }

            refreshDropdown();
          };
          reader.readAsText(file);
        });

        alert("Files saved to localStorage!");
      });

function validateJsonForChart(json) {
  if (!json) return false;

  // --- FORMAT 1: Array of objects -----------------------
  if (Array.isArray(json)) {
    if (json.length === 0) return false;
    for (const item of json) {
      if (
        typeof item.label !== "string" ||
        typeof item.value !== "number" ||
        !isFinite(item.value)
      ) {
        return false;
      }
    }
    return true; // valid format 1
  }

  // --- FORMAT 2: { labels:[], values:[] } ----------------
  if (
    typeof json === "object" &&
    Array.isArray(json.labels) &&
    Array.isArray(json.values) &&
    json.labels.length === json.values.length
  ) {
    if (!json.labels.every(l => typeof l === "string")) return false;
    if (!json.values.every(v => typeof v === "number" && isFinite(v))) return false;
    return true; // valid format 2
  }

  // otherwise invalid
  return false;
}

      /* -----------------------------------------------------------
   2. Draw chart from selected JSON file
----------------------------------------------------------- */


let chart = null;

// Helper: calculate regression line
function getRegressionLine(x, y) {
  const n = x.length;
  const sumX = x.reduce((a,b) => a+b, 0);
  const sumY = y.reduce((a,b) => a+b, 0);
  const sumXY = x.reduce((a,b,i) => a + b*y[i], 0);
  const sumXX = x.reduce((a,b) => a + b*b, 0);

  const slope = (n*sumXY - sumX*sumY) / (n*sumXX - sumX*sumX);
  const intercept = (sumY - slope*sumX)/n;

  return x.map(xi => slope*xi + intercept);
}

function drawChart(labels, values) {
  const ctx = document.getElementById("myChart").getContext("2d");

  if (chart) chart.destroy();

  // Convert labels to numbers
  const numericLabels = labels.map(l => Number(l));

  const regressionValues = getRegressionLine(numericLabels, values);

  // Convert into Chart.js {x,y} format
  const dataPoints = numericLabels.map((l, i) => ({ x: l, y: values[i] }));
  const regressionPoints = numericLabels.map((l, i) => ({ x: l, y: regressionValues[i] }));

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [
        {
          label: "Data",
          data: dataPoints,
          borderColor: 'rgba(192,192,192,0.8)',
          backgroundColor: 'rgba(192,192,192,0.3)'
        },
        {
          label: "Regression",
          data: regressionPoints,
          borderColor: 'red',
          backgroundColor: 'transparent',
          borderDash: [5,5]
        }
      ]
    },
    options: {
      parsing: false,
      plugins: {
        legend: { labels: { color: 'black' } }
      },
      scales: {
        x: { type: 'linear', ticks: { color: 'black' }, grid: { color: 'black' } },
        y: { ticks: { color: 'black' }, grid: { color: 'black' } }
      }
    }
  });
}

const testJson = {
  "labels": [0,1,2,3,4,5,6],
  "values": [1.0, 2.1, 4.2, 6.1, 7.9, 10.2, 11.8]
};

let testLabels, testValues;

if (Array.isArray(testJson)) {
  testLabels = testJson.map(item => item.label);
  testValues = testJson.map(item => item.value);
} else {
  testLabels = testJson.labels;
  testValues = testJson.values;
}

console.log(testLabels);  // should print [0,1,2,3,4,5,6]
console.log(testValues);  // should print [1.0, 2.1, 4.2, 6.1, 7.9, 10.2, 11.8]






function getRegressionLine(x, y) {
  const n = x.length;
  const sumX = x.reduce((a,b) => a+b, 0);
  const sumY = y.reduce((a,b) => a+b, 0);
  const sumXY = x.reduce((a,b,i) => a + b*y[i], 0);
  const sumXX = x.reduce((a,b) => a + b*b, 0);
  const slope = (n*sumXY - sumX*sumY) / (n*sumXX - sumX*sumX);
  const intercept = (sumY - slope*sumX)/n;
  return x.map(xi => slope*xi + intercept);
}

const testRegression = getRegressionLine(testLabels, testValues);
console.log(testRegression);


document.getElementById("drawChartBtn").addEventListener("click", () => {
  const key = document.getElementById("storedFilesDropdown").value;

  if (!key) {
    alert("Please select a stored JSON file.");
    return;
  }

  const json = JSON.parse(localStorage.getItem(key));

  if (!validateJsonForChart(json)) {
    alert("Stored JSON has invalid format for charting.");
    return;
  }

  // ✔ Corrected: support BOTH JSON formats
  let labels, values;

  // Format 1: Array of objects
  if (Array.isArray(json)) {
    labels = json.map(item => item.label);
    values = json.map(item => item.value);
  }
  // Format 2: {labels: [], values: []}
  else {
    labels = json.labels;
    values = json.values;
  }

  drawChart(labels, values);
});


