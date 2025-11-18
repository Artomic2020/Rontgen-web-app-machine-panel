const { parentPort } = require('worker_threads');
const { performance } = require('perf_hooks');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}



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

  // Optional: close explicitly (helps exit fire)
  parentPort.close();
});