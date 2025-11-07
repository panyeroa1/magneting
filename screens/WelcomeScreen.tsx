import React from 'react';
import { LogoIcon } from '../constants';


const WelcomeScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white p-8 text-center">
        <div className="text-brand-dark">
            <LogoIcon />
        </div>
        <p className="text-neutral-500 mt-4 max-w-md">
            Social learning and presentations for mentors and clients.
        </p>
      
        <div className="mt-12 w-full max-w-xs space-y-4">
            <a href="#login" className="block w-full text-center bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-hover transition-colors">
                Log In
            </a>
            <a href="#signup" className="block w-full text-center bg-neutral-200 text-neutral-800 font-bold py-3 px-4 rounded-lg hover:bg-neutral-300 transition-colors">
                Create Account
            </a>
        </div>
    </div>
  );
};

export default WelcomeScreen;