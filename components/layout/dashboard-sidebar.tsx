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
  Menu,
  X,
  Building2,
  Activity,
  Calendar,
  Briefcase,
  Target,
  FileText,
  Brain,
  Package,
  User,
  Mail,
  Monitor,
  CheckCircle,
  Mic2,
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

interface Module {
  id: string;
  name: string;
  display_name: string;
  route: string;
  icon: string;
  sort_order: number;
  parent_id?: string;
}

// نقشه آیکون‌ها
const iconMap: { [key: string]: React.ComponentType<any> } = {
  'Home': LayoutDashboard,
  'LayoutDashboard': LayoutDashboard,
  'Users': Users,
  'Users2': Target,
  'UserCheck': Contact,
  'Activity': Activity,
  'MessageCircle': MessageCircle,
  'MessageCircle2': MessageCircle,
  'DollarSign': TrendingUp,
  'BarChart3': BarChart3,
  'Calendar': Calendar,
  'User': Contact,
  'Settings': Settings,
  'Target': Target,
  'Briefcase': Briefcase,
  'Ticket': Ticket,
  'ChevronRight': ChevronRight,
  'Building2': Building2,
  'TrendingUp': TrendingUp,
  'FileText': FileText,
  'Brain': Brain,
  'Package': Package,
  'Mail': Mail,
  'Monitor': Monitor,
  'Mic2': Mic2,
};

