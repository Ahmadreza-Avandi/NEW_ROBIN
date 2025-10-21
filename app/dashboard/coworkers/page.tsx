'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  Search, UserPlus, Mail, Shield, Settings, Edit, Trash2,
  CheckCircle2, Users2, LayoutDashboard, Contact,
  MessageCircle, TrendingUp, BarChart3, Target, Briefcase, FileText,
  Brain, Package, User, Monitor, Ticket, Activity, Calendar, Building
} from 'lucide-react';

// نقشه آیکون‌ها
const getModuleIcon = (iconName: string) => {
  const iconMap: { [key: string]: any } = {
    'Home': LayoutDashboard,
    'LayoutDashboard': LayoutDashboard,
    'Users': Users2,
    'Users2': Users2,
    'UserCheck': Contact,
    'Activity': Activity,
    'MessageCircle': MessageCircle,
    'MessageCircle2': MessageCircle,
    'DollarSign': TrendingUp,
    'BarChart3': BarChart3,
    'Calendar': Calendar,
    'User': User,
    'Settings': Settings,
    'Settings2': Settings,
    'Target': Target,
    'Briefcase': Briefcase,
    'Ticket': Ticket,
    'Building2': Building,
    'TrendingUp': TrendingUp,
    'FileText': FileText,
    'Brain': Brain,
    'Package': Package,
    'Mail': Mail,
    'Monitor': Monitor,
    'CheckCircle': CheckCircle2,
    'CheckSquare': CheckCircle2,
    'Shield': Shield,
    'Bell': Shield,
    'Heart': Shield,
    'Mic': MessageCircle,
    'Star': Shield,
    'ClipboardList': FileText
  };

  return iconMap[iconName] || Settings;
};

// گروه‌بندی ماژول‌ها
const getGroupedModules = (modules: Module[]) => {
  const groups = [
    {
      title: 'مدیریت اصلی',
      icon: LayoutDashboard,
      modules: modules.filter(m =>
        ['dashboard', 'profile', 'settings', 'system_monitoring'].includes(m.name)
      )
    },
    {
      title: 'مدیریت مشتریان و CEM',
      icon: Users2,
      modules: modules.filter(m =>
        ['customers', 'contacts', 'customer_club', 'customer_journey', 'loyalty_program',
          'customer-health', 'touchpoints', 'voice-of-customer'].includes(m.name)
      )
    },
    {
      title: 'مدیریت فروش و محصولات',
      icon: TrendingUp,
      modules: modules.filter(m =>
        ['sales', 'products', 'deals', 'projects'].includes(m.name)
      )
    },
    {
      title: 'مدیریت همکاران و وظایف',
      icon: Users2,
      modules: modules.filter(m =>
        ['coworkers', 'activities', 'tasks', 'calendar'].includes(m.name)
      )
    },
    {
      title: 'ارتباطات و پشتیبانی',
      icon: MessageCircle,
      modules: modules.filter(m =>
        ['feedback', 'interactions', 'surveys', 'chat', 'tickets', 'alerts'].includes(m.name)
      )
    },
    {
      title: 'گزارش‌ها و تحلیل هوشمند',
      icon: BarChart3,
      modules: modules.filter(m =>
        ['reports', 'daily_reports', 'insights', 'reports_analysis',
          'feedback_analysis', 'sales_analysis', 'audio_analysis'].includes(m.name)
      )
    },
    {
      title: 'مدیریت اسناد و محتوا',
      icon: FileText,
      modules: modules.filter(m =>
        ['documents'].includes(m.name)
      )
    },
    {
      title: 'سایر ماژول‌ها',
      icon: Settings,
      modules: modules.filter(m =>
        !['dashboard', 'profile', 'settings', 'system_monitoring',
          'customers', 'contacts', 'customer_club', 'customer_journey', 'loyalty_program',
          'customer-health', 'touchpoints', 'voice-of-customer',
          'sales', 'products', 'deals', 'projects',
          'coworkers', 'activities', 'tasks', 'calendar',
          'feedback', 'interactions', 'surveys', 'chat', 'tickets', 'alerts',
          'reports', 'daily_reports', 'insights', 'reports_analysis',
          'feedback_analysis', 'sales_analysis', 'audio_analysis',
          'documents'].includes(m.name)
      )
    }
  ];

  return groups.filter(group => group.modules.length > 0);
};

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  department?: string;
  status: string;
  created_at: string;
  last_login?: string;
}

