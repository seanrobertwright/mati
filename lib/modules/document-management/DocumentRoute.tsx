'use client';

import { useState, useEffect, use } from 'react';
import { FileText, FolderOpen, Plus, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ModuleRouteProps } from '@/lib/safety-framework';
import {
  DirectoryTree,
  DirectoryBreadcrumb,
  DocumentList,
  CreateDirectoryDialog,
  DocumentUploadForm,
} from './components';
import { createDirectory, getAllDirectories, getDocuments, moveDocument } from './actions';
import type { Directory } from '@/lib/db/repositories/directories';
import type { Document } from '@/lib/db/repositories/documents';
import { createClient } from '@/lib/auth/client';
import { getUserRole, hasRole } from '@/lib/auth/permissions';

/**
 * DocumentRoute
 * 
 * Main route component for the Document Management module.
 * Provides file browser interface with directory navigation and document list.
 */
const DocumentRoute: React.FC<ModuleRouteProps> = ({ params }) => {
  const resolvedParams = use(params);
  const [currentDirectoryId, setCurrentDirectoryId] = useState<string | null>(null);
  const [directories, setDirectories] = useState<Directory[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [expandedDirectoryIds, setExpandedDirectoryIds] = useState<Set<string>>(new Set());
  const [canEdit, setCanEdit] = useState(false);
  const [isViewer, setIsViewer] = useState(false);

  // Handle subpage routing
  const subpage = resolvedParams.subpage?.[0];

  // Check user permissions
  useEffect(() => {
    const checkPermissions = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const role = getUserRole(user);
        setCanEdit(hasRole(user, 'employee'));
        setIsViewer(role === 'viewer');
      }
    };
    checkPermissions();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch directories
        const dirResult = await getAllDirectories();
        console.log('Directory result:', dirResult);
        
        if (dirResult.success && dirResult.directories) {
          setDirectories(dirResult.directories);
          console.log('Loaded directories:', dirResult.directories.length);
        } else {
          console.error('Failed to load directories:', dirResult.error || 'Unknown error');
          setDirectories([]);
        }
        
        // Fetch documents for current directory
        const docResult = await getDocuments(currentDirectoryId);
        console.log('Document result:', docResult);
        
        if (docResult.success && docResult.documents) {
          setDocuments(docResult.documents);
          console.log('Loaded documents:', docResult.documents.length);
        } else {
          console.error('Failed to load documents:', docResult.error || 'Unknown error');
          setDocuments([]);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        setDirectories([]);
        setDocuments([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentDirectoryId]);

  const loadDirectories = async () => {
    try {
      const dirResult = await getAllDirectories();
      if (dirResult.success && dirResult.directories) {
        setDirectories(dirResult.directories);
      } else {
        console.error('Failed to load directories:', dirResult.error);
        setDirectories([]);
      }
    } catch (error) {
      console.error('Failed to load directories:', error);
      setDirectories([]);
    }
  };

  const loadDocuments = async () => {
    try {
      const docResult = await getDocuments(currentDirectoryId);
      if (docResult.success && docResult.documents) {
        setDocuments(docResult.documents);
      } else {
        console.error('Failed to load documents:', docResult.error);
        setDocuments([]);
      }
    } catch (error) {
      console.error('Failed to load documents:', error);
      setDocuments([]);
    }
  };

  const handleCreateDirectory = async (name: string, parentId: string | null) => {
    try {
      const result = await createDirectory({
        name,
        parentId: parentId || currentDirectoryId,
      });

      if (result.error) {
        console.error('Failed to create directory:', result.error);
        alert(result.error);
        return;
      }

      console.log('Directory created successfully:', result.directory);
      
      // Reload directories
      setShowCreateDialog(false);
      await loadDirectories();
    } catch (error) {
      console.error('Error creating directory:', error);
      alert('Failed to create directory');
    }
  };

  const handleDocumentDrop = async (documentId: string, targetDirectoryId: string | null) => {
    try {
      console.log(`Moving document ${documentId} to directory ${targetDirectoryId}`);
      
      const result = await moveDocument(documentId, targetDirectoryId);

      if (result.success) {
        console.log('Document moved successfully');
        // Reload documents to reflect the change
        await loadDocuments();
      } else {
        console.error('Failed to move document:', result.error);
        alert(result.error || 'Failed to move document');
      }
    } catch (error) {
      console.error('Error moving document:', error);
      alert('An error occurred while moving the document');
    }
  };

  const handleToggleExpand = (directoryId: string) => {
    setExpandedDirectoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(directoryId)) {
        next.delete(directoryId);
      } else {
        next.add(directoryId);
      }
      return next;
    });
  };

  const handleSelectDirectory = (directoryId: string | null) => {
    setCurrentDirectoryId(directoryId);
    
    // Auto-expand the selected directory if it has children
    if (directoryId) {
      const hasChildren = directories.some(d => d.parentId === directoryId);
      
      if (hasChildren) {
        setExpandedDirectoryIds((prev) => {
          const next = new Set(prev);
          next.add(directoryId);
          return next;
        });
      }
    }
  };

  const handleSelectDocument = (document: Document) => {
    // TODO: Navigate to document detail view
    console.log('Selected document:', document.id);
  };

  const handleUploadComplete = async (documentId: string) => {
    console.log('Upload complete:', documentId);
    setShowUploadDialog(false);
    // Reload data
    await loadDocuments();
  };

  // Route to different views based on subpage
  if (subpage === 'change-requests') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Change Requests</h1>
        </div>
        <Card className="p-6">
          <p className="text-muted-foreground text-center py-12">
            Change Requests view - Coming soon
          </p>
        </Card>
      </div>
    );
  }

  if (subpage === 'metrics') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Metrics & Reports</h1>
        </div>
        <Card className="p-6">
          <p className="text-muted-foreground text-center py-12">
            Metrics Dashboard - Coming soon
          </p>
        </Card>
      </div>
    );
  }

  if (subpage === 'audit-log') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Audit Log</h1>
        </div>
        <Card className="p-6">
          <p className="text-muted-foreground text-center py-12">
            Audit Log Viewer - Coming soon
          </p>
        </Card>
      </div>
    );
  }

  // Default: Document browser view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">Documents</h1>
          {isViewer && (
            <Badge variant="secondary" className="gap-1">
              <Eye className="h-3 w-3" />
              Read-Only Access
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateDialog(true)}
                className="gap-2"
              >
                <FolderOpen className="h-4 w-4" />
                New Folder
              </Button>
              <Button 
                size="sm" 
                className="gap-2"
                onClick={() => setShowUploadDialog(true)}
              >
                <Plus className="h-4 w-4" />
                Upload Document
              </Button>
            </>
          )}
        </div>
      </div>

      {/* File Browser */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Directory Tree Sidebar */}
        <Card className="lg:col-span-1 p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Folders
          </h3>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : directories.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8">
              No folders yet
            </div>
          ) : (
            <DirectoryTree
              directories={directories}
              selectedDirectoryId={currentDirectoryId}
              onSelectDirectory={handleSelectDirectory}
              onDocumentDrop={handleDocumentDrop}
              expandedIds={expandedDirectoryIds}
              onToggleExpand={handleToggleExpand}
            />
          )}
        </Card>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-4">
          {/* Breadcrumb */}
          <DirectoryBreadcrumb
            currentDirectoryId={currentDirectoryId}
            directories={directories}
            onNavigate={setCurrentDirectoryId}
          />

          {/* Document List */}
          <Card className="p-6">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : documents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <FileText className="h-16 w-16 mb-4 opacity-20" />
                <p className="text-lg font-medium">No documents in this folder</p>
                <p className="text-sm">Upload your first document to get started</p>
              </div>
            ) : (
              <DocumentList
                documents={documents}
                onDocumentClick={handleSelectDocument}
              />
            )}
          </Card>
        </div>
      </div>

      {/* Create Directory Dialog */}
      <CreateDirectoryDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        parentDirectoryId={currentDirectoryId}
        onCreateDirectory={handleCreateDirectory}
      />

      {/* Upload Document Dialog */}
      {showUploadDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Upload Document</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUploadDialog(false)}
                >
                  ×
                </Button>
              </div>
              <DocumentUploadForm
                directoryId={currentDirectoryId || undefined}
                onUploadComplete={handleUploadComplete}
                onCancel={() => setShowUploadDialog(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentRoute;

