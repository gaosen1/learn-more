'use client';

import React, { ReactNode } from 'react';
import { ToastProvider } from '@/components/ui/toast';
import { UserAuthProvider } from '@/components/UserAuthProvider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ToastProvider>
      <UserAuthProvider>
        {children}
      </UserAuthProvider>
    </ToastProvider>
  );
} 