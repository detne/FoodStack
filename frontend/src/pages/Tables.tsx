/**
 * Table Management Suite
 * Quản lý trạng thái bàn với detail panel
 */

import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Search, 
  Users,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Utensils
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data
const mockTables = [
  {
    id: '1',
    number: 'T01',
    area: 'Main Dining',
    status: 'occupied',
    capacity: 4,
    seated: 4,
    seatedTime: '45 min',
    revenue: 125.50,
    server: 'John Doe',
  },
  {
    id: '2',
    number: 'T02',
    area: 'Main Dining',
    status: 'available',
    capacity: 2,
    seated: 0,
    seatedTime: null,
    revenue: 0,
    server: null,
  },
  {
    id: '3',
    number: 'T03',
    area: 'Main Dining',
    status: 'reserved',
    capacity: 6,
    seated: 0,
    seatedTime: null,
    revenue: 0,
    server: 'Jane Smith',
    reservedFor: '7:30 PM',
  },
  {
    id: '4',
    number: 'T04',
    area: 'Main Dining',
    status: 'dirty',
    capacity: 4,
    seated: 0,
    seatedTime: null,
    revenue: 0,
    server: null,
  },
  {
    id: '5',
    number: 'P01',
    area: 'Patio',
    status: 'occupied',
    capacity: 4,
    seated: 3,
    seatedTime: '20 min',
    revenue: 78.00,
    server: 'Mike Johnson',
  },
  {
    id: '6',
    number: 'P02',
    area: 'Patio',
    status: 'available',
    capacity: 2,
    seated: 0,
    seatedTime: null,
    revenue: 0,
    server: null,
  },
];

const statusConfig = {
  occupied: {
    label: 'Occupied',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: Users,
  },
  available: {
    label: 'Available',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: CheckCircle,
  },
  reserved: {
    label: 'Reserved',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: Clock,
  },
  dirty: {
    label: 'Needs Cleaning',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: AlertCircle,
  },
};

export default function Tables() {
  const [tables, setTables] = useState(mockTables);
  const [selectedTable, setSelectedTable] = useState<typeof mockTables[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('all');

  const areas = ['all', ...Array.from(new Set(tables.map(t => t.area)))];

  const filteredTables = tables.filter((table) => {
    const matchesSearch = table.number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesArea = selectedArea === 'all' || table.area === selectedArea;
    return matchesSearch && matchesArea;
  });

  const stats = {
    total: tables.length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    available: tables.filter(t => t.status === 'available').length,
    reserved: tables.filter(t => t.status === 'reserved').length,
  };

  const handleCheckout = (tableId: string) => {
    setTables(tables.map(t => 
      t.id === tableId ? { ...t, status: 'dirty', seated: 0, seatedTime: null, revenue: 0 } : t
    ));
    setSelectedTable(null);
  };

  const handleMarkClean = (tableId: string) => {
    setTables(tables.map(t => 
      t.id === tableId ? { ...t, status: 'available' } : t
    ));
    setSelectedTable(null);
  };

  const handleAssign = (tableId: string) => {
    setTables(tables.map(t => 
      t.id === tableId ? { ...t, status: 'occupied', seated: t.capacity, seatedTime: '0 min' } : t
    ));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Table Management</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage table status
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Tables</p>
              <p className="text-2xl font-bold mt-1">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Occupied</p>
              <p className="text-2xl font-bold mt-1 text-red-600">{stats.occupied}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Available</p>
              <p className="text-2xl font-bold mt-1 text-green-600">{stats.available}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Reserved</p>
              <p className="text-2xl font-bold mt-1 text-blue-600">{stats.reserved}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tables Grid */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filters */}
            <div className="flex gap-4">
              <Tabs value={selectedArea} onValueChange={setSelectedArea} className="flex-1">
                <TabsList>
                  {areas.map((area) => (
                    <TabsTrigger key={area} value={area} className="capitalize">
                      {area === 'all' ? 'All Areas' : area}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search tables..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Table Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredTables.map((table) => {
                const config = statusConfig[table.status as keyof typeof statusConfig];
                const Icon = config.icon;
                
                return (
                  <Card
                    key={table.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedTable?.id === table.id ? 'ring-2 ring-purple-500' : ''
                    }`}
                    onClick={() => setSelectedTable(table)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-lg">{table.number}</h3>
                          <p className="text-xs text-muted-foreground">{table.area}</p>
                        </div>
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      
                      <Badge className={`${config.color} border mb-3`}>
                        {config.label}
                      </Badge>

                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <span>{table.seated}/{table.capacity}</span>
                        </div>
                        {table.seatedTime && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span>{table.seatedTime}</span>
                          </div>
                        )}
                        {table.revenue > 0 && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-3 w-3 text-muted-foreground" />
                            <span>${table.revenue.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Table Details</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedTable ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold">{selectedTable.number}</h3>
                      <p className="text-sm text-muted-foreground">{selectedTable.area}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <Badge className={statusConfig[selectedTable.status as keyof typeof statusConfig].color}>
                          {statusConfig[selectedTable.status as keyof typeof statusConfig].label}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Capacity</span>
                        <span className="text-sm font-medium">{selectedTable.capacity} seats</span>
                      </div>
                      {selectedTable.seated > 0 && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Seated</span>
                            <span className="text-sm font-medium">{selectedTable.seated} guests</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Duration</span>
                            <span className="text-sm font-medium">{selectedTable.seatedTime}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Revenue</span>
                            <span className="text-sm font-medium">${selectedTable.revenue.toFixed(2)}</span>
                          </div>
                        </>
                      )}
                      {selectedTable.server && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Server</span>
                          <span className="text-sm font-medium">{selectedTable.server}</span>
                        </div>
                      )}
                      {selectedTable.reservedFor && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Reserved For</span>
                          <span className="text-sm font-medium">{selectedTable.reservedFor}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 pt-4 border-t">
                      {selectedTable.status === 'occupied' && (
                        <>
                          <Button 
                            className="w-full" 
                            onClick={() => handleCheckout(selectedTable.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Checkout
                          </Button>
                          <Button variant="outline" className="w-full">
                            <Utensils className="h-4 w-4 mr-2" />
                            View Order
                          </Button>
                        </>
                      )}
                      {selectedTable.status === 'available' && (
                        <Button 
                          className="w-full"
                          onClick={() => handleAssign(selectedTable.id)}
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Assign Guests
                        </Button>
                      )}
                      {selectedTable.status === 'reserved' && (
                        <Button className="w-full">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Arrived
                        </Button>
                      )}
                      {selectedTable.status === 'dirty' && (
                        <Button 
                          className="w-full"
                          onClick={() => handleMarkClean(selectedTable.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Clean
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Select a table to view details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
