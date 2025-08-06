import DashboardLayout from "@/components/DashboardLayout";
import DashboardOverview from "@/components/DashboardOverview";
// import { useWalletSession } from "@/hooks/useWalletSession";

const Dashboard = () => {
  // Temporarily disable authentication requirement
  // useWalletSession({ 
  //   requireAuth: true, 
  //   redirectTo: '/' 
  // });

  return (
    <DashboardLayout>
      <DashboardOverview />
    </DashboardLayout>
  );
};

export default Dashboard;