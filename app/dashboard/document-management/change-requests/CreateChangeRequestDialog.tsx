'use client';

import { useState } from 'react';
import type { NewChangeRequest } from '@/lib/db/repositories/change-requests';
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

export function CreateChangeRequestDialog({ onCreate }: { onCreate?: (data: NewChangeRequest) => void }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    documentTitle: '',
    documentNumber: '',
    revision: '',
    requestDate: '', // string for input
    requestedBy: '',
    department: '',
    changeType: 'revision' as 'revision' | 'addition' | 'deletion' | 'clarification',
    reason: '',
    description: '',
    impactAssessment: '',
    affectedDocuments: '',
    proposedBy: '',
    reviewedBy: '',
    approvedBy: '',
    implementationDate: '', // string for input
  trainingRequired: false, // boolean for checkbox
  retrainingRequired: false, // boolean for checkbox
  priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    additionalNotes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (onCreate) {
      const payload = {
        ...formData,
        requestDate: formData.requestDate ? new Date(formData.requestDate) : new Date(),
        implementationDate: formData.implementationDate ? new Date(formData.implementationDate) : undefined,
        trainingRequired: formData.trainingRequired ? 'yes' : 'no',
        retrainingRequired: formData.retrainingRequired ? 'yes' : 'no',
        priority: formData.priority,
      };
      onCreate(payload);
    }

    setIsSubmitting(false);
    setOpen(false);
  setFormData({
      documentTitle: '',
      documentNumber: '',
      revision: '',
      requestDate: '',
      requestedBy: '',
      department: '',
      changeType: 'revision',
      reason: '',
      description: '',
      impactAssessment: '',
      affectedDocuments: '',
      proposedBy: '',
      reviewedBy: '',
      approvedBy: '',
      implementationDate: '',
      trainingRequired: false,
      retrainingRequired: false,
  additionalNotes: '',
  priority: 'medium',
    });
  };


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
          {/* Section: Document Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="documentTitle">Document Title <span className="text-red-500">*</span></Label>
              <Input id="documentTitle" value={formData.documentTitle} onChange={e => setFormData({ ...formData, documentTitle: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="documentNumber">Document Number <span className="text-red-500">*</span></Label>
              <Input id="documentNumber" value={formData.documentNumber} onChange={e => setFormData({ ...formData, documentNumber: e.target.value })} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="revision">Revision <span className="text-red-500">*</span></Label>
              <Input id="revision" value={formData.revision} onChange={e => setFormData({ ...formData, revision: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="affectedDocuments">Affected Documents</Label>
              <Input id="affectedDocuments" value={formData.affectedDocuments} onChange={e => setFormData({ ...formData, affectedDocuments: e.target.value })} />
            </div>
          </div>

          {/* Section: Request Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="requestDate">Request Date <span className="text-red-500">*</span></Label>
              <Input id="requestDate" type="date" value={formData.requestDate} onChange={e => setFormData({ ...formData, requestDate: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="proposedBy">Proposed By <span className="text-red-500">*</span></Label>
              <Input id="proposedBy" value={formData.proposedBy} onChange={e => setFormData({ ...formData, proposedBy: e.target.value })} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department <span className="text-red-500">*</span></Label>
              <Input id="department" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="requestedBy">Requested By <span className="text-red-500">*</span></Label>
              <Input id="requestedBy" value={formData.requestedBy} onChange={e => setFormData({ ...formData, requestedBy: e.target.value })} required />
            </div>
          </div>

          {/* Section: Change Details */}
          <div className="space-y-2">
            <Label>Change Type <span className="text-red-500">*</span></Label>
            <div className="grid grid-cols-2 gap-2">
              {changeTypeOptions.map(option => (
                <button key={option.value} type="button" onClick={() => setFormData({ ...formData, changeType: option.value as typeof formData.changeType })} className={`p-3 border-2 rounded-lg text-left transition-colors ${formData.changeType === option.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-muted-foreground">{option.description}</div>
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Change <span className="text-red-500">*</span></Label>
            <Input id="reason" value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
            <textarea id="description" className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label>
              Priority <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              {['low', 'medium', 'high', 'critical'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority: option as typeof formData.priority })}
                  className={`flex-1 p-2 border-2 rounded-lg transition-colors ${
                    formData.priority === option
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="impactAssessment">Impact Assessment <span className="text-red-500">*</span></Label>
            <textarea id="impactAssessment" className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" value={formData.impactAssessment} onChange={e => setFormData({ ...formData, impactAssessment: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="implementationDate">Implementation Date</Label>
              <Input id="implementationDate" type="date" value={formData.implementationDate} onChange={e => setFormData({ ...formData, implementationDate: e.target.value })} />
            </div>
            <div className="flex items-center gap-4 mt-6">
              <Label htmlFor="trainingRequired">Training Required</Label>
              <input type="checkbox" id="trainingRequired" checked={formData.trainingRequired} onChange={e => setFormData({ ...formData, trainingRequired: e.target.checked })} />
              <Label htmlFor="retrainingRequired">Retraining Required</Label>
              <input type="checkbox" id="retrainingRequired" checked={formData.retrainingRequired} onChange={e => setFormData({ ...formData, retrainingRequired: e.target.checked })} />
            </div>
          </div>

          {/* Section: Review & Approval */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reviewedBy">Reviewed By</Label>
              <Input id="reviewedBy" value={formData.reviewedBy} onChange={e => setFormData({ ...formData, reviewedBy: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="approvedBy">Approved By</Label>
              <Input id="approvedBy" value={formData.approvedBy} onChange={e => setFormData({ ...formData, approvedBy: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="additionalNotes">Additional Notes</Label>
              <Input id="additionalNotes" value={formData.additionalNotes} onChange={e => setFormData({ ...formData, additionalNotes: e.target.value })} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit Request'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
