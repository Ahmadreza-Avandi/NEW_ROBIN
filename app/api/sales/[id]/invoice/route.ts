import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';
import { getUserFromToken } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'توکن نامعتبر است' },
        { status: 401 }
      );
    }

    const saleId = params.id;

    // دریافت اطلاعات فروش
    const saleData = await executeQuery(`
      SELECT 
        d.id,
        d.title,
        d.total_value,
        d.currency,
        d.probability,
        d.expected_close_date,
        d.actual_close_date,
        d.created_at,
        c.name as customer_name,
        c.email as customer_email,
        c.phone as customer_phone,
        c.address as customer_address,
        c.company_name,
        u.name as sales_person_name,
        u.email as sales_person_email
      FROM deals d
      LEFT JOIN customers c ON d.customer_id = c.id
      LEFT JOIN users u ON d.assigned_to = u.id
      WHERE d.id = ?
    `, [saleId]);

    if (!saleData || saleData.length === 0) {
      return NextResponse.json(
        { success: false, message: 'فروش یافت نشد' },
        { status: 404 }
      );
    }

    const sale = saleData[0];

    // تولید HTML فاکتور با پشتیبانی کامل فارسی
    const htmlContent = generateInvoiceHTML(sale);

    // تولید PDF با Puppeteer
    const pdfBuffer = await generatePDFFromHTML(htmlContent);

    // ارسال PDF
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${sale.id.substring(0, 8)}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('خطا در تولید فاکتور:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در تولید فاکتور: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

async function generatePDFFromHTML(htmlContent: string): Promise<Buffer> {
  // تلاش برای استفاده از puppeteer
  try {
    const puppeteer = await import('puppeteer');
    const browser = await puppeteer.default.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' },
        printBackground: true,
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  } catch (puppeteerError) {
    console.error('Puppeteer error, using fallback:', puppeteerError);
    // Fallback: برگرداندن HTML به عنوان PDF (browser می‌تونه print کنه)
    throw new Error('PDF generation failed - puppeteer not available');
  }
}


function generateInvoiceHTML(sale: any): string {
  const invoiceDate = new Date(sale.created_at).toLocaleDateString('fa-IR');
  const invoiceDateEn = new Date(sale.created_at).toLocaleDateString('en-US');
  const formattedAmount = formatPrice(sale.total_value, sale.currency);

  return `
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>فاکتور فروش</title>
  <style>
    @import url('https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Vazirmatn', 'Tahoma', 'Arial', sans-serif;
      font-size: 14px;
      line-height: 1.8;
      color: #333;
      background: #fff;
      direction: rtl;
      text-align: right;
    }
    
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 30px;
    }
    
    .header {
      background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
      color: white;
      padding: 30px;
      border-radius: 12px;
      margin-bottom: 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .company-info h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    
    .company-info p {
      font-size: 14px;
      opacity: 0.9;
    }
    
    .invoice-title {
      text-align: left;
    }
    
    .invoice-title h2 {
      font-size: 24px;
      font-weight: 600;
    }
    
    .invoice-title p {
      font-size: 12px;
      opacity: 0.8;
    }
    
    .invoice-meta {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
      padding: 20px;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    
    .meta-item {
      text-align: center;
    }
    
    .meta-label {
      font-size: 12px;
      color: #64748b;
      margin-bottom: 5px;
    }
    
    .meta-value {
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
    }
    
    .customer-section {
      margin-bottom: 30px;
      padding: 20px;
      background: #fff;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #2563eb;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e2e8f0;
    }
    
    .customer-details {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
    }
    
    .detail-item {
      display: flex;
      flex-direction: column;
    }
    
    .detail-label {
      font-size: 12px;
      color: #64748b;
      margin-bottom: 3px;
    }
    
    .detail-value {
      font-size: 14px;
      font-weight: 500;
      color: #1e293b;
    }
    
    .items-section {
      margin-bottom: 30px;
    }
    
    .items-table {
      width: 100%;
      border-collapse: collapse;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .items-table thead {
      background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
      color: white;
    }
    
    .items-table th {
      padding: 15px;
      text-align: right;
      font-weight: 600;
      font-size: 14px;
    }
    
    .items-table td {
      padding: 15px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 14px;
    }
    
    .items-table tbody tr:last-child td {
      border-bottom: none;
    }
    
    .items-table tbody tr:nth-child(even) {
      background: #f8fafc;
    }
    
    .total-section {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 30px;
    }
    
    .total-box {
      background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
      color: white;
      padding: 20px 40px;
      border-radius: 8px;
      text-align: center;
    }
    
    .total-label {
      font-size: 14px;
      opacity: 0.9;
      margin-bottom: 5px;
    }
    
    .total-value {
      font-size: 24px;
      font-weight: 700;
    }
    
    .seller-section {
      margin-bottom: 30px;
      padding: 15px 20px;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    
    .seller-info {
      display: flex;
      gap: 30px;
    }
    
    .footer {
      text-align: center;
      padding: 20px;
      border-top: 2px solid #e2e8f0;
      color: #64748b;
    }
    
    .footer p {
      margin-bottom: 5px;
    }
    
    .thank-you {
      font-size: 16px;
      font-weight: 600;
      color: #2563eb;
      margin-bottom: 10px;
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <div class="company-info">
        <h1>شرکت رابین تجارت</h1>
        <p>Robin Tejarat Company</p>
      </div>
      <div class="invoice-title">
        <h2>فاکتور فروش</h2>
        <p>Sales Invoice</p>
      </div>
    </div>
    
    <div class="invoice-meta">
      <div class="meta-item">
        <div class="meta-label">شماره فاکتور</div>
        <div class="meta-value">${sale.id.substring(0, 8)}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">تاریخ صدور</div>
        <div class="meta-value">${invoiceDate}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Date</div>
        <div class="meta-value">${invoiceDateEn}</div>
      </div>
    </div>
    
    <div class="customer-section">
      <div class="section-title">اطلاعات مشتری</div>
      <div class="customer-details">
        <div class="detail-item">
          <span class="detail-label">نام مشتری</span>
          <span class="detail-value">${sale.customer_name || 'نامشخص'}</span>
        </div>
        ${sale.company_name ? `
        <div class="detail-item">
          <span class="detail-label">نام شرکت</span>
          <span class="detail-value">${sale.company_name}</span>
        </div>
        ` : ''}
        ${sale.customer_email ? `
        <div class="detail-item">
          <span class="detail-label">ایمیل</span>
          <span class="detail-value">${sale.customer_email}</span>
        </div>
        ` : ''}
        ${sale.customer_phone ? `
        <div class="detail-item">
          <span class="detail-label">تلفن</span>
          <span class="detail-value">${sale.customer_phone}</span>
        </div>
        ` : ''}
        ${sale.customer_address ? `
        <div class="detail-item" style="grid-column: span 2;">
          <span class="detail-label">آدرس</span>
          <span class="detail-value">${sale.customer_address}</span>
        </div>
        ` : ''}
      </div>
    </div>
    
    <div class="items-section">
      <table class="items-table">
        <thead>
          <tr>
            <th>ردیف</th>
            <th>شرح کالا / خدمات</th>
            <th>مبلغ</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>۱</td>
            <td>${sale.title || 'فروش محصول'}</td>
            <td>${formattedAmount}</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div class="total-section">
      <div class="total-box">
        <div class="total-label">مجموع کل</div>
        <div class="total-value">${formattedAmount}</div>
      </div>
    </div>
    
    ${sale.sales_person_name ? `
    <div class="seller-section">
      <div class="section-title">نماینده فروش</div>
      <div class="seller-info">
        <div class="detail-item">
          <span class="detail-label">نام</span>
          <span class="detail-value">${sale.sales_person_name}</span>
        </div>
        ${sale.sales_person_email ? `
        <div class="detail-item">
          <span class="detail-label">ایمیل</span>
          <span class="detail-value">${sale.sales_person_email}</span>
        </div>
        ` : ''}
      </div>
    </div>
    ` : ''}
    
    <div class="footer">
      <p class="thank-you">از خرید شما متشکریم!</p>
      <p>Thank you for your business!</p>
      <p style="margin-top: 10px; font-size: 12px;">شرکت رابین تجارت - Robin Tejarat Company</p>
    </div>
  </div>
</body>
</html>
  `;
}

function formatPrice(price: number, currency: string): string {
  if (!price || isNaN(price)) return '۰ تومان';
  
  const currencyLabel = currency === 'IRR' ? 'تومان' : currency;
  
  if (price >= 1000000000) {
    return `${toPersianNumber((price / 1000000000).toFixed(1))} میلیارد ${currencyLabel}`;
  } else if (price >= 1000000) {
    return `${toPersianNumber((price / 1000000).toFixed(1))} میلیون ${currencyLabel}`;
  } else if (price >= 1000) {
    return `${toPersianNumber(Math.floor(price / 1000))} هزار ${currencyLabel}`;
  } else {
    return `${toPersianNumber(price)} ${currencyLabel}`;
  }
}

function toPersianNumber(num: number | string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/[0-9]/g, (d) => persianDigits[parseInt(d)]);
}
