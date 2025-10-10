'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FolderPlus, Upload } from 'lucide-react';

/**
 * Simple fallback DocumentRoute for when the main module fails to load
 */
export default function DocumentRouteFallback() {
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateFolder = () => {
    const name = prompt('Enter folder name:');
    if (name) {
      alert(`Would create folder: ${name}`);
    }
  };

  const handleUpload = () => {
    alert('Upload functionality would be available here');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Management</h1>
          <p className="text-gray-600">Manage your documents and folders</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreateFolder} variant="outline">
            <FolderPlus className="h-4 w-4 mr-2" />
            New Folder
          </Button>
          <Button onClick={handleUpload}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <h3 className="font-medium mb-3">Folders</h3>
            <p className="text-sm text-gray-500">No folders yet. Create one to get started.</p>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card className="p-6">
            <div className="text-center py-12">
              <FolderPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Yet</h3>
              <p className="text-gray-500 mb-4">
                Get started by creating a folder or uploading your first document.
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={handleCreateFolder} variant="outline">
                  Create Folder
                </Button>
                <Button onClick={handleUpload}>
                  Upload Document
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
