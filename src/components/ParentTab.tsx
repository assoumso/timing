import React, { useState } from 'react';
import { 
  Heart, 
  Mail, 
  MapPin, 
  PhoneCall, 
  Clock, 
  UserSquare2, 
  Printer, 
  ArrowRight,
  BookOpen,
  CalendarDays,
  FileCheck2,
  Copy
} from 'lucide-react';

interface ClassItem {
  id: string;
  name: string;
  capacity: number;
  color: string;
}

interface TeacherItem {
  id: string;
  name: string;
  subjects: string[];
  color: string;
  email?: string;
}

interface SubjectItem {
  id: string;
  name: string;
}

interface RoomItem {
  id: string;
  name: string;
}

interface ScheduleCourse {
  id: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  roomId: string;
  dayId: string;
  slotId: string;
}

interface ParentTabProps {
  classes: ClassItem[];
  teachers: TeacherItem[];
  subjects: SubjectItem[];
  rooms: RoomItem[];
  courses: ScheduleCourse[];
  schoolName: string;
  schoolSubName: string;
  academicYear: string;
  schoolPhone: string;
  schoolEmail: string;
  schoolAddress: string;
  schoolDirector: string;
  schoolMotto: string;
}

const DAYS = [
  { id: 'Mon', name: 'Lundi' },
  { id: 'Tue', name: 'Mardi' },
  { id: 'Wed', name: 'Mercredi' },
  { id: 'Thu', name: 'Jeudi' },
  { id: 'Fri', name: 'Vendredi' }
];

const TIME_SLOTS = [
  { id: 'M1', name: 'M1 (08:30)' },
  { id: 'M2', name: 'M2 (09:30)' },
  { id: 'M3', name: 'M3 (10:45)' },
  { id: 'M4', name: 'M4 (11:45)' },
  { id: 'A1', name: 'A1 (14:00)' },
  { id: 'A2', name: 'A2 (15:00)' },
  { id: 'A3', name: 'A3 (16:15)' }
];

