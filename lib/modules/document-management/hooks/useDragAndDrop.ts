/**
 * Reusable drag-and-drop hooks for document management
 */

import { useState, useCallback, useRef, DragEvent } from 'react';

export interface DragState {
  isDragging: boolean;
  isDraggedOver: boolean;
}

export interface UseDraggableOptions {
  onDragStart?: () => void;
  onDragEnd?: () => void;
  dragData?: Record<string, unknown>;
}

export interface UseDropzoneOptions {
  onDrop?: (data: File[] | Record<string, unknown>, event: DragEvent) => void;
  onDragEnter?: () => void;
  onDragLeave?: () => void;
  accept?: string[]; // MIME types or file extensions (reserved for future use)
}

/**
 * Hook for making an element draggable
 */
export function useDraggable({ onDragStart, onDragEnd, dragData }: UseDraggableOptions = {}) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = useCallback(
    (e: DragEvent) => {
      setIsDragging(true);
      
      // Set drag data
      if (dragData) {
        e.dataTransfer.setData('application/json', JSON.stringify(dragData));
      }
      
      // Set drag effect
      e.dataTransfer.effectAllowed = 'move';
      
      onDragStart?.();
    },
    [dragData, onDragStart]
  );

  const handleDragEnd = useCallback(
    () => {
      setIsDragging(false);
      onDragEnd?.();
    },
    [onDragEnd]
  );

  return {
    isDragging,
    dragProps: {
      draggable: true,
      onDragStart: handleDragStart,
      onDragEnd: handleDragEnd,
    },
  };
}

/**
 * Hook for making an element a drop zone
 */
export function useDropzone({ onDrop, onDragEnter, onDragLeave, accept }: UseDropzoneOptions = {}) {
  const [isDraggedOver, setIsDraggedOver] = useState(false);
  const dragCounterRef = useRef(0);

  const handleDragEnter = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      dragCounterRef.current++;
      
      if (dragCounterRef.current === 1) {
        setIsDraggedOver(true);
        onDragEnter?.();
      }
    },
    [onDragEnter]
  );

  const handleDragLeave = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      dragCounterRef.current--;
      
      if (dragCounterRef.current === 0) {
        setIsDraggedOver(false);
        onDragLeave?.();
      }
    },
    [onDragLeave]
  );

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Set drop effect
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      dragCounterRef.current = 0;
      setIsDraggedOver(false);

      try {
        // Try to get JSON data (for dragging documents)
        const jsonData = e.dataTransfer.getData('application/json');
        if (jsonData) {
          const data = JSON.parse(jsonData);
          onDrop?.(data, e);
          return;
        }

        // Otherwise, handle file drops
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
          onDrop?.(files, e);
        }
      } catch (error) {
        console.error('Error handling drop:', error);
      }
    },
    [onDrop]
  );

  return {
    isDraggedOver,
    dropzoneProps: {
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop,
    },
  };
}

/**
 * Combined hook for elements that are both draggable and drop zones
 */
export function useDragAndDrop(
  draggableOptions: UseDraggableOptions = {},
  dropzoneOptions: UseDropzoneOptions = {}
) {
  const { isDragging, dragProps } = useDraggable(draggableOptions);
  const { isDraggedOver, dropzoneProps } = useDropzone(dropzoneOptions);

  return {
    isDragging,
    isDraggedOver,
    dragAndDropProps: {
      ...dragProps,
      ...dropzoneProps,
    },
  };
}
