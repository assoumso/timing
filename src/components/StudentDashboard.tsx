import React, { useState, useEffect } from 'react';
import { 
  ClassItem, 
  TeacherItem, 
  SubjectItem, 
  RoomItem, 
  ScheduleCourse, 
  DAYS, 
  TIME_SLOTS 
} from '../types';
import { 
  GraduationCap, 
  Printer, 
  Clock, 
  BookOpen, 
  User, 
  School, 
  AlertTriangle, 
  CheckCircle,
  Clock3
} from 'lucide-react';

interface StudentDashboardProps {
  classes: ClassItem[];
  teachers: TeacherItem[];
  subjects: SubjectItem[];
  rooms: RoomItem[];
  courses: ScheduleCourse[];
  reportedAbsences: Array<{ teacherId: string; dayId: string; slotId: string }>;
  isScheduleValidated?: boolean;
  schoolName?: string;
  academicYear?: string;
}

export function StudentDashboard({
  classes,
  teachers,
  subjects,
  rooms,
  courses,
  reportedAbsences,
  isScheduleValidated = false,
  schoolName = "ÉCOLE DES FAMILLES",
  academicYear = "2025-2026"
}: StudentDashboardProps) {
  // Select active student class
  const [selectedClassId, setSelectedClassId] = useState<string>(() => {
    const saved = localStorage.getItem('barakat_student_selected_class');
    if (saved) return saved;
    return classes[0]?.id || '6A';
  });

  useEffect(() => {
    localStorage.setItem('barakat_student_selected_class', selectedClassId);
  }, [selectedClassId]);

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  const activeClass = classes.find(c => c.id === selectedClassId);

  // Get courses matching class
  const classCourses = courses.filter(c => c.classId === selectedClassId);

  // Get helper colors
  const getSubjectColorClasses = (subjectId: string) => {
    const sub = subjects.find(s => s.id === subjectId);
    const code = sub?.color || 'slate';
    const mapping: Record<string, { bg: string; text: string; border: string }> = {
      blue: { bg: 'bg-blue-50/90 hover:bg-blue-100/90', text: 'text-blue-800', border: 'border-blue-200' },
      indigo: { bg: 'bg-indigo-50/90 hover:bg-indigo-100/90', text: 'text-indigo-800', border: 'border-indigo-200' },
      violet: { bg: 'bg-violet-50/90 hover:bg-violet-100/90', text: 'text-violet-800', border: 'border-violet-200' },
      emerald: { bg: 'bg-emerald-50/90 hover:bg-emerald-100/90', text: 'text-emerald-800', border: 'border-emerald-200' },
      rose: { bg: 'bg-rose-50/90 hover:bg-rose-100/90', text: 'text-rose-800', border: 'border-rose-200' },
      amber: { bg: 'bg-amber-50/90 hover:bg-amber-100/90', text: 'text-amber-800', border: 'border-amber-200' },
      orange: { bg: 'bg-orange-50/90 hover:bg-orange-100/90', text: 'text-orange-850', border: 'border-orange-200' },
      sky: { bg: 'bg-sky-50/90 hover:bg-sky-100/90', text: 'text-sky-800', border: 'border-sky-200' },
      red: { bg: 'bg-red-50/90 hover:bg-red-100/90', text: 'text-red-800', border: 'border-red-250' },
      slate: { bg: 'bg-slate-50 hover:bg-slate-100', text: 'text-slate-800', border: 'border-slate-250' }
    };
    return mapping[code] || mapping['slate'];
  };

  return (
    <div className="space-y-6">
      
      {/* Upper Student Banner */}
      <div className="bg-gradient-to-r from-rose-500 via-[#ee7b11] to-[#f3aa1c] rounded-3xl p-6 shadow-md text-white no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider backdrop-blur-xs select-none">
              🎓 Étoile de l'Émergence — Portail Élève
            </span>
            <h1 className="text-2xl font-black tracking-tight">
              Mon Emploi du Temps Hebdomadaire
            </h1>
            <p className="text-xs text-white/90 font-medium">
              Consultez vos matières enseignées, vos salles d'attribution et vérifiez en temps réel les éventuelles absences de professeurs signalées aujourd'hui.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-2xl border border-white/20">
              <span className="text-xs font-bold text-white/80">Ma Classe :</span>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="bg-[#ee7b11] text-white text-sm font-extrabold focus:outline-none cursor-pointer border-none rounded-md px-1"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id} className="text-slate-900 font-bold">{c.name}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handlePrint}
              className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-850 text-white rounded-2xl text-xs font-black transition border border-slate-755 shadow-sm active:scale-95"
            >
              <Printer className="h-4 w-4 text-emerald-400" />
              <span>Imprimer mon Planning</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Validation / Active Absence Bulletins Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 no-print">
        {/* Visa official badge */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className={`p-2.5 rounded-full ${isScheduleValidated ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
            {isScheduleValidated ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <Clock3 className="h-5 w-5" />
            )}
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wide text-slate-400">Visa d'Homologation Académique</h4>
            <p className="text-sm font-extrabold text-slate-850 mt-0.5">
              {isScheduleValidated 
                ? "Certifié conforme et approuvé par la Direction Éducative." 
                : "Calendrier de cours temporaire — En attente du dépôt de visa officiel."}
            </p>
          </div>
        </div>

        {/* Dynamic Absence Notification */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="p-2.5 rounded-full bg-rose-50 text-rose-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-black uppercase tracking-wide text-slate-400">Compteur de professeurs absents aujourd'hui</h4>
            <p className="text-sm font-extrabold text-slate-850 mt-0.5 truncate">
              {reportedAbsences.length === 0 
                ? "Aucune absence signalée. Tous les cours sont maintenus !"
                : `${reportedAbsences.length} absence(s) déclarée(s) — Voir les avertissements de la grille.`}
            </p>
          </div>
        </div>
      </div>

      {/* Time Table Grid Card Container */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm overflow-x-auto print:border-none print:p-0 print:shadow-none">
        
        {/* Print only official header */}
        <div className="hidden print:block mb-6 border-b-2 border-slate-900 pb-4">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <span className="text-[10px] text-indigo-600 font-extrabold tracking-widest uppercase block leading-none">
                {schoolName} — PORTAIL ÉLÈVE OFFICIEL
              </span>
              <h1 className="text-2xl font-black text-slate-950 uppercase tracking-tight">
                Emploi du temps de la classe : {activeClass?.name}
              </h1>
              <p className="text-xs font-semibold text-slate-600">
                Fiche d'apprentissage scolaire imprimée — Année Scolaire {academicYear}
              </p>
            </div>
            <div className="text-right">
              <span className={`text-[10.5px] font-extrabold block px-3 py-1 rounded-md border ${
                isScheduleValidated ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {isScheduleValidated ? "Emploi du temps officiel" : "Document Provisoire"}
              </span>
              <span className="text-[9px] text-slate-400 font-mono block mt-1">
                Imprimé par l'élève le {new Date().toLocaleDateString('fr-FR')}
              </span>
            </div>
          </div>
        </div>

        <table className="w-full min-w-[700px] border-collapse">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="w-24 p-3 text-left text-xs font-bold text-slate-400 tracking-widest uppercase">
                Heure
              </th>
              {DAYS.map(day => (
                <th key={day.id} className="p-3 text-center text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  {day.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map(slot => (
              <tr key={slot.id} className="border-b border-slate-100/60 hover:bg-slate-50/20 transition">
                <td className="p-3 border-r border-slate-100 text-xs font-semibold text-slate-400">
                  <div className="font-bold text-slate-700">{slot.id}</div>
                  <div className="text-[10px] mt-0.5">{slot.start} - {slot.end}</div>
                </td>

                {DAYS.map(day => {
                  const matchedCourse = classCourses.find(c => c.dayId === day.id && c.slotId === slot.id);

                  if (!matchedCourse) {
                    return (
                      <td key={day.id} className="p-2 border-r border-slate-100/60 text-center text-[10px] text-slate-350 bg-slate-50/10">
                        <span className="opacity-40">Étude libre</span>
                      </td>
                    );
                  }

                  const matchedSubject = subjects.find(s => s.id === matchedCourse.subjectId);
                  const matchedTeacher = teachers.find(t => t.id === matchedCourse.teacherId);
                  const matchedRoom = rooms.find(r => r.id === matchedCourse.roomId);

                  // Check if teacher is absent
                  const isTeacherAbsent = reportedAbsences.some(
                    abs => abs.teacherId === matchedCourse.teacherId && abs.dayId === day.id && abs.slotId === slot.id
                  );

                  const { bg, text, border } = getSubjectColorClasses(matchedCourse.subjectId);

                  return (
                    <td 
                      key={day.id} 
                      className={`p-2.5 border-r border-slate-100/60 transition duration-150 align-top ${
                        isTeacherAbsent 
                          ? 'bg-rose-50/90 border-2 border-dashed border-rose-300' 
                          : `${bg} border border-transparent`
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-1">
                          <span className={`text-xs font-black leading-none ${isTeacherAbsent ? 'text-rose-950 uppercase line-through' : text}`}>
                            {matchedSubject?.name || matchedCourse.subjectId}
                          </span>
                        </div>

                        {/* Location / Teacher details */}
                        <div className="space-y-0.5 text-[10.5px]">
                          <div className={`flex items-center gap-1 font-semibold ${isTeacherAbsent ? 'text-rose-900/40 line-through' : 'text-slate-650'}`}>
                            <User className="h-3 w-3 text-slate-400 shrink-0" />
                            <span className="truncate">{matchedTeacher?.name || matchedCourse.teacherId}</span>
                          </div>

                          <div className={`flex items-center gap-1 font-semibold ${isTeacherAbsent ? 'text-rose-900/40' : 'text-slate-550'}`}>
                            <School className="h-3 w-3 text-slate-400 shrink-0" />
                            <span>Salle {matchedRoom?.name || matchedCourse.roomId}</span>
                          </div>
                        </div>

                        {/* Real-time Absence Sticker */}
                        {isTeacherAbsent ? (
                          <div className="mt-1 px-1.5 py-0.5 rounded bg-rose-200 text-rose-800 text-[8.5px] font-black uppercase text-center tracking-wider animate-pulse border border-rose-300">
                            ⚠️ COURS ANNULÉ
                          </div>
                        ) : (
                          isScheduleValidated && (
                            <div className="text-[8px] font-bold text-emerald-600 text-right leading-none select-none tracking-wide no-print">
                              ✓ Validé
                            </div>
                          )
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
