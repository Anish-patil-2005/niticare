import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../api/authService';
import { User, Lock, Briefcase, UserCircle, MapPin, Loader2, ArrowRight } from 'lucide-react';

const Register = () => {
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
      navigate('/login', { state: { message: 'Account created successfully!' } });
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="card-niti w-full max-w-lg">
        
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-glow text-primary mb-3">
            <UserCircle size={36} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Create Account</h2>
          <p className="text-slate-500 font-medium uppercase tracking-widest text-[10px]">New Professional Enrollment</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
            <div className="relative group">
              <UserCircle className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
              <input 
                type="text"
                required
                className="input-niti"
                placeholder="e.g. Dr. Rajesh Kumar"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700 ml-1">Username</label>
              <div className="relative group">
                <User className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                <input 
                  type="text"
                  required
                  className="input-niti"
                  placeholder="johndoe_niti"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700 ml-1">System Role</label>
              <div className="relative group">
                <Briefcase className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                <select 
                  className="input-niti appearance-none cursor-pointer"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="asha">ASHA Worker</option>
                  <option value="admin">Administrator</option>
                  <option value="parent">Parent/User</option>
                </select>
              </div>
            </div>
          </div>

          {(formData.role === 'asha' || formData.role === 'parent') && (
            <div className="space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-sm font-bold text-slate-700 ml-1">Village / Region</label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                <input 
                  type="text"
                  required
                  className="input-niti"
                  placeholder="Enter assigned region"
                  value={formData.village}
                  onChange={(e) => setFormData({...formData, village: e.target.value})}
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
              <input 
                type="password"
                required
                className="input-niti"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-xs font-bold uppercase">
              {error}
            </div>
          )}

          <button type="submit" disabled={isSubmitting} className="btn-primary-niti mt-2">
            {isSubmitting ? <Loader2 className="animate-spin" size={22} /> : (
              <>Register Account <ArrowRight size={20} /></>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-secondary-dark font-black hover:underline underline-offset-4">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;