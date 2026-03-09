/**
 * Reservation List
 * Quản lý đặt bàn
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Search, 
  Plus,
  Calendar,
  Eye
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock reservations
const mockReservations = [
  {
    id: '1',
    guest: 'Alice Johnson',
    date: '2024-03-10',
    time: '19:00',
    pax: 4,
    branch: 'Main Branch',
    status: 'confirmed',
    phone: '+1234567890',
  },
  {
    id: '2',
    guest: 'Bob Smith',
    date: '2024-03-10',
    time: '20:00',
    pax: 2,
    branch: 'Main Branch',
    status: 'pending',
    phone: '+1234567891',
  },
  {
    id: '3',
    guest: 'Carol White',
    date: '2024-03-11',
    time: '18:30',
    pax: 6,
    branch: 'VIP Lounge',
    status: 'confirmed',
    phone: '+1234567892',
  },
];

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Confirmed', color: 'bg-green-100 text-green-700' },
  completed: { label: 'Completed', color: 'bg-blue-100 text-blue-700' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700' },
};

export default function Reservations() {
  const navigate = useNavigate();
  const [reservations] = useState(mockReservations);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredReservations = reservations.filter((res) => {
    const matchesSearch = res.guest.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || res.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: reservations.length,
    pending: reservations.filter(r => r.status === 'pending').length,
    confirmed: reservations.filter(r => r.status === 'confirmed').length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Reservations</h1>
            <p className="text-muted-foreground mt-1">
              Manage table reservations
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/reservations/calendar')}>
              <Calendar className="w-4 h-4 mr-2" />
              Calendar View
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Reservation
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Reservations</p>
              <p className="text-2xl font-bold mt-1">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold mt-1 text-yellow-600">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Confirmed</p>
              <p className="text-2xl font-bold mt-1 text-green-600">{stats.confirmed}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Table */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search guest name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium">Guest</th>
                    <th className="text-left p-4 font-medium">Date & Time</th>
                    <th className="text-left p-4 font-medium">Party Size</th>
                    <th className="text-left p-4 font-medium">Branch</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-center p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReservations.map((res) => (
                    <tr key={res.id} className="border-t hover:bg-muted/50">
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{res.guest}</p>
                          <p className="text-sm text-muted-foreground">{res.phone}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{res.date}</p>
                          <p className="text-sm text-muted-foreground">{res.time}</p>
                        </div>
                      </td>
                      <td className="p-4">{res.pax} guests</td>
                      <td className="p-4">{res.branch}</td>
                      <td className="p-4">
                        <Badge className={statusConfig[res.status as keyof typeof statusConfig].color}>
                          {statusConfig[res.status as keyof typeof statusConfig].label}
                        </Badge>
                      </td>
                      <td className="p-4 text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/reservations/${res.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