interface Module {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  route?: string;
  icon: string;
  sort_order: number;
  parent_id?: string;
  is_active: boolean;
  has_permission: boolean;
}

// کامپوننت فرم افزودن کاربر
function AddUserForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'sales_agent',
    department: '',
    password: ''
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const getAuthToken = () => {
    return document.cookie
      .split('; ')
      .find(row => row.startsWith('auth-token='))
      ?.split('=')[1];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      toast({
        title: "خطا",
        description: "نام، ایمیل و رمز عبور الزامی است",
        variant: "destructive"
      });
      return;
    }

    if (saving) {
      return; // Prevent double submission
    }

    try {
      setSaving(true);
      const token = getAuthToken();

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "موفق",
          description: `همکار ${formData.name} با موفقیت اضافه شد`
        });
        onSuccess();
      } else {
        toast({
          title: "خطا",
          description: data.message || "خطا در افزودن همکار",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "خطا",
        description: "خطا در اتصال به سرور",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>نام کامل *</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          disabled={saving}
        />
      </div>

      <div className="space-y-2">
        <Label>ایمیل *</Label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          disabled={saving}
        />
      </div>

      <div className="space-y-2">
        <Label>رمز عبور *</Label>
        <Input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
          disabled={saving}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>نقش</Label>
          <Select
            value={formData.role}
            onValueChange={(value) => setFormData({ ...formData, role: value })}
            disabled={saving}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sales_agent">نماینده فروش</SelectItem>
              <SelectItem value="agent">نماینده</SelectItem>
              <SelectItem value="sales_manager">مدیر فروش</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>تلفن</Label>
          <Input
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            disabled={saving}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>بخش</Label>
        <Input
          value={formData.department}
          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          disabled={saving}
        />
      </div>

      <div className="flex justify-end space-x-2 space-x-reverse pt-4">
        <Button type="button" variant="outline" onClick={() => onSuccess()} disabled={saving}>
          انصراف
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? 'در حال ذخیره...' : 'افزودن همکار'}
        </Button>
      </div>
    </form>
  );
}

