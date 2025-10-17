import { redirect } from 'next/navigation';
import { 
  FileText, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  FileWarning,
  Calendar,
  Users 
} from 'lucide-react';
import { createClient } from '@/lib/auth/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default async function MetricsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Mock metrics data - will be replaced with real database queries
  const metrics = {
    totalDocuments: 247,
    approvedDocuments: 189,
    pendingApproval: 32,
    overdueReviews: 8,
    documentsThisMonth: 15,
    reviewsCompleted: 45,
    averageApprovalTime: '3.2 days',
    complianceRate: 95.5,
  };

  const overdueDocuments = [
    {
      id: '1',
      name: 'Safety Procedures Manual',
      category: 'Safety',
      lastReview: '2024-08-15',
      nextReview: '2025-09-15',
      owner: 'John Smith',
      daysOverdue: 32,
    },
    {
      id: '2',
      name: 'Quality Control Standards',
      category: 'Quality',
      lastReview: '2024-07-20',
      nextReview: '2025-09-01',
      owner: 'Jane Doe',
      daysOverdue: 46,
    },
    {
      id: '3',
      name: 'Environmental Policy',
      category: 'Environment',
      lastReview: '2024-09-01',
      nextReview: '2025-09-30',
      owner: 'Mike Johnson',
      daysOverdue: 17,
    },
  ];

  const categoryBreakdown = [
    { category: 'Safety', count: 78, percentage: 31.6 },
    { category: 'Quality', count: 62, percentage: 25.1 },
    { category: 'Environmental', count: 45, percentage: 18.2 },
    { category: 'Training', count: 38, percentage: 15.4 },
    { category: 'Other', count: 24, percentage: 9.7 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Document Metrics</h1>
        <p className="text-muted-foreground mt-1">
          Compliance metrics, analytics, and reporting for ISO 9001 and ISO 45001
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalDocuments}</div>
            <p className="text-xs text-muted-foreground">
              +{metrics.documentsThisMonth} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.approvedDocuments}</div>
            <p className="text-xs text-muted-foreground">
              {((metrics.approvedDocuments / metrics.totalDocuments) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pendingApproval}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Reviews</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.overdueReviews}</div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reviews Completed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.reviewsCompleted}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Approval Time</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageApprovalTime}</div>
            <p className="text-xs text-muted-foreground">From submission to approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.complianceRate}%</div>
            <p className="text-xs text-muted-foreground">Documents up-to-date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">Document contributors</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Documents by Category</CardTitle>
          <CardDescription>Distribution of documents across categories</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Count</TableHead>
                <TableHead className="text-right">Percentage</TableHead>
                <TableHead className="w-[200px]">Distribution</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categoryBreakdown.map((item) => (
                <TableRow key={item.category}>
                  <TableCell className="font-medium">{item.category}</TableCell>
                  <TableCell className="text-right">{item.count}</TableCell>
                  <TableCell className="text-right">{item.percentage}%</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Overdue Documents */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileWarning className="h-5 w-5 text-red-600" />
                Overdue Review Documents
              </CardTitle>
              <CardDescription>Documents that have passed their review date</CardDescription>
            </div>
            <Badge variant="destructive">{overdueDocuments.length} overdue</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Last Review</TableHead>
                <TableHead>Next Review</TableHead>
                <TableHead className="text-right">Days Overdue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overdueDocuments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No overdue documents - great job! 🎉
                  </TableCell>
                </TableRow>
              ) : (
                overdueDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{doc.category}</Badge>
                    </TableCell>
                    <TableCell>{doc.owner}</TableCell>
                    <TableCell>{new Date(doc.lastReview).toLocaleDateString()}</TableCell>
                    <TableCell className="text-red-600 font-medium">
                      {new Date(doc.nextReview).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="destructive">{doc.daysOverdue} days</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
