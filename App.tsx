
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import BottomNav from './components/BottomNav';
import HomeScreen from './screens/HomeScreen';
import TrainingsScreen from './screens/TrainingsScreen';
import VideosScreen from './screens/VideosScreen';
import ProfileScreen from './screens/ProfileScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import ProfileSetupScreen from './screens/ProfileSetupScreen';
import SplashScreen from './screens/SplashScreen';
import GeminiChat from './components/GeminiChat';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Main />
    </AuthProvider>
  );
};

const Main: React.FC = () => {
  const { user, profile, loading, needsProfileSetup } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.hash || '#welcome');

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(window.location.hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  useEffect(() => {
    if (loading) {
      setCurrentPath('#splash');
    } else if (!user) {
      if (currentPath !== '#login' && currentPath !== '#signup') {
        window.location.hash = '#welcome';
        setCurrentPath('#welcome');
      }
    } else if (needsProfileSetup) {
      window.location.hash = '#profile-setup';
      setCurrentPath('#profile-setup');
    } else {
      if (['#welcome', '#login', '#signup', '#profile-setup', '#splash', ''].includes(currentPath)) {
        window.location.hash = '#home';
        setCurrentPath('#home');
      }
    }
  }, [user, loading, needsProfileSetup, currentPath]);

  const renderContent = () => {
    if (loading) return <SplashScreen />;
    if (!user) {
      switch (currentPath) {
        case '#login':
          return <LoginScreen />;
        case '#signup':
          return <SignupScreen />;
        case '#welcome':
        default:
          return <WelcomeScreen />;
      }
    }

    if (needsProfileSetup) {
      return <ProfileSetupScreen />;
    }

    let Component;
    switch (currentPath) {
      case '#home':
        Component = HomeScreen;
        break;
      case '#trainings':
        Component = TrainingsScreen;
        break;
      case '#videos':
        Component = VideosScreen;
        break;
      case '#profile':
        Component = ProfileScreen;
        break;
      default:
        Component = HomeScreen;
        window.location.hash = '#home';
    }

    return (
      <div className="pb-16 md:pb-0">
        <Component />
      </div>
    );
  };

  const showNav = !loading && user && !needsProfileSetup;

  return (
    <div className="bg-neutral-100 min-h-screen font-sans">
      <div className="container mx-auto max-w-lg md:max-w-xl lg:max-w-2xl bg-white min-h-screen shadow-lg">
        <main>
          {renderContent()}
        </main>
        {showNav && (
          <>
            <BottomNav currentPath={currentPath} />
            <GeminiChat />
          </>
        )}
      </div>
    </div>
  );
};

export default App;
