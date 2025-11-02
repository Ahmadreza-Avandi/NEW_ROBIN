'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PersianDatePicker } from '@/components/ui/persian-date-picker';
import moment from 'moment-jalaali';

// Configure moment-jalaali
moment.loadPersian({ dialect: 'persian-modern' });
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Plus,
    Clock,
    CheckCircle2,
    AlertCircle,
    User as UserIcon,
    Calendar,
    Filter,
    Users,
    FileText,
    Upload,
    Download,
    Trash2,
    Eye,
    Edit,
    MessageSquare,
    X,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAuthToken, getCurrentUser, clearAuthData } from '@/lib/auth-utils';
import type { Task, TaskStage, User, CreateTaskInput } from '@/lib/types';


export default function TasksPage() {
    const params = useParams();
    const tenantKey = (params?.tenant_key as string) || '';
    const { toast } = useToast();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [showAddTask, setShowAddTask] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [showTaskDetail, setShowTaskDetail] = useState(false);
    const [showCompleteDialog, setShowCompleteDialog] = useState(false);
    const [completionNotes, setCompletionNotes] = useState('');
    const [uploadingFile, setUploadingFile] = useState(false);
    const [activeTab, setActiveTab] = useState('all');

    const [stages, setStages] = useState<TaskStage[]>([]);
    const [showStageDialog, setShowStageDialog] = useState(false);
    const [newStage, setNewStage] = useState<Partial<TaskStage>>({
        name: '',
        description: '',
        order: 0,
    });

    const [newTask, setNewTask] = useState<CreateTaskInput>({
        title: '',
        description: '',
        assigned_to: [] as string[],
        priority: 'medium',
        due_date: '',
        stages: [] as TaskStage[],
        status: 'pending'
    });

    // Fetch current user info
    useEffect(() => {
        fetchCurrentUser();
    }, []);

    // Fetch tasks and users
    useEffect(() => {
        if (currentUser) {
            fetchTasks();
            if (isManager()) {
                fetchUsers();
            }
        }
    }, [currentUser]);

    const fetchCurrentUser = async () => {
        try {
            const token = getAuthToken();
            console.log('Auth Token:', token ? 'Found' : 'Not found');

            if (!token) {
                console.error('No auth token found');
                // Clear any stale data
                localStorage.removeItem('currentUser');
                localStorage.removeItem('tenant_token');
                window.location.href = `/${tenantKey}/login`;
                return;
            }

            const response = await fetch('/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-Tenant-Key': params?.tenant_key || tenantKey,
                    'Content-Type': 'application/json',
                }
            });

            console.log('Auth Response Status:', response.status);

            if (!response.ok) {
                console.error('Auth response not ok:', response.status);
                // Clear invalid token
                localStorage.removeItem('currentUser');
                localStorage.removeItem('tenant_token');
                document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                window.location.href = `/${tenantKey}/login`;
                return;
            }

            const data = await response.json();
            console.log('Auth Data Success:', data.success);

            if (data.success && data.data) {
                setCurrentUser(data.data);
                setLoading(false);
            } else {
                console.error('Invalid response data:', data);
                // Clear invalid data
                localStorage.removeItem('currentUser');
                localStorage.removeItem('tenant_token');
                document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                window.location.href = `/${tenantKey}/login`;
            }
        } catch (error) {
            console.error('Error fetching current user:', error);
            // Don't redirect on network errors, just set loading to false
            setLoading(false);
            toast({
                title: "خطا",
                description: "خطا در اتصال به سرور. لطفاً دوباره تلاش کنید.",
                variant: "destructive"
            });
        }
    };

    const fetchTasks = async (showLoading = true) => {
        try {
            if (showLoading) {
                setLoading(true);
            }
            const token = getAuthToken();
            const response = await fetch('/api/tenant/tasks', {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'X-Tenant-Key': params?.tenant_key || tenantKey,
                }
            });
            const data = await response.json();

            if (data.success) {
                setTasks(data.data || []);
            } else {
                toast({
                    title: "خطا",
                    description: data.message || "خطا در دریافت وظایف",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
            toast({
                title: "خطا",
                description: "خطا در دریافت وظایف",
                variant: "destructive",
            });
        } finally {
            if (showLoading) {
                setLoading(false);
            }
        }
    };

    const fetchUsers = async () => {
        try {
            const token = getAuthToken();
            const response = await fetch('/api/tenant/tasks/users', {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'X-Tenant-Key': params?.tenant_key || tenantKey,
                }
            });
            const data = await response.json();

            if (data.success) {
                setUsers(data.data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const isManager = () => {
        console.log('Current User Role:', currentUser?.role); // برای دیباگ
        return currentUser && ['ceo', 'مدیر', 'sales_manager', 'مدیر فروش', 'admin'].includes(currentUser.role);
    };

    const handleAddTask = async () => {
        if (!newTask.title || !newTask.assigned_to || newTask.assigned_to.length === 0 || !newTask.due_date) {
            toast({
                title: "خطا",
                description: "لطفاً تمام فیلدهای الزامی را پر کنید",
                variant: "destructive",
            });
            return;
        }

        try {
            const token = getAuthToken();
            const response = await fetch('/api/tenant/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : '',
                    'X-Tenant-Key': params?.tenant_key || tenantKey,
                },
                body: JSON.stringify(newTask),
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: "موفقیت",
                    description: "وظیفه با موفقیت ایجاد شد",
                });
                setShowAddTask(false);
                setNewTask({
                    title: '',
                    description: '',
                    assigned_to: [],
                    priority: 'medium',
                    due_date: '',
                    stages: [],
                    status: 'pending'
                } as CreateTaskInput);
                fetchTasks();
            } else {
                toast({
                    title: "خطا",
                    description: data.message || "خطا در ایجاد وظیفه",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error creating task:', error);
            toast({
                title: "خطا",
                description: "خطا در ایجاد وظیفه",
                variant: "destructive",
            });
        }
    };

    const handleTaskStatusChange = async (taskId: string, status: string, notes?: string) => {
        try {
            const token = getAuthToken();
            
            const response = await fetch('/api/tenant/tasks', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : '',
                    'X-Tenant-Key': params?.tenant_key || tenantKey
                },
                body: JSON.stringify({
                    taskId,
                    status,
                    completion_notes: notes,
                }),
            });

            const data = await response.json();

            if (data.success) {
                // آپدیت فوری state
                setTasks(prevTasks => 
                    prevTasks.map(task => 
                        task.id === taskId 
                            ? { 
                                ...task, 
                                status, 
                                completion_notes: notes,
                                completed_at: status === 'completed' ? new Date().toISOString() : task.completed_at
                              }
                            : task
                    )
                );
                
                toast({
                    title: "موفقیت",
                    description: status === 'completed' ? '✅ وظیفه تکمیل شد' : 
                                status === 'in_progress' ? '▶️ وظیفه شروع شد' : 
                                '⏸️ وظیفه متوقف شد',
                });
                
                // رفرش لیست از سرور (بدون نمایش loading)
                await fetchTasks(false);
                
                setShowCompleteDialog(false);
                setCompletionNotes('');
                setSelectedTask(null);
            } else {
                toast({
                    title: "خطا",
                    description: data.message || "خطا در به‌روزرسانی وظیفه",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('❌ خطا در تغییر وضعیت:', error);
            toast({
                title: "خطا",
                description: "خطا در به‌روزرسانی وظیفه",
                variant: "destructive",
            });
        }
    };

    const handleFileUpload = async (taskId: string, file: File) => {
        try {
            setUploadingFile(true);
            const formData = new FormData();
            formData.append('taskId', taskId);
            formData.append('file', file);

            const token = getAuthToken();
            const response = await fetch('/api/tenant/tasks/upload', {
                method: 'POST',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'X-Tenant-Key': params?.tenant_key || tenantKey,
                },
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: "موفقیت",
                    description: "فایل با موفقیت آپلود شد",
                });
                fetchTasks();
            } else {
                toast({
                    title: "خطا",
                    description: data.message || "خطا در آپلود فایل",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            toast({
                title: "خطا",
                description: "خطا در آپلود فایل",
                variant: "destructive",
            });
        } finally {
            setUploadingFile(false);
        }
    };

    const handleFileDelete = async (fileId: string) => {
        try {
            const token = getAuthToken();
            const response = await fetch(`/api/tenant/tasks/upload?fileId=${fileId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'X-Tenant-Key': params?.tenant_key || tenantKey,
                },
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: "موفقیت",
                    description: "فایل با موفقیت حذف شد",
                });
                fetchTasks();
            } else {
                toast({
                    title: "خطا",
                    description: data.message || "خطا در حذف فایل",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error deleting file:', error);
            toast({
                title: "خطا",
                description: "خطا در حذف فایل",
                variant: "destructive",
            });
        }
    };

    const getPriorityColor = (priority?: string) => {
        switch (priority) {
            case 'high': return 'text-red-800 bg-red-100 border-red-200';
            case 'medium': return 'text-yellow-800 bg-yellow-100 border-yellow-200';
            case 'low': return 'text-green-800 bg-green-100 border-green-200';
            default: return 'text-gray-800 bg-gray-100 border-gray-200';
        }
    };

    const getPriorityLabel = (priority?: string) => {
        switch (priority) {
            case 'high': return 'ضروری';
            case 'medium': return 'متوسط';
            case 'low': return 'عادی';
            default: return 'متوسط';
        }
    };

    const getStatusLabel = (status?: string) => {
        switch (status) {
            case 'pending': return 'در انتظار';
            case 'in_progress': return 'در حال انجام';
            case 'completed': return 'تکمیل شده';
            case 'cancelled': return 'لغو شده';
            default: return 'در انتظار';
        }
    };

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'pending': return 'text-blue-800 bg-blue-100 border-blue-200';
            case 'in_progress': return 'text-orange-800 bg-orange-100 border-orange-200';
            case 'completed': return 'text-green-800 bg-green-100 border-green-200';
            case 'cancelled': return 'text-red-800 bg-red-100 border-red-200';
            default: return 'text-gray-800 bg-gray-100 border-gray-200';
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 بایت';
        const k = 1024;
        const sizes = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const filteredTasks = tasks.filter(task => {
        switch (activeTab) {
            case 'pending':
                return task.status === 'pending';
            case 'in_progress':
                return task.status === 'in_progress';
            case 'completed':
                return task.status === 'completed';
            case 'all':
            default:
                return true;
        }
    });

    const taskStats = {
        total: tasks.length,
        pending: tasks.filter(t => t.status === 'pending').length,
        in_progress: tasks.filter(t => t.status === 'in_progress').length,
        completed: tasks.filter(t => t.status === 'completed').length,
        high_priority: tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length,
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground font-vazir">در حال بارگذاری...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in-up p-6 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 min-h-screen">
            {/* هدر با طراحی جدید */}
            <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-xl shadow-lg">
                        <CheckCircle2 className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold font-vazir bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                            مدیریت وظایف
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 font-vazir mt-1 flex items-center">
                            <Clock className="h-4 w-4 ml-1" />
                            مدیریت و پیگیری وظایف تیم
                        </p>
                    </div>
                </div>
                {isManager() && (
                    <Dialog open={showAddTask} onOpenChange={setShowAddTask}>
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-vazir shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-6 text-lg">
                                <Plus className="h-5 w-5 ml-2" />
                                وظیفه جدید
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle className="font-vazir text-lg">ایجاد وظیفه جدید</DialogTitle>
                                <DialogDescription className="font-vazir text-sm text-muted-foreground">
                                    مشخصات وظیفه جدید را وارد کنید
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium font-vazir">عنوان وظیفه *</label>
                                    <Input
                                        placeholder="عنوان وظیفه را وارد کنید"
                                        value={newTask.title}
                                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                        className="font-vazir"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium font-vazir">توضیحات</label>
                                    <Textarea
                                        placeholder="توضیحات وظیفه را وارد کنید"
                                        value={newTask.description}
                                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                        className="font-vazir"
                                        rows={3}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium font-vazir">اولویت</label>
                                        <Select
                                            value={newTask.priority}
                                            onValueChange={(value: 'low' | 'medium' | 'high') => setNewTask({ ...newTask, priority: value })}
                                        >
                                            <SelectTrigger className="font-vazir">
                                                <SelectValue placeholder="انتخاب اولویت" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="high" className="font-vazir">ضروری</SelectItem>
                                                <SelectItem value="medium" className="font-vazir">متوسط</SelectItem>
                                                <SelectItem value="low" className="font-vazir">عادی</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium font-vazir">تاریخ سررسید *</label>
                                        <PersianDatePicker
                                            value={newTask.due_date}
                                            onChange={(value) => setNewTask({ ...newTask, due_date: value })}
                                            placeholder="انتخاب تاریخ"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium font-vazir">محول به *</label>
                                    <Select
                                        value={newTask.assigned_to && newTask.assigned_to.length > 0 ? newTask.assigned_to[0] : ''}
                                        onValueChange={(value) => {
                                            if (value) {
                                                const currentAssigned = newTask.assigned_to || [];
                                                if (!currentAssigned.includes(value)) {
                                                    setNewTask({ ...newTask, assigned_to: [...currentAssigned, value] });
                                                }
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="font-vazir">
                                            <SelectValue placeholder="انتخاب همکار" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {users.map(user => (
                                                <SelectItem key={user.id} value={user.id} className="font-vazir">
                                                    <div className="flex items-center space-x-2 space-x-reverse">
                                                        <Avatar className="h-6 w-6">
                                                            <AvatarImage src={user.avatar} />
                                                            <AvatarFallback className="font-vazir bg-primary/10 text-primary text-xs">
                                                                {user.name.split(' ').map(n => n[0]).join('')}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm">{user.name}</span>
                                                            <span className="text-xs text-muted-foreground">{user.role}</span>
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {/* نمایش کاربران انتخاب شده */}
                                    {newTask.assigned_to && newTask.assigned_to.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {newTask.assigned_to.map(userId => {
                                                const user = users.find(u => u.id === userId);
                                                return user ? (
                                                    <Badge key={userId} variant="secondary" className="font-vazir">
                                                        {user.name}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-4 w-4 p-0 mr-1"
                                                            onClick={() => setNewTask({
                                                                ...newTask,
                                                                assigned_to: newTask.assigned_to?.filter(id => id !== userId) || []
                                                            })}
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                    </Badge>
                                                ) : null;
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Stage Management */}
                                <div className="mt-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="text-sm font-medium">مراحل انجام وظیفه</h4>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowStageDialog(true)}
                                            className="font-vazir"
                                        >
                                            <Plus className="ml-1 h-4 w-4" />
                                            افزودن مرحله
                                        </Button>
                                    </div>

                                    {newTask.stages && newTask.stages.length > 0 && (
                                        <div className="space-y-2 mb-4">
                                            {newTask.stages.map((stage, index) => (
                                                <div key={stage.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                    <span className="font-vazir">{stage.name}</span>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="secondary" className="font-vazir">
                                                            {index + 1}
                                                        </Badge>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                setNewTask({
                                                                    ...newTask,
                                                                    stages: newTask.stages?.filter(s => s.id !== stage.id) || []
                                                                });
                                                            }}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end space-x-2 space-x-reverse mt-6">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowAddTask(false)}
                                        className="font-vazir"
                                    >
                                        انصراف
                                    </Button>
                                    <Button
                                        onClick={handleAddTask}
                                        disabled={!newTask.title || !newTask.assigned_to?.length || !newTask.due_date}
                                        className="font-vazir bg-primary text-primary-foreground hover:bg-primary/90"
                                    >
                                        ایجاد وظیفه
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {/* Stage Creation Dialog */}
            <Dialog open={showStageDialog} onOpenChange={setShowStageDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="font-vazir">افزودن مرحله جدید</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">نام مرحله</label>
                            <Input
                                value={newStage.name}
                                onChange={(e) => setNewStage({ ...newStage, name: e.target.value })}
                                placeholder="نام مرحله را وارد کنید"
                                className="font-vazir"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">توضیحات مرحله (اختیاری)</label>
                            <Textarea
                                value={newStage.description}
                                onChange={(e) => setNewStage({ ...newStage, description: e.target.value })}
                                placeholder="توضیحات مرحله را وارد کنید"
                                className="font-vazir"
                            />
                        </div>
                        <div className="flex justify-end space-x-2 space-x-reverse">
                            <Button
                                variant="outline"
                                onClick={() => setShowStageDialog(false)}
                                className="font-vazir"
                            >
                                انصراف
                            </Button>
                            <Button
                                onClick={() => {
                                    if (newStage.name) {
                                        const newStageObj = {
                                            id: Math.random().toString(36).substr(2, 9),
                                            name: newStage.name,
                                            description: newStage.description,
                                            order: newTask.stages?.length || 0
                                        };

                                        setNewTask({
                                            ...newTask,
                                            stages: [...(newTask.stages || []), newStageObj]
                                        });
                                        setNewStage({ name: '', description: '', order: 0 });
                                        setShowStageDialog(false);
                                    }
                                }}
                                disabled={!newStage.name}
                                className="font-vazir"
                            >
                                افزودن
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* آمار سریع با طراحی جدید */}
            <div className="grid gap-4 md:grid-cols-5">
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium font-vazir text-white/90">کل وظایف</CardTitle>
                        <CheckCircle2 className="h-5 w-5 text-white/80" />
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-3xl font-bold font-vazir">{taskStats.total.toLocaleString('fa-IR')}</div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-teal-500 to-teal-600 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium font-vazir text-white/90">در انتظار</CardTitle>
                        <Clock className="h-5 w-5 text-white/80" />
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-3xl font-bold font-vazir">
                            {taskStats.pending.toLocaleString('fa-IR')}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-yellow-500 to-orange-500 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium font-vazir text-white/90">در حال انجام</CardTitle>
                        <Clock className="h-5 w-5 text-white/80" />
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-3xl font-bold font-vazir">
                            {taskStats.in_progress.toLocaleString('fa-IR')}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-500 to-emerald-600 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium font-vazir text-white/90">تکمیل شده</CardTitle>
                        <CheckCircle2 className="h-5 w-5 text-white/80" />
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-3xl font-bold font-vazir">
                            {taskStats.completed.toLocaleString('fa-IR')}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-red-500 to-pink-600 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium font-vazir text-white/90">ضروری</CardTitle>
                        <AlertCircle className="h-5 w-5 text-white/80" />
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-3xl font-bold font-vazir">
                            {taskStats.high_priority.toLocaleString('fa-IR')}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* تب‌های فیلتر با طراحی جدید */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 h-auto p-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border-0">
                    <TabsTrigger 
                        value="all" 
                        className="font-vazir data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all duration-300"
                    >
                        <div className="flex flex-col items-center py-3">
                            <CheckCircle2 className="h-5 w-5 mb-1" />
                            <span className="font-semibold">همه</span>
                            <span className="text-xs mt-1 font-bold">{taskStats.total}</span>
                        </div>
                    </TabsTrigger>
                    <TabsTrigger 
                        value="pending" 
                        className="font-vazir data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all duration-300"
                    >
                        <div className="flex flex-col items-center py-3">
                            <Clock className="h-5 w-5 mb-1" />
                            <span className="font-semibold">در انتظار</span>
                            <span className="text-xs mt-1 font-bold">{taskStats.pending}</span>
                        </div>
                    </TabsTrigger>
                    <TabsTrigger 
                        value="in_progress" 
                        className="font-vazir data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all duration-300"
                    >
                        <div className="flex flex-col items-center py-3">
                            <Clock className="h-5 w-5 mb-1" />
                            <span className="font-semibold">در حال انجام</span>
                            <span className="text-xs mt-1 font-bold">{taskStats.in_progress}</span>
                        </div>
                    </TabsTrigger>
                    <TabsTrigger 
                        value="completed" 
                        className="font-vazir data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all duration-300"
                    >
                        <div className="flex flex-col items-center py-3">
                            <CheckCircle2 className="h-5 w-5 mb-1" />
                            <span className="font-semibold">تکمیل شده</span>
                            <span className="text-xs mt-1 font-bold">{taskStats.completed}</span>
                        </div>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-6">
                    <Card className="border-0 shadow-xl bg-white dark:bg-gray-800">
                        <CardHeader className={`rounded-t-xl ${
                            activeTab === 'all' ? 'bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-b-4 border-blue-500' :
                            activeTab === 'pending' ? 'bg-gradient-to-r from-teal-500/10 to-teal-600/10 border-b-4 border-teal-500' :
                            activeTab === 'in_progress' ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-b-4 border-yellow-500' :
                            'bg-gradient-to-r from-green-500/10 to-emerald-600/10 border-b-4 border-green-500'
                        }`}>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center space-x-3 space-x-reverse font-vazir">
                                    <div className={`p-2 rounded-lg ${
                                        activeTab === 'all' ? 'bg-blue-500' :
                                        activeTab === 'pending' ? 'bg-teal-500' :
                                        activeTab === 'in_progress' ? 'bg-yellow-500' :
                                        'bg-green-500'
                                    }`}>
                                        <CheckCircle2 className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="text-xl">
                                        {activeTab === 'all' && 'همه وظایف'}
                                        {activeTab === 'pending' && 'وظایف در انتظار'}
                                        {activeTab === 'in_progress' && 'وظایف در حال انجام'}
                                        {activeTab === 'completed' && 'وظایف تکمیل شده'}
                                    </span>
                                    <Badge className={`mr-2 font-vazir text-white ${
                                        activeTab === 'all' ? 'bg-blue-600' :
                                        activeTab === 'pending' ? 'bg-teal-600' :
                                        activeTab === 'in_progress' ? 'bg-yellow-600' :
                                        'bg-green-600'
                                    }`}>
                                        {filteredTasks.length} وظیفه
                                    </Badge>
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-3">
                                {filteredTasks.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                            <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <h3 className="text-lg font-medium font-vazir mb-2">هیچ وظیفه‌ای یافت نشد</h3>
                                        <p className="text-sm text-muted-foreground font-vazir">
                                            {activeTab === 'pending' && 'هیچ وظیفه‌ای در انتظار نیست'}
                                            {activeTab === 'in_progress' && 'هیچ وظیفه‌ای در حال انجام نیست'}
                                            {activeTab === 'completed' && 'هیچ وظیفه‌ای تکمیل نشده است'}
                                            {activeTab === 'all' && 'وظیفه جدیدی ایجاد کنید'}
                                        </p>
                                    </div>
                                ) : (
                                    filteredTasks.map(task => (
                                        <div
                                            key={task.id}
                                            className={`flex items-start space-x-4 space-x-reverse p-5 border-2 rounded-xl transition-all duration-300 hover:shadow-lg ${
                                                task.status === 'completed'
                                                    ? 'border-green-300 bg-gradient-to-br from-green-50 to-green-100/50 dark:border-green-700 dark:from-green-900/20 dark:to-green-800/10'
                                                    : task.status === 'in_progress'
                                                    ? 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-yellow-100/50 dark:border-yellow-700 dark:from-yellow-900/20 dark:to-yellow-800/10'
                                                    : 'border-gray-200 bg-gradient-to-br from-white to-gray-50 hover:border-primary/40 dark:border-gray-700 dark:from-gray-900 dark:to-gray-800'
                                            }`}
                                        >
                                            <Checkbox
                                                checked={task.status === 'completed'}
                                                onCheckedChange={async (checked) => {
                                                    if (checked) {
                                                        setSelectedTask(task);
                                                        setShowCompleteDialog(true);
                                                    } else {
                                                        await handleTaskStatusChange(task.id, 'pending');
                                                    }
                                                }}
                                                className="mt-1"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h3 className={`font-medium font-vazir ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''
                                                            }`}>
                                                            {task.title}
                                                        </h3>
                                                        {task.description && (
                                                            <p className="text-sm text-muted-foreground font-vazir mt-1">
                                                                {task.description}
                                                            </p>
                                                        )}
                                                        <div className="flex items-center space-x-4 space-x-reverse mt-2">
                                                            <Badge className={`${getPriorityColor(task.priority)} font-vazir`}>
                                                                {getPriorityLabel(task.priority)}
                                                            </Badge>
                                                            <Badge className={`${getStatusColor(task.status)} font-vazir`}>
                                                                {getStatusLabel(task.status)}
                                                            </Badge>
                                                            {task.due_date && (
                                                                <div className="flex items-center text-sm text-muted-foreground">
                                                                    <Calendar className="h-4 w-4 ml-1" />
                                                                    <span className="font-vazir">
                                                                        {moment(task.due_date).format('jYYYY/jMM/jDD')}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {task.assigned_to_names && (
                                                                <div className="flex items-center text-sm text-muted-foreground">
                                                                    <Users className="h-4 w-4 ml-1" />
                                                                    <span className="font-vazir">{task.assigned_to_names}</span>
                                                                </div>
                                                            )}
                                                            {task.files && task.files.length > 0 && (
                                                                <div className="flex items-center text-sm text-muted-foreground">
                                                                    <FileText className="h-4 w-4 ml-1" />
                                                                    <span className="font-vazir">{task.files.length} فایل</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2 space-x-reverse">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedTask(task);
                                                                setShowTaskDetail(true);
                                                            }}
                                                            className="font-vazir"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        {task.status !== 'completed' && (
                                                            <>
                                                                {task.status === 'in_progress' ? (
                                                                    <>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={async () => {
                                                                                await handleTaskStatusChange(task.id, 'pending');
                                                                            }}
                                                                            className="font-vazir border-orange-300 text-orange-600 hover:bg-orange-50"
                                                                        >
                                                                            <Clock className="h-4 w-4 ml-1" />
                                                                            توقف
                                                                        </Button>
                                                                        <Button
                                                                            variant="default"
                                                                            size="sm"
                                                                            onClick={() => {
                                                                                setSelectedTask(task);
                                                                                setShowCompleteDialog(true);
                                                                            }}
                                                                            className="font-vazir bg-green-600 hover:bg-green-700"
                                                                        >
                                                                            <CheckCircle2 className="h-4 w-4 ml-1" />
                                                                            تکمیل
                                                                        </Button>
                                                                    </>
                                                                ) : (
                                                                    <Button
                                                                        variant="default"
                                                                        size="sm"
                                                                        onClick={async () => {
                                                                            await handleTaskStatusChange(task.id, 'in_progress');
                                                                        }}
                                                                        className="font-vazir bg-blue-600 hover:bg-blue-700"
                                                                    >
                                                                        <CheckCircle2 className="h-4 w-4 ml-1" />
                                                                        شروع
                                                                    </Button>
                                                                )}
                                                                <input
                                                                    type="file"
                                                                    id={`file-${task.id}`}
                                                                    className="hidden"
                                                                    onChange={(e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (file) {
                                                                            handleFileUpload(task.id, file);
                                                                        }
                                                                    }}
                                                                />
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => document.getElementById(`file-${task.id}`)?.click()}
                                                                    disabled={uploadingFile}
                                                                    className="font-vazir"
                                                                >
                                                                    <Upload className="h-4 w-4" />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* دیالوگ تکمیل وظیفه */}
            <AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="font-vazir">تکمیل وظیفه</AlertDialogTitle>
                        <AlertDialogDescription className="font-vazir">
                            آیا مطمئن هستید که این وظیفه تکمیل شده است؟
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 my-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium font-vazir">توضیحات تکمیل (اختیاری)</label>
                            <Textarea
                                placeholder="توضیحات مربوط به تکمیل وظیفه را وارد کنید"
                                value={completionNotes}
                                onChange={(e) => setCompletionNotes(e.target.value)}
                                className="font-vazir"
                                rows={3}
                            />
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="font-vazir">انصراف</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (selectedTask) {
                                    handleTaskStatusChange(selectedTask.id, 'completed', completionNotes);
                                }
                            }}
                            className="font-vazir"
                        >
                            تکمیل وظیفه
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* دیالوگ جزئیات وظیفه */}
            <Dialog open={showTaskDetail} onOpenChange={setShowTaskDetail}>
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="font-vazir text-lg">جزئیات وظیفه</DialogTitle>
                    </DialogHeader>
                    {selectedTask && (
                        <div className="space-y-4 mt-4">
                            <div>
                                <h3 className="font-medium font-vazir text-lg">{selectedTask.title}</h3>
                                {selectedTask.description && (
                                    <p className="text-muted-foreground font-vazir mt-2">{selectedTask.description}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium font-vazir text-muted-foreground">وضعیت</label>
                                    <Badge className={`${getStatusColor(selectedTask.status)} font-vazir mt-1`}>
                                        {getStatusLabel(selectedTask.status)}
                                    </Badge>
                                </div>
                                <div>
                                    <label className="text-sm font-medium font-vazir text-muted-foreground">اولویت</label>
                                    <Badge className={`${getPriorityColor(selectedTask.priority)} font-vazir mt-1`}>
                                        {getPriorityLabel(selectedTask.priority)}
                                    </Badge>
                                </div>
                            </div>

                            {selectedTask.due_date && (
                                <div>
                                    <label className="text-sm font-medium font-vazir text-muted-foreground">تاریخ سررسید</label>
                                    <p className="font-vazir mt-1">
                                        {moment(selectedTask.due_date).format('jYYYY/jMM/jDD - HH:mm')}
                                    </p>
                                </div>
                            )}

                            {selectedTask.assigned_to_names && (
                                <div>
                                    <label className="text-sm font-medium font-vazir text-muted-foreground">محول به</label>
                                    <p className="font-vazir mt-1">{selectedTask.assigned_to_names}</p>
                                </div>
                            )}

                            {selectedTask.assigned_by_name && (
                                <div>
                                    <label className="text-sm font-medium font-vazir text-muted-foreground">ایجاد شده توسط</label>
                                    <p className="font-vazir mt-1">{selectedTask.assigned_by_name}</p>
                                </div>
                            )}

                            {selectedTask.completion_notes && (
                                <div>
                                    <label className="text-sm font-medium font-vazir text-muted-foreground">توضیحات تکمیل</label>
                                    <p className="font-vazir mt-1">{selectedTask.completion_notes}</p>
                                </div>
                            )}

                            {selectedTask.files && selectedTask.files.length > 0 && (
                                <div>
                                    <label className="text-sm font-medium font-vazir text-muted-foreground">فایل‌های پیوست</label>
                                    <div className="space-y-2 mt-2">
                                        {selectedTask.files.map(file => (
                                            <div key={file.id} className="flex items-center justify-between p-2 border rounded">
                                                <div className="flex items-center space-x-2 space-x-reverse">
                                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                                    <div>
                                                        <p className="text-sm font-vazir">{file.original_name}</p>
                                                        <p className="text-xs text-muted-foreground font-vazir">
                                                            {formatFileSize(file.file_size)} • {file.uploaded_by_name}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2 space-x-reverse">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => window.open(file.file_path, '_blank')}
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleFileDelete(file.id)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end space-x-2 space-x-reverse mt-6">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowTaskDetail(false)}
                                    className="font-vazir"
                                >
                                    بستن
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}