# 📐 Algorithm & Implementation Details

## Core Algorithms

### 1. Input Validation
**Purpose:** Ensure all entries follow the "X->Y" format with single uppercase letters.

**Algorithm:**
```
For each entry in input data:
  1. Trim whitespace from entry
  2. Test against regex pattern: /^[A-Z]->[A-Z]$/
  3. If matches: process as valid edge
  4. Else: add to invalid_entries array
```

**Time Complexity:** O(n) where n = number of entries  
**Space Complexity:** O(n)

### 2. Duplicate Detection
**Purpose:** Identify and store duplicate edges while keeping first occurrence.

**Algorithm:**
```
Maintain a Set of seen edges
For each valid edge:
  1. Check if edge exists in Set
  2. If yes: add to duplicate_edges (once)
  3. If no: add to Set, add to processed_edges
```

**Time Complexity:** O(m) where m = number of valid edges (Set operation O(1))  
**Space Complexity:** O(m)

### 3. Graph Building
**Purpose:** Construct adjacency list and track in-degree for root detection.

**Algorithm:**
```
adjacencyList = {}
inDegree = {}
For each processed edge "X->Y":
  1. adjacencyList[X] = [..., Y]
  2. inDegree[Y] += 1
  3. inDegree[X] = max(0, inDegree[X])
```

**Time Complexity:** O(m) where m = number of edges  
**Space Complexity:** O(n + m) where n = number of nodes

### 4. Root Detection
**Purpose:** Find all nodes with no incoming edges (in-degree = 0).

**Algorithm:**
```
roots = []
For each node in allNodes:
  If inDegree[node] == 0:
    roots.push(node)
Sort roots lexicographically
```

**Time Complexity:** O(n log n) where n = number of nodes  
**Space Complexity:** O(n)

### 5. Cycle Detection (DFS with Recursion Stack)
**Purpose:** Detect presence of cycles in the graph using DFS.

**Algorithm:**
```
visited = Set()
recursionStack = Set()
hasCycle = false

Function DFS(node):
  1. Mark node as visited
  2. Add node to recursionStack
  3. For each neighbor of node:
     a. If neighbor not visited:
        - Add neighbor as child to tree[node]
        - Recursively call DFS(neighbor)
     b. Else if neighbor in recursionStack:
        - CYCLE DETECTED (back edge found)
        - Set hasCycle = true
  4. Remove node from recursionStack
  
For each root node not yet visited:
  Call DFS(root)
  record hasCycle result
```

**Key Insight:** A back edge (edge to an ancestor) indicates a cycle. The recursionStack tracks nodes in the current path, so any edge to a node in the stack is a back edge.

**Time Complexity:** O(n + m) where n = nodes, m = edges (DFS standard)  
**Space Complexity:** O(n) for visited, recursionStack, tree

**Example - Cycle Detection:**
```
Edges: A->B, B->C, C->A

DFS from A:
  Visit A, recursionStack = {A}
  Neighbor B not visited
    Visit B, recursionStack = {A, B}
    Neighbor C not visited
      Visit C, recursionStack = {A, B, C}
      Neighbor A in recursionStack → CYCLE!
```

### 6. Tree Depth Calculation
**Purpose:** Calculate longest path from root to any leaf node.

**Algorithm:**
```
Function getDepth(node):
  1. Get all children nodes
  2. If no children: return 1 (leaf node)
  3. Else:
     a. Recursively calculate depth of each child
     b. Return 1 + max(childDepths)

For non-cyclic trees:
  depth = getDepth(root)
```

**Time Complexity:** O(n) where n = number of nodes in tree  
**Space Complexity:** O(n) for recursion call stack

**Example - Depth Calculation:**
```
Tree: A->B, A->C, B->D

       A (depth 3)
      / \
     B   C (depth 1)
    /
   D (depth 1)

getDepth(A):
  children = [B, C]
  getDepth(B):
    children = [D]
    getDepth(D): no children → return 1
    return 1 + 1 = 2
  getDepth(C): no children → return 1
  return 1 + max(2, 1) = 3
```

### 7. Summary Calculation
**Purpose:** Compute final statistics.

**Algorithm:**
```
nonCyclicTrees = filter(all trees where has_cycle == false)
cyclic_hierarchies = filter(all trees where has_cycle == true)

total_trees = length(nonCyclicTrees)
total_cycles = length(cyclic_hierarchies)

largest_tree_root = 
  Find tree with maximum depth
  If tie: choose lexicographically smaller root
  Return root of that tree
```

**Time Complexity:** O(n log n) for sorting if needed  
**Space Complexity:** O(n)

---

## Edge Cases Handled

### 1. Empty Input
- Empty array returns all zeroes/empty structures

### 2. All Invalid Entries
- No trees created, all entries in invalid_entries

### 3. Single Node (A->B)
- Creates tree with depth 2

### 4. Self-Loop (A->A)
- Marked invalid and stored as invalid_entry

### 5. Multiple Independent Trees
- Each tree processed separately
- Different roots, different hierarchies

### 6. Cycle Detection with Multiple Roots
- Only cyclic component marked with has_cycle
- Other components processed normally

### 7. Duplicate Edges (A->B appears twice)
- First occurrence: added to tree
- Second & subsequent: added to duplicate_edges

