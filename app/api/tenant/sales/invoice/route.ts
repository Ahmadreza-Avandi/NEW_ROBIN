import { NextRequest, NextResponse } from 'next/server';
import { getTenantSessionFromRequest } from '@/lib/tenant-auth';
import { getTenantConnection } from '@/lib/tenant-database';

export async function GET(req: NextRequest) {
  try {
    const tenantKey = req.headers.get('X-Tenant-Key');
    const saleId = req.nextUrl.searchParams.get('id');
    const format = req.nextUrl.searchParams.get('format') || 'html'; // html or pdf

    if (!tenantKey) {
      return NextResponse.json({ success: false, message: 'Tenant key not found' }, { status: 400 });
    }

    if (!saleId) {
      return NextResponse.json({ success: false, message: 'Sale ID not found' }, { status: 400 });
    }

    const session = getTenantSessionFromRequest(req, tenantKey);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const pool = await getTenantConnection(tenantKey);
    const conn = await pool.getConnection();

    try {
      const [saleData] = await conn.query(`
        SELECT s.id, s.total_amount, s.currency, s.payment_status,
               s.payment_method, s.sale_date, s.invoice_number,
               s.notes, s.created_at, s.customer_name, s.sales_person_name,
               c.email as customer_email, c.phone as customer_phone,
               c.address as customer_address, c.company_name
        FROM sales s
        LEFT JOIN customers c ON s.customer_id = c.id
        WHERE s.id = ? AND s.tenant_key = ?
      `, [saleId, tenantKey]) as any;

      if (!saleData || saleData.length === 0) {
        return NextResponse.json({ success: false, message: 'فروش یافت نشد' }, { status: 404 });
      }

      const sale = saleData[0];

      const [saleItems] = await conn.query(`
        SELECT si.quantity, si.unit_price, si.total_price,
               si.product_name, si.product_category
        FROM sale_items si
        WHERE si.sale_id = ? AND si.tenant_key = ?
      `, [saleId, tenantKey]) as any;

      const htmlContent = generateInvoiceHTML(sale, saleItems || []);

      // برگرداندن HTML که مرورگر بتونه print کنه
      return new NextResponse(htmlContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      });

    } finally {
      conn.release();
    }

  } catch (error) {
    console.error('خطا در تولید فاکتور:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در تولید فاکتور: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

function generateInvoiceHTML(sale: any, items: any[]): string {
  const invoiceDate = new Date(sale.sale_date || sale.created_at).toLocaleDateString('fa-IR');
  const invoiceDateEn = new Date(sale.sale_date || sale.created_at).toLocaleDateString('en-US');
  const invoiceNumber = sale.invoice_number || sale.id.substring(0, 8);
  const formattedTotal = formatPrice(sale.total_amount, sale.currency);

  let itemsHTML = '';
  if (items && items.length > 0) {
    items.forEach((item, index) => {
      const itemTotal = formatPrice(item.total_price || (item.quantity * item.unit_price), sale.currency);
      const unitPrice = formatPrice(item.unit_price, sale.currency);
      itemsHTML += `
        <tr>
          <td>${toPersianNumber(index + 1)}</td>
          <td>${item.product_name || 'محصول'}</td>
          <td>${toPersianNumber(item.quantity)}</td>
          <td>${unitPrice}</td>
          <td>${itemTotal}</td>
        </tr>`;
    });
  } else {
    itemsHTML = `
      <tr>
        <td>۱</td>
        <td>فروش کلی</td>
        <td>۱</td>
        <td>${formattedTotal}</td>
        <td>${formattedTotal}</td>
      </tr>`;
  }

  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>فاکتور فروش - ${invoiceNumber}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Vazirmatn', Tahoma, sans-serif; font-size: 14px; line-height: 1.8; color: #333; background: #eee; direction: rtl; }
    .container { max-width: 800px; margin: 20px auto; padding: 30px; background: #fff; box-shadow: 0 1px 5px rgba(0,0,0,0.08); border: 1px solid #ddd; }
    .header { padding: 20px 0; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #333; }
    .company h1 { font-size: 22px; font-weight: 700; color: #222; margin-bottom: 3px; }
    .company p { font-size: 11px; color: #666; }
    .invoice-title { text-align: left; }
    .invoice-title h2 { font-size: 18px; font-weight: 600; color: #222; }
    .invoice-title p { font-size: 11px; color: #666; }
    .meta { display: flex; justify-content: space-between; margin-bottom: 20px; padding: 12px; background: #f9f9f9; border: 1px solid #e0e0e0; }
    .meta-item { text-align: center; flex: 1; border-left: 1px solid #e0e0e0; }
    .meta-item:last-child { border-left: none; }
    .meta-label { font-size: 10px; color: #888; margin-bottom: 3px; }
    .meta-value { font-size: 13px; font-weight: 600; color: #222; }
    .section { margin-bottom: 20px; padding: 15px; border: 1px solid #e0e0e0; }
    .section-title { font-size: 13px; font-weight: 600; color: #333; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid #e0e0e0; }
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .info-item { margin-bottom: 6px; }
    .info-label { font-size: 10px; color: #888; margin-bottom: 2px; display: block; }
    .info-value { font-size: 12px; font-weight: 500; color: #222; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    thead { background: #f5f5f5; }
    th { padding: 10px 8px; text-align: right; font-weight: 600; font-size: 11px; color: #333; border-bottom: 2px solid #ccc; }
    td { padding: 10px 8px; border-bottom: 1px solid #e5e5e5; font-size: 11px; color: #333; }
    tbody tr:nth-child(even) { background: #fafafa; }
    .total-section { display: flex; justify-content: flex-end; margin: 20px 0; }
    .total-box { background: #f5f5f5; border: 2px solid #333; padding: 12px 25px; text-align: center; }
    .total-label { font-size: 11px; color: #666; margin-bottom: 3px; }
    .total-value { font-size: 18px; font-weight: 700; color: #222; }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 3px; font-size: 10px; font-weight: 600; }
    .badge-paid { background: #e8f5e9; color: #2e7d32; border: 1px solid #a5d6a7; }
    .badge-pending { background: #fff3e0; color: #e65100; border: 1px solid #ffcc80; }
    .footer { text-align: center; padding: 15px 0; border-top: 1px solid #e0e0e0; color: #888; margin-top: 20px; font-size: 11px; }
    .thank-you { font-size: 12px; font-weight: 600; color: #333; margin-bottom: 3px; }
    .btn-group { position: fixed; top: 20px; left: 20px; display: flex; gap: 10px; z-index: 1000; }
    .btn { background: #555; color: white; border: none; padding: 10px 18px; border-radius: 5px; cursor: pointer; font-family: 'Vazirmatn', sans-serif; font-size: 13px; font-weight: 500; box-shadow: 0 1px 4px rgba(0,0,0,0.15); display: flex; align-items: center; gap: 6px; }
    .btn:hover { background: #333; }
    .btn-green { background: #4caf50; }
    .btn-green:hover { background: #388e3c; }
    .btn:disabled { background: #bbb; cursor: wait; }
    @media print {
      body { background: white; }
      .container { box-shadow: none; margin: 0; padding: 15px; border: none; }
      .btn-group { display: none; }
    }
  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
</head>
<body>
  <div class="btn-group">
    <button class="btn btn-green" onclick="downloadPDF()" id="pdfBtn">📥 دانلود PDF</button>
    <button class="btn" onclick="window.print()">🖨️ چاپ</button>
  </div>
  
  <div class="container">
    <div class="header">
      <div class="company">
        <h1>رابین</h1>
      </div>
      <div class="invoice-title">
        <h2>فاکتور فروش</h2>
      </div>
    </div>
    
    <div class="meta">
      <div class="meta-item">
        <div class="meta-label">تاریخ</div>
        <div class="meta-value">${invoiceDate}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">وضعیت</div>
        <div class="meta-value">
          <span class="badge ${sale.payment_status === 'paid' ? 'badge-paid' : 'badge-pending'}">
            ${getPaymentStatusText(sale.payment_status)}
          </span>
        </div>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">اطلاعات مشتری</div>
      <div class="grid">
        <div class="info-item"><span class="info-label">نام مشتری</span><div class="info-value">${sale.customer_name || 'نامشخص'}</div></div>
        ${sale.customer_phone ? `<div class="info-item"><span class="info-label">تلفن</span><div class="info-value">${sale.customer_phone}</div></div>` : ''}
        ${sale.customer_email ? `<div class="info-item"><span class="info-label">ایمیل</span><div class="info-value">${sale.customer_email}</div></div>` : ''}
        ${sale.company_name ? `<div class="info-item"><span class="info-label">شرکت</span><div class="info-value">${sale.company_name}</div></div>` : ''}
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">اقلام فاکتور</div>
      <table>
        <thead><tr><th>ردیف</th><th>شرح کالا</th><th>تعداد</th><th>قیمت واحد</th><th>مبلغ کل</th></tr></thead>
        <tbody>${itemsHTML}</tbody>
      </table>
    </div>
    
    <div class="total-section">
      <div class="total-box">
        <div class="total-label">مجموع کل</div>
        <div class="total-value">${formattedTotal}</div>
      </div>
    </div>
    
    <div class="footer">
      <p class="thank-you">از خرید شما متشکریم!</p>
      <p>رابین</p>
    </div>
  </div>
  
  <script>
    async function downloadPDF() {
      const btn = document.getElementById('pdfBtn');
      btn.disabled = true;
      btn.innerHTML = '⏳ در حال تولید...';
      
      try {
        const element = document.querySelector('.container');
        const opt = {
          margin: 10,
          filename: 'فاکتور-${invoiceNumber}-${sale.customer_name || 'customer'}.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, letterRendering: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        await html2pdf().set(opt).from(element).save();
        
        btn.innerHTML = '✅ دانلود شد!';
        setTimeout(() => {
          btn.disabled = false;
          btn.innerHTML = '📥 دانلود PDF';
        }, 2000);
      } catch (error) {
        console.error('Error:', error);
        btn.disabled = false;
        btn.innerHTML = '❌ خطا - دوباره تلاش کنید';
        setTimeout(() => {
          btn.innerHTML = '📥 دانلود PDF';
        }, 2000);
      }
    }
  </script>
</body>
</html>`;
}

function formatPrice(price: number, currency: string): string {
  if (!price || isNaN(price)) return '۰ تومان';
  const label = currency === 'IRR' ? 'تومان' : currency;
  if (price >= 1e9) return `${toPersianNumber((price / 1e9).toFixed(1))} میلیارد ${label}`;
  if (price >= 1e6) return `${toPersianNumber((price / 1e6).toFixed(1))} میلیون ${label}`;
  if (price >= 1e3) return `${toPersianNumber(Math.floor(price / 1e3))} هزار ${label}`;
  return `${toPersianNumber(price)} ${label}`;
}

function toPersianNumber(num: number | string): string {
  const digits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/[0-9]/g, d => digits[parseInt(d)]);
}

function getPaymentStatusText(status: string): string {
  const map: Record<string, string> = { paid: 'پرداخت شده', pending: 'در انتظار', partial: 'جزئی', refunded: 'برگشت' };
  return map[status] || status || 'نامشخص';
}
