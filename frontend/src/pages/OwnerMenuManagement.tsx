/**
 * Owner Menu Management
 * Manage menu items and categories with backend integration
 */

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Edit, Trash2, ChevronRight, Sparkles, Loader2, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { apiClient } from '@/lib/api-client';
import AddMenuItemDialog from '@/components/AddMenuItemDialog';
import EditMenuItemDialog from '@/components/EditMenuItemDialog';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  available: boolean;
  category_id: string;
  bestSeller?: boolean;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface GroupedCategory extends Category {
  items: MenuItem[];
}

export default function OwnerMenuManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [uploadingItemId, setUploadingItemId] = useState<string | null>(null);

  // Fetch data from backend
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Check if user is logged in
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.log('No token found, redirecting to login');
        toast({
          title: "Error",
          description: "Please login to manage menu",
          variant: "destructive",
        });
        return;
      }

      // Fetch real data from backend
      await Promise.all([fetchCategories(), fetchMenuItems()]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load menu data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.log('No access token found');
        return;
      }

      console.log('Fetching categories with token');
      
      // Get user data to find branch_id
      const userData = localStorage.getItem('user');
      let branchId = null;
      
      if (userData) {
        try {
          const user = JSON.parse(userData);
          if (user?.restaurant?.id) {
            // Fetch branches for this restaurant
            const branchesResponse = await fetch(`http://localhost:3000/api/v1/branches?restaurantId=${user.restaurant.id}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
            
            if (branchesResponse.ok) {
              const branchesData = await branchesResponse.json();
              console.log('Branches data from API:', branchesData);
              
              // Handle both response formats
              let branches = [];
              if (branchesData.success && branchesData.data) {
                if (Array.isArray(branchesData.data)) {
                  branches = branchesData.data;
                } else if (branchesData.data.items && Array.isArray(branchesData.data.items)) {
                  branches = branchesData.data.items;
                }
              }
              
              if (branches.length > 0) {
                branchId = branches[0].id;
                console.log('Using first branch:', branchId);
              }
            }
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
      
      if (!branchId) {
        console.log('No branch_id found');
        return;
      }
      
      const response = await fetch(`http://localhost:3000/api/v1/categories?branch_id=${branchId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Categories response status:', response.status);

      if (response.status === 401) {
        console.log('Token expired or invalid, clearing token');
        localStorage.removeItem('access_token');
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Categories data:', data);
      console.log('Categories array:', data.data);
      console.log('Categories length:', data.data?.length);
      
      if (data.success && data.data) {
        console.log('Setting categories:', data.data.length);
        setCategories(data.data);
      } else {
        console.log('No categories data in response');
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: 'Error',
        description: 'Failed to load categories',
        variant: 'destructive',
      });
    }
  };

  const fetchMenuItems = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.log('No access token found');
        return;
      }

      console.log('Fetching menu items');

      const response = await fetch('http://localhost:3000/api/v1/menu-items/search?limit=50', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Menu items response status:', response.status);

      if (response.status === 401) {
        console.log('Token expired or invalid for menu items');
        localStorage.removeItem('access_token');
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Menu items data:', data);
      console.log('Menu items count:', data.data?.length || 0);
      
      if (data.success && data.data) {
        setMenuItems(data.data);
        console.log('Set menu items:', data.data.length);
      } else {
        console.log('No menu items data in response');
        setMenuItems([]);
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast({
        title: 'Error',
        description: 'Failed to load menu items',
        variant: 'destructive',
      });
    }
  };

  const handleToggleAvailability = async (itemId: string, currentStatus: boolean) => {
    try {
      const response = await apiClient.updateMenuItemAvailability(itemId, !currentStatus);

      if (response.success) {
        // Update local state
        setMenuItems(prevItems =>
          prevItems.map(item =>
            item.id === itemId ? { ...item, available: !currentStatus } : item
          )
        );

        toast({
          title: 'Success',
          description: 'Availability updated successfully',
        });
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      toast({
        title: 'Error',
        description: 'Failed to update availability',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    try {
      const response = await apiClient.deleteMenuItem(itemId);

      if (response.success) {
        // Remove from local state
        setMenuItems(prevItems => prevItems.filter(item => item.id !== itemId));

        toast({
          title: 'Success',
          description: 'Menu item deleted successfully',
        });
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete menu item',
        variant: 'destructive',
      });
    }
  };

  const handleUploadImage = async (itemId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select a valid image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploadingItemId(itemId);
      const response = await apiClient.uploadMenuItemImage(itemId, file);

      if (response.success) {
        // Update local state with new image URL
        setMenuItems(prevItems =>
          prevItems.map(item =>
            item.id === itemId ? { ...item, image_url: response.data?.imageUrl } : item
          )
        );

        toast({
          title: 'Success',
          description: 'Image uploaded successfully',
        });
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setUploadingItemId(null);
    }
  };

  const groupedItems: GroupedCategory[] = categories.map(cat => ({
    ...cat,
    items: menuItems.filter(item => item.category_id === cat.id),
  }));

  const scrollToCategory = (categoryId: string) => {
    setActiveCategory(categoryId);
    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setTimeout(() => setActiveCategory(''), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] w-full">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Menu Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your restaurant's menu items and categories
          </p>
        </div>
        <Button className="bg-orange-600 hover:bg-orange-700 gap-2 shadow-lg hover:shadow-xl transition-all duration-300" onClick={() => setShowAddDialog(true)}>
          <Plus className="h-5 w-5" />
          Add Menu Item
        </Button>
      </div>

      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1">
          <div className="space-y-16 max-w-7xl">
            {groupedItems.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed rounded-2xl bg-muted/30 animate-in fade-in duration-500">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold text-lg text-foreground">No menu items yet</p>
                    <p className="text-muted-foreground text-sm max-w-sm">
                      Get started by adding your first menu item to showcase your delicious offerings
                    </p>
                  </div>
                  <Button className="mt-4 bg-orange-600 hover:bg-orange-700" onClick={() => setShowAddDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Item
                  </Button>
                </div>
              </div>
            ) : (
              groupedItems.map((category, categoryIdx) => (
              <section
                key={category.id}
                id={`category-${category.id}`}
                className="scroll-mt-24 animate-in fade-in duration-500"
                style={{ animationDelay: `${categoryIdx * 50}ms` }}
              >
                {/* Category Header */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/50">
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-10 bg-gradient-to-b from-orange-600 to-orange-400 rounded-full"></div>
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight">{category.name}</h2>
                      <p className="text-xs text-muted-foreground mt-1">
                        {category.items?.length || 0} items in this category
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="text-sm font-semibold px-3 py-1 bg-teal-500/20 text-teal-600 dark:text-teal-400"
                  >
                    {category.items?.length || 0}
                  </Badge>
                </div>

                {/* Menu Items Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {category.items?.map((item, itemIdx) => (
                    <Card
                      key={item.id}
                      className={cn(
                        "group relative overflow-hidden border border-border/40 bg-card",
                        "hover:shadow-xl hover:shadow-primary/10 transition-all duration-500 ease-out",
                        "hover:-translate-y-2 hover:border-primary/30",
                        "animate-in fade-in slide-in-from-bottom-4 duration-500",
                        "flex flex-col h-full min-h-[400px]" // Fixed minimum height
                      )}
                      style={{ animationDelay: `${categoryIdx * 50 + itemIdx * 30}ms` }}
                    >
                      {/* Image Container */}
                      <div className="relative aspect-square bg-muted overflow-hidden">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/80">
                            <Sparkles className="h-12 w-12 text-muted-foreground/30" />
                          </div>
                        )}

                        {/* Status Badge */}
                        <div className="absolute top-3 left-3 z-10 animate-in fade-in duration-300">
                          <Badge
                            className={cn(
                              "text-xs font-semibold px-2.5 py-1 backdrop-blur-sm",
                              item.available
                                ? 'bg-green-500/90 text-white'
                                : 'bg-gray-500/90 text-white'
                            )}
                          >
                            {item.available ? 'Available' : 'Unavailable'}
                          </Badge>
                        </div>

                        {/* Best Seller Badge */}
                        {item.bestSeller && (
                          <div className="absolute top-3 right-3 z-10 animate-in fade-in duration-300">
                            <Badge className="bg-yellow-500/90 text-white text-xs font-semibold px-2.5 py-1 flex items-center gap-1">
                              <Sparkles className="h-3 w-3" />
                              Best Seller
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <CardContent className="p-5 flex flex-col h-full min-h-0">
                        {/* Title & Description - Fixed height container */}
                        <div className="flex-1 min-h-0 mb-4">
                          <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-orange-600 transition-colors duration-300 line-clamp-2 break-words overflow-hidden">
                            {item.name}
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 break-words overflow-hidden">
                            {item.description || 'No description available'}
                          </p>
                        </div>

                        {/* Price - Fixed height, no wrap */}
                        <div className="mb-4">
                          <p className="text-2xl font-bold text-orange-600 whitespace-nowrap overflow-hidden text-ellipsis">
                            ${Number(item.price).toFixed(2)}
                          </p>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-border/30 mb-4 flex-shrink-0"></div>

                        {/* Action Buttons - Fixed height */}
                        <div className="flex items-center justify-end gap-1 flex-shrink-0">
                          <div className="relative">
                            <Button
                              size="icon"
                              variant="ghost"
                              disabled={uploadingItemId === item.id}
                              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-300 rounded-lg flex-shrink-0"
                              onClick={() => document.getElementById(`upload-${item.id}`)?.click()}
                            >
                              {uploadingItemId === item.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Upload className="h-4 w-4" />
                              )}
                            </Button>
                            <input
                              id={`upload-${item.id}`}
                              type="file"
                              accept="image/jpeg,image/png,image/jpg"
                              onChange={(e) => handleUploadImage(item.id, e)}
                              className="hidden"
                              disabled={uploadingItemId === item.id}
                            />
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleToggleAvailability(item.id, item.available)}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-300 rounded-lg flex-shrink-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setEditingItem(item);
                              setShowEditDialog(true);
                            }}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-300 rounded-lg flex-shrink-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeleteItem(item.id)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-300 rounded-lg flex-shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            ))
            )}
          </div>
        </div>

        {/* Sidebar - Categories */}
        <div className="w-80 space-y-4 sticky top-6 self-start">
          <Card>
            <CardContent className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-bold tracking-tight">Categories</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Navigate through menu categories
                </p>
              </div>

              <div className="space-y-2">
                {categories.map((cat, idx) => {
                  const itemCount = menuItems.filter(item => item.category_id === cat.id).length;
                  const isActive = activeCategory === cat.id;

                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        scrollToCategory(cat.id);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-3 rounded-lg transition-all duration-300 ease-out",
                        "flex items-center justify-between cursor-pointer group",
                        "border border-transparent",
                        isActive
                          ? 'bg-orange-600 text-white shadow-lg scale-105 border-orange-500'
                          : 'hover:bg-muted/50 hover:border-border hover:shadow-md hover:translate-x-1'
                      )}
                      style={{
                        animationDelay: `${idx * 30}ms`,
                      }}
                    >
                      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                        <span className={cn(
                          'font-semibold text-sm truncate transition-colors',
                          isActive ? 'text-white' : 'text-foreground'
                        )}>
                          {cat.name}
                        </span>
                        <span className={cn(
                          'text-xs font-medium',
                          isActive ? 'text-white/80' : 'text-muted-foreground'
                        )}>
                          {itemCount} {itemCount === 1 ? 'item' : 'items'}
                        </span>
                      </div>
                      <ChevronRight
                        className={cn(
                          'h-4 w-4 flex-shrink-0 transition-all duration-300',
                          isActive
                            ? 'text-white translate-x-1'
                            : 'text-muted-foreground group-hover:text-foreground group-hover:translate-x-1'
                        )}
                      />
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Menu Item Dialog */}
      <AddMenuItemDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSuccess={async () => {
          // Fetch only the new items instead of reloading everything
          await fetchMenuItems();
        }}
        categories={categories}
      />

      {/* Edit Menu Item Dialog */}
      <EditMenuItemDialog
        isOpen={showEditDialog}
        onClose={() => {
          setShowEditDialog(false);
          setEditingItem(null);
        }}
        onSuccess={(updatedItem) => {
          // Update the edited item in state with data from API response
          console.log('Updated item from API:', updatedItem);
          if (updatedItem) {
            // Map API response fields to MenuItem interface
            const mappedItem: MenuItem = {
              id: updatedItem.menuItemId || updatedItem.id,
              name: updatedItem.name,
              description: updatedItem.description,
              price: updatedItem.price,
              image_url: updatedItem.imageUrl || updatedItem.image_url,
              available: updatedItem.available,
              category_id: updatedItem.categoryId || updatedItem.category_id,
              bestSeller: updatedItem.bestSeller,
              created_at: updatedItem.created_at || '',
              updated_at: updatedItem.updatedAt || updatedItem.updated_at || new Date().toISOString(),
            };
            
            console.log('Mapped item:', mappedItem);
            
            setMenuItems(prevItems => {
              const newItems = prevItems.map(item =>
                item.id === mappedItem.id ? mappedItem : item
              );
              console.log('Updated menu items:', newItems);
              return newItems;
            });
          }
        }}
        categories={categories}
        item={editingItem}
      />
    </div>
  );
}