/**
 * Branch Edit Page
 * Edit existing branch information
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Store, MapPin, Phone, Clock, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';
import { toast } from '@/components/ui/use-toast';

interface Branch {
  id: string;
  name: string;
  address: string;
  phone?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface BranchEditProps {
  branchId?: string;
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function BranchEdit({ branchId, isOpen = true, onClose, onSuccess }: BranchEditProps) {
  const navigate = useNavigate();
  const params = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  
  const currentBranchId = branchId || params.branchId;
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
  });

  const [businessHours, setBusinessHours] = useState({
    open: { hour: 8, minute: 0, period: 'AM' },
    close: { hour: 10, minute: 0, period: 'PM' },
  });

  useEffect(() => {
    if (currentBranchId) {
      fetchBranchDetails();
    }
  }, [currentBranchId]);

  const fetchBranchDetails = async () => {
    try {
      setFetchLoading(true);
      console.log('Fetching branch details for:', currentBranchId);
      
      const response = await apiClient.getBranch(currentBranchId);
      
      if (response.success && response.data) {
        const branch = response.data;
        setFormData({
          name: branch.name || '',
          address: branch.address || '',
          phone: branch.phone || '',
        });
      } else {
        throw new Error(response.message || 'Failed to fetch branch details');
      }
    } catch (error: any) {
      console.error('Error fetching branch details:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load branch details",
        variant: "destructive",
      });
    } finally {
      setFetchLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTimeChange = (type: 'open' | 'close', field: 'hour' | 'minute' | 'period', value: string | number) => {
    setBusinessHours(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.address) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      const updateData = {
        name: formData.name,
        address: formData.address,
        phone: formData.phone || null,
      };

      console.log('Updating branch with data:', updateData);
      
      const response = await apiClient.updateBranch(currentBranchId!, updateData);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Branch updated successfully!",
        });
        
        if (onSuccess) {
          onSuccess();
        }
        
        if (onClose) {
          onClose();
        } else {
          navigate('/owner/overview');
        }
      } else {
        throw new Error(response.message || 'Failed to update branch');
      }
    } catch (error: any) {
      console.error('Error updating branch:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update branch",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/owner/overview');
    }
  };

  const content = (
    <div className="space-y-6">
      {fetchLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Branch Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Branch Name *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Main Branch, Downtown Location"
              className="w-full"
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Address *
            </Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Enter full address including street, district, city"
              rows={3}
              className="w-full"
            />
          </div>

          {/* Phone & Email Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="e.g., +1 234 567 8900"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email (read)
              </Label>
              <Input
                id="email"
                value="downtown@restaurant.com"
                disabled
                className="w-full bg-gray-50"
              />
            </div>
          </div>

          {/* Business Hours */}
          <div className="space-y-4">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Business Hours
            </Label>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm">Open:</span>
                <select 
                  value={businessHours.open.hour}
                  onChange={(e) => handleTimeChange('open', 'hour', parseInt(e.target.value))}
                  className="border rounded px-2 py-1 text-sm"
                >
                  {Array.from({length: 12}, (_, i) => i + 1).map(hour => (
                    <option key={hour} value={hour}>{hour}</option>
                  ))}
                </select>
                <span>:</span>
                <select 
                  value={businessHours.open.minute}
                  onChange={(e) => handleTimeChange('open', 'minute', parseInt(e.target.value))}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value={0}>00</option>
                  <option value={30}>30</option>
                </select>
                <select 
                  value={businessHours.open.period}
                  onChange={(e) => handleTimeChange('open', 'period', e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>

              <span className="text-sm text-gray-500">-</span>

              <div className="flex items-center gap-2">
                <span className="text-sm">Close:</span>
                <select 
                  value={businessHours.close.hour}
                  onChange={(e) => handleTimeChange('close', 'hour', parseInt(e.target.value))}
                  className="border rounded px-2 py-1 text-sm"
                >
                  {Array.from({length: 12}, (_, i) => i + 1).map(hour => (
                    <option key={hour} value={hour}>{hour}</option>
                  ))}
                </select>
                <span>:</span>
                <select 
                  value={businessHours.close.minute}
                  onChange={(e) => handleTimeChange('close', 'minute', parseInt(e.target.value))}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value={0}>00</option>
                  <option value={30}>30</option>
                </select>
                <select 
                  value={businessHours.close.period}
                  onChange={(e) => handleTimeChange('close', 'period', e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
            
            <p className="text-xs text-gray-500">
              Times are in 5-minute increments. Closing time must be after opening time.
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-orange-600 hover:bg-orange-700"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                'Update Branch'
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );

  // If used as a dialog
  if (onClose) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Store className="w-5 h-5" />
                Edit Branch
              </DialogTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Update branch information
            </p>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  // If used as a full page
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/owner/overview')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Overview
          </Button>
        </div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Edit Branch</h1>
          <p className="text-muted-foreground mt-2">
            Update branch information
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="w-5 h-5" />
              Branch Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            {content}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}