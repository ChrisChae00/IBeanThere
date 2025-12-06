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

export default function AuthLayout({ 
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
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Branding & Visual (35%) */}
      <div className="lg:w-1/3 bg-[var(--color-secondary)] relative overflow-hidden p-6 lg:p-8 flex flex-col justify-start pt-40 lg:pt-48 pl-8 lg:pl-16">
        {/* Background Coffee Beans */}
        <div className="absolute inset-0 opacity-30 z-0">
          <div className="absolute top-16 left-16">
            <CoffeeBean size="lg" className="text-[var(--color-background)] transform rotate-[20deg] scale-[2]" />
          </div>
          <div className="absolute bottom-[200px] right-12">
            <CoffeeBean size="lg" className="text-[var(--color-background)] transform scale-[2.5]" />
          </div>
          <div className="absolute top-40 right-24">
            <CoffeeBean size="lg" className="text-[var(--color-background)] transform rotate-[100deg] scale-[1.8]" />
          </div>
        </div>

        <div className="relative z-10 text-center lg:text-left">
          {/* Logo */}
          <div className="flex items-center justify-center lg:justify-start space-x-1 mb-6">
            <Logo size="md" className="text-[var(--color-background)]" />
            <span className="text-xl font-semibold text-[var(--color-authText)]">IBeanThere</span>
          </div>

          {/* Main Content */}
          <h1 className="text-2xl lg:text-3xl font-bold text-[var(--color-authText)] mb-3 leading-tight whitespace-pre-line">
            {title}
          </h1>
          <p className="text-base text-[var(--color-authText)] mb-6 max-w-sm mx-auto lg:mx-0 whitespace-pre-line">
            {subtitle}
          </p>

          {/* Features */}
          <div className="hidden lg:block space-y-3 text-[var(--color-authText)]">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-[var(--color-authText)]/20 rounded-full flex items-center justify-center">
                  {feature.icon}
                </div>
                <span className="text-sm">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form (65%) */}
      <div className="lg:w-2/3 bg-[var(--color-background)] flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-lg">
          {children}
        </div>
      </div>
    </div>
  );
}
