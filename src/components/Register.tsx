import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, Github } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, loginWithGoogle, loginWithGithub } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || sessionStorage.getItem('authRedirect') || '/';

  useEffect(() => {
    const fromState = (location.state as any)?.from;
    if (fromState) {
      sessionStorage.setItem('authRedirect', fromState);
    } else {
      // If we landed here without a target (e.g. sidebar login), clear any stale target
      sessionStorage.removeItem('authRedirect');
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      sessionStorage.removeItem('authRedirect');
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      setLoading(true);
      loginWithGithub(code)
        .then(() => {
          sessionStorage.removeItem('authRedirect');
          navigate(from, { replace: true });
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [loginWithGithub, navigate, from]);

  const handleGithubLogin = () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    if (!clientId) {
      setError('GitHub login is not configured');
      return;
    }
    const redirectUri = `${window.location.origin  }/register`;
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Or{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              sign in to existing account
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex flex-col items-center gap-3">
            <div className="w-full max-w-[320px]">
              <GoogleLogin
                theme="outline"
                shape="rectangular"
                text="continue_with"
                size="large"
                width="320"
                onSuccess={async (credentialResponse) => {
                  if (credentialResponse.credential) {
                    setError('');
                    try {
                      await loginWithGoogle(credentialResponse.credential);
                      sessionStorage.removeItem('authRedirect');
                      navigate(from, { replace: true });
                    } catch (err: any) {
                      setError(err.message);
                    }
                  }
                }}
                onError={() => setError('Google Signup failed')}
              />
            </div>
            
            <button
              onClick={handleGithubLogin}
              disabled={loading}
              className="w-full max-w-[320px] flex justify-center items-center gap-3 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-xs bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 h-[40px]"
            >
              <Github className="h-5 w-5" />
              Sign up with GitHub
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                  Or sign up with email
                </span>
              </div>
            </div>
          </div>
        </div>

        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-xs -space-y-px">
            <div>
              <input
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 rounded-t-md focus:outline-hidden focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <input
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-hidden focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 rounded-b-md focus:outline-hidden focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Sign up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
