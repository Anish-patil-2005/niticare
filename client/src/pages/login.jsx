import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../api/authService';
import { User, Lock, ArrowRight, HeartPulse, Loader2 } from 'lucide-react';

const Login = () => {
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
      navigate(response.role === 'admin' ? '/admin/dashboard' : '/asha/home');
    } catch (err) {
      setError('Invalid username or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center p-6">
      <div className="card-niti w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary-glow text-primary mb-4">
            <HeartPulse size={40} />
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">NitiCare</h1>
          <p className="text-slate-400 font-bold mt-1 uppercase tracking-[0.2em] text-[10px]">Professional Portal</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Username</label>
            <div className="relative group">
              <User className="absolute left-4 top-4 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
              <input type="text" required className="input-niti" placeholder="Enter username" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-4 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
              <input type="password" required className="input-niti" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>

          {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100">{error}</div>}

          <button type="submit" disabled={isLoading} className="btn-primary-niti">
            {isLoading ? <Loader2 className="animate-spin" size={24} /> : <>Sign In <ArrowRight size={20} /></>}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500 font-medium">
          New here? <Link to="/register" className="text-primary font-black hover:underline underline-offset-8">Create Account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;