import UserDashboardClient from './UserDashboardClient';

export const metadata = {
    title: 'My Dashboard | LibOS',
    description: 'View your active loans, upcoming returns, and outstanding fines in one place.',
};

export default function UserDashboardPage() {
    return <UserDashboardClient />;
}
