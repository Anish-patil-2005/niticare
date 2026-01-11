/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // Added
import { User, Mail, Phone, MapPin, Calendar, Save, X, Edit3, Shield } from 'lucide-react';
import { authService } from '../../api/authService';
import toast from 'react-hot-toast';

export const Profile = () => {
  const { t } = useTranslation(); // Initialize hook
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({ 
    full_name: '', 
    username: '', 
    contact_number: '' 
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await authService.getMe();
      setUser(data);
      setFormData({ 
        full_name: data.full_name || '', 
        username: data.username || '', 
        contact_number: data.contact_number || '' 
      });
    } catch (err) {
      toast.error(t('profile.fetch_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await authService.updateProfile(formData);
      toast.success(t('profile.update_success'));
      setIsEditing(false);
      loadProfile(); 
    } catch (err) {
      toast.error(err.response?.data?.message || t('profile.update_error'));
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 pb-24">
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
        <div className="h-32 bg-gradient-to-r from-emerald-500 to-teal-600 relative">
           <div className="absolute -bottom-12 left-8">
              <div className="w-24 h-24 bg-white rounded-3xl shadow-lg flex items-center justify-center text-3xl font-black text-emerald-600 border-4 border-white">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
           </div>
        </div>
        
        <div className="pt-16 pb-8 px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{user?.full_name}</h1>
            <p className="text-emerald-600 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
              <Shield size={12} /> {t('profile.account_type', { role: user?.role })}
            </p>
          </div>
          <button 
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
              isEditing ? 'bg-slate-100 text-slate-600' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
            }`}
          >
            {isEditing ? <><X size={18}/> {t('profile.cancel')}</> : <><Edit3 size={18}/> {t('profile.edit_profile')}</>}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="md:col-span-2">
          <form onSubmit={handleUpdate} className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-50 space-y-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">{t('profile.personal_info')}</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputGroup 
                  label={t('profile.full_name')} 
                  icon={User} 
                  value={formData.full_name} 
                  onChange={(v) => setFormData({...formData, full_name: v})} 
                  disabled={!isEditing}
                />
                <InputGroup 
                  label={t('profile.contact_number')} 
                  icon={Phone} 
                  value={formData.contact_number} 
                  onChange={(v) => setFormData({...formData, contact_number: v})} 
                  disabled={!isEditing}
                />
              </div>
              <InputGroup 
                label={t('profile.username')} 
                icon={Mail} 
                value={formData.username} 
                onChange={(v) => setFormData({...formData, username: v})} 
                disabled={!isEditing}
              />
            </div>

            {isEditing && (
              <button 
                type="submit"
                className="w-full bg-emerald-600 text-white p-4 rounded-2xl font-black shadow-lg shadow-emerald-100 flex items-center justify-center gap-3 active:scale-95 transition-all"
              >
                <Save size={20} /> {t('profile.save_changes')}
              </button>
            )}
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-emerald-50 rounded-[2rem] p-6 border border-emerald-100">
            <h3 className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-4">{t('profile.system_details')}</h3>
            <div className="space-y-4">
               <StaticDetail icon={MapPin} label={t('profile.village')} value={user?.village || t('profile.not_available')} />
               <StaticDetail icon={Calendar} label={t('profile.joined_on')} value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : t('profile.not_available')} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InputGroup = ({ label, icon: Icon, value, onChange, disabled }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-wider">{label}</label>
    <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
      disabled ? 'bg-slate-50 border-slate-100 text-slate-500' : 'bg-white border-emerald-100 ring-2 ring-emerald-50/50'
    }`}>
      <Icon size={18} className={disabled ? 'text-slate-300' : 'text-emerald-500'} />
      <input 
        className="bg-transparent w-full outline-none font-bold text-slate-700 disabled:cursor-not-allowed"
        value={value || ''} 
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
    </div>
  </div>
);

const StaticDetail = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-4">
    <div className="p-2 bg-white rounded-xl text-emerald-600 shadow-sm">
      <Icon size={16} />
    </div>
    <div>
      <p className="text-[9px] font-bold text-emerald-800/50 uppercase tracking-tighter">{label}</p>
      <p className="text-sm font-black text-emerald-900">{value}</p>
    </div>
  </div>
);

export default Profile;