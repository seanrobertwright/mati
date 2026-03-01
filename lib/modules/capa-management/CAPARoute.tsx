import { Suspense } from 'react';
import CAPAList from './CAPAList';
import { CAPACreateForm } from './CAPACreateForm';
import { Card, CardContent } from '@/components/ui/card';
import type { ModuleRouteProps } from '@/lib/safety-framework';

function CAPAListSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <div className="h-8 w-48 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-64 bg-muted animate-pulse rounded mt-2" />
                </div>
                <div className="h-10 w-24 bg-muted animate-pulse rounded" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                    <Card key={i}>
                        <CardContent className="pt-6">
                            <div className="h-8 w-12 bg-muted animate-pulse rounded" />
                            <div className="h-3 w-16 bg-muted animate-pulse rounded mt-2" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <div className="p-4">
                    <div className="h-64 bg-muted animate-pulse rounded" />
                </div>
            </Card>
        </div>
    );
}

export default async function CAPARoute({ params }: ModuleRouteProps) {
    const { subpage } = await params;

    if (subpage?.[0] === 'new') {
        return <CAPACreateForm />;
    }

    return (
        <Suspense fallback={<CAPAListSkeleton />}>
            <CAPAList />
        </Suspense>
    );
}
