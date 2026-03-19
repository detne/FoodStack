/**
 * Owner Menu Management Page
 * Full menu management capabilities for restaurant owners
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OwnerMenuManagement from '@/components/owner/MenuManagement';

export default function OwnerMenuPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has owner role
    const userRole = localStorage.getItem('user_role');
    if (userRole !== 'owner') {
      navigate('/dashboard');
      return;
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <OwnerMenuManagement />
      </div>
    </div>
  );
}