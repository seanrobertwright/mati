# Drag-and-Drop Feature Testing Guide

## Test Environment
- **Date:** October 15, 2025
- **Development Server:** http://localhost:3001
- **Status:** ✅ Running

## Pre-Test Setup

### 1. Access the Application
```
URL: http://localhost:3001/dashboard/document-management
```

### 2. Login
If authentication is required:
- Navigate to http://localhost:3001/login
- Use test credentials (if configured)

## Test Suite

### ✅ **Test 1: File Upload via Drag-and-Drop**

#### Test 1.1: Single File Upload
1. **Navigate to:** Document Management module
2. **Click:** "Upload Document" button
3. **Action:** Drag a PDF file from your desktop
4. **Expected:**
   - Border turns primary color when dragging over
   - Background gets subtle tint
   - File name appears after drop
   - File size displays correctly
   - Metadata form becomes visible

#### Test 1.2: File Validation - File Too Large
1. **Action:** Drag a file larger than 100MB
2. **Expected:**
   - Error message: "File size exceeds 100MB limit"
   - File not accepted
   - Can try again with different file

#### Test 1.3: File Validation - Wrong File Type
1. **Action:** Drag an executable file (.exe, .bat)
2. **Expected:**
   - Error message: "File type not allowed"
   - File not accepted
   - Upload zone remains available

#### Test 1.4: Cancel Upload
1. **Action:** Drop a file, then click "Cancel"
2. **Expected:**
   - Returns to upload zone
   - Can start over

---

### ✅ **Test 2: Document Moving via Drag-and-Drop**

#### Test 2.1: Create Test Environment
**Setup:**
1. Create 3 folders: "Policies", "Procedures", "Templates"
2. Upload 2 test documents to root folder
3. Upload 1 document to "Policies" folder

#### Test 2.2: Move Document from Root to Folder
1. **Action:** Hover over a document in root folder
2. **Expected:** Grip handle (⋮⋮) appears on the left
3. **Action:** Click and drag the document
4. **Expected:** 
   - Document becomes 50% transparent
   - Border highlights
5. **Action:** Drag over "Policies" folder in sidebar
6. **Expected:**
   - Folder gets a colored ring highlight
7. **Action:** Release mouse (drop)
8. **Expected:**
   - Document moves to "Policies" folder
   - Document disappears from root list
   - Can navigate to "Policies" to see it there

#### Test 2.3: Move Document Between Folders
1. **Action:** Navigate to "Policies" folder
2. **Action:** Drag a document over to "Procedures" folder in sidebar
3. **Expected:**
   - Document moves successfully
   - Can verify by navigating to "Procedures"

#### Test 2.4: Move Document to Root
1. **Action:** Navigate to any subfolder with documents
2. **Action:** Drag a document to "All Documents" (root) in sidebar
3. **Expected:**
   - Document moves to root
   - Can verify by clicking "All Documents"

#### Test 2.5: Attempt Invalid Move (same folder)
1. **Action:** Drag document within the same folder
2. **Expected:**
   - No error
   - Document remains in same position
   - No server call made

---

### ✅ **Test 3: Visual Feedback Testing**

#### Test 3.1: Hover States
1. **Action:** Hover over a document
2. **Expected:** 
   - Grip handle appears smoothly
   - Background color changes slightly
   - Cursor indicates draggable

#### Test 3.2: Drag States
1. **Action:** Start dragging a document
2. **Expected:**
   - Document opacity reduces to 50%
   - Primary-colored border appears
   - Cursor changes to grabbing

#### Test 3.3: Drop Zone Highlights
1. **Action:** Drag document over different folders
2. **Expected:**
   - Each folder highlights with a ring when dragged over
   - Highlight disappears when drag leaves
   - Highlight is visually distinct

---

### ✅ **Test 4: Keyboard Navigation**

#### Test 4.1: Tab Navigation Still Works
1. **Action:** Press Tab repeatedly
2. **Expected:**
   - Can navigate between documents
   - Can navigate between folders
   - Focus indicators visible
   - Drag-and-drop doesn't interfere

#### Test 4.2: Enter/Space Selection
1. **Action:** Tab to a document, press Enter
2. **Expected:**
   - Document selection works normally
   - No drag operation initiated

---

### ✅ **Test 5: Permission Testing** (if applicable)

