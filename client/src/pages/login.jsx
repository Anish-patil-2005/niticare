/* eslint-disable no-unused-vars */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { authService } from '../api/authService';
import { User, Lock, ArrowRight, HeartPulse, Loader2 } from 'lucide-react';
import { LanguageSelector } from '../components/LanguageSelector';

const Login = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { handleLogin } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authService.login({ username, password });
      handleLogin({ role: response.role, full_name: response.name, username }, response.token);
      navigate(response.role === 'admin' ? '/admin/dashboard' : '/asha/dashboard');
    } catch (err) {
      setError(t('auth.error_invalid'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    /* Changed min-h-screen and py-10 for scroll safety at 100% zoom */
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-slate-50 relative overflow-y-auto py-10">
      
      {/* Replaced inline code with the LanguageSelector component */}
      <LanguageSelector isAbsolute={true} />

      <div className="card-niti w-full max-w-md animate-in fade-in zoom-in duration-500 my-auto">
        {/* Adjusted spacing to match the optimized Register layout */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-primary-glow text-primary mb-4">
            <HeartPulse size={36} />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">NitiCare</h1>
          <p className="text-slate-400 font-bold mt-1 uppercase tracking-[0.2em] text-[10px]">
            {t('auth.portal_subtitle')}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
              {t('auth.username')}
            </label>
            <div className="relative group">
              <User className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
              <input 
                type="text" 
                required 
                className="input-niti py-2.5" 
                placeholder={t('auth.username_placeholder')} 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
              {t('auth.password')}
            </label>
            <div className="relative group">
              <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
              <input 
                type="password" 
                required 
                className="input-niti py-2.5" 
                placeholder={t('auth.password_placeholder')} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-2xl text-[11px] font-bold border border-red-100">
              {error}
            </div>
          )}

          <button type="submit" disabled={isLoading} className="btn-primary-niti mt-2">
            {isLoading ? (
              <Loader2 className="animate-spin" size={22} />
            ) : (
              <>
                {t('auth.login_btn')} <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 font-medium">
            {t('auth.new_here')}{' '}
            <Link to="/register" className="text-primary font-black hover:underline underline-offset-8">
              {t('auth.register_title')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;