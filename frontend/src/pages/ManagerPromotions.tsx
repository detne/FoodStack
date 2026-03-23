/**
 * Manager Promotions
 * Promotion management for branch managers
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Tag, Plus, Percent } from 'lucide-react';

interface Promotion {
  id: string;
  name: string;
  description: string;
  discount_type: string;
  discount_value: number;
  status: string;
  start_date: string;
  end_date: string;
}

export default function ManagerPromotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      setIsLoading(true);
      // TODO: Implement API call to fetch promotions
      // For now, using empty array
      setPromotions([]);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load promotions',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const activePromotions = promotions.filter((p) => p.status === 'ACTIVE').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading promotions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Promotions</h1>
          <p className="text-muted-foreground mt-2">Manage promotions and discounts</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Promotion
        </Button>
      </div>

      {/* Stats Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Active Promotions
              </p>
              <p className="text-3xl font-bold">{activePromotions}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Running promotions
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <Percent className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Promotions List */}
      <Card>
        <CardHeader>
          <CardTitle>All Promotions</CardTitle>
        </CardHeader>
        <CardContent>
          {promotions.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No promotions found</p>
              <p className="text-sm text-muted-foreground mt-2">
                Create your first promotion to attract customers
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {promotions.map((promo) => (
                <div
                  key={promo.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-semibold">{promo.name}</p>
                      <Badge
                        variant={promo.status === 'ACTIVE' ? 'default' : 'secondary'}
                      >
                        {promo.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {promo.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(promo.start_date).toLocaleDateString()} -{' '}
                      {new Date(promo.end_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      {promo.discount_type === 'PERCENTAGE'
                        ? `${promo.discount_value}%`
                        : `$${promo.discount_value}`}
                    </p>
                    <p className="text-xs text-muted-foreground">Discount</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
