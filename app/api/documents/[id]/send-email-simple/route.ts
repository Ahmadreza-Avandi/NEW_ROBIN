import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { getUserFromToken } from '@/lib/auth';

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'crm_system',
    charset: 'utf8mb4'
};

// ارسال سند از طریق ایمیل (نسخه ساده برای تست)
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        console.log('📧 درخواست ارسال ایمیل سند:', params.id);

        const user = await getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 });
        }

        const { emails, subject, message, includeAttachment = true } = await request.json();
        console.log('📧 اطلاعات درخواست:', { emails, subject, message, includeAttachment });

        // اعتبارسنجی ورودی
        if (!emails || !Array.isArray(emails) || emails.length === 0) {
            return NextResponse.json({ error: 'ایمیل‌ها الزامی است' }, { status: 400 });
        }

        // بررسی فرمت ایمیل‌ها
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const invalidEmails = emails.filter(email => !emailRegex.test(email));
        if (invalidEmails.length > 0) {
            return NextResponse.json({
                error: `فرمت ایمیل‌های زیر نامعتبر است: ${invalidEmails.join(', ')}`
            }, { status: 400 });
        }

        const connection = await mysql.createConnection(dbConfig);

        try {
            // بررسی وجود سند
            const [documents] = await connection.execute(
                'SELECT * FROM documents WHERE id = ? AND status = "active"',
                [params.id]
            );

            if ((documents as any[]).length === 0) {
                return NextResponse.json({ error: 'سند یافت نشد' }, { status: 404 });
            }

            const document = (documents as any[])[0];
            console.log('📄 سند یافت شد:', document.title);

            // بررسی دسترسی کاربر به سند
            if (user.role !== 'ceo' && document.uploaded_by !== user.id) {
                const [permissions] = await connection.execute(
                    `SELECT * FROM document_permissions 
                     WHERE document_id = ? AND user_id = ? AND permission_type IN ('view', 'download', 'share', 'admin') AND is_active = 1`,
                    [params.id, user.id]
                );

                if ((permissions as any[]).length === 0) {
                    return NextResponse.json({ error: 'دسترسی به این سند ندارید' }, { status: 403 });
                }
            }

            // شبیه‌سازی ارسال ایمیل (بدون ارسال واقعی)
            console.log('📧 شبیه‌سازی ارسال ایمیل...');

            const sentEmails: string[] = [];
            const failedEmails: string[] = [];

            // شبیه‌سازی ارسال به هر گیرنده
            for (const email of emails) {
                console.log(`📤 شبیه‌سازی ارسال به: ${email}`);

                // شبیه‌سازی تاخیر
                await new Promise(resolve => setTimeout(resolve, 500));

                // 90% احتمال موفقیت
                if (Math.random() > 0.1) {
                    sentEmails.push(email);
                    console.log(`✅ ارسال موفق به: ${email}`);
                } else {
                    failedEmails.push(email);
                    console.log(`❌ ارسال ناموفق به: ${email}`);
                }
            }

            // ثبت فعالیت در لاگ
            await connection.execute(
                `INSERT INTO document_activity_log (id, document_id, user_id, action, details, ip_address) 
                 VALUES (UUID(), ?, ?, 'email_sent_simulation', ?, ?)`,
                [
                    params.id,
                    user.id,
                    JSON.stringify({
                        emails: sentEmails,
                        subject,
                        message,
                        includeAttachment,
                        failedEmails,
                        simulation: true
                    }),
                    request.ip || 'unknown'
                ]
            );

            // به‌روزرسانی آمار سند
            if (sentEmails.length > 0) {
                await connection.execute(
                    'UPDATE documents SET share_count = share_count + ? WHERE id = ?',
                    [sentEmails.length, params.id]
                );
            }

            const totalSent = sentEmails.length;
            const totalFailed = failedEmails.length;

            console.log(`📊 نتیجه: ${totalSent} موفق، ${totalFailed} ناموفق`);

            return NextResponse.json({
                success: totalSent > 0,
                message: totalFailed === 0
                    ? `سند با موفقیت به ${totalSent} نفر ارسال شد (شبیه‌سازی)`
                    : totalSent === 0
                        ? 'خطا در ارسال سند به همه گیرندگان (شبیه‌سازی)'
                        : `سند به ${totalSent} نفر ارسال شد، ${totalFailed} نفر ناموفق (شبیه‌سازی)`,
                sentEmails,
                failedEmails,
                totalSent,
                totalFailed,
                simulation: true
            });

        } finally {
            await connection.end();
        }

    } catch (error: any) {
        console.error('❌ خطا در ارسال سند:', error);
        return NextResponse.json({
            success: false,
            error: 'خطا در ارسال سند',
            details: error.message
        }, { status: 500 });
    }
}