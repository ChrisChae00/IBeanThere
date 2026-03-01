import { LoadingSpinner } from '@/shared/ui';

export default function ExploreMapLoading() {
  return (
    <main className="min-h-screen bg-[var(--color-background)]">
      <section className="pt-6 pb-4 bg-gradient-to-b from-[var(--color-background)] to-[var(--color-surface)]/30">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <div className="h-12 w-72 bg-[var(--color-surface)] rounded-lg animate-pulse mb-4" />
              <div className="h-6 w-48 bg-[var(--color-surface)] rounded-lg animate-pulse" />
            </div>
            <div className="h-12 w-40 bg-[var(--color-surface)] rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <LoadingSpinner size="lg" />
      </div>
    </main>
  );
}
