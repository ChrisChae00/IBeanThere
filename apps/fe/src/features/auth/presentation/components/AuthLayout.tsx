"use client";

import { ReactNode, useEffect } from 'react';
import { Logo, CoffeeBean } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  features: Array<{
    icon: ReactNode;
    text: string;
  }>;
}

export function AuthLayout({ 
  children, 
  title, 
  subtitle, 
  features 
}: AuthLayoutProps) {
  const { needsProfileSetup, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Logic moved to AuthWatcher
  }, []);

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans">
      {/* Left Side - Branding & Visual (33%) */}
      <div className="w-full md:w-1/3 md:flex-none bg-[var(--color-secondary)] relative overflow-hidden p-8 lg:p-12 flex flex-col justify-between min-h-[300px] md:min-h-screen transition-colors duration-300">
        
        {/* Background Coffee Beans - Decorative */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[8%] left-[10%] opacity-10">
            <CoffeeBean size="lg" className="text-[var(--color-primaryText)] transform rotate-[25deg] scale-[4]" />
          </div>
          <div className="absolute bottom-[20%] right-[15%] opacity-15">
            <CoffeeBean size="lg" className="text-[var(--color-primaryText)] transform rotate-[-15deg] scale-[5]" />
          </div>
          <div className="absolute top-[40%] right-[10%] opacity-5">
             <CoffeeBean size="lg" className="text-[var(--color-primaryText)] transform rotate-[120deg] scale-[2]" />
          </div>
        </div>

        {/* Top: Logo */}
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-2 bg-[var(--color-primaryText)]/10 rounded-xl backdrop-blur-sm">
               <Logo size="md" className="text-[var(--color-primaryText)]" />
            </div>
            <span className="text-2xl font-bold text-[var(--color-primaryText)] tracking-tight">IBeanThere</span>
          </div>
        </div>

        {/* Middle: Hero Content */}
        <div className="relative z-10 my-auto">
          <h1 className="text-2xl lg:text-4xl font-bold text-[var(--color-primaryText)] mb-6 leading-[1.1] tracking-tight whitespace-pre-line drop-shadow-sm">
            {title}
          </h1>
          <p className="text-lg text-[var(--color-primaryText)] mb-10 max-w-md leading-relaxed font-light whitespace-pre-line">
            {subtitle}
          </p>

          {/* Features List */}
          <div className="flex flex-col space-y-3 mt-8 md:mt-0">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-4 group">
                <div className="w-10 h-10 bg-[var(--color-primaryText)]/10 rounded-full flex items-center justify-center group-hover:bg-[var(--color-primaryText)]/20 transition-all duration-300 backdrop-blur-sm">
                  <div className="text-[var(--color-primaryText)]">
                    {feature.icon}
                  </div>
                </div>
                <span className="text-[var(--color-primaryText)] font-medium text-lg tracking-wide">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom space (Copyright removed per user request) */}
        <div></div>
      </div>

      {/* Right Side - Auth Form (66%) */}
      <div className="w-full md:w-2/3 md:flex-none bg-[var(--color-surface)] flex items-center justify-center p-6 lg:p-16 relative">
         {/* Decorative subtle gradient for the form area */}
         <div className="absolute top-0 right-0 w-full h-2 bg-gradient-to-r from-transparent to-[var(--color-primary)]/10"></div>
         
        {/* Form Container - Widened to 85% */}
        <div className="w-full md:w-[85%] max-w-4xl bg-[var(--color-cardBackground)]/50 p-8 lg:p-12 rounded-[2rem] shadow-none lg:shadow-xl backdrop-blur-md border border-[var(--color-border)]/20">
          {children}
        </div>
      </div>
    </div>
  );
}
