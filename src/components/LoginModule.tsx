import React, { useState } from 'react';
import { Shield, Key, Mail, Sparkles, User, HelpCircle, Eye, EyeOff } from 'lucide-react';
import { UserAccount } from '../types';
import { BrandLogo } from './BrandLogo';

interface LoginModuleProps {
  userAccounts: UserAccount[];
  onLoginSuccess: (user: UserAccount) => void;
  schoolName: string;
}

export default function LoginModule({ userAccounts, onLoginSuccess, schoolName }: LoginModuleProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeSegment, setActiveSegment] = useState<'demo' | 'manual'>('demo');

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Veuillez saisir votre email et votre mot de passe.');
      return;
    }

    const matched = userAccounts.find(
      u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password.trim()
    );

    if (matched) {
      onLoginSuccess(matched);
    } else {
      setErrorMsg('Identifiants incorrects. Veuillez réessayer.');
    }
  };

  const handleQuickLogin = (account: UserAccount) => {
    onLoginSuccess(account);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between p-4 sm:p-6 md:p-8 select-none font-sans relative overflow-hidden" 
         style={{ backgroundImage: 'radial-gradient(circle at top right, #093d80 0%, #0f172a 60%)' }}>
      
      {/* Decorative ambient blurred orb */}
      <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-[#ee7b11]/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-[#0b4998]/20 blur-[120px] pointer-events-none"></div>

      {/* Header section with brand logo */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between z-10 py-2">
        <BrandLogo isDarkBackground={true} className="h-10 sm:h-12" />
        <span className="text-[10px] font-black tracking-widest text-[#ee7b11] uppercase bg-[#ee7b11]/10 border border-[#ee7b11]/25 px-3 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-xs">
          <Shield className="h-3.5 w-3.5" />
          <span>SÉCURISÉ SSL</span>
        </span>
      </header>

      {/* Central Login Card Container */}
      <main className="w-full max-w-md mx-auto my-auto z-10 pt-6 pb-8">
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
          
          <div className="text-center space-y-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
              {schoolName}
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Espace Numérique de Travail (ENT) & Portail ERP Intégré
            </p>
          </div>

          {/* Segment selection tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-950 border border-slate-800 rounded-2xl">
            <button
              onClick={() => { setActiveSegment('demo'); setErrorMsg(''); }}
              className={`cursor-pointer py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition ${
                activeSegment === 'demo'
                  ? 'bg-[#ee7b11] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🚀 Accès Démo Rapide
            </button>
            <button
              onClick={() => { setActiveSegment('manual'); setErrorMsg(''); }}
              className={`cursor-pointer py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition ${
                activeSegment === 'manual'
                  ? 'bg-[#ee7b11] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🔑 Saisie Manuelle
            </button>
          </div>

          {/* Error Message banner */}
          {errorMsg && (
            <div className="p-3 bg-red-950/80 border border-red-500/20 text-red-300 rounded-2xl text-[11px] font-bold text-center animate-shake">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Segment 1: Quick demo logins */}
          {activeSegment === 'demo' && (
            <div className="space-y-3.5">
              <div className="bg-[#0b4998]/10 border border-[#0b4998]/20 p-3 rounded-2xl text-center">
                <span className="text-[10px] font-black text-[#f3aa1c] uppercase block tracking-wider">
                  🧪 MODE DÉMONSTRATION ÉVALUATION
                </span>
                <p className="text-[10px] text-white mt-1 font-semibold leading-relaxed">
                  Pas besoin d'écrire d'identifiants ! Cliquez directement sur l'un des espaces ci-dessous pour vous connecter instantanément avec le profil correspondant.
                </p>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                {userAccounts.map(account => (
                  <button
                    key={account.id}
                    onClick={() => handleQuickLogin(account)}
                    className="cursor-pointer w-full p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-[#ee7b11]/50 rounded-2xl flex items-center justify-between text-left transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-xl bg-[#0b4998]/20 text-[#0b4998] font-black text-xs flex items-center justify-center uppercase group-hover:bg-[#ee7b11]/20 group-hover:text-[#ee7b11] transition">
                        {account.role.substring(0, 2)}
                      </div>
                      <div>
                        <span className="text-xs font-black text-slate-100 group-hover:text-[#ee7b11] block transition">
                          {account.name}
                        </span>
                        <span className="text-[9px] uppercase font-bold text-slate-450 block">
                          {account.role === 'super_admin' ? '👑 Administrateur Global' : 
                          account.role === 'director' ? '⚖️ Directeur' :
                          account.role === 'accountant' ? '💼 Comptable' : 
                          account.role === 'supervisor' ? '🛡️ Surveillant' : 
                          account.role === 'teacher' ? '👨‍🏫 Enseignant' : 
                          account.role === 'parent' ? '👨‍👩‍👦 Parent' : '🎓 Élève'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end text-right">
                      <span className="text-[8px] font-mono text-slate-500 font-bold block">{account.email}</span>
                      <span className="text-[8px] font-mono text-[#ee7b11]/70 font-bold block">pass: {account.password}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Segment 2: Manual Login form */}
          {activeSegment === 'manual' && (
            <form onSubmit={handleManualLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-450 uppercase block tracking-wider">
                  Adresse e-mail ERP
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="Ex: direction@ecoledesfamilles.ed.ci"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-650 focus:outline-none focus:border-[#ee7b11] font-semibold transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-450 uppercase block tracking-wider">
                    Mot de passe
                  </label>
                  <button 
                    type="button" 
                    onClick={() => alert(`Astuce : Vous pouvez utiliser 'director' pour Mme Catherine Amon, 'admin' pour M. Touré ou 'comptable' pour M. Koffi.`)}
                    className="text-[9px] text-[#ee7b11] font-black hover:underline"
                  >
                    Besoin d'aide ?
                  </button>
                </div>
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Saisissez votre code d'accès"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-650 focus:outline-none focus:border-[#ee7b11] font-black transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350 p-1"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="cursor-pointer w-full py-3 bg-[#ee7b11] hover:bg-[#d66f0e] text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-md transition-all active:scale-[0.98] mt-6"
              >
                S'authentifier
              </button>
            </form>
          )}

          {/* Legal security agreement info */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-start gap-2 text-[9px] text-slate-450 leading-relaxed font-semibold">
            <span className="text-xs">🛡️</span>
            <span>
              En vous connectant à l'ERP de {schoolName}, vous acceptez les chartes de confidentialité et de sécurité informatique applicables aux personnels et familles.
            </span>
          </div>

        </div>
      </main>

      {/* Footer footer */}
      <footer className="w-full text-center py-2 border-t border-slate-800/50 z-10">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
          © 2026 {schoolName} • Logiciel de Gestion Scolaire Global & Modulaire Barakat ERP
        </p>
      </footer>

    </div>
  );
}
