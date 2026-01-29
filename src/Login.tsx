import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabaseClient';
import { Mail, Lock, ArrowRight, AlertCircle, ChevronLeft } from 'lucide-react';
import { useLanguage } from './contexts/LanguageContext';

function Login() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<string | null>(null); // null, 'email', 'google', or 'false'
  const [checkingProvider, setCheckingProvider] = useState(false);
  const { signInWithEmail, signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If already logged in, redirect to profile
    if (user) {
      navigate('/profile');
    }
  }, [user, navigate]);

  const checkEmailProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCheckingProvider(true);

    try {
      // Call the Supabase function to check provider
      const { data, error } = await supabase
        .rpc('get_provider_by_email', { p_email: email });

      if (error) {
        console.error('Error checking provider:', error);
        setError(t('login.errorGeneric'));
        setCheckingProvider(false);
        return;
      }

      if (data === 'false') {
        // No user found with this email
        setError(t('login.errorNoAccount'));
        setCheckingProvider(false);
        return;
      }

      // Set the provider
      setProvider(data);
    } catch (err) {
      console.error('Error:', err);
      setError(t('login.errorGeneric'));
    } finally {
      setCheckingProvider(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await signInWithEmail(email, password);
      if (error) {
        setError(error.message);
      } else {
        navigate('/profile');
      }
    } catch (err) {
      setError(t('login.errorGeneric'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setError(error.message);
        setLoading(false);
      }
      // Don't set loading to false here - the redirect will happen
    } catch (err) {
      setError(t('login.errorGeneric'));
      setLoading(false);
    }
  };

  const handleChangeEmail = () => {
    setProvider(null);
    setPassword('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-20 pb-12 px-4 font-sans selection:bg-[#34aa56] selection:text-white">

      <div className="w-full max-w-md">

        {/* Back Link */}
        <Link to="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-8 transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" />
          {t('login.backToHome')}
        </Link>

        <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-200">

          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">{t('login.title')}</h1>
            <p className="text-slate-500">{t('login.subtitle')}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}

          {/* Step 1: Email Input - Show when provider is not determined */}
          {provider === null && (
            <form onSubmit={checkEmailProvider} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-bold text-slate-700">{t('login.emailLabel')}</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-[#34aa56] transition-colors" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="pelda@email.com"
                    required
                    disabled={checkingProvider}
                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#34aa56]/20 focus:border-[#34aa56] transition-all font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={checkingProvider}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 shadow-lg shadow-slate-900/10"
              >
                {checkingProvider ? t('login.checking') : t('login.nextButton')}
                {!checkingProvider && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}

          {/* Step 2a: Password Input - Show when provider is 'email' */}
          {provider === 'email' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-sm font-medium text-slate-700 truncate mr-2">{email}</span>
                <button
                  type="button"
                  onClick={handleChangeEmail}
                  disabled={loading}
                  className="text-xs font-bold text-[#34aa56] hover:text-emerald-700 transition-colors uppercase tracking-wide whitespace-nowrap"
                >
                  {t('login.changeEmail')}
                </button>
              </div>

              <form onSubmit={handleEmailLogin} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-bold text-slate-700">{t('login.passwordLabel')}</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-[#34aa56] transition-colors" />
                    </div>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      disabled={loading}
                      autoFocus
                      className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#34aa56]/20 focus:border-[#34aa56] transition-all font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 shadow-lg shadow-slate-900/10"
                >
                  {loading ? t('login.loginButton') + '...' : t('login.loginButton')}
                </button>
              </form>
            </div>
          )}

          {/* Step 2b: Google Sign In - Show when provider is 'google' */}
          {provider === 'google' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-sm font-medium text-slate-700 truncate mr-2">{email}</span>
                <button
                  type="button"
                  onClick={handleChangeEmail}
                  disabled={loading}
                  className="text-xs font-bold text-[#34aa56] hover:text-emerald-700 transition-colors uppercase tracking-wide whitespace-nowrap"
                >
                  {t('login.changeEmail')}
                </button>
              </div>

              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 font-bold py-3.5 px-4 rounded-xl border border-slate-200 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:hover:scale-100 shadow-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {loading ? t('login.loginButton') + '...' : t('login.googleButton')}
              </button>
            </div>
          )}

        </div>

        <p className="text-center mt-8 text-slate-400 text-sm">
          {t('footer.rights')}
        </p>

      </div>
    </div>
  );
}

export default Login;
