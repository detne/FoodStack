/**
 * API Test Page
 * Test API connectivity and authentication
 */

import { useState } from 'react';
import { ApiConnectionTest } from '@/components/ApiConnectionTest';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { testLogin } from '@/lib/api-test';
import { Loader2 } from 'lucide-react';

export default function ApiTest() {
  const [email, setEmail] = useState('owner@test.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const { toast } = useToast();

  const handleTestLogin = async () => {
    setIsLoading(true);
    setResponse(null);

    try {
      const result = await testLogin(email, password);
      setResponse(result);
      toast({
        title: 'Login Test Successful',
        description: 'Check console for details',
      });
    } catch (error: any) {
      setResponse({ error: error.message });
      toast({
        title: 'Login Test Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">API Test Page</h1>
          <p className="text-muted-foreground">
            Test backend API connectivity and authentication
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Connection Test */}
          <ApiConnectionTest />

          {/* Login Test */}
          <Card>
            <CardHeader>
              <CardTitle>Login Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test-email">Email</Label>
                <Input
                  id="test-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@test.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="test-password">Password</Label>
                <Input
                  id="test-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="password123"
                />
              </div>

              <Button
                onClick={handleTestLogin}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testing Login...
                  </>
                ) : (
                  'Test Login'
                )}
              </Button>

              {response && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Response:</p>
                  <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-64">
                    {JSON.stringify(response, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Environment Info */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">API Base URL:</span>
                <code className="bg-muted px-2 py-1 rounded">
                  {import.meta.env.VITE_API_BASE_URL || 'Not set'}
                </code>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Environment:</span>
                <code className="bg-muted px-2 py-1 rounded">
                  {import.meta.env.MODE}
                </code>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dev Mode:</span>
                <code className="bg-muted px-2 py-1 rounded">
                  {import.meta.env.DEV ? 'Yes' : 'No'}
                </code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">1. Start Backend Server</h3>
              <code className="text-xs bg-muted px-2 py-1 rounded block">
                npm run dev
              </code>
              <p className="text-sm text-muted-foreground mt-1">
                Backend should be running on http://localhost:3000
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-2">2. Test Connection</h3>
              <p className="text-sm text-muted-foreground">
                Click "Test Connection" to verify backend is accessible
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-2">3. Test Login</h3>
              <p className="text-sm text-muted-foreground">
                Use test credentials to verify authentication works
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-2">4. Check Console</h3>
              <p className="text-sm text-muted-foreground">
                Open browser DevTools (F12) to see detailed logs
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
