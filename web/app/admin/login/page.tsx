import { redirect } from 'next/navigation';

export const metadata = { title: 'Connexion', robots: { index: false, follow: false } };

export default function AdminLoginPage() {
  redirect('/admin');
}
