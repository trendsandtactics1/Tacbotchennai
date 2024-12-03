'use client';

import * as React from 'react';

interface TooltipProps {
  children: React.ReactNode;
  text: string;
  position?: 'left' | 'right';
}

export function Tooltip({ children, text, position = 'left' }: TooltipProps) {
  return (
    <div className='relative group'>
      {children}
      <div
        className={`absolute ${
          position === 'left' ? 'right-full mr-2' : 'left-full ml-2'
        } top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none`}
      >
        {text}
        <div
          className={`absolute top-1/2 -translate-y-1/2 ${
            position === 'left' ? '-right-1' : '-left-1'
          } border-4 border-transparent ${
            position === 'left' ? 'border-l-gray-800' : 'border-r-gray-800'
          }`}
        />
      </div>
    </div>
  );
}
