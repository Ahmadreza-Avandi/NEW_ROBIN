export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { google } from 'googleapis';

/*
  این فایل یک نسخهٔ تبدیل‌شده از سرویس express شماست به یک route تک فایلی برای
  Next.js (app router).

  - GET : status (مشابه /status در نسخهٔ express)
  - POST: ارسال ایمیل
    - اگر Content-Type: multipart/form-data بود => پردازش فایل‌ها از formData
    - در غیر این صورت (application/json) => انتظار برای body JSON با فیلدهای to, subject, text|html, attachments (base64)

  نکته: اگر می‌خواهید مسیرهای جدا (مثل /status یا /send) داشته باشید، هرکدام را در
  app/api/gmail/status/route.ts و app/api/gmail/send/route.ts قرار دهید. اینجا یک فایلِ واحد داریم
  که هم JSON و هم multipart را هندل می‌کند.
*/

const {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REFRESH_TOKEN,
    EMAIL_USER
} = process.env as Record<string, string | undefined>;

// Safety check (but don't crash the server — فقط هشدار)
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN || !EMAIL_USER) {
    console.warn('⚠️ Missing required env vars. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, EMAIL_USER');
}

function getOAuth2Client() {
    const oAuth2Client = new google.auth.OAuth2(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        'urn:ietf:wg:oauth:2.0:oob'
    );
    oAuth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });
    return oAuth2Client;
}

async function createTransporter() {
    const oAuth2Client = getOAuth2Client();
    try {
        const atResponse = await oAuth2Client.getAccessToken();
        const accessToken = (atResponse && typeof atResponse === 'object') ? (atResponse.token || (atResponse as any).access_token) : atResponse;

        if (!accessToken) {
            throw new Error('No access token retrieved from refresh token. Check refresh token validity.');
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: EMAIL_USER,
                clientId: GOOGLE_CLIENT_ID,
                clientSecret: GOOGLE_CLIENT_SECRET,
                refreshToken: GOOGLE_REFRESH_TOKEN,
                accessToken
            },
            debug: true,
            logger: true
        });

        // verify may throw if auth fails
        await transporter.verify();
        return { transporter, oAuth2Client, accessToken } as any;
    } catch (err: any) {
        console.error('createTransporter error:', err && err.message ? err.message : err);
        throw err;
    }
}

async function sendWithNodemailer({ to, subject, text, html, attachments = [], from }: any) {
    const { transporter } = await createTransporter();
    const mailOptions: any = {
        from: from || EMAIL_USER,
        to,
        subject,
        attachments
    };

    // فقط text یا html را ارسال کن، نه هر دو
    if (html) {
        mailOptions.html = html;
        // اگر html داریم، text را هم می‌توانیم اضافه کنیم برای fallback
        if (text) mailOptions.text = text;
    } else if (text) {
        mailOptions.text = text;
        // فقط text، بدون html
    }

    const info = await transporter.sendMail(mailOptions);
    return info;
}

async function sendWithGmailAPI({ to, subject, html, text, attachments = [] }: any) {
    const oAuth2Client = getOAuth2Client();
    const accessTokenObj = await oAuth2Client.getAccessToken();
    const accessToken = (accessTokenObj && typeof accessTokenObj === 'object') ? (accessTokenObj.token || (accessTokenObj as any).access_token) : accessTokenObj;
    if (!accessToken) throw new Error('No access token for Gmail API');

    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
    const boundary = '----=_Boundary_' + Date.now();
    let body: string[] = [];
    body.push(`From: ${EMAIL_USER}`);
    body.push(`To: ${to}`);
    body.push(`Subject: =?UTF-8?B?${Buffer.from(subject || '').toString('base64')}?=`);
    body.push('MIME-Version: 1.0');
    body.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);
    body.push('');
    body.push(`--${boundary}`);

    // اگر فقط text داریم (بدون html)، از text/plain استفاده کن
    if (!html && text) {
        body.push('Content-Type: text/plain; charset="UTF-8"');
        body.push('Content-Transfer-Encoding: 7bit');
        body.push('');
        body.push(text);
    } else {
        // در غیر این صورت HTML ارسال کن
        body.push('Content-Type: text/html; charset="UTF-8"');
        body.push('Content-Transfer-Encoding: 7bit');
        body.push('');
        body.push(html || (text ? text.replace(/\n/g, '<br>') : ''));
    }

    for (const att of attachments) {
        body.push(`--${boundary}`);
        let mimeType = 'application/octet-stream';
        if (att.filename && att.filename.endsWith('.txt')) mimeType = 'text/plain';
        if (att.filename && att.filename.endsWith('.pdf')) mimeType = 'application/pdf';
        if (att.filename && att.filename.endsWith('.jpg')) mimeType = 'image/jpeg';
        if (att.filename && att.filename.endsWith('.png')) mimeType = 'image/png';
        body.push(`Content-Type: ${mimeType}; name="${att.filename}"`);
        body.push(`Content-Disposition: attachment; filename="${att.filename}"`);
        body.push('Content-Transfer-Encoding: base64');
        body.push('');
        body.push(Buffer.isBuffer(att.content) ? att.content.toString('base64') : Buffer.from(att.content).toString('base64'));
    }
    body.push(`--${boundary}--`);

    const raw = Buffer.from(body.join('\r\n')).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    const res = await gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw }
    });

    return res.data;
}

