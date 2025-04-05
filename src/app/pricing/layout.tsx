import { ReactNode } from 'react';

interface PricingLayoutProps {
  children: ReactNode;
}

export const metadata = {
  title: 'Subscription Plans - LearnMore',
  description: 'Choose the perfect subscription plan for your learning journey',
};

export default function PricingLayout({ children }: PricingLayoutProps) {
  return (
    <>
      {children}
    </>
  );
} 