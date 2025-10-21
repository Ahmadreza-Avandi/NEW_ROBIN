'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Sun,
  Moon,
  User,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  Building2,
  ChevronDown
} from 'lucide-react';

interface HeaderProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, showMenuButton = false }) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
    fetchUserInfo();
    fetchNotifications();

    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUserInfo = async () => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth-token='))
        ?.split('=')[1];

      if (!token) return;

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log('Header auth response:', data);
      if (data.success) {
        // Check both data.user and data.data for user info
        const user = data.user || data.data;
        console.log('Setting user info in header:', user);
        setUserInfo(user);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth-token='))
        ?.split('=')[1];

      if (!token) return;

      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setNotificationCount(data.data.unread_count || 0);
        setNotifications(data.data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleLogout = async () => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth-token='))
        ?.split('=')[1];

      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }

      // Clear auth cookie
      document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

      toast({
        title: "خروج موفق",
        description: "با موفقیت از سیستم خارج شدید"
      });

      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "خطا",
        description: "خطا در خروج از سیستم",
        variant: "destructive"
      });
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const getRoleLabel = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'ceo': 'مدیرعامل',
      'admin': 'مدیر',
      'manager': 'مدیر',
      'sales_manager': 'مدیر فروش',
      'sales_agent': 'کارشناس فروش',
      'support': 'پشتیبانی',
      'user': 'کاربر'
    };
    return roleMap[role] || role;
  };

  const getRoleColor = (role: string) => {
    const colorMap: { [key: string]: string } = {
      'ceo': 'bg-gradient-to-r from-emerald-500 to-teal-500',
      'admin': 'bg-gradient-to-r from-emerald-500 to-teal-500',
      'manager': 'bg-gradient-to-r from-green-500 to-emerald-500',
      'sales_manager': 'bg-gradient-to-r from-lime-500 to-green-500',
      'sales_agent': 'bg-gradient-to-r from-teal-500 to-cyan-500',
      'support': 'bg-gradient-to-r from-teal-500 to-emerald-500',
      'user': 'bg-gradient-to-r from-gray-500 to-slate-500'
    };
    return colorMap[role] || 'bg-gradient-to-r from-gray-500 to-slate-500';
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const words = name.split(' ');
    if (words.length >= 2) {
      return words[0][0] + words[1][0];
    }
    return name[0] || 'U';
  };

  const formatNotificationDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'همین الان';
    if (diffInMinutes < 60) return `${diffInMinutes} دقیقه پیش`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} ساعت پیش`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} روز پیش`;

    return date.toLocaleDateString('fa-IR');
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth-token='))
        ?.split('=')[1];

      if (!token) return;

      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationId }),
      });

      // Refresh notifications
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <header
      className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottomColor: 'rgba(0, 0, 0, 0.1)',
        color: '#000000'
      }}
    >
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Left Section */}
        <div className="flex items-center space-x-4 space-x-reverse">
          {/* Mobile Menu Button */}
          {showMenuButton && (
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={onMenuClick}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold font-vazir bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                سیستم CRM
              </h1>
            </div>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="جستجو در مشتریان، فروش‌ها و..."
              className="w-full h-9 pl-4 pr-10 text-sm bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-vazir transition-all duration-200 hover:bg-muted/70"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const searchTerm = (e.target as HTMLInputElement).value;
                  if (searchTerm.trim()) {
                    router.push(`/dashboard/search?q=${encodeURIComponent(searchTerm)}`);
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4 space-x-reverse">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 relative hover:bg-muted/80"
              >
                <Bell className="h-4 w-4" />
                {notificationCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                  >
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 font-vazir">
              <DropdownMenuLabel className="font-vazir">
                <div className="flex items-center justify-between">
                  <span>اطلاع‌رسانی‌ها</span>
                  {notificationCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {notificationCount} جدید
                    </Badge>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm font-vazir">
                  اطلاع‌رسانی‌ای وجود ندارد
                </div>
              ) : (
                <>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.slice(0, 10).map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className="font-vazir cursor-pointer p-3 border-b border-border/50 last:border-b-0"
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        <div className="flex flex-col space-y-1 w-full">
                          <div className="flex items-start justify-between">
                            <p className={`text-sm font-medium ${!notification.is_read ? 'font-bold' : ''}`}>
                              {notification.title}
                            </p>
                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1"></div>
                            )}
                          </div>
                          {notification.message && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {notification.message}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {formatNotificationDate(notification.created_at)}
                          </p>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </div>
                  {notifications.length > 10 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="font-vazir cursor-pointer text-center text-primary">
                        مشاهده همه اطلاع‌رسانی‌ها ({notifications.length})
                      </DropdownMenuItem>
                    </>
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-9 px-2 hover:bg-muted/80 data-[state=open]:bg-muted"
              >
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={userInfo?.avatar} alt={userInfo?.name} />
                    <AvatarFallback className={`text-white text-xs font-bold ${getRoleColor(userInfo?.role || 'user')}`}>
                      {getInitials(userInfo?.name || 'کاربر')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-sm font-medium font-vazir">
                      {userInfo?.name || 'کاربر'}
                    </span>
                    <span className="text-xs text-muted-foreground font-vazir">
                      {getRoleLabel(userInfo?.role || 'user')}
                    </span>
                  </div>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 font-vazir">
              <DropdownMenuLabel className="font-vazir">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{userInfo?.name || 'کاربر'}</p>
                  <p className="text-xs text-muted-foreground">{userInfo?.email}</p>
                  <Badge
                    variant="secondary"
                    className={`w-fit text-white text-xs ${getRoleColor(userInfo?.role || 'user')}`}
                  >
                    {getRoleLabel(userInfo?.role || 'user')}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => router.push('/dashboard/profile')}
                className="font-vazir cursor-pointer"
              >
                <User className="mr-2 h-4 w-4" />
                <span>پروفایل کاربری</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => router.push('/dashboard/settings')}
                className="font-vazir cursor-pointer"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>تنظیمات</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleLogout}
                className="font-vazir cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>خروج از سیستم</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};