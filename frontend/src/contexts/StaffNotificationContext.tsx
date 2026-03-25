/**
 * Staff Notification Context
 * Mock notification system for staff call alerts
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

interface StaffCall {
  id: string;
  tableNumber: string;
  areaName: string;
  branchName: string;
  timestamp: Date;
  read: boolean;
}

interface StaffNotificationContextType {
  calls: StaffCall[];
  unreadCount: number;
  activeAlerts: StaffCall[];
  addCall: (call: Omit<StaffCall, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
  dismissAlert: (id: string) => void;
}

const StaffNotificationContext = createContext<StaffNotificationContextType | undefined>(undefined);

export function StaffNotificationProvider({ children }: { children: React.ReactNode }) {
  const [calls, setCalls] = useState<StaffCall[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<StaffCall[]>([]);

  const addCall = useCallback((call: Omit<StaffCall, 'id' | 'timestamp' | 'read'>) => {
    const newCall: StaffCall = {
      ...call,
      id: `call-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      read: false,
    };
    
    setCalls(prev => [newCall, ...prev]);
    
    // Add to active alerts (will show popup)
    setActiveAlerts(prev => [...prev, newCall]);
    
    // Auto remove from active alerts after 8 seconds
    setTimeout(() => {
      setActiveAlerts(prev => prev.filter(alert => alert.id !== newCall.id));
    }, 8000);
    
    // Play notification sound (optional)
    try {
      const audio = new Audio('/notification.mp3');
      audio.play().catch(() => {
        // Ignore if sound fails
      });
    } catch (error) {
      // Ignore sound errors
    }
  }, []);

  const markAsRead = useCallback((id: string) => {
    setCalls(prev => prev.map(call => 
      call.id === id ? { ...call, read: true } : call
    ));
  }, []);

  const clearAll = useCallback(() => {
    setCalls([]);
    setActiveAlerts([]);
  }, []);

  const dismissAlert = useCallback((id: string) => {
    setActiveAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  const unreadCount = calls.filter(call => !call.read).length;

  return (
    <StaffNotificationContext.Provider value={{ 
      calls, 
      unreadCount, 
      activeAlerts,
      addCall, 
      markAsRead, 
      clearAll,
      dismissAlert 
    }}>
      {children}
    </StaffNotificationContext.Provider>
  );
}

export function useStaffNotifications() {
  const context = useContext(StaffNotificationContext);
  if (!context) {
    throw new Error('useStaffNotifications must be used within StaffNotificationProvider');
  }
  return context;
}
