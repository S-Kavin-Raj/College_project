
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../app/components/ui/card';
import { Button } from '../app/components/ui/button';
import { AuthorizedEmailsManager } from '../app/components/AuthorizedEmailsManager';

export function SettingsPage({ userRole }: { userRole?: string }) {
    const canManageEmails = userRole === 'Admin' || userRole === 'Advisor';

    return (
        <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">System Settings</h2>
            <Card className="mb-6">
                <CardHeader><CardTitle>Profile Settings</CardTitle></CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium">Full Name</label>
                            <input type="text" className="border rounded-md p-2" defaultValue="Dr. Rajesh Kumar" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium">Email</label>
                            <input type="email" className="border rounded-md p-2" defaultValue="rajesh.kumar@college.edu" />
                        </div>
                        <Button>Save Changes</Button>
                    </div>
                </CardContent>
            </Card>

            {canManageEmails && <AuthorizedEmailsManager />}
        </div>
    );
}
