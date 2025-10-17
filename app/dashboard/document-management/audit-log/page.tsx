import { redirect } from 'next/navigation';
import { 
  FileText, 
  Upload, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Download,
  FolderPlus,
  FileCheck,
  Clock
} from 'lucide-react';
import { createClient } from '@/lib/auth/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default async function AuditLogPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Mock audit log data - will be replaced with real database queries
  const auditLogs = [
    {
      id: '1',
      action: 'document_uploaded',
      description: 'Uploaded Safety Procedures Manual v3.0',
      documentName: 'Safety-Procedures-v3.0.pdf',
      userName: 'John Smith',
      userEmail: 'john.smith@example.com',
      timestamp: '2025-10-17T10:30:00Z',
      ipAddress: '192.168.1.100',
      status: 'success',
    },
    {
      id: '2',
      action: 'document_approved',
      description: 'Approved Quality Standards document',
      documentName: 'Quality-Standards-v2.1.pdf',
      userName: 'Jane Doe',
      userEmail: 'jane.doe@example.com',
      timestamp: '2025-10-17T09:15:00Z',
      ipAddress: '192.168.1.105',
      status: 'success',
    },
    {
      id: '3',
      action: 'document_deleted',
      description: 'Deleted obsolete training material',
      documentName: 'Old-Training-Manual.pdf',
      userName: 'Mike Johnson',
      userEmail: 'mike.johnson@example.com',
      timestamp: '2025-10-16T16:45:00Z',
      ipAddress: '192.168.1.110',
      status: 'success',
    },
    {
      id: '4',
      action: 'document_edited',
      description: 'Updated Environmental Policy metadata',
      documentName: 'Environmental-Policy.pdf',
      userName: 'Sarah Williams',
      userEmail: 'sarah.williams@example.com',
      timestamp: '2025-10-16T14:20:00Z',
      ipAddress: '192.168.1.115',
      status: 'success',
    },
    {
      id: '5',
      action: 'document_downloaded',
      description: 'Downloaded ISO 9001 Procedures',
      documentName: 'ISO-9001-Procedures.pdf',
      userName: 'Tom Brown',
      userEmail: 'tom.brown@example.com',
      timestamp: '2025-10-16T11:00:00Z',
      ipAddress: '192.168.1.120',
      status: 'success',
    },
    {
      id: '6',
      action: 'folder_created',
      description: 'Created new folder "Compliance Documents"',
      documentName: null,
      userName: 'Jane Doe',
      userEmail: 'jane.doe@example.com',
      timestamp: '2025-10-15T13:30:00Z',
      ipAddress: '192.168.1.105',
      status: 'success',
    },
    {
      id: '7',
      action: 'document_rejected',
      description: 'Rejected Training Material v2.0 - incomplete',
      documentName: 'Training-Material-v2.0.pdf',
      userName: 'John Smith',
      userEmail: 'john.smith@example.com',
      timestamp: '2025-10-15T10:15:00Z',
      ipAddress: '192.168.1.100',
      status: 'warning',
    },
    {
      id: '8',
      action: 'document_viewed',
      description: 'Viewed Emergency Response Plan',
      documentName: 'Emergency-Response-Plan.pdf',
      userName: 'Mike Johnson',
      userEmail: 'mike.johnson@example.com',
      timestamp: '2025-10-15T08:45:00Z',
      ipAddress: '192.168.1.110',
      status: 'success',
    },
  ];

  const actionConfig = {
    document_uploaded: { icon: Upload, color: 'bg-blue-100 text-blue-800', label: 'Uploaded' },
    document_edited: { icon: Edit, color: 'bg-yellow-100 text-yellow-800', label: 'Edited' },
    document_deleted: { icon: Trash2, color: 'bg-red-100 text-red-800', label: 'Deleted' },
    document_approved: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Approved' },
    document_rejected: { icon: XCircle, color: 'bg-orange-100 text-orange-800', label: 'Rejected' },
    document_downloaded: { icon: Download, color: 'bg-purple-100 text-purple-800', label: 'Downloaded' },
    document_viewed: { icon: Eye, color: 'bg-gray-100 text-gray-800', label: 'Viewed' },
    folder_created: { icon: FolderPlus, color: 'bg-teal-100 text-teal-800', label: 'Folder Created' },
    document_checked: { icon: FileCheck, color: 'bg-indigo-100 text-indigo-800', label: 'Checked' },
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Log</h1>
        <p className="text-muted-foreground mt-1">
          Complete audit trail of all document management activities
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditLogs.length}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents Uploaded</CardTitle>
            <Upload className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {auditLogs.filter((log) => log.action === 'document_uploaded').length}
            </div>
            <p className="text-xs text-muted-foreground">New uploads</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approvals</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {auditLogs.filter((log) => log.action === 'document_approved').length}
            </div>
            <p className="text-xs text-muted-foreground">Documents approved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(auditLogs.map((log) => log.userEmail)).size}
            </div>
            <p className="text-xs text-muted-foreground">Unique users</p>
          </CardContent>
        </Card>
      </div>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>Chronological record of all document activities</CardDescription>
            </div>
            <Input
              placeholder="Search audit log..."
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>User</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No audit log entries found
                  </TableCell>
                </TableRow>
              ) : (
                auditLogs.map((log) => {
                  const actionInfo = actionConfig[log.action as keyof typeof actionConfig] || {
                    icon: FileText,
                    color: 'bg-gray-100 text-gray-800',
                    label: log.action,
                  };
                  const ActionIcon = actionInfo.icon;

                  return (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">
                        <div className="text-sm">{formatTimestamp(log.timestamp)}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${actionInfo.color} gap-1`}>
                          <ActionIcon className="h-3 w-3" />
                          {actionInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md">
                          <div className="text-sm font-medium">{log.description}</div>
                          {log.documentName && (
                            <div className="text-xs text-muted-foreground truncate">
                              {log.documentName}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{log.userName}</div>
                        <div className="text-xs text-muted-foreground">{log.userEmail}</div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {log.ipAddress}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={log.status === 'success' ? 'default' : 'secondary'}
                          className={
                            log.status === 'warning'
                              ? 'bg-orange-100 text-orange-800'
                              : undefined
                          }
                        >
                          {log.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ISO Compliance Note */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-blue-600" />
            ISO Compliance
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            This audit log maintains a complete, tamper-proof record of all document management
            activities to support ISO 9001 (Quality Management) and ISO 45001 (Occupational Health
            & Safety) compliance requirements. All entries are timestamped, attributed to specific
            users, and permanently retained for audit purposes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
