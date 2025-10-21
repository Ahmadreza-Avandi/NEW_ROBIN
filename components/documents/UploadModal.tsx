'use client';

import { useState, useRef } from 'react';
import { X, Upload, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function UploadModal({ isOpen, onClose, onSuccess }: UploadModalProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [documentType, setDocumentType] = useState('other');
    const [status, setStatus] = useState('draft');
    const [accessLevel, setAccessLevel] = useState('private');
    const [tags, setTags] = useState('');
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { toast } = useToast();

    if (!isOpen) return null;

    // انتخاب فایل
    const handleFileSelect = (file: File) => {
        setSelectedFile(file);
        if (!title) {
            setTitle(file.name.split('.').slice(0, -1).join('.'));
        }
    };

    // کشیدن و رها کردن فایل
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
    };

    // آپلود فایل
    const handleUpload = async () => {
        if (!selectedFile) {
            toast({
                title: "خطا",
                description: 'لطفاً فایل را انتخاب کنید',
                variant: "destructive"
            });
            return;
        }

        if (!title.trim()) {
            toast({
                title: "خطا",
                description: 'لطفاً عنوان سند را وارد کنید',
                variant: "destructive"
            });
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('title', title.trim());
            formData.append('description', description.trim());
            formData.append('documentType', documentType);
            formData.append('status', status);
            formData.append('accessLevel', accessLevel);
            formData.append('tags', tags);

            const token = document.cookie
                .split('; ')
                .find(row => row.startsWith('auth-token='))
                ?.split('=')[1];

            const response = await fetch('/api/documents', {
                method: 'POST',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: "موفق",
                    description: 'سند با موفقیت آپلود شد'
                });
                onSuccess();
            } else {
                toast({
                    title: "خطا",
                    description: data.error || 'خطا در آپلود فایل',
                    variant: "destructive"
                });
            }
        } catch (error) {
            toast({
                title: "خطا",
                description: 'خطا در آپلود فایل',
                variant: "destructive"
            });
        } finally {
            setUploading(false);
        }
    };

    // فرمت کردن حجم فایل
    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 بایت';
        const k = 1024;
        const sizes = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="font-vazir">آپلود سند جدید</CardTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* منطقه آپلود فایل */}
                    <div>
                        <label className="block text-sm font-medium font-vazir mb-2">
                            انتخاب فایل
                        </label>
                        <div
                            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragOver
                                ? 'border-primary bg-primary/10'
                                : selectedFile
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                                }`}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                        >
                            {selectedFile ? (
                                <div className="flex items-center justify-center gap-3">
                                    <FileText className="h-8 w-8 text-green-500" />
                                    <div className="text-right">
                                        <p className="text-sm font-medium font-vazir">{selectedFile.name}</p>
                                        <p className="text-xs text-muted-foreground font-vazir">{formatFileSize(selectedFile.size)}</p>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-sm text-muted-foreground mb-2 font-vazir">
                                        فایل را اینجا بکشید یا کلیک کنید
                                    </p>
                                    <p className="text-xs text-muted-foreground font-vazir">
                                        حداکثر حجم: 50 مگابایت
                                    </p>
                                </div>
                            )}

                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleFileSelect(file);
                                }}
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt"
                            />

                            <Button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="mt-4 font-vazir"
                                variant="outline"
                            >
                                انتخاب فایل
                            </Button>
                        </div>
                    </div>

                    {/* عنوان سند */}
                    <div>
                        <label className="block text-sm font-medium font-vazir mb-2">
                            عنوان سند *
                        </label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="عنوان سند را وارد کنید"
                            className="font-vazir"
                        />
                    </div>

                    {/* توضیحات */}
                    <div>
                        <label className="block text-sm font-medium font-vazir mb-2">
                            توضیحات
                        </label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            placeholder="توضیحات اختیاری درباره سند"
                            className="font-vazir"
                        />
                    </div>

                    {/* نوع سند */}
                    <div>
                        <label className="block text-sm font-medium font-vazir mb-2">
                            نوع سند
                        </label>
                        <Select value={documentType} onValueChange={setDocumentType}>
                            <SelectTrigger className="font-vazir">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="contract" className="font-vazir">قرارداد</SelectItem>
                                <SelectItem value="proposal" className="font-vazir">پیشنهاد</SelectItem>
                                <SelectItem value="invoice" className="font-vazir">فاکتور</SelectItem>
                                <SelectItem value="plan" className="font-vazir">برنامه</SelectItem>
                                <SelectItem value="report" className="font-vazir">گزارش</SelectItem>
                                <SelectItem value="presentation" className="font-vazir">ارائه</SelectItem>
                                <SelectItem value="agreement" className="font-vazir">توافق‌نامه</SelectItem>
                                <SelectItem value="specification" className="font-vazir">مشخصات</SelectItem>
                                <SelectItem value="manual" className="font-vazir">راهنما</SelectItem>
                                <SelectItem value="other" className="font-vazir">سایر</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* وضعیت */}
                    <div>
                        <label className="block text-sm font-medium font-vazir mb-2">
                            وضعیت
                        </label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="font-vazir">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="draft" className="font-vazir">پیش‌نویس</SelectItem>
                                <SelectItem value="reviewed" className="font-vazir">بازبینی‌شده</SelectItem>
                                <SelectItem value="final" className="font-vazir">نهایی</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* سطح دسترسی */}
                    <div>
                        <label className="block text-sm font-medium font-vazir mb-2">
                            سطح دسترسی
                        </label>
                        <Select value={accessLevel} onValueChange={setAccessLevel}>
                            <SelectTrigger className="font-vazir">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="private" className="font-vazir">خصوصی</SelectItem>
                                <SelectItem value="internal" className="font-vazir">داخلی</SelectItem>
                                <SelectItem value="public" className="font-vazir">عمومی</SelectItem>
                                <SelectItem value="restricted" className="font-vazir">محدود</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1 font-vazir">
                            {accessLevel === 'private' && 'فقط شما می‌توانید ببینید'}
                            {accessLevel === 'internal' && 'همه کاربران داخلی می‌توانند ببینند'}
                            {accessLevel === 'public' && 'همه می‌توانند ببینند'}
                            {accessLevel === 'restricted' && 'فقط کاربران با دسترسی خاص می‌توانند ببینند'}
                        </p>
                    </div>

                    {/* برچسب‌ها */}
                    <div>
                        <label className="block text-sm font-medium font-vazir mb-2">
                            برچسب‌ها
                        </label>
                        <Input
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="برچسب‌ها را با کاما جدا کنید"
                            className="font-vazir"
                        />
                        <p className="text-xs text-muted-foreground mt-1 font-vazir">
                            مثال: فوری، قرارداد، مالی
                        </p>
                    </div>

                    {/* دکمه‌ها */}
                    <div className="flex items-center justify-end gap-3 pt-4">
                        <Button
                            onClick={onClose}
                            variant="outline"
                            disabled={uploading}
                            className="font-vazir"
                        >
                            انصراف
                        </Button>
                        <Button
                            onClick={handleUpload}
                            disabled={!selectedFile || !title.trim() || uploading}
                            className="font-vazir"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                                    در حال آپلود...
                                </>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4 ml-2" />
                                    آپلود سند
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}