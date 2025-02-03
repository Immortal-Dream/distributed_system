const distribution = require('../../config.js'); // Adjust path as necessary
const util = distribution.util;

// Define a list of workloads. Each workload is an object with a name and a test object.
const workloads = [
  {
    name: "Basic types", // T2: Basic types like numbers, strings, booleans, null, undefined
    object: {
      number: 12345,
      string: "Hello world",
      boolean: true,
      nil: null,
      undef: undefined
    }
  },
  {
    name: "Object with function", // T3: Object that includes functions (non-native)
    object: {
      a: 1,
      b: "text",
      add: (x, y) => x + y,
      greet: function(name) { return `Hello ${name}`; }
    }
  },
  {
    name: "Complex nested structure", // T4: Complex object with nested arrays, objects, Date and Error objects
    object: {
      a: 1,
      b: "text",
      c: [1, 2, 3],
      d: { nested: true, arr: ["x", "y"] },
      e: new Date("2023-01-01T00:00:00Z"),
      f: new Error("Sample error")
    }
  }
];

// Number of iterations for each workload
const iterations = 100;

// Function to run the performance test for one workload
function runTest(workload) {
  let totalLatency = 0;
  let latencies = [];

  // Repeat the test for a fixed number of iterations
  for (let i = 0; i < iterations; i++) {
    // Start high-resolution timer
    const start = process.hrtime();

    // Serialize and then immediately deserialize the object
    const serialized = util.serialize(workload.object);
    const deserialized = util.deserialize(serialized);

    // End timer and compute elapsed time in milliseconds
    const elapsed = process.hrtime(start);
    const elapsedMs = elapsed[0] * 1000 + elapsed[1] / 1e6;

    latencies.push(elapsedMs);
    totalLatency += elapsedMs;
  }

  // Calculate average, minimum, and maximum latency
  const averageLatency = totalLatency / iterations;
  const minLatency = Math.min(...latencies);
  const maxLatency = Math.max(...latencies);

  // Return a report object
  return {
    workload: workload.name,
    averageLatency: averageLatency,
    minLatency: minLatency,
    maxLatency: maxLatency,
    iterations: iterations
  };
}

// Run tests for all workloads and print the results
function runPerformanceTests() {
  console.log("Performance Latency Test Results:");
  console.log("==================================");
  workloads.forEach(workload => {
    const result = runTest(workload);
    console.log(`Workload: ${result.workload}`);
    console.log(`  Iterations: ${result.iterations}`);
    console.log(`  Average latency: ${result.averageLatency.toFixed(3)} ms`);
    console.log(`  Minimum latency: ${result.minLatency.toFixed(3)} ms`);
    console.log(`  Maximum latency: ${result.maxLatency.toFixed(3)} ms`);
    console.log("----------------------------------");
  });
}

// Run the tests
runPerformanceTests();