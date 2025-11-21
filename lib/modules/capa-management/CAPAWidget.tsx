import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

export default function CAPAWidget() {
    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CAPA Status</CardTitle>
                <Badge variant="outline">3 Active</Badge>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-medium">Overdue Actions</span>
                        </div>
                        <span className="text-sm font-bold">1</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium">Pending Review</span>
                        </div>
                        <span className="text-sm font-bold">2</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium">Closed this Month</span>
                        </div>
                        <span className="text-sm font-bold">5</span>
                    </div>

                    <Button asChild className="w-full mt-4" variant="outline" size="sm">
                        <Link href="/dashboard/capa-management">
                            View All CAPAs <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
