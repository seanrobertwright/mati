'use client';

import { FileEdit, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CreateChangeRequestDialog } from './CreateChangeRequestDialog';
import { useState, useEffect } from 'react';
// Remove server actions, use API routes

interface ChangeRequest {
  id: string;
  documentTitle: string;
  documentNumber: string;
  revision: string;
  requestDate: string;
  requestedBy: string;
  department: string;
  changeType: string;
  reason: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  impactAssessment: string;
  status: 'pending' | 'in-review' | 'approved' | 'rejected';
}

interface ChangeRequestsClientProps {
  changeRequests?: ChangeRequest[];
}

// Type for new requests (without id/status)
interface NewChangeRequest {
  documentTitle: string;
  documentNumber: string;
  revision: string;
  requestDate: Date;
  requestedBy: string;
  department: string;
  changeType: string;
  reason: string;
  description: string;
  priority: 'high' | 'medium' | 'low' | 'critical' | null;
  impactAssessment: string;
}

export function ChangeRequestsClient({ changeRequests }: ChangeRequestsClientProps) {
  const [requests, setRequests] = useState<ChangeRequest[]>(changeRequests ?? []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('/api/change-requests')
      .then((res) => res.json())
      .then((data) => {
        setRequests(data);
        setLoading(false);
      });
  }, []);

  const statusConfig = {
    pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pending' },
    'in-review': { icon: AlertCircle, color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'In Review' },
    approved: { icon: CheckCircle2, color: 'bg-green-100 text-green-800 border-green-200', label: 'Approved' },
    rejected: { icon: XCircle, color: 'bg-red-100 text-red-800 border-red-200', label: 'Rejected' },
  };

  const priorityConfig = {
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-orange-100 text-orange-800 border-orange-200',
    low: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  // Handler to add a new request
  async function handleCreate(newRequest: NewChangeRequest) {
    setLoading(true);
    try {
      // Convert requestDate to string for API
      const payload = { ...newRequest, requestDate: newRequest.requestDate.toISOString() };
      await fetch('/api/change-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const updated = await fetch('/api/change-requests').then((res) => res.json());
      setRequests(updated);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Change Requests</h1>
          <p className="text-muted-foreground mt-1">
            Manage document change requests and approval workflows
          </p>
        </div>
  <CreateChangeRequestDialog onCreate={handleCreate} />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <FileEdit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requests.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {requests.filter((r) => r.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Review</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {requests.filter((r) => r.status === 'in-review').length}
            </div>
            <p className="text-xs text-muted-foreground">Being evaluated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {requests.filter((r) => r.status === 'approved').length}
            </div>
            <p className="text-xs text-muted-foreground">Ready to implement</p>
          </CardContent>
        </Card>
      </div>

      {/* Change Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Change Requests</CardTitle>
          <CardDescription>View and manage all document change requests</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document Title</TableHead>
                  <TableHead>Document Number</TableHead>
                  <TableHead>Revision</TableHead>
                  <TableHead>Request Date</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Change Type</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Impact Assessment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No change requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((request) => {
                    const StatusIcon = statusConfig[request.status]?.icon;
                    return (
                      <TableRow key={request.id}>
                        <TableCell>{request.documentTitle ?? ''}</TableCell>
                        <TableCell>{request.documentNumber ?? ''}</TableCell>
                        <TableCell>{request.revision ?? ''}</TableCell>
                        <TableCell>{request.requestDate ? new Date(request.requestDate).toLocaleDateString() : ''}</TableCell>
                        <TableCell>{request.requestedBy ?? ''}</TableCell>
                        <TableCell>{request.department ?? ''}</TableCell>
                        <TableCell>{request.changeType ?? ''}</TableCell>
                        <TableCell>{request.reason ?? ''}</TableCell>
                        <TableCell>{request.description ?? ''}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={priorityConfig[request.priority ?? 'medium']}
                          >
                            {request.priority ?? 'medium'}
                          </Badge>
                        </TableCell>
                        <TableCell>{request.impactAssessment ?? ''}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${statusConfig[request.status]?.color ?? ''} gap-1`}
                          >
                            {StatusIcon && <StatusIcon className="h-3 w-3" />}
                            {statusConfig[request.status]?.label ?? request.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
