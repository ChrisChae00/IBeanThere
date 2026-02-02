import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { createClient } from '@/shared/lib/supabase/server';
import { ReportsList } from '@/features/admin';

interface ReportsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: ReportsPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.reports' });
  return {
    title: t('page_title'),
  };
}

export default async function ReportsPage({ params }: ReportsPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.reports' });

  // Server-side authentication and admin role check
  const supabase = await createClient();
  
  // Use getUser() instead of getSession() for security (verifies with Supabase Auth server)
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(`/${locale}/signin`);
  }

  // Check admin role from database
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || profile.role !== 'admin') {
    redirect(`/${locale}`);
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-text)]">
          {t('page_title')}
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-2">
          {t('page_description')}
        </p>
      </div>

      <ReportsList />
    </div>
  );
}
