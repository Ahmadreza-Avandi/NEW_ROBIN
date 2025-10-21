'use client';

import { useState, useEffect } from 'react';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    FolderIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface Category {
    id: string;
    name: string;
    description?: string;
    color: string;
    icon: string;
    document_count: number;
    created_by_name: string;
}

interface CategoryManagerProps {
    onClose: () => void;
    onCategoryChange: () => void;
}

export default function CategoryManager({ onClose, onCategoryChange }: CategoryManagerProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    // فرم دسته‌بندی
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: '#3B82F6',
        icon: 'folder'
    });

    // بارگذاری دسته‌بندی‌ها
    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/documents/categories');
            const data = await response.json();

            if (response.ok) {
                setCategories(data.categories);
            } else {
                toast.error(data.error || 'خطا در بارگذاری دسته‌بندی‌ها');
            }
        } catch (error) {
            toast.error('خطا در اتصال به سرور');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // ذخیره دسته‌بندی
    const handleSave = async () => {
        if (!formData.name.trim()) {
            toast.error('نام دسته‌بندی الزامی است');
            return;
        }

        try {
            const url = editingCategory
                ? `/api/documents/categories/${editingCategory.id}`
                : '/api/documents/categories';

            const method = editingCategory ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(editingCategory ? 'دسته‌بندی ویرایش شد' : 'دسته‌بندی ایجاد شد');
                setShowAddForm(false);
                setEditingCategory(null);
                setFormData({ name: '', description: '', color: '#3B82F6', icon: 'folder' });
                fetchCategories();
                onCategoryChange();
            } else {
                toast.error(data.error || 'خطا در ذخیره دسته‌بندی');
            }
        } catch (error) {
            toast.error('خطا در ذخیره دسته‌بندی');
        }
    };

    // حذف دسته‌بندی
    const handleDelete = async (categoryId: string) => {
        if (!confirm('آیا از حذف این دسته‌بندی اطمینان دارید؟')) return;

        try {
            const response = await fetch(`/api/documents/categories/${categoryId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('دسته‌بندی حذف شد');
                fetchCategories();
                onCategoryChange();
            } else {
                toast.error(data.error || 'خطا در حذف دسته‌بندی');
            }
        } catch (error) {
            toast.error('خطا در حذف دسته‌بندی');
        }
    };

    // شروع ویرایش
    const startEdit = (category: Category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || '',
            color: category.color,
            icon: category.icon
        });
        setShowAddForm(true);
    };

    // لغو فرم
    const cancelForm = () => {
        setShowAddForm(false);
        setEditingCategory(null);
        setFormData({ name: '', description: '', color: '#3B82F6', icon: 'folder' });
    };

    const iconOptions = [
        { value: 'folder', label: 'پوشه' },
        { value: 'document', label: 'سند' },
        { value: 'file-contract', label: 'قرارداد' },
        { value: 'receipt', label: 'فاکتور' },
        { value: 'chart-bar', label: 'گزارش' },
        { value: 'shield-check', label: 'امنیت' },
        { value: 'presentation-chart-bar', label: 'ارائه' },
        { value: 'photograph', label: 'تصویر' }
    ];

    const colorOptions = [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
        '#8B5CF6', '#06B6D4', '#84CC16', '#F97316',
        '#EC4899', '#6B7280'
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" dir="rtl">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                {/* هدر */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">مدیریت دسته‌بندی‌ها</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* محتوا */}
                <div className="p-6">
                    {/* دکمه افزودن */}
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-medium text-gray-900">
                            دسته‌بندی‌های موجود ({categories.length})
                        </h3>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        >
                            <PlusIcon className="w-4 h-4" />
                            دسته‌بندی جدید
                        </button>
                    </div>

                    {/* فرم افزودن/ویرایش */}
                    {showAddForm && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <h4 className="font-medium text-gray-900 mb-4">
                                {editingCategory ? 'ویرایش دسته‌بندی' : 'دسته‌بندی جدید'}
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        نام دسته‌بندی *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="نام دسته‌بندی"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        آیکون
                                    </label>
                                    <select
                                        value={formData.icon}
                                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        {iconOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        توضیحات
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={2}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="توضیحات اختیاری"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        رنگ
                                    </label>
                                    <div className="flex gap-2">
                                        {colorOptions.map((color) => (
                                            <button
                                                key={color}
                                                onClick={() => setFormData({ ...formData, color })}
                                                className={`w-8 h-8 rounded-full border-2 ${formData.color === color ? 'border-gray-800' : 'border-gray-300'
                                                    }`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-4">
                                <button
                                    onClick={cancelForm}
                                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    انصراف
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                                >
                                    {editingCategory ? 'ویرایش' : 'ایجاد'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* لیست دسته‌بندی‌ها */}
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {categories.map((category) => (
                                <div
                                    key={category.id}
                                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                                style={{ backgroundColor: category.color + '20' }}
                                            >
                                                <FolderIcon
                                                    className="w-5 h-5"
                                                    style={{ color: category.color }}
                                                />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900">{category.name}</h4>
                                                <p className="text-sm text-gray-500">
                                                    {category.document_count} سند
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => startEdit(category)}
                                                className="p-1 text-gray-400 hover:text-blue-600"
                                                title="ویرایش"
                                            >
                                                <PencilIcon className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(category.id)}
                                                className="p-1 text-gray-400 hover:text-red-600"
                                                title="حذف"
                                                disabled={category.document_count > 0}
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {category.description && (
                                        <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                                    )}

                                    <p className="text-xs text-gray-500">
                                        ایجاد شده توسط: {category.created_by_name}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}

                    {categories.length === 0 && !loading && (
                        <div className="text-center py-8">
                            <FolderIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                هیچ دسته‌بندی‌ای وجود ندارد
                            </h3>
                            <p className="text-gray-600">اولین دسته‌بندی خود را ایجاد کنید</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}