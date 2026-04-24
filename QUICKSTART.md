# 🚀 Quick Start Guide

## Installation (First Time Only)

```bash
# 1. Navigate to project directory
cd bfhl-project

# 2. Install Node.js dependencies
npm install
```

## Running the Project

### Terminal 1 - Start Backend Server
```bash
npm start
```
Server will run on: **http://localhost:5000**

### Terminal 2 - Open Frontend
```bash
# Option A: Open index.html directly in browser
# Right-click index.html → Open with → Your browser

# Option B: Use a simple HTTP server (if you have it)
npx http-server
# Then visit http://localhost:8080
```

## Testing

### Option 1: Using the Frontend (Recommended)
1. Open `index.html` in your browser
2. Paste a test case from `tests.js` into the textarea
3. Click "Process Data"
4. View results in formatted tabs

### Option 2: Using cURL
```bash
curl -X POST http://localhost:5000/bfhl \
  -H "Content-Type: application/json" \
  -d '{"data": ["A->B", "B->C"]}'
```

### Option 3: Test File
```bash
node tests.js
```
(Shows all test cases with expected results)

## Quick Examples

### Example 1: Simple Tree
```json
["A->B", "B->C", "C->D"]
```
**Result:** 1 tree, depth 4, root A

### Example 2: Multiple Trees
```json
["A->B", "C->D", "E->F"]
```
**Result:** 3 trees of equal depth, largest root A (lexicographically first)

### Example 3: Detect Cycle
```json
["A->B", "B->C", "C->A"]
```
**Result:** 1 cycle detected, 0 valid trees

### Example 4: Mixed Valid/Invalid
```json
["A->B", "invalid", "B->C", "1->2"]
```
**Result:** 1 tree, 2 invalid entries

## Stopping the Server
```bash
Press Ctrl+C in the terminal running npm start
```

## File Structure

| File | Purpose |
|------|---------|
| `server.js` | Express backend with graph processing logic |
| `index.html` | Interactive frontend with UI |
| `package.json` | Node.js dependencies |
| `tests.js` | Test cases and examples |
| `README.md` | Full documentation |
| `.gitignore` | Git configuration |

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Cannot find module 'express'" | Run `npm install` |
| "Port 5000 already in use" | Change PORT in `server.js` to 5001, etc. |
| "CORS error" | Make sure server is on http://localhost:5000 |
| "Cannot GET /bfhl" | Server not running - execute `npm start` |

## What's Included

✅ **Backend** - Express server with REST API  
✅ **Frontend** - Responsive HTML/CSS/JS UI  
✅ **Validation** - Format checking with regex  
✅ **Cycle Detection** - DFS with recursion stack  
✅ **Tree Building** - Proper parent-child hierarchy  
✅ **Depth Calculation** - Longest root-to-leaf path  
✅ **Error Handling** - User-friendly error messages  
✅ **Test Cases** - 15 comprehensive test scenarios

## Next Steps

1. Update user info in `server.js`:
   ```javascript
   user_id: 'Your_Name_DDMMYYYY',
   email_id: 'your_email@srmist.edu.in',
   college_roll_number: 'your_roll_number',
   ```

2. Test with provided test cases in `tests.js`

3. Deploy and submit!

---

**Need help?** Check `README.md` for detailed documentation.
