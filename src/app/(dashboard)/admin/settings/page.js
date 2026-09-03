export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Admin Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Configure your library management preferences, staff roles, and access settings from here.</p>
      </div>
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
        <p className="text-sm text-slate-500 dark:text-slate-400">No settings are available yet. Connect your system settings API to enable full administration controls.</p>
      </div>
    </div>
  );
}
