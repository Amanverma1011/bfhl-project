/**
 * Comprehensive Validation Test Suite
 * Tests all invalid and valid edge cases
 */

const http = require('http');

// Test cases with expected outcomes
const testCases = [
  // Valid Cases
  {
    name: "✓ Valid: Simple Linear Tree",
    data: ["A->B", "B->C"],
    expectValid: 2,
    expectInvalid: 0,
    expectTrees: 1
  },

  {
    name: "✓ Valid: Multiple Trees",
    data: ["A->B", "C->D"],
    expectValid: 2,
    expectInvalid: 0,
    expectTrees: 2
  },

  // Invalid Cases - Format Issues
  {
    name: "✗ Invalid: No arrow (A-B)",
    data: ["A-B"],
    expectValid: 0,
    expectInvalid: 1,
    expectTrees: 0
  },

  {
    name: "✗ Invalid: Missing destination (A->)",
    data: ["A->"],
    expectValid: 0,
    expectInvalid: 1,
    expectTrees: 0
  },

  {
    name: "✗ Invalid: Missing source (->B)",
    data: ["->B"],
    expectValid: 0,
    expectInvalid: 1,
    expectTrees: 0
  },

  // Invalid Cases - Multi-character nodes
  {
    name: "✗ Invalid: Multi-char source (AB->C)",
    data: ["AB->C"],
    expectValid: 0,
    expectInvalid: 1,
    expectTrees: 0
  },

  {
    name: "✗ Invalid: Multi-char destination (A->BC)",
    data: ["A->BC"],
    expectValid: 0,
    expectInvalid: 1,
    expectTrees: 0
  },

  // Invalid Cases - Case sensitivity
  {
    name: "✗ Invalid: Lowercase (a->b)",
    data: ["a->b"],
    expectValid: 0,
    expectInvalid: 1,
    expectTrees: 0
  },

  {
    name: "✗ Invalid: Mixed case (A->b)",
    data: ["A->b"],
    expectValid: 0,
    expectInvalid: 1,
    expectTrees: 0
  },

  // Invalid Cases - Numbers
  {
    name: "✗ Invalid: Numbers (1->2)",
    data: ["1->2"],
    expectValid: 0,
    expectInvalid: 1,
    expectTrees: 0
  },

  {
    name: "✗ Invalid: Single number (A->1)",
    data: ["A->1"],
    expectValid: 0,
    expectInvalid: 1,
    expectTrees: 0
  },

  // Invalid Cases - Self-loops
  {
    name: "✗ Invalid: Self-loop (A->A)",
    data: ["A->A"],
    expectValid: 0,
    expectInvalid: 1,
    expectTrees: 0
  },

  // Invalid Cases - Empty and whitespace
  {
    name: "✗ Invalid: Empty string",
    data: [""],
    expectValid: 0,
    expectInvalid: 1,
    expectTrees: 0
  },

  {
    name: "✓ Valid: Whitespace handling (  A->B  )",
    data: ["  A->B  "],
    expectValid: 1,
    expectInvalid: 0,
    expectTrees: 1
  },

  // Invalid Cases - Random text
  {
    name: "✗ Invalid: Random text (hello)",
    data: ["hello"],
    expectValid: 0,
    expectInvalid: 1,
    expectTrees: 0
  },

  {
    name: "✗ Invalid: Special characters (!->@)",
    data: ["!->@"],
    expectValid: 0,
    expectInvalid: 1,
    expectTrees: 0
  },

  // Mixed Valid and Invalid
  {
    name: "Mixed: Valid and invalid entries",
    data: ["A->B", "invalid", "B->C", "1->2", "A->A"],
    expectValid: 2,
    expectInvalid: 3,
    expectTrees: 1
  },

  // Duplicates with valid entries
  {
    name: "Duplicates: Same edge twice",
    data: ["A->B", "A->B", "B->C"],
    expectValid: 2,
    expectInvalid: 0,
    expectTrees: 1,
    expectDuplicates: 1
  },

  // Cycle detection
  {
    name: "Cycle: Triangle cycle",
    data: ["A->B", "B->C", "C->A"],
    expectValid: 3,
    expectInvalid: 0,
    expectTrees: 0,
    expectCycles: 1
  }
];

/**
 * Send request to API and get response
 */
function testAPI(testCase) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({ data: testCase.data });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/bfhl',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          resolve(response);
        } catch (e) {
          resolve(null);
        }
      });
    });

    req.on('error', (e) => {
      resolve(null);
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Verify test results
 */
function verifyResults(testCase, response) {
  if (!response) {
    return { passed: false, reason: "No response from API" };
  }

  // Check invalid entries count
  if (response.invalid_entries.length !== testCase.expectInvalid) {
    return {
      passed: false,
      reason: `Invalid entries: expected ${testCase.expectInvalid}, got ${response.invalid_entries.length}`
    };
  }

  // Check trees count
  const trees = response.hierarchies.filter(h => !h.has_cycle).length;
  if (trees !== testCase.expectTrees) {
    return {
      passed: false,
      reason: `Trees: expected ${testCase.expectTrees}, got ${trees}`
    };
  }

  // Check duplicates if specified
  if (testCase.expectDuplicates !== undefined) {
    if (response.duplicate_edges.length !== testCase.expectDuplicates) {
      return {
        passed: false,
        reason: `Duplicates: expected ${testCase.expectDuplicates}, got ${response.duplicate_edges.length}`
      };
    }
  }

  // Check cycles if specified
  if (testCase.expectCycles !== undefined) {
    const cycles = response.hierarchies.filter(h => h.has_cycle).length;
    if (cycles !== testCase.expectCycles) {
      return {
        passed: false,
        reason: `Cycles: expected ${testCase.expectCycles}, got ${cycles}`
      };
    }
  }

  return { passed: true };
}

/**
 * Run all tests
 */
async function runTests() {
  console.log("\n" + "=".repeat(80));
  console.log("BFHL VALIDATION TEST SUITE");
  console.log("=".repeat(80));
  console.log("\nTesting against: http://localhost:5000\n");

  let passedCount = 0;
  let failedCount = 0;

  for (const testCase of testCases) {
    try {
      console.log(`Testing: ${testCase.name}`);
      console.log(`Input: ${JSON.stringify(testCase.data)}`);

      const response = await testAPI(testCase);
      const result = verifyResults(testCase, response);

      if (result.passed) {
        console.log(`✅ PASSED`);
        console.log(
          `   Invalid: ${response.invalid_entries.length}, ` +
          `Trees: ${response.hierarchies.filter(h => !h.has_cycle).length}, ` +
          `Cycles: ${response.hierarchies.filter(h => h.has_cycle).length}`
        );
        passedCount++;
      } else {
        console.log(`❌ FAILED: ${result.reason}`);
        failedCount++;
      }
      console.log("");
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}\n`);
      failedCount++;
    }
  }

  console.log("=".repeat(80));
  console.log(`RESULTS: ${passedCount} passed, ${failedCount} failed out of ${testCases.length} tests`);
  console.log("=".repeat(80));

  if (failedCount === 0) {
    console.log("\n✅ All validation tests passed!\n");
  } else {
    console.log(`\n❌ ${failedCount} tests failed. Review the output above.\n`);
  }

  process.exit(failedCount > 0 ? 1 : 0);
}

// Run tests
runTests().catch(err => {
  console.error("Fatal error:", err.message);
  console.error("\nMake sure the server is running: node server.js");
  process.exit(1);
});