// GET -> status
export async function GET(req: Request) {
    try {
        const oAuth2Client = getOAuth2Client();
        const at = await oAuth2Client.getAccessToken();
        const accessToken = (at && typeof at === 'object') ? (at as any).token || (at as any).access_token : at;
        if (!accessToken) {
            return NextResponse.json({ ok: false, error: 'No access token retrieved. Refresh token may be invalid.' }, { status: 500 });
        }
        const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
        const profile = await gmail.users.getProfile({ userId: 'me' });
        return NextResponse.json({ ok: true, email: EMAIL_USER, profile: profile.data });
    } catch (err: any) {
        console.error('Status error:', err && err.message ? err.message : err);
        return NextResponse.json({ ok: false, error: err && err.message ? err.message : String(err) }, { status: 500 });
    }
}

// POST -> send (json or multipart)
export async function POST(req: Request) {
    try {
        const contentType = req.headers.get('content-type') || '';

        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            const to = formData.get('to')?.toString();
            const subject = formData.get('subject')?.toString();
            const text = formData.get('text')?.toString();
            const html = formData.get('html')?.toString();

            if (!to || !subject || (!text && !html)) {
                return NextResponse.json({ ok: false, error: 'Missing required fields: to, subject and text or html' }, { status: 400 });
            }

            const files = formData.getAll('files') as File[];
            const attachments = await Promise.all(
                (files || []).map(async (f: File) => ({
                    filename: (f as any).name || 'file',
                    content: Buffer.from(await f.arrayBuffer())
                }))
            );

            try {
                const info = await sendWithNodemailer({ to, subject, text, html, attachments });
                return NextResponse.json({ ok: true, via: 'nodemailer', info });
            } catch (nodErr: any) {
                console.error('nodemailer failed for multipart, trying Gmail API fallback ->', nodErr && nodErr.message ? nodErr.message : nodErr);
                try {
                    const gmailRes = await sendWithGmailAPI({ to, subject, html, text, attachments });
                    return NextResponse.json({ ok: true, via: 'gmail-api', result: gmailRes });
                } catch (gErr: any) {
                    console.error('gmail API fallback also failed ->', gErr && gErr.message ? gErr.message : gErr);
                    return NextResponse.json({ ok: false, error: 'Both nodemailer and Gmail API send failed', nodemailerError: nodErr && nodErr.message, gmailError: gErr && gErr.message }, { status: 500 });
                }
            }
        }

        // else assume JSON
        const body = await req.json().catch(() => null);
        const to = body?.to;
        const subject = body?.subject;
        const text = body?.text;
        const html = body?.html;
        const attJson = body?.attachments;

        if (!to || !subject || (!text && !html)) {
            return NextResponse.json({ ok: false, error: 'Missing required fields: to, subject and text or html' }, { status: 400 });
        }

        const attachments = Array.isArray(attJson) ? attJson.map((a: any) => ({ filename: a.filename, content: Buffer.from(a.contentBase64, 'base64') })) : [];

        try {
            const info = await sendWithNodemailer({ to, subject, text, html, attachments });
            return NextResponse.json({ ok: true, via: 'nodemailer', info });
        } catch (nodErr: any) {
            console.error('nodemailer failed, trying Gmail API fallback ->', nodErr && nodErr.message ? nodErr.message : nodErr);
            try {
                const gmailRes = await sendWithGmailAPI({ to, subject, html, text, attachments });
                return NextResponse.json({ ok: true, via: 'gmail-api', result: gmailRes });
            } catch (gErr: any) {
                console.error('gmail API fallback also failed ->', gErr && gErr.message ? gErr.message : gErr);
                return NextResponse.json({ ok: false, error: 'Both nodemailer and Gmail API send failed', nodemailerError: nodErr && nodErr.message, gmailError: gErr && gErr.message }, { status: 500 });
            }
        }

    } catch (err: any) {
        console.error('POST top error:', err && err.message ? err.message : err);
        return NextResponse.json({ ok: false, error: err && err.message ? err.message : String(err) }, { status: 500 });
    }
}
