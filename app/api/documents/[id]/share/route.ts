import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken, hasModulePermission } from '@/lib/auth';
import { executeQuery, executeSingle } from '@/lib/database';
import { v4 as uuidv4 } from 'uuid';

// اشتراک‌گذاری سند
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 });
        }

        // بررسی دسترسی ماژول اسناد
        const hasDocsAccess = await hasModulePermission(user.id, 'documents');
        if (!hasDocsAccess) {
            return NextResponse.json({ error: 'دسترسی به مدیریت اسناد ندارید' }, { status: 403 });
        }

        const { emails, message, permissionType, expiresInDays, includeAttachment = false } = await request.json();

        if (!emails || !Array.isArray(emails) || emails.length === 0) {
            return NextResponse.json({ error: 'ایمیل‌ها الزامی است' }, { status: 400 });
        }

        // بررسی وجود سند
        const documents = await executeQuery(
            'SELECT * FROM documents WHERE id = ? AND status = "active"',
            [params.id]
        );

        if (documents.length === 0) {
            return NextResponse.json({ error: 'سند یافت نشد' }, { status: 404 });
        }

        const document = documents[0];

        // بررسی دسترسی اشتراک‌گذاری
        if (user.role !== 'ceo' && document.uploaded_by !== user.id) {
            const permissions = await executeQuery(
                `SELECT * FROM document_permissions 
         WHERE document_id = ? AND user_id = ? AND permission_type IN ('share', 'admin') AND is_active = 1`,
                [params.id, user.id]
            );

            if (permissions.length === 0) {
                return NextResponse.json({ error: 'دسترسی اشتراک‌گذاری ندارید' }, { status: 403 });
            }
        }

        const shares: Array<{ id: string; email: string; shareToken: string; shareUrl: string }> = [];
        const expiresAt = expiresInDays ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000) : null;

        // ارسال ایمیل‌ها (یکجا بعد از ایجاد رکوردهای اشتراک)
        const sentEmails: string[] = [];
        const failedEmails: string[] = [];

        for (const email of emails) {
            const shareToken = uuidv4();
            const shareId = uuidv4();

            // بررسی وجود کاربر با این ایمیل
            const users = await executeQuery(
                'SELECT id FROM users WHERE email = ?',
                [email]
            );

            const sharedWithUserId = users.length > 0 ? users[0].id : null;

            // ایجاد اشتراک
            await executeSingle(
                `INSERT INTO document_shares (
          id, document_id, shared_by, shared_with_email, shared_with_user_id,
          share_token, permission_type, message, expires_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    shareId,
                    params.id,
                    user.id,
                    email,
                    sharedWithUserId,
                    shareToken,
                    permissionType || 'view',
                    message || null,
                    expiresAt,
                ]
            );

            // ساخت لینک اشتراک
            const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/documents/shared/${shareToken}`;

            try {
                // ساخت بدنه ایمیل (اگر پیوست انتخاب شده باشد، لینک نمایش داده نمی‌شود)
                const linkSection = !includeAttachment ? `
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${shareUrl}" 
                    style="background: #3B82F6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
                    🔗 مشاهده سند
                  </a>
                </div>` : '';

                const attachmentInfo = includeAttachment ? `
                <div style=\"background: #dcfce7; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;\">
                  <p style=\"margin: 0; color: #166534;\">📎 فایل سند به این ایمیل پیوست شده است</p>
                </div>` : '';

                const emailContent = `
          <div dir=\"rtl\" style=\"font-family: Tahoma, Arial, sans-serif; padding: 20px; background: #f8fafc;\">
            <div style=\"max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);\">
              <div style=\"background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); padding: 30px; text-align: center;\">
                <h1 style=\"color: white; margin: 0; font-size: 24px;\">سند جدید با شما به اشتراک گذاشته شد</h1>
              </div>
              <div style=\"padding: 30px;\">
                <div style=\"background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0; border-right: 4px solid #3B82F6;\">
                  <p style=\"margin: 0 0 10px 0;\"><strong>نام سند:</strong> ${document.title}</p>
                  <p style=\"margin: 0 0 10px 0;\"><strong>اشتراک‌گذار:</strong> ${user.name}</p>
                  <p style=\"margin: 0 0 10px 0;\"><strong>نوع دسترسی:</strong> ${permissionType === 'download' ? 'مشاهده و دانلود' : 'مشاهده'}</p>
                  ${message ? `<p style=\\\"margin: 0;\\\"><strong>پیام:</strong> ${message}</p>` : ''}
                </div>
                ${attachmentInfo}
                ${linkSection}
                ${expiresAt ? `<p style=\\\"color: #6b7280; font-size: 14px; text-align: center; margin: 20px 0;\\\"><small>⏰ این لینک تا ${expiresAt.toLocaleDateString('fa-IR')} معتبر است.</small></p>` : ''}
                <hr style=\"margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;\">
                <p style=\"color: #6b7280; font-size: 12px; text-align: center; margin: 0;\">این ایمیل از سیستم مدیریت اسناد ارسال شده است.</p>
              </div>
            </div>
          </div>
        `;

                // آماده‌سازی پیوست در صورت نیاز
                let attachment: { filename: string; contentBase64: string } | null = null;
                if (includeAttachment) {
                    // 1) Try DB first
                    try {
                        const fileRows = await executeQuery(
                            'SELECT content FROM document_files WHERE document_id = ? LIMIT 1',
                            [params.id]
                        );
                        if (fileRows.length > 0 && fileRows[0].content) {
                            const buf = fileRows[0].content as Buffer;
                            attachment = {
                                filename: document.original_filename,
                                contentBase64: Buffer.from(buf).toString('base64'),
                            };
                            console.log('✅ Attachment loaded from DB');
                        }
                    } catch (e) {
                        console.warn('⚠️ Failed to load attachment from DB, will try disk:', e);
                    }

                    // 2) Fallback to disk if DB not found
                    if (!attachment) {
                        const fs = require('fs').promises;
                        const path = require('path');
                        const possiblePaths = [
                            // Prefer stored_filename under uploads/documents (same as download route)
                            path.join(process.cwd(), 'uploads', 'documents', document.stored_filename),
                            path.join('./uploads', 'documents', document.stored_filename),
                            (process.env.UPLOAD_DIR ? path.join(process.env.UPLOAD_DIR, 'documents', document.stored_filename) : null),
                            // Legacy fallbacks using file_path if present
                            (document.file_path ? path.join(process.cwd(), 'uploads', document.file_path) : null),
                            (document.file_path ? path.join('./uploads', document.file_path) : null),
                            (document.file_path || null),
                        ].filter(Boolean);
                        for (const p of possiblePaths) {
                            try {
                                await fs.access(p as string);
                                const buf = await fs.readFile(p as string);
                                attachment = {
                                    filename: document.original_filename,
                                    contentBase64: Buffer.from(buf).toString('base64'),
                                };
                                console.log('✅ Attachment prepared from disk:', p);
                                break;
                            } catch { }
                        }
                    }
                }

                // ارسال از طریق روت داخلی Gmail
                const payload: any = {
                    to: email,
                    subject: `📄 سند "${document.title}" با شما به اشتراک گذاشته شد`,
                };

                if (includeAttachment && attachment) {
                    // فقط پیوست - بدون HTML template پیچیده
                    payload.text = 'This email contains a file attachment.';
                    payload.attachments = [attachment];
                } else {
                    // Rich HTML template وقتی پیوست نیست
                    payload.html = emailContent;
                    payload.text = emailContent.replace(/<[^>]+>/g, ' ');
                }

                // Use internal Docker network URL for server, localhost for development
                const apiUrl = process.env.NODE_ENV === 'production'
                    ? 'http://nextjs:3000/api/Gmail'  // Docker internal network
                    : 'http://localhost:3000/api/Gmail';  // Local development

                const res = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                const data = await res.json().catch(() => ({ ok: false }));

                if (res.ok && data?.ok) {
                    console.log('✅ ایمیل اشتراک‌گذاری ارسال شد:', email);
                    sentEmails.push(email);
                } else {
                    console.log('❌ خطا در ارسال ایمیل:', email, data?.error || res.statusText);
                    failedEmails.push(email);
                }

                // تاخیر کوتاه بین ارسال‌ها
                await new Promise((r) => setTimeout(r, 500));
            } catch (emailError) {
                console.error('❌ خطا در ارسال ایمیل:', emailError);
                failedEmails.push(email);
            }

            shares.push({ id: shareId, email, shareToken, shareUrl });
        }

        // ثبت فعالیت
        await executeSingle(
            `INSERT INTO document_activity_log (id, document_id, user_id, action, details, ip_address) 
       VALUES (UUID(), ?, ?, 'share', ?, ?)`,
            [
                params.id,
                user.id,
                JSON.stringify({ emails, permissionType, message }),
                (request as any).ip || 'unknown',
            ]
        );

        // به‌روزرسانی وضعیت اشتراک سند
        await executeSingle('UPDATE documents SET is_shared = 1 WHERE id = ?', [params.id]);

        const success = sentEmails.length > 0;
        return NextResponse.json({
            success,
            message:
                sentEmails.length === emails.length
                    ? 'ایمیل اشتراک‌گذاری برای همه گیرندگان ارسال شد'
                    : failedEmails.length === emails.length
                        ? 'خطا در ارسال ایمیل برای همه گیرندگان'
                        : `ایمیل برای ${sentEmails.length} نفر ارسال شد، ${failedEmails.length} نفر ناموفق`,
            shares,
            sentEmails,
            failedEmails,
        }, { status: success ? 200 : 500 });
    } catch (error) {
        console.error('خطا در اشتراک‌گذاری سند:', error);
        return NextResponse.json({ error: 'خطا در اشتراک‌گذاری سند' }, { status: 500 });
    }
}

// دریافت لیست اشتراک‌های سند
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 });
        }

        // بررسی دسترسی ماژول اسناد
        const hasDocsAccess = await hasModulePermission(user.id, 'documents');
        if (!hasDocsAccess) {
            return NextResponse.json({ error: 'دسترسی به مدیریت اسناد ندارید' }, { status: 403 });
        }

        // بررسی دسترسی
        const documents = await executeQuery(
            'SELECT uploaded_by FROM documents WHERE id = ? AND status = "active"',
            [params.id]
        );

        if (documents.length === 0) {
            return NextResponse.json({ error: 'سند یافت نشد' }, { status: 404 });
        }

        const document = documents[0];

        if (user.role !== 'ceo' && document.uploaded_by !== user.id) {
            return NextResponse.json({ error: 'دسترسی غیر مجاز' }, { status: 403 });
        }

        // دریافت اشتراک‌ها
        const shares = await executeQuery(
            `SELECT 
        ds.*,
        u.name as shared_with_name,
        u.avatar_url as shared_with_avatar
       FROM document_shares ds
       LEFT JOIN users u ON ds.shared_with_user_id = u.id
       WHERE ds.document_id = ? AND ds.is_active = 1
       ORDER BY ds.created_at DESC`,
            [params.id]
        );

        return NextResponse.json({ shares });
    } catch (error) {
        console.error('خطا در دریافت اشتراک‌ها:', error);
        return NextResponse.json({ error: 'خطا در دریافت اشتراک‌ها' }, { status: 500 });
    }
}
