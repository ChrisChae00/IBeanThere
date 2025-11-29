import { useTranslations } from 'next-intl';
import ShopHero from '@/components/shop/ShopHero';
import SectionHeader from '@/components/shop/SectionHeader';
import ProductCard from '@/components/shop/ProductCard';

export default function ShopPage() {
  const t = useTranslations('shop');

  const essentials = [
    {
      id: 'tumbler',
      titleKey: 'products.tumbler.title',
      descKey: 'products.tumbler.desc',
      tags: ['sustainable', 'minimalist'],
    },
    {
      id: 'pouch',
      titleKey: 'products.pouch.title',
      descKey: 'products.pouch.desc',
      tags: ['waterproof', 'protective'],
    },
    {
      id: 'ecobag',
      titleKey: 'products.ecobag.title',
      descKey: 'products.ecobag.desc',
      tags: ['lightweight', 'durable'],
    },
  ];

  const explorer = [
    {
      id: 'keyring',
      titleKey: 'products.keyring.title',
      descKey: 'products.keyring.desc',
      tags: ['collectible', 'accessory'],
    },
    {
      id: 'passport',
      titleKey: 'products.passport.title',
      descKey: 'products.passport.desc',
      tags: ['stationery', 'analog'],
    },
    {
      id: 'stickers',
      titleKey: 'products.stickers.title',
      descKey: 'products.stickers.desc',
      tags: ['decoration', 'fun'],
    },
  ];

  const wearables = [
    {
      id: 'hoodie',
      titleKey: 'products.hoodie.title',
      descKey: 'products.hoodie.desc',
      tags: ['comfort', 'streetwear'],
    },
    {
      id: 'cap',
      titleKey: 'products.cap.title',
      descKey: 'products.cap.desc',
      tags: ['vintage', 'casual'],
    },
  ];

  const gifts = [
    {
      id: 'dripbag',
      titleKey: 'products.dripbag.title',
      descKey: 'products.dripbag.desc',
      tags: ['selection', 'premium'],
    },
    {
      id: 'coaster',
      titleKey: 'products.coaster.title',
      descKey: 'products.coaster.desc',
      tags: ['home', 'design'],
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-background)] pb-20">
      <ShopHero />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 mt-20">
        
        {/* Section 1: Essentials */}
        <section>
          <SectionHeader 
            id="essentials"
            title={t('sections.essentials.title')} 
            subtitle={t('sections.essentials.subtitle')}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {essentials.map((product) => (
              <ProductCard
                key={product.id}
                title={t(product.titleKey)}
                description={t(product.descKey)}
                tags={product.tags}
                isComingSoon={true}
              />
            ))}
          </div>
        </section>

        {/* Section 2: Explorer */}
        <section>
          <SectionHeader 
            id="explorer"
            title={t('sections.explorer.title')} 
            subtitle={t('sections.explorer.subtitle')}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            }
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {explorer.map((product) => (
              <ProductCard
                key={product.id}
                title={t(product.titleKey)}
                description={t(product.descKey)}
                tags={product.tags}
                isComingSoon={true}
              />
            ))}
          </div>
        </section>

        {/* Section 3: Wearable */}
        <section>
          <SectionHeader 
            id="wearable"
            title={t('sections.wearable.title')} 
            subtitle={t('sections.wearable.subtitle')}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {wearables.map((product) => (
              <ProductCard
                key={product.id}
                title={t(product.titleKey)}
                description={t(product.descKey)}
                tags={product.tags}
                isComingSoon={true}
              />
            ))}
          </div>
        </section>

        {/* Section 4: Gift */}
        <section>
          <SectionHeader 
            id="gift"
            title={t('sections.gift.title')} 
            subtitle={t('sections.gift.subtitle')}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            }
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {gifts.map((product) => (
              <ProductCard
                key={product.id}
                title={t(product.titleKey)}
                description={t(product.descKey)}
                tags={product.tags}
                isComingSoon={true}
              />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
