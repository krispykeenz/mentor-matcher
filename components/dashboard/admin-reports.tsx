'use client';

import useSWR from 'swr';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Unauthorized');
  }
  return res.json();
};

export function AdminReports() {
  const { data, mutate, error } = useSWR('/api/admin/reports', fetcher, {
    refreshInterval: 15000,
  });
  const reports = data?.reports ?? [];

  const updateReport = async (id: string, status: string, action: string) => {
    const response = await fetch(`/api/admin/reports/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, action }),
    });
    if (response.ok) {
      toast.success('Report updated');
      mutate();
    } else {
      toast.error('Unable to update report');
    }
  };

  if (error) {
    return (
      <p className="mt-6 text-sm text-red-600">
        You need admin access to view this page.
      </p>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      {reports.length === 0 && (
        <p className="text-sm text-slate-500">No reports at this time.</p>
      )}
      {reports.map((report: any) => (
        <Card key={report.id}>
          <CardContent className="space-y-3 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  {report.category}
                </h3>
                <p className="text-xs text-slate-500">{report.details}</p>
              </div>
              <span className="text-xs uppercase text-slate-500">
                {report.status}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => updateReport(report.id, 'actioned', 'warn')}
              >
                Warn
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateReport(report.id, 'actioned', 'suspend')}
              >
                Suspend
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
