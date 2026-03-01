import { getCAPAs } from '@/lib/db/repositories/capas';
import { createClient } from '@/lib/auth/server';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';

export default async function CAPAList() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const allCAPAs = await getCAPAs(user);

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'critical':
      case 'high':
        return 'destructive' as const;
      case 'medium':
        return 'default' as const;
      case 'low':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'major':
        return 'destructive' as const;
      case 'moderate':
        return 'default' as const;
      case 'minor':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'closed':
        return 'secondary' as const;
      case 'investigation':
      case 'action':
      case 'verification':
        return 'default' as const;
      case 'draft':
        return 'outline' as const;
      default:
        return 'outline' as const;
    }
  };

  const getTypeVariant = (type: string) => {
    return type === 'corrective' ? 'default' as const : 'secondary' as const;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CAPA Management</h1>
          <p className="text-gray-600 mt-1">
            Track and manage Corrective and Preventive Actions
          </p>
        </div>
        <Link href="/dashboard/capa-management/new">
          <Button>New CAPA</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{allCAPAs.length}</div>
            <p className="text-xs text-muted-foreground">Total CAPAs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-muted-foreground">
              {allCAPAs.filter(c => c.status === 'draft').length}
            </div>
            <p className="text-xs text-muted-foreground">Draft</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">
              {allCAPAs.filter(c => c.status === 'investigation').length}
            </div>
            <p className="text-xs text-muted-foreground">In Investigation</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-destructive">
              {allCAPAs.filter(c => c.status === 'action').length}
            </div>
            <p className="text-xs text-muted-foreground">In Action</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-secondary-foreground">
              {allCAPAs.filter(c => c.status === 'closed').length}
            </div>
            <p className="text-xs text-muted-foreground">Closed</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>CAPA Number</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Initiated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allCAPAs.map((capa) => (
              <TableRow key={capa.id}>
                <TableCell className="font-medium">{capa.number}</TableCell>
                <TableCell>
                  <div className="font-medium">{capa.title}</div>
                  <div className="text-sm text-muted-foreground truncate max-w-md">
                    {capa.description}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getTypeVariant(capa.type)}>
                    {capa.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getPriorityVariant(capa.priority)}>
                    {capa.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getSeverityVariant(capa.severity)}>
                    {capa.severity}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(capa.status)}>
                    {capa.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">
                  {capa.dueDate ? new Date(capa.dueDate).toLocaleDateString() : '-'}
                </TableCell>
                <TableCell className="text-sm">
                  {new Date(capa.initiatedAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
