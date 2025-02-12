const distribution = require('../../config.js');
const id = distribution.util.id; 
const totalRequests = 1000; // Total number of requests
const maxRetries = 3; // Number of retry attempts for failed requests
const node = distribution.node.config;

const remote = {
  node: node,
  service: 'status',
  method: 'get'
};

const message = ['heapUsed'];

let completed = 0;
let latencies = [];
const overallStart = process.hrtime();

function sendRequest(i, retries = 0) {
  const requestStart = process.hrtime();

  distribution.local.comm.send(message, remote, (err, result) => {
    const diff = process.hrtime(requestStart);
    const latency = diff[0] * 1000 + diff[1] / 1e6; // Convert to ms

    if (err) {
      console.error(`Request ${i} failed:`, err);

      if (retries < maxRetries) {
        console.log(`Retrying request ${i} (${retries + 1}/${maxRetries})...`);
        return sendRequest(i, retries + 1);
      } else {
        console.log(`Request ${i} failed after ${maxRetries} retries.`);
      }
    } else {
      latencies.push(latency); // Ensure successful requests record latency
    }

    completed++;

    if (completed === totalRequests) {
      const overallDiff = process.hrtime(overallStart);
      const totalTime = overallDiff[0] * 1000 + overallDiff[1] / 1e6;
      
      // don't divide by zero
      const avgLatency = latencies.length > 0 
        ? latencies.reduce((sum, l) => sum + l, 0) / latencies.length 
        : 0;

      const throughput = totalRequests / (totalTime / 1000);

      console.log(`Total time for ${totalRequests} requests: ${totalTime.toFixed(2)} ms`);
      console.log(`Average latency: ${avgLatency.toFixed(2)} ms`);
      console.log(`Throughput: ${throughput.toFixed(2)} requests per second`);

      // Close the server after all requests are completed
      if (localServer) {
        console.log('Closing server...');
        localServer.close();
      }
    }
  });
}

console.log(`Starting comm.send() performance test with ${totalRequests} requests...`);

let localServer = null;
distribution.node.start((server) => {
  localServer = server;

  console.log('Server started. Running performance test...');
  
  // Start sending requests only after the server is started
  for (let i = 0; i < totalRequests; i++) {
    sendRequest(i);
  }
});
