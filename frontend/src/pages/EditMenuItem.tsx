/**
 * Edit Menu Item Page
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

export default function EditMenuItem() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    categoryId: '',
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    available: true,
  });

  useEffect(() => {
    fetchCategories();
    fetchMenuItem();
  }, [id]);

  const fetchCategories = async () => {
    try {
      const branchesResponse = await apiClient.getBranches();
      const branchId = branchesResponse.data?.[0]?.id;

      if (!branchId) return;

      const response = await apiClient.getCategories(branchId);
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error: any) {
      toast({
        title: 'Error loading categories',
        description: error.message || 'Failed to load categories',
        variant: 'destructive',
      });
    }
  };

  const fetchMenuItem = async () => {
    try {
      setIsFetching(true);
      const response = await apiClient.getMenuItem(id!);
      if (response.success && response.data) {
        const item = response.data;
        setFormData({
          categoryId: item.category_id,
          name: item.name,
          description: item.description || '',
          price: item.price.toString(),
          imageUrl: item.image_url || '',
          available: item.available,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error loading menu item',
        description: error.message || 'Failed to load menu item',
        variant: 'destructive',
      });
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.categoryId || !formData.price) {
      toast({
        title: 'Validation error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const price = parseFloat(formData.price);
    if (price <= 0 || price > 99999999.99) {
      toast({
        title: 'Validation error',
        description: 'Price must be between 0.01 and 99,999,999.99',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      await apiClient.updateMenuItem(id!, {
        categoryId: formData.categoryId,
        name: formData.name,
        description: formData.description || null,
        price: price,
        imageUrl: formData.imageUrl || null,
        available: formData.available,
      });

      toast({
        title: 'Menu item updated',
        description: 'Menu item has been updated successfully',
      });

      navigate('/menu-items');
    } catch (error: any) {
      toast({
        title: 'Error updating menu item',
        description: error.message || 'Failed to update menu item',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/menu-items')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Menu Item</h1>
            <p className="text-muted-foreground mt-1">
              Update menu item information
            </p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Menu Item Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryId">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, categoryId: value })
                    }
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
                  <Label htmlFor="name">
                    Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g. Margherita Pizza"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">
                    Price <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    max="99999999.99"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="0.00"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Max: $99,999,999.99
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, imageUrl: e.target.value })
                    }
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe your menu item..."
                  rows={4}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="available"
                  checked={formData.available}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, available: checked })
                  }
                />
                <Label htmlFor="available">Available for order</Label>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/menu-items')}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Menu Item
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
