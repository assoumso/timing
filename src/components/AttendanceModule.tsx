import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Plus, 
  Trash2, 
  Check, 
  Users, 
  ShieldAlert, 
  FileCheck, 
  Calendar, 
  Search,
  Activity
} from 'lucide-react';
import { ClassItem, TeacherItem } from '../types';

interface AttendanceModuleProps {
  classes: ClassItem[];
  teachers: TeacherItem[];
}

interface StudentAttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  date: string;
  status: 'present' | 'absent_unjustified' | 'absent_justified' | 'late';
  reason: string;
}

export default function AttendanceModule({
  classes,
  teachers
}: AttendanceModuleProps) {
  
  // Resolve student list dynamically
  const [studentList, setStudentList] = useState<any[]>([]);
  useEffect(() => {
    const saved = localStorage.getItem('erp_student_records');
    if (saved) {
      setStudentList(JSON.parse(saved));
    } else {
      setStudentList([
        { id: 'std_1', firstName: 'Koffi', lastName: 'Yao Anderson', classId: '6A', matricule: 'M-2025-4102' },
        { id: 'std_2', firstName: 'Diomandé', lastName: 'Aminata', classId: '6B', matricule: 'M-2024-1185' },
        { id: 'std_3', firstName: 'Kouassi', lastName: 'Koffi Charles', classId: '3A', matricule: 'M-2025-9981' },
         { id: 'std_4', firstName: 'Sylla', lastName: 'Ibrahim Karim', classId: '3B', matricule: 'M-2023-0056' },
        { id: 'std_5', firstName: 'Gomez', lastName: 'Marie-Chantal Enola', classId: '3A', matricule: 'M-2025-0103' }
      ]);
    }
  }, []);

  // Persistent student attendance records log
  const [attendanceLogs, setAttendanceLogs] = useState<StudentAttendanceRecord[]>(() => {
    const saved = localStorage.getItem('erp_student_attendance_records');
    if (saved) return JSON.parse(saved);
    // defaults
    return [
      { id: 'att_1', studentId: 'std_1', studentName: 'YAO Koffi Anderson', classId: '6A', date: '2026-06-15', status: 'absent_justified', reason: 'Rendez-vous médical dentaire certifié' },
      { id: 'att_2', studentId: 'std_4', studentName: 'SYLLA Ibrahim Karim', classId: '3B', date: '2026-06-15', status: 'late', reason: 'Panne de taxi-compteur sur le boulevard' },
      { id: 'att_3', studentId: 'std_2', studentName: 'DIOMANDÉ Aminata', classId: '6B', date: '2026-06-12', status: 'absent_unjustified', reason: 'Pas de motif renseigné' }
    ];
  });

  // Shared Teacher attendance punches state
  const [teacherDailyAttendance, setTeacherDailyAttendance] = useState<Record<string, 'present' | 'late' | 'absent'>>(() => {
    const saved = localStorage.getItem('erp_teachers_attendance_check');
    return saved ? JSON.parse(saved) : {};
  });

  // Save changes
  useEffect(() => {
    localStorage.setItem('erp_student_attendance_records', JSON.stringify(attendanceLogs));
  }, [attendanceLogs]);

  useEffect(() => {
    localStorage.setItem('erp_teachers_attendance_check', JSON.stringify(teacherDailyAttendance));
  }, [teacherDailyAttendance]);

  // UI state
  const [activeSubTab, setActiveSubTab] = useState<'roster' | 'logs' | 'teachers_att'>('roster');
  
  // Selection filter
  const [rosterClassId, setRosterClassId] = useState('6A');
  const [rosterDate, setRosterDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Filter roster students
  const activeRosterStudents = studentList.filter(s => s.classId === rosterClassId);

  // Quick punch button for roster list
  const handlePunchStudent = (studentId: string, studentName: string, status: 'present' | 'absent_unjustified' | 'absent_justified' | 'late') => {
    
    // Check if record exists for this student on this date
    const existingIdx = attendanceLogs.findIndex(l => l.studentId === studentId && l.date === rosterDate);
    
    if (existingIdx >= 0) {
      // update
      const updated = [...attendanceLogs];
      updated[existingIdx].status = status;
      if (status === 'present') {
        updated[existingIdx].reason = 'Présent';
      }
      setAttendanceLogs(updated);
    } else {
      // create new
      const newRec: StudentAttendanceRecord = {
        id: 'att_' + Date.now() + Math.floor(Math.random()*100),
        studentId,
        studentName,
        classId: rosterClassId,
        date: rosterDate,
        status,
        reason: status === 'present' ? 'Présent' : 'Non spécifié'
      };
      setAttendanceLogs(prev => [newRec, ...prev]);
    }
  };

  const handleDeleteLog = (id: string) => {
    if (window.confirm("Voulez-vous effacer cet incident d'assiduité ?")) {
      setAttendanceLogs(prev => prev.filter(l => l.id !== id));
    }
  };

  const handleUpdateReason = (logId: string, reasonText: string) => {
    setAttendanceLogs(prev => prev.map(l => {
      if (l.id === logId) {
        return { ...l, reason: reasonText };
      }
      return l;
    }));
  };

  const handleApproveJustificatif = (logId: string) => {
    setAttendanceLogs(prev => prev.map(l => {
      if (l.id === logId) {
        return { ...l, status: 'absent_justified', reason: l.reason.includes('Justifié') ? l.reason : 'Justifié : ' + l.reason };
      }
      return l;
    }));
  };

  const handleSetTeacherAttendanceLocal = (teacherId: string, status: 'present' | 'late' | 'absent') => {
    const updated = { ...teacherDailyAttendance, [teacherId]: status };
    setTeacherDailyAttendance(updated);
  };

  return (
    <div className="space-y-6">
      
      {/* Tab bar header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-light">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="h-5.5 w-5.5 text-indigo-650" />
            <span>Gestion des Présences & Incident d'Assiduité</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Faites l'appel quotidien pour les élèves de chaque classe, justifiez les incidents médicaux et suivez le pointage du corps enseignant.
          </p>
        </div>

        {/* Sub navs */}
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveSubTab('roster')}
            className={`cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'roster' ? 'bg-[#0b4998] text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <Users className="h-4 w-4" />
            Faire l'Appel (Roster)
          </button>
          <button 
            onClick={() => setActiveSubTab('logs')}
            className={`cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'logs' ? 'bg-[#0b4998] text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <ShieldAlert className="h-4 w-4" />
            Registre d'Assiduité
          </button>
          <button 
            onClick={() => setActiveSubTab('teachers_att')}
            className={`cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'teachers_att' ? 'bg-[#0b4998] text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <Activity className="h-4 w-4" />
            Pointage Professeurs
          </button>
        </div>
      </div>

      {/* RENDER VIEW: DAILY ROSTER APPEL */}
      {activeSubTab === 'roster' && (
        <div className="space-y-4">
          
          {/* Controls box */}
          <div className="bg-white border border-slate-200 p-4 rounded-3xl shadow-xs flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 block uppercase">Classe de l'Appel</label>
                <select 
                  value={rosterClassId}
                  onChange={(e) => setRosterClassId(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-1.5 text-xs font-bold text-slate-705 focus:outline-none"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 block uppercase">Date du pointage</label>
                <input 
                  type="date" 
                  value={rosterDate} 
                  onChange={(e) => setRosterDate(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-1 text-xs font-bold text-slate-705 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-2.5 bg-[#ee7b11]/10 border border-[#f3aa1c]/25 rounded-2xl text-[10.5px] text-slate-700 font-semibold max-w-sm">
              📢 <span>Double-cliquez sur le statut de l'élève pour valider son enregistrement dans le journal général de l'établissement.</span>
            </div>
          </div>

          {/* Roster students grid */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
            <h3 className="text-xs font-black uppercase text-[#0b4998] tracking-widest pb-3 border-b border-indigo-50 mb-4">
              Feuille d'Appel Officielle : {rosterClassId} — {new Date(rosterDate).toLocaleDateString('fr-FR', { dateStyle: 'long' })}
            </h3>

            <div className="space-y-3">
              {activeRosterStudents.length > 0 ? (
                activeRosterStudents.map(std => {
                  const savedEntry = attendanceLogs.find(l => l.studentId === std.id && l.date === rosterDate);
                  const currentStatus = savedEntry ? savedEntry.status : 'present';

                  return (
                    <div key={std.id} className="p-3 bg-slate-50 border border-slate-150 rounded-2xl flex items-center justify-between hover:bg-slate-100/50 transition">
                      
                      <div>
                        <span className="font-mono text-[9px] font-bold text-slate-400">{std.matricule}</span>
                        <h4 className="text-xs font-black text-slate-900 uppercase leading-none">{std.lastName} {std.firstName}</h4>
                        <span className="text-[10px] text-slate-550 font-bold block mt-0.5">
                          Statut : {currentStatus === 'present' ? '✅ Présent' : currentStatus === 'late' ? '⏳ Retard' : '❌ Absent'} 
                          {savedEntry?.reason && savedEntry.reason !== 'Présent' && ` (${savedEntry.reason})`}
                        </span>
                      </div>

                      {/* Status selectors button triggers */}
                      <div className="flex gap-1">
                        <button
                          onClick={() => handlePunchStudent(std.id, `${std.firstName} ${std.lastName}`, 'present')}
                          className={`cursor-pointer px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition ${
                            currentStatus === 'present' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white border border-slate-250 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          Présent
                        </button>
                        <button
                          onClick={() => handlePunchStudent(std.id, `${std.firstName} ${std.lastName}`, 'late')}
                          className={`cursor-pointer px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition ${
                            currentStatus === 'late' ? 'bg-amber-600 text-white shadow-xs' : 'bg-white border border-slate-250 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          Retard
                        </button>
                        <button
                          onClick={() => handlePunchStudent(std.id, `${std.firstName} ${std.lastName}`, 'absent_unjustified')}
                          className={`cursor-pointer px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition ${
                            currentStatus.includes('absent') ? 'bg-red-650 text-white shadow-xs' : 'bg-white border border-slate-250 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          Absent
                        </button>
                      </div>

                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-slate-400 font-semibold italic">
                  Aucun élève enregistré dans cette classe scolaire. Veuillez passer par le module ÉLÈVES pour inscrire des effectifs.
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* RENDER VIEW: ABSENCES LOGS & JUSTIFICATION TABLE */}
      {activeSubTab === 'logs' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4 overflow-hidden">
          <h3 className="text-sm font-black text-[#0b4998] uppercase pb-2 border-b border-indigo-50">Registre Centralisé d'Assiduité des Élèves</h3>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed">
            Consultez la liste chronologique des absences et des retards enregistrés par les surveillants généraux. Saisissez ici les justificatifs médicaux fournis par les tuteurs légaux.
          </p>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-450 border-b border-slate-200 uppercase font-black">
                  <th className="p-3">Date</th>
                  <th className="p-3">Élève</th>
                  <th className="p-3">Classe</th>
                  <th className="p-3 text-center">Type Incident</th>
                  <th className="p-3">Motif / Justification</th>
                  <th className="p-3">Action Administrative</th>
                  <th className="p-3 text-right">Suppr.</th>
                </tr>
              </thead>
              <tbody>
                {attendanceLogs.length > 0 ? (
                  attendanceLogs.map(log => (
                    <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-100/35 transition text-slate-750 font-medium">
                      <td className="p-3 font-mono font-bold">{log.date}</td>
                      <td className="p-3 font-black text-slate-900">{log.studentName}</td>
                      <td className="p-3 font-extrabold">{log.classId}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          log.status === 'present' ? 'bg-emerald-100 text-emerald-800' :
                          log.status === 'late' ? 'bg-amber-100 text-amber-800' :
                          log.status === 'absent_justified' ? 'bg-indigo-150 text-indigo-800' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {log.status === 'present' ? 'Présent' : log.status === 'late' ? 'Retard' : log.status === 'absent_justified' ? 'Justifié' : 'Non Justifié'}
                        </span>
                      </td>
                      <td className="p-3">
                        <input 
                          type="text" 
                          value={log.reason} 
                          onChange={(e) => handleUpdateReason(log.id, e.target.value)}
                          placeholder="Écrire justificat..."
                          className="w-full bg-slate-50 border border-slate-150 p-1.5 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white"
                        />
                      </td>
                      <td className="p-3">
                        {log.status === 'absent_unjustified' ? (
                          <button
                            onClick={() => handleApproveJustificatif(log.id)}
                            className="cursor-pointer px-2.5 py-1 bg-[#0b4998] hover:bg-[#093d80] text-white text-[9.5px] font-bold rounded-lg transition"
                          >
                            Approuver Justificatif
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-750 font-bold flex items-center gap-1">
                            <Check className="h-3.5 w-3.5" /> Classement Conforme
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button 
                          onClick={() => handleDeleteLog(log.id)}
                          className="cursor-pointer p-1 text-slate-350 hover:text-red-500 rounded"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 font-semibold italic">
                      Aucun incident d'assiduité recensé ce jour. Tout le monde est déclaré présent d'office !
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RENDER VIEW: TEACHERS ATTENDANCE */}
      {activeSubTab === 'teachers_att' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-black text-[#ee7b11] uppercase pb-2 border-b border-indigo-50">Pointage Central du Corps Enseignant</h3>
          <p className="text-xs text-slate-500 font-medium">
            Ce journal fait écho en temps réel aux données de pointage de la section éducative. Les surveillants généraux peuvent pointer et valider les prises de cours.
          </p>

          <div className="space-y-3">
            {teachers.map(t => {
              const curPunch = teacherDailyAttendance[t.id] || 'present';
              return (
                <div key={t.id} className="p-3 bg-slate-50 border border-slate-150 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="p-1 px-2.5 rounded-lg bg-[#0b4998]/10 text-[#0b4998] font-bold text-xs">Prof</span>
                    <div>
                      <span className="text-xs font-black text-slate-900 block">{t.name}</span>
                      <span className="text-[10px] text-slate-400 font-bold block">Qualifié : {t.subjects.length} disciplines</span>
                    </div>
                  </div>

                  <div className="flex gap-1.5">
                    {['present', 'late', 'absent'].map(st => (
                      <button
                        key={st}
                        onClick={() => handleSetTeacherAttendanceLocal(t.id, st as any)}
                        className={`cursor-pointer px-3 py-1 rounded-xl text-[10px] font-black uppercase transition ${
                          curPunch === st 
                            ? st === 'present' ? 'bg-emerald-600 text-white' : st === 'late' ? 'bg-amber-600 text-white' : 'bg-red-650 text-white'
                            : 'bg-white text-slate-550 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {st === 'present' ? 'Prévu' : st === 'late' ? 'En Retard' : 'Manqué'}
                      </button>
                    ))}
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
