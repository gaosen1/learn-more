import { ReactNode } from 'react';

interface EducatorLayoutProps {
  children: ReactNode;
}

export const metadata = {
  title: 'Educator Portal - LearnMore',
  description: 'Manage your courses and analyze student progress',
};

export default function EducatorLayout({ children }: EducatorLayoutProps) {
  return (
    <>
      {children}
    </>
  );
} 