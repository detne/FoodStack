/**
 * Staff Call Alert - Popup notification
 * Displays on screen for 8 seconds when customer calls staff
 */

import { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StaffCall {
  id: string;
  tableNumber: string;
  areaName: string;
  branchName: string;
  timestamp: Date;
}

interface StaffCallAlertProps {
  call: StaffCall;
  onDismiss: (id: string) => void;
}

export function StaffCallAlert({ call, onDismiss }: StaffCallAlertProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 10);

    // Auto dismiss after 8 seconds
    const dismissTimer = setTimeout(() => {
      handleDismiss();
    }, 8000);

    return () => clearTimeout(dismissTimer);
  }, []);

  const handleDismiss = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onDismiss(call.id);
    }, 300);
  };

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 w-96 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl shadow-2xl overflow-hidden transition-all duration-300 transform",
        isVisible && !isLeaving ? "translate-x-0 opacity-100 scale-100" : "translate-x-full opacity-0 scale-95"
      )}
      style={{
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)'
      }}
    >
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 opacity-0 animate-pulse" />
      
      {/* Progress bar */}
      <div className="absolute top-0 left-0 h-1 bg-white/30 w-full">
        <div 
          className="h-full bg-white"
          style={{
            animation: 'progress 8s linear forwards'
          }}
        />
      </div>

      <div className="relative p-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center animate-bounce">
              <Bell className="w-7 h-7 text-white" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
              🔔 Khách gọi nhân viên!
            </h3>
            <div className="space-y-1.5 text-white/95">
              <p className="font-bold text-lg">
                Bàn {call.tableNumber}
              </p>
              <p className="text-base">📍 {call.areaName}</p>
              <p className="text-sm text-white/80">{call.branchName}</p>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 w-9 h-9 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}

interface StaffCallAlertsContainerProps {
  calls: StaffCall[];
  onDismiss: (id: string) => void;
}

export function StaffCallAlertsContainer({ calls, onDismiss }: StaffCallAlertsContainerProps) {
  return (
    <div className="fixed top-0 right-0 z-50 pointer-events-none">
      <div className="pointer-events-auto space-y-3 p-4">
        {calls.map((call, index) => (
          <div
            key={call.id}
            style={{
              transform: `translateY(${index * 10}px)`,
              zIndex: 50 - index,
            }}
          >
            <StaffCallAlert call={call} onDismiss={onDismiss} />
          </div>
        ))}
      </div>
    </div>
  );
}
