
import React from 'react';
import { NAV_ITEMS } from '../constants';

interface BottomNavProps {
  currentPath: string;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentPath }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-neutral-200 md:hidden z-50">
      <div className="flex justify-around items-center h-full max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = currentPath === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full text-sm transition-colors duration-200 ${
                isActive ? 'text-primary' : 'text-neutral-500 hover:text-primary'
              }`}
            >
              {item.icon}
              <span className="mt-1">{item.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
