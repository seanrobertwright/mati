# Document Management User Guide

## Welcome
This guide will help you effectively use the Document Management system for creating, managing, and accessing organizational documents.

## Table of Contents
1. [Getting Started](#getting-started)
2. [Creating Documents](#creating-documents)
3. [Finding Documents](#finding-documents)
4. [Working with Approvals](#working-with-approvals)
5. [Change Requests](#change-requests)
6. [Notifications](#notifications)
7. [Tips and Best Practices](#tips-and-best-practices)

## Getting Started

### Accessing the System
1. Log in to your dashboard
2. Click on "Document Management" in the sidebar
3. You'll see the document browser with your documents and folders

### Dashboard Overview
- **Left Sidebar:** Navigate between documents, change requests, metrics, and audit log
- **Main Area:** Document list or folder contents
- **Top Bar:** Search, filters, and quick actions

### Your Documents
When you first log in, you'll see:
- Documents you own
- Documents shared with you
- Approved company documents
- Recent activity

## Creating Documents

### Step 1: Create a New Document

#### Method 1: Upload Existing File
1. Click the "Upload Document" button
2. Drag and drop your file, or click to browse
3. Supported file types: PDF, Word, Excel, PowerPoint, images
4. Maximum file size: 100MB

#### Method 2: Start from Scratch
1. Click "New Document"
2. Select document type (policy, procedure, work instruction, form, record)
3. Upload your file when ready

### Step 2: Add Document Information

**Required Fields:**
- **Title:** Clear, descriptive name (e.g., "Safety Eyewear Policy")
- **Category:** Select appropriate type

**Optional but Recommended:**
- **Description:** Brief summary of document purpose
- **Effective Date:** When document takes effect
- **Review Frequency:** How often to review (e.g., 90 days)
- **Directory:** Where to store the document

**Example:**
```
Title: Personal Protective Equipment Policy
Category: Policy
Description: Requirements for PPE in all work areas
Effective Date: 2024-01-01
Review Frequency: 365 days
Directory: Policies > Safety Policies
```

### Step 3: Submit for Review
1. Review your document information
2. Click "Save as Draft" to save for later, or
3. Click "Submit for Review" to start the approval process

**Before submitting:**
- ✓ Document is complete and accurate
- ✓ All required information filled in
- ✓ File is the correct version
- ✓ You've proofread for errors

## Finding Documents

### Quick Search
1. Use the search bar at the top
2. Type keywords from the document title or description
3. Results appear as you type
4. Click on a result to open the document

### Advanced Filtering
1. Click the "Filters" button
2. Choose filters:
   - **Category:** Policy, Procedure, etc.
   - **Status:** Draft, Approved, etc.
   - **Owner:** Who created it
   - **Date Range:** When created or effective
3. Click "Apply Filters"
4. Save frequent filter combinations as presets

**Example Searches:**
- "safety eyewear" → Finds all safety eyewear documents
- Category: Policy + Status: Approved → All approved policies
- Owner: John Smith + Created: Last 30 days → John's recent documents

### Browsing Directories
1. Click on folder names to navigate
2. Use breadcrumbs to go back
3. See folder contents and subdirectories
4. Click on documents to view details

### Saved Filter Presets
Create shortcuts for common searches:
1. Set up your filters
2. Click "Save Current Filters"
3. Name your preset (e.g., "My Draft Documents")
4. Access from the Filters dropdown anytime

## Working with Approvals

### Understanding the Approval Process

```
Draft → Pending Review → Pending Approval → Approved
```

**Your Role at Each Stage:**

**As Document Owner:**
- Create and submit documents
- Respond to reviewer/approver feedback
- Cannot approve your own documents

**As Reviewer:**
- Review documents for accuracy and completeness
- Provide feedback if changes needed
- Advance to approval or send back to draft

**As Approver:**
- Final authorization for document publication
- Ensure policy compliance
- Approve or reject with notes

### Submitting Your Document
1. Ensure document is complete
2. Click "Submit for Review"
3. Select a reviewer (if required)
4. Add any notes for the reviewer
5. Click "Submit"
6. You'll receive notifications on progress

### Reviewing a Document
When a document needs your review:
1. You'll receive a notification
2. Go to "Notifications" or "Documents"
3. Click on the document
4. Review the content carefully
5. Choose an action:
   - **Approve for Approval:** Send to approver
   - **Request Changes:** Send back with notes
6. Add your comments
7. Click "Submit Review"

**Review Checklist:**
- ✓ Content is accurate
- ✓ Format is consistent
- ✓ All required sections present
- ✓ No spelling/grammar errors
- ✓ Complies with policies
- ✓ Safe and appropriate

### Approving a Document
When a document needs your approval:
1. You'll receive a notification
2. Open the document
3. Review thoroughly:
   - Document content
   - Review comments
   - Impact on organization
4. Choose an action:
   - **Approve:** Publish the document
   - **Reject:** Send back with reason
5. Add approval notes (required for rejection)
6. Click "Submit Approval"

**Approval Considerations:**
- Does it comply with policies?
- Is it safe and appropriate?
- Are resources available for implementation?
- Is training needed?
- What is the implementation timeline?

### Handling Rejections
If your document is rejected:
1. Review the reviewer/approver notes
2. Make necessary changes
3. Update the document file if needed
4. Update metadata if needed
5. Resubmit when ready

**Tips:**
- Address all feedback points
- Ask for clarification if notes unclear
- Consider requesting a meeting for complex changes
- Document what changes you made

## Change Requests

### When to Use Change Requests
Use change requests when you want to:
- Modify an approved document
- Suggest improvements to existing procedures
- Update outdated information
- Respond to incident findings

**You cannot directly edit approved documents. This ensures safety and compliance.**

### Creating a Change Request
1. Navigate to the document
2. Click "Request Change"
3. Fill in the form:
   - **Title:** Brief description of change
   - **Description:** Detailed explanation
     - What needs to change
     - Why it needs to change
     - Impact if not changed
   - **Priority:** Low, Medium, High, Critical
4. Click "Submit Change Request"

**Example Change Request:**
```
Title: Update PPE requirements for new equipment
Description: 
New laser cutting equipment requires different eye protection 
than specified in current procedure. Current spec is inadequate 
for new laser wavelength. Need to update section 3.2 to specify 
laser safety glasses with OD 5+ at 1064nm.
Priority: High
```

### Discussing Change Requests
1. Navigate to your change request
2. Add comments to discuss
3. Respond to others' comments
4. Attach supporting documents if needed
5. @mention users to notify them

### Change Request Approval
1. Document owner reviews change request
2. May request more information
3. If approved, creates new document version
4. New version goes through normal approval process
5. You're notified when complete

## Notifications

### Notification Center
Access notifications by clicking the bell icon.

**Notification Types:**
- 🔔 **Review Due:** Document needs periodic review
- ✓ **Approval Pending:** Document needs your approval
- 💬 **Change Request:** New comments or updates
- 📄 **Document Updated:** Document you follow was updated
- ✅ **Approval Complete:** Your document was approved/rejected

### Notification Preferences
Customize what notifications you receive:
1. Click on your profile
2. Select "Notification Preferences"
3. Configure for each type:
   - **Review Reminders:** Days before review due (30, 14, 7, 3, 1)
   - **Approval Pending:** Immediate notification
   - **Change Requests:** On new comments
   - **Document Updates:** On approval/publication
4. Choose delivery method:
   - In-app (always on)
   - Email (optional)
5. Click "Save Preferences"

**Recommended Settings:**
- Review reminders: 14 and 3 days before
- Approval pending: In-app + Email
- Change requests: In-app only
- Document updates: In-app only

### Managing Notifications
- **Mark as Read:** Click on notification
- **Mark All as Read:** Click "Mark all as read"
- **Dismiss:** X button on notification
- **Take Action:** Click notification to go to document

## Tips and Best Practices

### Creating Effective Documents

**Good Document Titles:**
- ✓ "Ladder Safety Procedure"
- ✓ "Chemical Spill Response Plan"
- ✓ "Forklift Inspection Checklist"

**Poor Document Titles:**
- ✗ "Document 1"
- ✗ "New Procedure"
- ✗ "Untitled"

**Writing Descriptions:**
- Brief summary of purpose
- Who should use it
- When to use it
- Key points covered

**Example:**
```
Title: Ladder Safety Procedure
Description: Step-by-step procedure for safe ladder use including 
inspection, setup, climbing, and storage. Required for all personnel 
using ladders. Covers extension ladders and step ladders.
```

### Organizing Documents

**Use Logical Directories:**
```
Good:
  Policies/
    Safety Policies/
      PPE Policy
      Ladder Safety Policy
    Quality Policies/
      Inspection Policy

Poor:
  My Documents/
    Random stuff/
      file1, file2, file3
```

**Consistent Naming:**
- Use prefixes for document types
- Include version in title if needed
- Avoid special characters
- Keep names concise but descriptive

### Efficient Searching

**Search Tips:**
- Use specific keywords
- Try different terms if first search fails
- Use filters to narrow results
- Save frequently used filter combinations
- Use quotes for exact phrases

**Example Searches:**
- "confined space" → Specific topic
- Category: Procedure + Owner: Safety Team → Team's procedures
- Status: Approved + Review Date: Next 30 days → Upcoming reviews

### Working Efficiently

**Daily Workflow:**
1. Check notifications for action items
2. Review documents needing approval
3. Update any drafts in progress
4. Check upcoming review dates

**Weekly Workflow:**
1. Review all active change requests
2. Follow up on pending approvals
3. Archive completed documents
4. Plan upcoming document reviews

**Monthly Workflow:**
1. Review document organization
2. Update any outdated documents
3. Check for documents needing review
4. Clean up old drafts

### Collaboration Tips

**When Reviewing:**
- Be specific in comments
- Suggest solutions, not just problems
- Focus on content and safety
- Be respectful and constructive
- Respond promptly

**When Submitting:**
- Provide context for reviewers
- Explain significant changes
- Attach reference materials if helpful
- Set realistic deadlines
- Thank reviewers for their time

**When Discussing Changes:**
- Stay on topic
- Provide evidence for suggestions
- Consider different perspectives
- Document decisions
- Reach consensus before implementing

## Keyboard Shortcuts

### Navigation
- `Ctrl/Cmd + K` - Quick search
- `Ctrl/Cmd + B` - Toggle sidebar
- `Esc` - Close dialogs
- `↑ ↓` - Navigate document list
- `Enter` - Open selected document

### Actions
- `Ctrl/Cmd + U` - Upload document
- `Ctrl/Cmd + N` - New document
- `Ctrl/Cmd + S` - Save draft
- `Ctrl/Cmd + Enter` - Submit for review

### Filters
- `F` - Focus filter bar
- `Ctrl/Cmd + F` - Advanced filters
- `Ctrl/Cmd + Shift + F` - Clear filters

## Getting Help

### In-App Help
- Click the `?` icon for context help
- Hover over fields for tooltips
- Check the dashboard for quick tips

### Common Questions

**Q: Why can't I edit an approved document?**
A: Approved documents are locked for safety and compliance. Use a change request to propose modifications.

**Q: How do I know when a document needs review?**
A: You'll receive notifications based on your preferences. Check the "Overdue Reviews" widget on the dashboard.

**Q: Who can see my draft documents?**
A: Only you and administrators can see your drafts. Once submitted for review, reviewers and approvers can also see them.

**Q: How long are documents kept?**
A: All document versions are retained indefinitely for compliance and audit purposes.

**Q: Can I recover a deleted document?**
A: Administrators can recover recently deleted documents. Contact your system administrator.

**Q: How do I download a document?**
A: Open the document and click the download button. You can download the current version or any previous version.

## Safety and Compliance

### Important Reminders
- Always use the most current approved version
- Check the effective date before using
- Report any errors or safety concerns immediately
- Don't bypass the approval process
- Keep records of training on new procedures

### Quality Management
- Documents support ISO 9001 compliance
- Complete audit trail maintained
- Regular reviews ensure currency
- Version control prevents confusion

### Safety Management
- Documents support ISO 45001 compliance
- Safety-critical procedures clearly marked
- Emergency procedures easily accessible
- Training records linked to procedures

## Conclusion
The Document Management system helps ensure that everyone has access to the right information at the right time. By following this guide, you'll be able to effectively create, find, and manage organizational documents.

**Need more help?**
- Contact your administrator
- Check the Admin Guide for advanced features
- Review compliance documentation for specific requirements

