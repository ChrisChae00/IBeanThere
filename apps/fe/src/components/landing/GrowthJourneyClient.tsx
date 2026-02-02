'use client';

import { useState } from 'react';
import confetti from 'canvas-confetti';
import { SeedIcon, SproutIcon, GrowingIcon, TreeIcon, HarvestIcon } from './GrowthJourneyIcons';

type Step = 'seed' | 'sprout' | 'growing' | 'tree' | 'harvest';

type GrowthJourneyClientProps = {
  messages: {
    title: string;
    subtitle: string;
    steps: {
      seed: { title: string; description: string };
      sprout: { title: string; description: string };
      growing: { title: string; description: string };
      tree: { title: string; description: string };
      harvest: { title: string; description: string };
    };
  };
};

export default function GrowthJourneyClient({ messages }: GrowthJourneyClientProps) {
  const [currentStep, setCurrentStep] = useState<Step>('seed');
  const [isAnimating, setIsAnimating] = useState(false);

  const steps: Step[] = ['seed', 'sprout', 'growing', 'tree', 'harvest'];

  const handleNextStep = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const currentIndex = steps.indexOf(currentStep);
    const nextIndex = (currentIndex + 1) % steps.length;
    
    // Smooth transition
    setTimeout(() => {
        setCurrentStep(steps[nextIndex]);
        setIsAnimating(false);
        
        if (steps[nextIndex] === 'harvest') {
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#F87171', '#34D399', '#FBBF24'], // Cherry red, Leaf green, Sun yellow
          });
        }
    }, 200);
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        onClick={handleNextStep}
        className="w-48 h-48 sm:w-64 sm:h-64 bg-[var(--color-background)] rounded-full border-4 border-[var(--color-primary)] flex items-center justify-center cursor-pointer mb-8 transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-[0_0_20px_rgba(0,0,0,0.2)] relative overflow-hidden"
      >
        <div className={`transition-all duration-500 ease-in-out absolute transform ${currentStep === 'seed' ? 'scale-100 opacity-100 rotate-0' : 'scale-75 opacity-0 -rotate-45'}`}>
           <SeedIcon className="w-28 h-28" />
        </div>
        
        <div className={`transition-all duration-500 ease-in-out absolute transform ${currentStep === 'sprout' ? 'scale-100 opacity-100 translate-y-0' : 'scale-75 opacity-0 translate-y-10'}`}>
          <SproutIcon className="w-28 h-28" />
        </div>

        <div className={`transition-all duration-500 ease-in-out absolute transform ${currentStep === 'growing' ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
          <GrowingIcon className="w-32 h-32" />
        </div>

        <div className={`transition-all duration-500 ease-in-out absolute transform ${currentStep === 'tree' ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
          <TreeIcon className="w-32 h-32" />
        </div>

        <div className={`transition-all duration-500 ease-in-out absolute transform ${currentStep === 'harvest' ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
          <HarvestIcon className="w-32 h-32" />
        </div>

        <div className="absolute bottom-6 text-xs font-bold text-[var(--color-primary)] uppercase tracking-widest opacity-70">
          Tap to Grow
        </div>
      </div>

      <div className="text-center max-w-lg animate-fade-in px-4">
        <h3 className="text-2xl sm:text-3xl font-bold text-[var(--color-textHero)] mb-3 transition-all duration-300">
            {messages.steps[currentStep].title}
        </h3>
        <p className="text-lg sm:text-xl text-[var(--color-textHero)] opacity-90 transition-all duration-300 leading-relaxed">
            {messages.steps[currentStep].description}
        </p>
      </div>
      
      {/* Progress Dots */}
      <div className="flex gap-4 mt-10">
        {steps.map((step) => (
          <button
            key={step}
            onClick={() => setCurrentStep(step)} 
            className={`w-3 h-3 rounded-full transition-all duration-500 ${
              step === currentStep 
                ? 'bg-[var(--color-primary)] scale-150' 
                : 'bg-[var(--color-textHero)] opacity-30 hover:opacity-100 hover:scale-110'
            }`}
            aria-label={`Go to ${step} step`}
          />
        ))}
      </div>
    </div>
  );
}
