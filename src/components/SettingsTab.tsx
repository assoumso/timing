import React, { useState } from 'react';
import { 
  School, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  User, 
  Award,
  Check, 
  Save, 
  Building,
  RefreshCw,
  Clock,
  Printer
} from 'lucide-react';

interface SettingsTabProps {
  schoolName: string;
  setSchoolName: (val: string) => void;
  schoolSubName: string;
  setSchoolSubName: (val: string) => void;
  academicYear: string;
  setAcademicYear: (val: string) => void;
  schoolAddress: string;
  setSchoolAddress: (val: string) => void;
  schoolPhone: string;
  setSchoolPhone: (val: string) => void;
  schoolEmail: string;
  setSchoolEmail: (val: string) => void;
  schoolDirector: string;
  setSchoolDirector: (val: string) => void;
  schoolMotto: string;
  setSchoolMotto: (val: string) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  schoolName,
  setSchoolName,
  schoolSubName,
  setSchoolSubName,
  academicYear,
  setAcademicYear,
  schoolAddress,
  setSchoolAddress,
  schoolPhone,
  setSchoolPhone,
  schoolEmail,
  setSchoolEmail,
  schoolDirector,
  setSchoolDirector,
  schoolMotto,
  setSchoolMotto
}) => {
  // Temporary local states for editing
  const [localName, setLocalName] = useState(schoolName);
  const [localSubName, setLocalSubName] = useState(schoolSubName);
  const [localAcademicYear, setLocalAcademicYear] = useState(academicYear);
  const [localAddress, setLocalAddress] = useState(schoolAddress);
  const [localPhone, setLocalPhone] = useState(schoolPhone);
  const [localEmail, setLocalEmail] = useState(schoolEmail);
  const [localDirector, setLocalDirector] = useState(schoolDirector);
  const [localMotto, setLocalMotto] = useState(schoolMotto);

  const [isSaved, setIsSaved] = useState(false);
  const [isResetDone, setIsResetDone] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update global context states
    setSchoolName(localName);
    setSchoolSubName(localSubName);
    setAcademicYear(localAcademicYear);
    setSchoolAddress(localAddress);
    setSchoolPhone(localPhone);
    setSchoolEmail(localEmail);
    setSchoolDirector(localDirector);
    setSchoolMotto(localMotto);

    // Save to localStorage
    localStorage.setItem('barakat_school_name', localName);
    localStorage.setItem('barakat_school_sub_name', localSubName);
    localStorage.setItem('barakat_academic_year', localAcademicYear);
    localStorage.setItem('barakat_school_address', localAddress);
    localStorage.setItem('barakat_school_phone', localPhone);
    localStorage.setItem('barakat_school_email', localEmail);
    localStorage.setItem('barakat_school_director', localDirector);
    localStorage.setItem('barakat_school_motto', localMotto);

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
  };

  const handleResetToDefault = () => {
    const defaultName = "ÉCOLE DES FAMILLES";
    const defaultSubName = "ÉTIMOÉ & MAKORÉ";
    const defaultYear = "2025-2026";
    const defaultAddress = "Abidjan, Côte d'Ivoire";
    const defaultPhone = "+225 07 07 07 07 07";
    const defaultEmail = "contact@ecoledesfamilles.ed.ci";
    const defaultDirector = "Mme Catherine Amon";
    const defaultMotto = "Éducation - Valeurs - Excellence";

    setLocalName(defaultName);
    setLocalSubName(defaultSubName);
    setLocalAcademicYear(defaultYear);
    setLocalAddress(defaultAddress);
    setLocalPhone(defaultPhone);
    setLocalEmail(defaultEmail);
    setLocalDirector(defaultDirector);
    setLocalMotto(defaultMotto);

    setIsResetDone(true);
    setTimeout(() => {
      setIsResetDone(false);
    }, 2500);
  };

  return (
    <div id="settings-tab-container" className="space-y-6">
      {/* Banner info */}
      <div className="bg-gradient-to-br from-[#0b4998] via-[#093d80] to-[#072c5e] border border-[#f3aa1c]/30 text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#ee7b11]/20 text-blue-100 border border-[#f3aa1c]/30">
            <School className="h-3.5 w-3.5 text-[#f3aa1c]" />
            <span>CONFIGURATION SYSTÈME</span>
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Paramètres de l’Établissement
          </h2>
          <p className="text-sm text-blue-100 max-w-xl">
            Configurez l’identité visuelle et les coordonnées officielles de votre établissement scolaire. Ces informations seront automatiquement appliquées aux en-têtes d’impression et de téléchargement.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Edit Form */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-stone-100">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Building className="h-4.5 w-4.5 text-[#0b4998]" />
              <span>Dossier d'identité de l'établissement</span>
            </h3>
            <button
              type="button"
              onClick={handleResetToDefault}
              className="cursor-pointer text-[11px] font-bold text-slate-500 hover:text-[#ee7b11] flex items-center gap-1 transition"
              title="Restaurer les valeurs d'usine École des Familles"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Rétablir par défaut</span>
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Box 1: Name */}
              <div>
                <label className="block text-[10.5px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                  Nom de l'établissement *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <School className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={localName}
                    onChange={(e) => setLocalName(e.target.value)}
                    placeholder="Ex: École Barakat"
                    className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0b4998] focus:border-[#0b4998] transition"
                  />
                </div>
              </div>

              {/* Box 2: Sub-name */}
              <div>
                <label className="block text-[10.5px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5 font-sans">
                  Deuxième ligne / Slogan académique
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Award className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={localSubName}
                    onChange={(e) => setLocalSubName(e.target.value)}
                    placeholder="Ex: Excellence & Discipline"
                    className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0b4998] focus:border-[#0b4998] transition"
                  />
                </div>
              </div>

              {/* Box 3: Year */}
              <div>
                <label className="block text-[10.5px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                  Année Académique actuelle
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={localAcademicYear}
                    onChange={(e) => setLocalAcademicYear(e.target.value)}
                    placeholder="Ex: 2025-2026"
                    className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0b4998] focus:border-[#0b4998] transition"
                  />
                </div>
              </div>

              {/* Box 4: Directeur */}
              <div>
                <label className="block text-[10.5px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                  Directeur des Études / Principal
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={localDirector}
                    onChange={(e) => setLocalDirector(e.target.value)}
                    placeholder="Nom du Directeur"
                    className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0b4998] focus:border-[#0b4998] transition"
                  />
                </div>
              </div>

              {/* Box 5: Address */}
              <div className="md:col-span-2">
                <label className="block text-[10.5px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                  Adresse de l'établissement
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <MapPin className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={localAddress}
                    onChange={(e) => setLocalAddress(e.target.value)}
                    placeholder="Ex: Cocody Boulevard, Abidjan"
                    className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0b4998] focus:border-[#0b4998] transition"
                  />
                </div>
              </div>

              {/* Box 6: Phone */}
              <div>
                <label className="block text-[10.5px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                  Téléphone / Ligne officielle
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={localPhone}
                    onChange={(e) => setLocalPhone(e.target.value)}
                    placeholder="Ex: +225 07..."
                    className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0b4998] focus:border-[#0b4998] transition"
                  />
                </div>
              </div>

              {/* Box 7: Email */}
              <div>
                <label className="block text-[10.5px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                  Adresse e-mail de contact
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    value={localEmail}
                    onChange={(e) => setLocalEmail(e.target.value)}
                    placeholder="Ex: admin@etablissement.com"
                    className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0b4998] focus:border-[#0b4998] transition"
                  />
                </div>
              </div>

              {/* Box 8: Motto/Devise */}
              <div className="md:col-span-2">
                <label className="block text-[10.5px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                  Devise / Crédo de l'établissement
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Award className="h-4 w-4 text-slate-400" strokeWidth={2.5} />
                  </div>
                  <input
                    type="text"
                    value={localMotto}
                    onChange={(e) => setLocalMotto(e.target.value)}
                    placeholder="Ex: Éducation, Morale, Succès"
                    className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0b4998] focus:border-[#0b4998] transition"
                  />
                </div>
              </div>
            </div>

            {/* Error or validation status alert banners */}
            {isResetDone && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-850 rounded-xl text-[11px] font-bold">
                ⚠️ Formulaire pré-rempli avec les configurations initiales d’ÉCOLE DES FAMILLES. N'oubliez pas d'enregistrer.
              </div>
            )}

            {isSaved && (
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2.5">
                <Check className="h-4 w-4" />
                <span>Paramètres enregistrés en local et appliqués sur l’ensemble de l'application !</span>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end">
              <button
                type="submit"
                className="cursor-pointer px-5 py-3 bg-[#0b4998] hover:bg-[#093d80] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md border border-blue-800"
              >
                <Save className="h-4 w-4" />
                <span>Enregistrer la Configuration</span>
              </button>
            </div>
          </form>
        </div>

        {/* Dynamic preview sidecard */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">
              Aperçu En-tête Imprimable
            </h4>

            {/* Simulated Printed Paper header */}
            <div className="bg-[#fcfbf9] border border-stone-200 rounded-2xl p-4 shadow-2xs space-y-3 pt-4 border-t-4 border-t-[#0b4998]">
              <div className="space-y-1">
                <span className="text-[8px] bg-[#ee7b11]/15 text-[#ee7b11] px-2 py-0.5 rounded font-black tracking-widest uppercase">
                  {localAcademicYear || "2025-2026"}
                </span>
                <h5 className="text-sm font-black text-stone-900 leading-tight uppercase tracking-tight break-all">
                  {localName || "NOM_ETABLISSEMENT"}
                </h5>
                <p className="text-[10px] text-stone-600 font-bold tracking-wide italic">
                  {localSubName || "Sous-titre / Deuxième ligne"}
                </p>
                <div className="h-[1px] bg-stone-200/50 my-1"></div>
                <div className="text-[9px] text-stone-500 space-y-0.5 font-medium">
                  {localAddress && <p>📍 {localAddress}</p>}
                  {localPhone && <p>📞 {localPhone}</p>}
                  {localEmail && <p>✉️ {localEmail}</p>}
                  {localDirector && <p>🎓 Dir: {localDirector}</p>}
                  {localMotto && <p className="italic font-bold text-stone-600 mt-1">« {localMotto} »</p>}
                </div>
              </div>
            </div>

            <div className="text-[10.5px] text-stone-500 leading-relaxed font-medium bg-stone-50 p-3 rounded-xl border border-stone-200/50">
              💡 <strong>Intégration automatique :</strong> Ces variables dynamiques sont utilisées dans le planificateur, les formulaires d’attribution, le tableau de bord principal et sur toutes les fiches d'emplois du temps imprimées.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
