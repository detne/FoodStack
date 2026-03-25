/**
 * Test Subscription Display
 */

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function TestSubscription() {
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      console.log('Fetching subscription...');
      
      const response = await apiClient.getCurrentSubscription();
      console.log('Full response:', response);
      console.log('Response.data:', response.data);
      
      if (response.success && response.data) {
        console.log('Setting subscription:', response.data);
        setSubscription(response.data);
      } else {
        setError('No subscription data');
      }
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>;
  }

  if (!subscription) {
    return <div className="p-8">No subscription found</div>;
  }

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Subscription Test</h1>
      
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">Raw Data:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(subscription, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">Parsed Data:</h2>
          <div className="space-y-2">
            <p><strong>Plan Type:</strong> {subscription.plan_type}</p>
            <p><strong>Plan Type (uppercase):</strong> {subscription.plan_type?.toUpperCase()}</p>
            <p><strong>Status:</strong> {subscription.status}</p>
            <p><strong>Max Branches:</strong> {subscription.max_branches}</p>
            <p><strong>Max Tables:</strong> {subscription.max_tables}</p>
            <p><strong>End Date:</strong> {new Date(subscription.end_date).toLocaleDateString('vi-VN')}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">Condition Tests:</h2>
          <div className="space-y-2">
            <p><strong>Is FREE?</strong> {subscription.plan_type?.toUpperCase() === 'FREE' ? 'Yes' : 'No'}</p>
            <p><strong>Is PRO?</strong> {subscription.plan_type?.toUpperCase() === 'PRO' ? 'Yes' : 'No'}</p>
            <p><strong>Is VIP?</strong> {subscription.plan_type?.toUpperCase() === 'VIP' ? 'Yes' : 'No'}</p>
            <p><strong>Is ACTIVE?</strong> {subscription.status === 'ACTIVE' ? 'Yes' : 'No'}</p>
          </div>
        </CardContent>
      </Card>

      <Card className={`border-2 ${
        subscription.plan_type?.toUpperCase() === 'FREE' 
          ? 'border-amber-200 bg-amber-50/80' 
          : subscription.plan_type?.toUpperCase() === 'PRO'
          ? 'border-blue-200 bg-blue-50/80'
          : 'border-purple-200 bg-purple-50/80'
      }`}>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">Visual Test:</h2>
          <div className="flex items-center gap-3">
            <Badge variant={subscription.status === 'ACTIVE' ? 'default' : 'secondary'}>
              {subscription.status}
            </Badge>
            <span className="font-bold">Gói {subscription.plan_type?.toUpperCase()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
