/**
 * Menu Item View Dialog Component
 * Used for viewing menu item details (all roles)
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  UtensilsCrossed, 
  Star, 
  TrendingUp, 
  Calendar,
  DollarSign,
  Tag,
  Settings
} from 'lucide-react';

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
}

interface MenuItemViewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem | null;
  category?: Category;
  userRole: 'owner' | 'manager' | 'staff';
  onToggleAvailability?: (id: string, currentStatus: boolean) => void;
  onEdit?: (item: MenuItem) => void;
}

export default function MenuItemViewDialog({
  isOpen,
  onClose,
  item,
  category,
  userRole,
  onToggleAvailability,
  onEdit
}: MenuItemViewDialogProps) {
  if (!item) return null;

  const canEdit = userRole === 'owner';
  const canToggleAvailability = ['owner', 'manager', 'staff'].includes(userRole);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UtensilsCrossed className="h-5 w-5" />
            Menu Item Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image and Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image */}
            <div className="space-y-4">
              <div className="relative h-64 bg-muted rounded-lg overflow-hidden">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/80">
                    <UtensilsCrossed className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
                
                {/* Status Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  <Badge 
                    className={`${item.available ? 'bg-green-600' : 'bg-gray-500'} text-white px-3 py-1 rounded-full text-xs font-medium`}
                  >
                    {item.available ? 'Available' : 'Unavailable'}
                  </Badge>
                  {item.is_best_seller && (
                    <Badge className="bg-yellow-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      Best Seller
                    </Badge>
                  )}
                </div>

                {item.is_best_seller && (
                  <div className="absolute top-3 right-3">
                    <div className="bg-yellow-600 text-white p-2 rounded-full">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                  </div>
                )}
              </div>

              {/* Availability Toggle */}
              {canToggleAvailability && (
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Availability Status</Label>
                    <p className="text-sm text-muted-foreground">
                      Toggle item availability
                    </p>
                  </div>
                  <Switch
                    checked={item.available}
                    onCheckedChange={() => onToggleAvailability?.(item.id, item.available)}
                    className="data-[state=checked]:bg-green-500"
                  />
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">{item.name}</h2>
                {item.description && (
                  <p className="text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>

              {/* Price */}
              <div className="flex items-center gap-2 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <DollarSign className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-orange-600 font-medium">Price</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {parseFloat(item.price.toString()).toLocaleString('vi-VN')} VND
                  </p>
                </div>
              </div>

              {/* Category */}
              {category && (
                <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Tag className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Category</p>
                    <p className="font-semibold text-blue-700">{category.name}</p>
                    {category.description && (
                      <p className="text-sm text-blue-600">{category.description}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Special Features */}
              <div className="space-y-3">
                <h3 className="font-semibold">Features</h3>
                <div className="flex flex-wrap gap-2">
                  {item.is_best_seller && (
                    <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-300">
                      <Star className="h-3 w-3 mr-1" />
                      Best Seller
                    </Badge>
                  )}
                  <Badge className="bg-gray-100 text-gray-800 border border-gray-300">
                    <Settings className="h-3 w-3 mr-1" />
                    Customizable
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <div>
                <p className="font-medium">Created</p>
                <p>{formatDate(item.created_at)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <div>
                <p className="font-medium">Last Updated</p>
                <p>{formatDate(item.updated_at)}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {canEdit && onEdit && (
              <Button 
                onClick={() => onEdit(item)}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Edit Item
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}