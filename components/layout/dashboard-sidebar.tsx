'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import {
  LayoutDashboard,
  Users,
  Contact,
  Ticket,
  MessageCircle,
  TrendingUp,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,

  Building2,
  Activity,
  Calendar,
  Briefcase,
  Target,
  FileText,
  Package,
  User,
  Mail,
  Monitor,
  CheckCircle,
  Mic,
  GitBranch,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: string;
  children?: NavItem[];
}

interface ResponsiveSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const ResponsiveSidebar: React.FC<ResponsiveSidebarProps> = ({
  mobileOpen = false,
  onMobileClose
}) => {
  const pathname = usePathname();
  const { sidebarCollapsed, setSidebarCollapsed } = useAppStore();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);


  // ...existing code...

  useEffect(() => {
    fetchUserPermissions();

    // Listen for refresh events
    const handleRefreshSidebar = () => {
      console.log('🔄 Refreshing sidebar permissions...');
      fetchUserPermissions();
    };

    window.addEventListener('refreshSidebar', handleRefreshSidebar);

    return () => {
      window.removeEventListener('refreshSidebar', handleRefreshSidebar);
    };
  }, []);

  const fetchUserPermissions = async () => {
    try {
      setLoading(true);

      // Get tenant_key from window or URL
      const tenantKey = (window as any).__TENANT_KEY__ ||
        window.location.pathname.split('/')[1];

      // Get tenant_token from cookie
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('tenant_token='))
        ?.split('=')[1];

      const response = await fetch('/api/auth/permissions', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'X-Tenant-Key': tenantKey,
        }
      });
      const data = await response.json();

      console.log('🔍 Permissions API Response:', data);
      console.log('🔍 Data length:', data.data?.length);
      console.log('🔍 Raw data:', JSON.stringify(data.data, null, 2));

      if (data.success && data.data && data.data.length > 0) {
        const permissions = data.data;
        console.log('✅ Converting permissions to nav items:', permissions);
        const convertedNavItems = convertModulesToNavItems(permissions, tenantKey);
        console.log('✅ Converted nav items count:', convertedNavItems.length);
        console.log('✅ Converted nav items:', JSON.stringify(convertedNavItems, null, 2));
        setNavItems(convertedNavItems);
      } else {
        console.warn('⚠️ Using fallback menu items. API response:', data);
        // Fallback to default items
        setNavItems([
          {
            title: 'داشبورد',
            href: `/${tenantKey}/dashboard`,
            icon: LayoutDashboard,
          },
          {
            title: 'دسترسی سریع',
            href: '#',
            icon: ChevronRight,
            children: [
              {
                title: 'افزودن مشتری',
                href: `/${tenantKey}/dashboard/customers/new`,
                icon: Users,
              },
              {
                title: 'ثبت فعالیت',
                href: `/${tenantKey}/dashboard/activities`,
                icon: Activity,
              },
              {
                title: 'مدیریت کاربران',
                href: `/${tenantKey}/dashboard/coworkers`,
                icon: Users,
              },
              {
                title: 'پیام‌رسانی',
                href: `/${tenantKey}/dashboard/interactions`,
                icon: MessageCircle,
              },
              {
                title: 'مدیریت تیکت',
                href: `/${tenantKey}/dashboard/tickets`,
                icon: Ticket,
              },
            ]
          },
          {
            title: 'مدیریت فروش',
            href: `/${tenantKey}/dashboard/sales`,
            icon: TrendingUp,
            children: [

            ]
          },
          {
            title: 'مدیریت تجربه مشتری',
            href: `/${tenantKey}/dashboard/cem`,
            icon: Users,
            children: [
              {
                title: 'مشتریان',
                href: `/${tenantKey}/dashboard/customers`,
                icon: Users,
              },
              {
                title: 'مخاطبین',
                href: `/${tenantKey}/dashboard/contacts`,
                icon: Contact,
              },

            ]
          },
          {
            title: 'مدیریت همکاران',
            href: `/${tenantKey}/dashboard/coworkers`,
            icon: Activity,
            children: [
              {
                title: 'همکاران',
                href: `/${tenantKey}/dashboard/coworkers`,
                icon: Users,
              },
              {
                title: 'فعالیت‌ها',
                href: `/${tenantKey}/dashboard/activities`,
                icon: Activity,
              },
              {
                title: 'تقویم',
                href: `/${tenantKey}/dashboard/calendar`,
                icon: Calendar,
              },
              {
                title: 'مدیریت اسناد',
                href: `/${tenantKey}/dashboard/documents`,
                icon: FileText,
              },
              {
                title: 'گزارش‌گیری',
                href: `/${tenantKey}/dashboard/reports`,
                icon: BarChart3,
              },
              {
                title: 'مدیریت وظایف',
                href: `/${tenantKey}/dashboard/tasks`,
                icon: CheckCircle,
              }
            ]
          },
          {
            title: 'چت',
            href: `/${tenantKey}/dashboard/chat`,
            icon: MessageCircle,
          },
          {
            title: 'باشگاه مشتریان و ایمیل',
            href: `/${tenantKey}/dashboard/customer-club`,
            icon: Users,
          },
          {
            title: 'صدای رابین',
            href: `/${tenantKey}/dashboard/voice-assistant`,
            icon: Mic,
          },


          {
            title: 'پروفایل',
            href: `/${tenantKey}/dashboard/profile`,
            icon: User,
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
      // Fallback to basic items
      const fallbackTenantKey = (window as any).__TENANT_KEY__ ||
        window.location.pathname.split('/')[1] || 'rabin';
      setNavItems([
        {
          title: 'داشبورد',
          href: `/${fallbackTenantKey}/dashboard`,
          icon: LayoutDashboard,
        },
        {
          title: 'پروفایل',
          href: `/${fallbackTenantKey}/dashboard/profile`,
          icon: Contact,
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const convertModulesToNavItems = (permissions: any[], tenantKey: string): NavItem[] => {
    console.log('🔄 convertModulesToNavItems called with:', permissions, 'tenantKey:', tenantKey);

    // Helper function to build tenant-aware routes
    const buildTenantRoute = (route: string): string => {
      if (!route.startsWith('/')) route = '/' + route;
      if (route.startsWith('/dashboard')) {
        return `/${tenantKey}${route}`;
      }
      return route;
    };

    // اگر permissions خالی است، فقط داشبورد را نشان بده
    if (!permissions || permissions.length === 0) {
      console.log('⚠️ No permissions found, showing minimal menu');
      return [
        {
          title: 'داشبورد',
          href: buildTenantRoute('/dashboard'),
          icon: LayoutDashboard,
        },
        {
          title: 'پروفایل',
          href: buildTenantRoute('/dashboard/profile'),
          icon: User,
        }
      ];
    }

    // تبدیل permissions به مجموعه‌ای از نام‌های ماژول‌ها
    const availableModules = new Set(permissions.map(p => p.module || p.name));
    console.log('📋 Available modules:', Array.from(availableModules));

    // بررسی اینکه آیا کاربر CEO است یا خیر (بر اساس تعداد permissions)
    const isCEO = permissions.length >= 30; // اگر بیش از 30 ماژول دارد، احتمالاً CEO است
    
    if (isCEO) {
      console.log('✅ CEO detected - showing full menu structure');
      // Create complete CEO menu structure as requested
      const navItems: NavItem[] = [];

      // 1. داشبورد
      navItems.push({
        title: 'داشبورد',
        href: buildTenantRoute('/dashboard'),
        icon: LayoutDashboard,
      });

      // 2. مدیریت فروش
      navItems.push({
        title: 'مدیریت فروش',
        href: buildTenantRoute('/dashboard/sales'),
        icon: TrendingUp,
        children: [
          {
            title: 'پیگیری فروش',
            href: buildTenantRoute('/dashboard/sales-pipeline'),
            icon: GitBranch,
          },
          {
            title: 'محصولات',
            href: buildTenantRoute('/dashboard/products'),
            icon: Package,
          },
          {
            title: 'فروش‌ها',
            href: buildTenantRoute('/dashboard/sales'),
            icon: TrendingUp,
          }
        ]
      });

      // 3. مدیریت تجربه مشتری
      navItems.push({
        title: 'مدیریت تجربه مشتری',
        href: buildTenantRoute('/dashboard/customers'),
        icon: Users,
        children: [
          {
            title: 'مشتریان',
            href: buildTenantRoute('/dashboard/customers'),
            icon: Users,
          },
          {
            title: 'مخاطبین',
            href: buildTenantRoute('/dashboard/contacts'),
            icon: Contact,
          },
          {
            title: 'باشگاه مشتریان',
            href: buildTenantRoute('/dashboard/customer-club'),
            icon: Users,
          },
          {
            title: 'بازخوردها',
            href: buildTenantRoute('/dashboard/feedback'),
            icon: MessageCircle,
          }
        ]
      });

      // 4. مدیریت همکاران
      navItems.push({
        title: 'مدیریت همکاران',
        href: buildTenantRoute('/dashboard/coworkers'),
        icon: Activity,
        children: [
          {
            title: 'همکاران',
            href: buildTenantRoute('/dashboard/coworkers'),
            icon: Users,
          },
          {
            title: 'فعالیت‌ها',
            href: buildTenantRoute('/dashboard/activities'),
            icon: Activity,
          },
          {
            title: 'تقویم',
            href: buildTenantRoute('/dashboard/calendar'),
            icon: Calendar,
          },
          {
            title: 'وظایف',
            href: buildTenantRoute('/dashboard/tasks'),
            icon: CheckCircle,
          },
          {
            title: 'مدیریت اسناد',
            href: buildTenantRoute('/dashboard/documents'),
            icon: FileText,
          },
          {
            title: 'گزارش‌گیری',
            href: buildTenantRoute('/dashboard/reports'),
            icon: BarChart3,
          }
        ]
      });

      // 5. مدیریت وظایف (standalone)
      navItems.push({
        title: 'مدیریت وظایف',
        href: buildTenantRoute('/dashboard/tasks'),
        icon: CheckCircle,
      });

      // 6. مانیتورینگ سیستم
      navItems.push({
        title: 'مانیتورینگ سیستم',
        href: buildTenantRoute('/dashboard/system-monitoring'),
        icon: Monitor,
      });

      // 7. چت
      navItems.push({
        title: 'چت',
        href: buildTenantRoute('/dashboard/chat'),
        icon: MessageCircle,
      });

      // 8. باشگاه مشتریان (standalone)
      navItems.push({
        title: 'باشگاه مشتریان',
        href: buildTenantRoute('/dashboard/customer-club'),
        icon: Users,
      });

      // 9. صدای رابین
      navItems.push({
        title: 'صدای رابین',
        href: buildTenantRoute('/dashboard/voice-assistant'),
        icon: Mic,
      });

      console.log('✅ Final CEO nav items:', navItems);
      return navItems;
    } else {
      // برای کاربران غیر CEO، فقط ماژول‌هایی که دسترسی دارند را نشان بده
      console.log('📝 Non-CEO user - building limited menu based on permissions');
      const navItems: NavItem[] = [];

      // همیشه داشبورد را اضافه کن
      navItems.push({
        title: 'داشبورد',
        href: buildTenantRoute('/dashboard'),
        icon: LayoutDashboard,
      });

      // اضافه کردن سایر ماژول‌ها بر اساس دسترسی
      if (availableModules.has('customers')) {
        navItems.push({
          title: 'مشتریان',
          href: buildTenantRoute('/dashboard/customers'),
          icon: Users,
        });
      }

      if (availableModules.has('contacts')) {
        navItems.push({
          title: 'مخاطبین',
          href: buildTenantRoute('/dashboard/contacts'),
          icon: Contact,
        });
      }

      if (availableModules.has('activities')) {
        navItems.push({
          title: 'فعالیت‌ها',
          href: buildTenantRoute('/dashboard/activities'),
          icon: Activity,
        });
      }

      if (availableModules.has('calendar')) {
        navItems.push({
          title: 'تقویم',
          href: buildTenantRoute('/dashboard/calendar'),
          icon: Calendar,
        });
      }

      if (availableModules.has('products')) {
        navItems.push({
          title: 'محصولات',
          href: buildTenantRoute('/dashboard/products'),
          icon: Package,
        });
      }

      if (availableModules.has('sales')) {
        navItems.push({
          title: 'فروش‌ها',
          href: buildTenantRoute('/dashboard/sales'),
          icon: TrendingUp,
        });
      }

      if (availableModules.has('sales_pipeline')) {
        navItems.push({
          title: 'پیگیری فروش',
          href: buildTenantRoute('/dashboard/sales-pipeline'),
          icon: GitBranch,
        });
      }

      if (availableModules.has('reports')) {
        navItems.push({
          title: 'گزارش‌ها',
          href: buildTenantRoute('/dashboard/reports'),
          icon: BarChart3,
        });
      }

      // صدای رابین برای همه کاربران
      navItems.push({
        title: 'صدای رابین',
        href: buildTenantRoute('/dashboard/voice-assistant'),
        icon: Mic,
      });

      // همیشه پروفایل را اضافه کن
      navItems.push({
        title: 'پروفایل',
        href: buildTenantRoute('/dashboard/profile'),
        icon: User,
      });

      console.log('✅ Final limited nav items:', navItems);
      return navItems;
    }
  };

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => {
      // اگر آیتم در لیست باز شده‌ها باشد، آن را ببند
      if (prev.includes(title)) {
        return prev.filter(item => item !== title);
      }
      // در غیر این صورت، همه را ببند و فقط این یکی را باز کن
      return [title];
    });
  };

  const renderNavItem = (item: NavItem, level = 0) => {
    const isActive = pathname === item.href;
    const isExpanded = expandedItems.includes(item.title);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.title} className="animate-fade-in-up">
        <div
          className={cn(
            'flex items-center space-x-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-300 group relative overflow-hidden',
            level > 0 && 'ml-4',
            isActive
              ? 'bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 text-primary shadow-lg border border-primary/20'
              : 'text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-primary/5 hover:via-secondary/5 hover:to-accent/5 hover:shadow-md',
            sidebarCollapsed && 'justify-center px-2',
            'before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/10 before:via-secondary/10 before:to-accent/10 before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100'
          )}
        >
          {hasChildren ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-inherit hover:bg-transparent relative z-10"
              onClick={() => toggleExpanded(item.title)}
            >
              <div className="flex items-center space-x-3">
                <item.icon className={cn(
                  "h-5 w-5 transition-colors duration-300",
                  isActive ? "text-primary" : "group-hover:text-primary"
                )} />
                <div className="lg:flex hidden items-center space-x-3 flex-1">
                  <span className="flex-1 font-vazir text-sm">{item.title}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="mr-auto bg-accent/20 text-accent border-accent/30">
                      {item.badge}
                    </Badge>
                  )}
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 transition-transform duration-300" />
                  ) : (
                    <ChevronRight className="h-4 w-4 transition-transform duration-300" />
                  )}
                </div>
                <div className="lg:hidden flex items-center space-x-3 flex-1">
                  <span className="flex-1 font-vazir text-sm">{item.title}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="mr-auto bg-accent/20 text-accent border-accent/30 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 transition-transform duration-300" />
                  ) : (
                    <ChevronRight className="h-4 w-4 transition-transform duration-300" />
                  )}
                </div>
              </div>
            </Button>
          ) : (
            <Link href={item.href} className="flex items-center space-x-3 flex-1 relative z-10">
              <item.icon className={cn(
                "h-5 w-5 transition-colors duration-300",
                isActive ? "text-primary" : "group-hover:text-primary"
              )} />
              <div className="lg:flex hidden items-center space-x-3 flex-1">
                <span className="flex-1 font-vazir text-sm">{item.title}</span>
                {item.badge && (
                  <Badge variant="secondary" className="mr-auto bg-accent/20 text-accent border-accent/30">
                    {item.badge}
                  </Badge>
                )}
              </div>
              <div className="lg:hidden flex items-center space-x-3 flex-1">
                <span className="flex-1 font-vazir text-sm">{item.title}</span>
                {item.badge && (
                  <Badge variant="secondary" className="mr-auto bg-accent/20 text-accent border-accent/30 text-xs">
                    {item.badge}
                  </Badge>
                )}
              </div>
            </Link>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="mr-4 space-y-1 animate-slide-in-right lg:block hidden">
            {item.children?.map(child => renderNavItem(child, level + 1))}
          </div>
        )}
        {hasChildren && isExpanded && (
          <div className="mr-4 space-y-1 animate-slide-in-right lg:hidden block">
            {item.children?.map(child => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {(mobileOpen || !sidebarCollapsed) && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-30 backdrop-blur-sm"
          onClick={() => {
            setSidebarCollapsed(true);
            onMobileClose?.();
          }}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed right-0 top-16 z-40 h-[calc(100vh-4rem)] bg-card/95 backdrop-blur-xl border-l border-border/50 transition-all duration-300 shadow-2xl flex flex-col',
          // Desktop: always show full width
          'lg:w-72',
          // Mobile: show/hide based on mobileOpen or sidebarCollapsed
          'lg:translate-x-0',
          (mobileOpen || !sidebarCollapsed) ? 'translate-x-0 w-[85vw] max-w-[300px]' : 'translate-x-full w-[85vw] max-w-[300px]'
        )}
      >
        {/* Sidebar Header - Hidden since we have main header now */}
        <div className="hidden"></div>

        {/* Main Navigation */}
        <nav className="space-y-1 p-3 overflow-y-auto flex-1 pt-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            navItems.map(item => renderNavItem(item))
          )}
        </nav>

        {/* Bottom Section: Profile and Settings */}
        <div className="mt-auto border-t border-border/50">
          <div className="p-4 space-y-2">
            {/* Profile Link */}
            <Link href="/dashboard/profile">
              <div className={cn(
                'flex items-center space-x-3 space-x-reverse rounded-xl px-3 py-3 text-sm font-medium transition-all duration-300 group relative overflow-hidden hover:bg-green-500/10',
                pathname === '/dashboard/profile' ? 'bg-gradient-to-r from-green-500/20 via-green-600/20 to-green-700/20 text-green-600 shadow-lg border border-green-500/20' : 'text-green-600 hover:text-green-700'
              )}>
                <User className="h-5 w-5 flex-shrink-0 text-green-600" />
                <span className="font-vazir text-sm lg:inline hidden text-green-600">پروفایل کاربری</span>
                <span className="font-vazir text-sm lg:hidden inline text-green-600">پروفایل کاربری</span>
              </div>
            </Link>
          </div>
        </div>

      </div>
    </>
  );
};