#### Test 5.1: Move Own Document
1. **Setup:** Logged in as document owner
2. **Action:** Drag and move the document
3. **Expected:** Move succeeds

#### Test 5.2: Move Someone Else's Document
1. **Setup:** Logged in as non-owner, non-admin
2. **Action:** Try to drag document you don't own
3. **Expected:**
   - Either: Drag disabled
   - Or: Error message on drop: "Forbidden: You do not have permission to move this document"

---

### ✅ **Test 6: Edge Cases**

#### Test 6.1: Rapid Multiple Moves
1. **Action:** Quickly move the same document multiple times
2. **Expected:**
   - Each move completes successfully
   - UI stays in sync
   - No duplicate documents

#### Test 6.2: Move During Network Latency
1. **Setup:** Throttle network in DevTools (Slow 3G)
2. **Action:** Move a document
3. **Expected:**
   - Operation still completes
   - Loading indicator (if implemented)
   - Document appears in correct location after completion

#### Test 6.3: Multiple Documents Visible
1. **Setup:** Have 20+ documents in a folder
2. **Action:** Scroll and drag a document from bottom of list
3. **Expected:**
   - Can drag while scrolling
   - Drop targets remain accessible
   - No visual glitches

---

### ✅ **Test 7: Browser Compatibility**

Test in multiple browsers:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if available)

Each browser should:
- Show grip handles correctly
- Handle drag operations smoothly
- Display visual feedback properly

---

### ✅ **Test 8: Responsive Design**

#### Test 8.1: Tablet View (768px - 1024px)
1. **Action:** Resize browser to tablet width
2. **Expected:**
   - Directory tree still accessible
   - Can still drag and drop
   - UI doesn't break

#### Test 8.2: Mobile View (<768px)
1. **Action:** Resize browser to mobile width
2. **Expected:**
   - Grip handles still visible/accessible
   - Touch events work (if testing on touch device)
   - Layout adapts appropriately

---

## Test Results Template

Use this to record your test results:

```markdown
## Test Results - [Date]

### Test 1: File Upload
- Test 1.1: ✅ / ❌ / ⚠️ (Notes: ...)
- Test 1.2: ✅ / ❌ / ⚠️ (Notes: ...)
- Test 1.3: ✅ / ❌ / ⚠️ (Notes: ...)
- Test 1.4: ✅ / ❌ / ⚠️ (Notes: ...)

### Test 2: Document Moving
- Test 2.1: ✅ / ❌ / ⚠️ (Notes: ...)
- Test 2.2: ✅ / ❌ / ⚠️ (Notes: ...)
- Test 2.3: ✅ / ❌ / ⚠️ (Notes: ...)
- Test 2.4: ✅ / ❌ / ⚠️ (Notes: ...)
- Test 2.5: ✅ / ❌ / ⚠️ (Notes: ...)

[Continue for all tests...]

### Issues Found
1. [Description of issue]
2. [Description of issue]

### Browser Compatibility
- Chrome: ✅ / ❌
- Firefox: ✅ / ❌
- Safari: ✅ / ❌
```

---

## Quick Visual Test Checklist

Run through this quick checklist for a basic sanity test:

- [ ] Can drop files onto upload zone
- [ ] Grip handle appears when hovering documents
- [ ] Can drag documents
- [ ] Folders highlight when dragging over them
- [ ] Documents move to correct folder
- [ ] UI refreshes after move
- [ ] No console errors

---

## Debugging Tips

### If drag-and-drop isn't working:

1. **Check Console:** Open browser DevTools (F12) and check for errors
2. **Check Network:** Look for failed API calls
3. **Check Permissions:** Verify user has edit rights
4. **Check Database:** Verify Supabase connection is working

### Common Issues:

1. **"Cannot find module" errors:** Run `npm install`
2. **Database errors:** Check `.env.local` file
3. **No visual feedback:** Check CSS is loading correctly
4. **Drag starts but drop doesn't work:** Check `onDrop` handlers are wired up

---

## Next Steps After Testing

1. Document any bugs found
2. Create GitHub issues for any problems
3. Test on production/staging environment
4. Get user feedback
5. Consider implementing future enhancements:
   - Multiple file upload
   - Batch document moving
   - Toast notifications
   - Undo functionality

---

**Happy Testing! 🧪**
