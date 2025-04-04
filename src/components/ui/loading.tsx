import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  fullscreen?: boolean;
  text?: string;
  variant?: 'primary' | 'light' | 'dark';
}

export const LoadingSpinner: React.FC<LoadingProps> = ({
  size = 'md',
  fullscreen = false,
  text = 'Loading',
  variant = 'primary'
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16'
  };

  // Color classes
  const colorClasses = {
    primary: 'text-blue-500',
    light: 'text-white',
    dark: 'text-gray-800'
  };

  // Text size classes
  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl'
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center ${fullscreen ? 'min-h-screen' : ''}`}>
      <div className="relative">
        {/* Background ring */}
        <div className={`rounded-full absolute inset-0 border-4 border-t-transparent border-b-transparent ${
          variant === 'primary' ? 'border-blue-200' : 
          variant === 'light' ? 'border-gray-100' : 'border-gray-300'
        } animate-pulse ${sizeClasses[size]}`}></div>
        
        {/* Spinning ring */}
        <svg 
          className={`animate-spin ${sizeClasses[size]} ${colorClasses[variant]}`} 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
            fill="none"
          ></circle>
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
      
      {text && (
        <p className={`mt-4 font-medium ${textSizeClasses[size]} ${colorClasses[variant]}`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export const LoadingDots: React.FC<Omit<LoadingProps, 'text'>> = ({
  size = 'md',
  fullscreen = false,
  variant = 'primary'
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'h-1.5 w-1.5',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3'
  };
  
  // Gap classes
  const gapClasses = {
    sm: 'gap-1.5',
    md: 'gap-2',
    lg: 'gap-3'
  };

  // Color classes
  const colorClasses = {
    primary: 'bg-blue-500',
    light: 'bg-white',
    dark: 'bg-gray-800'
  };

  const dots = (
    <div className={`flex ${gapClasses[size]} items-center justify-center ${fullscreen ? 'min-h-screen' : ''}`}>
      <div className={`${sizeClasses[size]} rounded-full ${colorClasses[variant]} animate-bounce`} style={{ animationDelay: '0ms' }}></div>
      <div className={`${sizeClasses[size]} rounded-full ${colorClasses[variant]} animate-bounce`} style={{ animationDelay: '150ms' }}></div>
      <div className={`${sizeClasses[size]} rounded-full ${colorClasses[variant]} animate-bounce`} style={{ animationDelay: '300ms' }}></div>
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
        {dots}
      </div>
    );
  }

  return dots;
};

export const LoadingPulse: React.FC<LoadingProps> = ({
  size = 'md',
  fullscreen = false,
  text = 'Loading',
  variant = 'primary'
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'h-8 w-24',
    md: 'h-12 w-32',
    lg: 'h-16 w-40'
  };

  // Color classes
  const colorClasses = {
    primary: 'bg-blue-500',
    light: 'bg-white',
    dark: 'bg-gray-800'
  };

  // Text size classes
  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl'
  };

  const pulse = (
    <div className={`flex flex-col items-center justify-center ${fullscreen ? 'min-h-screen' : ''}`}>
      <div className={`${sizeClasses[size]} rounded-md relative overflow-hidden`}>
        <div className={`absolute inset-0 ${colorClasses[variant]} opacity-30`}></div>
        <div 
          className={`absolute inset-0 ${colorClasses[variant]} opacity-50 animate-pulse`}
          style={{ animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
        ></div>
        
        {text && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className={`font-medium ${textSizeClasses[size]} text-white`}>
              {text}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
        {pulse}
      </div>
    );
  }

  return pulse;
}; 