'use client';

import { useState, useCallback } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Directory } from '@/lib/db/repositories/directories';
import { useDropzone } from '../hooks/useDragAndDrop';

interface DirectoryTreeProps {
  directories: Directory[];
  selectedDirectoryId?: string | null;
  onSelectDirectory: (directoryId: string | null) => void;
  onDocumentDrop?: (documentId: string, targetDirectoryId: string | null) => void;
  expandedIds?: Set<string>;
  onToggleExpand?: (directoryId: string) => void;
  className?: string;
}

interface DirectoryNode extends Directory {
  children: DirectoryNode[];
  level: number;
}

/**
 * Build a tree structure from flat directory list
 */
function buildDirectoryTree(directories: Directory[]): DirectoryNode[] {
  const nodeMap = new Map<string, DirectoryNode>();
  const roots: DirectoryNode[] = [];

  // Create nodes
  directories.forEach((dir) => {
    nodeMap.set(dir.id, { ...dir, children: [], level: 0 });
  });

  // Build tree
  directories.forEach((dir) => {
    const node = nodeMap.get(dir.id)!;

    if (dir.parentId === null) {
      roots.push(node);
    } else {
      const parent = nodeMap.get(dir.parentId);
      if (parent) {
        node.level = parent.level + 1;
        parent.children.push(node);
      } else {
        // Parent not found, treat as root
        roots.push(node);
      }
    }
  });

  // Sort children by name
  const sortNodes = (nodes: DirectoryNode[]) => {
    nodes.sort((a, b) => a.name.localeCompare(b.name));
    nodes.forEach((node) => sortNodes(node.children));
  };

  sortNodes(roots);

  return roots;
}

interface DirectoryTreeNodeProps {
  node: DirectoryNode;
  selectedDirectoryId?: string | null;
  onSelectDirectory: (directoryId: string | null) => void;
  onDocumentDrop?: (documentId: string, targetDirectoryId: string | null) => void;
  expandedIds: Set<string>;
  onToggleExpand: (directoryId: string) => void;
}

const DirectoryTreeNode: React.FC<DirectoryTreeNodeProps> = ({
  node,
  selectedDirectoryId,
  onSelectDirectory,
  onDocumentDrop,
  expandedIds,
  onToggleExpand,
}) => {
  const hasChildren = node.children.length > 0;
  const isSelected = selectedDirectoryId === node.id;
  const isExpanded = expandedIds.has(node.id);

  const handleClick = useCallback(() => {
    onSelectDirectory(node.id);
  }, [node.id, onSelectDirectory]);

  // Drop zone for dragged documents
  const { isDraggedOver, dropzoneProps } = useDropzone({
    onDrop: (data) => {
      if (typeof data === 'object' && 'documentId' in data && data.type === 'document') {
        const documentId = data.documentId as string;
        const currentDirId = data.currentDirectoryId as string | null;
        
        // Only trigger move if dropping into a different directory
        if (currentDirId !== node.id) {
          onDocumentDrop?.(documentId, node.id);
        }
      }
    },
  });

  const handleToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (hasChildren) {
        onToggleExpand(node.id);
      }
    },
    [hasChildren, node.id, onToggleExpand]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick();
      } else if (e.key === 'ArrowRight' && hasChildren && !isExpanded) {
        e.preventDefault();
        onToggleExpand(node.id);
      } else if (e.key === 'ArrowLeft' && hasChildren && isExpanded) {
        e.preventDefault();
        onToggleExpand(node.id);
      }
    },
    [handleClick, hasChildren, isExpanded, node.id, onToggleExpand]
  );

  return (
    <div className="select-none">
      <div
        {...dropzoneProps}
        role="button"
        tabIndex={0}
        aria-label={`Directory: ${node.name}`}
        aria-expanded={hasChildren ? isExpanded : undefined}
        className={cn(
          'flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer transition-colors',
          'hover:bg-accent hover:text-accent-foreground',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          isSelected && 'bg-accent text-accent-foreground font-medium',
          isDraggedOver && 'ring-2 ring-primary bg-primary/10'
        )}
        style={{ paddingLeft: `${node.level * 16 + 8}px` }}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        {hasChildren ? (
          <button
            type="button"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
            className="p-0.5 hover:bg-accent-foreground/10 rounded"
            onClick={handleToggle}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          <span className="w-5" />
        )}

        {isExpanded ? (
          <FolderOpen className="h-4 w-4 text-blue-500" />
        ) : (
          <Folder className="h-4 w-4 text-blue-500" />
        )}

        <span className="flex-1 text-sm truncate">{node.name}</span>
      </div>

      {hasChildren && isExpanded && (
        <div className="mt-0.5">
          {node.children.map((child) => (
            <DirectoryTreeNode
              key={child.id}
              node={child}
              selectedDirectoryId={selectedDirectoryId}
              onSelectDirectory={onSelectDirectory}
              onDocumentDrop={onDocumentDrop}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const DirectoryTree: React.FC<DirectoryTreeProps> = ({
  directories,
  selectedDirectoryId,
  onSelectDirectory,
  onDocumentDrop,
  expandedIds: externalExpandedIds,
  onToggleExpand: externalOnToggleExpand,
  className,
}) => {
  const [internalExpandedIds, setInternalExpandedIds] = useState<Set<string>>(
    new Set()
  );

  const expandedIds = externalExpandedIds ?? internalExpandedIds;
  const setExpandedIds = useCallback(
    (updater: (prev: Set<string>) => Set<string>) => {
      if (externalExpandedIds === undefined) {
        setInternalExpandedIds(updater);
      }
    },
    [externalExpandedIds]
  );

  const handleToggleExpand = useCallback(
    (directoryId: string) => {
      if (externalOnToggleExpand) {
        externalOnToggleExpand(directoryId);
      } else {
        setExpandedIds((prev) => {
          const next = new Set(prev);
          if (next.has(directoryId)) {
            next.delete(directoryId);
          } else {
            next.add(directoryId);
          }
          return next;
        });
      }
    },
    [externalOnToggleExpand, setExpandedIds]
  );

  const tree = buildDirectoryTree(directories);

  const handleRootClick = useCallback(() => {
    onSelectDirectory(null);
  }, [onSelectDirectory]);

  const handleRootKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleRootClick();
      }
    },
    [handleRootClick]
  );

  return (
    <div className={cn('space-y-0.5', className)}>
      {/* Root directory */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Root directory"
        className={cn(
          'flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors',
          'hover:bg-accent hover:text-accent-foreground',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          selectedDirectoryId === null &&
            'bg-accent text-accent-foreground font-medium'
        )}
        onClick={handleRootClick}
        onKeyDown={handleRootKeyDown}
      >
        <Folder className="h-4 w-4 text-blue-500" />
        <span className="text-sm font-medium">All Documents</span>
      </div>

      {/* Directory tree */}
      {tree.map((node) => (
        <DirectoryTreeNode
          key={node.id}
          node={node}
          selectedDirectoryId={selectedDirectoryId}
          onSelectDirectory={onSelectDirectory}
          onDocumentDrop={onDocumentDrop}
          expandedIds={expandedIds}
          onToggleExpand={handleToggleExpand}
        />
      ))}
    </div>
  );
};

