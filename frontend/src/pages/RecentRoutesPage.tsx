import Header from "@/components/Header";
import RecentRoutes from "@/components/RecentRoutes";
import Footer from "@/components/Footer";

const RecentRoutesPage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Recent Routes</h1>
          <p className="text-muted-foreground">View and manage your recent voyage plans</p>
        </div>
        
        <RecentRoutes />
      </main>
      
      <Footer />
    </div>
  );
};

export default RecentRoutesPage;