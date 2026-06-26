import React, { useState, useEffect } from 'react';
import { 
  Award, 
  BookOpen, 
  GraduationCap, 
  Check, 
  Plus, 
  Trash2, 
  Save, 
  TrendingUp, 
  AlertCircle,
  Clock
} from 'lucide-react';
import { ClassItem, SubjectItem, ScheduleCourse, UserAccount } from '../types';

interface StudentMark {
  id: string;
  studentId: string;
  classId: string;
  subjectId: string;
  examName: string;
  weight: number;
  score: number;
  recordedAt: string;
  isValidatedByTeacher?: boolean;
}

interface TeacherEvaluationSaisieProps {
  teacherId: string;
  classes: ClassItem[];
  subjects: SubjectItem[];
  courses: ScheduleCourse[];
  marks: StudentMark[];
  setMarks: React.Dispatch<React.SetStateAction<StudentMark[]>>;
  currentUser: UserAccount | null;
}

export default function TeacherEvaluationSaisie({
  teacherId,
  classes,
  subjects,
  courses,
  marks,
  setMarks,
  currentUser
}: TeacherEvaluationSaisieProps) {
  // Local list of students resolved from localStorage
  const [studentList, setStudentList] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('erp_student_records');
    if (saved) {
      setStudentList(JSON.parse(saved));
    } else {
      setStudentList([
        { id: 'std_1', firstName: 'Koffi', lastName: 'Yao Anderson', gender: 'M', classId: '6A', tutorName: 'Koffi Blaise', status: 'Inscrit', matricule: 'M-2025-4102', city: 'Abidjan' },
        { id: 'std_2', firstName: 'Diomandé', lastName: 'Aminata', gender: 'F', classId: '6B', tutorName: 'Diomandé Lanciné', status: 'Réinscrit', matricule: 'M-2024-1185', city: 'Abidjan' },
        { id: 'std_3', firstName: 'Kouassi', lastName: 'Koffi Charles', gender: 'M', classId: '3A', tutorName: 'Mme Kouassi Hortense', status: 'Inscrit', matricule: 'M-2025-9981', city: 'Bingerville' },
        { id: 'std_4', firstName: 'Sylla', lastName: 'Ibrahim Karim', gender: 'M', classId: '3B', tutorName: 'Sylla Fatoumata', status: 'Réinscrit', matricule: 'M-2023-0056', city: 'Plateau' },
        { id: 'std_5', firstName: 'Gomez', lastName: 'Marie-Chantal Enola', gender: 'F', classId: '3A', tutorName: 'Gomez Robert (Ambass.)', status: 'Inscrit', matricule: 'M-2025-0103', city: 'Abidjan' }
      ]);
    }
  }, [marks]);

  // Find all unique (classId, subjectId) pairs taught by this teacher
  const teacherAssignments = React.useMemo(() => {
    const assignments: Array<{ classId: string; subjectId: string }> = [];
    courses.forEach(c => {
      if (c.teacherId === teacherId) {
        const alreadyAdded = assignments.some(
          a => a.classId === c.classId && a.subjectId === c.subjectId
        );
        if (!alreadyAdded) {
          assignments.push({ classId: c.classId, subjectId: c.subjectId });
        }
      }
    });
    return assignments;
  }, [courses, teacherId]);

  // Selected assignment
  const [selectedAssignmentIdx, setSelectedAssignmentIdx] = useState<number>(0);
  
  // Reset selected index if assignments list changes and is out of bounds
  useEffect(() => {
    if (selectedAssignmentIdx >= teacherAssignments.length) {
      setSelectedAssignmentIdx(0);
    }
  }, [teacherAssignments, selectedAssignmentIdx]);

  const activeAssignment = teacherAssignments[selectedAssignmentIdx] || null;

  // Form for evaluation details
  const [examName, setExamName] = useState('Interrogation Écrite');
  const [weight, setWeight] = useState(1);
  const [scoresInput, setScoresInput] = useState<Record<string, string>>({});

  // Get students of the active class
  const activeClassStudents = React.useMemo(() => {
    if (!activeAssignment) return [];
    return studentList.filter(s => s.classId === activeAssignment.classId);
  }, [activeAssignment, studentList]);

  // Initialize scores inputs when active class or assignment changes
  useEffect(() => {
    const initialScores: Record<string, string> = {};
    activeClassStudents.forEach(s => {
      initialScores[s.id] = '';
    });
    setScoresInput(initialScores);
  }, [activeClassStudents]);

  // Handle saving marks in batch
  const handleSaveBatchMarks = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssignment) return;

    if (!examName.trim()) {
      alert("Veuillez saisir un intitulé pour l'évaluation.");
      return;
    }

    const newMarksToAdd: StudentMark[] = [];
    let hasValidationError = false;

    // Validate all scores before saving
    for (const student of activeClassStudents) {
      const scoreStr = scoresInput[student.id];
      if (scoreStr.trim() !== '') {
        const scoreNum = parseFloat(scoreStr);
        if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 20) {
          alert(`La note de ${student.lastName} ${student.firstName} (${scoreStr}) n'est pas valide. Elle doit être comprise entre 0.0 et 20.0.`);
          hasValidationError = true;
          break;
        }
        
        newMarksToAdd.push({
          id: 'mk_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
          studentId: student.id,
          classId: activeAssignment.classId,
          subjectId: activeAssignment.subjectId,
          examName: examName.trim(),
          weight: weight,
          score: scoreNum,
          recordedAt: new Date().toISOString().split('T')[0]
        });
      }
    }

    if (hasValidationError) return;

    if (newMarksToAdd.length === 0) {
      alert("Veuillez saisir au moins une note.");
      return;
    }

    setMarks(prev => [...newMarksToAdd, ...prev]);
    alert(`${newMarksToAdd.length} note(s) enregistrée(s) avec succès !`);

    // Reset scores inputs
    const resetScores: Record<string, string> = {};
    activeClassStudents.forEach(s => {
      resetScores[s.id] = '';
    });
    setScoresInput(resetScores);
  };

  // Get past marks for this class & subject
  const pastMarks = React.useMemo(() => {
    if (!activeAssignment) return [];
    return marks.filter(
      m => m.classId === activeAssignment.classId && m.subjectId === activeAssignment.subjectId
    );
  }, [marks, activeAssignment]);

  const handleDeleteMark = (id: string) => {
    const mark = marks.find(m => m.id === id);
    if (mark?.isValidatedByTeacher && currentUser?.role !== 'super_admin' && currentUser?.role !== 'director') {
      alert("Cette note a été validée et approuvée. Seul le Directeur ou l'informaticien peut la modifier ou la supprimer.");
      return;
    }
    if (window.confirm("Voulez-vous supprimer définitivement cette note ?")) {
      setMarks(prev => prev.filter(m => m.id !== id));
    }
  };

  const canEnterGrades = 
    currentUser?.role === 'super_admin' || 
    currentUser?.role === 'director' || 
    currentUser?.allowedTabs?.includes('saisie_moyennes');

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Award className="h-5 w-5 text-[#ee7b11]" />
            <span>Saisie des Notes & Moyennes</span>
          </h3>
          <p className="text-xs text-slate-500">
            Sélectionnez une classe et enregistrez directement les moyennes de vos élèves pour le calcul des bulletins.
          </p>
        </div>

        {/* Assignment selector dropdown */}
        {canEnterGrades && teacherAssignments.length > 0 ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Classe assignée :</span>
            <select
              value={selectedAssignmentIdx}
              onChange={(e) => setSelectedAssignmentIdx(parseInt(e.target.value))}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-800 focus:outline-none"
            >
              {teacherAssignments.map((assign, idx) => {
                const clsObj = classes.find(c => c.id === assign.classId);
                const subObj = subjects.find(s => s.id === assign.subjectId);
                return (
                  <option key={idx} value={idx}>
                    {clsObj?.name || assign.classId} — {subObj?.name || assign.subjectId}
                  </option>
                );
              })}
            </select>
          </div>
        ) : canEnterGrades ? (
          <div className="text-xs font-extrabold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-150">
            ⚠️ Aucun cours assigné sur la grille
          </div>
        ) : null}
      </div>

      {!canEnterGrades ? (
        <div className="bg-amber-50/70 border border-amber-200 text-amber-800 p-6 rounded-2xl flex gap-3 text-xs leading-relaxed max-w-3xl">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold text-amber-900 block mb-1">Saisie des Moyennes Verrouillée</span>
            Votre compte enseignant n'a pas reçu l'autorisation spécifique pour la saisie ou la modification des moyennes par la direction. 
            Veuillez contacter le <strong>Directeur</strong> ou le <strong>Correspondant Fichier (Administrateur)</strong> pour activer ce droit dans la gestion des rôles.
          </div>
        </div>
      ) : activeAssignment ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left panel: Batch Form */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Assessment Metadata header inputs */}
            <form onSubmit={handleSaveBatchMarks} className="space-y-4">
              
              <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Intitulé de l'Évaluation</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Interrogation 2, Devoir 1..."
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#ee7b11]"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Coefficient / Poids</label>
                  <select
                    value={weight}
                    onChange={(e) => setWeight(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-805 focus:outline-none focus:border-[#ee7b11]"
                  >
                    <option value="1">Coefficient 1</option>
                    <option value="2">Coefficient 2</option>
                    <option value="3">Coefficient 3</option>
                    <option value="4">Coefficient 4</option>
                    <option value="5">Coefficient 5</option>
                  </select>
                </div>
              </div>

              {/* Student grading table list */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-inner">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold uppercase text-[10px]">
                      <th className="p-3 w-12 text-center">N°</th>
                      <th className="p-3 w-32">Matricule</th>
                      <th className="p-3">Nom & Prénoms</th>
                      <th className="p-3 w-28 text-center bg-slate-850">Note / 20.0</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeClassStudents.length > 0 ? (
                      activeClassStudents.map((student, idx) => (
                        <tr key={student.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                          <td className="p-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                          <td className="p-3 font-mono font-bold text-slate-700">{student.matricule}</td>
                          <td className="p-3 font-extrabold text-slate-850">{student.lastName} {student.firstName}</td>
                          <td className="p-3 text-center bg-slate-50/50">
                            <input
                              type="number"
                              step="0.25"
                              min="0"
                              max="20"
                              placeholder="Note"
                              value={scoresInput[student.id] || ''}
                              onChange={(e) => setScoresInput(prev => ({ ...prev, [student.id]: e.target.value }))}
                              className="w-20 text-center px-2 py-1 bg-white border border-slate-250 hover:border-slate-350 focus:border-[#ee7b11] rounded-lg text-xs font-black text-[#0b4998] focus:outline-none"
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-slate-400 italic">
                          Aucun élève enregistré dans cette classe.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Action Button */}
              {activeClassStudents.length > 0 && (
                <button
                  type="submit"
                  className="cursor-pointer w-full py-3 bg-[#ee7b11] hover:bg-[#d66f0e] text-white text-xs font-black uppercase tracking-widest rounded-xl transition flex items-center justify-center gap-2 shadow"
                >
                  <Save className="h-4 w-4 text-orange-100" />
                  <span>Enregistrer toutes les notes saisies</span>
                </button>
              )}
            </form>

          </div>

          {/* Right panel: Stats and History list */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Stats panel summary */}
            {pastMarks.length > 0 && (
              <div className="bg-indigo-50/60 border border-indigo-150 rounded-2xl p-4 space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-[#0b4998] flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>Synthèse de cette discipline</span>
                </h4>
                
                {(() => {
                  const scoresList = pastMarks.map(m => m.score);
                  const average = scoresList.reduce((a, b) => a + b, 0) / scoresList.length;
                  const max = Math.max(...scoresList);
                  const min = Math.min(...scoresList);
                  const aboveTen = scoresList.filter(s => s >= 10).length;
                  const percentSuccess = (aboveTen / scoresList.length) * 100;
                  
                  return (
                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
                      <div className="bg-white p-2.5 rounded-xl border border-indigo-100/50">
                        <span className="text-[9px] text-slate-400 block leading-none">Moyenne</span>
                        <span className="text-sm font-black text-[#0b4998] block mt-1">{average.toFixed(2)}/20</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-indigo-100/50">
                        <span className="text-[9px] text-slate-400 block leading-none">Taux Réussite</span>
                        <span className="text-sm font-black text-emerald-600 block mt-1">{percentSuccess.toFixed(0)}%</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-indigo-100/50">
                        <span className="text-[9px] text-slate-400 block leading-none">Note Max</span>
                        <span className="text-sm font-black text-indigo-900 block mt-1">{max.toFixed(1)}/20</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-indigo-100/50">
                        <span className="text-[9px] text-slate-400 block leading-none">Note Min</span>
                        <span className="text-sm font-black text-amber-700 block mt-1">{min.toFixed(1)}/20</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* List of past recorded evaluations */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Notes déjà saisies ({pastMarks.length})</span>
                </h4>
                
                {pastMarks.length > 0 && pastMarks.some(m => !m.isValidatedByTeacher) && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Valider et approuver définitivement toutes les notes saisies pour cette classe ? Une fois validées, vous ne pourrez plus les modifier ni les supprimer.")) {
                        setMarks(prev => prev.map(m => {
                          if (m.classId === activeAssignment.classId && m.subjectId === activeAssignment.subjectId) {
                            return { ...m, isValidatedByTeacher: true };
                          }
                          return m;
                        }));
                      }
                    }}
                    className="cursor-pointer px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition flex items-center justify-center gap-1 shadow-xs border border-emerald-500"
                  >
                    <Check className="h-3 w-3 text-emerald-100" />
                    <span>🔒 Valider & Figer</span>
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {pastMarks.length > 0 ? (
                  pastMarks.map(m => {
                    const std = studentList.find(s => s.id === m.studentId) || { firstName: 'Inconnu', lastName: '' };
                    return (
                      <div key={m.id} className="p-2.5 bg-white border border-slate-150 rounded-xl flex items-center justify-between group">
                        <div className="min-w-0">
                          <span className="text-[10px] font-extrabold text-slate-800 block truncate">{std.lastName} {std.firstName}</span>
                          <span className="text-[8.5px] font-semibold text-slate-400 block">
                            {m.recordedAt} • {m.examName} (Coef {m.weight})
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {m.isValidatedByTeacher && (
                            <span className="text-[8px] font-extrabold text-slate-500 bg-slate-100 border border-slate-200 px-1 py-0.5 rounded" title="Moyenne validée et approuvée">
                              🔒 Fígé
                            </span>
                          )}
                          <span className="text-xs font-black text-[#0b4998] font-mono whitespace-nowrap bg-slate-50 border border-slate-150 px-2 py-0.5 rounded">
                            {m.score.toFixed(1)} / 20
                          </span>

                          {/* Unlock override for Director / Admin */}
                          {m.isValidatedByTeacher && (currentUser?.role === 'super_admin' || currentUser?.role === 'director') && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm("Déverrouiller cette note pour permettre à l'enseignant de la corriger ?")) {
                                  setMarks(prev => prev.map(x => x.id === m.id ? { ...x, isValidatedByTeacher: false } : x));
                                }
                              }}
                              className="text-[8.5px] font-extrabold text-[#0b4998] hover:text-[#ee7b11] whitespace-nowrap bg-slate-50 border border-slate-150 px-1 py-0.5 rounded hover:bg-slate-100"
                              title="Déverrouiller la note"
                            >
                              🔓 Déverr.
                            </button>
                          )}

                          {(!m.isValidatedByTeacher || currentUser?.role === 'super_admin' || currentUser?.role === 'director') && (
                            <button
                              onClick={() => handleDeleteMark(m.id)}
                              className="opacity-0 group-hover:opacity-100 cursor-pointer p-0.5 text-slate-350 hover:text-red-650 rounded transition"
                              title="Supprimer la note"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-[10px] italic text-slate-400 text-center py-4">
                    Aucune note enregistrée pour le moment.
                  </p>
                )}
              </div>
            </div>

          </div>

        </div>
      ) : (
        <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-3xl italic">
          Sélectionnez une classe valide pour commencer la saisie.
        </div>
      )}

    </div>
  );
}
