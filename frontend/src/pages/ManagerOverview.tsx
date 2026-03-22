/**
 * Manager Overview
 * Dashboard summary for branch managers
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  DollarSign,
  Users,
  Grid3x3,
  Tag,
  TrendingUp,
  TrendingDown,
  Receipt,
  UtensilsCrossed,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCard {
  title: string;
  value: string;
  subtitle: string;
  icon: any;
  trend?: number;
}

interface Area {
  id: string;
  name: string;
  total_tables: number;
  occupied_tables: number;
}

interface Table {
  id: string;
  table_number: string;
  area_name: string;
  capacity: number;
  status: 'FREE' | 'OCCUPIED' | 'ACTIVE' | 'INACTIVE';
}

export default function ManagerOverview() {
  const [stats, setStats] = useState<StatsCard[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [quickStats, setQuickStats] = useState({
    totalOrders: 0,
    avgOrderValue: 0,
    totalItemsSold: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (selectedArea !== 'all') {
      fetchTablesByArea(selectedArea);
    } else {
      fetchAllTables();
    }
  }, [selectedArea]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const branchId = localStorage.getItem('selected_branch_id');
      const token = localStorage.getItem('access_token');

      if (!branchId || !token) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Branch information not found',
        });
        return;
      }

      // Fetch all tables for the branch first
      const tablesResponse = await fetch(
        `http://localhost:3000/api/v1/branches/${branchId}/tables`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Check for 401 Unauthorized
      if (tablesResponse.status === 401) {
        toast({
          variant: 'destructive',
          title: 'Session Expired',
          description: 'Your session has expired. Please login again.',
        });
        // Clear flags and redirect to login or owner dashboard
        localStorage.removeItem('owner_viewing_branch');
        localStorage.removeItem('selected_branch_id');
        window.location.href = '/login';
        return;
      }

      let allTables: any[] = [];
      if (tablesResponse.ok) {
        const tablesData = await tablesResponse.json();
        if (tablesData.success && tablesData.data) {
          allTables = tablesData.data;
          setTables(allTables);
        }
      }

      // Fetch areas and calculate table counts from allTables
      const areasResponse = await fetch(
        `http://localhost:3000/api/v1/branches/${branchId}/areas`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (areasResponse.ok) {
        const areasData = await areasResponse.json();
        if (areasData.success && areasData.data) {
          // Calculate table counts for each area from allTables
          const areasWithCounts = areasData.data.map((area: any) => {
            const areaTables = allTables.filter((t: any) => t.area_id === area.id);
            const occupiedCount = areaTables.filter((t: any) => t.status === 'OCCUPIED').length;
            
            return {
              ...area,
              total_tables: areaTables.length,
              occupied_tables: occupiedCount,
            };
          });
          
          setAreas(areasWithCounts);
        }
      }

      // Fetch staff count
      const staffResponse = await fetch(
        `http://localhost:3000/api/v1/staff?branchId=${branchId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      let activeStaffCount = 0;
      let totalStaffCount = 0;
      
      if (staffResponse.ok) {
        const staffData = await staffResponse.json();
        if (staffData.success && staffData.data) {
          const staffList = staffData.data.items || staffData.data;
          totalStaffCount = staffList.length;
          activeStaffCount = staffList.filter((s: any) => s.status === 'ACTIVE').length;
        }
      }

      // Calculate table stats from allTables (already fetched above)
      const totalTables = allTables.length;
      const occupiedTables = allTables.filter((t: any) => t.status === 'OCCUPIED').length;

      // Update stats
      setStats([
        {
          title: "Today's Revenue",
          value: '$0.00',
          subtitle: 'Loading... vs yesterday',
          icon: DollarSign,
          trend: 0,
        },
        {
          title: 'Active Staff',
          value: `${activeStaffCount}`,
          subtitle: `Out of ${totalStaffCount} total staff`,
          icon: Users,
        },
        {
          title: 'Table Status',
          value: `${occupiedTables}/${totalTables}`,
          subtitle: 'Tables occupied',
          icon: Grid3x3,
        },
        {
          title: 'Active Promos',
          value: '0',
          subtitle: 'Running promotions',
          icon: Tag,
        },
      ]);

      // TODO: Fetch real order statistics
      setQuickStats({
        totalOrders: 0,
        avgOrderValue: 0,
        totalItemsSold: 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load dashboard data',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllTables = async () => {
    try {
      const branchId = localStorage.getItem('selected_branch_id');
      const token = localStorage.getItem('access_token');

      const response = await fetch(
        `http://localhost:3000/api/v1/branches/${branchId}/tables`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setTables(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  const fetchTablesByArea = async (areaId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `http://localhost:3000/api/v1/areas/${areaId}/tables`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setTables(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching tables by area:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'FREE':
        return 'border-green-500';
      case 'OCCUPIED':
        return 'border-red-500';
      case 'ACTIVE':
        return 'border-blue-500';
      case 'INACTIVE':
        return 'border-gray-400';
      default:
        return 'border-gray-300';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'FREE':
        return <Badge className="bg-green-500">Available</Badge>;
      case 'OCCUPIED':
        return <Badge className="bg-red-500">Occupied</Badge>;
      case 'ACTIVE':
        return <Badge className="bg-blue-500">Active</Badge>;
      case 'INACTIVE':
        return <Badge variant="secondary">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manager Overview</h1>
        <p className="text-muted-foreground mt-2">Branch - Branch Operations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                    {stat.trend !== undefined && stat.trend !== 0 && (
                      <div
                        className={cn(
                          'flex items-center text-xs',
                          stat.trend > 0 ? 'text-green-600' : 'text-red-600'
                        )}
                      >
                        {stat.trend > 0 ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {Math.abs(stat.trend)}%
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table Status */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Table Status</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Current table availability by floor
                </p>
              </div>
              <Select value={selectedArea} onValueChange={setSelectedArea}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Areas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Areas</SelectItem>
                  {areas.map((area) => (
                    <SelectItem key={area.id} value={area.id}>
                      {area.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {selectedArea === 'all' && areas.length > 0 ? (
              <div className="space-y-4">
                {areas.map((area) => (
                  <div
                    key={area.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-lg">{area.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {area.occupied_tables} occupied • {area.total_tables} total tables
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {area.occupied_tables}/{area.total_tables}
                      </p>
                      <p className="text-xs text-muted-foreground">Tables</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : tables.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {tables.map((table) => (
                  <div
                    key={table.id}
                    className={cn(
                      'p-4 border-2 rounded-lg',
                      getStatusColor(table.status)
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold">#{table.table_number}</p>
                      {getStatusBadge(table.status)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {table.area_name} • {table.capacity} seats
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Grid3x3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No tables found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <p className="text-sm text-muted-foreground">Today's performance</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Receipt className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{quickStats.totalOrders}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Average Order Value</p>
                  <p className="text-2xl font-bold">
                    ${quickStats.avgOrderValue.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <UtensilsCrossed className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Menu Items Sold
                  </p>
                  <p className="text-2xl font-bold">{quickStats.totalItemsSold}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
