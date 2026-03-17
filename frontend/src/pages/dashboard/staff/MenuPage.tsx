/**
 * Staff Menu Management Page
 * Simple availability management for staff
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffMenuManagement from '@/components/staff/MenuManagement';

export default function StaffMenuPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has appropriate role
    const userRole = localStorage.getItem('user_role');
    if (!['owner', 'manager', 'staff'].includes(userRole || '')) {
      navigate('/dashboard');
      return;
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <StaffMenuManagement />
      </div>
    </div>
  );
}