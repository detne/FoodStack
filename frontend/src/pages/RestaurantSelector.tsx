import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Phone, Plus, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api-client";
import { toast } from "@/components/ui/use-toast";

interface Restaurant {
  id: string;
  name: string;
  email: string;
  address?: string;
  phone?: string;
  logo_url?: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

// Mock data - replace with real API calls
const mockRestaurants = [
  {
    id: "rest-001",
    name: "Downtown Plaza Restaurant",
    email: "owner@downtownplaza.com",
    address: "123 Main St, Downtown",
    phone: "0901234567",
    status: "ACTIVE",
    logo: null
  },
  {
    id: "rest-002", 
    name: "Uptown Gastro",
    email: "contact@uptowngastro.com",
    address: "456 Oak Ave, Uptown",
    phone: "0901234568",
    status: "ACTIVE",
    logo: null
  },
  {
    id: "rest-003",
    name: "Seaside Bistro",
    email: "hello@seasidebistro.com", 
    address: "789 Beach Rd, Coastal",
    phone: "0901234569",
    status: "ACTIVE",
    logo: null
  }
];

const RestaurantSelector = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchRestaurants();
    } else {
      navigate('/login');
    }
  }, [user, navigate]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      console.log('Fetching restaurants for user:', user?.id);
      
      // For now, if user has restaurant data, use it as single restaurant
      if (user?.restaurant) {
        setRestaurants([user.restaurant]);
      } else {
        // Try to fetch from API (if endpoint exists)
        try {
          const response = await apiClient.getUserRestaurants();
          if (response.success && response.data) {
            const restaurantsData = Array.isArray(response.data) ? response.data : [response.data];
            setRestaurants(restaurantsData);
          } else {
            setRestaurants([]);
          }
        } catch (error) {
          console.log('No getUserRestaurants endpoint, using user.restaurant');
          setRestaurants([]);
        }
      }
    } catch (error: any) {
      console.error('Error fetching restaurants:', error);
      toast({
        title: "Error",
        description: "Failed to load restaurants",
        variant: "destructive",
      });
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRestaurant = (restaurantId: string) => {
    setSelectedRestaurant(restaurantId);
    // Store selected restaurant in localStorage
    localStorage.setItem('selectedRestaurant', restaurantId);
    
    // Add a small delay for animation effect
    setTimeout(() => {
      navigate('/owner/overview');
    }, 300);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getStatusBadge = (restaurant: Restaurant) => {
    if (restaurant.email_verified) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200 animate-pulse">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-ping"></div>
          ACTIVE
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
          PENDING
        </Badge>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 animate-gradient-x">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-200">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-7-5z" />
              </svg>
            </div>
            <span className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              QRService
            </span>
          </div>
          
          <Button 
            variant="outline"
            className="hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-200"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-indigo-600 animate-spin-slow" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
                Select Restaurant
              </h1>
              <Sparkles className="w-6 h-6 text-purple-600 animate-spin-slow" />
            </div>
            <p className="text-gray-600 text-lg">
              Choose which restaurant you'd like to manage
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : restaurants.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No restaurants found</h3>
              <p className="text-gray-600 mb-6">
                Create your first restaurant to get started
              </p>
              <Button onClick={() => navigate('/onboarding')} className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Restaurant
              </Button>
            </div>
          ) : (
            <>
              {/* Restaurant Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {restaurants.map((restaurant, index) => (
                  <Card 
                    key={restaurant.id}
                    className={`cursor-pointer transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 ${
                      selectedRestaurant === restaurant.id 
                        ? 'ring-4 ring-indigo-500/50 shadow-2xl shadow-indigo-500/25 scale-105 -translate-y-2' 
                        : 'hover:shadow-2xl hover:shadow-gray-500/20'
                    } ${
                      hoveredCard === restaurant.id ? 'bg-gradient-to-br from-white to-indigo-50' : 'bg-white'
                    } animate-fade-in-up`}
                    style={{ animationDelay: `${index * 150}ms` }}
                    onClick={() => handleSelectRestaurant(restaurant.id)}
                    onMouseEnter={() => setHoveredCard(restaurant.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <CardHeader className="pb-3 relative overflow-hidden">
                      {/* Animated background gradient */}
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <div className="flex items-start justify-between relative z-10">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center shadow-lg transform transition-all duration-300 ${
                            hoveredCard === restaurant.id ? 'scale-110 rotate-3' : ''
                          }`}>
                            <Building2 className="w-6 h-6 text-indigo-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg font-bold text-gray-900 hover:text-indigo-600 transition-colors duration-200">
                              {restaurant.name}
                            </CardTitle>
                            <p className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200">
                              {restaurant.email}
                            </p>
                          </div>
                        </div>
                        <div className="transform hover:scale-110 transition-transform duration-200">
                          {getStatusBadge(restaurant)}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4 relative">
                      {restaurant.address && (
                        <div className="flex items-center gap-3 text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200 group">
                          <MapPin className="w-4 h-4 group-hover:text-indigo-600 transition-colors duration-200" />
                          <span>{restaurant.address}</span>
                        </div>
                      )}
                      
                      {restaurant.phone && (
                        <div className="flex items-center gap-3 text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200 group">
                          <Phone className="w-4 h-4 group-hover:text-green-600 transition-colors duration-200" />
                          <span>{restaurant.phone}</span>
                        </div>
                      )}

                      {/* Animated selection indicator */}
                      {selectedRestaurant === restaurant.id && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse"></div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Add New Restaurant */}
              <Card className="border-2 border-dashed border-gray-300 hover:border-indigo-400 transition-all duration-300 cursor-pointer group hover:shadow-xl hover:shadow-indigo-500/10 animate-fade-in-up" style={{ animationDelay: '450ms' }}>
                <CardContent className="flex flex-col items-center justify-center py-16 relative overflow-hidden">
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-indigo-100 rounded-full flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg relative z-10">
                    <Plus className="w-10 h-10 text-gray-400 group-hover:text-indigo-600 transition-colors duration-300" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors duration-300 relative z-10">
                    Add New Restaurant
                  </h3>
                  
                  <p className="text-gray-500 text-center mb-6 group-hover:text-gray-700 transition-colors duration-300 relative z-10">
                    Create a new restaurant to expand your business
                  </p>
                  
                  <Button 
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 relative z-10"
                    onClick={() => navigate('/onboarding')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default RestaurantSelector;