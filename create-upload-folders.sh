#!/bin/bash

# اسکریپت ایجاد فولدرهای آپلود برای داکر

echo "📁 ایجاد فولدرهای آپلود..."

# ایجاد فولدرهای اصلی
mkdir -p uploads
mkdir -p public/uploads

# ایجاد زیرفولدرها
mkdir -p uploads/documents
mkdir -p uploads/avatars
mkdir -p uploads/chat
mkdir -p uploads/temp

mkdir -p public/uploads/documents
mkdir -p public/uploads/avatars
mkdir -p public/uploads/chat

# تنظیم مجوزها
chmod -R 755 uploads
chmod -R 755 public/uploads

# ایجاد فایل .gitkeep برای حفظ فولدرها در git
echo "# Keep this folder in git" > uploads/.gitkeep
echo "# Keep this folder in git" > uploads/documents/.gitkeep
echo "# Keep this folder in git" > uploads/avatars/.gitkeep
echo "# Keep this folder in git" > uploads/chat/.gitkeep
echo "# Keep this folder in git" > uploads/temp/.gitkeep

echo "# Keep this folder in git" > public/uploads/.gitkeep
echo "# Keep this folder in git" > public/uploads/documents/.gitkeep
echo "# Keep this folder in git" > public/uploads/avatars/.gitkeep
echo "# Keep this folder in git" > public/uploads/chat/.gitkeep

echo "✅ فولدرهای آپلود ایجاد شدند:"
echo "   📁 uploads/"
echo "   📁 uploads/documents/"
echo "   📁 uploads/avatars/"
echo "   📁 uploads/chat/"
echo "   📁 uploads/temp/"
echo "   📁 public/uploads/"
echo "   📁 public/uploads/documents/"
echo "   📁 public/uploads/avatars/"
echo "   📁 public/uploads/chat/"

# نمایش ساختار فولدرها
echo ""
echo "📊 ساختار فولدرهای ایجاد شده:"
tree uploads 2>/dev/null || find uploads -type d | sort
tree public/uploads 2>/dev/null || find public/uploads -type d | sort

echo ""
echo "✅ آماده برای استفاده در داکر!"