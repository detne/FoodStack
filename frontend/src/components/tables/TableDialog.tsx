/**
 * Table Dialog Component
 * For creating and editing tables
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface Table {
  id: string;
  table_number: string;
  capacity: number;
  status: string;
  area_id: string;
}

interface Area {
  id: string;
  name: string;
  description?: string;
}

interface TableDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  table?: Table | null;
  areas: Area[];
  existingTables: Table[];
  mode: 'create' | 'edit';
}

export default function TableDialog({
  isOpen,
  onClose,
  onSave,
  table,
  areas,
  existingTables,
  mode
}: TableDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    table_number: '',
    capacity: '',
    area_id: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (table && mode === 'edit') {
      setFormData({
        table_number: table.table_number,
        capacity: table.capacity.toString(),
        area_id: table.area_id
      });
    } else if (mode === 'create') {
      // Auto-generate table number
      const existingNumbers = existingTables.map(t => {
        const match = t.table_number.match(/Table (\d+)/);
        return match ? parseInt(match[1]) : 0;
      });
      const nextNumber = Math.max(0, ...existingNumbers) + 1;
      
      setFormData({
        table_number: `Table ${nextNumber}`,
        capacity: '4',
        area_id: areas.length > 0 ? areas[0].id : ''
      });
    }
  }, [table, mode, areas, existingTables, isOpen]);

  const validateForm = () => {
    if (!formData.table_number.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Table number is required',
        variant: 'destructive'
      });
      return false;
    }

    if (!formData.area_id) {
      toast({
        title: 'Validation Error',
        description: 'Please select an area',
        variant: 'destructive'
      });
      return false;
    }

    const capacity = parseInt(formData.capacity);
    if (!capacity || capacity < 1 || capacity > 20) {
      toast({
        title: 'Validation Error',
        description: 'Capacity must be between 1 and 20',
        variant: 'destructive'
      });
      return false;
    }

    // Check for duplicate table numbers in the same area
    const duplicateTable = existingTables.find(t => 
      t.table_number.toLowerCase() === formData.table_number.toLowerCase() &&
      t.area_id === formData.area_id &&
      t.id !== table?.id
    );

    if (duplicateTable) {
      toast({
        title: 'Validation Error',
        description: 'A table with this number already exists in this area',
        variant: 'destructive'
      });
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await onSave({
        table_number: formData.table_number.trim(),
        capacity: parseInt(formData.capacity),
        area_id: formData.area_id
      });
      onClose();
    } catch (error) {
      console.error('Error saving table:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add New Table' : 'Edit Table'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="table_number">Table Number *</Label>
            <Input
              id="table_number"
              value={formData.table_number}
              onChange={(e) => setFormData({ ...formData, table_number: e.target.value })}
              placeholder="Table 1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="area">Area *</Label>
            <Select 
              value={formData.area_id} 
              onValueChange={(value) => setFormData({ ...formData, area_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an area" />
              </SelectTrigger>
              <SelectContent>
                {areas.map((area) => (
                  <SelectItem key={area.id} value={area.id}>
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">Capacity (guests) *</Label>
            <Input
              id="capacity"
              type="number"
              min="1"
              max="20"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              placeholder="4"
            />
          </div>

          {mode === 'create' && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> A QR code will be automatically generated for this table after creation.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {mode === 'create' ? 'Create Table' : 'Update Table'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}