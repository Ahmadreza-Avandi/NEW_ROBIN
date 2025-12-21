export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">صفحه یافت نشد</h2>
        <p className="text-gray-600 mb-8">صفحه‌ای که دنبال آن می‌گردید وجود ندارد.</p>
        <a 
          href="/secret-zone-789/admin-panel" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
        >
          بازگشت به پنل مدیریت
        </a>
      </div>
    </div>
  );
}