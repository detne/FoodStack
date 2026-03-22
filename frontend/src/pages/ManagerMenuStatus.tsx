/**
 * Manager Menu Status Management
 * Manager can only toggle availability status for their branch
 */

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Loader2, AlertCircle, Sparkles, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { apiClient } from '@/lib/api-client';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  available: boolean;
  category_id: string;
  category_name?: string;
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

export default function ManagerMenuStatus() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [branchName, setBranchName] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [currentBranchId, setCurrentBranchId] = useState<string>(''); // Branch ID to use for toggle

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast({
          title: "Error",
          description: "Please login to manage menu",
          variant: "destructive",
        });
        return;
      }

      // Get user data
      const userData = localStorage.getItem('user');
      if (!userData) {
        toast({
          title: "Error",
          description: "User data not found",
          variant: "destructive",
        });
        return;
      }

      const user = JSON.parse(userData);
      
      // Check if viewing as owner (no branch selected)
      const isOwnerView = localStorage.getItem('owner_viewing_branch') === 'true';
      
      // Get branch_id: either from user or fetch first branch
      let branchId = user.branch_id;
      
      // If Owner View and no branch, get first branch automatically
      if (!branchId && user.restaurant?.id) {
        const branches = await fetchBranches(user.restaurant.id);
        if (branches.length > 0) {
          branchId = branches[0].id;
          setBranchName(branches[0].name);
        }
      }
      
      // Store current branch ID for toggle operations
      setCurrentBranchId(branchId || '');
      
      // Debug info
      setDebugInfo(`Role: ${user.role}, Branch ID: ${branchId || 'None'}, Owner View: ${isOwnerView}`);
      
      // Get branch info if available
      if (branchId) {
        try {
          const branchResponse = await apiClient.getBranch(branchId);
          if (branchResponse.success && branchResponse.data) {
            setBranchName(branchResponse.data.name);
          }
        } catch (error) {
          console.error('Error fetching branch:', error);
        }
      }

      // Fetch data in parallel
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

  const fetchBranches = async (restaurantId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return [];

      const response = await fetch(`http://localhost:3000/api/v1/branches?restaurantId=${restaurantId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const branchesData = await response.json();
        let branches = [];
        if (branchesData.success && branchesData.data) {
          if (Array.isArray(branchesData.data)) {
            branches = branchesData.data;
          } else if (branchesData.data.items && Array.isArray(branchesData.data.items)) {
            branches = branchesData.data.items;
          }
        }
        return branches;
      }
      return [];
    } catch (error) {
      console.error('Error fetching branches:', error);
      return [];
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const userData = localStorage.getItem('user');
      if (!userData) return;

      const user = JSON.parse(userData);
      let branchId = user.branch_id || currentBranchId;

      // If no branch_id, try to get first branch
      if (!branchId && user.restaurant?.id) {
        const branches = await fetchBranches(user.restaurant.id);
        if (branches.length > 0) {
          branchId = branches[0].id;
        }
      }
      
      if (!branchId) return;
      
      const response = await fetch(`http://localhost:3000/api/v1/categories?branch_id=${branchId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) return;

      const data = await response.json();
      
      if (data.success && data.data) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      // Fetch ALL menu items (Manager can see all items, but can only toggle for their branch)
      const response = await fetch('http://localhost:3000/api/v1/menu-items/search', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Menu items response:', data);
      
      if (data.success && data.data) {
        setMenuItems(data.data);
      } else {
        console.log('No menu items in response');
        setMenuItems([]);
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const handleToggleAvailability = async (item: MenuItem, newStatus: boolean) => {
    // Use currentBranchId (already set in fetchData)
    if (!currentBranchId) {
      toast({
        title: "No Branch Available",
        description: "Unable to determine branch. Please try again.",
        variant: "destructive",
      });
      return;
    }

    // Update directly without dialog
    await updateAvailability(item.id, newStatus, '');
  };

  const updateAvailability = async (itemId: string, available: boolean, reason: string) => {
    try {
      setUpdatingItemId(itemId);
      
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:3000/api/v1/menu-items/${itemId}/branch-availability`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          available, 
          reason,
          branchId: currentBranchId // Send branchId from state
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        setMenuItems(prevItems =>
          prevItems.map(item =>
            item.id === itemId ? { ...item, available } : item
          )
        );

        toast({
          title: 'Success',
          description: available 
            ? 'Item is now available in your branch'
            : 'Item is now unavailable in your branch',
        });
      } else {
        throw new Error(data.message || 'Failed to update availability');
      }
    } catch (error: any) {
      console.error('Error updating availability:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update availability',
        variant: 'destructive',
      });
    } finally {
      setUpdatingItemId(null);
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
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Menu Status Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage item availability for {branchName || 'your branch'}
          </p>
        </div>
        <Badge variant="outline" className="text-sm px-4 py-2">
          Manager View
        </Badge>
      </div>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm flex-1">
            <p className="font-medium text-blue-900 dark:text-blue-100">Manager Permissions</p>
            <p className="text-blue-700 dark:text-blue-300 mt-1">
              You can view all menu items and toggle availability for your branch only. 
              Changes will only affect customers ordering from your branch.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1">
          <div className="space-y-16 max-w-7xl">
            {groupedItems.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed rounded-2xl bg-muted/30">
                <div className="flex flex-col items-center gap-4">
                  <Sparkles className="h-12 w-12 text-muted-foreground" />
                  <div>
                    <p className="font-semibold text-lg mb-2">No Menu Items Found</p>
                    <p className="text-muted-foreground text-sm">
                      There are no menu items in the system yet. Please contact the restaurant owner to add menu items.
                    </p>
                  </div>
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
                          "hover:shadow-xl hover:shadow-primary/10 transition-all duration-500",
                          "hover:-translate-y-2 hover:border-primary/30",
                          "flex flex-col h-full min-h-[400px]"
                        )}
                        style={{ animationDelay: `${categoryIdx * 50 + itemIdx * 30}ms` }}
                      >
                        {/* Image Container */}
                        <div className="relative aspect-video bg-muted overflow-hidden">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/80">
                              <Sparkles className="h-12 w-12 text-muted-foreground/30" />
                            </div>
                          )}

                          {/* Status Badge */}
                          <div className="absolute top-3 left-3 z-10">
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
                        </div>

                        {/* Content */}
                        <CardContent className="p-5 flex flex-col h-full min-h-0">
                          {/* Title & Description */}
                          <div className="flex-1 min-h-0 mb-4">
                            <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                              {item.name}
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                              {item.description || 'No description available'}
                            </p>
                          </div>

                          {/* Price */}
                          <div className="mb-4">
                            <p className="text-2xl font-bold text-orange-600">
                              ${Number(item.price).toFixed(2)}
                            </p>
                          </div>

                          {/* Divider */}
                          <div className="h-px bg-border/30 mb-4"></div>

                          {/* Toggle Switch */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">
                              Status for your branch
                            </span>
                            <Switch
                              checked={item.available}
                              onCheckedChange={(checked) => handleToggleAvailability(item, checked)}
                              disabled={updatingItemId === item.id}
                              className="data-[state=checked]:bg-green-600"
                            />
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
        <div className="w-80 space-y-4">
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
                      onClick={() => scrollToCategory(cat.id)}
                      className={cn(
                        "w-full text-left px-4 py-3 rounded-lg transition-all duration-300",
                        "flex items-center justify-between cursor-pointer group",
                        "border border-transparent",
                        isActive
                          ? 'bg-orange-600 text-white shadow-lg scale-105 border-orange-500'
                          : 'hover:bg-muted/50 hover:border-border hover:shadow-md hover:translate-x-1'
                      )}
                    >
                      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                        <span className={cn(
                          'font-semibold text-sm truncate',
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
    </div>
  );
}
