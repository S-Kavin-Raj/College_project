import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface AdminRequest {
    id: number;
    table_name: string;
    change_type: string;
    new_data: any; // JSON string or object
    status: string;
    created_at: string;
    requested_by: number;
}

interface AdminRequestsPanelProps {
    requests: AdminRequest[];
    onProcess: (id: number, action: 'APPROVE' | 'REJECT', comment: string) => void;
}

export function AdminRequestsPanel({ requests, onProcess }: AdminRequestsPanelProps) {
    const [comment, setComment] = useState("");
    const [selectedReq, setSelectedReq] = useState<number | null>(null);

    if (requests.length === 0) return null;

    return (
        <Card className="border-orange-200 bg-orange-50 mb-8 animate-in fade-in slide-in-from-top-4">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <CardTitle className="text-lg font-semibold text-orange-800">
                    Pending Admin Change Requests ({requests.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {requests.map(req => {
                        const data = typeof req.new_data === 'string' ? JSON.parse(req.new_data) : req.new_data;
                        return (
                            <div key={req.id} className="bg-white p-4 rounded-lg border border-orange-100 shadow-sm flex flex-col md:flex-row justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700 uppercase">
                                            {req.change_type} {req.table_name}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            {new Date(req.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-800 font-medium">
                                        Admin requested change:
                                        <span className="font-normal text-slate-600 ml-1">
                                            {JSON.stringify(data).slice(0, 100)}...
                                        </span>
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2 min-w-[200px]">
                                    {selectedReq === req.id ? (
                                        <div className="flex flex-col gap-2">
                                            <input
                                                type="text"
                                                placeholder="Reason/Comment"
                                                className="text-xs p-2 border rounded"
                                                value={comment}
                                                onChange={e => setComment(e.target.value)}
                                            />
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="ghost" onClick={() => setSelectedReq(null)} className="flex-1 text-xs">Cancel</Button>
                                                <Button size="sm" className="flex-1 text-xs bg-green-600 hover:bg-green-700" onClick={() => onProcess(req.id, 'APPROVE', comment)}>Confirm</Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-1"
                                                onClick={() => { setSelectedReq(req.id); setComment("Approved"); }}
                                            >
                                                <CheckCircle className="w-3 h-3" /> Approve
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1 text-red-600 border-red-200 hover:bg-red-50 gap-1"
                                                onClick={() => { setSelectedReq(req.id); setComment("Rejected"); }} // Actually needs confirm for reject too? reuse same UI
                                            >
                                                <XCircle className="w-3 h-3" /> Reject
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
