

/*
// worker.js
const { parentPort } = require('worker_threads');

parentPort.on('message', ([iterations]) => {
  let done = 0;
  const step = Math.max(1, Math.floor(iterations / 100));

  for (let i = 0; i < iterations; i++) {
    Math.sqrt(i);

    if (i % step === 0) {
      done = Math.round((i / iterations) * 100);
      parentPort.postMessage({
        type: 'progress',
        progress: done,
        lastMessage: `Job ${iterations}: ${i}/${iterations}`
      });
    }
  }

  parentPort.postMessage({
    type: 'done',
    result: { iterations, score: Math.random() * 1000 }
  });
});
*/

// worker.js
const { parentPort, threadId } = require("worker_threads");

parentPort.on("message", ([iterations]) => {
  let sum = 0;

  const step = Math.max(1, Math.floor(iterations / 100));

  for (let i = 0; i < iterations; i++) {
     //   Math.sqrt(i);

    // Heavy computation — cannot be optimized away
    sum += Math.sin(i) * Math.sqrt(i % 1000);

    // Progress update every 1%
    if (i % step === 0) {
      parentPort.postMessage({
        type: "progress",
        progress: Math.round((i / iterations) * 100),
        worker: threadId,
        lastMessage: `Worker ${threadId}: ${i}/${iterations}`
      });
    }
  }

  parentPort.postMessage({
    type: "done",
    worker: threadId,
    result: { iterations, value: sum }
  });
});
console.log("Worker started:", process.pid);
