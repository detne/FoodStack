import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Pricing from "./pages/Pricing";
import Onboarding from "./pages/Onboarding";
import Login from "./pages/Login";
import RestaurantSelector from "./pages/RestaurantSelector";
import BranchSelector from "./pages/BranchSelector";
import Dashboard from "./pages/Dashboard";
import DashboardNew from "./pages/DashboardNew";
import Branches from "./pages/Branches";
import CreateBranch from "./pages/CreateBranch";
import EditBranch from "./pages/EditBranch";
import BranchDetails from "./pages/BranchDetails";
import Categories from "./pages/Categories";
import CreateCategory from "./pages/CreateCategory";
import EditCategory from "./pages/EditCategory";
import MenuItems from "./pages/MenuItems";
import CreateMenuItem from "./pages/CreateMenuItem";
import EditMenuItem from "./pages/EditMenuItem";
import Areas from "./pages/Areas";
import Tables from "./pages/Tables";
import Orders from "./pages/Orders";
import QRCodes from "./pages/QRCodes";
import Staff from "./pages/Staff";
import Reservations from "./pages/Reservations";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Reviews from "./pages/Reviews";
import OrderDetail from "./pages/OrderDetail";
import ServiceRequests from "./pages/ServiceRequests";
import KitchenDisplay from "./pages/KitchenDisplay";
import UIShowcase from "./pages/UIShowcase";
import NotFound from "./pages/NotFound";
import OwnerDashboard from "./pages/OwnerDashboard";
import QRAnalytics from "./pages/QRAnalytics";
import ApiTest from "./pages/ApiTest";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/ui-showcase" element={<UIShowcase />} />
            <Route path="/api-test" element={<ApiTest />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/restaurant-selector" element={<RestaurantSelector />} />
            <Route path="/branch-selector" element={<BranchSelector />} />
            <Route path="/dashboard" element={<DashboardNew />} />
            <Route path="/dashboard-old" element={<Dashboard />} />
            
            {/* Branch Management */}
            <Route path="/branches" element={<Branches />} />
            <Route path="/branches/create" element={<CreateBranch />} />
            <Route path="/branches/:id" element={<BranchDetails />} />
            <Route path="/branches/:id/edit" element={<EditBranch />} />
            
            {/* Categories Management */}
            <Route path="/categories" element={<Categories />} />
            <Route path="/categories/create" element={<CreateCategory />} />
            <Route path="/categories/:id/edit" element={<EditCategory />} />
            
            {/* Menu Items Management */}
            <Route path="/menu-items" element={<MenuItems />} />
            <Route path="/menu-items/create" element={<CreateMenuItem />} />
            <Route path="/menu-items/:id/edit" element={<EditMenuItem />} />
            
            {/* Areas & Tables */}
            <Route path="/areas" element={<Areas />} />
            <Route path="/areas/:id/tables" element={<Tables />} />
            <Route path="/tables" element={<Tables />} />
            
            {/* Orders */}
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            
            {/* Kitchen */}
            <Route path="/kitchen" element={<KitchenDisplay />} />
            
            {/* Service Requests */}
            <Route path="/service-requests" element={<ServiceRequests />} />
            
            {/* QR Codes */}
            <Route path="/qr-codes" element={<QRCodes />} />
            
            {/* Staff */}
            <Route path="/staff" element={<Staff />} />
            
            {/* Reservations */}
            <Route path="/reservations" element={<Reservations />} />
            
            {/* Analytics */}
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/qr-analytics" element={<QRAnalytics />} />
            
            {/* Owner Dashboard */}
            <Route path="/owner" element={<OwnerDashboard />} />
            <Route path="/owner/overview" element={<OwnerDashboard />} />
            <Route path="/owner/restaurant" element={<Settings />} />
            <Route path="/owner/branding" element={<Settings />} />
            
            {/* Reviews */}
            <Route path="/reviews" element={<Reviews />} />
            
            {/* Settings */}
            <Route path="/settings" element={<Settings />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
