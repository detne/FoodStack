/**
 * Staff Menu Management Component
 * Simple interface focused on availability management
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  UtensilsCrossed,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw
} from 'lucide-react';
import MenuItemCard from '@/components/menu/MenuItemCard';
import MenuItemViewDialog from '@/components/menu/MenuItemViewDialog';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  available: boolean;
  category_id: string;
  is_best_seller?: boolean;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  sort_order: number;
}

export default function StaffMenuManagement() {
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Dialog states
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([fetchCategories(), fetchMenuItems()]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
    toast({
      title: 'Refreshed',
      description: 'Menu data has been updated',
    });
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch('http://localhost:3000/api/v1/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setCategories(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch('http://localhost:3000/api/v1/menu-items/search', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setMenuItems(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const handleToggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:3000/api/v1/menu-items/${id}/availability`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ available: !currentStatus }),
      });

      if (response.ok) {
        setMenuItems(menuItems.map(item => 
          item.id === id ? { ...item, available: !currentStatus } : item
        ));
        toast({
          title: 'Updated',
          description: `Item ${!currentStatus ? 'marked as available' : 'marked as unavailable'}`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update availability',
        variant: 'destructive',
      });
    }
  };

  const handleViewItem = (item: MenuItem) => {
    setSelectedItem(item);
    setIsViewDialogOpen(true);
  };

  // Filter menu items
  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group items by category
  const categorizedItems = categories.map(category => ({
    ...category,
    items: filteredMenuItems.filter(item => item.category_id === category.id),
  }));

  // Statistics
  const stats = {
    totalItems: menuItems.length,
    availableItems: menuItems.filter(item => item.available).length,
    unavailableItems: menuItems.filter(item => !item.available).length,
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
        <div className="grid gap-6">
          <div className="h-96 bg-muted rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Menu Status</h1>
          <p className="text-muted-foreground mt-1">
            Quick access to update item availability
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-green-100 text-green-800 px-4 py-2 text-sm font-medium">
            Staff View
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available Now</p>
                <p className="text-2xl font-bold text-green-600">{stats.availableItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unavailable</p>
                <p className="text-2xl font-bold text-red-600">{stats.unavailableItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <UtensilsCrossed className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{stats.totalItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-800">Quick Updates</p>
              <p className="text-sm text-blue-600">
                Toggle the switch on each item to mark it as available or unavailable. Changes are saved immediately.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search menu items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 max-w-md"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Menu Items */}
        <div className="lg:col-span-3 space-y-6">
          {categorizedItems.map((category, categoryIndex) => (
            <div key={category.id} className="animate-in slide-in-from-left" style={{ animationDelay: `${categoryIndex * 100}ms` }}>
              {/* Category Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 bg-green-600 rounded-full"></div>
                  <div>
                    <h2 className="text-2xl font-bold">{category.name}</h2>
                    <p className="text-muted-foreground text-sm">
                      {category.items?.filter(item => item.available).length || 0} of {category.items?.length || 0} available
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    className={`px-3 py-1 rounded-full text-xs ${
                      (category.items?.filter(item => item.available).length || 0) === (category.items?.length || 0)
                        ? 'bg-green-100 text-green-800'
                        : (category.items?.filter(item => item.available).length || 0) === 0
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {(category.items?.filter(item => item.available).length || 0) === (category.items?.length || 0)
                      ? 'All Available'
                      : (category.items?.filter(item => item.available).length || 0) === 0
                      ? 'All Unavailable'
                      : 'Partial'
                    }
                  </Badge>
                </div>
              </div>

              {/* Menu Items Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.items?.map((item, itemIndex) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    userRole="staff"
                    onToggleAvailability={handleToggleAvailability}
                    onView={handleViewItem}
                    className={`animate-in slide-in-from-bottom`}
                    style={{ animationDelay: `${(categoryIndex * 100) + (itemIndex * 50)}ms` }}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Empty State */}
          {filteredMenuItems.length === 0 && !isLoading && (
            <Card className="animate-in slide-in-from-bottom duration-500">
              <CardContent className="p-12 text-center">
                <UtensilsCrossed className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No menu items found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? 'Try adjusting your search terms' : 'No menu items available in this category'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Categories Sidebar */}
        <div className="space-y-4 animate-in slide-in-from-right duration-700">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Categories</CardTitle>
              <p className="text-sm text-muted-foreground">
                Filter by category
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* All Categories */}
              <div
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedCategory === 'all' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted'
                }`}
                onClick={() => setSelectedCategory('all')}
              >
                <div>
                  <p className="font-medium">All Items</p>
                  <p className="text-xs opacity-80">{stats.availableItems}/{stats.totalItems} available</p>
                </div>
                <ChevronRight className="h-4 w-4" />
              </div>

              {/* Category List */}
              {categories.map((category) => {
                const categoryItems = menuItems.filter(item => item.category_id === category.id);
                const availableCount = categoryItems.filter(item => item.available).length;
                const isSelected = selectedCategory === category.id;
                
                return (
                  <div
                    key={category.id}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <p className="text-xs opacity-80">{availableCount}/{categoryItems.length} available</p>
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh Menu
              </Button>
              
              <div className="text-xs text-muted-foreground pt-2 border-t">
                <p>Last updated: {new Date().toLocaleTimeString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* View Dialog */}
      <MenuItemViewDialog
        isOpen={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
        item={selectedItem}
        category={categories.find(cat => cat.id === selectedItem?.category_id)}
        userRole="staff"
        onToggleAvailability={handleToggleAvailability}
      />
    </div>
  );
}