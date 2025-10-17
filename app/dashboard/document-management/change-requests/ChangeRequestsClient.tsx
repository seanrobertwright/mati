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

interface ChangeRequest {
  id: string;
  title: string;
  documentName: string;
  requestedBy: string;
  requestDate: string;
  status: 'pending' | 'in-review' | 'approved' | 'rejected';
  priority: 'high' | 'medium' | 'low';
}

interface ChangeRequestsClientProps {
  changeRequests: ChangeRequest[];
}

export function ChangeRequestsClient({ changeRequests }: ChangeRequestsClientProps) {
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
        <CreateChangeRequestDialog />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <FileEdit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{changeRequests.length}</div>
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
              {changeRequests.filter((r) => r.status === 'pending').length}
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
              {changeRequests.filter((r) => r.status === 'in-review').length}
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
              {changeRequests.filter((r) => r.status === 'approved').length}
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request Title</TableHead>
                <TableHead>Document</TableHead>
                <TableHead>Requested By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {changeRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No change requests found
                  </TableCell>
                </TableRow>
              ) : (
                changeRequests.map((request) => {
                  const StatusIcon = statusConfig[request.status].icon;

                  return (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.title}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {request.documentName}
                      </TableCell>
                      <TableCell>{request.requestedBy}</TableCell>
                      <TableCell>{new Date(request.requestDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={priorityConfig[request.priority]}
                        >
                          {request.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${statusConfig[request.status].color} gap-1`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig[request.status].label}
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
        </CardContent>
      </Card>
    </div>
  );
}
