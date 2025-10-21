'use client';

interface HeaderProps {
  title: string;
  userName: string;
}

export default function Header({ title, userName }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Page Title Section */}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 truncate">
            {title}
          </h1>
        </div>
        
        {/* User Profile Section */}
        <div className="flex items-center space-x-3 rtl:space-x-reverse ml-4">
          {/* User Info - Hidden on mobile */}
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-gray-900">{userName}</p>
            <p className="text-xs text-gray-500">مدیر سیستم</p>
          </div>
          
          {/* User Avatar */}
          <div className="relative">
            <img 
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1e40af&color=fff&size=40`}
              alt="تصویر پروفایل" 
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-blue-200 shadow-sm hover:border-blue-300 transition-colors duration-200"
            />
            {/* Online status indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
          </div>
        </div>
      </div>
    </header>
  );
}