/**
 * BFHL API Test Cases
 * 
 * Usage: 
 * 1. Start the server: npm start
 * 2. Run tests in terminal: node tests.js
 * 3. Or paste individual examples into the frontend
 */

// Test cases with descriptions
const testCases = [
  {
    name: "Test 1: Simple Linear Tree",
    input: ["A->B", "B->C", "C->D"],
    expectedResult: {
      trees: 1,
      cycles: 0,
      largestRoot: "A",
      largestDepth: 4
    }
  },

  {
    name: "Test 2: Multiple Independent Trees",
    input: ["A->B", "C->D", "E->F"],
    expectedResult: {
      trees: 3,
      cycles: 0,
      largestRoot: "A" // All have depth 2, lexicographically first
    }
  },

  {
    name: "Test 3: Single Root with Multiple Children",
    input: ["A->B", "A->C", "A->D"],
    expectedResult: {
      trees: 1,
      cycles: 0,
      largestRoot: "A",
      largestDepth: 2
    }
  },

  {
    name: "Test 4: Cycle Detection (Triangle)",
    input: ["A->B", "B->C", "C->A"],
    expectedResult: {
      trees: 0,
      cycles: 1,
      hasCycle: true
    }
  },

  {
    name: "Test 5: Cycle in Middle of Graph",
    input: ["A->B", "B->C", "C->B", "B->D"],
    expectedResult: {
      trees: 0,
      cycles: 1,
      hasCycle: true
    }
  },

  {
    name: "Test 6: Mixed Valid and Invalid Entries",
    input: ["A->B", "invalid", "B->C", "1->2", "A->C"],
    expectedResult: {
      trees: 1,
      cycles: 0,
      invalidCount: 2,
      duplicateCount: 0,
      largestDepth: 3
    }
  },

  {
    name: "Test 7: Duplicate Edges",
    input: ["A->B", "A->B", "B->C", "A->B"],
    expectedResult: {
      trees: 1,
      cycles: 0,
      duplicateCount: 1, // "A->B" stored once
      largestDepth: 3
    }
  },

  {
    name: "Test 8: Empty Values and Whitespace",
    input: ["A->B", "", "  A->C  ", "A->A"],
    expectedResult: {
      trees: 1,
      cycles: 0,
      invalidCount: 2, // "" and "A->A"
      largestDepth: 2
    }
  },

  {
    name: "Test 9: Complex Graph with Multiple Roots",
    input: ["A->B", "A->C", "B->D", "C->E", "F->G", "F->H"],
    expectedResult: {
      trees: 2,
      cycles: 0,
      roots: ["A", "F"]
    }
  },

  {
    name: "Test 10: Single Node",
    input: ["A->B"],
    expectedResult: {
      trees: 1,
      cycles: 0,
      largestDepth: 2
    }
  },

  {
    name: "Test 11: Diamond Shape (No Cycle)",
    input: ["A->B", "A->C", "B->D", "C->D"],
    expectedResult: {
      trees: 1,
      cycles: 0,
      largestDepth: 3
    }
  },

  {
    name: "Test 12: All Invalid Entries",
    input: ["hello", "123", "A-B", ""],
    expectedResult: {
      trees: 0,
      cycles: 0,
      invalidCount: 4
    }
  },

  {
    name: "Test 13: Self Loop",
    input: ["A->A", "B->C"],
    expectedResult: {
      trees: 1,
      cycles: 0,
      invalidCount: 1, // A->A
      largestDepth: 2
    }
  },

  {
    name: "Test 14: Complex with Numbers and Mixed Case",
    input: ["A->B", "a->b", "1->2", "A->1"],
    expectedResult: {
      trees: 1,
      cycles: 0,
      invalidCount: 2, // a->b, 1->2, A->1
      largestDepth: 2
    }
  },

  {
    name: "Test 15: Multi-character Nodes",
    input: ["AB->CD", "A->B", "AB->C"],
    expectedResult: {
      trees: 1,
      cycles: 0,
      invalidCount: 2, // AB->CD, AB->C
      largestDepth: 2
    }
  }
];

/**
 * Helper: Format test case as JSON for copying to frontend
 */
function formatForFrontend(testCase) {
  return JSON.stringify(testCase.input);
}

/**
 * Display all test cases
 */
console.log("=" .repeat(70));
console.log("BFHL API TEST CASES");
console.log("=" .repeat(70));
console.log("\nHow to use these tests:");
console.log("1. Start the server: npm start");
console.log("2. Open index.html in browser");
console.log("3. Copy input from below and paste into the frontend textarea");
console.log("4. Click 'Process Data' and verify results match expected output\n");

testCases.forEach((test, index) => {
  console.log(`\n${"─".repeat(70)}`);
  console.log(`Test ${index + 1}: ${test.name}`);
  console.log(`${"─".repeat(70)}`);
  console.log("\nInput (as JSON array):");
  console.log(JSON.stringify(test.input, null, 2));
  console.log("\nExpected Result:");
  console.log(`  - Total Trees: ${test.expectedResult.trees}`);
  console.log(`  - Total Cycles: ${test.expectedResult.cycles}`);
  if (test.expectedResult.largestRoot) {
    console.log(`  - Largest Tree Root: ${test.expectedResult.largestRoot}`);
  }
  if (test.expectedResult.largestDepth) {
    console.log(`  - Max Depth: ${test.expectedResult.largestDepth}`);
  }
  if (test.expectedResult.invalidCount !== undefined) {
    console.log(`  - Invalid Entries: ${test.expectedResult.invalidCount}`);
  }
  if (test.expectedResult.duplicateCount !== undefined) {
    console.log(`  - Duplicate Edges: ${test.expectedResult.duplicateCount}`);
  }
  if (test.expectedResult.hasCycle) {
    console.log(`  - Has Cycle: Yes`);
  }
  if (test.expectedResult.roots) {
    console.log(`  - Root Nodes: ${test.expectedResult.roots.join(", ")}`);
  }
  console.log("\nCopy this for frontend test:");
  console.log(`${formatForFrontend(test)}`);
});

console.log("\n" + "=" .repeat(70));
console.log("API Testing Instructions");
console.log("=" .repeat(70));
console.log(`
1. Using cURL (command line):
   curl -X POST http://localhost:5000/bfhl \\
     -H "Content-Type: application/json" \\
     -d '{"data": ["A->B", "B->C"]}'

2. Using JavaScript fetch in browser console:
   fetch('http://localhost:5000/bfhl', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ data: ["A->B", "B->C"] })
   })
   .then(r => r.json())
   .then(data => console.log(JSON.stringify(data, null, 2)))

3. Using Postman:
   - Method: POST
   - URL: http://localhost:5000/bfhl
   - Body (raw JSON): {"data": ["A->B", "B->C"]}

4. Using the frontend:
   - Just paste the input array into the textarea
   - Click "Process Data"
   - View formatted results
`);

console.log("=" .repeat(70));
