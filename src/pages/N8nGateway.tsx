import DashboardLayout from "@/components/DashboardLayout";
import N8nGatewayPanel from "@/components/n8n/N8nGatewayPanel";

const N8nGateway = () => {
  return (
    <DashboardLayout>
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <N8nGatewayPanel />
        </div>
      </main>
    </DashboardLayout>
  );
};

export default N8nGateway;
