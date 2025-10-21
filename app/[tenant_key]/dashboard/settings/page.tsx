'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Settings,
  Mail,
  Database,
  Shield,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Send,
  RefreshCw,
  Clock,
  Users,
  FileText,
  Loader2
} from 'lucide-react';
import { useSystemStatus } from '@/hooks/useSystemStatus';
import { useBackupManagement } from '@/hooks/useBackupManagement';
import { toast } from 'sonner';
import BackupHistoryTable from '@/components/settings/BackupHistoryTable';
import SystemStatusWidget from '@/components/settings/SystemStatusWidget';
import SystemStatsOverview from '@/components/settings/SystemStatsOverview';
import BackupSystemStatus from '@/components/settings/BackupSystemStatus';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('status');
  const [testEmail, setTestEmail] = useState('');
  const [backupEmail, setBackupEmail] = useState('');
  const [showFullHistory, setShowFullHistory] = useState(false);

  const { status: systemStatus, loading: statusLoading, error: statusError, refresh } = useSystemStatus();
  const {
    loading: backupLoading,
    config: backupConfig,
    history: backupHistory,
    fetchConfig,
    saveConfig,
    createManualBackup,
    fetchHistory,
    testEmail: sendTestEmail
  } = useBackupManagement();

  useEffect(() => {
    fetchConfig();
    fetchHistory();
  }, [fetchConfig, fetchHistory]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'connected':
      case 'enabled':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'inactive':
      case 'disconnected':
      case 'disabled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
      case 'connected':
      case 'enabled':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">فعال</Badge>;
      case 'inactive':
      case 'disconnected':
      case 'disabled':
        return <Badge variant="destructive">غیرفعال</Badge>;
      default:
        return <Badge variant="secondary">نامشخص</Badge>;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'همین الان';
    if (diffInMinutes < 60) return `${diffInMinutes} دقیقه پیش`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} ساعت پیش`;
    return `${Math.floor(diffInMinutes / 1440)} روز پیش`;
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast.error('لطفاً آدرس ایمیل را وارد کنید');
      return;
    }
    await sendTestEmail(testEmail);
  };

  const handleManualBackup = async () => {
    await createManualBackup(backupEmail || undefined);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4 space-x-reverse">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center">
          <Settings className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-vazir">تنظیمات سیستم</h1>
          <p className="text-muted-foreground">مدیریت و نظارت بر سرویس‌های سیستم</p>
        </div>
      </div>

      {/* Status Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statusLoading ? (
          <>
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-l-4 border-l-gray-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-6 w-16 mb-2" />
                  <Skeleton className="h-3 w-32 mb-1" />
                  <Skeleton className="h-4 w-40" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : systemStatus ? (
          <>
            <Card className={`border-l-4 ${systemStatus.emailService.status === 'active' ? 'border-l-green-500' : 'border-l-red-500'}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-vazir">سرویس ایمیل</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 space-x-reverse mb-2">
                  {getStatusIcon(systemStatus.emailService.status)}
                  {getStatusBadge(systemStatus.emailService.status)}
                </div>
                <p className="text-xs text-muted-foreground">
                  آخرین بررسی: {formatTimeAgo(systemStatus.emailService.lastCheck)}
                </p>
                <p className="text-sm mt-1">{systemStatus.emailService.message}</p>
              </CardContent>
            </Card>

            <Card className={`border-l-4 ${systemStatus.database.status === 'connected' ? 'border-l-blue-500' : 'border-l-red-500'}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-vazir">دیتابیس</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 space-x-reverse mb-2">
                  {getStatusIcon(systemStatus.database.status)}
                  {getStatusBadge(systemStatus.database.status)}
                </div>
                <p className="text-xs text-muted-foreground">
                  آخرین بررسی: {formatTimeAgo(systemStatus.database.lastCheck)}
                </p>
                <p className="text-sm mt-1">
                  حجم: {systemStatus.database.details?.size || 'نامشخص'}
                </p>
              </CardContent>
            </Card>

            <Card className={`border-l-4 ${systemStatus.backupService.status === 'enabled' ? 'border-l-purple-500' : 'border-l-gray-500'}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-vazir">بک‌آپ خودکار</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 space-x-reverse mb-2">
                  {getStatusIcon(systemStatus.backupService.status)}
                  {getStatusBadge(systemStatus.backupService.status)}
                </div>
                <p className="text-xs text-muted-foreground">
                  آخرین بررسی: {formatTimeAgo(systemStatus.backupService.lastCheck)}
                </p>
                <p className="text-sm mt-1">{systemStatus.backupService.message}</p>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="col-span-3 text-center py-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">خطا در دریافت وضعیت سیستم</p>
            <Button variant="outline" onClick={refresh} className="mt-2">
              <RefreshCw className="h-4 w-4 ml-2" />
              تلاش مجدد
            </Button>
          </div>
        )}
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="status" className="font-vazir">
            <Activity className="h-4 w-4 ml-2" />
            وضعیت
          </TabsTrigger>
          <TabsTrigger value="email" className="font-vazir">
            <Mail className="h-4 w-4 ml-2" />
            ایمیل
          </TabsTrigger>
          <TabsTrigger value="backup" className="font-vazir">
            <Database className="h-4 w-4 ml-2" />
            بک‌آپ
          </TabsTrigger>
          <TabsTrigger value="general" className="font-vazir">
            <Settings className="h-4 w-4 ml-2" />
            عمومی
          </TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="font-vazir">وضعیت کلی سیستم</CardTitle>
                <CardDescription>
                  نمایش جزئیات وضعیت تمام سرویس‌های سیستم
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-medium font-vazir">سرویس‌های اصلی</h4>
                  <div className="space-y-2">
                    {systemStatus ? (
                      <>
                        <div className={`flex items-center justify-between p-3 rounded-lg ${systemStatus.emailService.status === 'active' ? 'bg-green-50' : 'bg-red-50'
                          }`}>
                          <span className="text-sm">سرویس ایمیل</span>
                          {getStatusIcon(systemStatus.emailService.status)}
                        </div>
                        <div className={`flex items-center justify-between p-3 rounded-lg ${systemStatus.database.status === 'connected' ? 'bg-green-50' : 'bg-red-50'
                          }`}>
                          <span className="text-sm">اتصال دیتابیس</span>
                          {getStatusIcon(systemStatus.database.status)}
                        </div>
                        <div className={`flex items-center justify-between p-3 rounded-lg ${systemStatus.backupService.status === 'enabled' ? 'bg-green-50' : 'bg-gray-50'
                          }`}>
                          <span className="text-sm">بک‌آپ خودکار</span>
                          {getStatusIcon(systemStatus.backupService.status)}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">در حال بارگذاری...</p>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-medium font-vazir">آمار سیستم</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">حجم دیتابیس</span>
                      <span className="text-sm font-medium">
                        {systemStatus?.database.details?.size || 'در حال محاسبه...'}
                      </span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">تعداد کاربران</span>
                      <span className="text-sm font-medium">
                        {systemStatus?.database.details?.userCount || 0}
                      </span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">تعداد مشتریان</span>
                      <span className="text-sm font-medium">
                        {systemStatus?.database.details?.customerCount || 0}
                      </span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">تعداد جداول</span>
                      <span className="text-sm font-medium">
                        {systemStatus?.database.details?.tableCount || 0}
                      </span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">تعداد بک‌آپ‌ها</span>
                      <span className="text-sm font-medium">
                        {systemStatus?.backupService.details?.totalBackups || 0}
                      </span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">آخرین فعالیت</span>
                      <span className="text-sm font-medium">
                        {systemStatus ? formatTimeAgo(systemStatus.lastUpdated) : '-'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Real-time System Status */}
            <SystemStatusWidget />
          </div>

          {/* Comprehensive System Statistics */}
          <SystemStatsOverview />
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-vazir">تنظیمات سرویس ایمیل</CardTitle>
              <CardDescription>
                پیکربندی و تست سرویس ارسال ایمیل
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">وضعیت سرویس ایمیل</p>
                    <p className="text-sm text-muted-foreground">
                      {systemStatus?.emailService.message || 'در حال بررسی...'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  {systemStatus && getStatusIcon(systemStatus.emailService.status)}
                  {systemStatus && getStatusBadge(systemStatus.emailService.status)}
                </div>
              </div>

              <Separator />

              {/* Test Email */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium font-vazir mb-2">تست ارسال ایمیل</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    برای اطمینان از عملکرد صحیح سرویس ایمیل، یک ایمیل تست ارسال کنید
                  </p>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="test-email">آدرس ایمیل مقصد</Label>
                    <Input
                      id="test-email"
                      type="email"
                      placeholder="test@example.com"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={handleTestEmail}
                      disabled={backupLoading || !testEmail}
                    >
                      {backupLoading ? (
                        <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 ml-2" />
                      )}
                      ارسال تست
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Email Configuration */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium font-vazir mb-2">پیکربندی SMTP</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    تنظیمات سرور SMTP برای ارسال ایمیل
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smtp-host">سرور SMTP</Label>
                    <Input
                      id="smtp-host"
                      placeholder="smtp.gmail.com"
                      className="mt-1"
                      disabled
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtp-port">پورت</Label>
                    <Input
                      id="smtp-port"
                      placeholder="587"
                      className="mt-1"
                      disabled
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtp-user">نام کاربری</Label>
                    <Input
                      id="smtp-user"
                      placeholder="your-email@gmail.com"
                      className="mt-1"
                      disabled
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtp-password">رمز عبور</Label>
                    <Input
                      id="smtp-password"
                      type="password"
                      placeholder="••••••••"
                      className="mt-1"
                      disabled
                    />
                  </div>
                </div>

                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    پیکربندی SMTP در نسخه‌های آینده فعال خواهد شد
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          {/* Backup System Status */}
          <BackupSystemStatus />

          {/* Manual Backup */}
          <Card>
            <CardHeader>
              <CardTitle className="font-vazir">بک‌آپ دستی</CardTitle>
              <CardDescription>
                ایجاد بک‌آپ فوری از دیتابیس
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="backup-email">ایمیل مقصد (اختیاری)</Label>
                  <Input
                    id="backup-email"
                    type="email"
                    placeholder="backup@example.com"
                    value={backupEmail}
                    onChange={(e) => setBackupEmail(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    در صورت وارد کردن ایمیل، فایل بک‌آپ به این آدرس ارسال می‌شود
                  </p>
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleManualBackup}
                    disabled={backupLoading}
                  >
                    {backupLoading ? (
                      <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 ml-2" />
                    )}
                    ایجاد بک‌آپ
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Automatic Backup Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="font-vazir">بک‌آپ خودکار</CardTitle>
              <CardDescription>
                تنظیم زمان‌بندی بک‌آپ خودکار دیتابیس
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {backupConfig ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="backup-enabled" className="text-base font-medium">
                        فعال‌سازی بک‌آپ خودکار
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        بک‌آپ خودکار بر اساس زمان‌بندی تعریف شده
                      </p>
                    </div>
                    <Switch
                      id="backup-enabled"
                      checked={backupConfig.enabled}
                      onCheckedChange={(checked) => {
                        const newConfig = { ...backupConfig, enabled: checked };
                        saveConfig(newConfig);
                      }}
                    />
                  </div>

                  {backupConfig.enabled && (
                    <>
                      <Separator />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="backup-schedule">دوره تکرار</Label>
                          <Select
                            value={backupConfig.schedule}
                            onValueChange={(value: 'daily' | 'weekly' | 'monthly') => {
                              const newConfig = { ...backupConfig, schedule: value };
                              saveConfig(newConfig);
                            }}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">روزانه</SelectItem>
                              <SelectItem value="weekly">هفتگی</SelectItem>
                              <SelectItem value="monthly">ماهانه</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="backup-time">زمان اجرا</Label>
                          <Input
                            id="backup-time"
                            type="time"
                            value={backupConfig.time}
                            onChange={(e) => {
                              const newConfig = { ...backupConfig, time: e.target.value };
                              saveConfig(newConfig);
                            }}
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="backup-retention">مدت نگهداری (روز)</Label>
                        <Input
                          id="backup-retention"
                          type="number"
                          min="1"
                          max="365"
                          value={backupConfig.retentionDays}
                          onChange={(e) => {
                            const newConfig = { ...backupConfig, retentionDays: parseInt(e.target.value) };
                            saveConfig(newConfig);
                          }}
                          className="mt-1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          فایل‌های بک‌آپ پس از این مدت حذف می‌شوند
                        </p>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">در حال بارگذاری تنظیمات...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Backup History */}
          <Card>
            <CardHeader>
              <CardTitle className="font-vazir">تاریخچه بک‌آپ</CardTitle>
              <CardDescription>
                آخرین بک‌آپ‌های انجام شده
              </CardDescription>
            </CardHeader>
            <CardContent>
              {backupHistory.length > 0 ? (
                <div className="space-y-3">
                  {backupHistory.slice(0, 5).map((backup) => (
                    <div key={backup.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div className={`h-2 w-2 rounded-full ${backup.status === 'completed' ? 'bg-green-500' :
                          backup.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                          }`} />
                        <div>
                          <p className="font-medium text-sm">
                            {backup.type === 'manual' ? 'بک‌آپ دستی' : 'بک‌آپ خودکار'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(backup.createdAt).toLocaleString('fa-IR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        {backup.fileSizeFormatted && (
                          <span className="text-xs text-muted-foreground">
                            {backup.fileSizeFormatted}
                          </span>
                        )}
                        {backup.downloadUrl && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={backup.downloadUrl} download>
                              <Download className="h-3 w-3" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="text-center pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFullHistory(true)}
                    >
                      <FileText className="h-4 w-4 ml-2" />
                      مشاهده همه
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">هنوز بک‌آپی ایجاد نشده است</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-4">
          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle className="font-vazir">اطلاعات سیستم</CardTitle>
              <CardDescription>
                جزئیات فنی و وضعیت کلی سیستم
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">نسخه سیستم</span>
                    <span className="text-sm">1.0.0</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">آخرین بروزرسانی</span>
                    <span className="text-sm">{new Date().toLocaleDateString('fa-IR')}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">حجم دیتابیس</span>
                    <span className="text-sm">
                      {systemStatus?.database.details?.size || 'در حال محاسبه...'}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">تعداد کاربران</span>
                    <span className="text-sm">
                      {systemStatus?.database.details?.userCount || 0}
                    </span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">تعداد مشتریان</span>
                    <span className="text-sm">
                      {systemStatus?.database.details?.customerCount || 0}
                    </span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">آخرین فعالیت</span>
                    <span className="text-sm">
                      {systemStatus ? formatTimeAgo(systemStatus.lastUpdated) : '-'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Monitoring */}
          <Card>
            <CardHeader>
              <CardTitle className="font-vazir">نظارت بر سیستم</CardTitle>
              <CardDescription>
                تنظیمات مربوط به نظارت و هشدارهای سیستم
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">
                    نظارت خودکار
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    بررسی خودکار وضعیت سرویس‌ها هر 5 دقیقه
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">آستانه‌های هشدار</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="cpu-threshold">استفاده از CPU (%)</Label>
                    <Input
                      id="cpu-threshold"
                      type="number"
                      defaultValue="80"
                      min="0"
                      max="100"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="memory-threshold">استفاده از حافظه (%)</Label>
                    <Input
                      id="memory-threshold"
                      type="number"
                      defaultValue="90"
                      min="0"
                      max="100"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="disk-threshold">استفاده از دیسک (%)</Label>
                    <Input
                      id="disk-threshold"
                      type="number"
                      defaultValue="85"
                      min="0"
                      max="100"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">
                    ارسال هشدار ایمیل
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    ارسال ایمیل در صورت بروز مشکل در سیستم
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Maintenance */}
          <Card>
            <CardHeader>
              <CardTitle className="font-vazir">نگهداری سیستم</CardTitle>
              <CardDescription>
                ابزارهای نگهداری و بهینه‌سازی سیستم
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                  <div className="flex items-center space-x-2 space-x-reverse mb-2">
                    <Database className="h-5 w-5" />
                    <span className="font-medium">بهینه‌سازی دیتابیس</span>
                  </div>
                  <p className="text-sm text-muted-foreground text-right">
                    بهینه‌سازی جداول و ایندکس‌های دیتابیس
                  </p>
                </Button>

                <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                  <div className="flex items-center space-x-2 space-x-reverse mb-2">
                    <FileText className="h-5 w-5" />
                    <span className="font-medium">پاکسازی لاگ‌ها</span>
                  </div>
                  <p className="text-sm text-muted-foreground text-right">
                    حذف فایل‌های لاگ قدیمی و غیرضروری
                  </p>
                </Button>

                <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                  <div className="flex items-center space-x-2 space-x-reverse mb-2">
                    <RefreshCw className="h-5 w-5" />
                    <span className="font-medium">راه‌اندازی مجدد سرویس‌ها</span>
                  </div>
                  <p className="text-sm text-muted-foreground text-right">
                    راه‌اندازی مجدد سرویس‌های سیستم
                  </p>
                </Button>

                <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                  <div className="flex items-center space-x-2 space-x-reverse mb-2">
                    <Activity className="h-5 w-5" />
                    <span className="font-medium">بررسی سلامت سیستم</span>
                  </div>
                  <p className="text-sm text-muted-foreground text-right">
                    اجرای تست‌های کامل سلامت سیستم
                  </p>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Full Backup History Modal */}
      {showFullHistory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <BackupHistoryTable onClose={() => setShowFullHistory(false)} />
          </div>
        </div>
      )}
    </div>
  );
}