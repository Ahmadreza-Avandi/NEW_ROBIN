/**
 * صفحه خطای Account Inactive
 */

export default function AccountInactivePage({
  params,
}: {
  params: { tenant_key: string };
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            حساب کاربری غیرفعال
          </h1>
          <p className="text-gray-600">
            حساب کاربری شما در حال حاضر غیرفعال است.
          </p>
        </div>
        
        <div className="space-y-3">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-right">
            <p className="text-sm text-gray-700">
              <strong>شرکت:</strong> {params.tenant_key}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              برای فعال‌سازی مجدد حساب، لطفا با پشتیبانی تماس بگیرید.
            </p>
          </div>
          
          <div className="pt-4 space-y-2">
            <a
              href={`mailto:support@crm.robintejarat.com?subject=فعال‌سازی حساب ${params.tenant_key}`}
              className="block w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              تماس با پشتیبانی
            </a>
            <a
              href="/"
              className="block w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              بازگشت به صفحه اصلی
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
