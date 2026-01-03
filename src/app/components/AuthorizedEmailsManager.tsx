import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Trash2, Plus, Mail } from 'lucide-react';

interface AuthorizedEmail {
    id: number;
    email: string;
    created_at: string;
}

export function AuthorizedEmailsManager() {
    const [emails, setEmails] = useState<AuthorizedEmail[]>([]);
    const [newEmail, setNewEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchEmails = async () => {
        try {
            const token = localStorage.getItem('dam_token');
            if (!token) return;

            const res = await fetch('/admin/authorized-emails', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setEmails(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchEmails();
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEmail.trim()) return;

        setLoading(true);
        setError("");
        try {
            const token = localStorage.getItem('dam_token');
            const res = await fetch('/admin/authorized-emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ email: newEmail })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed");

            setNewEmail("");
            fetchEmails();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to remove this email? The user will no longer be able to login.")) return;
        try {
            const token = localStorage.getItem('dam_token');
            await fetch(`/admin/authorized-emails/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchEmails();
        } catch (err) {
            alert("Failed to delete");
        }
    };

    return (
        <Card className="mt-6 border-blue-100 shadow-sm">
            <CardHeader className="bg-blue-50/50">
                <CardTitle className="flex items-center gap-2 text-blue-900">
                    <Mail className="w-5 h-5 text-blue-600" />
                    Authorized Emails
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="mb-6">
                    <p className="text-sm text-gray-500 mb-4">
                        Add email addresses that are allowed to login to this Department & Year.
                        Only authorized emails can access the system.
                    </p>
                    <form onSubmit={handleAdd} className="flex gap-2">
                        <input
                            type="email"
                            required
                            placeholder="student@example.com"
                            className="flex-1 border rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={newEmail}
                            onChange={e => setNewEmail(e.target.value)}
                        />
                        <Button disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                            {loading ? "Adding..." : <><Plus className="w-4 h-4 mr-1" /> Add Email</>}
                        </Button>
                    </form>
                    {error && <p className="text-red-500 text-sm mt-2 flex items-center gap-1">⚠️ {error}</p>}
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {emails.map(email => (
                        <div key={email.id} className="flex justify-between items-center p-3 bg-white rounded border border-gray-100 hover:border-blue-200 transition-colors group">
                            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">{email.email}</span>
                            <Button
                                variant="ghost"
                                size="sm" // Assuming component supports size="sm" as derived from "sm" string usage possibility
                                onClick={() => handleDelete(email.id)}
                                className="text-gray-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                    {emails.length === 0 && (
                        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed text-gray-400">
                            No emails authorized yet.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