export default function CoworkersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<User> & { password?: string }>({});
  const { toast } = useToast();

  // Utility function to get auth token
  const getAuthToken = () => {
    return document.cookie
      .split('; ')
      .find(row => row.startsWith('auth-token='))
      ?.split('=')[1];
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      console.log('Fetching users with token:', token ? 'present' : 'missing');

      const response = await fetch('/api/users', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });

      console.log('Users API response status:', response.status);
      const data = await response.json();
      console.log('Users API response data:', data);

      if (data.success) {
        setUsers(data.users || []);
      } else {
        toast({
          title: "خطا",
          description: "خطا در بارگذاری همکاران",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "خطا",
        description: "خطا در اتصال به سرور",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPermissions = async (userId: string) => {
    try {
      setPermissionsLoading(true);
      const token = getAuthToken();
      const response = await fetch(`/api/user-permissions?user_id=${userId}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (data.success) {
        setModules(data.data || []);
      } else {
        toast({
          title: "خطا",
          description: "خطا در بارگذاری دسترسی‌ها",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
      toast({
        title: "خطا",
        description: "خطا در اتصال به سرور",
        variant: "destructive"
      });
    } finally {
      setPermissionsLoading(false);
    }
  };

  const handlePermissionChange = async (moduleId: string, granted: boolean) => {
    if (!selectedUser) return;

    try {
      const token = getAuthToken();
      const response = await fetch('/api/user-permissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          moduleId,
          granted
        }),
      });

      const data = await response.json();

      if (data.success) {
        // به‌روزرسانی state محلی
        setModules(prev => prev.map(module =>
          module.id === moduleId
            ? { ...module, has_permission: granted }
            : module
        ));

        toast({
          title: "موفق",
          description: "دسترسی با موفقیت به‌روزرسانی شد"
        });
      } else {
        toast({
          title: "خطا",
          description: data.message || "خطا در به‌روزرسانی دسترسی",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating permission:', error);
      toast({
        title: "خطا",
        description: "خطا در اتصال به سرور",
        variant: "destructive"
      });
    }
  };

  const handleOpenPermissions = (user: User) => {
    setSelectedUser(user);
    setPermissionsOpen(true);
    fetchUserPermissions(user.id);
  };



  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      department: user.department,
      role: user.role,
      status: user.status,
    });
    setEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const token = getAuthToken();
      const body: any = {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        team: editForm.department,
      };

      if (editForm.role) body.role = editForm.role;
      if (editForm.status) body.status = editForm.status;
      if (editForm.password && editForm.password.trim() !== '') body.password = editForm.password;

      const res = await fetch(`/api/users?id=${encodeURIComponent(selectedUser.id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        toast({ title: 'موفق', description: 'اطلاعات کاربر بروزرسانی شد' });
        setEditOpen(false);
        setEditForm({});
        fetchUsers();
      } else {
        toast({ title: 'خطا', description: data.message || 'خطا در بروزرسانی', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast({ title: 'خطا', description: 'خطا در اتصال به سرور', variant: 'destructive' });
    }
  };

  const handleDelete = async (user: User) => {
    const confirmed = confirm(`آیا از غیرفعال کردن ${user.name} مطمئن هستید؟`);
    if (!confirmed) return;

    try {
      const token = getAuthToken();
      // Hard delete with cascade via RESTful route
      const res = await fetch(`/api/users/${encodeURIComponent(user.id)}?hard=true`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: 'موفق', description: 'کاربر با موفقیت غیرفعال شد' });
        fetchUsers();
      } else {
        toast({ title: 'خطا', description: data.message || 'خطا در غیرفعال‌سازی', variant: 'destructive' });
      }
    } catch (e) {
      toast({ title: 'خطا', description: 'خطا در اتصال به سرور', variant: 'destructive' });
    }
  };



  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'suspended': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ceo': return 'مدیر عامل';
      case 'sales_manager': return 'مدیر فروش';
      case 'sales_agent': return 'نماینده فروش';
      case 'agent': return 'نماینده';
      default: return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ceo': return 'bg-emerald-100 text-emerald-700';
      case 'sales_manager': return 'bg-teal-100 text-teal-700';
      case 'sales_agent': return 'bg-green-100 text-green-700';
      case 'agent': return 'bg-lime-100 text-lime-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
              <Users2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">همکاران</h1>
              <p className="text-muted-foreground">مدیریت همکاران و دسترسی‌ها</p>
            </div>
          </div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
              <UserPlus className="h-4 w-4 ml-2" />
              افزودن همکار
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>افزودن همکار جدید</DialogTitle>
            </DialogHeader>
            <AddUserForm onSuccess={() => { setOpen(false); fetchUsers(); }} />
          </DialogContent>
        </Dialog>
      </div>

      {/* آمار کلی */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50 to-teal-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-teal-700">کل همکاران</CardTitle>
            <div className="p-2 bg-teal-500 rounded-lg">
              <Users2 className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-teal-900">{users.length.toLocaleString('fa-IR')}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">فعال</CardTitle>
            <div className="p-2 bg-green-500 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">
              {users.filter(u => u.status === 'active').length.toLocaleString('fa-IR')}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700">مدیران</CardTitle>
            <div className="p-2 bg-emerald-500 rounded-lg">
              <Shield className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-900">
              {users.filter(u => u.role === 'sales_manager' || u.role === 'ceo').length.toLocaleString('fa-IR')}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-700">نمایندگان</CardTitle>
            <div className="p-2 bg-amber-500 rounded-lg">
              <Users2 className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-900">
              {users.filter(u => u.role === 'sales_agent' || u.role === 'agent').length.toLocaleString('fa-IR')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            فیلتر و جستجو
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="جستجو در همکاران..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="نقش" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه نقش‌ها</SelectItem>
                <SelectItem value="ceo">مدیر عامل</SelectItem>
                <SelectItem value="sales_manager">مدیر فروش</SelectItem>
                <SelectItem value="sales_agent">نماینده فروش</SelectItem>
                <SelectItem value="agent">نماینده</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="وضعیت" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                <SelectItem value="active">فعال</SelectItem>
                <SelectItem value="inactive">غیرفعال</SelectItem>
                <SelectItem value="away">غایب</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      {loading ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                  <div className="w-12 h-12 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                    <div className="h-3 bg-muted rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : filteredUsers.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Users2 className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">همکاری یافت نشد</h3>
              <p className="text-sm text-gray-500">
                {searchTerm ? 'هیچ همکاری با این جستجو یافت نشد' : 'هنوز همکاری اضافه نشده است'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users2 className="h-5 w-5" />
              لیست همکاران ({filteredUsers.length.toLocaleString('fa-IR')} نفر)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredUsers.map((user, index) => (
                <div
                  key={user.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                    }`}
                >
                  {/* Avatar and Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-sm">
                        {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {user.name}
                        </h4>
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusColor(user.status)}`}></div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span className="truncate">{user.email}</span>
                        {user.department && (
                          <>
                            <span>•</span>
                            <span className="truncate">{user.department}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Role and Actions */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <Badge className={`text-xs ${getRoleBadgeColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </Badge>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenPermissions(user)}
                        className="flex items-center gap-2"
                      >
                        <Settings className="w-4 h-4" />
                        دسترسی‌ها
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(user)}
                        className="flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        ویرایش
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(user)}
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        حذف
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Permissions Dialog */}
      <Dialog open={permissionsOpen} onOpenChange={setPermissionsOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              مدیریت دسترسی‌های {selectedUser?.name}
            </DialogTitle>
          </DialogHeader>

          {permissionsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-muted rounded"></div>
                    <div className="space-y-1">
                      <div className="h-4 bg-muted rounded w-24"></div>
                      <div className="h-3 bg-muted rounded w-32"></div>
                    </div>
                  </div>
                  <div className="w-10 h-6 bg-muted rounded-full"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 mb-4 p-3 bg-teal-50 rounded-lg border border-teal-200">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-teal-600" />
                  <span className="font-medium text-teal-800">مدیریت دسترسی‌ها</span>
                </div>
                <p>مدیر عامل می‌تواند دسترسی همکاران به ماژول‌های مختلف سیستم را کنترل کند.</p>
              </div>

              <div className="space-y-6">
                {/* گروه‌بندی ماژول‌ها */}
                {getGroupedModules(modules).map((group) => (
                  <div key={group.title} className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b">
                      <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                        <group.icon className="w-5 h-5 text-gray-600" />
                        {group.title}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {group.modules.filter(m => m.has_permission).length} / {group.modules.length}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      {group.modules.map((module) => {
                        const IconComponent = getModuleIcon(module.icon);
                        return (
                          <div key={module.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${module.has_permission
                                ? 'bg-teal-100 text-teal-600'
                                : 'bg-gray-100 text-gray-400'
                                }`}>
                                <IconComponent className="w-5 h-5" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{module.display_name}</h4>
                                {module.description && (
                                  <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                                )}
                                {module.route && (
                                  <p className="text-xs text-gray-400 mt-1 font-mono">{module.route}</p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className={`text-sm font-medium ${module.has_permission ? 'text-green-600' : 'text-gray-400'
                                }`}>
                                {module.has_permission ? 'فعال' : 'غیرفعال'}
                              </span>
                              <Switch
                                checked={module.has_permission}
                                onCheckedChange={(checked) => handlePermissionChange(module.id, checked)}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>ویرایش اطلاعات {selectedUser?.name}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>نام</Label>
              <Input
                value={editForm.name || ''}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>ایمیل</Label>
              <Input
                type="email"
                value={editForm.email || ''}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>تلفن</Label>
                <Input
                  value={editForm.phone || ''}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>بخش</Label>
                <Input
                  value={editForm.department || ''}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>نقش</Label>
                <Select
                  value={editForm.role || 'sales_agent'}
                  onValueChange={(value) => setEditForm({ ...editForm, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales_agent">نماینده فروش</SelectItem>
                    <SelectItem value="agent">نماینده</SelectItem>
                    <SelectItem value="sales_manager">مدیر فروش</SelectItem>
                    <SelectItem value="ceo">مدیر عامل</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>وضعیت</Label>
                <Select
                  value={editForm.status || 'active'}
                  onValueChange={(value) => setEditForm({ ...editForm, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">فعال</SelectItem>
                    <SelectItem value="inactive">غیرفعال</SelectItem>
                    <SelectItem value="away">غایب</SelectItem>
                    <SelectItem value="online">آنلاین</SelectItem>
                    <SelectItem value="offline">آفلاین</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>رمز عبور جدید (اختیاری)</Label>
              <Input
                type="password"
                value={editForm.password || ''}
                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                placeholder="در صورت خالی بودن تغییر نمی‌کند"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>انصراف</Button>
              <Button type="submit">ذخیره تغییرات</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}