'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, CheckCircle, XCircle, AlertCircle, Send, Settings, Info } from 'lucide-react';

interface EmailStatus {
    configured: boolean;
    defaultFrom: string;
    config: {
        host: string;
        port: number;
        secure: boolean;
        user: string;
    } | null;
    connectionTest?: boolean;
    lastChecked?: string;
}

export default function EmailSettingsPage() {
    const [emailStatus, setEmailStatus] = useState<EmailStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [testing, setTesting] = useState(false);
    const [testEmail, setTestEmail] = useState('');
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

    useEffect(() => {
        fetchEmailStatus();
    }, []);

    const fetchEmailStatus = async () => {
        try {
            const response = await fetch('/api/email/test');
            const data = await response.json();

            if (data.success) {
                setEmailStatus(data.data);
            }
        } catch (error) {
            console.error('Error fetching email status:', error);
        } finally {
            setLoading(false);
        }
    };

    const testEmailConnection = async () => {
        if (!testEmail) {
            setTestResult({ success: false, message: 'لطفاً ایمیل تست را وارد کنید' });
            return;
        }

        setTesting(true);
        setTestResult(null);

        try {
            const response = await fetch('/api/email/test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ testEmail }),
            });

            const data = await response.json();
            setTestResult({
                success: data.success,
                message: data.message
            });

            if (data.success) {
                // Refresh status after successful test
                await fetchEmailStatus();
            }
        } catch (error) {
            setTestResult({
                success: false,
                message: 'خطا در ارسال ایمیل تست'
            });
        } finally {
            setTesting(false);
        }
    };

    if (loading) {
        return <div className="p-6">در حال بارگذاری...</div>;
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Mail className="h-8 w-8 text-blue-600" />
                <div>
                    <h1 className="text-2xl font-bold">تنظیمات ایمیل</h1>
                    <p className="text-muted-foreground">مدیریت و تنظیم سیستم ارسال ایمیل</p>
                </div>
            </div>

            <Tabs defaultValue="status" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="status">وضعیت سیستم</TabsTrigger>
                    <TabsTrigger value="test">تست ایمیل</TabsTrigger>
                    <TabsTrigger value="guide">راهنمای تنظیم</TabsTrigger>
                </TabsList>

                {/* Status Tab */}
                <TabsContent value="status" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                وضعیت فعلی سیستم ایمیل
                            </CardTitle>
                            <CardDescription>
                                اطلاعات تنظیمات و وضعیت اتصال سیستم ایمیل
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {emailStatus ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>وضعیت تنظیمات</Label>
                                            <div className="flex items-center gap-2">
                                                {emailStatus.configured ? (
                                                    <>
                                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                                        <Badge variant="default" className="bg-green-100 text-green-800">
                                                            تنظیم شده
                                                        </Badge>
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle className="h-4 w-4 text-red-600" />
                                                        <Badge variant="destructive">
                                                            تنظیم نشده
                                                        </Badge>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>وضعیت اتصال</Label>
                                            <div className="flex items-center gap-2">
                                                {emailStatus.connectionTest ? (
                                                    <>
                                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                                        <Badge variant="default" className="bg-green-100 text-green-800">
                                                            متصل
                                                        </Badge>
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle className="h-4 w-4 text-red-600" />
                                                        <Badge variant="destructive">
                                                            قطع
                                                        </Badge>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {emailStatus.config && (
                                        <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                                            <h4 className="font-medium">جزئیات تنظیمات</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                                <div>
                                                    <span className="font-medium">سرور SMTP:</span>
                                                    <span className="mr-2">{emailStatus.config.host}</span>
                                                </div>
                                                <div>
                                                    <span className="font-medium">پورت:</span>
                                                    <span className="mr-2">{emailStatus.config.port}</span>
                                                </div>
                                                <div>
                                                    <span className="font-medium">کاربر:</span>
                                                    <span className="mr-2">{emailStatus.config.user}</span>
                                                </div>
                                                <div>
                                                    <span className="font-medium">امنیت:</span>
                                                    <span className="mr-2">
                                                        {emailStatus.config.secure ? 'SSL/TLS' : 'STARTTLS'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center pt-4">
                                        <span className="text-sm text-muted-foreground">
                                            آخرین بررسی: {emailStatus.lastChecked ?
                                                new Date(emailStatus.lastChecked).toLocaleString('fa-IR') :
                                                'نامشخص'
                                            }
                                        </span>
                                        <Button onClick={fetchEmailStatus} variant="outline" size="sm">
                                            بروزرسانی
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        خطا در دریافت وضعیت سیستم ایمیل
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Test Tab */}
                <TabsContent value="test" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Send className="h-5 w-5" />
                                تست ارسال ایمیل
                            </CardTitle>
                            <CardDescription>
                                برای اطمینان از عملکرد صحیح سیستم، ایمیل تست ارسال کنید
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="testEmail">ایمیل مقصد</Label>
                                <Input
                                    id="testEmail"
                                    type="email"
                                    placeholder="test@example.com"
                                    value={testEmail}
                                    onChange={(e) => setTestEmail(e.target.value)}
                                />
                            </div>

                            <Button
                                onClick={testEmailConnection}
                                disabled={testing || !emailStatus?.configured}
                                className="w-full"
                            >
                                {testing ? 'در حال ارسال...' : 'ارسال ایمیل تست'}
                            </Button>

                            {testResult && (
                                <Alert className={testResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                                    {testResult.success ? (
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <XCircle className="h-4 w-4 text-red-600" />
                                    )}
                                    <AlertDescription className={testResult.success ? 'text-green-800' : 'text-red-800'}>
                                        {testResult.message}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {!emailStatus?.configured && (
                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        سیستم ایمیل تنظیم نشده است. لطفاً ابتدا تنظیمات را انجام دهید.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Guide Tab */}
                <TabsContent value="guide" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Info className="h-5 w-5" />
                                راهنمای تنظیم ایمیل
                            </CardTitle>
                            <CardDescription>
                                مراحل تنظیم سیستم ایمیل برای ارائه‌دهندگان مختلف
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <h4 className="font-medium text-lg">تنظیم Gmail</h4>
                                <div className="space-y-2 text-sm">
                                    <p>1. به تنظیمات حساب Gmail خود بروید</p>
                                    <p>2. "امنیت" → "تأیید هویت دو مرحله‌ای" را فعال کنید</p>
                                    <p>3. "رمزهای عبور برنامه" → "ایجاد رمز عبور برنامه" را انتخاب کنید</p>
                                    <p>4. رمز عبور 16 رقمی را در فایل .env.local قرار دهید:</p>
                                    <div className="bg-gray-100 p-3 rounded font-mono text-xs">
                                        EMAIL_HOST=smtp.gmail.com<br />
                                        EMAIL_PORT=587<br />
                                        EMAIL_SECURE=false<br />
                                        EMAIL_USER=your-email@gmail.com<br />
                                        EMAIL_PASS=your-16-digit-app-password
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-medium text-lg">تنظیم Outlook/Hotmail</h4>
                                <div className="space-y-2 text-sm">
                                    <p>1. به تنظیمات حساب Microsoft خود بروید</p>
                                    <p>2. "امنیت" → "تأیید هویت دو مرحله‌ای" را فعال کنید</p>
                                    <p>3. "رمز عبور برنامه" ایجاد کنید</p>
                                    <p>4. تنظیمات زیر را در .env.local قرار دهید:</p>
                                    <div className="bg-gray-100 p-3 rounded font-mono text-xs">
                                        EMAIL_HOST=smtp-mail.outlook.com<br />
                                        EMAIL_PORT=587<br />
                                        EMAIL_SECURE=false<br />
                                        EMAIL_USER=your-email@outlook.com<br />
                                        EMAIL_PASS=your-app-password
                                    </div>
                                </div>
                            </div>

                            <Alert>
                                <Info className="h-4 w-4" />
                                <AlertDescription>
                                    پس از تغییر تنظیمات، سرور را مجدداً راه‌اندازی کنید تا تغییرات اعمال شود.
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}