import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Table, ArrowLeft } from "lucide-react";

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
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);

  const handleSelectBranch = (branchId: string) => {
    setSelectedBranch(branchId);
    // Store selected branch in localStorage or context
    localStorage.setItem('selectedBranch', branchId);
    
    // Navigate to dashboard
    navigate('/dashboard');
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

          {/* Branch Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockBranches.map((branch) => (
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
                      <p className="text-sm text-gray-500">{branch.phone}</p>
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
                  
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <Table className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {branch.tables}
                        </div>
                        <div className="text-xs text-gray-500">Tables</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {branch.staff}
                        </div>
                        <div className="text-xs text-gray-500">Staff</div>
                      </div>
                    </div>
                  </div>

                  {/* Performance */}
                  <div className="pt-3 border-t border-gray-100 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Active Orders</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {branch.currentOrders}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Today's Revenue</span>
                      <span className="text-sm font-semibold text-green-600">
                        ${branch.revenue.toLocaleString()}
                      </span>
                    </div>
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

          {/* Quick Stats */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {mockBranches.reduce((sum, branch) => sum + branch.tables, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Tables</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {mockBranches.reduce((sum, branch) => sum + branch.currentOrders, 0)}
                </div>
                <div className="text-sm text-gray-600">Active Orders</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600">
                  ${mockBranches.reduce((sum, branch) => sum + branch.revenue, 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BranchSelector;