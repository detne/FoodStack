/**
 * Manager Menu Management Page
 * Limited menu management for branch managers
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ManagerMenuManagement from '@/components/manager/MenuManagement';

export default function ManagerMenuPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has manager role
    const userRole = localStorage.getItem('user_role');
    if (!['owner', 'manager', 'staff'].includes(userRole || '')) {
      navigate('/dashboard');
      return;
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <ManagerMenuManagement />
      </div>
    </div>
  );
}