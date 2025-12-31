'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useParams } from 'next/navigation';
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  X,
  Eye,
  EyeOff,
  Trash2,
  Clock,
  User,
  ExternalLink
} from 'lucide-react';

interface Alert {
  id: string;
  type: 'warning' | 'info' | 'error' | 'success';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  user_id?: string;
  customer_id?: string;
  deal_id?: string;
  is_read: boolean;
  is_dismissed: boolean;
  action_url?: string;
  created_at: string;
  read_at?: string;
}

interface AlertManagerProps {
  maxAlerts?: number;
  showActions?: boolean;
  className?: string;
}

export function AlertManager({ maxAlerts = 5, showActions = true, className = '' }: AlertManagerProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const params = useParams();
  const tenantKey = (params?.tenant_key as string) || '';

  // Utility function to get tenant auth token
  const getTenantToken = () => {
    return document.cookie
      .split('; ')
      .find(row => row.startsWith('tenant_token='))
      ?.split('=')[1];
  };

  useEffect(() => {
    fetchAlerts();
    fetchUnreadCount();
  }, [tenantKey]);

  const fetchAlerts = async () => {
    try {
      const token = getTenantToken();
      const response = await fetch(`/api/${tenantKey}/alerts?action=dashboard&limit=${maxAlerts}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'X-Tenant-Key': tenantKey,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAlerts(data.data);
        }
      }
    } catch (error) {
      console.error('خطا در دریافت هشدارها:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const token = getTenantToken();
      const response = await fetch(`/api/${tenantKey}/alerts?action=count`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'X-Tenant-Key': tenantKey,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUnreadCount(data.data.unread_count);
        }
      }
    } catch (error) {
      console.error('خطا در دریافت تعداد هشدارهای خوانده نشده:', error);
    }
  };

  const markAsRead = async (alertId: string) => {
    try {
      const token = getTenantToken();
      const response = await fetch(`/api/${tenantKey}/alerts`, {
        method: 'PUT',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'X-Tenant-Key': tenantKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'mark_read',
          alert_id: alertId
        })
      });

      if (response.ok) {
        setAlerts(prev => prev.map(alert => 
          alert.id === alertId ? { ...alert, is_read: true } : alert
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
        
        toast({
          title: "موفق",
          description: "هشدار به عنوان خوانده شده علامت‌گذاری شد",
        });
      }
    } catch (error) {
      console.error('خطا در علامت‌گذاری هشدار:', error);
      toast({
        title: "خطا",
        description: "خطا در علامت‌گذاری هشدار",
        variant: "destructive"
      });
    }
  };

  const dismissAlert = async (alertId: string) => {
    try {
      const token = getTenantToken();
      const response = await fetch(`/api/${tenantKey}/alerts`, {
        method: 'PUT',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'X-Tenant-Key': tenantKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'dismiss',
          alert_id: alertId
        })
      });

      if (response.ok) {
        setAlerts(prev => prev.filter(alert => alert.id !== alertId));
        
        toast({
          title: "موفق",
          description: "هشدار رد شد",
        });
      }
    } catch (error) {
      console.error('خطا در رد کردن هشدار:', error);
      toast({
        title: "خطا",
        description: "خطا در رد کردن هشدار",
        variant: "destructive"
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = getTenantToken();
      const response = await fetch(`/api/${tenantKey}/alerts`, {
        method: 'PUT',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'X-Tenant-Key': tenantKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'mark_all_read'
        })
      });

      if (response.ok) {
        setAlerts(prev => prev.map(alert => ({ ...alert, is_read: true })));
        setUnreadCount(0);
        
        toast({
          title: "موفق",
          description: "همه هشدارها به عنوان خوانده شده علامت‌گذاری شدند",
        });
      }
    } catch (error) {
      console.error('خطا در علامت‌گذاری همه هشدارها:', error);
      toast({
        title: "خطا",
        description: "خطا در علامت‌گذاری همه هشدارها",
        variant: "destructive"
      });
    }
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: Alert['priority']) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getPriorityText = (priority: Alert['priority']) => {
    switch (priority) {
      case 'high':
        return 'فوری';
      case 'medium':
        return 'متوسط';
      case 'low':
        return 'کم';
      default:
        return 'متوسط';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return 'همین الان';
    } else if (diffHours < 24) {
      return `${diffHours} ساعت پیش`;
    } else if (diffDays < 7) {
      return `${diffDays} روز پیش`;
    } else {
      return date.toLocaleDateString('fa-IR');
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-destructive/20 bg-destructive/5 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-destructive font-vazir">
          <div className="flex items-center space-x-2 space-x-reverse">
            <AlertTriangle className="h-5 w-5" />
            <span>هشدارهای مهم</span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="font-vazir">
                {unreadCount}
              </Badge>
            )}
          </div>
          {showActions && unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="font-vazir text-xs"
            >
              <CheckCircle className="h-4 w-4 ml-1" />
              همه خوانده شد
            </Button>
          )}
        </CardTitle>
        <CardDescription className="font-vazir">
          هشدارهای سیستم پیگیری فروش
        </CardDescription>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-muted-foreground font-vazir">
              هشداری وجود ندارد
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border transition-all duration-200 ${
                  alert.is_read 
                    ? 'border-gray-200 opacity-75' 
                    : 'border-destructive/20 shadow-sm'
                }`}
              >
                <div className="flex items-start space-x-3 space-x-reverse flex-1">
                  <div className="flex-shrink-0 mt-1">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`font-medium font-vazir text-sm ${
                        alert.is_read ? 'text-muted-foreground' : 'text-foreground'
                      }`}>
                        {alert.title}
                      </h4>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Badge
                          variant={getPriorityColor(alert.priority)}
                          className="font-vazir text-xs"
                        >
                          {getPriorityText(alert.priority)}
                        </Badge>
                        {!alert.is_read && (
                          <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <p className={`text-sm font-vazir mb-2 ${
                      alert.is_read ? 'text-muted-foreground' : 'text-foreground'
                    }`}>
                      {alert.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 space-x-reverse text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span className="font-vazir">{formatDate(alert.created_at)}</span>
                        {alert.customer_id && (
                          <>
                            <User className="h-3 w-3 mr-2" />
                            <span className="font-vazir">مشتری: {alert.customer_id}</span>
                          </>
                        )}
                      </div>
                      {showActions && (
                        <div className="flex items-center space-x-1 space-x-reverse">
                          {alert.customer_id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => window.open(`/${tenantKey}/dashboard/customers/${alert.customer_id}`, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                          {!alert.is_read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => markAsRead(alert.id)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            onClick={() => dismissAlert(alert.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AlertManager;