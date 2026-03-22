/**
 * Add Menu Item Dialog
 * Dialog for creating new menu items with image upload
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
import { X, Upload, Info, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { toast } from '@/components/ui/use-toast';

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface AddMenuItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: Category[];
}

export default function AddMenuItemDialog({ 
  isOpen, 
  onClose, 
  onSuccess, 
  categories 
}: AddMenuItemDialogProps) {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    description: '',
    price: '',
    hasCustomization: false,
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.categoryId || !formData.price) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!imageFile) {
      toast({
        title: "Error",
        description: "Please select an image for the menu item",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      const menuItemData = {
        name: formData.name,
        categoryId: formData.categoryId,
        description: formData.description || null,
        price: parseFloat(formData.price),
        available: true,
      };

      console.log('Creating menu item with data:', menuItemData);
      
      const response = await apiClient.createMenuItem(menuItemData);
      console.log('Create menu item response:', response);
      
      if (response.success && response.data?.id) {
        console.log('Menu item created:', response.data.id);
        
        // Upload image
        try {
          console.log('Uploading image...');
          const uploadResponse = await apiClient.uploadMenuItemImage(response.data.id, imageFile);
          
          if (uploadResponse.success) {
            console.log('Image uploaded successfully');
            toast({
              title: "Success",
              description: "Menu item created with image successfully!",
            });
          } else {
            console.error('Image upload failed:', uploadResponse);
            toast({
              title: "Warning",
              description: "Menu item created but image upload failed. You can upload the image later.",
              variant: "destructive",
            });
          }
        } catch (uploadError: any) {
          console.error('Image upload error:', uploadError);
          toast({
            title: "Warning",
            description: "Menu item created but image upload failed. You can upload the image later.",
            variant: "destructive",
          });
        }
        
        // Reset form
        setFormData({
          name: '',
          categoryId: '',
          description: '',
          price: '',
          hasCustomization: false,
        });
        setImageFile(null);
        setImagePreview(null);
        
        onSuccess();
        onClose();
      } else {
        throw new Error(response.message || 'Failed to create menu item');
      }
    } catch (error: any) {
      console.error('Error creating menu item:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create menu item",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form
    setFormData({
      name: '',
      categoryId: '',
      description: '',
      price: '',
      hasCustomization: false,
    });
    setImageFile(null);
    setImagePreview(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              Add Menu Item
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Create a new menu item with image
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Name *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter menu item name"
              className="w-full"
              disabled={loading}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Category *
            </Label>
            <Select 
              value={formData.categoryId} 
              onValueChange={(value) => handleInputChange('categoryId', value)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description *
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your menu item"
              rows={4}
              className="w-full"
              disabled={loading}
            />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price" className="text-sm font-medium">
              Price *
            </Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              placeholder="0.00"
              className="w-full"
              disabled={loading}
            />
          </div>

          {/* Has Customization */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Switch
                checked={formData.hasCustomization}
                onCheckedChange={(checked) => handleInputChange('hasCustomization', checked)}
                disabled={loading}
              />
              <div>
                <Label className="text-sm font-medium">Has Customization</Label>
                <div className="flex items-center gap-1 mt-1">
                  <Info className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Enable if this item has customizable options
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image" className="text-sm font-medium">
              Image * (Required)
            </Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
              {imagePreview ? (
                <div className="space-y-4">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-64 h-64 object-cover rounded-lg mx-auto"
                  />
                  <div className="text-sm text-muted-foreground">
                    {imageFile?.name}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    disabled={loading}
                  >
                    Remove Image
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                  <div>
                    <Label 
                      htmlFor="image-upload" 
                      className="cursor-pointer text-sm text-primary hover:text-primary/80"
                    >
                      Choose File
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      JPG or PNG, max 5MB
                    </p>
                  </div>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={loading}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-orange-600 hover:bg-orange-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}