/**
 * Physical Sections Management
 * Quản lý các khu vực vật lý (Main Dining, Patio, VIP, Bar)
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  MapPin,
  Users,
  Grid3x3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';

// Mock data
const mockAreas = [
  {
    id: '1',
    name: 'Main Dining',
    description: 'Primary dining area with 15 tables',
    active: true,
    tables: 15,
    capacity: 60,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
  },
  {
    id: '2',
    name: 'Patio',
    description: 'Outdoor seating area',
    active: true,
    tables: 8,
    capacity: 32,
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400',
  },
  {
    id: '3',
    name: 'VIP Lounge',
    description: 'Private dining rooms',
    active: true,
    tables: 4,
    capacity: 24,
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
  },
  {
    id: '4',
    name: 'Bar Area',
    description: 'Bar counter and high tables',
    active: false,
    tables: 6,
    capacity: 18,
    image: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=400',
  },
];

export default function Areas() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [areas, setAreas] = useState(mockAreas);
  const [searchQuery, setSearchQuery] = useState('');

  const handleToggleActive = (id: string) => {
    setAreas(areas.map(area => 
      area.id === id ? { ...area, active: !area.active } : area
    ));
    toast({
      title: 'Area status updated',
      description: 'Area status has been changed successfully',
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    
    setAreas(areas.filter(area => area.id !== id));
    toast({
      title: 'Area deleted',
      description: 'Area has been deleted successfully',
    });
  };

  const filteredAreas = areas.filter((area) =>
    area.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Physical Sections</h1>
            <p className="text-muted-foreground mt-1">
              Manage dining areas and sections
            </p>
          </div>
          <Button onClick={() => navigate('/areas/create')}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Area
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <MapPin className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Areas</p>
                  <p className="text-2xl font-bold">{areas.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Grid3x3 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Tables</p>
                  <p className="text-2xl font-bold">
                    {areas.reduce((sum, area) => sum + area.tables, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Capacity</p>
                  <p className="text-2xl font-bold">
                    {areas.reduce((sum, area) => sum + area.capacity, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search areas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Areas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAreas.map((area) => (
            <Card key={area.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48">
                <img
                  src={area.image}
                  alt={area.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3">
                  <Switch
                    checked={area.active}
                    onCheckedChange={() => handleToggleActive(area.id)}
                  />
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{area.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {area.description}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    area.active 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {area.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="flex gap-4 my-3 text-sm">
                  <div className="flex items-center gap-1">
                    <Grid3x3 className="h-4 w-4 text-muted-foreground" />
                    <span>{area.tables} tables</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{area.capacity} seats</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/areas/${area.id}/tables`)}
                  >
                    Manage Tables
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/areas/${area.id}/edit`)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(area.id, area.name)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add New Card */}
          <Card 
            className="border-2 border-dashed hover:border-purple-400 hover:bg-purple-50/50 transition-colors cursor-pointer"
            onClick={() => navigate('/areas/create')}
          >
            <CardContent className="p-6 h-full flex flex-col items-center justify-center text-center min-h-[300px]">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Create New Area</h3>
              <p className="text-sm text-muted-foreground">
                Add a new dining section to your restaurant
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
