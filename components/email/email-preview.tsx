'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, Send, Code } from 'lucide-react';

interface EmailPreviewProps {
    initialContent?: string;
    initialSubject?: string;
}

export function EmailPreview({ initialContent = '', initialSubject = 'پیش‌نمایش ایمیل' }: EmailPreviewProps) {
    const [content, setContent] = useState(initialContent);
    const [subject, setSubject] = useState(initialSubject);
    const [showHtml, setShowHtml] = useState(false);

    // تابع ایجاد HTML کامل ایمیل (مشابه wrapInEmailTemplate)
    const generateEmailHtml = (content: string, subject: string) => {
        return `
<!DOCTYPE html>
<html dir="rtl" lang="fa">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Vazirmatn', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.7;
            color: #1f2937;
            background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 50%, #ffffff 100%);
            padding: 20px;
            direction: rtl;
        }
        
        .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .email-header {
            background: linear-gradient(135deg, #00BCD4 0%, #4CAF50 50%, #FF9800 100%);
            padding: 40px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .email-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
            opacity: 0.3;
        }
        
        .email-header .logo {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 60px;
            height: 60px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            margin-bottom: 20px;
            position: relative;
            z-index: 1;
        }
        
        .email-header h1 {
            color: white;
            font-size: 28px;
            font-weight: 700;
            margin: 0;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            position: relative;
            z-index: 1;
        }
        
        .email-header .subtitle {
            color: rgba(255, 255, 255, 0.9);
            font-size: 16px;
            font-weight: 400;
            margin-top: 8px;
            position: relative;
            z-index: 1;
        }
        
        .email-body {
            padding: 40px 30px;
            background: white;
            position: relative;
        }
        
        .email-body h2 {
            color: #00BCD4;
            font-size: 22px;
            font-weight: 600;
            margin-bottom: 20px;
            border-right: 4px solid #00BCD4;
            padding-right: 15px;
        }
        
        .email-body p {
            margin-bottom: 16px;
            color: #374151;
            font-size: 16px;
            line-height: 1.7;
        }
        
        .email-body strong {
            color: #1f2937;
            font-weight: 600;
        }
        
        .button {
            display: inline-block;
            padding: 14px 28px;
            background: linear-gradient(135deg, #00BCD4 0%, #4CAF50 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 500;
            font-size: 16px;
            margin: 20px 0;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            border: none;
            cursor: pointer;
        }
        
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            background: linear-gradient(135deg, #00ACC1 0%, #43A047 100%);
        }
        
        .button-secondary {
            background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
        }
        
        .button-secondary:hover {
            background: linear-gradient(135deg, #FB8C00 0%, #EF6C00 100%);
        }
        
        .highlight-box {
            background: linear-gradient(135deg, rgba(0, 188, 212, 0.1) 0%, rgba(76, 175, 80, 0.1) 100%);
            border: 1px solid rgba(0, 188, 212, 0.2);
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
            position: relative;
        }
        
        .highlight-box::before {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 4px;
            height: 100%;
            background: linear-gradient(135deg, #00BCD4 0%, #4CAF50 100%);
            border-radius: 0 12px 12px 0;
        }
        
        .email-footer {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            padding: 30px;
            text-align: center;
            border-top: 1px solid rgba(0, 188, 212, 0.1);
            position: relative;
        }
        
        .email-footer p {
            color: #64748b;
            font-size: 14px;
            margin-bottom: 8px;
            line-height: 1.6;
        }
        
        .email-footer .company-info {
            color: #00BCD4;
            font-weight: 500;
            font-size: 15px;
            margin-bottom: 12px;
        }
        
        .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent 0%, rgba(0, 188, 212, 0.3) 50%, transparent 100%);
            margin: 30px 0;
        }
        
        @media only screen and (max-width: 600px) {
            body {
                padding: 10px;
            }
            
            .email-wrapper {
                border-radius: 12px;
            }
            
            .email-header {
                padding: 30px 20px;
            }
            
            .email-header h1 {
                font-size: 24px;
            }
            
            .email-body {
                padding: 30px 20px;
            }
            
            .email-footer {
                padding: 20px;
            }
            
            .button {
                display: block;
                text-align: center;
                width: 100%;
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="email-header">
            <div class="logo">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7M3 7L12 13L21 7M3 7V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <h1>سیستم مدیریت ارتباط با مشتری</h1>
            <div class="subtitle">پلتفرم هوشمند CRM</div>
        </div>
        
        <div class="email-body">
            ${content.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>')}
        </div>
        
        <div class="divider"></div>
        
        <div class="email-footer">
            <div class="company-info">سیستم مدیریت ارتباط با مشتری (CRM)</div>
            <p>این پیام به صورت خودکار از سیستم ارسال شده است</p>
            <p>تاریخ ارسال: ${new Date().toLocaleDateString('fa-IR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        })}</p>
            <p style="margin-top: 15px; font-size: 12px; color: #94a3b8;">
                اگر این ایمیل برای شما ارسال نشده، لطفاً آن را نادیده بگیرید
            </p>
        </div>
    </div>
</body>
</html>`;
    };

    const emailHtml = generateEmailHtml(content, subject);

    return (
        <div className="space-y-6">
            {/* کنترل‌ها */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        پیش‌نمایش ایمیل
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="subject">موضوع ایمیل</Label>
                        <Input
                            id="subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="موضوع ایمیل را وارد کنید..."
                        />
                    </div>

                    <div>
                        <Label htmlFor="content">محتوای ایمیل</Label>
                        <Textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="محتوای ایمیل را وارد کنید..."
                            rows={8}
                            className="font-vazir"
                        />
                        <p className="text-sm text-muted-foreground mt-2">
                            می‌توانید از **متن پررنگ** و *متن کج* استفاده کنید
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant={showHtml ? "outline" : "default"}
                            onClick={() => setShowHtml(false)}
                            size="sm"
                        >
                            <Eye className="h-4 w-4 mr-2" />
                            پیش‌نمایش
                        </Button>
                        <Button
                            variant={showHtml ? "default" : "outline"}
                            onClick={() => setShowHtml(true)}
                            size="sm"
                        >
                            <Code className="h-4 w-4 mr-2" />
                            کد HTML
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* پیش‌نمایش */}
            <Card>
                <CardContent className="p-0">
                    {showHtml ? (
                        <div className="p-4">
                            <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto max-h-96">
                                <code>{emailHtml}</code>
                            </pre>
                        </div>
                    ) : (
                        <div className="border rounded-lg overflow-hidden">
                            <iframe
                                srcDoc={emailHtml}
                                className="w-full h-96 border-0"
                                title="پیش‌نمایش ایمیل"
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}