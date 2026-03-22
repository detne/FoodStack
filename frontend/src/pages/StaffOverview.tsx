/**
 * Staff Overview
 * Dashboard tổng quan cho nhân viên
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import {
  Calendar,
  Grid3x3,
  ShoppingBag,
  Clock,
  CheckCircle,
  Users,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';

export default function StaffOverview() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    reservations: { today: 0, pending: 0, confirmed: 0 },
    tables: { total: 0, available: 0, occupied: 0 },
    orders: { today: 0, pending: 0, preparing: 0 },
  });
  const [recentReservations, setRecentReservations] = useState<any[]>([]);
  const [activeTables, setActiveTables] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      const branchId = localStorage.getItem('selected_branch_id');
      const token = localStorage.getItem('access_token');

      if (token && branchId) {
        fetchDashboardData();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const branchId = localStorage.getItem('selected_branch_id');
      
      // Fetch reservations
      const reservationsResult = await apiClient.reservations.list(branchId!);
      
      // Fetch tables
      const tablesResult = await apiClient.tables.list(branchId!);
      
      // Process reservations data
      if (reservationsResult.success && reservationsResult.data) {
        const reservationList = Array.isArray(reservationsResult.data) 
          ? reservationsResult.data 
          : reservationsResult.data.items || [];
        
        const today = new Date().toISOString().split('T')[0];
        const todayReservations = reservationList.filter((r: any) => 
          r.reservation_date === today
        );
        
        setStats(prev => ({
          ...prev,
          reservations: {
            today: todayReservations.length,
            pending: reservationList.filter((r: any) => r.status?.toLowerCase() === 'pending').length,
            confirmed: reservationList.filter((r: any) => r.status?.toLowerCase() === 'confirmed').length,
          },
        }));
        
        // Get upcoming reservations (next 3)
        const upcoming = reservationList
          .filter((r: any) => r.status?.toLowerCase() === 'confirmed')
          .slice(0, 3);
        setRecentReservations(upcoming);
      }
      
      // Process tables data
      if (tablesResult.success && tablesResult.data) {
        const tablesList = Array.isArray(tablesResult.data) 
          ? tablesResult.data 
          : [];
        
        const available = tablesList.filter((t: any) => t.status?.toLowerCase() === 'available').length;
        const occupied = tablesList.filter((t: any) => t.status?.toLowerCase() === 'occupied').length;
        
        setStats(prev => ({
          ...prev,
          tables: {
            total: tablesList.length,
            available,
            occupied,
          },
        }));
        
        // Get active tables (occupied)
        const active = tablesList
          .filter((t: any) => t.status?.toLowerCase() === 'occupied')
          .slice(0, 3);
        setActiveTables(active);
      }
      
      // TODO: Fetch orders when API is ready
      // For now keep mock data for orders
      setStats(prev => ({
        ...prev,
        orders: { today: 0, pending: 0, preparing: 0 },
      }));
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Staff Overview</h1>
        <p className="text-muted-foreground mt-1">Welcome to your dashboard</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Reservations Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Today's Reservations
            </CardTitle>
            <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
              {stats.reservations.today}
            </div>
            <div className="flex gap-4 mt-3 text-sm">
              <div>
                <span className="text-yellow-600 dark:text-yellow-400 font-semibold">
                  {stats.reservations.pending}
                </span>
                <span className="text-blue-700 dark:text-blue-300 ml-1">Pending</span>
              </div>
              <div>
                <span className="text-green-600 dark:text-green-400 font-semibold">
                  {stats.reservations.confirmed}
                </span>
                <span className="text-blue-700 dark:text-blue-300 ml-1">Confirmed</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-4 text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100"
              onClick={() => navigate('/staff/reservations')}
            >
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Tables Card */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">
              Table Status
            </CardTitle>
            <Grid3x3 className="h-5 w-5 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900 dark:text-green-100">
              {stats.tables.occupied}/{stats.tables.total}
            </div>
            <div className="flex gap-4 mt-3 text-sm">
              <div>
                <span className="text-green-600 dark:text-green-400 font-semibold">
                  {stats.tables.available}
                </span>
                <span className="text-green-700 dark:text-green-300 ml-1">Available</span>
              </div>
              <div>
                <span className="text-red-600 dark:text-red-400 font-semibold">
                  {stats.tables.occupied}
                </span>
                <span className="text-green-700 dark:text-green-300 ml-1">Occupied</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-4 text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100"
              onClick={() => navigate('/staff/tables')}
            >
              Manage Tables <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Orders Card */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">
              Today's Orders
            </CardTitle>
            <ShoppingBag className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
              {stats.orders.today}
            </div>
            <div className="flex gap-4 mt-3 text-sm">
              <div>
                <span className="text-yellow-600 dark:text-yellow-400 font-semibold">
                  {stats.orders.pending}
                </span>
                <span className="text-purple-700 dark:text-purple-300 ml-1">Pending</span>
              </div>
              <div>
                <span className="text-blue-600 dark:text-blue-400 font-semibold">
                  {stats.orders.preparing}
                </span>
                <span className="text-purple-700 dark:text-purple-300 ml-1">Preparing</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-4 text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-purple-100"
              onClick={() => navigate('/staff/orders')}
            >
              View Orders <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-24 flex flex-col gap-2"
              onClick={() => navigate('/staff/reservations')}
            >
              <Calendar className="h-6 w-6" />
              <span>New Reservation</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col gap-2"
              onClick={() => navigate('/staff/tables')}
            >
              <Grid3x3 className="h-6 w-6" />
              <span>Update Table</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col gap-2"
              onClick={() => navigate('/staff/orders')}
            >
              <ShoppingBag className="h-6 w-6" />
              <span>View Orders</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col gap-2"
              onClick={() => navigate('/staff/reservations')}
            >
              <CheckCircle className="h-6 w-6" />
              <span>Check-in Guest</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upcoming Reservations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Upcoming Reservations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : recentReservations.length > 0 ? (
              <div className="space-y-3">
                {recentReservations.map((reservation: any) => (
                  <div key={reservation.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{reservation.guest_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {reservation.table?.table_number ? `Table ${reservation.table.table_number}` : 'No table'} • {reservation.reservation_time} • {reservation.guest_count} guests
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-green-100 text-green-700">Confirmed</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">No upcoming reservations</p>
            )}
            <Button
              variant="link"
              className="mt-4 w-full"
              onClick={() => navigate('/staff/reservations')}
            >
              View All Reservations
            </Button>
          </CardContent>
        </Card>

        {/* Active Tables */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Active Tables
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : activeTables.length > 0 ? (
              <div className="space-y-3">
                {activeTables.map((table: any) => (
                  <div key={table.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">
                        {table.table_number?.startsWith('Table') ? table.table_number : `Table ${table.table_number}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {table.area_name || 'No area'} • {table.capacity} seats
                      </p>
                    </div>
                    <Badge className="bg-red-100 text-red-700">Occupied</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">No active tables</p>
            )}
            <Button
              variant="link"
              className="mt-4 w-full"
              onClick={() => navigate('/staff/tables')}
            >
              View All Tables
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
