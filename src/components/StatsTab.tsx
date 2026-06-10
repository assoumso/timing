import React from 'react';
import { 
  BarChart3, 
  Users, 
  BookOpen, 
  School, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Activity,
  Award,
  Download
} from 'lucide-react';

interface TeacherItem {
  id: string;
  name: string;
  subjects: string[];
  maxHours: number;
  color: string;
  email?: string;
}

interface ClassItem {
  id: string;
  name: string;
}

interface SubjectItem {
  id: string;
  name: string;
  color?: string;
}

interface RoomItem {
  id: string;
  name: string;
  capacity?: number;
}

interface ScheduleCourse {
  id: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  roomId: string;
  dayId: string;
  slotId: string;
  duration?: number;
  comments?: string;
}

interface StatsTabProps {
  teachers: TeacherItem[];
  classes: ClassItem[];
  subjects: SubjectItem[];
  rooms: RoomItem[];
  courses: ScheduleCourse[];
  conflicts: any[];
  schoolName: string;
  academicYear: string;
}

export const StatsTab: React.FC<StatsTabProps> = ({
  teachers,
  classes,
  subjects,
  rooms,
  courses,
  conflicts,
  schoolName,
  academicYear
}) => {
  // Calculations
  const totalCourses = courses.length;
  const totalHours = courses.length * 2; // Each slot represents a 2-hour class in our system
  const totalTeachers = teachers.length;
  const totalClasses = classes.length;
  const totalRooms = rooms.length;
  const totalConflicts = conflicts.length;

  // 1. Calculate Teacher loads
  const teacherLoads = teachers.map(t => {
    // Count how many times this teacher is scheduled
    const scheduledSlots = courses.filter(c => c.teacherId === t.id).length;
    const hours = scheduledSlots * 2;
    const ratio = Math.min(Math.round((hours / t.maxHours) * 100), 150);
    return {
      ...t,
      currentHours: hours,
      ratio,
      isOverloaded: hours > t.maxHours
    };
  }).sort((a, b) => b.currentHours - a.currentHours);

  // 2. Calculate Class loads
  const classLoads = classes.map(c => {
    const scheduledSlots = courses.filter(co => co.classId === c.id).length;
    const hours = scheduledSlots * 2;
    return {
      ...c,
      hours,
      slotsCount: scheduledSlots
    };
  }).sort((a, b) => b.hours - a.hours);

  // 3. Subject distribution
  const subjectDistribution = subjects.map(s => {
    const hours = courses.filter(c => c.subjectId === s.id).length * 2;
    return {
      ...s,
      hours
    };
  }).filter(s => s.hours > 0).sort((a, b) => b.hours - a.hours);

  // Print function
  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div id="stats-tab-container" className="space-y-6">
      {/* Upper header banner page */}
      <div className="bg-gradient-to-br from-[#0b4998] via-[#093d80] to-[#072c5e] border border-[#f3aa1c]/30 text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl print:hidden">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#ee7b11]/20 text-blue-105 border border-[#f3aa1c]/30">
            <BarChart3 className="h-3.5 w-3.5 text-[#f3aa1c]" />
            <span>BILAN ACADÉMIQUE STATISTIQUE</span>
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Analyse et Synthèse des Cours
          </h2>
          <p className="text-sm text-blue-100 max-w-xl">
            Suivez en temps réel la répartition de la charge de travail globale par professeur, l'occupation des promotions et l'organisation fonctionnelle de {schoolName}.
          </p>
        </div>
        
        <button
          onClick={handlePrintReport}
          className="cursor-pointer self-start md:self-auto inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 rounded-xl text-xs font-bold shadow-sm transition shrink-0"
        >
          <Download className="h-4 w-4 text-[#0b4998]" />
          <span>Exporter / Imprimer le Bilan</span>
        </button>
      </div>

      {/* Grid count stats info cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-[#0b4998] rounded-xl">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Volume Horaire</span>
            <span className="text-lg font-black text-slate-900">{totalHours}h d'enseignement</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex items-center gap-4">
          <div className="p-3 bg-[#ee7b11]/5 text-[#ee7b11] rounded-xl">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Cours Assignés</span>
            <span className="text-lg font-black text-slate-900">{totalCourses} séances actives</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Professeurs Actifs</span>
            <span className="text-lg font-black text-slate-900">{totalTeachers} intervenants</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex items-center gap-4">
          <div className={`p-3 rounded-xl ${totalConflicts > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
            {totalConflicts > 0 ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">État de la Grille</span>
            <span className={`text-lg font-black ${totalConflicts > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {totalConflicts > 0 ? `${totalConflicts} conflits` : 'Aucun conflit'}
            </span>
          </div>
        </div>
      </div>

      {/* Two Columns Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Teacher limits and contracts */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-2">
              <Users className="h-4.5 w-4.5 text-[#0b4998]" />
              <span>Charge de travail par Professeur</span>
            </h3>
            <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-md">
              Compare aux heures théoriques max
            </span>
          </div>

          <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin">
            {teacherLoads.map(t => (
              <div key={t.id} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: t.color === 'indigo' ? '#3f51b5' : t.color === 'rose' ? '#e91e63' : t.color === 'emerald' ? '#4caf50' : t.color === 'orange' ? '#ff9800' : '#8bc34a' }}></span>
                    <span className="font-bold text-slate-800">{t.name}</span>
                  </div>
                  <span className={`font-black ${t.isOverloaded ? 'text-red-600' : 'text-slate-650'}`}>
                    {t.currentHours}h / {t.maxHours}h max
                  </span>
                </div>

                <div className="relative h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      t.isOverloaded 
                        ? 'bg-red-500' 
                        : t.currentHours === t.maxHours 
                        ? 'bg-amber-500' 
                        : 'bg-[#0b4998]'
                    }`}
                    style={{ width: `${t.ratio}%` }}
                  ></div>
                </div>

                {t.isOverloaded && (
                  <p className="text-[9.5px] text-red-500 font-bold flex items-center gap-1.5 mt-1 bg-red-50/50 px-2 py-0.5 rounded border border-red-100">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Sépare/Allège la planification pour {t.name} (+{t.currentHours - t.maxHours}h d'excès)</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Class statistics & details */}
        <div className="space-y-6">
          
          {/* Box 1: Class Hours assigned */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-2">
                <School className="h-4.5 w-4.5 text-[#ee7b11]" />
                <span>Volume horaire annuel par Classe</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-black">
                Total : {totalClasses} classes
              </span>
            </div>

            <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
              {classLoads.map(c => (
                <div key={c.id} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">Classe de {c.name}</span>
                    <span className="font-black text-slate-900 bg-stone-100 px-2 py-0.5 rounded-md">
                      {c.hours}h planifiées ({c.slotsCount} créneaux)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full">
                    <div 
                      className="h-full bg-[#ee7b11] rounded-full"
                      style={{ width: `${Math.min((c.hours / 40) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Box 2: Subject popularity and breakdown */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-2">
                <Activity className="h-4.5 w-4.5 text-emerald-600" />
                <span>Heures d’enseignement par Matière</span>
              </h3>
            </div>

            {subjectDistribution.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-4">
                Aucun cours n'a été planifié pour le moment.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {subjectDistribution.map(s => (
                  <div key={s.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200/50 flex flex-col justify-between">
                    <span className="text-xs font-bold text-slate-800 line-clamp-1">{s.name}</span>
                    <span className="text-xs font-black text-[#0b4998] mt-2 block">
                      {s.hours} Heures effectives
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Bottom printable document official look */}
      <div className="hidden print:block border-t border-dashed border-stone-300 pt-8 mt-12 space-y-4 text-center">
        <h3 className="text-sm font-black uppercase tracking-widest">{schoolName}</h3>
        <p className="text-xs text-slate-500">Document d'analyse académique généré automatiquement le {new Date().toLocaleDateString('fr-FR')} — Année Scolaire {academicYear}</p>
        <p className="text-[11px] italic font-semibold">« {schoolName} - Éducation, Valeurs, Excellence »</p>
      </div>
    </div>
  );
};
