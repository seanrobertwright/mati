/**
 * Document Management Server Actions
 * 
 * Centralized exports for all server actions
 */

// Document CRUD operations
export {
  createDocument,
  updateDocument,
  deleteDocument,
  getDocument,
  getDocuments,
} from './documents';

// Directory operations
export {
  createDirectory,
  renameDirectory,
  deleteDirectory,
  getDirectoryTree,
  getAllDirectories,
  moveDirectory,
} from './directories';

// Approval workflow
export {
  submitForReview,
  approveReview,
  requestChanges,
  approveDocument,
  rejectDocument,
  assignReviewer,
  assignApprover,
} from './approvals';

// Change requests
export {
  createChangeRequest,
  updateChangeRequest,
  submitChangeRequest,
  approveChangeRequest,
  rejectChangeRequest,
  addChangeRequestComment,
  getChangeRequests,
  markChangeRequestImplemented,
} from './change-requests';

