/**
 * Restaurant Information Page
 * Manage basic information for this restaurant
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import {
  Store,
  Mail,
  Phone,
  Globe,
  MapPin,
  Upload,
  Trash2,
  Save,
  AlertCircle,
  CheckCircle,
  Package,
} from 'lucide-react';

interface RestaurantData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  logoUrl?: string;
  publicUrl?: string;
  status: 'active' | 'inactive';
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SubscriptionData {
  plan: string;
  status: 'active' | 'inactive' | 'expired';
  expiresAt?: string;
  features: string[];
}

export default function RestaurantInformation() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    description: '',
    publicUrl: '',
  });

  // Fetch restaurant data
  useEffect(() => {
    fetchRestaurantData();
  }, []);

  const fetchRestaurantData = async () => {
    try {
      setLoading(true);
      
      // Check if token exists
      const token = apiClient.getToken();
      console.log('Token from apiClient:', token ? 'Found' : 'Not found');
      console.log('All localStorage keys:', Object.keys(localStorage));
      
      if (!token) {
        toast({
          title: 'Authentication Required',
          description: 'Please login to view restaurant information',
          variant: 'destructive',
        });
        return;
      }
      
      // Get user info from API using apiClient
      try {
        const userResponse = await fetch('http://localhost:3000/api/v1/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!userResponse.ok) {
          throw new Error(`Failed to get user info: ${userResponse.status} ${userResponse.statusText}`);
        }
        
        const userData = await userResponse.json();
        console.log('User data from API:', userData);
        
        if (!userData.success || !userData.data) {
          throw new Error('Invalid user data received');
        }
        
        const user = userData.data;
        
        // Get restaurant details using the new /me endpoint
        const restaurantsResponse = await fetch('http://localhost:3000/api/v1/restaurants/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!restaurantsResponse.ok) {
          throw new Error(`Failed to get restaurants: ${restaurantsResponse.status} ${restaurantsResponse.statusText}`);
        }
        
        const restaurantsData = await restaurantsResponse.json();
        console.log('Restaurants data from API:', restaurantsData);
      
        if (!restaurantsData.success || !restaurantsData.data || restaurantsData.data.length === 0) {
          // No restaurants found, create a basic structure for new restaurant
          const newRestaurantData = {
            id: 'new-restaurant',
            name: user.full_name ? `${user.full_name}'s Restaurant` : 'My Restaurant',
            email: user.email,
            phone: user.phone || '',
            address: '',
            description: '',
            publicUrl: '',
            status: 'active',
            emailVerified: user.email_verified || false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          setRestaurant(newRestaurantData);
          setFormData({
            name: newRestaurantData.name,
            email: newRestaurantData.email,
            phone: newRestaurantData.phone,
            address: newRestaurantData.address,
            description: newRestaurantData.description,
            publicUrl: newRestaurantData.publicUrl,
          });
        } else {
          // Use the first restaurant (for now, later can add restaurant selector)
          const restaurantData = restaurantsData.data[0];
          
          setRestaurant({
            id: restaurantData.id,
            name: restaurantData.name,
            email: restaurantData.email,
            phone: restaurantData.phone || '',
            address: restaurantData.address || '',
            description: restaurantData.description || '',
            publicUrl: restaurantData.publicUrl || '',
            logoUrl: restaurantData.logoUrl,
            status: restaurantData.status,
            emailVerified: restaurantData.emailVerified,
            createdAt: restaurantData.createdAt,
            updatedAt: restaurantData.updatedAt,
          });
          
          setFormData({
            name: restaurantData.name || '',
            email: restaurantData.email || '',
            phone: restaurantData.phone || '',
            address: restaurantData.address || '',
            description: restaurantData.description || '',
            publicUrl: restaurantData.publicUrl || '',
          });
        }
        
        // Set subscription data (you can implement real API call here)
        setSubscription({
          plan: 'Free',
          status: 'inactive',
          features: ['Basic features', 'Limited branches', 'Standard support'],
        });
        
      } catch (error) {
        console.error('Error fetching restaurant data:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to load restaurant information',
          variant: 'destructive',
        });
      }
      
    } catch (error) {
      console.error('Error in fetchRestaurantData:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load restaurant information',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!restaurant) {
      toast({
        title: 'Error',
        description: 'No restaurant data to save',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setSaving(true);
      
      const token = apiClient.getToken();
      if (!token) {
        toast({
          title: 'Authentication Required',
          description: 'Please login to save changes',
          variant: 'destructive',
        });
        return;
      }
      
      const response = await fetch(`http://localhost:3000/api/v1/restaurants/${restaurant.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        setRestaurant(result.data);
        toast({
          title: 'Success',
          description: 'Restaurant information updated successfully',
        });
      } else {
        throw new Error(result.message || 'Update failed');
      }
      
    } catch (error) {
      console.error('Error updating restaurant:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update restaurant information',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!restaurant) return;
    
    if (!confirm('Are you sure you want to delete this restaurant? This action cannot be undone.')) {
      return;
    }
    
    try {
      const token = apiClient.getToken();
      if (!token) {
        toast({
          title: 'Authentication Required',
          description: 'Please login to delete restaurant',
          variant: 'destructive',
        });
        return;
      }
      
      const response = await fetch(`http://localhost:3000/api/v1/restaurants/${restaurant.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      toast({
        title: 'Success',
        description: 'Restaurant deleted successfully',
      });
      
      // Redirect to dashboard or login
      window.location.href = '/';
      
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete restaurant',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
        <div className="grid gap-6">
          <div className="h-96 bg-muted rounded-lg animate-pulse"></div>
          <div className="h-64 bg-muted rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Restaurant Information</h1>
        <p className="text-muted-foreground mt-1">
          Manage basic information for this restaurant
        </p>
      </div>

      {/* Main Form */}
      <Card className="animate-in slide-in-from-bottom duration-500">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <Store className="h-4 w-4" />
                  Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="The Gourmet Kitchen"
                  className="transition-all duration-200 focus:ring-2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                  className="transition-all duration-200 focus:ring-2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Fine dining experience with international cuisine"
                  rows={4}
                  className="transition-all duration-200 focus:ring-2 resize-none"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@restaurant.com"
                  className="transition-all duration-200 focus:ring-2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="publicUrl" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Public URL
                </Label>
                <Input
                  id="publicUrl"
                  value={formData.publicUrl}
                  onChange={(e) => setFormData({ ...formData, publicUrl: e.target.value })}
                  placeholder="https://restaurant.com"
                  className="transition-all duration-200 focus:ring-2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Address
                </Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Main Street, City, State 12345"
                  rows={4}
                  className="transition-all duration-200 focus:ring-2 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t mt-6">
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="gap-2 hover:shadow-md transition-all duration-200"
            >
              <Trash2 className="h-4 w-4" />
              Delete Restaurant
            </Button>
            
            <Button
              onClick={handleSave}
              disabled={saving}
              className="gap-2 hover:shadow-md transition-all duration-200"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Updating...' : 'Update'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Subscription */}
      <Card className="animate-in slide-in-from-bottom duration-700">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            <CardTitle>Current Subscription</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            No active subscription
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No active subscription found for this restaurant.</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              Register a package to enable full features.
            </p>
            <Button className="gap-2 hover:shadow-md transition-all duration-200">
              <Package className="h-4 w-4" />
              Register Package
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}