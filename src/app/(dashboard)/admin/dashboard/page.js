// src/app/(dashboard)/admin/dashboard/page.js
import StatsDashboard from '@/components/dashboard/admin/StatsDashboard';

export const metadata = {
  title: 'Admin Analytics | LibOS',
  description: 'Real-time library metrics, circulation charts, and critical inventory anomalies.',
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Analytics Dashboard
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Monitor system health, circulation metrics, and outstanding financial structures.
        </p>
      </div>
      
      <StatsDashboard />
    </div>
  );
}