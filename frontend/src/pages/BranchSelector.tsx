import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Table, ArrowLeft, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api-client";
import { toast } from "@/components/ui/use-toast";

interface Branch {
  id: string;
  name: string;
  address: string;
  phone?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Mock data - replace with real API calls
const mockBranches = [
  {
    id: "branch-001",
    name: "Main Branch",
    address: "123 Main St, Downtown",
    phone: "0901234567",
    tables: 20,
    staff: 8,
    status: "AVAILABLE",
    currentOrders: 5,
    revenue: 2540.00
  },
  {
    id: "branch-002", 
    name: "Uptown Location",
    address: "456 Oak Ave, Uptown District",
    phone: "0901234568",
    tables: 15,
    staff: 6,
    status: "BUSY",
    currentOrders: 12,
    revenue: 1890.50
  },
  {
    id: "branch-003",
    name: "Airport Terminal",
    address: "Terminal 2, International Airport",
    phone: "0901234569",
    tables: 25,
    staff: 10,
    status: "AVAILABLE",
    currentOrders: 3,
    revenue: 980.25
  }
];

const BranchSelector = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);

  useEffect(() => {
    if (user?.restaurant?.id) {
      fetchBranches();
    } else {
      navigate('/login');
    }
  }, [user, navigate]);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      console.log('BranchSelector - Fetching branches for restaurant:', user?.restaurant?.id);
      
      const response = await apiClient.getBranches(user?.restaurant?.id);
      console.log('BranchSelector - Branches response:', response);
      
      if (response.success && response.data) {
        // Handle both formats: direct array or {items: [...], pagination: {...}}
        let branchesData = [];
        if (Array.isArray(response.data)) {
          branchesData = response.data;
        } else if (response.data.items && Array.isArray(response.data.items)) {
          branchesData = response.data.items;
        }
        
        console.log('BranchSelector - Setting branches:', branchesData);
        setBranches(branchesData);
      } else {
        console.error('BranchSelector - Failed to fetch branches:', response.message);
        setBranches([]);
      }
    } catch (error: any) {
      console.error('BranchSelector - Error fetching branches:', error);
      toast({
        title: "Error",
        description: "Failed to load branches",
        variant: "destructive",
      });
      setBranches([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBranch = (branchId: string) => {
    setSelectedBranch(branchId);
    // Store selected branch in localStorage
    localStorage.setItem('selectedBranch', branchId);
    
    // Navigate to owner dashboard
    navigate('/owner/overview');
  };

  const handleCreateBranch = () => {
    navigate('/owner/branch-setup');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800';
      case 'BUSY':
        return 'bg-orange-100 text-orange-800';
      case 'CLOSED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/restaurant-selector')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Restaurants
            </Button>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-7-5z" />
                </svg>
              </div>
              <span className="text-xl font-semibold text-gray-900">QRService</span>
            </div>
          </div>
          
          <Button 
            variant="outline"
            onClick={() => navigate('/login')}
          >
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Select Branch
            </h1>
            <p className="text-gray-600">
              Choose which branch you'd like to manage today
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : branches.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Table className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No branches yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first branch to start managing your restaurant
              </p>
              <Button onClick={handleCreateBranch} className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                Create First Branch
              </Button>
            </div>
          ) : (
            <>
              {/* Branch Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {branches.map((branch) => (
                  <Card 
                    key={branch.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedBranch === branch.id 
                        ? 'ring-2 ring-indigo-500 shadow-lg' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => handleSelectBranch(branch.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{branch.name}</CardTitle>
                          <p className="text-sm text-gray-500">{branch.phone || 'No phone'}</p>
                        </div>
                        <Badge 
                          variant="secondary"
                          className={getStatusColor(branch.status)}
                        >
                          {branch.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{branch.address}</span>
                      </div>
                      
                      {/* Action Button */}
                      <Button 
                        className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectBranch(branch.id);
                        }}
                      >
                        Manage Branch
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Add Branch Button */}
              <div className="mt-8 text-center">
                <Button 
                  variant="outline" 
                  onClick={handleCreateBranch}
                  className="border-dashed border-2"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Branch
                </Button>
              </div>
            </>
          )}

          {/* Remove Quick Stats section since we don't have that data */}
        </div>
      </main>
    </div>
  );
};

export default BranchSelector;