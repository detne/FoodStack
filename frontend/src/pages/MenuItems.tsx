/**
 * Menu Items Page
 * Quản lý món ăn
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  Loader2,
  UtensilsCrossed,
  Eye,
  Settings,
  Image as ImageIcon
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function MenuItems() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
  });

  useEffect(() => {
    fetchCategories();
    fetchAllMenuItems();
  }, []);

  useEffect(() => {
    if (selectedCategory && selectedCategory !== 'all') {
      fetchMenuItems();
    } else if (selectedCategory === 'all') {
      fetchAllMenuItems();
    }
  }, [selectedCategory]);

  const fetchAllMenuItems = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:3000/api/v1/menu-items/search', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setMenuItems(data.data);
        }
      }
    } catch (error: any) {
      console.error('Error loading menu items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const branchesResponse = await apiClient.getBranches();
      const branchId = branchesResponse.data?.[0]?.id;

      if (!branchId) {
        toast({
          title: 'No branch found',
          description: 'Please create a branch first',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      const response = await apiClient.getCategories(branchId);
      if (response.success && response.data) {
        setCategories(response.data);
        // Don't auto-select first category, keep 'all' as default
      }
    } catch (error: any) {
      toast({
        title: 'Error loading categories',
        description: error.message || 'Failed to load categories',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getMenuItems(selectedCategory);
      if (response.success && response.data) {
        setMenuItems(response.data);
      }
    } catch (error: any) {
      toast({
        title: 'Error loading menu items',
        description: error.message || 'Failed to load menu items',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    try {
      await apiClient.deleteMenuItem(id);
      toast({
        title: 'Menu item deleted',
        description: 'Menu item has been deleted successfully',
      });
      fetchMenuItems();
    } catch (error: any) {
      toast({
        title: 'Error deleting menu item',
        description: error.message || 'Failed to delete menu item',
        variant: 'destructive',
      });
    }
  };

  const filteredMenuItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Menu Items</h1>
            <p className="text-muted-foreground mt-1">
              Manage your menu items
            </p>
          </div>
          <Button onClick={() => navigate('/menu-items/create')}>
            <Plus className="w-4 h-4 mr-2" />
            Add Menu Item
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="text-2xl font-bold mt-1">{menuItems.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Available</p>
              <p className="text-2xl font-bold mt-1">
                {menuItems.filter((item) => item.available).length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Unavailable</p>
              <p className="text-2xl font-bold mt-1">
                {menuItems.filter((item) => !item.available).length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Menu Items Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : filteredMenuItems.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <UtensilsCrossed className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No menu items found</p>
              <Button onClick={() => navigate('/menu-items/create')} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Create First Menu Item
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMenuItems.map((item, index) => (
              <Card 
                key={item.id} 
                className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-in slide-in-from-bottom group"
                style={{ animationDelay: `${index * 50}ms` }}
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
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    {/* Availability Badge */}
                    <div className="absolute top-3 left-3">
                      <Badge 
                        variant={item.available ? 'default' : 'secondary'}
                        className={item.available ? 'bg-green-500' : 'bg-gray-500'}
                      >
                        {item.available ? 'Available' : 'Unavailable'}
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg line-clamp-1">{item.name}</h3>
                      {item.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-xl font-bold text-primary">
                        {parseFloat(item.price).toFixed(2)} VND
                      </span>
                      <div className="flex items-center gap-2">
                        {/* Toggle Availability */}
                        <Switch
                          checked={item.available}
                          onCheckedChange={() => handleToggleAvailability(item.id, item.available)}
                          className="data-[state=checked]:bg-green-500"
                        />
                        
                        {/* Action Buttons */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(item)}
                          className="hover:bg-primary/10"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                          className="hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Menu Item</DialogTitle>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  placeholder="Fresh Atlantic salmon grilled to perfection..."
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
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditSave}>
                Update
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
