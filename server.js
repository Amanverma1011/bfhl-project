const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

/**
 * POST /bfhl - Process graph/tree data and return hierarchies
 * 
 * Expected body: { "data": ["A->B", "A->C", "B->D", ...] }
 * 
 * Processing:
 * 1. Validate entries (format: "X->Y" where X,Y are single uppercase letters A-Z)
 * 2. Detect and store duplicate edges (keep first occurrence)
 * 3. Build adjacency list from unique edges
 * 4. Detect roots (nodes with no incoming edges)
 * 5. For each root, build tree and detect cycles using DFS
 * 6. Calculate tree depth (longest root-to-leaf path)
 * 7. Return formatted response with hierarchies, metadata, and summary
 */
app.post('/bfhl', (req, res) => {
  try {
    const { data } = req.body;

    // Validate request format
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ error: 'Invalid input format. Expected { "data": [...] }' });
    }

    // Initialize response structures
    const invalid_entries = [];
    const duplicate_edges = [];
    const processed_edges = [];
    const seen_edges = new Set();

    /**
     * Step 1: Validate and process entries
     * 
     * Validation Rules:
     * 1. Must match format "X->Y"
     * 2. X and Y must be single uppercase letters A-Z
     * 3. X and Y must be different (no self-loops)
     * 4. Whitespace is trimmed before validation
     */
    for (const entry of data) {
      // Trim whitespace from the entry
      const trimmed = String(entry).trim();

      // Validation Step 1: Check if empty after trimming
      if (!trimmed) {
        invalid_entries.push(entry);
        continue;
      }

      // Validation Step 2: Check format "X->Y" where X, Y are uppercase letters
      const formatRegex = /^[A-Z]->[A-Z]$/;
      if (!formatRegex.test(trimmed)) {
        invalid_entries.push(entry);
        continue;
      }

      // Extract source and destination
      const [source, destination] = trimmed.split('->');

      // Validation Step 3: Reject self-loops (A->A)
      if (source === destination) {
        invalid_entries.push(entry);
        continue;
      }

      // All validations passed - process the edge
      // Check for duplicates
      if (seen_edges.has(trimmed)) {
        if (!duplicate_edges.includes(trimmed)) {
          duplicate_edges.push(trimmed);
        }
      } else {
        seen_edges.add(trimmed);
        processed_edges.push(trimmed);
      }
    }

    /**
     * Step 2: Build adjacency list and track node relationships
     */
    const adjacencyList = {};
    const allNodes = new Set();
    const inDegree = {}; // Track incoming edges for each node

    for (const edge of processed_edges) {
      const [from, to] = edge.split('->');

      allNodes.add(from);
      allNodes.add(to);

      if (!adjacencyList[from]) {
        adjacencyList[from] = [];
      }
      adjacencyList[from].push(to);

      // Track in-degree
      inDegree[to] = (inDegree[to] || 0) + 1;
      if (!inDegree[from]) {
        inDegree[from] = 0;
      }
    }

    /**
     * Step 3: Identify root nodes (nodes with in-degree = 0)
     */
    const rootNodes = Array.from(allNodes)
      .filter(node => inDegree[node] === 0)
      .sort(); // Sort for consistent ordering

    /**
     * Step 4: Build hierarchies (trees/cycles) from each root
     */
    const hierarchies = [];
    const visitedGlobal = new Set();
    let totalCycles = 0;

    // Process all root nodes (nodes with in-degree = 0)
    for (const root of rootNodes) {
      if (visitedGlobal.has(root)) continue;

      // Build tree and detect cycles using DFS
      const treeResult = buildTreeWithCycleDetection(root, adjacencyList, visitedGlobal);

      if (treeResult.hasCycle) {
        totalCycles++;
        hierarchies.push({
          root: root,
          tree: {},
          has_cycle: true
        });
      } else {
        // Calculate depth for non-cyclic tree
        const depth = calculateTreeDepth(root, treeResult.tree);

        hierarchies.push({
          root: root,
          tree: treeResult.tree,
          depth: depth
        });
      }
    }

    /**
     * Step 4b: Handle cycles without roots
     * In a complete cycle (e.g., A->B->C->A), all nodes have in-degree > 0
     * so no roots are found. Process any unvisited nodes.
     */
    for (const node of allNodes) {
      if (!visitedGlobal.has(node)) {
        // This node is part of a cycle without a root
        const treeResult = buildTreeWithCycleDetection(node, adjacencyList, visitedGlobal);
        
        totalCycles++;
        hierarchies.push({
          root: node,
          tree: {},
          has_cycle: true
        });
      }
    }

    /**
     * Step 5: Calculate summary statistics
     */
    const nonCyclicTrees = hierarchies.filter(h => !h.has_cycle);
    let largestTreeRoot = null;

    if (nonCyclicTrees.length > 0) {
      // Find tree with maximum depth, lexicographically smaller if tie
      largestTreeRoot = nonCyclicTrees.reduce((prev, current) => {
        if (current.depth > prev.depth) {
          return current;
        } else if (current.depth === prev.depth && current.root < prev.root) {
          return current;
        }
        return prev;
      }).root;
    }

    const summary = {
      total_trees: nonCyclicTrees.length,
      total_cycles: totalCycles,
      largest_tree_root: largestTreeRoot
    };

    /**
     * Step 6: Return formatted response
     */
    res.status(200).json({
      user_id: 'fullname_ddmmyyyy',
      email_id: 'your_email@srmist.edu.in',
      college_roll_number: 'your_roll_number',
      hierarchies: hierarchies,
      invalid_entries: invalid_entries,
      duplicate_edges: duplicate_edges,
      summary: summary
    });

  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Build tree structure from root and detect cycles using DFS
 * @param {string} root - Root node to start from
 * @param {Object} adjacencyList - Graph adjacency list
 * @param {Set} visitedGlobal - Global visited set to track all processed nodes
 * @returns {Object} - { tree: {...}, hasCycle: boolean }
 */
function buildTreeWithCycleDetection(root, adjacencyList, visitedGlobal) {
  const tree = {};
  const visited = new Set();
  const recursionStack = new Set(); // Track nodes in current recursion path
  let hasCycle = false;

  /**
   * DFS function to detect cycles and build tree structure
   * Uses recursion stack to identify back edges
   */
  function dfs(node) {
    visited.add(node);
    visitedGlobal.add(node);
    recursionStack.add(node);
    tree[node] = {}; // Initialize node with empty children object

    const neighbors = adjacencyList[node] || [];

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        // Add neighbor as a child of current node
        tree[node][neighbor] = {};
        
        if (dfs(neighbor)) {
          return true;
        }
      } else if (recursionStack.has(neighbor)) {
        // Back edge found - cycle detected
        hasCycle = true;
        return true;
      }
    }

    recursionStack.delete(node);
    return false;
  }

  dfs(root);

  return {
    tree: hasCycle ? {} : tree,
    hasCycle: hasCycle
  };
}

/**
 * Calculate tree depth (longest path from root to any leaf)
 * @param {string} root - Root node
 * @param {Object} tree - Tree structure
 * @returns {number} - Depth of tree
 */
function calculateTreeDepth(root, tree) {
  function getDepth(node) {
    const children = Object.keys(tree[node] || {});

    if (children.length === 0) {
      return 1; // Leaf node has depth 1
    }

    let maxDepth = 0;
    for (const child of children) {
      maxDepth = Math.max(maxDepth, getDepth(child));
    }

    return 1 + maxDepth; // Add 1 for current node
  }

  return getDepth(root);
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`POST /bfhl - Process graph/tree data`);
  console.log(`GET / - Health check`);
});
