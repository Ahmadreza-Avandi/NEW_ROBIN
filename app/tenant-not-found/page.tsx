/**
 * صفحه خطای Tenant Not Found
 */

export default function TenantNotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            شرکت یافت نشد
          </h1>
          <p className="text-gray-600">
            شرکت مورد نظر در سیستم ثبت نشده است یا آدرس وارد شده اشتباه است.
          </p>
        </div>
        
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            لطفا آدرس را بررسی کنید یا با پشتیبانی تماس بگیرید.
          </p>
          
          <div className="pt-4">
            <a
              href="/"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              بازگشت به صفحه اصلی
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
