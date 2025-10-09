/**
 * Document Management Services
 * 
 * This module provides business logic services for the document management system
 */

// Document lifecycle and workflow
export * from './document-lifecycle';
export * from './review-scheduler';
export * from './version-comparison';
export * from './change-request-workflow';

// Audit and metrics
export * from './audit-log';
export * from './metrics';

