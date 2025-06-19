import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Auth() {
  const isSignup = new URLSearchParams(window.location.search).get('signup') === 'true';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (isSignup && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    console.log(`Attempting ${isSignup ? 'Sign Up' : 'Sign In'} with:`, { email, password });
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white font-sans overflow-hidden relative flex items-center justify-center">
      <div className="bg-gray-800/70 backdrop-blur-sm p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text">
          {isSignup ? 'Sign Up' : 'Sign In'}
        </h2>
        {error && <p className="text-red-400 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              aria-label="Email address"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              aria-label="Password"
              required
            />
          </div>
          {isSignup && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                aria-label="Confirm Password"
                required
              />
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-[var(--color-primary)]/80 text-white px-4 py-2 rounded-lg hover:bg-[var(--color-secondary)]/80 transition-all duration-300"
            aria-label={isSignup ? 'Sign Up' : 'Sign In'}
          >
            {isSignup ? 'Sign Up' : 'Sign In'}
          </button>
        </form>
        <p className="mt-4 text-center text-gray-400">
          {isSignup ? 'Already have an account?' : 'Don’t have an account?'}{' '}
          <Link to={`/auth${isSignup ? '' : '?signup=true'}`} className="text-[var(--color-primary)] hover:text-[var(--color-secondary)] transition-colors duration-300">
            {isSignup ? 'Sign In' : 'Sign Up'}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Auth;