### 8. Whitespace Handling
- "  A->B  " → trimmed to "A->B" → valid
- "" → trimmed to "" → invalid

### 9. Case Sensitivity
- "a->b" → invalid (lowercase not allowed)
- "A->b" → invalid (mixed case not allowed)

### 10. Multi-character nodes
- "AB->C" → invalid (A is valid, AB is not)
- "A->CD" → invalid (C is valid, CD is not)

---

## Example Walkthrough

### Input
```json
{
  "data": ["A->B", "A->C", "B->D", "C->E", "F->G"]
}
```

### Step 1: Validation
- All entries valid and unique
- processed_edges = ["A->B", "A->C", "B->D", "C->E", "F->G"]

### Step 2: Build Adjacency List
```
adjacencyList = {
  "A": ["B", "C"],
  "B": ["D"],
  "C": ["E"],
  "F": ["G"],
  "D": [],
  "E": [],
  "G": []
}

inDegree = {
  "A": 0,  ← root
  "B": 1,
  "C": 1,
  "D": 1,
  "E": 1,
  "F": 0,  ← root
  "G": 1
}
```

### Step 3: Find Roots
- roots = ["A", "F"] (in-degree 0)

### Step 4: Process Root A (Cycle Detection & Tree Building)
```
DFS from A:
  Visit A: tree["A"] = {}
  Neighbor B not visited
    tree["A"]["B"] = {}
    Visit B: tree["B"] = {}
    Neighbor D not visited
      tree["B"]["D"] = {}
      Visit D: tree["D"] = {}
      No neighbors
  Neighbor C not visited
    tree["A"]["C"] = {}
    Visit C: tree["C"] = {}
    Neighbor E not visited
      tree["C"]["E"] = {}
      Visit E: tree["E"] = {}
      No neighbors

No cycles detected
Resulting tree = {
  "A": {"B": {}, "C": {}},
  "B": {"D": {}},
  "C": {"E": {}},
  "D": {},
  "E": {}
}

Depth = 3 (A->B->D or A->C->E)
```

### Step 5: Process Root F (Cycle Detection & Tree Building)
```
DFS from F:
  Visit F: tree["F"] = {}
  Neighbor G not visited
    tree["F"]["G"] = {}
    Visit G: tree["G"] = {}
    No neighbors

No cycles detected
Resulting tree = {
  "F": {"G": {}},
  "G": {}
}

Depth = 2 (F->G)
```

### Step 6: Build Hierarchies Response
```
hierarchies = [
  {
    "root": "A",
    "tree": {...},
    "depth": 3
  },
  {
    "root": "F",
    "tree": {...},
    "depth": 2
  }
]
```

### Step 7: Calculate Summary
```
nonCyclicTrees = [root A (depth 3), root F (depth 2)]
cyclic = []

summary = {
  "total_trees": 2,
  "total_cycles": 0,
  "largest_tree_root": "A"  ← max depth
}
```

### Final Response
```json
{
  "user_id": "fullname_ddmmyyyy",
  "email_id": "your_email@srmist.edu.in",
  "college_roll_number": "your_roll_number",
  "hierarchies": [...],
  "invalid_entries": [],
  "duplicate_edges": [],
  "summary": {
    "total_trees": 2,
    "total_cycles": 0,
    "largest_tree_root": "A"
  }
}
```

---

## Performance Analysis

### Time Complexity Summary
| Operation | Complexity |
|-----------|-----------|
| Validation | O(n) |
| Duplicate Detection | O(m) |
| Graph Building | O(m) |
| Root Finding | O(n log n) |
| Cycle Detection | O(n + m) |
| Depth Calculation | O(n) |
| Summary | O(n log n) |
| **Total** | **O(n + m)** |

Where n = number of nodes, m = number of edges

### For 50 nodes and ~100 edges:
- Operations: ~150-200
- Typical Runtime: <50ms
- Max Runtime: <200ms

---

## Testing Strategy

### Unit Test Categories

1. **Validation Tests**
   - Single letter nodes ✓
   - Invalid characters ✓
   - Whitespace handling ✓
   - Case sensitivity ✓

2. **Duplicate Tests**
   - Same edge multiple times
   - Keep first occurrence
   - Store in duplicate_edges

3. **Tree Construction**
   - Linear chains
   - Branching trees
   - Multiple roots
   - Nested structures

4. **Cycle Detection**
   - Simple cycles (A->B->C->A)
   - Complex cycles
   - No cycles
   - Cycle in subset of nodes

5. **Depth Calculation**
   - Single node
   - Linear chain
   - Balanced tree
   - Unbalanced tree

6. **Edge Cases**
   - Empty input
   - All invalid
   - All duplicates
   - Single entry

---

## Optimization Notes

1. **Early Termination:** Cycle detection stops as soon as back edge is found
2. **Set Operations:** O(1) lookup for visited nodes
3. **Iterative Approach:** Could replace recursion for arbitrary depth handling
4. **Memoization:** Depth values could be cached if same tree processed multiple times

---

## Potential Enhancements

- [ ] Add support for weighted edges
- [ ] Calculate multiple statistics (node count, average branching factor)
- [ ] Stream processing for large datasets
- [ ] Persist results to database
- [ ] Visualize graph/tree in frontend
- [ ] Support for directed acyclic graph (DAG) operations
- [ ] Export results to various formats (CSV, XML, GraphML)
