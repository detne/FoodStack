/**
 * Shared Menu Item Card Component
 * Used across different role-based menu management interfaces
 */

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Eye, 
  Edit, 
  Trash2, 
  UtensilsCrossed,
  Star,
  TrendingUp
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

interface MenuItemCardProps {
  item: MenuItem;
  userRole: 'owner' | 'manager' | 'staff';
  onToggleAvailability?: (id: string, currentStatus: boolean) => void;
  onEdit?: (item: MenuItem) => void;
  onDelete?: (id: string) => void;
  onView?: (item: MenuItem) => void;
  className?: string;
}

export default function MenuItemCard({
  item,
  userRole,
  onToggleAvailability,
  onEdit,
  onDelete,
  onView,
  className = ''
}: MenuItemCardProps) {
  const canEdit = userRole === 'owner';
  const canDelete = userRole === 'owner';
  const canToggleAvailability = ['owner', 'manager', 'staff'].includes(userRole);

  return (
    <Card className={`hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group ${className}`}>
      <CardContent className="p-0">
        {/* Image */}
        <div className="relative h-48 bg-muted overflow-hidden">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/80">
              <UtensilsCrossed className="h-12 w-12 text-muted-foreground" />
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

          {/* Trending indicator for popular items */}
          {item.is_best_seller && (
            <div className="absolute top-3 right-3">
              <div className="bg-yellow-600 text-white p-2 rounded-full">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
          )}
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
              {parseFloat(item.price.toString()).toLocaleString('vi-VN')} VND
            </span>
            {canToggleAvailability && (
              <div className="flex items-center gap-2">
                <Switch
                  checked={item.available}
                  onCheckedChange={() => onToggleAvailability?.(item.id, item.available)}
                  className="data-[state=checked]:bg-green-500"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3 pt-4 border-t">
            {onView && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onView(item)}
                className="hover:bg-muted text-muted-foreground hover:text-foreground rounded-full w-10 h-10"
                title="View Details"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            
            {canEdit && onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(item)}
                className="hover:bg-muted text-muted-foreground hover:text-foreground rounded-full w-10 h-10"
                title="Edit Item"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            
            {canDelete && onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(item.id)}
                className="hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-full w-10 h-10"
                title="Delete Item"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}