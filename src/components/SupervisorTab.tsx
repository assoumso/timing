import React, { useState } from 'react';
import { 
  Building2, 
  DoorOpen, 
  Users2, 
  AlertTriangle, 
  Clock, 
  Calendar,
  Sparkles,
  UserCheck,
  UserX,
  MapPin,
  CheckCircle2
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
  unavailableSlots: string[];
  color: string;
  email?: string;
  maxHoursPerWeek: number;
}

interface RoomItem {
  id: string;
  name: string;
  type: 'Standard' | 'Lab' | 'Gym' | 'Art';
  capacity: number;
  color: string;
}

interface SubjectItem {
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

interface SupervisorTabProps {
  classes: ClassItem[];
  teachers: TeacherItem[];
  rooms: RoomItem[];
  subjects: SubjectItem[];
  courses: ScheduleCourse[];
  reportedAbsences?: Array<{ teacherId: string, dayId: string, slotId: string }>;
  onUpdateAbsences?: (newAbsences: Array<{ teacherId: string, dayId: string, slotId: string }>) => void;
  onTemporaryAbsence?: (teacherId: string, dayId: string, slotId: string) => void;
}

const DAYS = [
  { id: 'Mon', name: 'Lundi' },
  { id: 'Tue', name: 'Mardi' },
  { id: 'Wed', name: 'Mercredi' },
  { id: 'Thu', name: 'Jeudi' },
  { id: 'Fri', name: 'Vendredi' }
];

const TIME_SLOTS = [
  { id: 'M1', name: '08h30 - 09h30' },
  { id: 'M2', name: '09h30 - 10h30' },
  { id: 'M3', name: '10h45 - 11h45' },
  { id: 'M4', name: '11h45 - 12h45' },
  { id: 'A1', name: '14h00 - 15h00' },
  { id: 'A2', name: '15h00 - 16h00' },
  { id: 'A3', name: '16h15 - 17h15' }
];

export const SupervisorTab: React.FC<SupervisorTabProps> = ({
  classes,
  teachers,
  rooms,
  subjects,
  courses,
  reportedAbsences: externalAbsences,
  onUpdateAbsences
}) => {
  // Local state for checking room capacity warnings and proctored tasks
  const [selectedDay, setSelectedDay] = useState('Mon');
  const [selectedSlot, setSelectedSlot] = useState('M1');
  
  // Absence state manager fallback
  const [localAbsences, setLocalAbsences] = useState<Array<{ teacherId: string, dayId: string, slotId: string }>>([
    { teacherId: 'prof_koffi', dayId: 'Mon', slotId: 'M2' } // Demonstration default
  ]);

  const reportedAbsences = externalAbsences || localAbsences;
  const setReportedAbsences = (newAbsences: Array<{ teacherId: string, dayId: string, slotId: string }>) => {
    if (onUpdateAbsences) {
      onUpdateAbsences(newAbsences);
    } else {
      setLocalAbsences(newAbsences);
    }
  };

  const [absenceTeacher, setAbsenceTeacher] = useState(teachers[0]?.id || '');
  const [absenceDay, setAbsenceDay] = useState('Mon');
  const [absenceSlot, setAbsenceSlot] = useState('M1');

  // Find capacity overflows: class size > room capacity
  const capacityOverflows = courses.map(course => {
    const cls = classes.find(c => c.id === course.classId);
    const rm = rooms.find(r => r.id === course.roomId);
    
    if (cls && rm && cls.capacity > rm.capacity) {
      return {
        id: course.id,
        className: cls.name,
        classCap: cls.capacity,
        roomName: rm.name,
        roomCap: rm.capacity,
        day: DAYS.find(d => d.id === course.dayId)?.name || course.dayId,
        slot: TIME_SLOTS.find(s => s.id === course.slotId)?.name || course.slotId,
        excess: cls.capacity - rm.capacity
      };
    }
    return null;
  }).filter((x): x is NonNullable<typeof x> => x !== null);

  const handleReportAbsence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!absenceTeacher) return;
    
    // Check duplication
    const exists = reportedAbsences.some(
      a => a.teacherId === absenceTeacher && a.dayId === absenceDay && a.slotId === absenceSlot
    );
    if (exists) {
      alert("Cette absence est déjà enregistrée pour ce créneau.");
      return;
    }

