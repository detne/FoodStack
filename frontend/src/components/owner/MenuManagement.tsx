/**
 * Owner Menu Management Component
 * Full CRUD capabilities for menu items and categories
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Search,
  UtensilsCrossed,
  ChevronRight,
  TrendingUp,
  Package,
  AlertCircle,
  Settings
} from 'lucide-react';
import MenuItemCard from '@/components/menu/MenuItemCard';
import MenuItemDialog from '@/components/menu/MenuItemDialog';
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
  itemCount?: number;
}

interface ServicePlan {
  name: string;
  maxMenuItems: number;
  currentMenuItems: number;
}

export default function OwnerMenuManagement() {
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Dialog states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  // Service plan limits
  const [servicePlan, setServicePlan] = useState<ServicePlan>({
    name: 'Basic',
    maxMenuItems: 50,
    currentMenuItems: 0
  });

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
          setServicePlan(prev => ({ ...prev, currentMenuItems: data.data.length }));
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

  const handleAddItem = () => {
    if (servicePlan.currentMenuItems >= servicePlan.maxMenuItems) {
      toast({
        title: 'Limit Reached',
        description: `You have reached the maximum number of menu items (${servicePlan.maxMenuItems}) for your ${servicePlan.name} plan.`,
        variant: 'destructive',
      });
      return;
    }
    setSelectedItem(null);
    setIsAddDialogOpen(true);
  };

  const handleEditItem = (item: MenuItem) => {
    setSelectedItem(item);
    setIsEditDialogOpen(true);
  };

  const handleViewItem = (item: MenuItem) => {
    setSelectedItem(item);
    setIsViewDialogOpen(true);
  };

  const handleSaveItem = async (data: any) => {
    try {
      const token = localStorage.getItem('access_token');
      const isEdit = selectedItem !== null;
      const url = isEdit 
        ? `http://localhost:3000/api/v1/menu-items/${selectedItem.id}`
        : 'http://localhost:3000/api/v1/menu-items';
      
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Menu item ${isEdit ? 'updated' : 'created'} successfully`,
        });
        fetchMenuItems();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${selectedItem ? 'update' : 'create'} menu item`,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:3000/api/v1/menu-items/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Menu item deleted successfully',
        });
        fetchMenuItems();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete menu item',
        variant: 'destructive',
      });
    }
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
    bestSellers: menuItems.filter(item => item.is_best_seller).length,
    categories: categories.length
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
            Manage your restaurant's menu items and categories
          </p>
        </div>
        <Button className="gap-2" onClick={handleAddItem}>
          <Plus className="h-4 w-4" />
          Add Menu Item
        </Button>
      </div>

      {/* Service Plan Limit Warning */}
      {servicePlan.currentMenuItems >= servicePlan.maxMenuItems * 0.8 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-medium text-orange-800">
                  Approaching Menu Item Limit
                </p>
                <p className="text-sm text-orange-600">
                  You're using {servicePlan.currentMenuItems} of {servicePlan.maxMenuItems} menu items in your {servicePlan.name} plan.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
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
                <p className="text-2xl font-bold">{stats.availableItems}</p>
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
                <p className="text-2xl font-bold">{stats.bestSellers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Settings className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold">{stats.categories}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
                  <div className="w-1 h-8 bg-orange-600 rounded-full"></div>
                  <div>
                    <h2 className="text-2xl font-bold">{category.name}</h2>
                    <p className="text-muted-foreground text-sm">{category.items?.length || 0} items</p>
                  </div>
                </div>
                <Badge className="bg-teal-600 text-white px-3 py-1 rounded-full">
                  {category.items?.length || 0}
                </Badge>
              </div>

              {/* Menu Items Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.items?.map((item, itemIndex) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    userRole="owner"
                    onToggleAvailability={handleToggleAvailability}
                    onEdit={handleEditItem}
                    onDelete={handleDeleteItem}
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
                <p className="text-muted-foreground mb-6">
                  {searchQuery ? 'Try adjusting your search terms' : 'Create your first menu item to get started'}
                </p>
                <Button className="gap-2" onClick={handleAddItem}>
                  <Plus className="h-4 w-4" />
                  Add Menu Item
                </Button>
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
                Navigate through menu categories
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
                const itemCount = menuItems.filter(item => item.category_id === category.id).length;
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
                      <p className="text-xs opacity-80">{itemCount} items</p>
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <MenuItemDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSave={handleSaveItem}
        categories={categories}
        mode="create"
      />

      <MenuItemDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleSaveItem}
        item={selectedItem}
        categories={categories}
        mode="edit"
      />

      <MenuItemViewDialog
        isOpen={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
        item={selectedItem}
        category={categories.find(cat => cat.id === selectedItem?.category_id)}
        userRole="owner"
        onToggleAvailability={handleToggleAvailability}
        onEdit={handleEditItem}
      />
    </div>
  );
}