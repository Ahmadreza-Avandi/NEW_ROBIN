import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect به صفحه لاگین tenant پیش‌فرض (rabin)
  redirect('/rabin/login');
}
