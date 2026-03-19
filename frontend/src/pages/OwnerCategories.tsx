/**
 * Owner Categories Management
 * Manage menu categories and customizations
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  FolderTree,
  Settings,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Sliders,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
  description?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  _count?: {
    menu_items: number;
  };
}

interface Customization {
  id: string;
  name: string;
  description?: string;
  min_select: number;
  max_select: number;
  is_required: boolean;
  options: CustomizationOption[];
}

interface CustomizationOption {
  id: string;
  name: string;
  price_delta: number;
  sort_order: number;
  is_available: boolean;
}

export default function OwnerCategories() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [customizations, setCustomizations] = useState<Customization[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('categories');
  
  // Category form state
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
  });

  // Customization form state
  const [showCustomizationDialog, setShowCustomizationDialog] = useState(false);
  const [editingCustomization, setEditingCustomization] = useState<Customization | null>(null);
  const [customizationForm, setCustomizationForm] = useState({
    name: '',
    description: '',
    min_select: 0,
    max_select: 1,
    is_required: false,
  });

  useEffect(() => {
    if (user) {
      fetchCategories();
      fetchCustomizations();
    }
  }, [user]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      console.log('Fetching categories...');
      console.log('User data:', user);
      
      // Get user's first branch ID using the same logic as OwnerMenuManagement
      let branchId = null;
      if (user?.restaurant?.id) {
        try {
          console.log('Fetching branches for restaurant:', user.restaurant.id);
          // Use restaurantId (camelCase) instead of restaurant_id
          const branchesResponse = await apiClient.getBranches(user.restaurant.id);
          console.log('Branches response:', branchesResponse);
          
          // Handle both response formats
          let branches = [];
          if (branchesResponse.success && branchesResponse.data) {
            const data = branchesResponse.data as any;
            if (Array.isArray(data)) {
              branches = data;
            } else if (data.items && Array.isArray(data.items)) {
              branches = data.items;
            }
          }
          
          if (branches.length > 0) {
            branchId = branches[0].id;
            console.log('Found branchId:', branchId);
          }
        } catch (error) {
          console.error('Failed to fetch branches:', error);
        }
      }
      
      if (!branchId) {
        console.error('No branch found for user');
        toast({
          title: "Error",
          description: "No branch found. Please create a branch first.",
          variant: "destructive",
        });
        return;
      }
      
      console.log('Calling getCategories with branchId:', branchId);
      const response = await apiClient.getCategories(branchId);
      console.log('Categories response:', response);
      
      if (response.success && response.data) {
        setCategories(response.data as Category[]);
      } else {
        console.error('Failed to fetch categories:', response.message);
        toast({
          title: "Error",
          description: response.message || "Failed to load categories",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Failed to fetch categories:', error);
      toast({
        title: "Error", 
        description: error.message || "Failed to load categories",
        variant: "destructive",
      });
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomizations = async () => {
    try {
      // TODO: Replace with actual API call
      const mockCustomizations: Customization[] = [
        {
          id: '1',
          name: 'Spice Level',
          description: 'Choose your preferred spice level',
          min_select: 1,
          max_select: 1,
          is_required: true,
          options: [
            { id: '1', name: 'Mild', price_delta: 0, sort_order: 1, is_available: true },
            { id: '2', name: 'Medium', price_delta: 0, sort_order: 2, is_available: true },
            { id: '3', name: 'Hot', price_delta: 0, sort_order: 3, is_available: true },
            { id: '4', name: 'Extra Hot', price_delta: 5000, sort_order: 4, is_available: true },
          ],
        },
        {
          id: '2',
          name: 'Extra Toppings',
          description: 'Add extra toppings to your dish',
          min_select: 0,
          max_select: 5,
          is_required: false,
          options: [
            { id: '5', name: 'Extra Cheese', price_delta: 15000, sort_order: 1, is_available: true },
            { id: '6', name: 'Bacon', price_delta: 20000, sort_order: 2, is_available: true },
            { id: '7', name: 'Mushrooms', price_delta: 10000, sort_order: 3, is_available: true },
          ],
        },
      ];
      setCustomizations(mockCustomizations);
    } catch (error) {
      console.error('Failed to fetch customizations:', error);
    }
  };

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ name: '', description: '' });
    setShowCategoryDialog(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || '',
    });
    setShowCategoryDialog(true);
  };

  const handleSaveCategory = async () => {
    try {
      // Get user's first branch ID
      let branchId = null;
      if (user?.restaurant?.id) {
        try {
          const branchesResponse = await apiClient.getBranches(user.restaurant.id);
          if (branchesResponse.success && branchesResponse.data && (branchesResponse.data as any[]).length > 0) {
            branchId = (branchesResponse.data as any[])[0].id;
          }
        } catch (error) {
          console.error('Failed to fetch branches:', error);
        }
      }
      
      if (!branchId) {
        toast({
          title: "Error",
          description: "No branch found. Please create a branch first.",
          variant: "destructive",
        });
        return;
      }

      const categoryData = {
        ...categoryForm,
        branchId: branchId,
      };

      if (editingCategory) {
        const response = await apiClient.updateCategory(editingCategory.id, categoryData);
        if (response.success) {
          toast({
            title: "Success",
            description: "Category updated successfully",
          });
        }
      } else {
        const response = await apiClient.createCategory(categoryData);
        if (response.success) {
          toast({
            title: "Success", 
            description: "Category created successfully",
          });
        }
      }
      setShowCategoryDialog(false);
      fetchCategories(); // Refresh list
    } catch (error: any) {
      console.error('Failed to save category:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save category",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
      const response = await apiClient.deleteCategory(categoryId);
      if (response.success) {
        toast({
          title: "Success",
          description: "Category deleted successfully",
        });
        fetchCategories(); // Refresh list
      }
    } catch (error: any) {
      console.error('Failed to delete category:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  const handleCreateCustomization = () => {
    setEditingCustomization(null);
    setCustomizationForm({
      name: '',
      description: '',
      min_select: 0,
      max_select: 1,
      is_required: false,
    });
    setShowCustomizationDialog(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
            <FolderTree className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Categories & Customizations</h1>
            <p className="text-muted-foreground">Organize your menu structure and manage add-on options</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-fit grid-cols-2">
          <TabsTrigger value="categories">
            <FolderTree className="w-4 h-4 mr-2" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="customizations">
            <Sliders className="w-4 h-4 mr-2" />
            Customizations
          </TabsTrigger>
        </TabsList>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Categories</h2>
              <p className="text-muted-foreground">Manage menu categories and organize your items</p>
            </div>
            <Button onClick={handleCreateCategory} className="bg-orange-600 hover:bg-orange-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </div>

          <div className="space-y-3">
            {categories.map((category) => (
              <Card key={category.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                        <FolderTree className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <h3 className="font-medium">{category.name}</h3>
                        {category.description && (
                          <p className="text-sm text-muted-foreground">{category.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {category._count?.menu_items || 0} items
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          // Navigate to menu management filtered by this category
                          window.location.href = `/owner/menu?category=${category.id}`;
                        }}
                      >
                        <Settings className="w-4 h-4 mr-1" />
                        Manage
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Customizations Tab */}
        <TabsContent value="customizations" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Customizations</h2>
              <p className="text-muted-foreground">Manage add-on options and customization groups</p>
            </div>
            <Button onClick={handleCreateCustomization} className="bg-orange-600 hover:bg-orange-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Customization
            </Button>
          </div>

          <div className="space-y-3">
            {customizations.map((customization) => (
              <Card key={customization.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                        <Sliders className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-medium">{customization.name}</h3>
                        {customization.description && (
                          <p className="text-sm text-muted-foreground">{customization.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {customization.options.length} options
                          </Badge>
                          {customization.is_required && (
                            <Badge variant="destructive" className="text-xs">
                              Required
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            Select {customization.min_select}-{customization.max_select}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          // Show customization options management
                          toast({
                            title: "Coming Soon",
                            description: "Customization management will be available soon",
                          });
                        }}
                      >
                        <Settings className="w-4 h-4 mr-1" />
                        Manage
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory 
                ? 'Update the category information below.'
                : 'Create a new category to organize your menu items.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="category-name">Category Name</Label>
              <Input
                id="category-name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Main Courses, Appetizers"
              />
            </div>
            
            <div>
              <Label htmlFor="category-description">Description (Optional)</Label>
              <Textarea
                id="category-description"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of this category"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCategoryDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveCategory}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {editingCategory ? 'Update' : 'Create'} Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Customization Dialog */}
      <Dialog open={showCustomizationDialog} onOpenChange={setShowCustomizationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCustomization ? 'Edit Customization' : 'Add New Customization'}
            </DialogTitle>
            <DialogDescription>
              {editingCustomization 
                ? 'Update the customization group information below.'
                : 'Create a new customization group for menu items.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="customization-name">Customization Name</Label>
              <Input
                id="customization-name"
                value={customizationForm.name}
                onChange={(e) => setCustomizationForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Spice Level, Extra Toppings"
              />
            </div>
            
            <div>
              <Label htmlFor="customization-description">Description (Optional)</Label>
              <Textarea
                id="customization-description"
                value={customizationForm.description}
                onChange={(e) => setCustomizationForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of this customization"
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="min-select">Minimum Select</Label>
                <Input
                  id="min-select"
                  type="number"
                  min="0"
                  value={customizationForm.min_select}
                  onChange={(e) => setCustomizationForm(prev => ({ ...prev, min_select: parseInt(e.target.value) || 0 }))}
                />
              </div>
              
              <div>
                <Label htmlFor="max-select">Maximum Select</Label>
                <Input
                  id="max-select"
                  type="number"
                  min="1"
                  value={customizationForm.max_select}
                  onChange={(e) => setCustomizationForm(prev => ({ ...prev, max_select: parseInt(e.target.value) || 1 }))}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCustomizationDialog(false)}
            >
              Cancel
            </Button>
            <Button className="bg-orange-600 hover:bg-orange-700">
              {editingCustomization ? 'Update' : 'Create'} Customization
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}