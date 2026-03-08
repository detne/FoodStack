/**
 * General Settings
 * Cấu hình global: timezone, language, currency, tax
 */

import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    timezone: 'America/New_York',
    language: 'en',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    taxRate: '10',
    serviceCharge: '5',
    maintenanceMode: false,
    betaFeatures: false,
  });

  const handleSave = () => {
    toast({
      title: 'Settings saved',
      description: 'Your settings have been updated successfully',
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold">General Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure global system settings
          </p>
        </div>

        {/* Localization */}
        <Card>
          <CardHeader>
            <CardTitle>Localization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select value={settings.timezone} onValueChange={(v) => setSettings({...settings, timezone: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                    <SelectItem value="Europe/London">London (GMT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Language</Label>
                <Select value={settings.language} onValueChange={(v) => setSettings({...settings, language: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="vi">Tiếng Việt</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={settings.currency} onValueChange={(v) => setSettings({...settings, currency: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="VND">VND (₫)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date Format</Label>
                <Select value={settings.dateFormat} onValueChange={(v) => setSettings({...settings, dateFormat: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Operational Defaults */}
        <Card>
          <CardHeader>
            <CardTitle>Operational Defaults</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Default Tax Rate (%)</Label>
                <Input
                  type="number"
                  value={settings.taxRate}
                  onChange={(e) => setSettings({...settings, taxRate: e.target.value})}
                  placeholder="10"
                />
              </div>

              <div className="space-y-2">
                <Label>Service Charge (%)</Label>
                <Input
                  type="number"
                  value={settings.serviceCharge}
                  onChange={(e) => setSettings({...settings, serviceCharge: e.target.value})}
                  placeholder="5"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Modes */}
        <Card>
          <CardHeader>
            <CardTitle>System Modes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Maintenance Mode</p>
                <p className="text-sm text-muted-foreground">
                  Temporarily disable customer access
                </p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(v) => setSettings({...settings, maintenanceMode: v})}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Beta Features</p>
                <p className="text-sm text-muted-foreground">
                  Enable experimental features
                </p>
              </div>
              <Switch
                checked={settings.betaFeatures}
                onCheckedChange={(v) => setSettings({...settings, betaFeatures: v})}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 sticky bottom-6 bg-background/95 backdrop-blur p-4 rounded-lg border">
          <Button variant="outline" className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1">
            Save Settings
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
