require('dotenv').config();

// --------------------------------------------------
// Imports
// --------------------------------------------------
const path = require('path');
const { Worker } = require('worker_threads');
const express = require('express');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const os = require("os");

const app = express();

// --------------------------------------------------
// Static Files
// --------------------------------------------------
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static('/home/artomic/skumringen.artomic.art/css'));
app.use('/images', express.static('/home/artomic/skumringen.artomic.art/images'));
app.use('/js', express.static('/home/artomic/skumringen.artomic.art/js'));
app.use('/fonts', express.static('/home/artomic/skumringen.artomic.art/fonts'));

// --------------------------------------------------
// Basic Routes
// --------------------------------------------------
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/favicon.ico', (req, res) => res.status(204).end());

app.get('/status', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// --------------------------------------------------
// Push Notification Setup
// --------------------------------------------------
const PUBLIC_VAPID_KEY = process.env.PUBLIC_VAPID_KEY;
const PRIVATE_VAPID_KEY = process.env.PRIVATE_VAPID_KEY;

webpush.setVapidDetails(
  "mailto:artjolson@gmail.com",
  PUBLIC_VAPID_KEY,
  PRIVATE_VAPID_KEY
);

app.get('/vapid-public-key', (req, res) => {
  res.json({ publicKey: PUBLIC_VAPID_KEY });
});

app.use(bodyParser.json());

let subscriptions = [];

// Subscribe route
app.post("/subscribe", (req, res) => {
  const subscription = req.body;

  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: "Invalid subscription" });
  }

  subscriptions.push(subscription);
  res.status(201).json({ message: "Subscribed" });
});

// Send push to all subscribers
app.post('/send-push', async (req, res) => {
  const payload = JSON.stringify({
    title: 'Update',
    body: 'New image sets!'
  });

  const failed = [];

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(sub, payload);
    } catch (err) {
      console.error("Failed to push:", sub.endpoint, err);
      failed.push(sub);
    }
  }

  res.json({ message: 'Push sent', failedSubscriptions: failed });
});

// --------------------------------------------------
// BENCHMARK SYSTEM (MULTITHREADED)
// --------------------------------------------------
let benchmarkStatus = {
  status: "idle",
  progress: 0,
  lastMessage: "",
  workers: {},
  results: []
};

// Start benchmark
app.get("/benchmark", (req, res) => {

  // Safe check: if a benchmark is already running
  if (benchmarkStatus.status === "running") {
    return res.json({ message: "Already running" });
  }

  // Initialize benchmarkStatus for this run
  benchmarkStatus = {
    status: "running",
    progress: 0,
    lastMessage: "Starting benchmark…",
    workers: {},
    results: []
  };

  const numWorkers = 4;
  const workersArr = [];

  for (let i = 0; i < numWorkers; i++) {
    const worker = new Worker('./worker.js', {
      workerData: { workerId: i + 1, jobName: 'ProcessItems' }
    });




worker.on('message', msg => {
  benchmarkStatus.workers[msg.workerId] = {
    job: msg.jobName || (msg.type === 'done' ? 'done' : 'running'),
    progress: msg.progress ?? (msg.type === 'done' ? 100 : 0),
    lastMessage: msg.lastMessage || ''
  };

  // update overall progress
  const total = Object.values(benchmarkStatus.workers)
    .reduce((acc, w) => acc + (w.progress || 0), 0);
  benchmarkStatus.progress = Math.floor(total / numWorkers);

  // update status
  const finished = Object.values(benchmarkStatus.workers)
    .filter(w => w.progress === 100).length;
  if (finished === numWorkers) benchmarkStatus.status = 'done';

  benchmarkStatus.lastMessage = msg.lastMessage || benchmarkStatus.lastMessage;

  // optional: push individual results to results array
  if (msg.type === 'done') benchmarkStatus.results.push(msg.result);
});


    



    workersArr.push(worker);
  }
  
    return res.json({ message: "Benchmark started" });
});



// Benchmark status route
app.get("/benchmark-status", (req, res) => {
  res.json(benchmarkStatus);
});

// --------------------------------------------------
// Start Server
// --------------------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
