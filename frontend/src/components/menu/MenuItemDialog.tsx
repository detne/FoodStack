/**
 * Menu Item Edit/Create Dialog Component
 * Used for creating and editing menu items (Owner only)
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageIcon, Settings, Loader2 } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  available: boolean;
  category_id: string;
  is_best_seller?: boolean;
}

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface MenuItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  item?: MenuItem | null;
  categories: Category[];
  mode: 'create' | 'edit';
}

export default function MenuItemDialog({
  isOpen,
  onClose,
  onSave,
  item,
  categories,
  mode
}: MenuItemDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    available: true,
    is_best_seller: false,
    has_customization: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    if (item && mode === 'edit') {
      setFormData({
        name: item.name,
        description: item.description || '',
        price: item.price.toString(),
        category_id: item.category_id,
        available: item.available,
        is_best_seller: item.is_best_seller || false,
        has_customization: false
      });
      setImagePreview(item.image_url || '');
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        category_id: categories.length > 0 ? categories[0].id : '',
        available: true,
        is_best_seller: false,
        has_customization: false
      });
      setImagePreview('');
    }
    setImageFile(null);
  }, [item, mode, categories, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.category_id || !formData.price) {
      return;
    }

    setIsLoading(true);
    try {
      const saveData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        categoryId: formData.category_id,
        available: formData.available,
        is_best_seller: formData.is_best_seller,
        imageFile: imageFile
      };

      await onSave(saveData);
      onClose();
    } catch (error) {
      console.error('Error saving menu item:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.name && formData.category_id && formData.price && parseFloat(formData.price) > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add Menu Item' : 'Edit Menu Item'}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {mode === 'create' ? 'Create a new menu item' : 'Update item details'}
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Grilled Salmon"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={formData.category_id} 
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Fresh Atlantic salmon grilled to perfection with herbs and lemon"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (VND) *</Label>
              <Input
                id="price"
                type="number"
                step="1000"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="250000"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Image</h3>
            
            <div className="space-y-2">
              <Label>Item Image</Label>
              <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                <input 
                  type="file" 
                  className="hidden" 
                  id="image-upload" 
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  {imagePreview ? (
                    <div className="space-y-2">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-32 h-32 object-cover rounded-lg mx-auto"
                      />
                      <p className="text-sm text-muted-foreground">Click to change image</p>
                    </div>
                  ) : (
                    <div>
                      <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Click to upload image</p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Available</Label>
                  <p className="text-sm text-muted-foreground">
                    Item is available for ordering
                  </p>
                </div>
                <Switch
                  checked={formData.available}
                  onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Best Seller</Label>
                  <p className="text-sm text-muted-foreground">
                    Mark as a popular item
                  </p>
                </div>
                <Switch
                  checked={formData.is_best_seller}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_best_seller: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Has Customization
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Item has customizable options
                  </p>
                </div>
                <Switch
                  checked={formData.has_customization}
                  onCheckedChange={(checked) => setFormData({ ...formData, has_customization: checked })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!isFormValid || isLoading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {mode === 'create' ? 'Create Item' : 'Update Item'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}