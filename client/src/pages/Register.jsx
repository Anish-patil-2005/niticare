/* eslint-disable no-unused-vars */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '../api/authService';
import { User, Lock, Briefcase, UserCircle, MapPin, Loader2, ArrowRight, HeartPulse } from 'lucide-react';
import { LanguageSelector } from '../components/LanguageSelector';

const Register = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '', 
    role: 'asha',   
    village: ''    
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await authService.register(formData);
      navigate('/login', { state: { message: t('auth.success_register') } });
    } catch (err) {
      setError(err.message || t('auth.error_register_fail'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    /* py-10 allows the page to scroll if the form is taller than the window at 100% zoom */
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-slate-50 relative overflow-y-auto py-10">
      <LanguageSelector isAbsolute={true} />

      <div className="card-niti w-full max-w-md animate-in fade-in zoom-in duration-500 my-auto">
        {/* Tightened Header Section */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-glow text-primary mb-3">
            <HeartPulse size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">NitiCare</h1>
          <p className="text-slate-400 font-bold mt-0.5 uppercase tracking-[0.2em] text-[9px]">
            {t('auth.enrollment_subtitle')}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
              {t('auth.full_name')}
            </label>
            <div className="relative group">
              <UserCircle className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
              <input 
                type="text"
                required
                className="input-niti py-2.5 text-sm"
                placeholder={t('auth.full_name_placeholder')}
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                {t('auth.username')}
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  type="text"
                  required
                  className="input-niti py-2.5 text-sm"
                  placeholder={t('auth.username_placeholder')}
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                />
              </div>
            </div>

            {/* Role selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                {t('auth.role')}
              </label>
              <div className="relative group">
                <Briefcase className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                <select 
                  className="input-niti py-2.5 text-sm appearance-none cursor-pointer pr-10"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="asha">{t('auth.role_asha')}</option>
                  <option value="admin">{t('auth.role_admin')}</option>
                  <option value="parent">{t('auth.role_parent')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Region/Village */}
          {(formData.role === 'asha' || formData.role === 'parent') && (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-300">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                {t('auth.region')}
              </label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  type="text"
                  required
                  className="input-niti py-2.5 text-sm"
                  placeholder={t('auth.region_placeholder')}
                  value={formData.village}
                  onChange={(e) => setFormData({...formData, village: e.target.value})}
                />
              </div>
            </div>
          )}

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
              {t('auth.password')}
            </label>
            <div className="relative group">
              <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
              <input 
                type="password"
                required
                className="input-niti py-2.5 text-sm"
                placeholder={t('auth.password_placeholder')}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-[10px] font-bold border border-red-100 uppercase">
              {error}
            </div>
          )}

          <button type="submit" disabled={isSubmitting} className="btn-primary-niti py-3 mt-1">
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (
              <span className="flex items-center justify-center gap-2">
                {t('auth.register_btn')} <ArrowRight size={18} />
              </span>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500 font-medium">
            {t('auth.already_have_account')}{' '}
            <Link to="/login" className="text-primary font-black hover:underline underline-offset-4">
              {t('auth.login_btn')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;