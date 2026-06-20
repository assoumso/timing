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
  PieChart 
} from 'lucide-react';
import { ClassItem, SubjectItem } from '../types';

interface EvaluationModuleProps {
  classes: ClassItem[];
  subjects: SubjectItem[];
  schoolName: string;
  schoolSubName: string;
  schoolMotto: string;
  academicYear: string;
  schoolDirector: string;
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
}

export default function EvaluationModule({
  classes,
  subjects,
  schoolName,
  schoolSubName,
  schoolMotto,
  academicYear,
  schoolDirector
}: EvaluationModuleProps) {
  
  // Persistent marks base
  const [marks, setMarks] = useState<StudentMark[]>(() => {
    const saved = localStorage.getItem('erp_student_marks');
    if (saved) return JSON.parse(saved);
    // dense realistic pre-populated data for computation demos
    return [
      // Koffi Yao (std_1) - 6A: Math 15, French 14, PC 16
      { id: 'mk_1', studentId: 'std_1', classId: '6A', subjectId: 'math', examName: 'Devoir Surveillé 1', weight: 1, score: 14.5, recordedAt: '2026-06-01' },
      { id: 'mk_2', studentId: 'std_1', classId: '6A', subjectId: 'math', examName: 'Examen Trimestre', weight: 2, score: 16.0, recordedAt: '2026-06-15' },
      { id: 'mk_3', studentId: 'std_1', classId: '6A', subjectId: 'fr', examName: 'Composition Française', weight: 2, score: 13.5, recordedAt: '2026-06-12' },
      { id: 'mk_4', studentId: 'std_1', classId: '6A', subjectId: 'pc', examName: 'Devoir Labo 1', weight: 1, score: 17.0, recordedAt: '2026-06-08' },

      // Diomandé Aminata (std_2) - 6B: Math 11, French 16
      { id: 'mk_5', studentId: 'std_2', classId: '6B', subjectId: 'math', examName: 'Examen Trimestre', weight: 2, score: 11.0, recordedAt: '2026-06-15' },
      { id: 'mk_6', studentId: 'std_2', classId: '6B', subjectId: 'fr', examName: 'Composition Française', weight: 2, score: 16.5, recordedAt: '2026-06-12' },

      // Kouassi Charles (std_3) - 3A: Math 18, French 11, PC 15
      { id: 'mk_7', studentId: 'std_3', classId: '3A', subjectId: 'math', examName: 'Examen National blanc', weight: 3, score: 18.5, recordedAt: '2026-06-14' },
      { id: 'mk_8', studentId: 'std_3', classId: '3A', subjectId: 'fr', examName: 'Devoir Surveillé', weight: 1, score: 11.0, recordedAt: '2026-06-12' },
      { id: 'mk_9', studentId: 'std_3', classId: '3A', subjectId: 'pc', examName: 'Devoir Labo 1', weight: 1, score: 15.5, recordedAt: '2026-06-05' },

      // Gomez Marie-Chantal (std_5) - 3A: Math 13, French 17, PC 14
      { id: 'mk_10', studentId: 'std_5', classId: '3A', subjectId: 'math', examName: 'Examen National blanc', weight: 3, score: 13.0, recordedAt: '2026-06-14' },
      { id: 'mk_11', studentId: 'std_5', classId: '3A', subjectId: 'fr', examName: 'Devoir Surveillé', weight: 1, score: 17.5, recordedAt: '2026-06-12' },
      { id: 'mk_12', studentId: 'std_5', classId: '3A', subjectId: 'pc', examName: 'Devoir Labo 1', weight: 1, score: 14.0, recordedAt: '2026-06-05' }
    ];
  });

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

  // Save changes
  useEffect(() => {
    localStorage.setItem('erp_student_marks', JSON.stringify(marks));
  }, [marks]);

  // View state
  const [activeSubTab, setActiveSubTab] = useState<'input' | 'reports' | 'statistics'>('input');
  
  // Selection filtering for computing bulletins
  const [bulletinClassId, setBulletinClassId] = useState('6A');
  const [selectedStudentBulletin, setSelectedStudentBulletin] = useState<string>('std_1');

  // Input forms state
  const [inputForm, setInputForm] = useState({
    studentId: 'std_1',
    subjectId: 'math',
    examName: 'Interrogation Écrite n°1',
    weight: 1,
    score: 12.0
  });

  // Dynamic filter lists
  const currentClassStudents = studentList.filter(s => s.classId === bulletinClassId);

  // Submit and log marks
  const handleRecordMark = (e: React.FormEvent) => {
    e.preventDefault();
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
    if (window.confirm("Voulez-vous supprimer définitivement cette note ?")) {
      setMarks(prev => prev.filter(m => m.id !== id));
    }
  };

  // Math engines to calculate grade bulletins
  const getStudentGradesReport = (studentId: string) => {
    const studentMarks = marks.filter(m => m.studentId === studentId);
    
    // For each subject, compute weighted average
    const reportList = subjects.map(sub => {
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
        // Here we just use coefficient 2 as a baseline or resolve from the administration coefficients if required, let's keep it simple: equal weight coefficient 2
        overallNumerator += r.average * 2;
        overallDenominator += 2;
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

        <div className="flex gap-2">
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
                      <button 
                        onClick={() => handleDeleteMark(m.id)}
                        className="opacity-0 group-hover:opacity-100 cursor-pointer p-1 text-slate-350 hover:text-red-500 rounded-md transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

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
              className="cursor-pointer px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center gap-1 transition shadow-sm"
            >
              <Printer className="h-3.5 w-3.5" />
              Imprimer le Bulletin Trimestriel
            </button>
          </div>

          {/* HTML formal printable bulletin sheet styled identically to school standards */}
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
                    const matchedCoef = 2; // default
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
                <span>Total des Coefficients : **{activeStudentReport.subjectsData.length * 2}**</span> <br />
                <span>Total des Points : **{(activeStudentReport.finalWeightedAverage * activeStudentReport.subjectsData.length * 2).toFixed(2)} / {(activeStudentReport.subjectsData.length * 2 * 20)}**</span>
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
