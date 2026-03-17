/**
 * Manager Menu Management Component
 * Can only manage availability status and view details
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  UtensilsCrossed,
  ChevronRight,
  TrendingUp,
  Package,
  Eye,
  BarChart3
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

export default function ManagerMenuManagement() {
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
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
          title: 'Success',
          description: 'Availability updated successfully',
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
    bestSellers: menuItems.filter(item => item.is_best_seller).length
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
          <h1 className="text-3xl font-bold tracking-tight">Menu Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage menu item availability and view details
          </p>
        </div>
        <Badge className="bg-blue-100 text-blue-800 px-4 py-2 text-sm font-medium">
          Manager View
        </Badge>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{stats.totalItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <UtensilsCrossed className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold text-green-600">{stats.availableItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Eye className="h-5 w-5 text-red-600" />
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
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Best Sellers</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.bestSellers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Info */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-800">Manager Permissions</p>
              <p className="text-sm text-blue-600">
                You can toggle item availability and view details. Contact the owner to add, edit, or delete items.
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
                  <div className="w-1 h-8 bg-blue-600 rounded-full"></div>
                  <div>
                    <h2 className="text-2xl font-bold">{category.name}</h2>
                    <p className="text-muted-foreground text-sm">
                      {category.items?.length || 0} items • {category.items?.filter(item => item.available).length || 0} available
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs">
                    {category.items?.filter(item => item.available).length || 0} Available
                  </Badge>
                  <Badge className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs">
                    {category.items?.filter(item => !item.available).length || 0} Unavailable
                  </Badge>
                </div>
              </div>

              {/* Menu Items Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.items?.map((item, itemIndex) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    userRole="manager"
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
                Browse menu by category
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
                  <p className="text-xs opacity-80">{menuItems.length} items</p>
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

          {/* Quick Stats by Category */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Availability Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {categories.slice(0, 5).map((category, index) => {
                const categoryItems = menuItems.filter(item => item.category_id === category.id);
                const availableCount = categoryItems.filter(item => item.available).length;
                const availabilityRate = categoryItems.length > 0 ? (availableCount / categoryItems.length) * 100 : 0;
                const colors = ['green', 'blue', 'purple', 'orange', 'cyan'];
                const color = colors[index % colors.length];
                
                return (
                  <div key={category.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{category.name}</span>
                      <span className="text-muted-foreground">{availableCount}/{categoryItems.length}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`bg-${color}-500 h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${availabilityRate}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
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
        userRole="manager"
        onToggleAvailability={handleToggleAvailability}
      />
    </div>
  );
}