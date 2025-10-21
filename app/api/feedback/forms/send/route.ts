import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import { executeQuery, executeSingle } from '@/lib/database';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
    try {
        const user = await getUserFromToken(req);
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'غیر مجاز' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { formId, customerId, customerEmail, customerName } = body;

        if (!formId || !customerId || !customerEmail) {
            return NextResponse.json(
                { success: false, message: 'اطلاعات ناکامل' },
                { status: 400 }
            );
        }

        // بررسی وجود فرم
        const [form] = await executeQuery(`
            SELECT * FROM feedback_forms WHERE id = ?
        `, [formId]);

        if (!form) {
            return NextResponse.json(
                { success: false, message: 'فرم یافت نشد' },
                { status: 404 }
            );
        }

        // ایجاد لینک منحصر به فرد برای پاسخ
        const responseId = uuidv4();
        const responseLink = `https://crm.robintejarat.com/feedback/respond/${responseId}`;

        // ذخیره درخواست پاسخ در جدول feedback_form_submissions
        await executeSingle(`
            INSERT INTO feedback_form_submissions (
                id, form_id, customer_id, token, status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, 'pending', NOW(), NOW())
        `, [responseId, formId, customerId, responseId]);

        // ارسال ایمیل واقعی
        try {
            // Use internal Docker network URL for server, localhost for development
            const apiUrl = process.env.NODE_ENV === 'production'
                ? 'http://nextjs:3000/api/Gmail'  // Docker internal network
                : 'http://localhost:3000/api/Gmail';  // Local development

            const emailResponse = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to: customerEmail,
                    subject: `درخواست بازخورد - ${form.title}`,
                    html: `
                        <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif;">
                            <h2>سلام ${customerName || 'مشتری گرامی'}</h2>
                            <p>از شما درخواست می‌کنیم که در مورد خدمات ما نظر خود را ارائه دهید.</p>
                            <p><strong>عنوان فرم:</strong> ${form.title}</p>
                            ${form.description ? `<p><strong>توضیحات:</strong> ${form.description}</p>` : ''}
                            <p>برای پاسخ به فرم بازخورد، روی لینک زیر کلیک کنید:</p>
                            <a href="${responseLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                                پاسخ به فرم بازخورد
                            </a>
                            <p style="margin-top: 20px; color: #666;">
                                با تشکر<br>
                                تیم پشتیبانی
                            </p>
                        </div>
                    `,
                    text: `سلام ${customerName || 'مشتری گرامی'}

از شما درخواست می‌کنیم که در مورد خدمات ما نظر خود را ارائه دهید.

عنوان فرم: ${form.title}
${form.description ? `توضیحات: ${form.description}` : ''}

برای پاسخ به فرم بازخورد، از لینک زیر استفاده کنید:
${responseLink}

با تشکر
تیم پشتیبانی`
                })
            });

            const emailResult = await emailResponse.json();
            if (!emailResult.ok) {
                console.error('Failed to send feedback email:', emailResult.error);
                // Don't fail the whole request, just log the error
            } else {
                console.log(`✅ Feedback email sent successfully to ${customerEmail}`);
            }
        } catch (emailError) {
            console.error('Error sending feedback email:', emailError);
            // Don't fail the whole request, just log the error
        }

        return NextResponse.json({
            success: true,
            message: 'فرم بازخورد ارسال شد',
            responseLink
        });

    } catch (error) {
        console.error('Error sending feedback form:', error);
        return NextResponse.json(
            { success: false, message: 'خطا در ارسال فرم' },
            { status: 500 }
        );
    }
}