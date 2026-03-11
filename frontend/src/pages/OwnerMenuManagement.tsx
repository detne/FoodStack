/**
 * Owner Menu Management Component
 * Manage menu items and categories within owner dashboard
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Settings,
  UtensilsCrossed,
  ChevronRight,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  available: boolean;
  category_id: string;
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

export default function OwnerMenuManagement() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
  });

  const handleAddClick = () => {
    setAddFormData({
      name: '',
      description: '',
      price: '',
      category_id: categories.length > 0 ? categories[0].id : '',
    });
    setIsAddDialogOpen(true);
  };

  const handleAddSave = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:3000/api/v1/menu-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: addFormData.name,
          description: addFormData.description,
          price: parseFloat(addFormData.price),
          categoryId: addFormData.category_id,
          available: true,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Menu item created successfully',
        });
        setIsAddDialogOpen(false);
        fetchMenuItems();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create menu item',
        variant: 'destructive',
      });
    }
  };

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

  const handleEditClick = (item: MenuItem) => {
    setEditingItem(item);
    setEditFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      category_id: item.category_id,
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (!editingItem) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:3000/api/v1/menu-items/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editFormData.name,
          description: editFormData.description,
          price: parseFloat(editFormData.price),
          categoryId: editFormData.category_id,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Menu item updated successfully',
        });
        setIsEditDialogOpen(false);
        fetchMenuItems();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update menu item',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
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

  // Group items by category for display
  const categorizedItems = categories.map(category => ({
    ...category,
    items: filteredMenuItems.filter(item => item.category_id === category.id),
  }));

  // Add uncategorized items
  const uncategorizedItems = filteredMenuItems.filter(item => 
    !categories.some(cat => cat.id === item.category_id)
  );

  if (uncategorizedItems.length > 0) {
    categorizedItems.unshift({
      id: 'uncategorized',
      name: 'Uncategorized',
      description: 'Items without category',
      sort_order: -1,
      items: uncategorizedItems,
    });
  }

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
        <Button className="gap-2" onClick={handleAddClick}>
          <Plus className="h-4 w-4" />
          Add Menu Item
        </Button>
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
        {/* Menu Items - Left Side */}
        <div className="lg:col-span-3 space-y-6">
          {categorizedItems.map((category, categoryIndex) => (
            <div key={category.id} className="animate-in slide-in-from-left" style={{ animationDelay: `${categoryIndex * 100}ms` }}>
              {/* Category Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 bg-orange-600 rounded-full"></div>
                  <div>
                    <h2 className="text-2xl font-bold">{category.name}</h2>
                    <p className="text-muted-foreground text-sm">{category.items?.length || 0} items in this category</p>
                  </div>
                </div>
                <Badge className="bg-teal-600 text-white px-3 py-1 rounded-full">
                  {category.items?.length || 0}
                </Badge>
              </div>

              {/* Menu Items Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.items?.map((item, itemIndex) => (
                  <Card 
                    key={item.id} 
                    className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group animate-in slide-in-from-bottom"
                    style={{ animationDelay: `${(categoryIndex * 100) + (itemIndex * 50)}ms` }}
                  >
                    <CardContent className="p-0">
                      {/* Image */}
                      <div className="relative h-48 bg-muted overflow-hidden">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/80">
                            <UtensilsCrossed className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                        {/* Availability Badge */}
                        <div className="absolute top-3 left-3">
                          <Badge 
                            className={`${item.available ? 'bg-green-600' : 'bg-gray-500'} text-white px-3 py-1 rounded-full text-xs font-medium`}
                          >
                            {item.available ? 'Available' : 'Unavailable'}
                          </Badge>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6 space-y-4">
                        <div>
                          <h3 className="font-bold text-xl mb-2 line-clamp-1">{item.name}</h3>
                          {item.description && (
                            <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <span className="text-2xl font-bold text-orange-600">
                            {parseFloat(item.price.toString()).toFixed(2)} VND
                          </span>
                          <div className="flex items-center gap-2">
                            {/* Toggle Availability */}
                            <Switch
                              checked={item.available}
                              onCheckedChange={() => handleToggleAvailability(item.id, item.available)}
                              className="data-[state=checked]:bg-green-500"
                            />
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-center gap-3 pt-4 border-t">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-muted text-muted-foreground hover:text-foreground rounded-full w-10 h-10"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditClick(item)}
                            className="hover:bg-muted text-muted-foreground hover:text-foreground rounded-full w-10 h-10"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(item.id)}
                            className="hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-full w-10 h-10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
                <Button className="gap-2" onClick={handleAddClick}>
                  <Plus className="h-4 w-4" />
                  Add Menu Item
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Categories Sidebar - Right Side */}
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

          {/* Quick Stats */}
          <div className="space-y-3">
            {categories.slice(0, 5).map((category, index) => {
              const itemCount = menuItems.filter(item => item.category_id === category.id).length;
              const colors = ['green', 'blue', 'purple', 'orange', 'cyan'];
              const color = colors[index % colors.length];
              
              return (
                <Card key={category.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 bg-${color}-100 rounded-lg flex items-center justify-center`}>
                        <UtensilsCrossed className={`h-5 w-5 text-${color}-600`} />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{category.name}</p>
                        <p className="font-semibold">{itemCount} items</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
            <p className="text-sm text-muted-foreground">Update item details</p>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                placeholder="Grilled Salmon"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category">Category *</Label>
              <Select 
                value={editFormData.category_id} 
                onValueChange={(value) => setEditFormData({ ...editFormData, category_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!editFormData.category_id && (
                <p className="text-sm text-red-500">Please select a category</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                placeholder="Fresh Atlantic salmon grilled to perfection with herbs and lemon"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-price">Price *</Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                value={editFormData.price}
                onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                placeholder="24.99"
              />
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="has-customization" />
              <Label htmlFor="has-customization" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Has Customization
              </Label>
            </div>

            <div className="space-y-2">
              <Label>Image *</Label>
              <div className="border-2 border-dashed border-muted rounded-lg p-4 text-center">
                <input type="file" className="hidden" id="image-upload" accept="image/*" />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Choose file. No file chosen</p>
                </label>
              </div>
              {editingItem?.image_url && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground mb-2">Current Image:</p>
                  <img 
                    src={editingItem.image_url} 
                    alt="Current" 
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSave} className="bg-orange-600 hover:bg-orange-700">
              Update
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Menu Item</DialogTitle>
            <p className="text-sm text-muted-foreground">Create a new menu item</p>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="add-name">Name *</Label>
              <Input
                id="add-name"
                value={addFormData.name}
                onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
                placeholder="Grilled Salmon"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-category">Category *</Label>
              <Select 
                value={addFormData.category_id} 
                onValueChange={(value) => setAddFormData({ ...addFormData, category_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!addFormData.category_id && (
                <p className="text-sm text-red-500">Please select a category</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-description">Description *</Label>
              <Textarea
                id="add-description"
                value={addFormData.description}
                onChange={(e) => setAddFormData({ ...addFormData, description: e.target.value })}
                placeholder="Fresh Atlantic salmon grilled to perfection with herbs and lemon"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-price">Price *</Label>
              <Input
                id="add-price"
                type="number"
                step="0.01"
                value={addFormData.price}
                onChange={(e) => setAddFormData({ ...addFormData, price: e.target.value })}
                placeholder="24.99"
              />
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="add-has-customization" />
              <Label htmlFor="add-has-customization" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Has Customization
              </Label>
            </div>

            <div className="space-y-2">
              <Label>Image</Label>
              <div className="border-2 border-dashed border-muted rounded-lg p-4 text-center">
                <input type="file" className="hidden" id="add-image-upload" accept="image/*" />
                <label htmlFor="add-image-upload" className="cursor-pointer">
                  <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Choose file. No file chosen</p>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSave} className="bg-orange-600 hover:bg-orange-700">
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}