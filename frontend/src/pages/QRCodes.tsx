/**
 * QR Code Hub
 * Quản lý QR codes cho tables với customization
 */

import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Download, 
  Printer,
  Edit,
  QrCode,
  Palette,
  Image as ImageIcon
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';

// Mock QR codes
const mockQRCodes = [
  { id: '1', table: 'T01', area: 'Main Dining', url: 'https://qr.foodstack.com/t01' },
  { id: '2', table: 'T02', area: 'Main Dining', url: 'https://qr.foodstack.com/t02' },
  { id: '3', table: 'T03', area: 'Main Dining', url: 'https://qr.foodstack.com/t03' },
  { id: '4', table: 'P01', area: 'Patio', url: 'https://qr.foodstack.com/p01' },
  { id: '5', table: 'P02', area: 'Patio', url: 'https://qr.foodstack.com/p02' },
  { id: '6', table: 'V01', area: 'VIP Lounge', url: 'https://qr.foodstack.com/v01' },
];

export default function QRCodes() {
  const [foregroundColor, setForegroundColor] = useState('#7C3AED');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [dpi, setDpi] = useState([300]);
  const [logoUrl, setLogoUrl] = useState('');

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">QR Code Hub</h1>
            <p className="text-muted-foreground mt-1">
              Generate and customize QR codes for tables
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Printer className="w-4 h-4 mr-2" />
              Print Labels
            </Button>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Download All
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Customization Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Customization
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label>Foreground Color</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          type="color"
                          value={foregroundColor}
                          onChange={(e) => setForegroundColor(e.target.value)}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={foregroundColor}
                          onChange={(e) => setForegroundColor(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Background Color</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          type="color"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Logo URL (Optional)</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          placeholder="https://..."
                          value={logoUrl}
                          onChange={(e) => setLogoUrl(e.target.value)}
                        />
                        <Button size="icon" variant="outline">
                          <ImageIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label>DPI Quality: {dpi[0]}</Label>
                      <Slider
                        value={dpi}
                        onValueChange={setDpi}
                        min={72}
                        max={600}
                        step={1}
                        className="mt-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>72 (Screen)</span>
                        <span>300 (Print)</span>
                        <span>600 (High)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button className="w-full" variant="outline">
                    Reset to Default
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* QR Codes Grid */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {mockQRCodes.map((qr) => (
                <Card key={qr.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="aspect-square bg-white rounded-lg border-2 mb-3 flex items-center justify-center relative">
                      <QrCode 
                        className="h-32 w-32" 
                        style={{ color: foregroundColor }}
                      />
                      {logoUrl && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 bg-white rounded-lg shadow-lg flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-gray-400" />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <h3 className="font-semibold">{qr.table}</h3>
                        <p className="text-xs text-muted-foreground">{qr.area}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
