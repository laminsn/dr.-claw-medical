import DashboardSidebar from "@/components/DashboardSidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  overdueTaskCount?: number;
}

const DashboardLayout = ({ children, overdueTaskCount }: DashboardLayoutProps) => {
  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar overdueTaskCount={overdueTaskCount} />
      {children}
    </div>
  );
};

export default DashboardLayout;
