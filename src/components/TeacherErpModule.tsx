import React, { useState } from 'react';
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  Briefcase, 
  Plus, 
  Trash2, 
  Check, 
  ShieldCheck, 
  Clock, 
  Activity 
} from 'lucide-react';
import { TeacherItem, SubjectItem, ClassItem, ScheduleCourse } from '../types';

interface TeacherErpModuleProps {
  teachers: TeacherItem[];
  setTeachers: React.Dispatch<React.SetStateAction<TeacherItem[]>>;
  subjects: SubjectItem[];
  classes: ClassItem[];
  courses: ScheduleCourse[];
}

interface TeacherExtendedState {
  teacherId: string;
  phone: string;
  contractType: 'Permanent (CDI)' | 'Vacataire (Horaire)' | 'CDD Temporaire';
  monthlyBaseSalary: number;
  hiredDate: string;
}

export default function TeacherErpModule({
  teachers,
  setTeachers,
  subjects,
  classes,
  courses
}: TeacherErpModuleProps) {
  
  // Local extra administrative database linked in local storage
  const [extendedData, setExtendedData] = useState<Record<string, TeacherExtendedState>>(() => {
    const saved = localStorage.getItem('erp_teachers_extended');
    if (saved) return JSON.parse(saved);
    // defaults
    return {
      'prof_martin': { teacherId: 'prof_martin', phone: '+225 07 88 55 22 11', contractType: 'Permanent (CDI)', monthlyBaseSalary: 450000, hiredDate: '2022-09-01' },
      'prof_koffi': { teacherId: 'prof_koffi', phone: '+225 05 44 99 88 00', contractType: 'Permanent (CDI)', monthlyBaseSalary: 420000, hiredDate: '2023-10-15' },
      'prof_soro': { teacherId: 'prof_soro', phone: '+225 01 22 33 44 55', contractType: 'Vacataire (Horaire)', monthlyBaseSalary: 180000, hiredDate: '2024-01-08' },
      'prof_diarra': { teacherId: 'prof_diarra', phone: '+225 07 00 11 22 33', contractType: 'CDD Temporaire', monthlyBaseSalary: 320000, hiredDate: '2024-09-01' }
    };
  });

  const saveExtended = (data: Record<string, TeacherExtendedState>) => {
    setExtendedData(data);
    localStorage.setItem('erp_teachers_extended', JSON.stringify(data));
  };

  // UI state
  const [activeTab, setActiveTab] = useState<'hiring' | 'loads' | 'attendance'>('hiring');
  
  // Form Recruitment
  const [recruitForm, setRecruitForm] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    maxHours: 18,
    color: 'teal',
    contractType: 'Permanent (CDI)' as any,
    monthlyBaseSalary: 350000,
    selectedSubjects: [] as string[]
  });

  // Attendance checking state
  const [teacherDailyAttendance, setTeacherDailyAttendance] = useState<Record<string, 'present' | 'late' | 'absent'>>(() => {
    const saved = localStorage.getItem('erp_teachers_attendance_check');
    return saved ? JSON.parse(saved) : {};
  });

  // Calculate live teaching hours per week for each teacher (1 course block = 1 hour)
  const getTeacherScheduledHoursCount = (teacherId: string) => {
    return courses.filter(c => c.teacherId === teacherId).length;
  };

  // Recruit Method
  const handleRecruitTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recruitForm.name.trim() || !recruitForm.id.trim()) {
      alert("Veuillez remplir l'Identifiant unique et le nom complet !");
      return;
    }

    const cleanedId = recruitForm.id.trim().toLowerCase().replace(/\s+/g, '_');
    if (teachers.some(t => t.id === cleanedId)) {
      alert("Erreur ! Un enseignant possède déjà cet Identifiant unique.");
      return;
    }

    const newTeacher: TeacherItem = {
      id: cleanedId,
      name: recruitForm.name.trim(),
      subjects: recruitForm.selectedSubjects.length > 0 ? recruitForm.selectedSubjects : [subjects[0]?.id || 'math'],
      unavailableSlots: [],
      color: recruitForm.color,
      email: recruitForm.email.trim() || undefined,
      maxHoursPerWeek: recruitForm.maxHours
    };

    // Append to central teacher list (Shares with schedule!)
    setTeachers(prev => {
      const updated = [...prev, newTeacher];
      localStorage.setItem('barakatplanning_teachers', JSON.stringify(updated));
      return updated;
    });

    // Save extra HR properties
    const ext: TeacherExtendedState = {
      teacherId: cleanedId,
      phone: recruitForm.phone.trim() || "+225 00 00 00 00 00",
      contractType: recruitForm.contractType,
      monthlyBaseSalary: recruitForm.monthlyBaseSalary,
      hiredDate: new Date().toISOString().split('T')[0]
    };
    saveExtended({
      ...extendedData,
      [cleanedId]: ext
    });

    alert(`Félicitations ! L'enseignant "${newTeacher.name}" a été recruté avec succès.\nIl est maintenant disponible pour être affecté aux emplois du temps.`);
    
    // reset form
    setRecruitForm({
      id: '',
      name: '',
      email: '',
      phone: '',
      maxHours: 18,
      color: 'teal',
      contractType: 'Permanent (CDI)' as any,
      monthlyBaseSalary: 350000,
      selectedSubjects: []
    });
  };

  // Handle delete teacher
  const handleDeleteTeacher = (id: string, name: string) => {
    if (window.confirm(`Voulez-vous révoquer le contrat et supprimer l'enseignant ${name} ? cela affectera ses cours programmés.`)) {
      setTeachers(prev => {
        const updated = prev.filter(t => t.id !== id);
        localStorage.setItem('barakatplanning_teachers', JSON.stringify(updated));
        return updated;
      });
      const copy = { ...extendedData };
      delete copy[id];
      saveExtended(copy);
    }
  };

  const toggleSubjectSelect = (subId: string) => {
    setRecruitForm(prev => {
      const exists = prev.selectedSubjects.includes(subId);
      const next = exists 
        ? prev.selectedSubjects.filter(id => id !== subId)
        : [...prev.selectedSubjects, subId];
      return { ...prev, selectedSubjects: next };
    });
  };

  const handleSetAttendance = (teacherId: string, status: 'present' | 'late' | 'absent') => {
    const updated = { ...teacherDailyAttendance, [teacherId]: status };
    setTeacherDailyAttendance(updated);
    localStorage.setItem('erp_teachers_attendance_check', JSON.stringify(updated));
  };

  return (
    <div className="space-y-6">
      
      {/* Module Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-light">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Briefcase className="h-5.5 w-5.5 text-indigo-650" />
            <span>Gestion des Enseignants & Corps Professoral</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Embauchez des enseignants qualifiés, affectez-les à des enseignements précis et suivez leur charge horaire réelle vis-à-vis du plan hebdomadaire.
          </p>
        </div>

        {/* Sub Navigation */}
        <div className="flex gap-2.5">
          <button 
            onClick={() => setActiveTab('hiring')}
            className={`cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'hiring' ? 'bg-[#ee7b11] text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <Users className="h-4 w-4" />
            Recrutement & Effectifs
          </button>
          <button 
            onClick={() => setActiveTab('loads')}
            className={`cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'loads' ? 'bg-[#ee7b11] text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <Clock className="h-4 w-4" />
            Charges & Volumes Horaires
          </button>
          <button 
            onClick={() => setActiveTab('attendance')}
            className={`cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'attendance' ? 'bg-[#ee7b11] text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <Activity className="h-4 w-4" />
            Pointage Présences
          </button>
        </div>
      </div>

      {/* RENDER TAB: HIRING & RECRUITMENT */}
      {activeTab === 'hiring' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left panel: Recruitment Form */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase text-[#0b4998] tracking-widest flex items-center gap-1.5">
              <span>Recruter un Enseignant</span>
            </h3>

            <form onSubmit={handleRecruitTeacher} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Identifiant unique (Sans espaces)</label>
                <input 
                  type="text" 
                  required
                  placeholder="ex: prof_gomez" 
                  value={recruitForm.id}
                  onChange={(e) => setRecruitForm(prev => ({ ...prev, id: e.target.value }))}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Nom complet & titre</label>
                <input 
                  type="text" 
                  required
                  placeholder="ex: M. Gomez Paul" 
                  value={recruitForm.name}
                  onChange={(e) => setRecruitForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Courriel professionnel</label>
                <input 
                  type="email" 
                  placeholder="ex: p.gomez@ecole.ci" 
                  value={recruitForm.email}
                  onChange={(e) => setRecruitForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Téléphone Mobile</label>
                  <input 
                    type="text" 
                    placeholder="Abidjan" 
                    value={recruitForm.phone}
                    onChange={(e) => setRecruitForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Charge Max (heures/sem.)</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="40" 
                    value={recruitForm.maxHours}
                    onChange={(e) => setRecruitForm(prev => ({ ...prev, maxHours: parseInt(e.target.value) || 18 }))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#ee7b11] uppercase">Type de Contrat</label>
                  <select
                    value={recruitForm.contractType}
                    onChange={(e) => setRecruitForm(prev => ({ ...prev, contractType: e.target.value as any }))}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                  >
                    <option value="Permanent (CDI)">Permanent (CDI)</option>
                    <option value="Vacataire (Horaire)">Vacataire (Horaire)</option>
                    <option value="CDD Temporaire">CDD Temporaire</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Salaire Base (FCFA)</label>
                  <input 
                    type="number" 
                    value={recruitForm.monthlyBaseSalary}
                    onChange={(e) => setRecruitForm(prev => ({ ...prev, monthlyBaseSalary: parseInt(e.target.value) || 150000 }))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Couleur d'identification</label>
                <select
                  value={recruitForm.color}
                  onChange={(e) => setRecruitForm(prev => ({ ...prev, color: e.target.value }))}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                >
                  <option value="indigo">Indigo</option>
                  <option value="emerald">Vert Émeraude</option>
                  <option value="teal">Sarcelle (Teal)</option>
                  <option value="rose">Rose</option>
                  <option value="amber">Ambre</option>
                  <option value="violet">Violet</option>
                  <option value="slate">Ardoise</option>
                </select>
              </div>

              {/* Subject qualification checkboxes list */}
              <div className="space-y-1.5 pt-1.5 border-t border-slate-100">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Matières de spécialisation</label>
                <div className="flex flex-wrap gap-1.5 max-h-[85px] overflow-y-auto pt-1">
                  {subjects.map(s => {
                    const isSelected = recruitForm.selectedSubjects.includes(s.id);
                    return (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => toggleSubjectSelect(s.id)}
                        className={`cursor-pointer px-2 py-1 border rounded-lg text-[10px] font-bold transition ${
                          isSelected ? 'bg-indigo-600 text-white border-indigo-650' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {s.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button 
                type="submit"
                className="cursor-pointer w-full py-2 bg-[#ee7b11] hover:bg-[#d66f0e] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm pt-2"
              >
                <Plus className="h-4 w-4" />
                Dresser le Contrat & Sauver
              </button>
            </form>
          </div>

          {/* Right panel: Teachers directory */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-5 shadow-xs overflow-hidden">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight pb-3 border-b border-indigo-50 mb-4">
              Dossiers & Contrats Professoriaux Actuels ({teachers.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teachers.map(t => {
                const ext = extendedData[t.id] || { phone: '+225 00 00 00 00', contractType: 'Permanent (CDI)', monthlyBaseSalary: 350000, hiredDate: 'En cours' };
                const scheduleHoursCount = getTeacherScheduledHoursCount(t.id);
                
                // Colors lookup helper for visual cohesion (safe fallback)
                let visualBorder = "border-slate-200";
                if (t.color === 'indigo') visualBorder = "border-indigo-300";
                if (t.color === 'emerald') visualBorder = "border-emerald-300";
                if (t.color === 'teal') visualBorder = "border-teal-300";
                if (t.color === 'rose') visualBorder = "border-rose-300";
                if (t.color === 'amber') visualBorder = "border-amber-300";

                return (
                  <div key={t.id} className={`p-4 rounded-2xl bg-slate-50 border ${visualBorder} hover:shadow-xs transition flex flex-col justify-between space-y-3 group`}>
                    
                    {/* Header profile row */}
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[9px] uppercase font-black tracking-wider text-[#0b4998]">{t.id}</span>
                        <h4 className="text-sm font-bold text-slate-900">{t.name}</h4>
                        <span className="text-[10px] text-slate-400 font-semibold">{t.email || 'Pas de courriel enregistré'}</span>
                      </div>

                      <button 
                        onClick={() => handleDeleteTeacher(t.id, t.name)}
                        className="opacity-0 group-hover:opacity-100 cursor-pointer p-1 text-slate-350 hover:text-red-500 rounded-lg transition"
                        title="Révoquer l'enseignant"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Meta contract row */}
                    <div className="grid grid-cols-2 gap-2 text-[10.5px] font-semibold text-slate-500 py-1.5 border-t border-b border-slate-100">
                      <div>
                        <span className="text-[8px] font-bold text-slate-400 uppercase block">Contrat</span>
                        <span className="text-slate-800 block">{ext.contractType}</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-bold text-slate-400 uppercase block">Traitement mensuel</span>
                        <span className="text-slate-850 font-mono block font-bold">{ext.monthlyBaseSalary.toLocaleString()} FCFA</span>
                      </div>
                    </div>

                    {/* Teaching qualification tags */}
                    <div className="space-y-1">
                      <span className="text-[8px] font-bold text-slate-400 uppercase">Spécialités :</span>
                      <div className="flex flex-wrap gap-1">
                        {t.subjects.map(subId => {
                          const matchedSubName = subjects.find(s => s.id === subId)?.name || subId;
                          return (
                            <span key={subId} className="px-1.5 py-0.2 bg-slate-200 text-slate-700 text-[8.5px] font-extrabold rounded-md">
                              {matchedSubName}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Live scheduled hours summary */}
                    <div className="pt-2">
                      <div className="flex justify-between text-[9px] font-black text-slate-650 uppercase mb-1">
                        <span>Horaires Grille : {scheduleHoursCount}h / Max {t.maxHoursPerWeek}h</span>
                        <span className={scheduleHoursCount > t.maxHoursPerWeek ? 'text-red-600' : 'text-emerald-750'}>
                          {Math.round(scheduleHoursCount / t.maxHoursPerWeek * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            scheduleHoursCount > t.maxHoursPerWeek ? 'bg-red-500' : 'bg-emerald-555'
                          }`}
                          style={{ width: `${Math.min(100, scheduleHoursCount / t.maxHoursPerWeek * 100)}%` }}
                        />
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* RENDER TAB: LOADS & MAX TRACKING REPORT */}
      {activeTab === 'loads' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-black text-[#0b4998] uppercase">Moniteur des Charges d’Enseignement Actives</h3>
          <p className="text-xs text-slate-500 leading-normal">
            Le tableau ci-dessous combine les heures insérées sur l'Emploi du Temps réel avec le plafond autorisé pour chaque professeur. Il permet de contrôler instantanément la sur-activité ou la sous-charge.
          </p>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-450 border-b border-slate-200 text-xs font-bold">
                  <th className="p-3">Identifiant</th>
                  <th className="p-3">Nom de l'Enseignant</th>
                  <th className="p-3 text-center">Spécialités</th>
                  <th className="p-3 text-center">Heures Prévues d'office</th>
                  <th className="p-3 text-center">Contrat Max</th>
                  <th className="p-3">Statut Charge</th>
                  <th className="p-3">Balance Mensuelle Estimée</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map(t => {
                  const currentHours = getTeacherScheduledHoursCount(t.id);
                  const ext = extendedData[t.id] || { contractType: 'Permanent (CDI)', monthlyBaseSalary: 350000 };
                  const percent = Math.round((currentHours / t.maxHoursPerWeek) * 105) || 0;
                  
                  return (
                    <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50/50 text-xs transition">
                      <td className="p-3 font-mono font-bold text-slate-500">{t.id}</td>
                      <td className="p-3 font-extrabold text-[#0b4998]">{t.name}</td>
                      <td className="p-3 text-center">
                        <span className="text-[10px] text-slate-550 font-semibold">{t.subjects.length} matières</span>
                      </td>
                      <td className="p-3 text-center font-black text-[#ee7b11]">{currentHours}h / semaine</td>
                      <td className="p-3 text-center font-bold text-slate-700">{t.maxHoursPerWeek}h / semaine</td>
                      <td className="p-3">
                        {currentHours > t.maxHoursPerWeek ? (
                          <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-[9px] font-black uppercase">⚠️ En surcharge</span>
                        ) : currentHours === 0 ? (
                          <span className="bg-slate-150 text-slate-500 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase">Non affecté</span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[9px] font-black uppercase">Charge Conforme</span>
                        )}
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-650">
                        {ext.contractType.includes('Vacataire') 
                          ? `${(currentHours * 4 * 7500).toLocaleString()} FCFA (Par Heure)` 
                          : `${ext.monthlyBaseSalary.toLocaleString()} FCFA (Forfait CDI)`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RENDER TAB: TEACHERS POINTAGE PRESENCES */}
      {activeTab === 'attendance' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-indigo-55">
            <h3 className="text-sm font-black text-slate-900 uppercase">Registre de Pointage Quotidien - Corps Enseignant</h3>
            <span className="text-[10px] bg-slate-900 text-white px-2.5 py-0.5 rounded-full font-bold">Pointage du jour : {new Date().toLocaleDateString('fr-FR', { dateStyle: 'medium' })}</span>
          </div>

          <p className="text-xs text-slate-500 font-semibold">
            Pointage rapide matinal pour le contrôle d'accès des professeurs. Les absences excusées permettront la réaffectation sans heurts par le bureau des surveillants.
          </p>

          <div className="space-y-2.5">
            {teachers.map(t => {
              const currentStatus = teacherDailyAttendance[t.id] || 'present';
              return (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-150/80 hover:bg-slate-100/50 transition">
                  <div className="flex items-center gap-3">
                    <span className="p-11 rounded-full text-xs font-bold" style={{ backgroundColor: t.color === 'indigo' ? '#e0e7ff' : '#ecfdf5' }}>
                      👨‍🏫
                    </span>
                    <div>
                      <span className="text-xs font-black text-slate-900 block">{t.name}</span>
                      <span className="text-[10.5px] text-slate-450 font-bold block">Contrat actif ({t.subjects.length} Disciplines)</span>
                    </div>
                  </div>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleSetAttendance(t.id, 'present')}
                      className={`cursor-pointer px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition ${
                        currentStatus === 'present' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Present
                    </button>
                    <button
                      onClick={() => handleSetAttendance(t.id, 'late')}
                      className={`cursor-pointer px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition ${
                        currentStatus === 'late' ? 'bg-amber-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      En retard
                    </button>
                    <button
                      onClick={() => handleSetAttendance(t.id, 'absent')}
                      className={`cursor-pointer px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition ${
                        currentStatus === 'absent' ? 'bg-red-650 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Absent
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
