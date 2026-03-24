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
import OwnerMenuManagement from "./pages/OwnerMenuManagement";
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
import ManagerDashboard from "./pages/ManagerDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import QRAnalytics from "./pages/QRAnalytics";
import ApiTest from "./pages/ApiTest";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import RestaurantInformation from "./pages/RestaurantInformation";
import Branding from "./pages/Branding";
import BranchSetup from "./pages/BranchSetup";
import BranchEdit from "./pages/BranchEdit";
import CustomerLanding from "./pages/CustomerLanding";
import BranchLanding from "./pages/BranchLanding";
import RestaurantPreview from "./pages/RestaurantPreview";
import CustomerPreview from "./pages/CustomerPreview";
import CustomerMenu from "./pages/CustomerMenu";
import CustomerOrder from "./pages/CustomerOrder";
import CustomerOrderStatus from "./pages/CustomerOrderStatus";
import CustomerBill from "./pages/CustomerBill";
import CustomerMyOrderSimple from "./pages/CustomerMyOrderSimple";
import CustomerPaymentSimple from "./pages/CustomerPaymentSimple";
import CustomerPaymentSuccess from "./pages/CustomerPaymentSuccess";
import PaymentSuccess from "./pages/PaymentSuccess";

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
            
            {/* Public Landing Pages */}
            <Route path="/branch/:slug" element={<BranchLanding />} />
            <Route path="/g/:slug" element={<BranchLanding />} />
            <Route path="/restaurant/:restaurantId/preview" element={<RestaurantPreview />} />
            <Route path="/restaurant/:restaurantId/customer-preview" element={<CustomerPreview />} />
            {/* Remove old dashboard routes - now handled within Owner Portal */}
            
            {/* Branch Management */}
            <Route path="/branches" element={<Branches />} />
            <Route path="/branches/create" element={<CreateBranch />} />
            <Route path="/branches/:id" element={<BranchDetails />} />
            <Route path="/branches/:id/edit" element={<EditBranch />} />
            
            {/* Categories Management */}
            <Route path="/categories" element={<Categories />} />
            <Route path="/categories/create" element={<CreateCategory />} />
            <Route path="/categories/:id/edit" element={<EditCategory />} />
            
            {/* Menu Items Management - Keep for backward compatibility */}
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
            
            {/* Reservations */}
            <Route path="/reservations" element={<Reservations />} />
            
            {/* QR Analytics - Standalone (keep for backward compatibility) */}
            <Route path="/qr-analytics" element={<QRAnalytics />} />
            
            {/* Owner Dashboard */}
            <Route path="/owner" element={<OwnerDashboard />} />
            <Route path="/owner/overview" element={<OwnerDashboard />} />
            <Route path="/owner/restaurant" element={<OwnerDashboard />} />
            <Route path="/owner/menu" element={<OwnerDashboard />} />
            <Route path="/owner/categories" element={<OwnerDashboard />} />
            <Route path="/owner/tables" element={<OwnerDashboard />} />
            <Route path="/owner/staff" element={<OwnerDashboard />} />
            <Route path="/owner/branding" element={<OwnerDashboard />} />
            <Route path="/owner/analytics" element={<OwnerDashboard />} />
            <Route path="/owner/manager" element={<OwnerDashboard />} />
            <Route path="/owner/branch-setup" element={<BranchSetup />} />
            <Route path="/owner/branch-edit/:branchId" element={<BranchEdit />} />
            
            {/* Manager Dashboard */}
            <Route path="/manager" element={<ManagerDashboard />} />
            <Route path="/manager/overview" element={<ManagerDashboard />} />
            <Route path="/manager/branch-info" element={<ManagerDashboard />} />
            <Route path="/manager/tables" element={<ManagerDashboard />} />
            <Route path="/manager/reservations" element={<ManagerDashboard />} />
            <Route path="/manager/menu" element={<ManagerDashboard />} />
            <Route path="/manager/bills" element={<ManagerDashboard />} />
            <Route path="/manager/staff" element={<ManagerDashboard />} />
            <Route path="/manager/promotions" element={<ManagerDashboard />} />
            
            {/* Staff Dashboard */}
            <Route path="/staff" element={<StaffDashboard />} />
            <Route path="/staff/overview" element={<StaffDashboard />} />
            <Route path="/staff/reservations" element={<StaffDashboard />} />
            <Route path="/staff/tables" element={<StaffDashboard />} />
            <Route path="/staff/orders" element={<StaffDashboard />} />
            
            {/* Reviews */}
            <Route path="/reviews" element={<Reviews />} />
            
            {/* Settings */}
            <Route path="/settings" element={<Settings />} />
            
            {/* Customer QR Routes */}
            <Route path="/t/:qr_token" element={<CustomerLanding />} />
            <Route path="/customer/menu" element={<CustomerMenu />} />
            <Route path="/customer/order" element={<CustomerOrder />} />
            <Route path="/customer/my-order" element={<CustomerMyOrderSimple />} />
            <Route path="/customer/bill" element={<CustomerBill />} />
            <Route path="/customer/payment" element={<CustomerPaymentSimple />} />
            <Route path="/customer/payment-success" element={<CustomerPaymentSuccess />} />
            <Route path="/customer/order-status" element={<CustomerOrderStatus />} />
            
            {/* Payment Routes */}
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/cancel" element={<PaymentSuccess />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
