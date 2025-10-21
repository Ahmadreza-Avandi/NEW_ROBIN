<?php
header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html dir="rtl" lang="fa">
<head>
    <meta charset="UTF-8">
    <title>رفع مشکلات دیتابیس CRM</title>
    <style>
        body {
            font-family: Tahoma, Arial, sans-serif;
            background: #f5f5f5;
            padding: 20px;
            direction: rtl;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
        }
        .section {
            margin: 20px 0;
            padding: 15px;
            background: #f8f9fa;
            border-right: 4px solid #3498db;
        }
        .success {
            color: #27ae60;
            font-weight: bold;
        }
        .error {
            color: #e74c3c;
            font-weight: bold;
        }
        .warning {
            color: #f39c12;
            font-weight: bold;
        }
        .info {
            color: #3498db;
            font-weight: bold;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
        }
        th, td {
            padding: 10px;
            border: 1px solid #ddd;
            text-align: right;
        }
        th {
            background: #3498db;
            color: white;
        }
        tr:nth-child(even) {
            background: #f2f2f2;
        }
        .btn {
            background: #3498db;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            margin: 10px 5px;
        }
        .btn:hover {
            background: #2980b9;
        }
        pre {
            background: #2c3e50;
            color: #ecf0f1;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 رفع مشکلات دیتابیس CRM</h1>

<?php
// اتصال به دیتابیس
$host = 'localhost';
$user = 'crm_user';
$pass = '1234';
$db = 'crm_system';

try {
    $conn = new mysqli($host, $user, $pass, $db);
    $conn->set_charset('utf8mb4');
    
    if ($conn->connect_error) {
        throw new Exception("خطا در اتصال: " . $conn->connect_error);
    }
    
    echo "<div class='section'><span class='success'>✅ اتصال به دیتابیس برقرار شد</span></div>";
    
    // ========================================
    // بخش 1: بررسی وضعیت فعلی
    // ========================================
    echo "<h2>📊 بررسی وضعیت فعلی</h2>";
    
    // بررسی ساختار جدول users
    echo "<div class='section'>";
    echo "<h3>1️⃣ ساختار جدول users</h3>";
    $result = $conn->query("SHOW COLUMNS FROM users");
    $columns = [];
    $hasUsername = false;
    $hasFullName = false;
    
    while ($row = $result->fetch_assoc()) {
        $columns[] = $row;
        if ($row['Field'] == 'username') $hasUsername = true;
        if ($row['Field'] == 'full_name') $hasFullName = true;
    }
    
    echo "<p>فیلد username: " . ($hasUsername ? "<span class='success'>✅ موجود</span>" : "<span class='error'>❌ وجود ندارد</span>") . "</p>";
    echo "<p>فیلد full_name: " . ($hasFullName ? "<span class='success'>✅ موجود</span>" : "<span class='error'>❌ وجود ندارد</span>") . "</p>";
    echo "</div>";
    
    // بررسی رکوردهای تکراری
    echo "<div class='section'>";
    echo "<h3>2️⃣ بررسی رکوردهای تکراری</h3>";
    $result = $conn->query("SELECT id, COUNT(*) as count FROM users GROUP BY id HAVING count > 1");
    $duplicates = [];
    while ($row = $result->fetch_assoc()) {
        $duplicates[] = $row;
    }
    
    if (count($duplicates) > 0) {
        echo "<p class='warning'>⚠️ " . count($duplicates) . " رکورد تکراری یافت شد:</p>";
        echo "<table><tr><th>ID</th><th>تعداد تکرار</th></tr>";
        foreach ($duplicates as $dup) {
            echo "<tr><td>{$dup['id']}</td><td>{$dup['count']}</td></tr>";
        }
        echo "</table>";
    } else {
        echo "<p class='success'>✅ رکورد تکراری وجود ندارد</p>";
    }
    echo "</div>";
    
    // بررسی تعداد رکوردها
    echo "<div class='section'>";
    echo "<h3>3️⃣ تعداد رکوردها در جداول</h3>";
    
    $tables = ['users', 'activities', 'sales', 'feedback', 'chat_conversations'];
    echo "<table><tr><th>جدول</th><th>تعداد رکورد</th></tr>";
    
    foreach ($tables as $table) {
        $result = $conn->query("SELECT COUNT(*) as total FROM $table");
        if ($result) {
            $row = $result->fetch_assoc();
            echo "<tr><td>$table</td><td>{$row['total']}</td></tr>";
        } else {
            echo "<tr><td>$table</td><td class='error'>جدول وجود ندارد</td></tr>";
        }
    }
    echo "</table>";
    echo "</div>";
    
    // ========================================
    // بخش 2: رفع مشکلات
    // ========================================
    if (isset($_POST['fix'])) {
        echo "<h2>🔧 رفع مشکلات</h2>";
        
        // حذف رکوردهای تکراری
        if (count($duplicates) > 0) {
            echo "<div class='section'>";
            echo "<h3>🗑️ حذف رکوردهای تکراری</h3>";
            $conn->query("DELETE u1 FROM users u1 INNER JOIN users u2 WHERE u1.id = u2.id AND u1.created_at > u2.created_at");
            echo "<p class='success'>✅ رکوردهای تکراری حذف شدند</p>";
            echo "</div>";
        }
        
        // اضافه کردن فیلدهای مورد نیاز
        if (!$hasUsername) {
            echo "<div class='section'>";
            echo "<h3>➕ اضافه کردن فیلد username</h3>";
            $conn->query("ALTER TABLE `users` ADD COLUMN `username` VARCHAR(100) NULL AFTER `id`");
            echo "<p class='success'>✅ فیلد username اضافه شد</p>";
            echo "</div>";
        }
        
        if (!$hasFullName) {
            echo "<div class='section'>";
            echo "<h3>➕ اضافه کردن فیلد full_name</h3>";
            $conn->query("ALTER TABLE `users` ADD COLUMN `full_name` VARCHAR(255) NULL AFTER `username`");
            echo "<p class='success'>✅ فیلد full_name اضافه شد</p>";
            echo "</div>";
        }
        
        // به‌روزرسانی فیلدها
        echo "<div class='section'>";
        echo "<h3>🔄 به‌روزرسانی فیلدها</h3>";
        $conn->query("UPDATE users SET username = COALESCE(email, CONCAT('user_', id)), full_name = name WHERE username IS NULL OR full_name IS NULL");
        echo "<p class='success'>✅ فیلدها به‌روزرسانی شدند</p>";
        echo "</div>";
        
        // رفع مشکل role های خالی
        echo "<div class='section'>";
        echo "<h3>🔄 رفع مشکل role های خالی</h3>";
        $result = $conn->query("SELECT COUNT(*) as count FROM users WHERE role = '' OR role IS NULL");
        $row = $result->fetch_assoc();
        if ($row['count'] > 0) {
            $conn->query("UPDATE users SET role = 'sales_agent' WHERE role = '' OR role IS NULL");
            echo "<p class='success'>✅ {$row['count']} رکورد با role خالی رفع شد</p>";
        } else {
            echo "<p class='success'>✅ همه role ها معتبر هستند</p>";
        }
        echo "</div>";
        
        // رفع مشکل collation
        echo "<div class='section'>";
        echo "<h3>🔄 رفع مشکل collation</h3>";
        $conn->query("ALTER TABLE activities MODIFY COLUMN performed_by varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL");
        $conn->query("ALTER TABLE users MODIFY COLUMN id varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL");
        echo "<p class='success'>✅ مشکل collation رفع شد</p>";
        echo "</div>";
        
        // رفع مشکل chat
        echo "<div class='section'>";
        echo "<h3>🔄 رفع مشکل جدول chat_conversations</h3>";
        $result = $conn->query("SHOW COLUMNS FROM chat_conversations");
        $chatColumns = [];
        while ($row = $result->fetch_assoc()) {
            $chatColumns[] = $row['Field'];
        }
        
        if (!in_array('participant_1_id', $chatColumns)) {
            $conn->query("ALTER TABLE chat_conversations ADD COLUMN participant_1_id varchar(36) NULL AFTER created_by");
            echo "<p class='success'>✅ فیلد participant_1_id اضافه شد</p>";
        }
        
        if (!in_array('participant_2_id', $chatColumns)) {
            $conn->query("ALTER TABLE chat_conversations ADD COLUMN participant_2_id varchar(36) NULL AFTER participant_1_id");
            echo "<p class='success'>✅ فیلد participant_2_id اضافه شد</p>";
        }
        echo "</div>";
        
        echo "<div class='section'>";
        echo "<h2 class='success'>✅ رفع مشکلات کامل شد!</h2>";
        echo "<p><a href='fix-database.php' class='btn'>🔄 بررسی مجدد</a></p>";
        echo "</div>";
    }
    
    // ========================================
    // بخش 3: تست کوئری‌ها
    // ========================================
    echo "<h2>🧪 تست کوئری‌های API</h2>";
    
    // تست coworkers
    echo "<div class='section'>";
    echo "<h3>👔 تست کوئری همکاران (coworkers)</h3>";
    $result = $conn->query("
        SELECT DISTINCT
            u.id,
            u.username,
            u.full_name,
            u.email,
            u.role,
            u.status
        FROM users u
        INNER JOIN activities a ON u.id = a.performed_by
        WHERE u.status = 'active'
        ORDER BY u.full_name ASC
        LIMIT 5
    ");
    
    if ($result && $result->num_rows > 0) {
        echo "<p class='success'>✅ {$result->num_rows} همکار یافت شد</p>";
        echo "<table><tr><th>ID</th><th>نام کاربری</th><th>نام کامل</th><th>ایمیل</th><th>نقش</th></tr>";
        while ($row = $result->fetch_assoc()) {
            echo "<tr><td>{$row['id']}</td><td>{$row['username']}</td><td>{$row['full_name']}</td><td>{$row['email']}</td><td>{$row['role']}</td></tr>";
        }
        echo "</table>";
    } else {
        echo "<p class='warning'>⚠️ هیچ همکاری یافت نشد (احتمالاً هیچ فعالیتی ثبت نشده)</p>";
    }
    echo "</div>";
    
    // تست sales
    echo "<div class='section'>";
    echo "<h3>💰 تست کوئری فروش (sales)</h3>";
    $result = $conn->query("
        SELECT id, customer_name, total_amount, payment_status, sale_date
        FROM sales
        ORDER BY created_at DESC
        LIMIT 5
    ");
    
    if ($result && $result->num_rows > 0) {
        echo "<p class='success'>✅ {$result->num_rows} فروش یافت شد</p>";
        echo "<table><tr><th>ID</th><th>نام مشتری</th><th>مبلغ</th><th>وضعیت پرداخت</th><th>تاریخ</th></tr>";
        while ($row = $result->fetch_assoc()) {
            echo "<tr><td>{$row['id']}</td><td>{$row['customer_name']}</td><td>" . number_format($row['total_amount']) . "</td><td>{$row['payment_status']}</td><td>{$row['sale_date']}</td></tr>";
        }
        echo "</table>";
    } else {
        echo "<p class='info'>ℹ️ هیچ فروشی ثبت نشده است</p>";
    }
    echo "</div>";
    
    // تست feedback
    echo "<div class='section'>";
    echo "<h3>📝 تست کوئری بازخورد (feedback)</h3>";
    $result = $conn->query("
        SELECT f.id, f.type, f.title, f.status, c.name as customer_name
        FROM feedback f
        LEFT JOIN customers c ON f.customer_id = c.id
        ORDER BY f.created_at DESC
        LIMIT 5
    ");
    
    if ($result && $result->num_rows > 0) {
        echo "<p class='success'>✅ {$result->num_rows} بازخورد یافت شد</p>";
        echo "<table><tr><th>ID</th><th>نوع</th><th>عنوان</th><th>وضعیت</th><th>مشتری</th></tr>";
        while ($row = $result->fetch_assoc()) {
            echo "<tr><td>{$row['id']}</td><td>{$row['type']}</td><td>{$row['title']}</td><td>{$row['status']}</td><td>{$row['customer_name']}</td></tr>";
        }
        echo "</table>";
    } else {
        echo "<p class='info'>ℹ️ هیچ بازخوردی ثبت نشده است</p>";
    }
    echo "</div>";
    
    // تست chat
    echo "<div class='section'>";
    echo "<h3>💬 تست کوئری چت (chat)</h3>";
    $result = $conn->query("
        SELECT id, title, type, created_by, created_at
        FROM chat_conversations
        ORDER BY updated_at DESC
        LIMIT 5
    ");
    
    if ($result && $result->num_rows > 0) {
        echo "<p class='success'>✅ {$result->num_rows} مکالمه یافت شد</p>";
        echo "<table><tr><th>ID</th><th>عنوان</th><th>نوع</th><th>ایجاد شده توسط</th><th>تاریخ</th></tr>";
        while ($row = $result->fetch_assoc()) {
            echo "<tr><td>{$row['id']}</td><td>{$row['title']}</td><td>{$row['type']}</td><td>{$row['created_by']}</td><td>{$row['created_at']}</td></tr>";
        }
        echo "</table>";
    } else {
        echo "<p class='info'>ℹ️ هیچ مکالمه‌ای ثبت نشده است</p>";
    }
    echo "</div>";
    
    // دکمه رفع مشکلات
    if (!isset($_POST['fix'])) {
        echo "<div class='section' style='text-align: center;'>";
        echo "<form method='post'>";
        echo "<button type='submit' name='fix' class='btn' style='font-size: 18px; padding: 15px 30px;'>🔧 رفع تمام مشکلات</button>";
        echo "</form>";
        echo "</div>";
    }
    
    // توصیه‌ها
    echo "<div class='section'>";
    echo "<h3>📌 توصیه‌ها</h3>";
    echo "<ol>";
    echo "<li>اگر جداول خالی هستند، باید داده‌های نمونه اضافه کنید</li>";
    echo "<li>سرور Next.js را ری‌استارت کنید</li>";
    echo "<li>صفحات را در مرورگر رفرش کنید (Ctrl+Shift+R)</li>";
    echo "<li>لاگ‌های کنسول مرورگر را بررسی کنید</li>";
    echo "</ol>";
    echo "</div>";
    
    $conn->close();
    
} catch (Exception $e) {
    echo "<div class='section'>";
    echo "<p class='error'>❌ خطا: " . $e->getMessage() . "</p>";
    echo "</div>";
}
?>

    </div>
</body>
</html>