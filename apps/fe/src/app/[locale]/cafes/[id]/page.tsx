import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getCafeDetail } from '@/lib/api/cafes';
import CafeDetailClient from './CafeDetailClient';
import Script from 'next/script';
import { redirect } from 'next/navigation';

interface CafeDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: CafeDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  
  try {
    // id can be either slug or UUID
    const cafe = await getCafeDetail(id);
    const t = await getTranslations('cafe.detail');
    
    const title = `${cafe.name} - ${cafe.address || ''} | IBeanThere`;
    const description = cafe.average_rating
      ? `${cafe.name} - ${t('average_rating')}: ${cafe.average_rating.toFixed(1)}/5 ${t('from')} ${cafe.log_count} ${t('coffee_logs')}`
      : `${cafe.name} - ${cafe.address || ''}`;
    
    const imageUrl = cafe.recent_logs?.[0]?.photo_urls?.[0] || '/default-cafe.jpg';
    
    return {
      title,
      description,
      openGraph: {
        title: cafe.name,
        description: cafe.address || description,
        images: [imageUrl],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: cafe.name,
        description: cafe.address || description,
        images: [imageUrl],
      },
    };
  } catch (error) {
    return {
      title: 'Cafe | IBeanThere',
    };
  }
}

export default async function CafeDetailPage({ params }: CafeDetailPageProps) {
  const { id, locale } = await params;
  
  try {
    // id can be either slug or UUID
    const cafe = await getCafeDetail(id);
    
    if (cafe.slug && cafe.slug !== id) {
      redirect(`/${locale}/cafes/${cafe.slug}`);
    }
    
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'CafeOrCoffeeShop',
      name: cafe.name,
      address: {
        '@type': 'PostalAddress',
        streetAddress: cafe.address || '',
      },
      ...(cafe.average_rating && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: cafe.average_rating.toFixed(1),
          reviewCount: cafe.log_count,
          bestRating: '5',
          worstRating: '1',
        },
      }),
      ...(cafe.phone && { telephone: cafe.phone }),
      ...(cafe.website && { url: cafe.website }),
    };
    
    return (
      <>
        <Script
          id="cafe-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <CafeDetailClient cafe={cafe} />
      </>
    );
  } catch (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--color-cardText)] mb-4">
            Cafe not found
          </h1>
          <p className="text-[var(--color-cardTextSecondary)]">
            The cafe you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }
}

