import { redirect } from 'next/navigation';
import { createClient } from '@/shared/lib/supabase/server';
import MyLogsClient from './MyLogsClient';

export default async function MyLogsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect(`/${locale}/signin`);
  }

  return <MyLogsClient />;
}
