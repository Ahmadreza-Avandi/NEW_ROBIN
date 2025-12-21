import { notFound } from 'next/navigation';

export default function HomePage() {
  // نمایش صفحه 404 برای root path
  notFound();
}