// نقشه نام‌های نمایشی روت‌ها
const routeDisplayNames: { [key: string]: string } = {
  '/dashboard': 'داشبورد',
  '/dashboard/customers': 'مشتریان',
  '/dashboard/contacts': 'مخاطبین',
  '/dashboard/coworkers': 'همکاران',
  '/dashboard/activities': 'فعالیت‌ها',
  '/dashboard/chat': 'چت',
  '/dashboard/customer-club': 'باشگاه مشتریان',
  '/dashboard/deals': 'معاملات',
  '/dashboard/feedback': 'بازخوردها',
  '/dashboard/reports': 'گزارش‌ها',
  '/dashboard/daily-reports': 'گزارش‌های روزانه',
  '/dashboard/insights/reports-analysis': 'تحلیل گزارشات',
  '/dashboard/insights/feedback-analysis': 'تحلیل بازخوردها',
  '/dashboard/insights/sales-analysis': 'تحلیل فروش',
  '/dashboard/insights/audio-analysis': 'تحلیل صوتی',
  '/dashboard/calendar': 'تقویم',
  '/dashboard/profile': 'پروفایل',
  '/dashboard/settings': 'تنظیمات سیستم',
  '/dashboard/system-monitoring': 'مانیتورینگ سیستم',
  '/dashboard/products': 'محصولات',
  '/dashboard/documents': 'مدیریت اسناد',
};

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
  const [isHovered, setIsHovered] = useState(false);

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
        const modules: Module[] = data.data;
        console.log('✅ Converting modules to nav items:', modules);
        const convertedNavItems = convertModulesToNavItems(modules, tenantKey);
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
                title: 'مدیریت وظایف',
                href: `/${tenantKey}/dashboard/tasks`,
                icon: CheckCircle,
              },
              {
                title: 'گزارش‌گیری',
                href: `/${tenantKey}/dashboard/reports`,
                icon: BarChart3,
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
              {
                title: 'معاملات',
                href: `/${tenantKey}/dashboard/deals`,
                icon: TrendingUp,
              }
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
              {
                title: 'بازخوردها',
                href: `/${tenantKey}/dashboard/feedback`,
                icon: MessageCircle,
              }
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
            title: 'تحلیل صوتی',
            href: `/${tenantKey}/dashboard/insights/audio-analysis`,
            icon: Mic2,
          },
          {
            title: 'هوش مصنوعی و تحلیل',
            href: `/${tenantKey}/dashboard/insights`,
            icon: BarChart3,
            children: [
              {
                title: 'تحلیل گزارشات',
                href: `/${tenantKey}/dashboard/insights/reports-analysis`,
                icon: BarChart3,
              },
              {
                title: 'تحلیل بازخوردها',
                href: `/${tenantKey}/dashboard/insights/feedback-analysis`,
                icon: MessageCircle,
              },
              {
                title: 'تحلیل فروش',
                href: `/${tenantKey}/dashboard/insights/sales-analysis`,
                icon: TrendingUp,
              }
            ]
          },
          {
            title: 'محصولات',
            href: `/${tenantKey}/dashboard/products`,
            icon: Package,
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

  const convertModulesToNavItems = (modules: Module[], tenantKey: string): NavItem[] => {
    console.log('🔄 convertModulesToNavItems called with:', modules, 'tenantKey:', tenantKey);

    const filteredModules = modules
      .filter(module => module.route && module.route !== '#')
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

    console.log('📋 Filtered modules:', filteredModules);

    // Create hierarchical menu structure
    const navItems: NavItem[] = [];
    const processedModules = new Set<string>();

    // Helper function to build tenant-aware routes
    const buildTenantRoute = (route: string): string => {
      // If route doesn't start with /, add it
      if (!route.startsWith('/')) route = '/' + route;
      // If route already starts with /[tenant_key] or is /dashboard, prepend tenant
      if (route.startsWith('/dashboard')) {
        return `/${tenantKey}${route}`;
      }
      return route;
    };

    // Group modules into main categories
    // Sales Management modules
    const salesModules = filteredModules.filter(m =>
      ['sales', 'sales_opportunities', 'deals'].includes(m.name)
    );

    // Customer Experience Management modules
    const cemModules = filteredModules.filter(m =>
      ['customers', 'contacts', 'feedback', 'feedback_new', 'surveys', 'customer_health', 'customer-club'].includes(m.name)
    );

    // Team Management modules
    const teamModules = filteredModules.filter(m =>
      ['coworkers', 'activities', 'tasks', 'calendar'].includes(m.name)
    );

    // AI & Analytics modules
    const aiAnalyticsModules = filteredModules.filter(m =>
      ['reports-analysis', 'feedback-analysis', 'sales-analysis', 'audio-analysis'].includes(m.name)
    );

    // Reports modules
    const reportsModules = filteredModules.filter(m =>
      ['reports', 'daily-reports'].includes(m.name)
    );

    // Add dashboard first if exists
    const dashboardModule = filteredModules.find(m => m.name === 'dashboard');
    if (dashboardModule) {
      navItems.push({
        title: routeDisplayNames[dashboardModule.route] || dashboardModule.display_name,
        href: buildTenantRoute(dashboardModule.route),
        icon: iconMap[dashboardModule.icon] || LayoutDashboard,
      });
      processedModules.add(dashboardModule.name);
    }

    // Add Sales Management mega menu
    if (salesModules.length > 0) {
      navItems.push({
        title: 'مدیریت فروش',
        href: buildTenantRoute('/dashboard/sales'),
        icon: TrendingUp,
        children: salesModules.map(module => {
          processedModules.add(module.name);
          return {
            title: routeDisplayNames[module.route] || module.display_name,
            href: buildTenantRoute(module.route),
            icon: iconMap[module.icon] || TrendingUp,
          };
        }),
      });
    }

    // Add Customer Experience Management mega menu
    if (cemModules.length > 0) {
      navItems.push({
        title: 'مدیریت تجربه مشتری',
        href: buildTenantRoute('/dashboard/cem'),
        icon: Users,
        children: cemModules.map(module => {
          processedModules.add(module.name);
          return {
            title: routeDisplayNames[module.route] || module.display_name,
            href: buildTenantRoute(module.route),
            icon: iconMap[module.icon] || Users,
          };
        }),
      });
    }

    // Add Team Management mega menu
    if (teamModules.length > 0) {
      navItems.push({
        title: 'مدیریت همکاران',
        href: buildTenantRoute('/dashboard/coworkers'),
        icon: Activity,
        children: teamModules.map(module => {
          processedModules.add(module.name);
          return {
            title: routeDisplayNames[module.route] || module.display_name,
            href: buildTenantRoute(module.route),
            icon: iconMap[module.icon] || Activity,
          };
        }),
      });
    }

    // Add Reports mega menu
    if (reportsModules.length > 0) {
      navItems.push({
        title: 'گزارش‌ها',
        href: buildTenantRoute('/dashboard/reports'),
        icon: BarChart3,
        children: reportsModules.map(module => {
          processedModules.add(module.name);
          return {
            title: routeDisplayNames[module.route] || module.display_name,
            href: buildTenantRoute(module.route),
            icon: iconMap[module.icon] || BarChart3,
          };
        }),
      });
    }

    // Add AI & Analytics mega menu
    if (aiAnalyticsModules.length > 0) {
      navItems.push({
        title: 'هوش مصنوعی و تحلیل',
        href: buildTenantRoute('/dashboard/insights'),
        icon: Brain,
        children: aiAnalyticsModules.map(module => {
          processedModules.add(module.name);
          return {
            title: routeDisplayNames[module.route] || module.display_name,
            href: buildTenantRoute(module.route),
            icon: iconMap[module.icon] || BarChart3,
          };
        }),
      });
    }

    // Add all remaining modules that weren't grouped
    filteredModules.forEach(module => {
      if (!processedModules.has(module.name)) {
        navItems.push({
          title: routeDisplayNames[module.route] || module.display_name,
          href: buildTenantRoute(module.route),
          icon: iconMap[module.icon] || LayoutDashboard,
        });
        processedModules.add(module.name);
      }
    });

    console.log('✅ Final nav items:', navItems);
    return navItems;
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