import { redirect } from 'next/navigation';

export default function DashboardRedirect() {
  // Redirect به dashboard tenant پیش‌فرض
  redirect('/rabin/dashboard');
}
