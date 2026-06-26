import React, { useState, useEffect } from 'react';
import { 
  School, 
  Calendar, 
  Layers, 
  MapPin, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Check, 
  Settings, 
  AlertCircle,
  User 
} from 'lucide-react';
import { SubjectItem, ClassItem, UserAccount, TeacherItem } from '../types';

interface AdministrationModuleProps {
  subjects: SubjectItem[];
  classes: ClassItem[];
  teachers?: TeacherItem[];
  schoolName: string;
  setSchoolName: (name: string) => void;
  schoolSubName: string;
  setSchoolSubName: (sub: string) => void;
  academicYear: string;
  setAcademicYear: (year: string) => void;
  schoolDirector: string;
  setSchoolDirector: (director: string) => void;
  schoolPhone: string;
  setSchoolPhone: (phone: string) => void;
  schoolEmail: string;
  setSchoolEmail: (email: string) => void;
  schoolAddress: string;
  setSchoolAddress: (addr: string) => void;
  schoolMotto: string;
  setSchoolMotto: (motto: string) => void;
  userAccounts?: UserAccount[];
  setUserAccounts?: React.Dispatch<React.SetStateAction<UserAccount[]>>;
}

export default function AdministrationModule({
  subjects,
  classes,
  teachers = [],
  schoolName,
  setSchoolName,
  schoolSubName,
  setSchoolSubName,
  academicYear,
  setAcademicYear,
  schoolDirector,
  setSchoolDirector,
  schoolPhone,
  setSchoolPhone,
  schoolEmail,
  setSchoolEmail,
  schoolAddress,
  setSchoolAddress,
  schoolMotto,
  setSchoolMotto,
  userAccounts = [],
  setUserAccounts
}: AdministrationModuleProps) {
  
  // Local list states with local persistence
  const [academicYears, setAcademicYears] = useState<string[]>(() => {
    const saved = localStorage.getItem('erp_academic_years');
    return saved ? JSON.parse(saved) : ["2024-2025", "2025-2026", "2026-2027"];
  });

  const [campuses, setCampuses] = useState<Array<{ id: string, name: string, location: string }>>(() => {
    const saved = localStorage.getItem('erp_campuses');
    return saved ? JSON.parse(saved) : [
      { id: 'camp_1', name: 'Campus Étimoé (Cocody)', location: 'Cocody Riviera, Abidjan' },
      { id: 'camp_2', name: 'Campus Makoré (Marcory)', location: 'Marcory Zone 4, Abidjan' }
    ];
  });

  const [filiereList, setFiliereList] = useState<Array<{ id: string, name: string, code: string }>>(() => {
    const saved = localStorage.getItem('erp_filieres');
    return saved ? JSON.parse(saved) : [
      { id: 'fil_gen', name: 'Enseignement Général Civique', code: 'EGC' },
      { id: 'fil_sc', name: 'Série Scientifique C & D', code: 'SCI' },
      { id: 'fil_lit', name: 'Série Littéraire & Arts', code: 'LIT' }
    ];
  });

  const [niveauxList, setNiveauxList] = useState<string[]>(() => {
    const saved = localStorage.getItem('erp_niveaux');
    return saved ? JSON.parse(saved) : ["6ème", "5ème", "4ème", "3ème", "Seconde", "Première", "Terminale"];
  });

  // Coefficients data map: { "classId_subjectId": number }
  const [coefficients, setCoefficients] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('erp_coefficients');
    if (saved) return JSON.parse(saved);
    // defaults
    const map: Record<string, number> = {};
    classes.forEach(c => {
      subjects.forEach(s => {
        if (s.id === 'math' || s.id === 'pc') {
          map[`${c.id}_${s.id}`] = c.name.includes('A') ? 2 : 4;
        } else {
          map[`${c.id}_${s.id}`] = 2;
        }
      });
    });
    return map;
  });

  // Forms state
  const [newYear, setNewYear] = useState('');
  const [newCampus, setNewCampus] = useState({ name: '', location: '' });
  const [newFiliere, setNewFiliere] = useState({ name: '', code: '' });
  const [newNiveau, setNewNiveau] = useState('');
  const [newUserAccount, setNewUserAccount] = useState({ name: '', email: '', password: '', role: 'student' as any, teacherId: '' });
  const [editingAccessAccountId, setEditingAccessAccountId] = useState<string | null>(null);

  const handleAddUserAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserAccount.name.trim() || !newUserAccount.email.trim() || !newUserAccount.password.trim()) {
      alert("Veuillez remplir tous les champs requis.");
      return;
    }
    
    // Check key duplicate
    const exists = userAccounts.some(u => u.email.toLowerCase() === newUserAccount.email.toLowerCase());
    if (exists) {
      alert("Un compte avec cette adresse email existe déjà.");
      return;
    }

    if (newUserAccount.role === 'teacher' && !newUserAccount.teacherId) {
      alert("Veuillez associer ce compte à un enseignant.");
      return;
    }

    if (setUserAccounts) {
      setUserAccounts(prev => [
        ...prev,
        {
          id: 'user_' + Date.now(),
          name: newUserAccount.name.trim(),
          email: newUserAccount.email.trim().toLowerCase(),
          password: newUserAccount.password.trim(),
          role: newUserAccount.role,
          teacherId: newUserAccount.role === 'teacher' ? newUserAccount.teacherId : undefined,
          createdAt: new Date().toLocaleDateString('fr-FR')
        }
      ]);
    }
    setNewUserAccount({ name: '', email: '', password: '', role: 'student', teacherId: '' });
  };

  const handleDeleteUserAccount = (userId: string) => {
    if (userAccounts.length <= 1) {
      alert("Vous devez garder au moins un compte administrateur.");
      return;
    }
    const target = userAccounts.find(u => u.id === userId);
    if (target && target.email === "admin@school.com") {
      alert("Impossible de supprimer le compte administrateur par défaut.");
      return;
    }
    if (setUserAccounts) {
      setUserAccounts(prev => prev.filter(u => u.id !== userId));
    }
  };

  // Autosave lists
  useEffect(() => {
    localStorage.setItem('erp_academic_years', JSON.stringify(academicYears));
  }, [academicYears]);

  useEffect(() => {
    localStorage.setItem('erp_campuses', JSON.stringify(campuses));
  }, [campuses]);

  useEffect(() => {
    localStorage.setItem('erp_filieres', JSON.stringify(filiereList));
  }, [filiereList]);

  useEffect(() => {
    localStorage.setItem('erp_niveaux', JSON.stringify(niveauxList));
  }, [niveauxList]);

  useEffect(() => {
    localStorage.setItem('erp_coefficients', JSON.stringify(coefficients));
  }, [coefficients]);

  // Methods
  const handleAddYear = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYear.trim() || academicYears.includes(newYear.trim())) return;
    setAcademicYears(prev => [...prev, newYear.trim()]);
    setNewYear('');
  };

  const handleDeleteYear = (yearToDelete: string) => {
    if (yearToDelete === academicYear) {
      alert("Impossible de supprimer l'année académique active !");
      return;
    }
    setAcademicYears(prev => prev.filter(y => y !== yearToDelete));
  };

  const handleAddCampus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampus.name.trim()) return;
    setCampuses(prev => [
      ...prev, 
      { id: 'camp_' + Date.now(), name: newCampus.name.trim(), location: newCampus.location.trim() || "Abidjan" }
    ]);
    setNewCampus({ name: '', location: '' });
  };

  const handleAddFiliere = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFiliere.name.trim()) return;
    setFiliereList(prev => [
      ...prev,
      { id: 'fil_' + Date.now(), name: newFiliere.name.trim(), code: newFiliere.code.trim().toUpperCase() || "GEN" }
    ]);
    setNewFiliere({ name: '', code: '' });
  };

  const handleAddNiveau = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNiveau.trim() || niveauxList.includes(newNiveau.trim())) return;
    setNiveauxList(prev => [...prev, newNiveau.trim()]);
    setNewNiveau('');
  };

  const handleUpdateCoefficient = (classId: string, subjectId: string, val: number) => {
    setCoefficients(prev => ({
      ...prev,
      [`${classId}_${subjectId}`]: val
    }));
  };

  return (
    <div className="space-y-6">
      
      {/* Tab bar equivalent for nested section title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-205">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <School className="h-5 w-5 text-[#ee7b11]" />
            <span>Structure Établissement & Global Admin</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Déclarez les filières d'études, les niveaux scolaires homologués, les coefficients de calcul et pilotez les métadonnées de l'école.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Column 1: Config Années Académiques & Établissements */}
        <div className="space-y-6">
          
          {/* Section: Academic Years */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-[#0b4998]" />
              <span>Années Scolaires</span>
            </h3>

            {/* Active selectors info bar */}
            <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-2xl">
              <span className="text-[9.5px] uppercase font-black text-indigo-550 block">Année de Référence Active</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm font-black text-[#0b4998]">{academicYear}</span>
                <span className="text-[9px] uppercase font-bold bg-indigo-200 text-indigo-900 px-2 py-0.5 rounded">En cours</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleAddYear} className="flex gap-2">
              <input 
                type="text" 
                required
                placeholder="Ex: 2026-2027" 
                value={newYear}
                onChange={(e) => setNewYear(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#ee7b11]"
              />
              <button 
                type="submit" 
                className="cursor-pointer px-3.5 py-1.5 bg-[#0b4998] hover:bg-[#093d80] text-white font-extrabold text-xs rounded-xl flex items-center gap-1 shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                Dépôt
              </button>
            </form>

            {/* Years lists */}
            <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
              {academicYears.map(year => (
                <div key={year} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-150 hover:bg-slate-100/65 transition group">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">{year}</span>
                    {year === academicYear ? (
                      <span className="text-[8.5px] font-black uppercase tracking-wider text-emerald-650 bg-emerald-100 px-1.5 py-0.2 rounded-md">Sélectionné</span>
                    ) : (
                      <button 
                        onClick={() => {
                          setAcademicYear(year);
                          localStorage.setItem('barakat_academic_year', year);
                        }}
                        className="cursor-pointer text-[8px] font-black uppercase tracking-wider text-slate-400 bg-white border border-slate-150 px-1 rounded-md hover:text-[#0b4998] hover:border-slate-300 transition"
                      >
                        Activer
                      </button>
                    )}
                  </div>
                  <button 
                    onClick={() => handleDeleteYear(year)}
                    className="opacity-0 group-hover:opacity-100 cursor-pointer p-1 text-slate-350 hover:text-red-500 rounded-md transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Campuses/Campagnes */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-[#ee7b11]" />
              <span>Campus / Établissements</span>
            </h3>

            <form onSubmit={handleAddCampus} className="space-y-2">
              <input 
                type="text" 
                required
                placeholder="Nom du Campus (Ex: Campus Makoré)" 
                value={newCampus.name}
                onChange={(e) => setNewCampus(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
              />
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Localisation" 
                  value={newCampus.location}
                  onChange={(e) => setNewCampus(prev => ({ ...prev, location: e.target.value }))}
                  className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                />
                <button 
                  type="submit"
                  className="cursor-pointer px-3.5 py-1.5 bg-[#ee7b11] hover:bg-[#d66f0e] text-white font-extrabold text-xs rounded-xl flex items-center gap-1 shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Créer
                </button>
              </div>
            </form>

            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {campuses.map(campus => (
                <div key={campus.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-150 flex items-center justify-between group">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">{campus.name}</span>
                    <span className="text-[9.5px] text-slate-400 font-semibold block">{campus.location}</span>
                  </div>
                  <button 
                    onClick={() => setCampuses(prev => prev.filter(c => c.id !== campus.id))}
                    className="opacity-0 group-hover:opacity-100 cursor-pointer p-1 text-slate-350 hover:text-red-500 rounded-md transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Column 2: Filières, Levels Niveaux & Coefficients */}
        <div className="space-y-6">
          
          {/* Section: Filières */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-emerald-600" />
              <span>Secteurs & Filières</span>
            </h3>

            <form onSubmit={handleAddFiliere} className="flex gap-2">
              <input 
                type="text" 
                required
                placeholder="Ex: Scientifique" 
                value={newFiliere.name}
                onChange={(e) => setNewFiliere(prev => ({ ...prev, name: e.target.value }))}
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
              />
              <input 
                type="text" 
                required
                placeholder="Code" 
                value={newFiliere.code}
                onChange={(e) => setNewFiliere(prev => ({ ...prev, code: e.target.value }))}
                className="w-16 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none capitalize text-center"
              />
              <button 
                type="submit"
                className="cursor-pointer px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-750 text-white font-extrabold text-xs rounded-xl flex items-center gap-1 shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                Ajout
              </button>
            </form>

            <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
              {filiereList.map(fil => (
                <div key={fil.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-150 hover:bg-slate-100/50 transition group">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-md">{fil.code}</span>
                    <span className="text-xs font-bold text-slate-800">{fil.name}</span>
                  </div>
                  <button 
                    onClick={() => setFiliereList(prev => prev.filter(f => f.id !== fil.id))}
                    className="opacity-0 group-hover:opacity-100 cursor-pointer p-1 text-slate-350 hover:text-red-500 rounded-md transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Levels (Niveaux Homologués) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-purple-600" />
              <span>Niveaux Scolaires</span>
            </h3>

            <form onSubmit={handleAddNiveau} className="flex gap-2">
              <input 
                type="text" 
                required
                placeholder="Ex: Terminale" 
                value={newNiveau}
                onChange={(e) => setNewNiveau(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
              />
              <button 
                type="submit"
                className="cursor-pointer px-3.5 py-1.5 bg-purple-600 hover:bg-purple-750 text-white font-extrabold text-xs rounded-xl flex items-center gap-1 shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                Fixer
              </button>
            </form>

            <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto pt-1">
              {niveauxList.map(niv => (
                <span 
                  key={niv} 
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 hover:bg-red-50 hover:text-red-700 transition cursor-pointer text-purple-900 border border-purple-150 rounded-lg text-xs font-semibold"
                  onClick={() => {
                    if (window.confirm(`Voulez-vous supprimer le niveau '${niv}' ?`)) {
                      setNiveauxList(prev => prev.filter(n => n !== niv));
                    }
                  }}
                  title="Cliquez pour supprimer le niveau"
                >
                  <span>{niv}</span>
                  <span className="text-[10px] text-purple-400 font-bold">×</span>
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Column 3: Administration & System settings form */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
              <Settings className="h-4 w-4 text-[#0b4998]" />
              <span>Paramètres ERP Établissement</span>
            </h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase block">Nom de l'école (Titre Principal)</label>
                <input 
                  type="text" 
                  value={schoolName} 
                  onChange={(e) => {
                    setSchoolName(e.target.value);
                    localStorage.setItem('barakat_school_name', e.target.value);
                  }}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase block">Devise / Sous-titre</label>
                <input 
                  type="text" 
                  value={schoolSubName} 
                  onChange={(e) => {
                    setSchoolSubName(e.target.value);
                    localStorage.setItem('barakat_school_sub_name', e.target.value);
                  }}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#ee7b11] uppercase block">Visa Chef d'établissement / Directeur</label>
                <input 
                  type="text" 
                  value={schoolDirector} 
                  onChange={(e) => {
                    setSchoolDirector(e.target.value);
                    localStorage.setItem('barakat_school_director', e.target.value);
                  }}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-850 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase block">Devise Scolaire (Motto)</label>
                <input 
                  type="text" 
                  value={schoolMotto} 
                  onChange={(e) => {
                    setSchoolMotto(e.target.value);
                    localStorage.setItem('barakat_school_motto', e.target.value);
                  }}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold italic text-slate-800 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase block">Téléphone Secrétariat</label>
                  <input 
                    type="text" 
                    value={schoolPhone} 
                    onChange={(e) => {
                      setSchoolPhone(e.target.value);
                      localStorage.setItem('barakat_school_phone', e.target.value);
                    }}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-semibold text-slate-800 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase block">Email Contact</label>
                  <input 
                    type="text" 
                    value={schoolEmail} 
                    onChange={(e) => {
                      setSchoolEmail(e.target.value);
                      localStorage.setItem('barakat_school_email', e.target.value);
                    }}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-semibold text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase block">Adresse Géo-Spatiale</label>
                <input 
                  type="text" 
                  value={schoolAddress} 
                  onChange={(e) => {
                    setSchoolAddress(e.target.value);
                    localStorage.setItem('barakat_school_address', e.target.value);
                  }}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-150 text-[10px] text-slate-500 font-semibold leading-normal">
              🛡️ Tous les réglages de cette section impactent l'affichage des entêtes de l'ensemble des modules, y compris l'emploi du temps, les reçus de paiement et les bulletins scolaires.
            </div>
          </div>
        </div>

      </div>

      {/* Wide Section: Coefficients and Class/Subject Grid matrix */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-indigo-50">
          <h3 className="text-sm font-black text-slate-905 uppercase tracking-tight flex items-center gap-1.5">
            <ShieldCheck className="h-4.5 w-4.5 text-[#0b4998]" />
            <span>Gestion des Coefficients Réglementaires</span>
          </h3>
          <span className="text-[10px] font-bold text-indigo-550 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">Base de calcul pour les Bulletins</span>
        </div>

        <p className="text-xs text-slate-450 leading-relaxed font-semibold">
          Configurez ci-dessous le coefficient officiel affecté à chaque matière pour le calcul des moyennes pondérées par classe. Ces données sont utilisées en temps réel lors du calcul automatique des classements.
        </p>

        <div className="overflow-x-auto rounded-2xl border border-slate-150">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-150">
                <th className="p-3 text-xs font-black text-slate-550 uppercase">Classes \ Enseignement</th>
                {subjects.map(s => (
                  <th key={s.id} className="p-3 text-xs font-bold text-slate-705 text-center bg-slate-50 border-r border-slate-150/70">{s.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {classes.map(cls => (
                <tr key={cls.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                  <td className="p-3 font-extrabold text-[#0b4998] text-xs font-sans flex items-center gap-2">
                    <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cls.color || '#ccc' }}></span>
                    {cls.name}
                  </td>
                  {subjects.map(s => {
                    const coefKey = `${cls.id}_${s.id}`;
                    const currentCoef = coefficients[coefKey] || 2;
                    return (
                      <td key={s.id} className="p-2 border-r border-slate-100 text-center">
                        <input 
                          type="number" 
                          min="1" 
                          max="15" 
                          value={currentCoef} 
                          onChange={(e) => handleUpdateCoefficient(cls.id, s.id, parseInt(e.target.value) || 1)}
                          className="w-12 text-center bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-150 rounded-lg p-1.5 text-xs font-black text-slate-800 transition"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Wide Section: User Credentials Manager */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-orange-100 gap-2">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <User className="h-5 w-5 text-[#ee7b11]" />
            <span>Gestion des Comptes Utilisateurs (Admin & Directeur)</span>
          </h3>
          <span className="text-[10px] font-black text-[#ee7b11] bg-orange-50 border border-orange-100 px-2.5 py-0.5 rounded-full uppercase">Comptes d'accès ERP</span>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed font-semibold">
          Créez de nouveaux comptes pour les différents profils scolaires de l'établissement (Directeurs, Comptables, Surveillants, Enseignants, Parents ou Élèves). Ces comptes disposent de permissions différenciées.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Account form */}
          <div className="bg-slate-50/70 border border-slate-150 p-5 rounded-2xl space-y-4">
            <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider">Nouveau compte</h4>
            
            <form onSubmit={handleAddUserAccount} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9.5px] font-bold text-slate-500 uppercase block">Nom complet</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: M. Amadou"
                  value={newUserAccount.name}
                  onChange={(e) => setNewUserAccount(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#ee7b11]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9.5px] font-bold text-slate-500 uppercase block">Email d’accès</label>
                <input 
                  type="email" 
                  required
                  placeholder="Ex: amadou@school.com"
                  value={newUserAccount.email}
                  onChange={(e) => setNewUserAccount(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#ee7b11]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9.5px] font-bold text-slate-500 uppercase block">Mot de passe</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: amadou2026"
                  value={newUserAccount.password}
                  onChange={(e) => setNewUserAccount(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-805 focus:outline-none focus:ring-1 focus:ring-[#ee7b11]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9.5px] font-bold text-[#0b4998] uppercase block">Rôle / Espace d'accès</label>
                <select 
                  value={newUserAccount.role}
                  onChange={(e) => setNewUserAccount(prev => ({ ...prev, role: e.target.value as any, teacherId: '' }))}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#ee7b11]"
                >
                  <option value="super_admin">👑 Administrateur Global</option>
                  <option value="director">⚖️ Directeur / Visa</option>
                  <option value="accountant">💼 Comptable Établissement</option>
                  <option value="supervisor">🛡️ Surveillant Général</option>
                  <option value="teacher">👨‍🏫 Corps Enseignant</option>
                  <option value="parent">👨‍👩‍👦 Suivi Parent</option>
                  <option value="student">🎓 Portail Élève</option>
                </select>
              </div>

              {newUserAccount.role === 'teacher' && (
                <div className="space-y-1">
                  <label className="text-[9.5px] font-bold text-[#ee7b11] uppercase block">Associer Enseignant</label>
                  <select
                    required
                    value={newUserAccount.teacherId}
                    onChange={(e) => {
                      const tId = e.target.value;
                      const selectedTeacher = teachers.find(t => t.id === tId);
                      setNewUserAccount(prev => ({
                        ...prev,
                        teacherId: tId,
                        name: selectedTeacher ? selectedTeacher.name : prev.name
                      }));
                    }}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#ee7b11]"
                  >
                    <option value="">-- Sélectionner l'Enseignant --</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <button 
                type="submit"
                className="cursor-pointer w-full py-2 bg-[#ee7b11] hover:bg-[#d66f0e] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition mt-4 pt-2"
              >
                <Plus className="h-4 w-4" />
                Créer l'utilisateur
              </button>
            </form>
          </div>

          {/* Accounts Table List */}
          <div className="lg:col-span-2 overflow-x-auto rounded-2xl border border-slate-150">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-150">
                  <th className="p-3 text-xs font-bold text-slate-550 uppercase">Rôle \ Utilisateur</th>
                  <th className="p-3 text-xs font-bold text-slate-550 uppercase">Email d’accès</th>
                  <th className="p-3 text-xs font-bold text-slate-550 uppercase">Mot de Passe</th>
                  <th className="p-3 text-xs font-bold text-slate-550 uppercase text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {userAccounts.map(account => (
                  <React.Fragment key={account.id}>
                    <tr className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                      <td className="p-3 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-lg bg-[#0b4998]/10 text-[#0b4998] font-bold text-xs flex items-center justify-center uppercase">
                            {account.role.substring(0, 2)}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-800 block text-xs">{account.name}</span>
                            <span className="text-[10px] font-semibold text-slate-550 uppercase flex items-center gap-1">
                              <span>
                                {account.role === 'super_admin' ? '👑 Admin' : 
                                 account.role === 'director' ? '⚖️ Directeur' :
                                 account.role === 'accountant' ? '💼 Comptable' : 
                                 account.role === 'supervisor' ? '🛡️ Surveillant' : 
                                 account.role === 'teacher' ? '👨‍🏫 Enseignant' : 
                                 account.role === 'parent' ? '👨‍👩‍👦 Parent' : '🎓 Élève'}
                              </span>
                              {account.teacherId && (
                                <span className="text-[9px] bg-rose-50 text-rose-600 px-1 rounded font-bold">
                                  Lié: {account.teacherId}
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-xs font-semibold text-slate-600 font-mono">
                        {account.email}
                      </td>
                      <td className="p-3 text-xs font-bold text-[#ee7b11] font-mono">
                        {account.password || "••••••••"}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setEditingAccessAccountId(prev => prev === account.id ? null : account.id)}
                            className={`cursor-pointer p-1.5 rounded-lg border transition ${
                              editingAccessAccountId === account.id 
                                ? 'bg-[#ee7b11] text-white border-[#ee7b11]' 
                                : 'bg-white text-slate-400 border-slate-200 hover:text-slate-700 hover:border-slate-300'
                            }`}
                            title="Configurer les Pages d'Accès (RBAC)"
                          >
                            <ShieldCheck className="h-3.5 w-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteUserAccount(account.id)}
                            disabled={account.email === "admin@school.com"}
                            className="cursor-pointer p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-transparent transition"
                            title="Désactiver / Supprimer le compte"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {editingAccessAccountId === account.id && (
                      <tr className="bg-slate-50/50">
                        <td colSpan={4} className="p-4">
                          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-inner">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                              <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider">
                                🔑 Autorisations d'Accès pour {account.name}
                              </span>
                              <button
                                onClick={() => setEditingAccessAccountId(null)}
                                className="text-[10px] font-bold text-slate-450 hover:text-slate-700 uppercase"
                              >
                                Fermer ×
                              </button>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                              {[
                                { id: 'school_erp_dashboard', name: '📊 Tableau de Bord' },
                                { id: 'erp_students', name: '🎓 Élèves' },
                                { id: 'erp_teachers', name: '👨‍🏫 Enseignants' },
                                { id: 'erp_attendance', name: '🛡️ Présences' },
                                { id: 'erp_financial', name: '💼 Comptabilité' },
                                { id: 'erp_evaluations', name: '🏆 Notes & Bulletins' },
                                { id: 'saisie_moyennes', name: '✍️ Saisie des Moyennes (Autorisé)' },
                                { id: 'erp_exams', name: '📝 Examens Scolaires' },
                                { id: 'dashboard', name: '📅 Emplois du temps' },
                                { id: 'portal_accountant', name: '🏦 Portail Comptable' },
                                { id: 'portal_supervisor', name: '👮 Portail Surveillant' },
                                { id: 'portal_teacher', name: '👨‍🏫 Portail Enseignant' },
                                { id: 'portal_parent', name: '👨‍👩‍👦 Portail Parent' },
                                { id: 'portal_student', name: '🎓 Portail Élève' },
                                { id: 'erp_admin', name: '⚙️ Config & Comptes' },
                              ].map(tab => {
                                const isExplicit = account.allowedTabs !== undefined;
                                const isChecked = isExplicit 
                                  ? account.allowedTabs!.includes(tab.id)
                                  : true;
                                
                                return (
                                  <label key={tab.id} className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-650 hover:text-slate-900 select-none">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => {
                                        if (setUserAccounts) {
                                          setUserAccounts(prev => prev.map(acc => {
                                            if (acc.id === account.id) {
                                              const currentTabs = acc.allowedTabs || [
                                                'school_erp_dashboard', 'erp_students', 'erp_teachers', 'erp_attendance', 
                                                'erp_financial', 'erp_evaluations', 'saisie_moyennes', 'erp_exams', 'dashboard',
                                                'portal_accountant', 'portal_supervisor', 'portal_teacher', 'portal_parent', 
                                                'portal_student', 'erp_admin'
                                              ];
                                              const nextTabs = currentTabs.includes(tab.id)
                                                ? currentTabs.filter(id => id !== tab.id)
                                                : [...currentTabs, tab.id];
                                              return { ...acc, allowedTabs: nextTabs };
                                            }
                                            return acc;
                                          }));
                                        }
                                      }}
                                      className="rounded border-slate-300 text-[#ee7b11] focus:ring-[#ee7b11] h-3.5 w-3.5"
                                    />
                                    <span>{tab.name}</span>
                                  </label>
                                );
                              })}
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium leading-relaxed border-t border-slate-100 pt-2 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3 text-slate-350 shrink-0" />
                              <span>Par défaut, l'utilisateur a accès à toutes les pages de son profil. Cochez/décochez les cases ci-dessus pour restreindre ou étendre ses accès.</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
