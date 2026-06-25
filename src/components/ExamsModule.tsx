import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Calendar, 
  MapPin, 
  FileText, 
  Plus, 
  Trash2, 
  Check, 
  Search, 
  Printer, 
  Sliders, 
  Users, 
  Shuffle, 
  UserCheck 
} from 'lucide-react';
import { ClassItem } from '../types';

interface ExamsModuleProps {
  classes: ClassItem[];
  schoolName: string;
  schoolSubName: string;
  schoolMotto: string;
  academicYear: string;
}

interface MockExamSession {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  classes: string[]; // Class IDs targeted (e.g. ["3A", "3B"])
  registrationFee: number;
}

interface NationalExamConfig {
  id: string;
  examType: 'CEPE' | 'BEPC' | 'BAC';
  classId: string; // Target class (e.g. CM2, 3ème, Tle)
  compositionCenter: string; // Ex: Lycée Moderne Cocody
  juryName: string; // Ex: Jury 12
  startDate: string;
}

interface StudentRecord {
  id: string;
  firstName: string;
  lastName: string;
  gender: 'M' | 'F';
  classId: string;
  matricule: string;
  tableNumber?: string; // National exam table number
  examCenter?: string; // Assigned composition center
  jury?: string;
  isRegisteredMock?: Record<string, boolean>; // mockExamId -> registered
}

interface MockExamMark {
  id: string;
  examId: string;
  studentId: string;
  subjectId: string;
  score: number;
}

