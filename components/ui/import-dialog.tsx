'use client';

import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ImportField {
    key: string;
    label: string;
    required: boolean;
}

interface ImportDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (file: File, mappings: Record<string, string>) => Promise<any>;
    fields: ImportField[];
    title: string;
    type: 'contacts' | 'customers';
}

export function ImportDialog({
    isOpen,
    onClose,
    onConfirm,
    fields,
    title,
    type
}: ImportDialogProps) {
    const [file, setFile] = useState<File | null>(null);
    const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
    const [mappings, setMappings] = useState<Record<string, string>>({});
    const [step, setStep] = useState<'upload' | 'mapping' | 'importing' | 'result'>('upload');
    const [importResult, setImportResult] = useState<any>(null);
    const [importing, setImporting] = useState(false);
    const { toast } = useToast();

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        // بررسی نوع فایل
        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/csv'
        ];

        if (!validTypes.includes(selectedFile.type) &&
            !selectedFile.name.endsWith('.xlsx') &&
            !selectedFile.name.endsWith('.xls') &&
            !selectedFile.name.endsWith('.csv')) {
            toast({
                title: "خطا",
                description: "فقط فایل‌های Excel (xlsx, xls) و CSV پشتیبانی می‌شوند",
                variant: "destructive"
            });
            return;
        }

        setFile(selectedFile);

        // خواندن هدرهای فایل
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = event.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];

                if (jsonData.length > 0) {
                    const headers = jsonData[0].map((h: any) => String(h).trim());
                    setExcelHeaders(headers);
                    setStep('mapping');

                    // تلاش برای تشخیص خودکار ستون‌ها
                    const autoMappings: Record<string, string> = {};
                    fields.forEach(field => {
                        const matchingHeader = headers.find(h =>
                            h.toLowerCase().includes(field.key.toLowerCase()) ||
                            h.toLowerCase().includes(field.label.toLowerCase()) ||
                            field.label.toLowerCase().includes(h.toLowerCase())
                        );
                        if (matchingHeader) {
                            autoMappings[field.key] = matchingHeader;
                        }
                    });
                    setMappings(autoMappings);
                }
            } catch (error) {
                console.error('Error reading file:', error);
                toast({
                    title: "خطا",
                    description: "خطا در خواندن فایل",
                    variant: "destructive"
                });
            }
        };
        reader.readAsBinaryString(selectedFile);
    }, [fields, toast]);

    const handleImport = async () => {
        if (!file) return;

        // بررسی فیلدهای الزامی
        const missingRequired = fields
            .filter(f => f.required && !mappings[f.key])
            .map(f => f.label);

        if (missingRequired.length > 0) {
            toast({
                title: "خطا",
                description: `فیلدهای الزامی نقشه‌برداری نشده‌اند: ${missingRequired.join('، ')}`,
                variant: "destructive"
            });
            return;
        }

        setImporting(true);
        setStep('importing');

        try {
            console.log('🔄 ImportDialog: Calling onConfirm...');
            const result = await onConfirm(file, mappings);
            console.log('✅ ImportDialog: Received result:', result);
            setImportResult(result);
            console.log('📊 ImportDialog: Set importResult, changing step to result');
            setStep('result');

            toast({
                title: "موفق",
                description: result.message || "ایمپورت با موفقیت انجام شد"
            });
        } catch (error: any) {
            console.error('❌ ImportDialog: Import error:', error);
            setImportResult({
                success: false,
                message: error.message || 'خطا در ایمپورت'
            });
            setStep('result');

            toast({
                title: "خطا",
                description: error.message || "خطا در ایمپورت",
                variant: "destructive"
            });
        } finally {
            console.log('🏁 ImportDialog: Import finished, setting importing to false');
            setImporting(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setExcelHeaders([]);
        setMappings({});
        setStep('upload');
        setImportResult(null);
        setImporting(false);
        onClose();
    };

    const downloadSample = () => {
        // ایجاد فایل نمونه
        const sampleData = [
            fields.reduce((acc, field) => {
                acc[field.label] = field.required ? `نمونه ${field.label}` : '';
                return acc;
            }, {} as Record<string, string>)
        ];

        const ws = XLSX.utils.json_to_sheet(sampleData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'نمونه');

        const fileName = type === 'contacts' ? 'sample-contacts.xlsx' : 'sample-customers.xlsx';
        XLSX.writeFile(wb, fileName);
    };

    console.log('🎭 ImportDialog render - step:', step, 'importResult:', importResult);

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5" />
                        {title}
                    </DialogTitle>
                    <DialogDescription>
                        {step === 'upload' && 'فایل Excel یا CSV خود را برای ایمپورت انتخاب کنید'}
                        {step === 'mapping' && 'ستون‌های فایل را با فیلدهای سیستم مطابقت دهید'}
                        {step === 'importing' && 'در حال پردازش و ایمپورت داده‌ها...'}
                        {step === 'result' && 'نتیجه عملیات ایمپورت'}
                    </DialogDescription>
                </DialogHeader>

                {step === 'upload' && (
                    <div className="space-y-4">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <Label htmlFor="file-upload" className="cursor-pointer">
                                <span className="text-blue-600 hover:text-blue-700 font-medium">
                                    فایل را انتخاب کنید
                                </span>
                                <span className="text-gray-600"> یا بکشید و رها کنید</span>
                            </Label>
                            <Input
                                id="file-upload"
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <p className="text-sm text-gray-500 mt-2">
                                فرمت‌های پشتیبانی شده: Excel (xlsx, xls) و CSV
                            </p>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t">
                            <Button
                                variant="outline"
                                onClick={downloadSample}
                                className="gap-2"
                            >
                                <Download className="h-4 w-4" />
                                دانلود فایل نمونه
                            </Button>
                        </div>
                    </div>
                )}

                {step === 'mapping' && (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-800">
                                <strong>فایل انتخاب شده:</strong> {file?.name}
                            </p>
                            <p className="text-sm text-blue-600 mt-1">
                                لطفاً ستون‌های فایل اکسل را با فیلدهای سیستم مطابقت دهید
                            </p>
                        </div>

                        <div className="space-y-3 max-h-[400px] overflow-y-auto">
                            {fields.map((field) => (
                                <div key={field.key} className="space-y-2">
                                    <Label>
                                        {field.label}
                                        {field.required && <span className="text-red-500 mr-1">*</span>}
                                    </Label>
                                    <Select
                                        value={mappings[field.key] || ''}
                                        onValueChange={(value) =>
                                            setMappings({ ...mappings, [field.key]: value })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="انتخاب ستون از فایل اکسل" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__none__">-- انتخاب نکنید --</SelectItem>
                                            {excelHeaders.map((header) => (
                                                <SelectItem key={header} value={header}>
                                                    {header}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ))}
                        </div>

                        <DialogFooter className="gap-2">
                            <Button variant="outline" onClick={() => setStep('upload')}>
                                بازگشت
                            </Button>
                            <Button onClick={handleImport} disabled={importing}>
                                {importing ? 'در حال ایمپورت...' : 'شروع ایمپورت'}
                            </Button>
                        </DialogFooter>
                    </div>
                )}

                {step === 'importing' && (
                    <div className="py-8 text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600 mx-auto mb-4"></div>
                        <p className="text-lg font-medium">در حال ایمپورت داده‌ها...</p>
                        <p className="text-sm text-gray-500 mt-2">لطفاً صبر کنید</p>
                    </div>
                )}

                {step === 'result' && importResult && (
                    <div className="space-y-4">
                        <div className={`rounded-lg p-6 text-center ${importResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                            }`}>
                            {importResult.success ? (
                                <>
                                    <CheckCircle className="mx-auto h-16 w-16 text-green-600 mb-4" />
                                    <h3 className="text-lg font-semibold text-green-900 mb-2">
                                        ایمپورت موفقیت‌آمیز بود!
                                    </h3>
                                </>
                            ) : (
                                <>
                                    <AlertCircle className="mx-auto h-16 w-16 text-red-600 mb-4" />
                                    <h3 className="text-lg font-semibold text-red-900 mb-2">
                                        خطا در ایمپورت
                                    </h3>
                                </>
                            )}
                            <p className="text-sm text-gray-700">{importResult.message}</p>

                            {importResult.stats && (
                                <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <p className="text-2xl font-bold text-green-600">
                                            {importResult.stats.successful || 0}
                                        </p>
                                        <p className="text-xs text-gray-600">موفق</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-red-600">
                                            {importResult.stats.failed || 0}
                                        </p>
                                        <p className="text-xs text-gray-600">ناموفق</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-blue-600">
                                            {importResult.stats.total || 0}
                                        </p>
                                        <p className="text-xs text-gray-600">کل</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {importResult.errors && importResult.errors.length > 0 && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <h4 className="font-semibold text-yellow-900 mb-2">خطاها:</h4>
                                <ul className="text-sm text-yellow-800 space-y-1 max-h-40 overflow-y-auto">
                                    {importResult.errors.map((error: string, index: number) => (
                                        <li key={index}>• {error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <DialogFooter>
                            <Button onClick={handleClose}>
                                بستن
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}