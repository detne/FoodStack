/**
 * Debug Token Component
 * Shows current token status for debugging
 */

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export function DebugToken() {
  const { user, isAuthenticated } = useAuth();
  const [tokenInfo, setTokenInfo] = useState<any>(null);

  useEffect(() => {
    const checkToken = () => {
      const token = apiClient.getToken();
      const savedUser = localStorage.getItem('user');
      const refreshToken = localStorage.getItem('refresh_token');

      let payload = null;
      if (token) {
        try {
          payload = JSON.parse(atob(token.split('.')[1]));
        } catch (error) {
          console.error('Failed to decode token:', error);
        }
      }

      setTokenInfo({
        hasToken: !!token,
        tokenLength: token?.length || 0,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token',
        hasUser: !!savedUser,
        hasRefreshToken: !!refreshToken,
        isAuthenticated,
        userEmail: user?.email || 'No user',
        payload,
      });
    };

    checkToken();
    // Update every second to catch changes
    const interval = setInterval(checkToken, 1000);
    return () => clearInterval(interval);
  }, [user, isAuthenticated]);

  const handleClearAll = () => {
    console.log('[DebugToken] Clearing all localStorage and redirecting to login...');
    localStorage.clear();
    window.location.href = '/login';
  };

  const handleCheckConsole = () => {
    const token = localStorage.getItem('access_token');
    console.log('=== TOKEN DEBUG ===');
    console.log('Token:', token);
    console.log('Token length:', token?.length || 0);
    console.log('User:', localStorage.getItem('user'));
    console.log('Refresh token:', localStorage.getItem('refresh_token'));
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token payload:', payload);
        console.log('Has restaurantId:', !!payload.restaurantId);
        console.log('restaurantId value:', payload.restaurantId);
      } catch (error) {
        console.error('Failed to decode token:', error);
      }
    }
    console.log('==================');
  };

  if (!tokenInfo) return null;

  return (
    <Card className="fixed bottom-4 right-4 w-96 z-50 shadow-lg border-2 border-purple-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          🔍 Debug Token
          <Badge variant={tokenInfo.hasToken ? 'default' : 'destructive'}>
            {tokenInfo.hasToken ? 'Has Token' : 'No Token'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        <div className="flex justify-between">
          <strong>Authenticated:</strong>
          <span>{tokenInfo.isAuthenticated ? '✅ Yes' : '❌ No'}</span>
        </div>
        <div className="flex justify-between">
          <strong>User:</strong>
          <span className="truncate ml-2">{tokenInfo.userEmail}</span>
        </div>
        <div className="flex justify-between">
          <strong>Token:</strong>
          <span className={tokenInfo.hasToken ? 'text-green-600' : 'text-red-600'}>
            {tokenInfo.hasToken ? '✅' : '❌'} {tokenInfo.tokenPreview}
          </span>
        </div>
        <div className="flex justify-between">
          <strong>Token Length:</strong>
          <span className={tokenInfo.tokenLength > 0 ? 'text-green-600' : 'text-red-600'}>
            {tokenInfo.tokenLength}
          </span>
        </div>
        <div className="flex justify-between">
          <strong>Has Refresh:</strong>
          <span>{tokenInfo.hasRefreshToken ? '✅' : '❌'}</span>
        </div>
        
        {tokenInfo.payload && (
          <div className="border-t pt-2 mt-2 space-y-1">
            <div className="font-bold text-purple-600">Token Payload:</div>
            <div className="flex justify-between">
              <span className="text-gray-600">userId:</span>
              <span className="text-xs font-mono">{tokenInfo.payload.userId?.substring(0, 8)}...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">email:</span>
              <span className="text-xs">{tokenInfo.payload.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">role:</span>
              <span className="text-xs">{tokenInfo.payload.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">restaurantId:</span>
              <span className={tokenInfo.payload.restaurantId ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                {tokenInfo.payload.restaurantId ? '✅ ' + tokenInfo.payload.restaurantId.substring(0, 8) + '...' : '❌ NULL'}
              </span>
            </div>
          </div>
        )}
        
        <div className="flex gap-2 mt-3">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={handleCheckConsole}
          >
            Check Console
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="flex-1"
            onClick={handleClearAll}
          >
            Clear & Logout
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
