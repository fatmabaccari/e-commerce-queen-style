import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return ( <ProtectedRoute adminOnly> <DashboardLayout>{children}</DashboardLayout> </ProtectedRoute> );
}

