/**
 * Edit Menu Item Dialog
 * Dialog for editing existing menu items
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { X, Loader2, Upload } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { toast } from '@/components/ui/use-toast';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  available: boolean;
  category_id: string;
}

interface Category {
  id: string;
  name: string;
}

interface EditMenuItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: Category[];
  item: MenuItem | null;
}

export default function EditMenuItemDialog({ 
  isOpen, 
  onClose, 
  onSuccess, 
  categories,
  item
}: EditMenuItemDialogProps) {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    description: '',
    price: '',
  });

  // Initialize form when item changes
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        categoryId: item.category_id,
        description: item.description || '',
        price: item.price.toString(),
      });
      // Set existing image as preview
      setImagePreview(item.image_url || null);
      setImageFile(null);
    }
  }, [item]);

  const handleInputChange = (field: string, value: string) => {
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
    
    if (!item) return;
    
    if (!formData.name || !formData.categoryId || !formData.price) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      const updateData = {
        name: formData.name,
        categoryId: formData.categoryId,
        description: formData.description || null,
        price: parseFloat(formData.price),
      };

      const response = await apiClient.updateMenuItem(item.id, updateData);
      
      if (response.success) {
        // If new image selected, upload it
        if (imageFile) {
          try {
            const uploadResponse = await apiClient.uploadMenuItemImage(item.id, imageFile);
            if (!uploadResponse.success) {
              toast({
                title: "Warning",
                description: "Menu item updated but image upload failed",
                variant: "destructive",
              });
            }
          } catch (uploadError) {
            console.error('Image upload error:', uploadError);
          }
        }
        
        toast({
          title: "Success",
          description: "Menu item updated successfully!",
        });
        
        onSuccess();
        onClose();
      } else {
        throw new Error(response.message || 'Failed to update menu item');
      }
    } catch (error: any) {
      console.error('Error updating menu item:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update menu item",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              Edit Menu Item
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Update menu item information
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
              Description
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

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image" className="text-sm font-medium">
              Image {imagePreview && !imageFile && '(Current)'}
            </Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
              {imagePreview ? (
                <div className="space-y-4">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-64 h-64 object-cover rounded-lg mx-auto"
                  />
                  {imageFile && (
                    <div className="text-sm text-muted-foreground">
                      New: {imageFile.name}
                    </div>
                  )}
                  <div className="flex gap-2 justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('image-upload-edit')?.click()}
                      disabled={loading}
                    >
                      Change Image
                    </Button>
                    {imageFile && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(item?.image_url || null);
                        }}
                        disabled={loading}
                      >
                        Cancel Change
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                  <div>
                    <Label 
                      htmlFor="image-upload-edit" 
                      className="cursor-pointer text-sm text-primary hover:text-primary/80"
                    >
                      Choose File
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      JPG or PNG, max 5MB
                    </p>
                  </div>
                </div>
              )}
              <input
                id="image-upload-edit"
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleImageChange}
                className="hidden"
                disabled={loading}
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
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
                  <Loader2 className="w-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
