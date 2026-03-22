/**
 * Manager Bills
 * Bill history and management
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Receipt, DollarSign, FileText } from 'lucide-react';

export default function ManagerBills() {
  const [stats, setStats] = useState({
    totalBills: 0,
    todayRevenue: 0,
    totalRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchBillStats();
  }, []);

  const fetchBillStats = async () => {
    try {
      setIsLoading(true);
      // TODO: Implement API call to fetch bill statistics
      // For now, using mock data
      setStats({
        totalBills: 0,
        todayRevenue: 0,
        totalRevenue: 0,
      });
    } catch (error) {
      console.error('Error fetching bill stats:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load bill statistics',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading bills...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bill Management</h1>
        <p className="text-muted-foreground mt-2">View bill history and details</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Total Bills
                </p>
                <p className="text-3xl font-bold">{stats.totalBills}</p>
                <p className="text-xs text-muted-foreground mt-1">All time</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <FileText className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Today's Revenue
                </p>
                <p className="text-3xl font-bold">${stats.todayRevenue.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  From paid bills today
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Total Revenue
                </p>
                <p className="text-3xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">All paid bills</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bill History */}
      <Card>
        <CardHeader>
          <CardTitle>Bill History</CardTitle>
          <p className="text-sm text-muted-foreground">View all bills and their details</p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No bills found</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
