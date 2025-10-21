'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Copy, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DocumentNameGeneratorProps {
    onNameGenerated?: (filename: string) => void;
}

export default function DocumentNameGenerator({ onNameGenerated }: DocumentNameGeneratorProps) {
    const [prefix, setPrefix] = useState('DOC');
    const [documentType, setDocumentType] = useState('proposal');
    const [status, setStatus] = useState('draft');
    const [accessLevel, setAccessLevel] = useState('internal');
    const [extension, setExtension] = useState('pdf');
    const [generatedName, setGeneratedName] = useState('');

    const { toast } = useToast();

    const generateFilename = () => {
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');

        const typeMap: { [key: string]: string } = {
            contract: 'Contract',
            proposal: 'Proposal',
            invoice: 'Invoice',
            plan: 'Plan',
            report: 'Report',
            presentation: 'Presentation',
            agreement: 'Agreement',
            specification: 'Specification',
            manual: 'Manual',
            other: 'Document'
        };

        const statusMap: { [key: string]: string } = {
            draft: 'Draft',
            reviewed: 'Reviewed',
            final: 'Final',
            archived: 'Archived'
        };

        const accessMap: { [key: string]: string } = {
            public: 'Public',
            private: 'Private',
            internal: 'Internal',
            restricted: 'Restricted'
        };

        const filename = `${prefix.toUpperCase()}_${typeMap[documentType]}_${statusMap[status]}_${accessMap[accessLevel]}_${date}.${extension.toLowerCase()}`;

        setGeneratedName(filename);
        onNameGenerated?.(filename);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedName);
        toast({
            title: "کپی شد",
            description: "نام فایل در کلیپ‌بورد کپی شد"
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-vazir">تولید نام فایل استاندارد</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* پیشوند */}
                    <div>
                        <label className="text-sm font-medium font-vazir mb-2 block">پیشوند</label>
                        <Input
                            value={prefix}
                            onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                            placeholder="DOC"
                            maxLength={10}
                            className="font-vazir"
                        />
                    </div>

                    {/* نوع سند */}
                    <div>
                        <label className="text-sm font-medium font-vazir mb-2 block">نوع سند</label>
                        <Select value={documentType} onValueChange={setDocumentType}>
                            <SelectTrigger className="font-vazir">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="contract" className="font-vazir">قرارداد (Contract)</SelectItem>
                                <SelectItem value="proposal" className="font-vazir">پیشنهاد (Proposal)</SelectItem>
                                <SelectItem value="invoice" className="font-vazir">فاکتور (Invoice)</SelectItem>
                                <SelectItem value="plan" className="font-vazir">برنامه (Plan)</SelectItem>
                                <SelectItem value="report" className="font-vazir">گزارش (Report)</SelectItem>
                                <SelectItem value="presentation" className="font-vazir">ارائه (Presentation)</SelectItem>
                                <SelectItem value="agreement" className="font-vazir">توافق‌نامه (Agreement)</SelectItem>
                                <SelectItem value="specification" className="font-vazir">مشخصات (Specification)</SelectItem>
                                <SelectItem value="manual" className="font-vazir">راهنما (Manual)</SelectItem>
                                <SelectItem value="other" className="font-vazir">سایر (Document)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* وضعیت */}
                    <div>
                        <label className="text-sm font-medium font-vazir mb-2 block">وضعیت</label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="font-vazir">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="draft" className="font-vazir">پیش‌نویس (Draft)</SelectItem>
                                <SelectItem value="reviewed" className="font-vazir">بازبینی‌شده (Reviewed)</SelectItem>
                                <SelectItem value="final" className="font-vazir">نهایی (Final)</SelectItem>
                                <SelectItem value="archived" className="font-vazir">بایگانی (Archived)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* سطح دسترسی */}
                    <div>
                        <label className="text-sm font-medium font-vazir mb-2 block">سطح دسترسی</label>
                        <Select value={accessLevel} onValueChange={setAccessLevel}>
                            <SelectTrigger className="font-vazir">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="public" className="font-vazir">عمومی (Public)</SelectItem>
                                <SelectItem value="private" className="font-vazir">خصوصی (Private)</SelectItem>
                                <SelectItem value="internal" className="font-vazir">داخلی (Internal)</SelectItem>
                                <SelectItem value="restricted" className="font-vazir">محدود (Restricted)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* فرمت فایل */}
                    <div>
                        <label className="text-sm font-medium font-vazir mb-2 block">فرمت فایل</label>
                        <Select value={extension} onValueChange={setExtension}>
                            <SelectTrigger className="font-vazir">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pdf" className="font-vazir">PDF</SelectItem>
                                <SelectItem value="docx" className="font-vazir">Word (DOCX)</SelectItem>
                                <SelectItem value="xlsx" className="font-vazir">Excel (XLSX)</SelectItem>
                                <SelectItem value="pptx" className="font-vazir">PowerPoint (PPTX)</SelectItem>
                                <SelectItem value="jpg" className="font-vazir">تصویر (JPG)</SelectItem>
                                <SelectItem value="png" className="font-vazir">تصویر (PNG)</SelectItem>
                                <SelectItem value="zip" className="font-vazir">فشرده (ZIP)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* دکمه تولید */}
                    <div className="flex items-end">
                        <Button onClick={generateFilename} className="w-full font-vazir">
                            <RefreshCw className="h-4 w-4 ml-2" />
                            تولید نام فایل
                        </Button>
                    </div>
                </div>

                {/* نام تولید شده */}
                {generatedName && (
                    <div className="mt-6 p-4 bg-muted rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium font-vazir mb-2 block">نام فایل تولید شده:</label>
                                <Badge variant="outline" className="font-mono text-sm p-2">
                                    {generatedName}
                                </Badge>
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={copyToClipboard}
                                className="font-vazir"
                            >
                                <Copy className="h-4 w-4 ml-2" />
                                کپی
                            </Button>
                        </div>

                        <div className="mt-3 text-xs text-muted-foreground font-vazir">
                            <p>الگو: [پیشوند]_[نوع سند]_[وضعیت]_[سطح دسترسی]_[تاریخ].[فرمت]</p>
                            <p>مثال: MYAMD_MKT_Proposal_Draft_Public_20250912.pdf</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}