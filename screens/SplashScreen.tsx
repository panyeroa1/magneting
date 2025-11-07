import React from 'react';
import { LogoIcon } from '../constants';

const SplashScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-brand-dark">
      <div className="text-white">
        <LogoIcon style={{ color: 'white' }}/>
      </div>
      <p className="text-orange-200 mt-4 animate-pulse">Loading your learning experience...</p>
    </div>
  );
};

export default SplashScreen;