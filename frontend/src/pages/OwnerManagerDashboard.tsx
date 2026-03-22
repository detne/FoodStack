/**
 * Owner Manager Dashboard
 * Branch selection page for accessing manager dashboard
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Store, Phone, Mail, Clock } from 'lucide-react';

interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  email: string | null;
  opening_time: string | null;
  closing_time: string | null;
}

export default function OwnerManagerDashboard() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('access_token');
      const userData = localStorage.getItem('user');
      
      if (!token || !userData) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Authentication required',
        });
        return;
      }

      const user = JSON.parse(userData);
      const restaurantId = user?.restaurant?.id;

      if (!restaurantId) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Restaurant information not found',
        });
        return;
      }

      const response = await fetch(
        `http://localhost:3000/api/v1/branches?restaurantId=${restaurantId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch branches');
      }

      const data = await response.json();
      if (data.success && data.data) {
        setBranches(data.data);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load branches',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccessDashboard = (branchId: string) => {
    // Store selected branch and set owner viewing flag
    localStorage.setItem('selected_branch_id', branchId);
    localStorage.setItem('owner_viewing_branch', 'true');
    navigate('/manager/overview');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading branches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Branch Selection</h1>
        <p className="text-muted-foreground mt-2">
          Select a branch to access manager dashboard of the branch
        </p>
      </div>

      {/* Branches Grid */}
      {branches.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Store className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No branches found</h3>
            <p className="text-muted-foreground text-center">
              You don't have any branches yet. Create your first branch to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((branch) => (
            <Card key={branch.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                {/* Branch Icon */}
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
                  <Store className="h-6 w-6 text-primary" />
                </div>

                {/* Branch Name */}
                <h3 className="text-xl font-bold mb-2">{branch.name}</h3>

                {/* Branch Details */}
                <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Phone: {branch.phone || 'No phone'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Email: {branch.email || 'No mail'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>
                      Opening time: {branch.opening_time || 'No opening time'}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>
                      Closing time: {branch.closing_time || 'No closing time'}
                    </span>
                  </div>
                </div>

                {/* Access Button */}
                <Button
                  onClick={() => handleAccessDashboard(branch.id)}
                  className="w-full"
                >
                  Access Manager Dashboard
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
