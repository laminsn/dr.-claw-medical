import DashboardSidebar from "@/components/DashboardSidebar";
import N8nGatewayPanel from "@/components/n8n/N8nGatewayPanel";

const N8nGateway = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <N8nGatewayPanel />
        </div>
      </main>
    </div>
  );
};

export default N8nGateway;
