'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InvoiceDownloadButtonProps {
  saleId: string;
  customerName: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  showText?: boolean;
}

export function InvoiceDownloadButton({ 
  saleId, 
  customerName, 
  variant = 'outline', 
  size = 'sm',
  showText = false 
}: InvoiceDownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const handleDownloadInvoice = async () => {
    if (isDownloading) return;

    try {
      setIsDownloading(true);
      
      toast({
        title: "در حال تولید فاکتور",
        description: "لطفاً صبر کنید...",
      });

      const response = await fetch(`/api/sales/${saleId}/invoice`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'خطا در تولید فاکتور');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      
      // نام فایل با تاریخ و نام مشتری
      const date = new Date().toLocaleDateString('fa-IR').replace(/\//g, '-');
      const fileName = `فاکتور-${customerName.replace(/\s+/g, '-')}-${date}-${saleId.substring(0, 8)}.pdf`;
      a.download = fileName;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "موفقیت",
        description: "فاکتور با موفقیت دانلود شد",
      });
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast({
        title: "خطا",
        description: error instanceof Error ? error.message : "خطا در دانلود فاکتور",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button 
      variant={variant}
      size={size}
      onClick={handleDownloadInvoice}
      disabled={isDownloading}
      className="font-vazir text-blue-600 hover:text-blue-700 hover:bg-blue-50 disabled:opacity-50 border-blue-200"
      title="دانلود فاکتور PDF"
    >
      {isDownloading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {showText && (
        <span className="mr-2">
          {isDownloading ? 'در حال تولید...' : 'دانلود فاکتور'}
        </span>
      )}
      <span className="sr-only">دانلود فاکتور PDF</span>
    </Button>
  );
}