/**
 * Branding Management
 * Customize branch appearance and themes
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Palette } from 'lucide-react';

export default function Branding() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <Palette className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Branding</h1>
            <p className="text-muted-foreground">Customize your branch appearance</p>
          </div>
        </div>
      </div>

      {/* Coming Soon */}
      <Card>
        <CardHeader>
          <CardTitle>Branding Customization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Palette className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
            <p className="text-muted-foreground mb-4">
              Branding customization features are currently under development.
            </p>
            <Button disabled>
              Customize Branding
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}