    setReportedAbsences([...reportedAbsences, {
      teacherId: absenceTeacher,
      dayId: absenceDay,
      slotId: absenceSlot
    }]);
  };

  const handleClearAbsence = (teacherId: string, dayId: string, slotId: string) => {
    setReportedAbsences(reportedAbsences.filter(
      a => !(a.teacherId === teacherId && a.dayId === dayId && a.slotId === slotId)
    ));
  };

  // Find substitute teachers for a reported absence
  const getSubstitutesForAbsence = (teacherId: string, dayId: string, slotId: string) => {
    // 1. Identify what subject this teacher was supposed to teach
    const course = courses.find(
      c => c.teacherId === teacherId && c.dayId === dayId && c.slotId === slotId
    );
    if (!course) return [];

    const subjectToSubstitute = course.subjectId;

    // 2. Look for other teachers who teach this subject AND are FREE on that day & slot
    return teachers.filter(t => {
      // Cannot substitute themselves
      if (t.id === teacherId) return false;
      
      // Must teach this subject
      const teachesSubject = t.subjects.includes(subjectToSubstitute);
      
      // Must NOT have another course on this day & slot
      const isBusyWithCourse = courses.some(
        c => c.teacherId === t.id && c.dayId === dayId && c.slotId === slotId
      );
      
      // Must NOT have declared unavailability on this slot
      const isUnavailable = t.unavailableSlots?.includes(`${dayId}_${slotId}`);

      // Must NOT be reported absent themselves on this slot
      const isReportedAbsent = reportedAbsences.some(
        a => a.teacherId === t.id && a.dayId === dayId && a.slotId === slotId
      );

      return teachesSubject && !isBusyWithCourse && !isUnavailable && !isReportedAbsent;
    });
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black tracking-widest text-[#ee7b11] uppercase block">
              CONSOLE ADMINISTRATION SURINTENDANCE
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <span className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">👮‍♂️</span>
              <span>Régulation des Salles & Surveillance</span>
            </h2>
            <p className="text-xs text-slate-500">
              Assurez la logistique des flux scolaires, l'intégrité des placements d'élèves et la gestion réactive de l'établissement.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Occupancy helper & capacity overflows */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column: Capacity Overflows and reports (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Overflows list */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <AlertTriangle className="h-4.5 w-4.5 text-[#ee7b11]" />
              <span>Contrôle de Capacité de Salles</span>
            </h3>

            {capacityOverflows.length === 0 ? (
              <div className="p-3.5 bg-emerald-50 border border-emerald-150 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                <span>Tous les cours respectent la capacité maximale des salles assignées !</span>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                <p className="text-[11px] leading-relaxed text-[#ee7b11] font-bold">
                  ⚠️ {capacityOverflows.length} cas de surpopulation détectée :
                </p>
                {capacityOverflows.map((ov, idx) => (
                  <div key={idx} className="p-3 bg-red-50 border border-red-150 rounded-xl text-xs space-y-1.5 shadow-3xs">
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-slate-900">{ov.className} → {ov.roomName}</span>
                      <span className="text-red-700 bg-red-100/80 px-2 py-0.5 rounded-sm">
                        +{ov.excess} places
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium">
                      Placé le <span className="font-bold text-slate-700">{ov.day}</span> sur {ov.slot}.
                    </p>
                    <p className="text-[10px] text-red-600 italic">
                      Effectif classe de ({ov.classCap} él.) dépasse la taille maximale de la salle ({ov.roomCap} places).
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Salles Libres Quick Checker */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <DoorOpen className="h-4.5 w-4.5 text-indigo-600" />
              <span>Diagnostic d'Occupation des Salles</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Jour ciblé
                </label>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {DAYS.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Créneau horaire
                </label>
                <select
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {TIME_SLOTS.map(t => (
                    <option key={t.id} value={t.id}>{t.id} - ({t.name})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* List room occupancy state */}
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {rooms.map(room => {
                // Check if occupied by a class at selectedDay and selectedSlot
                const activeC = courses.find(c => c.roomId === room.id && c.dayId === selectedDay && c.slotId === selectedSlot);
                const assignedClass = activeC ? classes.find(c => c.id === activeC.classId)?.name : null;

                return (
                  <div key={room.id} className="flex items-center justify-between p-2 rounded-xl text-xs border border-slate-100 bg-stone-50/50">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-slate-400"></span>
                      <span className="font-extrabold text-slate-800">{room.name}</span>
                      <span className="text-[10px] text-slate-400">({room.type}, Cap: {room.capacity})</span>
                    </div>

                    {assignedClass ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] bg-amber-50 text-amber-800 border border-amber-250 font-black">
                        Occupée (classe {assignedClass})
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-150 font-black">
                        Disponible ✅
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right column: Emergency Absent & Replacements (7 cols) */}
        <div id="absences-supervisor-panel" className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-5">
          <div className="border-b border-slam-100 pb-3">
            <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-2">
              <UserX className="h-4.5 w-4.5 text-rose-600" />
              <span>Signalement des Absences & Remplacements d'Urgence</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              Déclarez la défaillance d'un enseignant pour trouver instantanément des suppléants qualifiés disponibles.
            </p>
          </div>

          {/* Form to declare absence */}
          <form onSubmit={handleReportAbsence} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                Enseignant en congé/souffrant
              </label>
              <select
                value={absenceTeacher}
                onChange={(e) => setAbsenceTeacher(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-250 rounded-xl text-xs font-bold focus:outline-none"
              >
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Jour</label>
              <select
                value={absenceDay}
                onChange={(e) => setAbsenceDay(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-250 rounded-xl text-xs font-bold focus:outline-none"
              >
                {DAYS.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Heure</label>
              <select
                value={absenceSlot}
                onChange={(e) => setAbsenceSlot(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-250 rounded-xl text-xs font-bold focus:outline-none"
              >
                {TIME_SLOTS.map(t => (
                  <option key={t.id} value={t.id}>{t.id}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-4 flex justify-end">
              <button
                type="submit"
                className="cursor-pointer px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
              >
                <UserX className="h-4 w-4" />
                <span>Enregistrer l'Absence d'urgence</span>
              </button>
            </div>
          </form>

          {/* List of reported absences and suggestions */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-black uppercase text-slate-600">
              Registre Actuel des Défaillances
            </h4>

            {reportedAbsences.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                Aucune absence d'enseignant n'est signalée aujourd'hui.
              </div>
            ) : (
              <div className="space-y-3.5">
                {reportedAbsences.map((abs, idx) => {
                  const teacher = teachers.find(t => t.id === abs.teacherId);
                  const dayName = DAYS.find(d => d.id === abs.dayId)?.name || abs.dayId;
                  const slotName = TIME_SLOTS.find(s => s.id === abs.slotId)?.id || abs.slotId;
                  
                  // Subs list
                  const eligibleSubs = getSubstitutesForAbsence(abs.teacherId, abs.dayId, abs.slotId);

                  return (
                    <div key={idx} className="p-4 border border-rose-100 rounded-2xl bg-white space-y-3 shadow-3xs hover:border-indigo-200 transition">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
                            <span className="font-extrabold text-slate-900 text-sm">{teacher?.name}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                            Absent(e) le <span className="font-bold text-slate-700">{dayName}</span> sur le créneau <span className="font-bold text-slate-700">{slotName}</span>
                          </p>
                        </div>
                        <button
                          onClick={() => handleClearAbsence(abs.teacherId, abs.dayId, abs.slotId)}
                          className="cursor-pointer text-[10px] font-extrabold text-slate-400 hover:text-rose-600 hover:bg-rose-50 px-2 py-1 rounded"
                          title="Rétablir l'absence"
                        >
                          Rétablir Enseignant
                        </button>
                      </div>

                      {/* Subs block */}
                      <div className="pt-2 border-t border-slate-100 space-y-2">
                        <span className="block text-[9.5px] font-extrabold text-indigo-700 uppercase tracking-wide flex items-center gap-1">
                          <Sparkles className="h-3.5 w-3.5 animate-bounce" />
                          <span>Moteur d'Appariement : Suppléants Disponibles ({eligibleSubs.length})</span>
                        </span>

                        {eligibleSubs.length === 0 ? (
                          <p className="text-[11px] text-amber-700 italic font-semibold">
                            ⚠️ Aucun enseignant qualifié libre à cette heure précise. Envisager un déplacement du cours ou une fermeture de classe.
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {eligibleSubs.map(sub => (
                              <div key={sub.id} className="p-2 border border-slate-150 bg-stone-50/50 rounded-xl flex items-center justify-between text-[11px]">
                                <div>
                                  <span className="font-extrabold text-slate-800">{sub.name}</span>
                                  <span className="block text-[9px] text-slate-400 font-semibold">Max: {sub.maxHoursPerWeek}h/sem</span>
                                </div>
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded font-black text-[9px] uppercase tracking-wide">
                                  Qualifié & Libre
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
