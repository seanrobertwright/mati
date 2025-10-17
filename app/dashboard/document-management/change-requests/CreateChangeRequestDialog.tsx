'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export function CreateChangeRequestDialog() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    documentName: '',
    description: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    changeType: 'revision' as 'revision' | 'addition' | 'deletion' | 'clarification',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // TODO: Implement actual submission to server action
    console.log('Submitting change request:', formData);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setOpen(false);
    
    // Reset form
    setFormData({
      title: '',
      documentName: '',
      description: '',
      priority: 'medium',
      changeType: 'revision',
    });

    // TODO: Show success message and refresh the list
  };

  const priorityOptions = [
    { value: 'high', label: 'High', color: 'bg-red-100 text-red-800 border-red-200' },
    { value: 'medium', label: 'Medium', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800 border-gray-200' },
  ];

  const changeTypeOptions = [
    { value: 'revision', label: 'Revision', description: 'Update existing content' },
    { value: 'addition', label: 'Addition', description: 'Add new content' },
    { value: 'deletion', label: 'Deletion', description: 'Remove content' },
    { value: 'clarification', label: 'Clarification', description: 'Clarify existing content' },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Change Request
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Change Request</DialogTitle>
          <DialogDescription>
            Submit a request to modify an existing document. All changes will go through the approval
            workflow.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Request Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., Update Safety Procedure Section 3.2"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <p className="text-xs text-muted-foreground">
              A clear, concise title for this change request
            </p>
          </div>

          {/* Document Name */}
          <div className="space-y-2">
            <Label htmlFor="documentName">
              Document Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="documentName"
              placeholder="e.g., Safety-Procedures-v2.3.pdf"
              value={formData.documentName}
              onChange={(e) => setFormData({ ...formData, documentName: e.target.value })}
              required
            />
            <p className="text-xs text-muted-foreground">
              The name of the document you want to change
            </p>
          </div>

          {/* Change Type */}
          <div className="space-y-2">
            <Label>
              Change Type <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {changeTypeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      changeType: option.value as typeof formData.changeType,
                    })
                  }
                  className={`p-3 border-2 rounded-lg text-left transition-colors ${
                    formData.changeType === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-muted-foreground">{option.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <textarea
              id="description"
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Describe the changes you want to make and why they are necessary..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
            <p className="text-xs text-muted-foreground">
              Explain what changes are needed and the reason for the change
            </p>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label>
              Priority <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              {priorityOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      priority: option.value as typeof formData.priority,
                    })
                  }
                  className={`flex-1 p-2 border-2 rounded-lg transition-colors ${
                    formData.priority === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Badge variant="outline" className={`w-full ${option.color}`}>
                    {option.label}
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
