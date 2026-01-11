import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Languages, ChevronDown, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export const LanguageSelector = ({ 
  isCollapsed = false, 
  isAbsolute = false, 
  dropdownDirection = 'down' 
}) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const languages = [
    { code: 'en', label: 'English', sub: 'English' },
    { code: 'hi', label: 'हिंदी', sub: 'Hindi' },
    { code: 'mr', label: 'मराठी', sub: 'Marathi' }
  ];

  const currentLanguage = languages.find(l => l.code === i18n.language) || languages[0];

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (code, label) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
    toast.success(`Language changed to ${label}`, {
      icon: '🌐',
      style: { borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }
    });
  };

  return (
    <div 
      ref={containerRef}
      className={`${isAbsolute ? 'absolute top-6 right-6 z-50' : 'relative w-full'}`}
    >
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2.5 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border transition-all duration-200 shadow-sm
          ${isOpen ? 'border-primary ring-4 ring-primary/5' : 'border-slate-200 hover:border-slate-300'}
          ${isCollapsed ? 'justify-center px-2' : 'w-full'}
        `}
      >
        <div className={`flex items-center justify-center rounded-lg transition-colors ${isOpen ? 'text-primary' : 'text-slate-400'}`}>
          <Languages size={18} strokeWidth={2.5} />
        </div>

        {!isCollapsed && (
          <>
            <div className="flex flex-col items-start leading-tight flex-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Lang</span>
              <span className="text-xs font-bold text-slate-700 uppercase">{currentLanguage.code}</span>
            </div>
            <ChevronDown 
              size={14} 
              className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
            />
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      <div className={`absolute z-[100] bg-white rounded-2xl shadow-2xl border border-slate-100 p-1.5 min-w-[140px] transition-all duration-200 transform
        ${isOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 translate-y-2 invisible'}
        ${isAbsolute || dropdownDirection === 'down' 
            ? 'top-full mt-2 right-0 origin-top-right' 
            : isCollapsed 
              ? 'left-full ml-3 top-0 origin-left' 
              : 'bottom-full mb-2 left-0 origin-bottom-left'
        }
      `}>
        <div className="px-3 py-2 mb-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Language</p>
        </div>
        
        {languages.map((lang) => {
          const isActive = i18n.language === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code, lang.label)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 group
                ${isActive 
                  ? 'bg-primary text-white shadow-md shadow-primary/20' 
                  : 'hover:bg-slate-50 text-slate-600'
                }`}
            >
              <div className="flex flex-col items-start">
                <span className="text-xs font-bold">{lang.label}</span>
                {!isActive && <span className="text-[9px] font-medium opacity-50 group-hover:opacity-100">{lang.sub}</span>}
              </div>
              {isActive && <Check size={14} strokeWidth={3} className="animate-in zoom-in duration-300" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};