export const ParentTab: React.FC<ParentTabProps> = ({
  classes,
  teachers,
  subjects,
  rooms,
  courses,
  schoolName,
  schoolSubName,
  academicYear,
  schoolPhone,
  schoolEmail,
  schoolAddress,
  schoolDirector,
  schoolMotto
}) => {
  const [selectedChildClass, setSelectedChildClass] = useState(classes[0]?.id || '6A');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  // Filter courses for child's class
  const childCourses = courses.filter(c => c.classId === selectedChildClass);

  // Find teachers who teach this class
  const activeTeacherIds = Array.from(new Set(childCourses.map(c => c.teacherId)));
  const classTeachers = teachers.filter(t => activeTeacherIds.includes(t.id));

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Editorial Welcome Header */}
      <div className="bg-gradient-to-br from-[#faf8f5] to-[#f4f0ea] border border-[#f3aa1c]/20 p-6 md:p-8 rounded-3xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-black tracking-widest text-[#ee7b11]">
              COMMUNAUTÉ FAMILIALE & COMMUNICATIVE
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              Espace Bienveillant de Suivi des Parents
            </h2>
            <p className="text-xs text-slate-550 leading-relaxed max-w-xl">
              Bienvenue dans votre portail de liaison. Consultez en temps réel l'emploi du temps de vos enfants de l'établissement <span className="font-bold">{schoolName}</span>, coordonnez vos rendez-vous et contactez nos équipes d'enseignants.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white px-4 py-2 border border-slate-205 rounded-xl shrink-0">
            <span className="text-xs font-semibold text-slate-500">Classe de votre enfant :</span>
            <select
              value={selectedChildClass}
              onChange={(e) => setSelectedChildClass(e.target.value)}
              className="px-3 py-1 bg-[#0b4998]/5 border border-[#0b4998]/20 rounded-lg text-xs font-bold text-[#0b4998] focus:outline-none focus:ring-1 focus:ring-[#0b4998]"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Mot de la Directrice */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col sm:flex-row gap-4 items-start text-xs">
          <span className="text-2xl shrink-0">🌸</span>
          <div>
            <span className="font-extrabold text-slate-800 block mb-0.5">Le Mot de l'Administration</span>
            <p className="text-slate-500 italic leading-relaxed">
              "Chers parents, l'éducation est une œuvre commune. Notre planificateur assure à vos enfants un rythme physique et intellectuel équilibré. Nous restons à votre entière disposition à contact@ecoledesfamilles.ed.ci pour toute question académique."
            </p>
            <p className="text-[10px] font-bold text-slate-700 mt-1 uppercase">— {schoolDirector}, Directrice d'établissement</p>
          </div>
        </div>
      </div>

      {/* Grid: Calendar view & Teacher contacts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Weekly Schedule Grid (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-2">
              <CalendarDays className="h-4.5 w-4.5 text-[#0b4998]" />
              <span>Grille des cours hebdomadaires de {classes.find(c => c.id === selectedChildClass)?.name || selectedChildClass}</span>
            </h3>
            <button
              onClick={() => window.print()}
              className="cursor-pointer text-[11px] font-bold text-[#0b4998] hover:underline flex items-center gap-1"
            >
              <Printer className="h-4 w-4" />
              <span>Imprimer l'emploi du temps</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-slate-150 min-w-400 schedule-grid-table">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-150 text-center">
                  <th className="p-2 border border-slate-150 text-left w-1/8 font-bold">Créneau</th>
                  {DAYS.map(d => (
                    <th key={d.id} className="p-2 border border-slate-150 font-black">{d.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-xs">
                {TIME_SLOTS.map(slot => (
                  <tr key={slot.id} className="hover:bg-slate-50/20 text-center">
                    <td className="p-2 border border-slate-150 text-left font-semibold text-slate-500 bg-slate-50/50">
                      {slot.name}
                    </td>

                    {DAYS.map(day => {
                      const course = childCourses.find(c => c.dayId === day.id && c.slotId === slot.id);
                      const tName = course ? teachers.find(t => t.id === course.teacherId)?.name : null;
                      const sName = course ? subjects.find(s => s.id === course.subjectId)?.name : null;
                      const rName = course ? rooms.find(r => r.id === course.roomId)?.name : null;

                      return (
                        <td key={day.id} className="p-2 border border-slate-150 relative h-16 min-w-24">
                          {course ? (
                            <div className="absolute inset-1 p-1 bg-sky-50 border border-sky-200/80 rounded-lg flex flex-col justify-between text-left shadow-3xs overflow-hidden">
                              <span className="font-extrabold text-[#0b4998] text-[10px] leading-tight block truncate">
                                {sName}
                              </span>
                              <span className="text-[9.5px] text-slate-650 truncate block mt-0.5">
                                Ref: {tName}
                              </span>
                              <span className="text-[8.5px] uppercase font-extrabold text-amber-700 block text-right mt-1">
                                {rName}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-350 italic font-medium">Étude libre / Pause</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Contacts directory (4 cols) */}
        <div id="school-teachers-contacts-card" className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
            <Mail className="h-4.5 w-4.5 text-[#ee7b11]" />
            <span>Professeurs Intervenants</span>
          </h3>

          {classTeachers.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-4">
              Aucun professeur n'est encore planifié sur cette classe.
            </p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {classTeachers.map(t => (
                <div key={t.id} className="p-3 border border-slate-100 bg-[#dfecf8]/10 rounded-xl space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-extrabold text-slate-900 text-xs">{t.name}</p>
                      <p className="text-[9px] text-[#0b4998] font-bold uppercase tracking-wide">
                        {t.subjects.map(sId => subjects.find(s => s.id === sId)?.name).filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>

                  {t.email ? (
                    <div className="flex items-center justify-between pt-1 border-t border-dashed border-slate-200 text-[10px] font-sans">
                      <span className="text-slate-450 font-semibold truncate max-w-40" title={t.email}>
                        {t.email}
                      </span>
                      <button
                        onClick={() => handleCopyEmail(t.email!)}
                        className="cursor-pointer text-indigo-650 font-bold hover:underline shrink-0 flex items-center gap-0.5 bg-indigo-50 px-1.5 py-0.5 rounded"
                      >
                        <Copy className="h-3 w-3" />
                        <span>{copiedEmail === t.email ? "Copié" : "Copier"}</span>
                      </button>
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 italic border-t border-dashed border-slate-150 pt-1">
                      Adresse email confidentielle
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* School contacts information footer */}
          <div className="bg-[#ee7b11]/5 border border-[#ee7b11]/15 p-4 rounded-xl text-xs space-y-2 text-slate-650 font-sans mt-4">
            <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-[#ee7b11]" />
              <span>{schoolName}</span>
            </span>
            <p className="text-[10px] italic font-semibold text-slate-400">
              "{schoolMotto}"
            </p>
            
            <div className="space-y-1 pt-1.5 border-t border-slate-200/80 text-[10px] font-medium leading-relaxed">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-stone-400" />
                <span>{schoolAddress}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <PhoneCall className="h-3.5 w-3.5 text-stone-400" />
                <span>{schoolPhone}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-stone-400" />
                <span>{schoolEmail}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