export function ExamsModule({
  classes,
  schoolName,
  schoolSubName,
  schoolMotto,
  academicYear
}: ExamsModuleProps) {
  
  const [activeTab, setActiveTab] = useState<'mock_exams' | 'national_exams'>('mock_exams');
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  // ----------------------------------------------------
  // Persistent State Loaders
  // ----------------------------------------------------
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [mockSessions, setMockSessions] = useState<MockExamSession[]>([]);
  const [nationalExams, setNationalExams] = useState<NationalExamConfig[]>([]);
  const [mockMarks, setMockMarks] = useState<MockExamMark[]>([]);

  useEffect(() => {
    // Load student records
    const savedStudents = localStorage.getItem('erp_student_records');
    if (savedStudents) {
      setStudents(JSON.parse(savedStudents));
    } else {
      // Defaults
      setStudents([
        { id: 'std_1', firstName: 'Koffi', lastName: 'Yao Anderson', gender: 'M', classId: '6A', matricule: 'M-2026-4102' },
        { id: 'std_2', firstName: 'Diomandé', lastName: 'Aminata', gender: 'F', classId: '6B', matricule: 'M-2024-1185' },
        { id: 'std_3', firstName: 'Kouassi', lastName: 'Koffi Charles', gender: 'M', classId: '3A', matricule: 'M-2026-9981' },
        { id: 'std_4', firstName: 'Sylla', lastName: 'Ibrahim Karim', gender: 'M', classId: '3B', matricule: 'M-2023-0056' },
        { id: 'std_5', firstName: 'Gomez', lastName: 'Marie-Chantal Enola', gender: 'F', classId: '3A', matricule: 'M-2026-0103' }
      ]);
    }

    // Load Mock sessions
    const savedMocks = localStorage.getItem('erp_mock_exams');
    if (savedMocks) {
      setMockSessions(JSON.parse(savedMocks));
    } else {
      const defaults: MockExamSession[] = [
        { id: 'mock_1', name: 'Examen Blanc Régional 1', startDate: '2026-03-10', endDate: '2026-03-14', classes: ['3A', '3B'], registrationFee: 2000 }
      ];
      setMockSessions(defaults);
      localStorage.setItem('erp_mock_exams', JSON.stringify(defaults));
    }

    // Load National configs
    const savedNationals = localStorage.getItem('erp_national_exams');
    if (savedNationals) {
      setNationalExams(JSON.parse(savedNationals));
    } else {
      const defaults: NationalExamConfig[] = [
        { id: 'nat_1', examType: 'BEPC', classId: '3A', compositionCenter: 'Collège Moderne du Plateau', juryName: 'Jury 05', startDate: '2026-06-15' },
        { id: 'nat_2', examType: 'BEPC', classId: '3B', compositionCenter: 'Collège Moderne du Plateau', juryName: 'Jury 05', startDate: '2026-06-15' }
      ];
      setNationalExams(defaults);
      localStorage.setItem('erp_national_exams', JSON.stringify(defaults));
    }

    // Load Mock marks
    const savedMarks = localStorage.getItem('erp_mock_marks');
    if (savedMarks) {
      setMockMarks(JSON.parse(savedMarks));
    }
  }, []);

  const saveStudents = (updated: StudentRecord[]) => {
    setStudents(updated);
    localStorage.setItem('erp_student_records', JSON.stringify(updated));
  };

  const saveMockSessions = (updated: MockExamSession[]) => {
    setMockSessions(updated);
    localStorage.setItem('erp_mock_exams', JSON.stringify(updated));
  };

  const saveNationalExams = (updated: NationalExamConfig[]) => {
    setNationalExams(updated);
    localStorage.setItem('erp_national_exams', JSON.stringify(updated));
  };

  const saveMockMarks = (updated: MockExamMark[]) => {
    setMockMarks(updated);
    localStorage.setItem('erp_mock_marks', JSON.stringify(updated));
  };

  const showStatus = (type: 'success' | 'error', message: string) => {
    setSaveStatus({ type, message });
    setTimeout(() => {
      setSaveStatus({ type: null, message: '' });
    }, 4000);
  };

  // ----------------------------------------------------
  // SUB-TAB 1: MOCK EXAMS (EXAMENS BLANCS)
  // ----------------------------------------------------
  const [newMockForm, setNewMockForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    classes: [] as string[],
    registrationFee: 0
  });

  const handleAddMockSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMockForm.name.trim()) return;

    const newMock: MockExamSession = {
      id: 'mock_' + Date.now(),
      name: newMockForm.name,
      startDate: newMockForm.startDate || new Date().toISOString().split('T')[0],
      endDate: newMockForm.endDate || new Date().toISOString().split('T')[0],
      classes: newMockForm.classes,
      registrationFee: Number(newMockForm.registrationFee) || 0
    };

    const updated = [...mockSessions, newMock];
    saveMockSessions(updated);
    showStatus('success', `Session d'examen blanc "${newMock.name}" ajoutée.`);
    setNewMockForm({ name: '', startDate: '', endDate: '', classes: [], registrationFee: 0 });
  };

  const handleDeleteMockSession = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette session d'examen blanc ?")) {
      const updated = mockSessions.filter(m => m.id !== id);
      saveMockSessions(updated);
      showStatus('success', 'Session d’examen blanc supprimée.');
    }
  };

  const toggleMockClass = (classId: string) => {
    setNewMockForm(prev => {
      const exists = prev.classes.includes(classId);
      const updatedClasses = exists 
        ? prev.classes.filter(c => c !== classId)
        : [...prev.classes, classId];
      return { ...prev, classes: updatedClasses };
    });
  };

  // Mock marks states
  const [selectedMockId, setSelectedMockId] = useState<string>('mock_1');
  const [selectedClassId, setSelectedClassId] = useState<string>('3A');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('math');

  const mockExamStudents = students.filter(s => s.classId === selectedClassId);

  const handleUpdateMockMark = (studentId: string, scoreStr: string) => {
    const scoreVal = parseFloat(scoreStr);
    if (isNaN(scoreVal) || scoreVal < 0 || scoreVal > 20) return;

    const markKey = `${selectedMockId}_${studentId}_${selectedSubjectId}`;
    const exists = mockMarks.find(
      m => m.examId === selectedMockId && m.studentId === studentId && m.subjectId === selectedSubjectId
    );

    let updated: MockExamMark[];
    if (exists) {
      updated = mockMarks.map(m => 
        m.examId === selectedMockId && m.studentId === studentId && m.subjectId === selectedSubjectId
          ? { ...m, score: scoreVal }
          : m
      );
    } else {
      updated = [...mockMarks, {
        id: 'mk_' + Date.now() + '_' + Math.floor(Math.random() * 100),
        examId: selectedMockId,
        studentId,
        subjectId: selectedSubjectId,
        score: scoreVal
      }];
    }
    saveMockMarks(updated);
  };

  // ----------------------------------------------------
  // SUB-TAB 2: NATIONAL EXAMS (EXAMENS NATIONAUX)
  // ----------------------------------------------------
  const [newNatForm, setNewNatForm] = useState({
    examType: 'BEPC' as 'CEPE' | 'BEPC' | 'BAC',
    classId: classes[0]?.id || '3A',
    compositionCenter: '',
    juryName: '',
    startDate: ''
  });

  const handleAddNatConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const newNat: NationalExamConfig = {
      id: 'nat_' + Date.now(),
      examType: newNatForm.examType,
      classId: newNatForm.classId,
      compositionCenter: newNatForm.compositionCenter || 'Centre Scolaire Principal',
      juryName: newNatForm.juryName || 'Jury A',
      startDate: newNatForm.startDate || new Date().toISOString().split('T')[0]
    };

    const updated = [...nationalExams, newNat];
    saveNationalExams(updated);
    showStatus('success', `Configuration nationale pour ${newNat.examType} ajoutée.`);
  };

  const handleDeleteNatConfig = (id: string) => {
    if (window.confirm("Supprimer cette configuration d'examen national ?")) {
      const updated = nationalExams.filter(n => n.id !== id);
      saveNationalExams(updated);
      showStatus('success', 'Configuration nationale supprimée.');
    }
  };

  // Assign national parameters to students
  const [activeNatClassFilter, setActiveNatClassFilter] = useState<string>('3A');
  const natStudents = students.filter(s => s.classId === activeNatClassFilter);

  const handleStudentNatUpdate = (studentId: string, field: 'tableNumber' | 'examCenter' | 'jury', val: string) => {
    const updated = students.map(s => {
      if (s.id === studentId) {
        return { ...s, [field]: val };
      }
      return s;
    });
    saveStudents(updated);
  };

  // Bulk generator for table numbers (Numéros de table)
  const handleBulkGenerateTableNumbers = () => {
    if (natStudents.length === 0) {
      showStatus('error', 'Aucun élève à affecter.');
      return;
    }

    const yearPrefix = academicYear.split('-')[0].substring(2); // ex: "26"
    const randomStart = Math.floor(100000 + Math.random() * 900000); // 6 digits

    const updated = students.map((s, idx) => {
      if (s.classId === activeNatClassFilter) {
        const sequentialNum = randomStart + idx;
        const newTableNo = `${yearPrefix}-${sequentialNum}`;
        const matchedConfig = nationalExams.find(n => n.classId === activeNatClassFilter);
        return {
          ...s,
          tableNumber: newTableNo,
          examCenter: matchedConfig?.compositionCenter || s.examCenter || 'Lycée Moderne de Cocody',
          jury: matchedConfig?.juryName || s.jury || 'Jury 1'
        };
      }
      return s;
    });

    saveStudents(updated);
    showStatus('success', `Génération automatique terminée : ${natStudents.length} élèves de la classe ${classes.find(c => c.id === activeNatClassFilter)?.name} ont reçu un numéro de table officiel.`);
  };

  return (
    <div className="space-y-6">
      
      {/* Upper Status Banner */}
      {saveStatus.type && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 border shadow-sm transition ${
          saveStatus.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-250' : 'bg-rose-50 text-rose-800 border-rose-250'
        }`}>
          <span className="text-xl">{saveStatus.type === 'success' ? '✓' : '⚠️'}</span>
          <span className="text-xs font-bold">{saveStatus.message}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-[#093d80] via-[#072c5e] to-[#041a39] border border-[#f3aa1c]/30 text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <span className="bg-[#ee7b11] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider select-none">
            🎓 Examens & Accréditations Nationales
          </span>
          <h1 className="text-2xl font-black uppercase tracking-tight">
            Gestion des Examens Scolaires
          </h1>
          <p className="text-xs text-slate-350 max-w-xl font-medium">
            Planifiez les épreuves d'examens blancs, enregistrez les notes par matière, ou générez les fiches d'examen national (table numbers, composition centers, jurys) et étiquettes de table.
          </p>
        </div>
        <div className="text-right shrink-0">
          <span className="text-slate-400 text-[10px] font-bold block uppercase tracking-wider">Session</span>
          <span className="text-sm font-extrabold text-[#f3aa1c] block">{academicYear}</span>
          <span className="text-[10px] text-slate-450 block font-mono">Examens officiels</span>
        </div>
      </div>

      {/* Navigation subtabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('mock_exams')}
          className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
            activeTab === 'mock_exams' 
              ? 'bg-slate-900 text-white border-slate-950 shadow-xs' 
              : 'bg-white text-slate-650 hover:bg-slate-50 border-slate-200'
          }`}
        >
          <FileText className="h-4 w-4 text-[#ee7b11]" />
          <span>Examens Blancs (Internes)</span>
        </button>

        <button
          onClick={() => setActiveTab('national_exams')}
          className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
            activeTab === 'national_exams' 
              ? 'bg-slate-900 text-white border-slate-950 shadow-xs' 
              : 'bg-white text-slate-650 hover:bg-slate-50 border-slate-200'
          }`}
        >
          <Award className="h-4 w-4 text-amber-500" />
          <span>Examens Nationaux (BEPC, BAC, CEPE)</span>
        </button>
      </div>

      {/* Main content render */}
      <div className="bg-slate-50 rounded-2xl">
        
        {/* TAB 1: MOCK EXAMS (EXAMENS BLANCS) */}
        {activeTab === 'mock_exams' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Create Mock Sessions (4 cols) */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
              <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1.5">
                <Plus className="h-4 w-4 text-[#ee7b11]" />
                <span>Créer une Session d'Examen Blanc</span>
              </h2>

              <form onSubmit={handleAddMockSession} className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-[9.5px] font-bold text-slate-450 uppercase">Nom de la session</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Examen Blanc Commun N°2"
                    value={newMockForm.name}
                    onChange={(e) => setNewMockForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-250 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-[9.5px] font-bold text-slate-450 uppercase">Date début</label>
                    <input 
                      type="date" 
                      value={newMockForm.startDate}
                      onChange={(e) => setNewMockForm(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full h-9 px-2 rounded-lg border border-slate-200 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[9.5px] font-bold text-slate-450 uppercase">Date fin</label>
                    <input 
                      type="date" 
                      value={newMockForm.endDate}
                      onChange={(e) => setNewMockForm(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full h-9 px-2 rounded-lg border border-slate-200 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[9.5px] font-bold text-slate-450 uppercase">Frais d'inscription (FCFA)</label>
                  <input 
                    type="number" 
                    value={newMockForm.registrationFee}
                    onChange={(e) => setNewMockForm(prev => ({ ...prev, registrationFee: Number(e.target.value) }))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-250 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[9.5px] font-bold text-slate-450 uppercase">Classes ciblées</label>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                    {classes.map(c => (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => toggleMockClass(c.id)}
                        className={`px-2 py-1 rounded text-[10px] font-black uppercase transition ${
                          newMockForm.classes.includes(c.id)
                            ? 'bg-[#093d80] text-white'
                            : 'bg-white border border-slate-200 text-slate-650'
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="cursor-pointer h-9 w-full bg-[#093d80] hover:bg-[#072c5e] text-white text-xs font-bold rounded-lg transition"
                >
                  Ajouter la Session
                </button>
              </form>

              {/* Mock Sessions List */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <span className="text-[9.5px] font-black uppercase text-slate-450 tracking-wider block">Sessions en cours ({mockSessions.length})</span>
                {mockSessions.map(m => (
                  <div key={m.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-extrabold text-slate-800 block">{m.name}</span>
                      <span className="text-[9.5px] text-slate-450 block font-medium">Frais : {m.registrationFee.toLocaleString()} FCFA</span>
                      <span className="text-[9px] font-mono text-slate-400 block">{m.startDate} au {m.endDate}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteMockSession(m.id)}
                      className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Mock Exam Marks Board (8 cols) */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
                <h2 className="text-sm font-black text-slate-850 uppercase tracking-tight flex items-center gap-1.5">
                  <Sliders className="h-4.5 w-4.5 text-[#ee7b11]" />
                  <span>Saisie des Notes Scolaires d'Examens Blancs</span>
                </h2>
              </div>

              {/* Filters for Marks input */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-450 uppercase block">Session</span>
                  <select 
                    value={selectedMockId}
                    onChange={(e) => setSelectedMockId(e.target.value)}
                    className="w-full h-8 px-2 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none"
                  >
                    {mockSessions.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-450 uppercase block">Classe</span>
                  <select 
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="w-full h-8 px-2 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-450 uppercase block">Matière</span>
                  <select 
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="w-full h-8 px-2 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none"
                  >
                    <option value="math">📐 Mathématiques</option>
                    <option value="fr">📝 Français (Composition)</option>
                    <option value="pc">🧪 Physique-Chimie</option>
                    <option value="ang">🇬🇧 Anglais</option>
                    <option value="hist">🌍 Histoire-Géographie</option>
                  </select>
                </div>
              </div>

              {/* Students marks inputs table */}
              {mockExamStudents.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                        <th className="p-2.5 w-16 text-center">N°</th>
                        <th className="p-2.5">Matricule</th>
                        <th className="p-2.5">Candidat</th>
                        <th className="p-2.5 text-center w-40">Note sur 20</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockExamStudents.map((std, idx) => {
                        const savedScore = mockMarks.find(
                          m => m.examId === selectedMockId && m.studentId === std.id && m.subjectId === selectedSubjectId
                        )?.score;

                        return (
                          <tr key={std.id} className="border-b border-slate-100 hover:bg-slate-50/30">
                            <td className="p-2.5 text-center text-slate-450 font-bold">{idx + 1}</td>
                            <td className="p-2.5 font-mono text-indigo-700 font-bold">{std.matricule}</td>
                            <td className="p-2.5 font-extrabold text-slate-800 uppercase">{std.lastName} {std.firstName}</td>
                            <td className="p-2.5 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <input 
                                  type="number"
                                  min="0"
                                  max="20"
                                  step="0.25"
                                  placeholder="Note/20"
                                  defaultValue={savedScore !== undefined ? savedScore : ''}
                                  onBlur={(e) => handleUpdateMockMark(std.id, e.target.value)}
                                  className="w-20 h-7 text-center border border-slate-250 rounded-lg text-xs font-black focus:outline-none"
                                />
                                <span className="text-[10px] text-slate-400 font-bold">/ 20</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic text-center py-6">Aucun candidat dans cette classe.</p>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: NATIONAL EXAMS (EXAMENS NATIONAUX) */}
        {activeTab === 'national_exams' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* National configurations form (4 cols) */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
              <h2 className="text-xs font-black text-slate-850 uppercase pb-2 border-b border-slate-100 flex items-center gap-1.5">
                <Sliders className="h-4.5 w-4.5 text-[#093d80]" />
                <span>Paramètres d'Examen National</span>
              </h2>

              <form onSubmit={handleAddNatConfig} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="block text-[9.5px] font-bold text-slate-450 uppercase font-bold">Type d'examen</label>
                  <select 
                    value={newNatForm.examType}
                    onChange={(e) => setNewNatForm(prev => ({ ...prev, examType: e.target.value as any }))}
                    className="w-full h-9 px-2 border border-slate-250 rounded-lg text-xs font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="CEPE">CEPE (Primaire)</option>
                    <option value="BEPC">BEPC (Moyen/Collège)</option>
                    <option value="BAC">BAC (Secondaire/Lycée)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[9.5px] font-bold text-slate-450 uppercase font-bold">Classe concernée</label>
                  <select 
                    value={newNatForm.classId}
                    onChange={(e) => setNewNatForm(prev => ({ ...prev, classId: e.target.value }))}
                    className="w-full h-9 px-2 border border-slate-250 rounded-lg text-xs font-bold focus:outline-none cursor-pointer"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[9.5px] font-bold text-slate-450 uppercase font-bold">Centre de Composition</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Lycée Moderne de Gagnoa"
                    value={newNatForm.compositionCenter}
                    onChange={(e) => setNewNatForm(prev => ({ ...prev, compositionCenter: e.target.value }))}
                    className="w-full h-9 px-3 border border-slate-250 rounded-lg text-xs focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-[9.5px] font-bold text-slate-450 uppercase font-bold">Jury officiel</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Jury 02"
                      value={newNatForm.juryName}
                      onChange={(e) => setNewNatForm(prev => ({ ...prev, juryName: e.target.value }))}
                      className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9.5px] font-bold text-slate-450 uppercase font-bold">Date de début</label>
                    <input 
                      type="date" 
                      value={newNatForm.startDate}
                      onChange={(e) => setNewNatForm(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full h-9 px-2 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="cursor-pointer h-9 w-full bg-[#093d80] hover:bg-[#072c5e] text-white text-xs font-bold rounded-lg transition"
                >
                  Ajouter l'Examen Officiel
                </button>
              </form>

              {/* National list */}
              <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
                <span className="text-[9.5px] font-black uppercase text-slate-450 tracking-wider block">Registres Actifs</span>
                {nationalExams.map(n => (
                  <div key={n.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-[#093d80] block">Examen : {n.examType} ({classes.find(c => c.id === n.classId)?.name || n.classId})</span>
                      <span className="text-[9.5px] text-slate-600 block font-medium">📍 {n.compositionCenter} • {n.juryName}</span>
                      <span className="text-[9px] text-slate-400 font-mono block">Début : {n.startDate}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteNatConfig(n.id)}
                      className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Candidate Numbers & Centers Setup (8 cols) */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
                <div className="space-y-0.5">
                  <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Affectation des Numéros de Table & Centres</h2>
                  <p className="text-[10.5px] text-slate-450">Renseignez ou générez automatiquement les numéros officiels d'examen pour chaque candidat.</p>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 border border-slate-200 rounded-xl shrink-0">
                  <span className="text-xs font-bold text-slate-550">Classe :</span>
                  <select 
                    value={activeNatClassFilter}
                    onChange={(e) => setActiveNatClassFilter(e.target.value)}
                    className="bg-[#093d80] text-white text-xs font-extrabold focus:outline-none rounded-md px-2 py-0.5 cursor-pointer"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id} className="text-slate-900 font-bold">{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action utilities */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-650">
                  <span>Effectif candidats :</span>
                  <strong className="text-indigo-700">{natStudents.length} élèves</strong>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleBulkGenerateTableNumbers}
                    className="cursor-pointer h-8 px-3 bg-[#093d80] hover:bg-[#072c5e] text-white text-[10.5px] font-bold rounded-lg transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Shuffle className="h-3.5 w-3.5 text-amber-400" />
                    <span>Générer Numéros de Table</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="cursor-pointer h-8 px-3 bg-slate-900 hover:bg-slate-800 text-white text-[10.5px] font-bold rounded-lg transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Imprimer Étiquettes de Table</span>
                  </button>
                </div>
              </div>

              {/* Table of Candidates */}
              {natStudents.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                        <th className="p-2.5 w-12 text-center">N°</th>
                        <th className="p-2.5">Candidat</th>
                        <th className="p-2.5">N° Table Officiel</th>
                        <th className="p-2.5">Centre de composition</th>
                        <th className="p-2.5 w-24">Jury</th>
                      </tr>
                    </thead>
                    <tbody>
                      {natStudents.map((std, idx) => (
                        <tr key={std.id} className="border-b border-slate-100 hover:bg-slate-50/20">
                          <td className="p-2.5 text-center text-slate-400 font-bold">{idx + 1}</td>
                          <td className="p-2.5 font-extrabold text-slate-800 uppercase leading-none">
                            {std.lastName} {std.firstName}
                            <span className="text-[8px] text-slate-400 block font-mono mt-1">Mat: {std.matricule} ({std.gender})</span>
                          </td>
                          <td className="p-2.5">
                            <input 
                              type="text" 
                              value={std.tableNumber || ''} 
                              placeholder="Ex: 26-102509"
                              onChange={(e) => handleStudentNatUpdate(std.id, 'tableNumber', e.target.value)}
                              className="w-32 h-7 px-2 border border-slate-250 bg-white rounded-md font-mono font-bold text-indigo-705 focus:outline-none"
                            />
                          </td>
                          <td className="p-2.5">
                            <input 
                              type="text" 
                              value={std.examCenter || ''} 
                              placeholder="Centre d'examen..."
                              onChange={(e) => handleStudentNatUpdate(std.id, 'examCenter', e.target.value)}
                              className="w-full h-7 px-2 border border-slate-200 bg-white rounded-md text-xs font-semibold focus:outline-none"
                            />
                          </td>
                          <td className="p-2.5">
                            <input 
                              type="text" 
                              value={std.jury || ''} 
                              placeholder="Jury..."
                              onChange={(e) => handleStudentNatUpdate(std.id, 'jury', e.target.value)}
                              className="w-16 h-7 px-2 border border-slate-200 bg-white rounded-md text-xs font-bold text-center focus:outline-none"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic text-center py-6">Aucun candidat dans cette classe.</p>
              )}
            </div>

          </div>
        )}

      </div>
      
    </div>
  );
}
