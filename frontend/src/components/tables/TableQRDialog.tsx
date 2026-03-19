/**
 * Table QR Code Dialog Component
 * Displays and allows downloading of table QR codes
 */

import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Download, Copy, ExternalLink } from 'lucide-react';
import QRCode from 'qrcode';

interface Table {
  id: string;
  table_number: string;
  capacity: number;
  area_id: string;
}

interface TableQRDialogProps {
  isOpen: boolean;
  onClose: () => void;
  table: Table | null;
  branchId: string;
}

export default function TableQRDialog({
  isOpen,
  onClose,
  table,
  branchId
}: TableQRDialogProps) {
  const { toast } = useToast();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const tableUrl = table ? `${window.location.origin}/t/${branchId}/${table.id}` : '';

  useState(() => {
    if (table && isOpen) {
      generateQRCode();
    }
  }, [table, isOpen]);

  const generateQRCode = async () => {
    if (!table) return;

    try {
      const canvas = canvasRef.current;
      if (canvas) {
        await QRCode.toCanvas(canvas, tableUrl, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        
        const dataUrl = canvas.toDataURL('image/png');
        setQrCodeUrl(dataUrl);
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate QR code',
        variant: 'destructive'
      });
    }
  };

  const handleDownload = () => {
    if (!qrCodeUrl || !table) return;

    const link = document.createElement('a');
    link.download = `table-${table.table_number.replace(/\s+/g, '-').toLowerCase()}-qr.png`;
    link.href = qrCodeUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Downloaded',
      description: 'QR code has been downloaded',
    });
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(tableUrl);
      toast({
        title: 'Copied',
        description: 'Table URL copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy URL',
        variant: 'destructive'
      });
    }
  };

  const handleOpenUrl = () => {
    window.open(tableUrl, '_blank');
  };

  if (!table) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            QR Code - {table.table_number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* QR Code Display */}
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
          </div>

          {/* Table Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="font-medium">Table</Label>
                <p>{table.table_number}</p>
              </div>
              <div>
                <Label className="font-medium">Capacity</Label>
                <p>{table.capacity} guests</p>
              </div>
            </div>
          </div>

          {/* Table URL */}
          <div className="space-y-2">
            <Label>Table URL</Label>
            <div className="flex gap-2">
              <Input
                value={tableUrl}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyUrl}
                title="Copy URL"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleOpenUrl}
                title="Open URL"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">How to use:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Print this QR code and place it on the table</li>
              <li>• Customers can scan to view the menu and place orders</li>
              <li>• The QR code links directly to this table</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleDownload} className="gap-2">
            <Download className="h-4 w-4" />
            Download PNG
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}