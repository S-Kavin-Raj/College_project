
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { BarChart, PieChart, Download } from 'lucide-react';
import { Button } from '../components/ui/button';

export function ReportsPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Academic Reports</h2>
                <Button variant="outline" className="gap-2">
                    <Download className="w-4 h-4" /> Export All
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart className="w-5 h-5" /> Attendance Analysis
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-64 flex items-center justify-center bg-gray-50 rounded-md">
                        <span className="text-gray-400">Chart Visualization Placeholder</span>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieChart className="w-5 h-5" /> Performance Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-64 flex items-center justify-center bg-gray-50 rounded-md">
                        <span className="text-gray-400">Chart Visualization Placeholder</span>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

