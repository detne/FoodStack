/**
 * Staff Notification Bell Component
 * Displays notification icon with badge for staff calls
 */

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useStaffNotifications } from '@/contexts/StaffNotificationContext';
import { cn } from '@/lib/utils';

export function StaffNotificationBell() {
  const { calls, unreadCount, markAsRead, clearAll } = useStaffNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <h3 className="font-semibold">Thông báo gọi nhân viên</h3>
          {calls.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearAll}
              className="text-xs h-auto py-1"
            >
              Xóa tất cả
            </Button>
          )}
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {calls.length === 0 ? (
            <div className="px-4 py-8 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p className="text-sm">Chưa có thông báo nào</p>
            </div>
          ) : (
            calls.map((call) => (
              <DropdownMenuItem
                key={call.id}
                className={cn(
                  "px-4 py-3 cursor-pointer flex flex-col items-start gap-1",
                  !call.read && "bg-blue-50 dark:bg-blue-950"
                )}
                onClick={() => markAsRead(call.id)}
              >
                <div className="flex items-start justify-between w-full">
                  <div className="flex-1">
                    <p className="font-semibold text-sm">
                      🔔 Khách gọi nhân viên
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      <span className="font-medium">Bàn {call.tableNumber}</span>
                      {' • '}
                      <span>{call.areaName}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {call.branchName}
                    </p>
                  </div>
                  {!call.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatTime(call.timestamp)}
                </p>
              </DropdownMenuItem>
            ))
          )}
        </div>
        
        {calls.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="px-4 py-2 text-center">
              <Button 
                variant="link" 
                size="sm" 
                className="text-xs"
                onClick={() => setIsOpen(false)}
              >
                Đóng
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
