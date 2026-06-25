import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Printer, 
  Users, 
  GraduationCap, 
  Award, 
  Search, 
  Check, 
  HelpCircle,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { ClassItem, TeacherItem, SubjectItem, ScheduleCourse } from '../types';

interface ReportsCenterProps {
  classes: ClassItem[];
  teachers: TeacherItem[];
  courses: ScheduleCourse[];
  subjects: SubjectItem[];
  schoolName: string;
  schoolSubName: string;
  schoolMotto: string;
  academicYear: string;
}

type ReportType = 
  | 'students_by_class' 
  | 'students_by_level' 
  | 'top_students' 
  | 'teachers_by_class' 
  | 'teachers_by_gender'
  | 'teachers_all'
  | 'students_all';

export default function ReportsCenter({
  classes,
  teachers,
  courses,
  subjects,
  schoolName,
  schoolSubName,
  schoolMotto,
  academicYear
}: ReportsCenterProps) {
  const [activeReport, setActiveReport] = useState<ReportType>('students_by_class');

  // Load students registry from localStorage
  const [students, setStudents] = useState<any[]>([]);
  useEffect(() => {
    const saved = localStorage.getItem('erp_student_records');
    if (saved) {
      setStudents(JSON.parse(saved));
    } else {
      // realistic defaults
      setStudents([
        { id: 'std_1', firstName: 'Koffi', lastName: 'Yao Anderson', gender: 'M', classId: '6A', tutorName: 'Koffi Blaise', tutorPhone: '+225 07 41 85 96 03', status: 'Inscrit', matricule: 'M-2026-4102', city: 'Abidjan' },
        { id: 'std_2', firstName: 'Diomandé', lastName: 'Aminata', gender: 'F', classId: '6B', tutorName: 'Diomandé Lanciné', tutorPhone: '+225 05 52 41 12 74', status: 'Réinscrit', matricule: 'M-2024-1185', city: 'Abidjan' },
        { id: 'std_3', firstName: 'Kouassi', lastName: 'Koffi Charles', gender: 'M', classId: '3A', tutorName: 'Mme Kouassi Hortense', tutorPhone: '+225 07 09 85 12 43', status: 'Inscrit', matricule: 'M-2026-9981', city: 'Bingerville' },
        { id: 'std_4', firstName: 'Sylla', lastName: 'Ibrahim Karim', gender: 'M', classId: '3B', tutorName: 'Sylla Fatoumata', tutorPhone: '+225 01 02 03 04 05', status: 'Réinscrit', matricule: 'M-2023-0056', city: 'Plateau' },
        { id: 'std_5', firstName: 'Gomez', lastName: 'Marie-Chantal Enola', gender: 'F', classId: '3A', tutorName: 'Gomez Robert (Ambass.)', tutorPhone: '+225 07 41 02 85 96', status: 'Inscrit', matricule: 'M-2026-0103', city: 'Abidjan' }
      ]);
    }
  }, []);

  // Load marks from localStorage for academic ranks
  const [marks, setMarks] = useState<any[]>([]);
  useEffect(() => {
    const saved = localStorage.getItem('erp_student_marks');
    if (saved) {
      setMarks(JSON.parse(saved));
    } else {
      setMarks([
        { id: 'mk_1', studentId: 'std_1', classId: '6A', subjectId: 'math', examName: 'Devoir Surveillé 1', weight: 1, score: 14.5 },
        { id: 'mk_2', studentId: 'std_1', classId: '6A', subjectId: 'math', examName: 'Examen Trimestre', weight: 2, score: 16.0 },
        { id: 'mk_3', studentId: 'std_1', classId: '6A', subjectId: 'fr', examName: 'Composition Française', weight: 2, score: 13.5 },
        { id: 'mk_4', studentId: 'std_1', classId: '6A', subjectId: 'pc', examName: 'Devoir Labo 1', weight: 1, score: 17.0 },
        { id: 'mk_5', studentId: 'std_2', classId: '6B', subjectId: 'math', examName: 'Examen Trimestre', weight: 2, score: 11.0 },
        { id: 'mk_6', studentId: 'std_2', classId: '6B', subjectId: 'fr', examName: 'Composition Française', weight: 2, score: 16.5 },
        { id: 'mk_7', studentId: 'std_3', classId: '3A', subjectId: 'math', examName: 'Examen National blanc', weight: 3, score: 18.5 },
        { id: 'mk_8', studentId: 'std_3', classId: '3A', subjectId: 'fr', examName: 'Devoir Surveillé', weight: 1, score: 11.0 },
        { id: 'mk_9', studentId: 'std_3', classId: '3A', subjectId: 'pc', examName: 'Devoir Labo 1', weight: 1, score: 15.5 },
        { id: 'mk_10', studentId: 'std_5', classId: '3A', subjectId: 'math', examName: 'Examen National blanc', weight: 3, score: 13.0 },
        { id: 'mk_11', studentId: 'std_5', classId: '3A', subjectId: 'fr', examName: 'Devoir Surveillé', weight: 1, score: 17.5 },
        { id: 'mk_12', studentId: 'std_5', classId: '3A', subjectId: 'pc', examName: 'Devoir Labo 1', weight: 1, score: 14.0 }
      ]);
    }
  }, []);

  // Filter states
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '6A');
  const [selectedLevel, setSelectedLevel] = useState<string>('6'); // default 6ème

  // Ranks computation
  const getTopStudentsList = () => {
    const studentAverages = students.map(std => {
      const studentMarks = marks.filter(m => m.studentId === std.id);
      let avg = 0;
      if (studentMarks.length > 0) {
        const sumScoreWeight = studentMarks.reduce((acc, m) => acc + (m.score * (m.weight || 1)), 0);
        const sumWeight = studentMarks.reduce((acc, m) => acc + (m.weight || 1), 0);
        avg = sumScoreWeight / sumWeight;
      }
      return {
        ...std,
        average: parseFloat(avg.toFixed(2))
      };
    });

    // Sort by average descending
    return studentAverages.sort((a, b) => b.average - a.average);
  };

  const handlePrint = () => {
    window.print();
  };

  const topStudents = getTopStudentsList();

  // Levels list derived from classes prefix digit or letters
  const levels = ['6', '5', '4', '3', '2', '1', 'T'];
  const getLevelLabel = (lvl: string) => {
    if (lvl === '6') return 'Sixième (6ème)';
    if (lvl === '5') return 'Cinquième (5ème)';
    if (lvl === '4') return 'Quatrième (4ème)';
    if (lvl === '3') return 'Troisième (3ème)';
    if (lvl === '2') return 'Seconde (2nde)';
    if (lvl === '1') return 'Première (1ère)';
    if (lvl === 'T') return 'Terminale (Tle)';
    return lvl;
  };

  return (
    <div className="space-y-6">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 no-print">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="h-5.5 w-5.5 text-indigo-600" />
            <span>Centre des Rapports Scolaires & Listes</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium font-sans">
            Centralisez, prévisualisez et exportez au format A4 tous les rapports réglementaires et listes officielles de l'établissement.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="cursor-pointer px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md shrink-0 border border-slate-700"
        >
          <Printer className="h-4 w-4 text-emerald-400" />
          <span>Lancer l'impression A4</span>
        </button>
      </div>

      {/* Main interface grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side: Report types select menus (no-print) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4 no-print">
          <div>
            <h3 className="text-xs font-black text-slate-450 uppercase tracking-widest block mb-2">Choisir le Type de Rapport</h3>
            <div className="flex flex-col gap-1.5">
              
              <button
                onClick={() => setActiveReport('students_by_class')}
                className={`cursor-pointer px-4 py-3 rounded-xl text-xs font-extrabold text-left transition flex items-center gap-2.5 ${
                  activeReport === 'students_by_class' 
                    ? 'bg-indigo-50 text-indigo-900 border border-indigo-200' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                }`}
              >
                <GraduationCap className="h-4 w-4" />
                <div className="leading-tight">
                  <div className="block font-black">Élèves par classe</div>
                  <span className="text-[10px] text-slate-400 font-medium">Liste de présence & émargement</span>
                </div>
              </button>

              <button
                onClick={() => setActiveReport('students_by_level')}
                className={`cursor-pointer px-4 py-3 rounded-xl text-xs font-extrabold text-left transition flex items-center gap-2.5 ${
                  activeReport === 'students_by_level' 
                    ? 'bg-indigo-50 text-indigo-900 border border-indigo-200' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                }`}
              >
                <Users className="h-4 w-4" />
                <div className="leading-tight">
                  <div className="block font-black">Élèves par niveau</div>
                  <span className="text-[10px] text-slate-400 font-medium">Effectifs groupés (6ème, 3ème...)</span>
                </div>
              </button>

              <button
                onClick={() => setActiveReport('top_students')}
                className={`cursor-pointer px-4 py-3 rounded-xl text-xs font-extrabold text-left transition flex items-center gap-2.5 ${
                  activeReport === 'top_students' 
                    ? 'bg-indigo-50 text-indigo-900 border border-indigo-200' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                }`}
              >
                <Award className="h-4 w-4 text-amber-500 animate-pulse" />
                <div className="leading-tight">
                  <div className="block font-black">Tableau d'Honneur (Mérite)</div>
                  <span className="text-[10px] text-slate-400 font-medium">Meilleurs élèves (Palmarès)</span>
                </div>
              </button>

              <button
                onClick={() => setActiveReport('teachers_by_class')}
                className={`cursor-pointer px-4 py-3 rounded-xl text-xs font-extrabold text-left transition flex items-center gap-2.5 ${
                  activeReport === 'teachers_by_class' 
                    ? 'bg-indigo-50 text-indigo-900 border border-indigo-200' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                }`}
              >
                <UserCheck className="h-4 w-4" />
                <div className="leading-tight">
                  <div className="block font-black">Enseignants par classe</div>
                  <span className="text-[10px] text-slate-400 font-medium">Matières & heures par classe</span>
                </div>
              </button>

              <button
                onClick={() => setActiveReport('teachers_by_gender')}
                className={`cursor-pointer px-4 py-3 rounded-xl text-xs font-extrabold text-left transition flex items-center gap-2.5 ${
                  activeReport === 'teachers_by_gender' 
                    ? 'bg-indigo-50 text-indigo-900 border border-indigo-200' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                <div className="leading-tight">
                  <div className="block font-black">Enseignants par sexe</div>
                  <span className="text-[10px] text-slate-400 font-medium">Répartition H/F & charges horaires</span>
                </div>
              </button>

              <button
                onClick={() => setActiveReport('teachers_all')}
                className={`cursor-pointer px-4 py-3 rounded-xl text-xs font-extrabold text-left transition flex items-center gap-2.5 ${
                  activeReport === 'teachers_all' 
                    ? 'bg-indigo-50 text-indigo-900 border border-indigo-200' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                }`}
              >
                <Users className="h-4 w-4 text-emerald-600" />
                <div className="leading-tight">
                  <div className="block font-black">Liste générale des Enseignants</div>
                  <span className="text-[10px] text-slate-400 font-medium">Tous les enseignants actifs</span>
                </div>
              </button>

              <button
                onClick={() => setActiveReport('students_all')}
                className={`cursor-pointer px-4 py-3 rounded-xl text-xs font-extrabold text-left transition flex items-center gap-2.5 ${
                  activeReport === 'students_all' 
                    ? 'bg-indigo-50 text-indigo-900 border border-indigo-200' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                }`}
              >
                <GraduationCap className="h-4 w-4 text-[#ee7b11]" />
                <div className="leading-tight">
                  <div className="block font-black">Roster Général des Élèves</div>
                  <span className="text-[10px] text-slate-400 font-medium">Inscrits & non inscrits / suspendus</span>
                </div>
              </button>

            </div>
          </div>

          {/* Conditional filters depending on active report */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">Paramètres du Rapport</h4>
            
            {activeReport === 'students_by_class' && (
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-bold block">Sélectionner la classe :</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}

            {activeReport === 'students_by_level' && (
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-bold block">Niveau d'étude :</label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {levels.map(lvl => (
                    <option key={lvl} value={lvl}>{getLevelLabel(lvl)}</option>
                  ))}
                </select>
              </div>
            )}

            {activeReport === 'teachers_by_class' && (
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-bold block">Classe ciblée :</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-[10px] text-slate-500">
              💡 **Astuce** : Le format de sortie d'impression est optimisé pour du **A4 Paysage** (A4 Landscape) avec marges propres.
            </div>
          </div>

        </div>

        {/* Right Side: Report Sheet Preview (A4 landscape card layout) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col justify-between min-h-[500px]">
          
          {/* Printable container */}
          <div className="space-y-6">
            
            {/* School Header Box */}
            <div className="pb-4 border-b border-slate-300 flex justify-between items-end">
              <div>
                <span className="text-[10px] font-black uppercase text-rose-600 tracking-wider block">{schoolName}</span>
                <span className="text-[8px] font-bold text-slate-450 block italic leading-none">{schoolSubName} — "{schoolMotto}"</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Année Académique</span>
                <span className="text-xs font-black text-[#0b4998] block">{academicYear}</span>
              </div>
            </div>

            {/* Report Title */}
            <div className="text-center">
              <h3 className="text-base font-black uppercase tracking-tight text-slate-900">
                {activeReport === 'students_by_class' && `LISTE OFFICIELLE D'ÉLÈVES : CLASSE DE ${classes.find(c => c.id === selectedClassId)?.name || selectedClassId}`}
                {activeReport === 'students_by_level' && `LISTE GLOBALE DES ÉLÈVES : NIVEAU ${getLevelLabel(selectedLevel)}`}
                {activeReport === 'top_students' && `PALMARÈS DES MEILLEURS ÉLÈVES (TABLEAU D'HONNEUR)`}
                {activeReport === 'teachers_by_class' && `AFFECTATION DES ENSEIGNANTS : CLASSE DE ${classes.find(c => c.id === selectedClassId)?.name || selectedClassId}`}
                {activeReport === 'teachers_by_gender' && `RÉPARTITION ET ANALYSE DES ENSEIGNANTS PAR GENRE`}
                {activeReport === 'teachers_all' && `LISTE GÉNÉRALE ET ANNUAIRE DE TOUS LES ENSEIGNANTS`}
                {activeReport === 'students_all' && `ROSTER GÉNÉRAL DES ÉLÈVES (INSCRITS & NON-INSCRITS)`}
              </h3>
              <p className="text-[10px] text-slate-400 font-semibold italic mt-0.5">
                Rapport officiel généré le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            {/* Report Table Content */}
            <div className="overflow-x-auto">
              
              {/* 1. Students by Class */}
              {activeReport === 'students_by_class' && (() => {
                const classStudents = students.filter(s => s.classId === selectedClassId);
                return (
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-350">
                        <th className="p-2 border border-slate-300 text-center font-bold w-10">N°</th>
                        <th className="p-2 border border-slate-300 font-bold w-28">Matricule Local / National</th>
                        <th className="p-2 border border-slate-300 font-bold">Nom & Prénoms</th>
                        <th className="p-2 border border-slate-300 text-center font-bold w-12">Genre</th>
                        <th className="p-2 border border-slate-300 font-bold">Responsable / Tuteur</th>
                        <th className="p-2 border border-slate-300 text-center font-bold w-24">Signature</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classStudents.length > 0 ? (
                        classStudents.map((std, idx) => (
                          <tr key={std.id} className="border-b border-slate-200">
                            <td className="p-2 border border-slate-200 text-center font-bold text-slate-500">{idx + 1}</td>
                            <td className="p-2 border border-slate-200 font-mono text-[9.5px]">
                              <span className="font-extrabold text-[#0b4998] block">{std.matricule}</span>
                              <span className="text-[8px] text-slate-400 block">{std.matriculeNat || 'Aucun'}</span>
                            </td>
                            <td className="p-2 border border-slate-200 font-extrabold text-slate-800">{std.lastName} {std.firstName}</td>
                            <td className="p-2 border border-slate-200 text-center font-bold">{std.gender}</td>
                            <td className="p-2 border border-slate-200 text-slate-655 font-medium">
                              {std.tutorName} ({std.tutorPhone})
                            </td>
                            <td className="p-2 border border-slate-200"></td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-6 text-center text-slate-400 font-semibold italic">
                            Aucun élève n'est inscrit dans cette classe.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                );
              })()}

              {/* 2. Students by Level */}
              {activeReport === 'students_by_level' && (() => {
                const levelStudents = students.filter(s => {
                  const matchedClass = classes.find(c => c.id === s.classId);
                  const className = (matchedClass?.name || s.classId).toLowerCase();
                  return className.startsWith(selectedLevel.toLowerCase());
                });

                return (
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-350">
                        <th className="p-2 border border-slate-300 text-center font-bold w-10">N°</th>
                        <th className="p-2 border border-slate-300 font-bold w-24">Matricule</th>
                        <th className="p-2 border border-slate-300 font-bold">Nom & Prénoms</th>
                        <th className="p-2 border border-slate-300 font-bold">Classe Affectée</th>
                        <th className="p-2 border border-slate-300 text-center font-bold w-12">Genre</th>
                        <th className="p-2 border border-slate-300 font-bold">Tuteur & Téléphone</th>
                      </tr>
                    </thead>
                    <tbody>
                      {levelStudents.length > 0 ? (
                        levelStudents.map((std, idx) => (
                          <tr key={std.id} className="border-b border-slate-200">
                            <td className="p-2 border border-slate-200 text-center font-bold text-slate-500">{idx + 1}</td>
                            <td className="p-2 border border-slate-200 font-mono text-[10px] font-bold text-[#0b4998]">{std.matricule}</td>
                            <td className="p-2 border border-slate-200 font-extrabold text-slate-800">{std.lastName} {std.firstName}</td>
                            <td className="p-2 border border-slate-200 font-bold text-indigo-805">
                              {classes.find(c => c.id === std.classId)?.name || std.classId}
                            </td>
                            <td className="p-2 border border-slate-200 text-center font-bold">{std.gender}</td>
                            <td className="p-2 border border-slate-200 text-slate-550 font-medium">
                              {std.tutorName} ({std.tutorPhone})
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-6 text-center text-slate-400 font-semibold italic">
                            Aucun élève n'a été trouvé pour le niveau {getLevelLabel(selectedLevel)}.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                );
              })()}

              {/* 3. Top Students (Merits podium) */}
              {activeReport === 'top_students' && (
                <div className="space-y-6">
                  {/* Decorative Podium for Top 3 */}
                  <div className="grid grid-cols-3 gap-3 items-end max-w-md mx-auto text-center py-2 no-print">
                    
                    {/* 2nd Place */}
                    {topStudents[1] && (
                      <div className="bg-slate-100 border border-slate-300 rounded-t-xl p-3 flex flex-col items-center">
                        <span className="text-xl">🥈</span>
                        <span className="text-[10px] font-black text-slate-700 uppercase truncate max-w-full">
                          {topStudents[1].lastName}
                        </span>
                        <span className="text-[8.5px] font-extrabold text-[#0b4998] block">
                          {classes.find(c => c.id === topStudents[1].classId)?.name || topStudents[1].classId}
                        </span>
                        <div className="mt-1 px-2 py-0.5 bg-slate-200 rounded font-black text-xs text-slate-800">
                          {topStudents[1].average} / 20
                        </div>
                      </div>
                    )}

                    {/* 1st Place */}
                    {topStudents[0] && (
                      <div className="bg-amber-50 border-2 border-amber-350 rounded-t-xl p-4 flex flex-col items-center shadow-md min-h-[120px]">
                        <span className="text-3xl animate-bounce">👑</span>
                        <span className="text-xs font-black text-amber-900 uppercase truncate max-w-full">
                          {topStudents[0].lastName} {topStudents[0].firstName.substring(0, 1)}.
                        </span>
                        <span className="text-[9px] font-extrabold text-[#0b4998] block">
                          {classes.find(c => c.id === topStudents[0].classId)?.name || topStudents[0].classId}
                        </span>
                        <div className="mt-1 px-2.5 py-0.5 bg-amber-500 text-white rounded-md font-black text-sm shadow-sm">
                          {topStudents[0].average} / 20
                        </div>
                      </div>
                    )}

                    {/* 3rd Place */}
                    {topStudents[2] && (
                      <div className="bg-orange-50 border border-orange-200 rounded-t-xl p-2.5 flex flex-col items-center">
                        <span className="text-lg">🥉</span>
                        <span className="text-[10px] font-black text-orange-850 uppercase truncate max-w-full">
                          {topStudents[2].lastName}
                        </span>
                        <span className="text-[8.5px] font-extrabold text-[#0b4998] block">
                          {classes.find(c => c.id === topStudents[2].classId)?.name || topStudents[2].classId}
                        </span>
                        <div className="mt-1 px-2 py-0.5 bg-orange-100 rounded font-black text-xs text-orange-800">
                          {topStudents[2].average} / 20
                        </div>
                      </div>
                    )}

                  </div>

                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-350">
                        <th className="p-2 border border-slate-300 text-center font-bold w-12">Rang</th>
                        <th className="p-2 border border-slate-300 font-bold w-24">Matricule</th>
                        <th className="p-2 border border-slate-300 font-bold">Nom & Prénoms</th>
                        <th className="p-2 border border-slate-300 font-bold">Classe</th>
                        <th className="p-2 border border-slate-300 text-center font-bold w-28">Moyenne Générale</th>
                        <th className="p-2 border border-slate-300 font-bold">Mention Officielle</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topStudents.map((std, idx) => {
                        const score = std.average;
                        let mention = "Passable";
                        let mentionColor = "text-slate-600";
                        if (score >= 16) {
                          mention = "Félicitations (Excellent)";
                          mentionColor = "text-emerald-700 font-black";
                        } else if (score >= 14) {
                          mention = "Tableau d'Honneur (Très Bien)";
                          mentionColor = "text-blue-700 font-bold";
                        } else if (score >= 12) {
                          mention = "Encouragements (Bien)";
                          mentionColor = "text-indigo-700 font-bold";
                        } else if (score < 10) {
                          mention = "Avertissement (Insuffisant)";
                          mentionColor = "text-rose-600 font-bold";
                        }

                        return (
                          <tr key={std.id} className="border-b border-slate-200 hover:bg-slate-50/50 transition">
                            <td className="p-2 border border-slate-200 text-center font-extrabold text-slate-700">
                              {idx + 1 === 1 ? '🥇 1er' : idx + 1 === 2 ? '🥈 2e' : idx + 1 === 3 ? '🥉 3e' : `${idx + 1}e`}
                            </td>
                            <td className="p-2 border border-slate-200 font-mono font-bold text-slate-500">{std.matricule}</td>
                            <td className="p-2 border border-slate-200 font-extrabold text-slate-800">{std.lastName} {std.firstName}</td>
                            <td className="p-2 border border-slate-200 font-bold text-slate-600">
                              {classes.find(c => c.id === std.classId)?.name || std.classId}
                            </td>
                            <td className="p-2 border border-slate-200 text-center font-black text-sm text-indigo-900 bg-indigo-50/20">
                              {score > 0 ? `${score} / 20` : 'Non classé (Pas de notes)'}
                            </td>
                            <td className={`p-2 border border-slate-200 text-[10.5px] ${mentionColor}`}>
                              {score > 0 ? mention : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 4. Teachers by Class */}
              {activeReport === 'teachers_by_class' && (() => {
                const classCourses = courses.filter(c => c.classId === selectedClassId);
                const teacherIds = Array.from(new Set(classCourses.map(c => c.teacherId)));
                const classTeachers = teachers.filter(t => teacherIds.includes(t.id));

                return (
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-350">
                        <th className="p-2 border border-slate-300 font-bold w-12 text-center">N°</th>
                        <th className="p-2 border border-slate-300 font-bold">Nom de l'Enseignant</th>
                        <th className="p-2 border border-slate-300 font-bold">Matière(s) Enseignée(s)</th>
                        <th className="p-2 border border-slate-300 text-center font-bold w-36">Charge Horaire Hebdo</th>
                        <th className="p-2 border border-slate-300 font-bold">Statut de Disponibilité</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classTeachers.length > 0 ? (
                        classTeachers.map((tch, idx) => {
                          const subjectsTaught = Array.from(new Set(
                            classCourses.filter(c => c.teacherId === tch.id)
                                        .map(c => subjects.find(s => s.id === c.subjectId)?.name || c.subjectId)
                          ));
                          // Count courses
                          const hrs = classCourses.filter(c => c.teacherId === tch.id).length * 2; // 2 hours per slot
                          return (
                            <tr key={tch.id} className="border-b border-slate-200">
                              <td className="p-2 border border-slate-200 text-center font-bold text-slate-500">{idx + 1}</td>
                              <td className="p-2 border border-slate-200 font-extrabold text-slate-800">{tch.name}</td>
                              <td className="p-2 border border-slate-200 font-bold text-slate-500 uppercase">{subjectsTaught.join(', ')}</td>
                              <td className="p-2 border border-slate-200 text-center font-black text-indigo-900 bg-indigo-50/10">{hrs} heures / sem.</td>
                              <td className="p-2 border border-slate-200 text-emerald-700 font-semibold">✓ Actif (Enseignant principal)</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-6 text-center text-slate-400 font-semibold italic">
                            Aucun enseignant n'est affecté à cette classe dans le planning.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                );
              })()}

              {/* 5. Teachers by Gender */}
              {activeReport === 'teachers_by_gender' && (() => {
                // Group teachers by gender. If gender is not specified in the object, group under 'M' by default or look up names
                const maleTeachers = teachers.filter(t => !t.name.toLowerCase().includes('mme') && !t.name.toLowerCase().includes('mademoiselle') && !t.name.toLowerCase().includes('fatoumata') && !t.name.toLowerCase().includes('aminata'));
                const femaleTeachers = teachers.filter(t => t.name.toLowerCase().includes('mme') || t.name.toLowerCase().includes('mademoiselle') || t.name.toLowerCase().includes('fatoumata') || t.name.toLowerCase().includes('aminata'));

                return (
                  <div className="space-y-6">
                    {/* Summary statistic row */}
                    <div className="grid grid-cols-2 gap-4 pb-2 text-center no-print">
                      <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl">
                        <span className="text-2xl">👨‍🏫</span>
                        <div className="text-xs text-slate-500 font-bold uppercase mt-1">Hommes</div>
                        <div className="text-xl font-black text-blue-900">{maleTeachers.length} enseignants</div>
                      </div>
                      <div className="bg-pink-50 border border-pink-200 p-4 rounded-2xl">
                        <span className="text-2xl">👩‍🏫</span>
                        <div className="text-xs text-slate-500 font-bold uppercase mt-1">Femmes</div>
                        <div className="text-xl font-black text-pink-900">{femaleTeachers.length} enseignantes</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Female table */}
                      <div className="space-y-2">
                        <span className="text-xs font-black text-pink-700 block uppercase tracking-wide">👩‍🏫 Personnel Féminin ({femaleTeachers.length})</span>
                        <table className="w-full border-collapse text-left text-xs">
                          <thead>
                            <tr className="bg-pink-50/50 border-b border-pink-200">
                              <th className="p-2 border border-slate-200 font-bold">Nom</th>
                              <th className="p-2 border border-slate-200 font-bold">Matière(s) Spécialisée(s)</th>
                              <th className="p-2 border border-slate-200 font-bold text-center w-28">Volume Global</th>
                            </tr>
                          </thead>
                          <tbody>
                            {femaleTeachers.length > 0 ? (
                              femaleTeachers.map(t => {
                                const subjectLabels = t.subjects.map(sid => subjects.find(s => s.id === sid)?.name || sid);
                                const totSlots = courses.filter(c => c.teacherId === t.id).length;
                                return (
                                  <tr key={t.id} className="border-b border-slate-200">
                                    <td className="p-2 border border-slate-200 font-extrabold text-slate-800">{t.name}</td>
                                    <td className="p-2 border border-slate-200 font-bold text-slate-500 uppercase">{subjectLabels.join(', ')}</td>
                                    <td className="p-2 border border-slate-200 text-center font-bold text-slate-700">{totSlots * 2}h/semaine</td>
                                  </tr>
                                );
                              })
                            ) : (
                              <tr>
                                <td colSpan={3} className="p-4 text-center text-slate-400 font-semibold italic">Aucune enseignante répertoriée.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Male table */}
                      <div className="space-y-2">
                        <span className="text-xs font-black text-blue-700 block uppercase tracking-wide">👨‍🏫 Personnel Masculin ({maleTeachers.length})</span>
                        <table className="w-full border-collapse text-left text-xs">
                          <thead>
                            <tr className="bg-blue-50/50 border-b border-blue-200">
                              <th className="p-2 border border-slate-200 font-bold">Nom</th>
                              <th className="p-2 border border-slate-200 font-bold">Matière(s) Spécialisée(s)</th>
                              <th className="p-2 border border-slate-200 font-bold text-center w-28">Volume Global</th>
                            </tr>
                          </thead>
                          <tbody>
                            {maleTeachers.map(t => {
                              const subjectLabels = t.subjects.map(sid => subjects.find(s => s.id === sid)?.name || sid);
                              const totSlots = courses.filter(c => c.teacherId === t.id).length;
                              return (
                                <tr key={t.id} className="border-b border-slate-200">
                                  <td className="p-2 border border-slate-200 font-extrabold text-slate-800">{t.name}</td>
                                  <td className="p-2 border border-slate-200 font-bold text-slate-500 uppercase">{subjectLabels.join(', ')}</td>
                                  <td className="p-2 border border-slate-200 text-center font-bold text-slate-700">{totSlots * 2}h/semaine</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                );
              })()}

              {/* 6. General Teachers List */}
              {activeReport === 'teachers_all' && (
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-350">
                      <th className="p-2 border border-slate-300 text-center font-bold w-10">N°</th>
                      <th className="p-2 border border-slate-300 font-bold">Nom Complet</th>
                      <th className="p-2 border border-slate-300 font-bold">Adresse E-mail</th>
                      <th className="p-2 border border-slate-300 font-bold">Matière(s) de Spécialité</th>
                      <th className="p-2 border border-slate-300 text-center font-bold w-36">Volume Horaire Total</th>
                      <th className="p-2 border border-slate-300 text-center font-bold w-24">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.map((tch, idx) => {
                      const subjectLabels = tch.subjects.map(sid => subjects.find(s => s.id === sid)?.name || sid);
                      const totSlots = courses.filter(c => c.teacherId === tch.id).length;
                      return (
                        <tr key={tch.id} className="border-b border-slate-200">
                          <td className="p-2 border border-slate-200 text-center font-bold text-slate-550">{idx + 1}</td>
                          <td className="p-2 border border-slate-200 font-extrabold text-slate-800">{tch.name}</td>
                          <td className="p-2 border border-slate-200 font-mono text-[10.5px] text-slate-600">{tch.email || 'Non renseignée'}</td>
                          <td className="p-2 border border-slate-200 font-bold text-slate-500 uppercase text-[10px]">{subjectLabels.join(', ')}</td>
                          <td className="p-2 border border-slate-200 text-center font-black text-indigo-900 bg-indigo-50/10">{totSlots * 2} heures / sem.</td>
                          <td className="p-2 border border-slate-200 text-center text-emerald-700 font-bold">Actif</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

              {/* 7. Master Students List (Inscrits & Non Inscrits) */}
              {activeReport === 'students_all' && (
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-350">
                      <th className="p-2 border border-slate-300 text-center font-bold w-10">N°</th>
                      <th className="p-2 border border-slate-300 font-bold w-24">Matricule</th>
                      <th className="p-2 border border-slate-300 font-bold">Nom & Prénoms</th>
                      <th className="p-2 border border-slate-300 font-bold">Classe</th>
                      <th className="p-2 border border-slate-300 text-center font-bold w-12">Genre</th>
                      <th className="p-2 border border-slate-300 font-bold">Tuteur / Contact</th>
                      <th className="p-2 border border-slate-300 text-center font-bold w-32">Statut d'Inscription</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((std, idx) => {
                      const isActive = std.status === 'Inscrit' || std.status === 'Réinscrit';
                      return (
                        <tr key={std.id} className="border-b border-slate-200">
                          <td className="p-2 border border-slate-200 text-center font-bold text-slate-500">{idx + 1}</td>
                          <td className="p-2 border border-slate-200 font-mono font-bold text-[#0b4998]">{std.matricule}</td>
                          <td className="p-2 border border-slate-200 font-extrabold text-slate-800">{std.lastName} {std.firstName}</td>
                          <td className="p-2 border border-slate-200 font-bold text-slate-600">
                            {classes.find(c => c.id === std.classId)?.name || std.classId || 'Non affecté'}
                          </td>
                          <td className="p-2 border border-slate-200 text-center font-bold">{std.gender}</td>
                          <td className="p-2 border border-slate-200 text-slate-550 font-medium">
                            {std.tutorName} ({std.tutorPhone})
                          </td>
                          <td className="p-2 border border-slate-200 text-center">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              isActive 
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-250' 
                                : std.status === 'Suspendu'
                                ? 'bg-rose-100 text-rose-800 border border-rose-250'
                                : 'bg-slate-100 text-slate-800 border border-slate-250'
                            }`}>
                              {std.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

            </div>

          </div>

          {/* Report Footer Seals */}
          <div className="pt-8 border-t border-slate-350 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <span className="font-bold text-slate-450 block uppercase mb-12">Le Responsable des Études</span>
              <div className="border-b border-slate-400 w-44 mx-auto" />
            </div>
            <div>
              <span className="font-bold text-slate-450 block uppercase mb-12">Le Directeur d'Établissement (Sceau)</span>
              <div className="border-b border-slate-400 w-44 mx-auto" />
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
