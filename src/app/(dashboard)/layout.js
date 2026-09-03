// src/app/(dashboard)/layout.js
import DashboardLayoutShell from '@/components/layout/DashboardLayoutShell';

export const metadata = {
  title: 'Library Dashboard',
  description: 'Manage your books, borrows, and fines seamlessly.',
};

export default function DashboardLayout({ children }) {
  return <DashboardLayoutShell>{children}</DashboardLayoutShell>;
}