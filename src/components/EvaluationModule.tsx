import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Plus, 
  Trash2, 
  Check, 
  TrendingUp, 
  Target, 
  Printer, 
  GraduationCap, 
  UserCheck, 
  PieChart,
  Layers,
  FileText 
} from 'lucide-react';
import { ClassItem, SubjectItem, TeacherItem, UserAccount } from '../types';

interface EvaluationModuleProps {
  classes: ClassItem[];
  subjects: SubjectItem[];
  teachers: TeacherItem[];
  schoolName: string;
  schoolSubName: string;
  schoolMotto: string;
  academicYear: string;
  schoolDirector: string;
  marks: StudentMark[];
  setMarks: React.Dispatch<React.SetStateAction<StudentMark[]>>;
  currentUser: UserAccount | null;
}

interface StudentMark {
  id: string;
  studentId: string; // matches Student id std_1, etc.
  classId: string;
  subjectId: string;
  examName: string; // Dev 1, Examen, etc.
  weight: number; // coefficient of this exam
  score: number; // 0 to 20
  recordedAt: string;
  isValidatedByTeacher?: boolean;
}

export default function EvaluationModule({
  classes,
  subjects,
  teachers,
  schoolName,
  schoolSubName,
  schoolMotto,
  academicYear,
  schoolDirector,
  marks,
  setMarks,
  currentUser
}: EvaluationModuleProps) {
  
  // Resolve students list dynamically from localStorage
  const [studentList, setStudentList] = useState<any[]>([]);
  useEffect(() => {
    const saved = localStorage.getItem('erp_student_records');
    if (saved) {
      setStudentList(JSON.parse(saved));
    } else {
      // safe fallback congruent with StudentModule
      setStudentList([
        { id: 'std_1', firstName: 'Koffi', lastName: 'Yao Anderson', gender: 'M', classId: '6A', tutorName: 'Koffi Blaise', status: 'Inscrit', matricule: 'M-2025-4102', city: 'Abidjan' },
        { id: 'std_2', firstName: 'Diomandé', lastName: 'Aminata', gender: 'F', classId: '6B', tutorName: 'Diomandé Lanciné', status: 'Réinscrit', matricule: 'M-2024-1185', city: 'Abidjan' },
        { id: 'std_3', firstName: 'Kouassi', lastName: 'Koffi Charles', gender: 'M', classId: '3A', tutorName: 'Mme Kouassi Hortense', status: 'Inscrit', matricule: 'M-2025-9981', city: 'Bingerville' },
        { id: 'std_4', firstName: 'Sylla', lastName: 'Ibrahim Karim', gender: 'M', classId: '3B', tutorName: 'Sylla Fatoumata', status: 'Réinscrit', matricule: 'M-2023-0056', city: 'Plateau' },
        { id: 'std_5', firstName: 'Gomez', lastName: 'Marie-Chantal Enola', gender: 'F', classId: '3A', tutorName: 'Gomez Robert (Ambass.)', status: 'Inscrit', matricule: 'M-2025-0103', city: 'Abidjan' }
      ]);
    }
  }, [marks]); // reload if marks list changed or during render

  // View state
  const [activeSubTab, setActiveSubTab] = useState<'input' | 'reports' | 'statistics' | 'natte' | 'pv_validation'>('input');
  
  // Selection filtering for computing bulletins
  const [bulletinClassId, setBulletinClassId] = useState('6A');
  const [selectedStudentBulletin, setSelectedStudentBulletin] = useState<string>('std_1');

  // Validated PVs per class list state (saves to localstorage)
  const [validatedPVs, setValidatedPVs] = useState<string[]>(() => {
    const saved = localStorage.getItem('barakat_validated_pvs');
    if (saved) return JSON.parse(saved);
    return [];
  });

  useEffect(() => {
    localStorage.setItem('barakat_validated_pvs', JSON.stringify(validatedPVs));
  }, [validatedPVs]);

  // Input forms state
  const [inputForm, setInputForm] = useState({
    studentId: 'std_1',
    subjectId: 'math',
    examName: 'Interrogation Écrite n°1',
    weight: 1,
    score: 12.0
  });

  const isAuthorizedToEdit = 
    currentUser?.role === 'super_admin' || 
    currentUser?.role === 'director' || 
    currentUser?.allowedTabs?.includes('saisie_moyennes');

  const currentClassStudents = studentList.filter(s => s.classId === bulletinClassId);

  // Submit and log marks
  const handleRecordMark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthorizedToEdit) {
      alert("Accès refusé: Seuls le Directeur, le Correspondant Fichier (Informaticien) ou les utilisateurs autorisés peuvent saisir des notes.");
      return;
    }

    const resolvedStudent = studentList.find(s => s.id === inputForm.studentId);
    if (!resolvedStudent) {
      alert("Élève invalide ou introuvable !");
      return;
    }

    const nScore = parseFloat(String(inputForm.score));
    if (isNaN(nScore) || nScore < 0 || nScore > 20) {
      alert("La note saisie doit être comprise strictement entre 0.0 et 20.0 !");
      return;
    }

    const newMark: StudentMark = {
      id: 'mk_' + Date.now(),
      studentId: inputForm.studentId,
      classId: resolvedStudent.classId,
      subjectId: inputForm.subjectId,
      examName: inputForm.examName.trim() || 'Devoir de classe',
      weight: parseInt(String(inputForm.weight)) || 1,
      score: nScore,
      recordedAt: new Date().toISOString().split('T')[0]
    };

    setMarks(prev => [newMark, ...prev]);
    alert(`Note de ${nScore}/20 enregistrée avec succès pour ${resolvedStudent.firstName} ${resolvedStudent.lastName} !`);
    
    setInputForm(prev => ({
      ...prev,
      score: 10.0
    }));
  };

  const handleDeleteMark = (id: string) => {
    if (!isAuthorizedToEdit) {
      alert("Accès refusé: Seuls le Directeur, le Correspondant Fichier (Informaticien) ou les utilisateurs autorisés peuvent supprimer des notes.");
      return;
    }
    if (window.confirm("Voulez-vous supprimer définitivement cette note ?")) {
      setMarks(prev => prev.filter(m => m.id !== id));
    }
  };

  // Math engines to calculate grade bulletins
  const getStudentGradesReport = (studentId: string) => {
    const student = studentList.find(s => s.id === studentId);
    const studentMarks = marks.filter(m => m.studentId === studentId);
    
    // For each subject, compute weighted average
    const reportList = subjects
      .filter(sub => {
        if (!sub.isLV2) return true;
        if (!student?.lv2 || student.lv2 === 'Aucun') return false;
        return sub.name.toLowerCase().includes(student.lv2.toLowerCase());
      })
      .map(sub => {
        const subMarks = studentMarks.filter(m => m.subjectId === sub.id);
        let totalPoints = 0;
        let totalCoefficients = 0;

        subMarks.forEach(m => {
          totalPoints += m.score * m.weight;
          totalCoefficients += m.weight;
        });

        const average = totalCoefficients > 0 ? parseFloat((totalPoints / totalCoefficients).toFixed(2)) : null;
        return {
          subject: sub,
          marksList: subMarks,
          average,
          totalCoefficients
        };
      });

    // Compute overall weighted average (averages of each valid subject)
    let overallNumerator = 0;
    let overallDenominator = 0;

    reportList.forEach(r => {
      if (r.average !== null) {
        const coef = r.subject.coefficient || 1;
        overallNumerator += r.average * coef;
        overallDenominator += coef;
      }
    });

    const finalWeightedAverage = overallDenominator > 0 ? parseFloat((overallNumerator / overallDenominator).toFixed(2)) : 0;
    
    return {
      subjectsData: reportList,
      finalWeightedAverage
    };
  };

  // Math engine to rank everyone in a specific class
  const getClassRankingList = (classId: string) => {
    const classStds = studentList.filter(s => s.classId === classId);
    
    const calculatedList = classStds.map(std => {
      const rep = getStudentGradesReport(std.id);
      return {
        student: std,
        overallAverage: rep.finalWeightedAverage,
        hasGrades: rep.subjectsData.some(s => s.average !== null)
      };
    });

    // Sort descending by average
    calculatedList.sort((a, b) => b.overallAverage - a.overallAverage);
    
    return calculatedList.map((item, idx) => ({
      ...item,
      rank: idx + 1
    }));
  };

  const rankings = getClassRankingList(bulletinClassId);
  const activeStudentRankObj = rankings.find(r => r.student.id === selectedStudentBulletin);
  const activeStudentReport = getStudentGradesReport(selectedStudentBulletin);

  return (
    <div className="space-y-6">
      
      {/* Module Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-light">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Award className="h-5.5 w-5.5 text-indigo-650" />
            <span>Évaluations, Bulletins & Relevés de Notes</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Saisissez les notes continues trimestrielles, calculez automatiquement les classements, moyennes de classe et éditez de somptueux bulletins de réussite.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setActiveSubTab('input')}
            className={`cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'input' ? 'bg-[#0b4998] text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <Target className="h-4 w-4" />
            Enregistrement des Notes
          </button>
          <button 
            onClick={() => setActiveSubTab('natte')}
            className={`cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'natte' ? 'bg-[#0b4998] text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <Layers className="h-4 w-4" />
            Natte de Notes
          </button>
          <button 
            onClick={() => setActiveSubTab('pv_validation')}
            className={`cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'pv_validation' ? 'bg-[#0b4998] text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <FileText className="h-4 w-4" />
            Procès-Verbaux & Validation
          </button>
          <button 
            onClick={() => setActiveSubTab('reports')}
            className={`cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'reports' ? 'bg-[#0b4998] text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <Printer className="h-4 w-4" />
            Éditeur de Bulletins
          </button>
          <button 
            onClick={() => setActiveSubTab('statistics')}
            className={`cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'statistics' ? 'bg-[#0b4998] text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <PieChart className="h-4 w-4" />
            Médailles & Statistiques
          </button>
        </div>
      </div>

      {/* RENDER VIEW: NOTES INPUT FORM & RECENT FEED */}
      {activeSubTab === 'input' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Form left */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase text-[#ee7b11] tracking-widest flex items-center gap-1.5">
              <span>Saisir une Note d'Évaluation</span>
            </h3>

            {!isAuthorizedToEdit ? (
              <div className="bg-amber-50/80 border border-amber-200 text-amber-800 p-5 rounded-2xl flex gap-3 text-xs leading-relaxed">
                <span className="text-lg mt-0.5 shrink-0">🔒</span>
                <div>
                  <span className="font-extrabold text-amber-900 block mb-1">Accès Restreint</span>
                  Vous ne disposez pas des permissions requises pour enregistrer de nouvelles notes ou modifier le registre. Seuls le Directeur, le Correspondant Fichier ou les utilisateurs autorisés peuvent le faire.
                </div>
              </div>
            ) : (
              <form onSubmit={handleRecordMark} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Sélectionner l'Élève destinataire</label>
                  <select 
                    value={inputForm.studentId}
                    onChange={(e) => setInputForm(prev => ({ ...prev, studentId: e.target.value }))}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                  >
                    {studentList.map(s => {
                      const matchedClass = classes.find(c => c.id === s.classId)?.name || s.classId;
                      return (
                        <option key={s.id} value={s.id}>{s.lastName} {s.firstName} ({matchedClass})</option>
                      );
                    })}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Matière</label>
                    <select 
                      value={inputForm.subjectId}
                      onChange={(e) => setInputForm(prev => ({ ...prev, subjectId: e.target.value }))}
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                    >
                      {subjects.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Coefficient / Poids</label>
                    <select 
                      value={inputForm.weight}
                      onChange={(e) => setInputForm(prev => ({ ...prev, weight: parseInt(e.target.value) }))}
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                    >
                      <option value="1">Coefficient 1</option>
                      <option value="2">Coefficient 2</option>
                      <option value="3">Coefficient 3</option>
                      <option value="5">Coefficient 5</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Type / Intitulé de l'Évaluation</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ex: Devoir de Synthèse Trimestre 3" 
                    value={inputForm.examName}
                    onChange={(e) => setInputForm(prev => ({ ...prev, examName: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white"
                  />
                </div>

                <div className="space-y-1 pb-2">
                  <label className="text-[10px] font-bold text-[#ee7b11] uppercase block">Note de l'élève (Sur 20.0)</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      step="0.25"
                      min="0"
                      max="20"
                      required
                      value={inputForm.score}
                      onChange={(e) => setInputForm(prev => ({ ...prev, score: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-4 py-2 bg-slate-50 border border-[#f3aa1c] rounded-xl text-lg font-black text-[#0b4998] focus:bg-white focus:outline-none"
                    />
                    <span className="text-sm font-black text-slate-400 text-right">/ 20</span>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="cursor-pointer w-full py-2 bg-[#0b4998] hover:bg-[#093d80] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm pt-2"
                >
                  <Plus className="h-4 w-4" />
                  Soumettre au Registre Électronique
                </button>
              </form>
            )}
          </div>

          {/* List recent marks table */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-5 shadow-xs overflow-hidden">
            <h3 className="text-sm font-black text-slate-900 uppercase pb-3 border-b border-indigo-50 mb-4">
              Derniers coefficients & notes enregistrés ({marks.length})
            </h3>

            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {marks.map(m => {
                const std = studentList.find(s => s.id === m.studentId) || { firstName: 'Inconnu', lastName: '' };
                const sub = subjects.find(s => s.id === m.subjectId)?.name || m.subjectId;
                
                return (
                  <div key={m.id} className="p-3 rounded-xl bg-slate-50 border border-slate-150 flex items-center justify-between hover:bg-slate-100/50 transition group">
                    <div>
                      <span className="text-[9px] font-mono text-slate-400 font-bold block">{m.recordedAt} • {sub} (Coef {m.weight})</span>
                      <span className="text-xs font-black text-slate-800 block">{std.lastName} {std.firstName}</span>
                      <span className="text-[10.5px] text-slate-500 font-semibold block italic">"{m.examName}"</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-[#0b4998] bg-white border border-slate-200 px-3 py-1 rounded-xl shadow-inner font-mono">
                        {m.score.toFixed(1)} / 20
                      </span>
                      {isAuthorizedToEdit && (
                        <button 
                          onClick={() => handleDeleteMark(m.id)}
                          className="opacity-0 group-hover:opacity-100 cursor-pointer p-1 text-slate-350 hover:text-red-500 rounded-md transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* RENDER VIEW: NATTE DE NOTES */}
      {activeSubTab === 'natte' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 p-4 rounded-3xl flex flex-wrap gap-3 items-center justify-between shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Natte de Notes (Grille d'Audit des Moyennes)</h3>
              <p className="text-[11px] text-slate-500">Visualisez et vérifiez l'ensemble des moyennes calculées avant la validation du Procès-Verbal de Conseil.</p>
            </div>
            <select
              value={bulletinClassId}
              onChange={(e) => setBulletinClassId(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl p-1.5 text-xs font-bold text-slate-705"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[9.5px]">
                    <th className="p-3">Matricule</th>
                    <th className="p-3">Nom & Prénoms</th>
                    {subjects.map(sub => (
                      <th key={sub.id} className="p-3 text-center border-l border-slate-100 min-w-[90px]" title={sub.name}>
                        {sub.name} <br />
                        <span className="text-[8px] text-slate-450 uppercase font-mono tracking-wider font-semibold">Coef {sub.coefficient || 1}</span>
                      </th>
                    ))}
                    <th className="p-3 text-center bg-indigo-50 border-l border-indigo-100 text-indigo-805">Moy. Générale</th>
                    <th className="p-3 text-center bg-indigo-50 text-indigo-805">Rang</th>
                  </tr>
                </thead>
                <tbody>
                  {currentClassStudents.map(std => {
                    const report = getStudentGradesReport(std.id);
                    const rankObj = rankings.find(r => r.student.id === std.id);
                    
                    return (
                      <tr key={std.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                        <td className="p-3 font-mono font-bold text-[#0b4998]">{std.matricule}</td>
                        <td className="p-3 font-bold text-slate-800">{std.lastName} {std.firstName}</td>
                        {subjects.map(sub => {
                          const subData = report.subjectsData.find(s => s.subject.id === sub.id);
                          
                          if (!subData) {
                            return (
                              <td key={sub.id} className="p-3 text-center text-slate-300 bg-slate-50/40 font-semibold border-l border-slate-100">
                                N/A
                              </td>
                            );
                          }

                          return (
                            <td 
                              key={sub.id} 
                              className={`p-3 text-center font-black border-l border-slate-100 ${
                                subData.average === null ? 'text-slate-400 font-normal italic' : 
                                subData.average >= 10 ? 'text-emerald-700 bg-emerald-50/10' : 'text-red-600 bg-red-50/10'
                              }`}
                            >
                              {subData.average !== null ? subData.average.toFixed(2) : '-'}
                            </td>
                          );
                        })}
                        <td className="p-3 text-center font-black text-indigo-900 bg-indigo-50/30 border-l border-indigo-100 text-xs font-mono">
                          {report.finalWeightedAverage.toFixed(2)}
                        </td>
                        <td className="p-3 text-center font-black text-[#0b4998] bg-indigo-50/30 text-xs font-mono">
                          {rankObj && rankObj.hasGrades ? `${rankObj.rank}e` : '-'}
                        </td>
                      </tr>
                    );
                  })}
                  {currentClassStudents.length === 0 && (
                    <tr>
                      <td colSpan={subjects.length + 4} className="p-8 text-center text-slate-400 font-semibold italic">
                        Aucun élève inscrit dans cette classe.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* RENDER VIEW: PROCES-VERBAUX & VALIDATION */}
      {activeSubTab === 'pv_validation' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 p-5 rounded-3xl flex flex-wrap gap-4 items-center justify-between shadow-xs">
            <div>
              <h3 className="text-base font-bold text-slate-900">Procès-Verbaux de Conseils de Classe</h3>
              <p className="text-xs text-slate-500 font-medium">Consultez les PV de fin de période et validez-les pour rendre les bulletins disponibles.</p>
            </div>
            
            <div className="flex gap-2">
              <select
                value={bulletinClassId}
                onChange={(e) => setBulletinClassId(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-700 focus:outline-none"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {(() => {
            const classItem = classes.find(c => c.id === bulletinClassId);
            const mainTeacher = classItem?.mainTeacherId ? teachers.find(t => t.id === classItem.mainTeacherId) : null;
            const isPVValidated = validatedPVs.includes(bulletinClassId);

            const studentsWithGrades = rankings.filter(r => r.hasGrades);
            const averageSum = studentsWithGrades.reduce((sum, r) => sum + r.overallAverage, 0);
            const classAverage = studentsWithGrades.length > 0 ? parseFloat((averageSum / studentsWithGrades.length).toFixed(2)) : 0;
            const successCount = studentsWithGrades.filter(r => r.overallAverage >= 10).length;
            const successRate = studentsWithGrades.length > 0 ? parseFloat(((successCount / studentsWithGrades.length) * 100).toFixed(1)) : 0;
            const highestAverage = studentsWithGrades.length > 0 ? Math.max(...studentsWithGrades.map(r => r.overallAverage)) : 0;
            const lowestAverage = studentsWithGrades.length > 0 ? Math.min(...studentsWithGrades.map(r => r.overallAverage)) : 0;

            return (
              <div className="space-y-6">
                {/* Status and Action banner */}
                <div className={`p-5 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition shadow-xs ${
                  isPVValidated 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-lg ${isPVValidated ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                      {isPVValidated ? '🛡️' : '⏳'}
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-wide">
                        Statut : {isPVValidated ? 'Validé & Scellé' : 'En attente de validation'}
                      </h4>
                      <p className="text-xs opacity-90 mt-0.5 leading-relaxed">
                        {isPVValidated 
                          ? 'Le PV est validé par la direction. Les bulletins individuels de cette classe sont maintenant disponibles en téléchargement et impression.' 
                          : 'Le PV de conseil de classe doit être validé par la direction scolaire afin de libérer les bulletins individuels.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {isPVValidated ? (
                      <button
                        onClick={() => {
                          if (window.confirm("Voulez-vous ré-ouvrir (dévalider) le PV de cette classe ? Les bulletins seront de nouveau inaccessibles aux parents et aux élèves.")) {
                            setValidatedPVs(prev => prev.filter(id => id !== bulletinClassId));
                          }
                        }}
                        className="cursor-pointer px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
                      >
                        Annuler la validation (Réouvrir)
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setValidatedPVs(prev => [...prev, bulletinClassId]);
                          alert(`Le Procès-Verbal de la classe ${classItem?.name} a été validé et scellé avec succès ! Les bulletins de notes sont désormais disponibles.`);
                        }}
                        className="cursor-pointer px-4 py-2 bg-emerald-605 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5"
                      >
                        <Check className="h-4 w-4" />
                        Valider & Signer le PV
                      </button>
                    )}
                    <button
                      onClick={() => window.print()}
                      className="cursor-pointer px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl transition flex items-center gap-1"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      Imprimer le PV
                    </button>
                  </div>
                </div>

                {/* Formal printable PV Sheet layout */}
                <div id="formal-pv-sheet" className="max-w-3xl mx-auto bg-white border border-slate-350 p-8 shadow-xl font-sans text-slate-800 space-y-6">
                  
                  {/* Header part */}
                  <div className="grid grid-cols-2 pb-3 border-b-2 border-slate-900 text-xs items-center">
                    <div>
                      <h4 className="font-black text-xs text-[#0b4998] uppercase leading-none">{schoolName}</h4>
                      <span className="text-[9px] font-bold text-slate-400 block pb-1 border-b border-dotted max-w-[170px] uppercase leading-none">{schoolSubName}</span>
                      <span className="text-[8.5px] italic text-[#ee7b11] font-semibold block leading-normal mt-0.5">"{schoolMotto}"</span>
                    </div>
                    <div className="text-right space-y-0.5">
                      <span className="font-black text-sm uppercase block">Procès-Verbal de Conseil de Classe</span>
                      <span className="font-semibold text-slate-500">Année Académique : {academicYear}</span>
                    </div>
                  </div>

                  {/* Metadata and Context */}
                  <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 border border-slate-200 rounded-2xl">
                    <div className="space-y-1">
                      <div><span className="font-bold text-slate-500 uppercase text-[9px]">Classe :</span> <strong className="text-slate-800 text-sm">{classItem?.name || bulletinClassId}</strong></div>
                      <div><span className="font-bold text-slate-500 uppercase text-[9px]">Professeur Principal :</span> <strong>{mainTeacher?.name || 'Non Assigné'}</strong></div>
                      <div><span className="font-bold text-slate-500 uppercase text-[9px]">Effectif de la classe :</span> <strong>{currentClassStudents.length} élèves</strong></div>
                    </div>
                    <div className="space-y-1">
                      <div><span className="font-bold text-slate-500 uppercase text-[9px]">Moyenne Générale :</span> <strong>{classAverage.toFixed(2)} / 20</strong></div>
                      <div><span className="font-bold text-slate-500 uppercase text-[9px]">Taux de Réussite :</span> <strong className="text-emerald-700">{successRate}% (Moy &ge; 10/20)</strong></div>
                      <div><span className="font-bold text-slate-500 uppercase text-[9px]">Moyennes Extrêmes :</span> <strong>Min: {lowestAverage.toFixed(2)} | Max: {highestAverage.toFixed(2)}</strong></div>
                    </div>
                  </div>

                  {/* Class Rankings table */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-800 text-white font-bold uppercase text-[9px] tracking-wider">
                          <th className="p-2.5 text-center w-12">Rang</th>
                          <th className="p-2.5">Matricule</th>
                          <th className="p-2.5">Nom & Prénoms</th>
                          <th className="p-2.5 text-center w-24">Moyenne Générale</th>
                          <th className="p-2.5">Décision / Mention du Conseil</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rankings.map((r, idx) => (
                          <tr key={r.student.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                            <td className="p-2 text-center font-black text-slate-700 bg-slate-50/70">{r.hasGrades ? `${r.rank}e` : '-'}</td>
                            <td className="p-2 font-mono text-slate-500">{r.student.matricule}</td>
                            <td className="p-2 font-bold text-slate-800">{r.student.lastName} {r.student.firstName}</td>
                            <td className="p-2 text-center font-black text-[#0b4998] font-mono bg-indigo-50/20">
                              {r.hasGrades ? r.overallAverage.toFixed(2) : 'A.N.'}
                            </td>
                            <td className="p-2">
                              {r.hasGrades ? (
                                <span className={`text-[10px] font-bold ${
                                  r.overallAverage >= 14 ? 'text-emerald-700' :
                                  r.overallAverage >= 10 ? 'text-indigo-700' :
                                  'text-red-600'
                                }`}>
                                  {r.overallAverage >= 14 ? 'Admis(e) avec Félicitations' :
                                   r.overallAverage >= 10 ? 'Admis(e) avec Tableau d\'Honneur' :
                                   'Avertissement de travail / Blâme'}
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic font-semibold">Aucune note enregistrée</span>
                              )}
                            </td>
                          </tr>
                        ))}
                        {rankings.length === 0 && (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-slate-400 font-semibold italic">
                              Aucun élève à classer.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Signatures footer */}
                  <div className="pt-8 grid grid-cols-2 text-xs items-start font-sans">
                    <div className="space-y-1">
                      <span className="font-bold underline uppercase">Le Professeur Principal</span>
                      <div className="h-16 flex items-end">
                        <span className="text-slate-500 font-bold text-[10px]">{mainTeacher?.name || 'Nom du Professeur Principal'}</span>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <span className="font-bold uppercase block underline">Le Directeur des Études</span>
                      <div className="h-16 flex flex-col justify-end items-end">
                        {isPVValidated && (
                          <span className="text-emerald-700 font-black uppercase text-[10.5px] border border-emerald-350 bg-emerald-50 px-2 py-0.5 rounded-lg mb-1 inline-block tracking-widest font-mono">
                            PV VALIDÉ & SIGNÉ
                          </span>
                        )}
                        <span className="font-extrabold text-slate-900 leading-none">{schoolDirector}</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* RENDER VIEW: REPORTS CARD & CLASS BULLETINS */}
      {activeSubTab === 'reports' && (
        <div className="space-y-6">
          
          {/* Bulletin class select */}
          <div className="bg-white border border-slate-200 p-4 rounded-3xl flex flex-wrap gap-3 items-center justify-between shadow-xs">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs font-bold text-slate-550">Éditer Bulletins de la Classe :</span>
              <select 
                value={bulletinClassId}
                onChange={(e) => {
                  setBulletinClassId(e.target.value);
                  const classStds = studentList.filter(s => s.classId === e.target.value);
                  if (classStds.length > 0) setSelectedStudentBulletin(classStds[0].id);
                }}
                className="bg-slate-50 border border-slate-200 rounded-xl p-1.5 text-xs font-bold text-slate-700"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <span className="text-slate-300">|</span>

              <span className="text-xs font-bold text-slate-550">Élève :</span>
              <select 
                value={selectedStudentBulletin}
                onChange={(e) => setSelectedStudentBulletin(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl p-1.5 text-xs font-bold text-slate-700"
              >
                {currentClassStudents.map(s => (
                  <option key={s.id} value={s.id}>{s.lastName} {s.firstName}</option>
                ))}
              </select>
            </div>

            <button 
              onClick={() => window.print()}
              disabled={!validatedPVs.includes(bulletinClassId)}
              className={`cursor-pointer px-4 py-1.5 font-black text-xs rounded-xl flex items-center gap-1 transition shadow-sm ${
                validatedPVs.includes(bulletinClassId)
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-slate-200 text-slate-450 cursor-not-allowed"
              }`}
            >
              <Printer className="h-3.5 w-3.5" />
              Imprimer le Bulletin Trimestriel
            </button>
          </div>

          {!validatedPVs.includes(bulletinClassId) ? (
            <div className="max-w-xl mx-auto bg-amber-50/50 border border-amber-200 p-8 rounded-3xl text-center space-y-4 shadow-sm my-10">
              <div className="h-14 w-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600 text-2xl font-black">
                🔒
              </div>
              <h4 className="text-base font-black text-slate-800">Bulletins Verrouillés</h4>
              <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                Le procès-verbal (PV) de conseil de classe pour la classe <strong>{classes.find(c => c.id === bulletinClassId)?.name || bulletinClassId}</strong> n'a pas encore été validé et signé électroniquement par la Direction Générale.
              </p>
              <p className="text-[11px] text-slate-450">
                Les bulletins ne seront générés, consultables et imprimables qu'après la validation finale des moyennes de cette classe.
              </p>
              <button
                onClick={() => setActiveSubTab('pv_validation')}
                className="cursor-pointer inline-flex items-center gap-1 text-xs font-bold text-[#0b4998] hover:underline bg-transparent border-0"
              >
                Aller au module de validation des Procès-Verbaux &rarr;
              </button>
            </div>
          ) : (
            /* HTML formal printable bulletin sheet styled identically to school standards */
            <div className="max-w-3xl mx-auto bg-white border border-slate-300 p-6 text-slate-900 shadow-xl font-sans min-h-[580px] space-y-5">
            
            {/* Header part */}
            <div className="grid grid-cols-2 pb-3 border-b-2 border-slate-900 text-xs items-center">
              <div>
                <h4 className="font-black text-xs text-[#0b4998] uppercase leading-none">{schoolName}</h4>
                <span className="text-[9px] font-bold text-slate-400 block pb-1 border-b border-dotted max-w-[170px] uppercase leading-none">{schoolSubName}</span>
                <span className="text-[8.5px] italic text-[#ee7b11] font-semibold block leading-normal mt-0.5">"{schoolMotto}"</span>
              </div>
              <div className="text-right space-y-0.5">
                <span className="font-black">BULLETIN DE NOTES DU 1ER TRIMESTRE</span> <br />
                <span className="font-semibold text-slate-500">Année Académique : **{academicYear}**</span>
              </div>
            </div>

            {/* Student metadata box */}
            {activeStudentRankObj ? (
              <div className="p-3 bg-slate-50 border border-slate-200 grid grid-cols-2 md:grid-cols-3 gap-3 rounded-xl text-xs">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Élève</span>
                  <span className="block font-black text-slate-900 uppercase">
                    {activeStudentRankObj.student.lastName} {activeStudentRankObj.student.firstName}
                  </span>
                  <span className="block text-[10px] text-slate-500 font-semibold">Matricule : {activeStudentRankObj.student.matricule}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Classe & Effectif</span>
                  <span className="block font-black text-[#ee7b11]">{bulletinClassId} • {currentClassStudents.length} élèves</span>
                  <span className="block text-[10px] text-slate-500 font-semibold">Régime : {activeStudentRankObj.student.status}</span>
                </div>
                <div className="text-left md:text-right">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Classement Établi</span>
                  <span className="block text-sm font-black text-[#0b4998]">
                    {activeStudentRankObj.hasGrades ? `${activeStudentRankObj.rank}e` : 'Non classé(e)'}
                  </span>
                  <span className="block text-[10px] text-emerald-700 font-bold">Moyenne Générale : {activeStudentRankObj.overallAverage.toFixed(2)} / 20</span>
                </div>
              </div>
            ) : (
              <span className="text-slate-400 font-semibold">Aucun élève trouvé pour cette classe.</span>
            )}

            {/* Main grades breakdown table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-550 text-white font-black uppercase text-[10px]">
                    <th className="p-2.5">Discipline / Enseignement</th>
                    <th className="p-2.5 text-center">Coef.</th>
                    <th className="p-2.5 text-center">Moyenne / 20</th>
                    <th className="p-2.5 text-center bg-slate-650">Points Pondérés</th>
                    <th className="p-2.5 text-center">Notes de Détail</th>
                    <th className="p-2.5">Appréciations & Visa Professeur</th>
                  </tr>
                </thead>
                <tbody>
                  {activeStudentReport.subjectsData.map(r => {
                    const matchedCoef = r.subject.coefficient || 1;
                    const scorePoints = r.average !== null ? (r.average * matchedCoef).toFixed(2) : '-';
                    
                    return (
                      <tr key={r.subject.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                        <td className="p-2.5 font-bold text-slate-800">{r.subject.name}</td>
                        <td className="p-2.5 text-center font-bold text-slate-400">{matchedCoef}</td>
                        <td className="p-2.5 text-center font-black text-[#0b4998] font-mono bg-indigo-50/40">
                          {r.average !== null ? r.average.toFixed(2) : 'A.N.'}
                        </td>
                        <td className="p-2.5 text-center font-black text-slate-900 font-mono">
                          {scorePoints}
                        </td>
                        <td className="p-2.5 text-center text-[10px] font-mono text-slate-400">
                          {r.marksList.map(mk => mk.score.toFixed(1)).join(', ') || 'Néante'}
                        </td>
                        <td className="p-2.5">
                          <span className="text-[10px] italic font-semibold text-slate-600">
                            {r.average === null ? "Séance d'interrogation requise." :
                             r.average >= 14 ? "Excellent travail. Travail très sérieux." :
                             r.average >= 10 ? "En progrès. Assiduité correcte." :
                             "Insuffisant. Doit redoubler d'efforts."}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Quick aggregate results rows summary */}
            <div className="grid grid-cols-2 border border-slate-200 rounded-xl p-3 text-xs gap-4 font-semibold text-slate-750">
              <div className="space-y-1">
                <span>Total des Coefficients : **{activeStudentReport.subjectsData.reduce((acc, curr) => acc + (curr.average !== null ? (curr.subject.coefficient || 1) : 0), 0)}**</span> <br />
                <span>Total des Points : **{activeStudentReport.subjectsData.reduce((acc, curr) => acc + (curr.average !== null ? curr.average * (curr.subject.coefficient || 1) : 0), 0).toFixed(2)} / {activeStudentReport.subjectsData.reduce((acc, curr) => acc + (curr.average !== null ? (curr.subject.coefficient || 1) : 0), 0) * 20}**</span>
              </div>
              <div className="text-right space-y-1">
                <span className="text-sm font-black text-[#0b4998]">Moyenne du Premier Trimestre : {activeStudentReport.finalWeightedAverage.toFixed(2)} / 20</span> <br />
                <span className="text-[11px] font-bold text-emerald-800 block uppercase">Mention : {
                  activeStudentReport.finalWeightedAverage >= 14 ? 'Félicitations du Conseil' :
                  activeStudentReport.finalWeightedAverage >= 10 ? 'Tableau d\'Honneur' :
                  'Avertissement de travail'
                }</span>
              </div>
            </div>

            {/* Signatures administrative footer */}
            <div className="pt-6 grid grid-cols-2 text-xs items-start font-sans">
              <div className="space-y-1">
                <span className="font-bold underline uppercase">Visa des Parents d'élèves</span>
                <span className="block text-[10px] text-slate-400 italic font-medium pt-8">Signature attendue</span>
              </div>
              <div className="text-right space-y-1">
                <span className="font-bold uppercase block underline">Le Directeur des Études</span>
                <span className="font-extrabold text-slate-900 block pt-1">{schoolDirector}</span>
                <span className="text-[10px] italic block text-slate-450 pt-2 pb-6">Prestation réglementée</span>
                
                {/* Certification stamp */}
                <div className="inline-block border-2 border-emerald-500 rounded p-1 inline-flex items-center gap-1 shadow-xs bg-emerald-50 max-w-[180px]">
                  <span className="text-[8.5px] font-black text-emerald-700 uppercase font-mono tracking-wider flex items-center gap-1 leading-none">
                    <span>👑 CERTIFIÉ AUTHENTIQUE</span>
                  </span>
                </div>
              </div>
            </div>

          </div>
          )}
        </div>
      )}

      {/* RENDER VIEW: MEDALS & STATISTICS */}
      {activeSubTab === 'statistics' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-5">
          <h3 className="text-sm font-black text-[#0b4998] uppercase">Tableau d’Honneur & Médailles</h3>
          <p className="text-xs text-slate-500">
            Aperçu rapide des meilleurs étudiants du premier trimestre de la classe active. Les élèves ayant obtenu une moyenne supérieure à 12/20 reçoivent un tableau d'excellence.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Class ranking leaderboard lists */}
            <div className="space-y-3.5">
              <span className="text-xs font-black uppercase text-slate-400 block tracking-wider">Classement Trimestriel de la classe</span>
              
              <div className="space-y-2">
                {rankings.map(item => (
                  <div key={item.student.id} className="p-3 bg-slate-50 border border-slate-150 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${
                        item.rank === 1 ? 'bg-amber-100 text-amber-700' :
                        item.rank === 2 ? 'bg-slate-205 text-slate-700' :
                        'bg-slate-100 text-slate-450'
                      }`}>
                        {item.rank}
                      </span>
                      <div>
                        <span className="text-xs font-extrabold text-slate-800 block">{item.student.lastName} {item.student.firstName}</span>
                        <span className="text-[10px] text-slate-400 font-bold block">Matricule : {item.student.matricule}</span>
                      </div>
                    </div>

                    <span className="text-xs font-bold text-[#0b4998] font-mono">
                      {item.overallAverage.toFixed(2)} / 20
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick stats distribution panel */}
            <div className="bg-indigo-50 border border-indigo-150 p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#0b4998]">Analyse Statistique de la Cohorte</span>
                <h4 className="text-lg font-black text-slate-905 mt-1">Dispersion des résultats scolaires</h4>
                
                <div className="space-y-4 mt-6">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Moyenne Maximale</span>
                      <span className="font-mono text-[#0b4998]">
                        {rankings.length > 0 ? rankings[0].overallAverage.toFixed(2) : '-'} / 20
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#0b4998] h-full" style={{ width: `${(rankings[0]?.overallAverage || 10) * 5}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Moyenne Médiocre / Minimale</span>
                      <span className="font-mono text-amber-700">
                        {rankings.length > 0 ? rankings[rankings.length - 1].overallAverage.toFixed(2) : '-'} / 20
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#ee7b11] h-full" style={{ width: `${(rankings[rankings.length - 1]?.overallAverage || 10) * 5}%` }} />
                    </div>
                  </div>

                </div>
              </div>

              <div className="pt-4 border-t border-indigo-200 text-[10.5px] text-indigo-950 font-semibold leading-normal">
                📊 Ces métriques aident le Conseil d'Administration de **{schoolName}** à auditer l'efficacité du programme pédagogique par rapport aux attendus nationaux.
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
