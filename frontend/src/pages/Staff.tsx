/**
 * Staff Management
 * Manage staff members in your restaurant
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  Plus,
  Download,
  Eye,
  Users,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface StaffMember {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: {
    name: string;
  };
  branch?: {
    id: string;
    name: string;
    address: string;
  };
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
}

const roleColors = {
  RESTAURANT_OWNER: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  MANAGER: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  STAFF: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  RECEPTIONIST: 'bg-green-500/10 text-green-600 border-green-500/20',
};

const roleLabels = {
  RESTAURANT_OWNER: 'Owner',
  MANAGER: 'Manager',
  STAFF: 'Staff',
  RECEPTIONIST: 'Receptionist',
};

export default function Staff() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Data states
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');

  // Fetch staff on mount
  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('access_token');
      
      // Build query params
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      params.append('limit', '100'); // Get all staff
      
      const response = await fetch(`http://localhost:3000/api/v1/staff?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setStaff(data.data.items || data.data);
        }
      } else {
        throw new Error('Failed to fetch staff');
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load staff members',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Refetch when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStaff();
    }, 300); // Debounce
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter]);

  const filteredStaff = staff.filter((member) => {
    const matchesRole = roleFilter === 'all' || member.role.name === roleFilter;
    const matchesBranch = branchFilter === 'all' || member.branch?.id === branchFilter;
    return matchesRole && matchesBranch;
  });

  // Get unique branches for filter
  const branches = Array.from(new Set(staff.map(s => s.branch).filter(Boolean)));

  const stats = {
    total: staff.length,
    active: staff.filter(s => s.status === 'ACTIVE').length,
    inactive: staff.filter(s => s.status === 'INACTIVE').length,
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
        <div className="grid gap-6">
          <div className="h-96 bg-muted rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage staff members in your restaurant
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button onClick={() => navigate('/staff/create')} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Staff Account
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20 animate-in slide-in-from-bottom duration-500">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Staff</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20 animate-in slide-in-from-bottom duration-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Shifts</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20 animate-in slide-in-from-bottom duration-900">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Approvals</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.inactive}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="animate-in slide-in-from-bottom duration-500">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="RESTAURANT_OWNER">Owner</SelectItem>
                <SelectItem value="MANAGER">Manager</SelectItem>
                <SelectItem value="STAFF">Staff</SelectItem>
                <SelectItem value="RECEPTIONIST">Receptionist</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={branchFilter} onValueChange={setBranchFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Branches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {branches.map((branch: any) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.address}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Staff Accounts */}
      <Card className="animate-in slide-in-from-bottom duration-700">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-6">Staff Accounts</h2>
          {filteredStaff.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-50 text-muted-foreground" />
              <p className="text-muted-foreground text-lg">No staff accounts found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium">Name</th>
                    <th className="text-left p-4 font-medium">Role</th>
                    <th className="text-left p-4 font-medium">Branch</th>
                    <th className="text-left p-4 font-medium">Joined Date</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-center p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map((member) => (
                    <tr key={member.id} className="border-t hover:bg-muted/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {member.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{member.full_name}</p>
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={`${roleColors[member.role.name as keyof typeof roleColors]} border`}>
                          {roleLabels[member.role.name as keyof typeof roleLabels] || member.role.name}
                        </Badge>
                      </td>
                      <td className="p-4">{member.branch?.address || 'N/A'}</td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(member.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <Badge 
                          variant={member.status === 'ACTIVE' ? 'default' : 'secondary'}
                          className={member.status === 'ACTIVE' ? 'bg-green-500/10 text-green-600 border-green-500/20' : ''}
                        >
                          {member.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/staff/${member.id}`)}
                          className="hover:bg-primary/10 hover:text-primary hover:border-primary transition-all"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
