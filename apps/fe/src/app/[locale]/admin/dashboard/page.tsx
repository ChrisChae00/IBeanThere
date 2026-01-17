import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { createClient } from '@/shared/lib/supabase/server';
import AdminDashboardClient from '@/components/admin/AdminDashboardClient';

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin' });

  const supabase = await createClient();
  
  // Use getUser() instead of getSession() for security (verifies with Supabase Auth server)
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(`/${locale}/signin`);
  }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || profile.role !== 'admin') {
    redirect(`/${locale}`);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">
          {t('dashboard_title')}
        </h1>
        <p className="text-[var(--color-textSecondary)]">
          {t('dashboard_subtitle')}
        </p>
      </div>
      <AdminDashboardClient />
    </div>
  );
}
