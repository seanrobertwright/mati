'use client';

import { useState, useEffect, use } from 'react';
import { FileText, FolderOpen, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { ModuleRouteProps } from '@/lib/safety-framework';
import {
  DirectoryTree,
  DirectoryBreadcrumb,
  DocumentList,
  CreateDirectoryDialog,
} from './components';

interface Directory {
  id: string;
  name: string;
  parentId: string | null;
  children?: Directory[];
}

interface Document {
  id: string;
  title: string;
  status: 'draft' | 'pending_review' | 'pending_approval' | 'approved' | 'under_review' | 'archived';
  category?: string;
  updatedAt: Date | string;
  owner?: string;
}

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

  // Handle subpage routing
  const subpage = resolvedParams.subpage?.[0];

  useEffect(() => {
    // TODO: Fetch directories and documents from API
    const loadData = async () => {
      try {
        setIsLoading(true);
        // Simulated API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setDirectories([]);
        setDocuments([]);
      } catch (error) {
        console.error('Failed to load documents:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentDirectoryId]);

  const handleCreateDirectory = async (name: string) => {
    // TODO: Implement directory creation
    console.log('Creating directory:', name);
    setShowCreateDialog(false);
  };

  const handleSelectDocument = (documentId: string) => {
    // TODO: Navigate to document detail view
    console.log('Selected document:', documentId);
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
        <h1 className="text-3xl font-bold">Documents</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCreateDialog(true)}
            className="gap-2"
          >
            <FolderOpen className="h-4 w-4" />
            New Folder
          </Button>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Upload Document
          </Button>
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
              currentDirectoryId={currentDirectoryId}
              onSelectDirectory={setCurrentDirectoryId}
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
                onSelectDocument={handleSelectDocument}
              />
            )}
          </Card>
        </div>
      </div>

      {/* Create Directory Dialog */}
      {showCreateDialog && (
        <CreateDirectoryDialog
          parentDirectoryId={currentDirectoryId}
          onConfirm={handleCreateDirectory}
          onCancel={() => setShowCreateDialog(false)}
        />
      )}
    </div>
  );
};

export default DocumentRoute;

