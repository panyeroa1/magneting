
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

const SignupScreen: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('learner');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signup({ 
        email, 
        password, 
        options: { 
            data: { 
                full_name: fullName, 
                role 
            }
        } 
    });
    if (error) {
      setError(error.message);
    }
    // On success, the AuthContext will handle navigation to profile setup
    setLoading(false);
  };

  return (
    <div className="flex flex-col justify-center min-h-screen bg-neutral-100 p-6">
      <div className="max-w-md w-full mx-auto">
        <h2 className="text-3xl font-bold text-center text-neutral-900 mb-2">Create Your Account</h2>
        <p className="text-center text-neutral-500 mb-8">Join the Manetar community today.</p>

        {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-center">{error}</p>}
        
        <form onSubmit={handleSignup} className="space-y-6">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-neutral-700">Full Name</label>
            <input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <label htmlFor="email-signup" className="block text-sm font-medium text-neutral-700">Email address</label>
            <input
              id="email-signup"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password-signup" className="block text-sm font-medium text-neutral-700">Password</label>
            <input
              id="password-signup"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-neutral-700">I am a...</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-neutral-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
            >
              <option value="learner">Learner / Viewer</option>
              <option value="mentor">Mentor / Trainer</option>
              <option value="client">Client</option>
            </select>
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-neutral-300"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </div>
        </form>
        <p className="mt-6 text-center text-sm text-neutral-500">
          Already have an account?{' '}
          <a href="#login" className="font-medium text-primary hover:text-primary-hover">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignupScreen;