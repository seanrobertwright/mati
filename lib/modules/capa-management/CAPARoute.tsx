'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Filter, Download } from 'lucide-react';

export default function CAPARoute() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">CAPA Management</h1>
                    <p className="text-muted-foreground">
                        Corrective and Preventive Actions tracking and management
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Filter className="mr-2 h-4 w-4" />
                        Filter
                    </Button>
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New CAPA
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="active" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="pending">Pending Review</TabsTrigger>
                    <TabsTrigger value="closed">Closed</TabsTrigger>
                    <TabsTrigger value="all">All Records</TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Active CAPAs</CardTitle>
                            <CardDescription>
                                Manage ongoing corrective and preventive actions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-10 text-muted-foreground">
                                No active CAPAs found. Create one to get started.
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="pending">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pending Review</CardTitle>
                            <CardDescription>
                                CAPAs waiting for effectiveness verification or closure
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-10 text-muted-foreground">
                                No CAPAs pending review.
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="closed">
                    <Card>
                        <CardHeader>
                            <CardTitle>Closed CAPAs</CardTitle>
                            <CardDescription>
                                Historical record of completed actions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-10 text-muted-foreground">
                                No closed CAPAs found.
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
