/**
 * API Connection Test Component
 * Shows API connection status and allows testing
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Loader2, RefreshCw } from 'lucide-react';

export function ApiConnectionTest() {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [apiUrl, setApiUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setApiUrl(import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1');
  }, []);

  const testConnection = async () => {
    setStatus('testing');
    setErrorMessage('');

    try {
      const baseUrl = apiUrl.replace('/api/v1', '');
      const response = await fetch(`${baseUrl}/health`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ API Health Check:', data);
      setStatus('success');
    } catch (error: any) {
      console.error('❌ API Connection Failed:', error);
      setErrorMessage(error.message || 'Connection failed');
      setStatus('error');
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>API Connection</span>
          {status === 'success' && (
            <Badge variant="default" className="bg-green-500">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Connected
            </Badge>
          )}
          {status === 'error' && (
            <Badge variant="destructive">
              <XCircle className="w-3 h-3 mr-1" />
              Failed
            </Badge>
          )}
          {status === 'testing' && (
            <Badge variant="secondary">
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Testing...
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">API Base URL:</p>
          <code className="text-xs bg-muted px-2 py-1 rounded block break-all">
            {apiUrl}
          </code>
        </div>

        {errorMessage && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <p className="text-sm text-destructive">{errorMessage}</p>
          </div>
        )}

        <Button
          onClick={testConnection}
          disabled={status === 'testing'}
          className="w-full"
        >
          {status === 'testing' ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Testing Connection...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Test Connection
            </>
          )}
        </Button>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>💡 Tips:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Make sure backend server is running on port 3000</li>
            <li>Check VITE_API_BASE_URL in frontend/.env</li>
            <li>Open browser console for detailed logs</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
