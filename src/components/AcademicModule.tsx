import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Check, 
  Layers, 
  ClipboardCheck, 
  Bookmark, 
  TrendingUp, 
  AlertCircle 
} from 'lucide-react';
import { ClassItem, SubjectItem } from '../types';

interface AcademicModuleProps {
  classes: ClassItem[];
  subjects: SubjectItem[];
}

interface ClassDiaryEntry {
  id: string;
  createdAt: string;
  classId: string;
  subjectId: string;
  topicTitle: string;
  lessonSummary: string;
  homeworkAssigned: string;
  dueDate: string;
  authorSig: string;
}

export default function AcademicModule({
  classes,
  subjects
}: AcademicModuleProps) {
  
  // Persistent Class Notebook Entries
  const [diaryEntries, setDiaryEntries] = useState<ClassDiaryEntry[]>(() => {
    const saved = localStorage.getItem('erp_cahier_textes');
    if (saved) return JSON.parse(saved);
    // defaults
    return [
      { id: 'diary_1', createdAt: '2026-06-15', classId: '6A', subjectId: 'math', topicTitle: 'Calculs de fractions simples', lessonSummary: 'Rappels sur le dénominateur commun. Addition et soustraction de fractions simples. Exercices d\'application directs au tableau.', homeworkAssigned: 'Exercice 3, 5 et 8 pages 42 du manuel scolaire.', dueDate: '2026-06-18', authorSig: 'M. Martin' },
      { id: 'diary_2', createdAt: '2026-06-14', classId: '6A', subjectId: 'fr', topicTitle: 'Le subjonctif présent : valeurs et désinence', lessonSummary: 'Étude d\'un texte littéraire. Repérage des formes verbales au subjonctif. Règles de conjugaison du troisième groupe.', homeworkAssigned: 'Rédiger 4 phrases libres employant le subjonctif présent.', dueDate: '2026-06-17', authorSig: 'Mme Koffi' },
      { id: 'diary_3', createdAt: '2026-06-13', classId: '3B', subjectId: 'pc', topicTitle: 'Lois d\'Ohm et conduction linéaire', lessonSummary: 'Mesure de tension dans un circuit électrique branché en dérivation. Calcul de la résistance équivalente.', homeworkAssigned: 'Terminer le compte-rendu du TP n°4.', dueDate: '2026-06-16', authorSig: 'M. Soro' }
    ];
  });

  // Persistent pedagogical progress dictionary { "classId_subjectId": number (percent) }
  const [syllabusProgress, setSyllabusProgress] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('erp_syllabus_progress');
    if (saved) return JSON.parse(saved);
    // defaults
    return {
      '6A_math': 72,
      '6A_fr': 80,
      '6A_pc': 60,
      '3B_math': 65,
      '3B_pc': 71,
      '3A_math': 78
    };
  });

  // Saving states
  useEffect(() => {
    localStorage.setItem('erp_cahier_textes', JSON.stringify(diaryEntries));
  }, [diaryEntries]);

  useEffect(() => {
    localStorage.setItem('erp_syllabus_progress', JSON.stringify(syllabusProgress));
  }, [syllabusProgress]);

  // UI state
  const [activeSubTab, setActiveSubTab] = useState<'textbook' | 'progress' | 'auditing'>('textbook');
  
  // Lesson note form
  const [noteForm, setNoteForm] = useState({
    classId: classes[0]?.id || '6A',
    subjectId: subjects[0]?.id || 'math',
    topicTitle: '',
    lessonSummary: '',
    homeworkAssigned: '',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    authorSig: 'M. Martin'
  });

  // Handle submit lesson diary entry
  const handleSubmitNotebook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteForm.topicTitle.trim() || !noteForm.lessonSummary.trim()) {
      alert("Veuillez renseigner le thème et le résumé du cours !");
      return;
    }

    const newNote: ClassDiaryEntry = {
      id: 'diary_' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
      classId: noteForm.classId,
      subjectId: noteForm.subjectId,
      topicTitle: noteForm.topicTitle.trim(),
      lessonSummary: noteForm.lessonSummary.trim(),
      homeworkAssigned: noteForm.homeworkAssigned.trim() || "Aucun devoir assigné.",
      dueDate: noteForm.dueDate,
      authorSig: noteForm.authorSig.trim() || "Directeur/Enseignant"
    };

    setDiaryEntries(prev => [newNote, ...prev]);
    
    // Increment progress slightly as a helpful trigger
    const progressKey = `${noteForm.classId}_${noteForm.subjectId}`;
    const curVal = syllabusProgress[progressKey] || 50;
    const nextVal = Math.min(100, curVal + 2);
    setSyllabusProgress(prev => ({
      ...prev,
      [progressKey]: nextVal
    }));

    alert("Le cahier de textes électronique a été signé et mis à jour !");
    
    setNoteForm(prev => ({
      ...prev,
      topicTitle: '',
      lessonSummary: '',
      homeworkAssigned: ''
    }));
  };

  const handleDeleteEntry = (id: string) => {
    if (window.confirm("Voulez-vous rejeter et supprimer cet émargement de cours ?")) {
      setDiaryEntries(prev => prev.filter(e => e.id !== id));
    }
  };

  const handleUpdateProgressPercent = (classId: string, subjectId: string, percentVal: number) => {
    setSyllabusProgress(prev => ({
      ...prev,
      [`${classId}_${subjectId}`]: Math.max(0, Math.min(100, percentVal))
    }));
  };

  return (
    <div className="space-y-6">
      
      {/* Tab Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-light">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="h-5.5 w-5.5 text-indigo-650" />
            <span>Gestion Académique & Suivi Pédagogique</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Tenez à jour le cahier de textes numérique pour chaque classe scolaire, contrôlez l'avancement des syllabus nationaux et auditez les séances d'apprentissage.
          </p>
        </div>

        {/* Sub Navigation controls */}
        <div className="flex gap-2.5">
          <button 
            onClick={() => setActiveSubTab('textbook')}
            className={`cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'textbook' ? 'bg-[#0b4998] text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <Bookmark className="h-4 w-4" />
            Cahier de Textes
          </button>
          <button 
            onClick={() => setActiveSubTab('progress')}
            className={`cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'progress' ? 'bg-[#0b4998] text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            Progression des Matières
          </button>
          <button 
            onClick={() => setActiveSubTab('auditing')}
            className={`cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'auditing' ? 'bg-[#0b4998] text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <ClipboardCheck className="h-4 w-4" />
            Audit & Émargement
          </button>
        </div>
      </div>

      {/* RENDER VIEW: CLASS TEXTBOOK (CAHIER DE TEXTES ELECTRONIQUE) */}
      {activeSubTab === 'textbook' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Form left block */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase text-[#0b4998] tracking-widest flex items-center gap-1.5">
              <span>Remplir le Cahier de Textes</span>
            </h3>

            <form onSubmit={handleSubmitNotebook} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Classe Cible</label>
                  <select 
                    value={noteForm.classId}
                    onChange={(e) => setNoteForm(prev => ({ ...prev, classId: e.target.value }))}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Matière Enseignée</label>
                  <select 
                    value={noteForm.subjectId}
                    onChange={(e) => setNoteForm(prev => ({ ...prev, subjectId: e.target.value }))}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Définition du Thème principal du jour</label>
                <input 
                  type="text" 
                  required
                  placeholder="ex: Chapitre 3 : Étude calorimétrique des fluides" 
                  value={noteForm.topicTitle}
                  onChange={(e) => setNoteForm(prev => ({ ...prev, topicTitle: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Résumé pédagogique de la séance (Notions clés)</label>
                <textarea 
                  required
                  rows={3}
                  placeholder="Écrivez le résumé détaillé du cours dispensé." 
                  value={noteForm.lessonSummary}
                  onChange={(e) => setNoteForm(prev => ({ ...prev, lessonSummary: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none min-h-[80px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#ee7b11] uppercase">Travail à faire (Devoirs de maison)</label>
                <input 
                  type="text" 
                  placeholder="ex: Résoudre problèmes n°7 et n°9 p. 112" 
                  value={noteForm.homeworkAssigned}
                  onChange={(e) => setNoteForm(prev => ({ ...prev, homeworkAssigned: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Date de Rendu devoir</label>
                  <input 
                    type="date" 
                    value={noteForm.dueDate}
                    onChange={(e) => setNoteForm(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Signature (Enseignant/Visa)</label>
                  <input 
                    type="text" 
                    placeholder="Signature" 
                    value={noteForm.authorSig}
                    onChange={(e) => setNoteForm(prev => ({ ...prev, authorSig: e.target.value }))}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="cursor-pointer w-full py-2 px-3 bg-[#ee7b11] hover:bg-[#d66f0e] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition mt-3"
              >
                <Plus className="h-4 w-4" />
                Soumettre et Signer le Cahier
              </button>
            </form>
          </div>

          {/* Diary listings feed right block */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-905 uppercase tracking-tight pb-3 border-b border-indigo-50">
              Émargements & Séances de Cours Récentes ({diaryEntries.length})
            </h3>

            <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
              {diaryEntries.map(entry => {
                const clsName = classes.find(c => c.id === entry.classId)?.name || entry.classId;
                const subName = subjects.find(s => s.id === entry.subjectId)?.name || entry.subjectId;
                
                return (
                  <div key={entry.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:shadow-xs transition space-y-3 relative group">
                    <button 
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 cursor-pointer p-1 text-slate-350 hover:text-red-500 rounded-md transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>

                    {/* Metadata Header Line */}
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold">
                      <span className="px-2 py-0.5 bg-[#0b4998]/10 text-[#0b4998] rounded uppercase">Classe : {clsName}</span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded uppercase">Cours : {subName}</span>
                      <span className="text-slate-400 font-mono">Enregistré le : {entry.createdAt}</span>
                    </div>

                    {/* Content Detail */}
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-slate-900">{entry.topicTitle}</h4>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-sans">{entry.lessonSummary}</p>
                    </div>

                    {/* Homework section */}
                    {entry.homeworkAssigned && (
                      <div className="p-2.5 rounded-xl bg-[#ee7b11]/5 border border-[#f3aa1c]/20 text-[10.5px] leading-relaxed">
                        <span className="font-extrabold text-[#ee7b11]">🎒 Devoir à faire :</span> <span className="text-slate-800 font-medium">{entry.homeworkAssigned}</span> <span className="text-slate-550 font-bold font-mono text-[9px] block text-right mt-1">À rendre pour le {entry.dueDate}</span>
                      </div>
                    )}

                    {/* Signature */}
                    <div className="text-right text-[10px] font-bold text-slate-450 italic flex items-center justify-end gap-1">
                      <span>Signé électroniquement par :</span>
                      <span className="text-[#0b4998] font-black">{entry.authorSig}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* RENDER VIEW: SYLLABUS PROGRESS TRACKER */}
      {activeSubTab === 'progress' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-black text-[#0b4998] uppercase">Progression Pédagogique Nationale</h3>
          <p className="text-xs text-slate-500 font-medium">
            Entrez ou ajustez manuellement le niveau de progression du calendrier des programmes nationaux pour chaque classe et chaque discipline d'enseignement.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map(cls => (
              <div key={cls.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-150 space-y-3.5">
                <span className="inline-block px-2.5 py-0.5 rounded-lg text-xs font-black text-white" style={{ backgroundColor: cls.color || '#000' }}>
                  Progression de la {cls.name}
                </span>

                <div className="space-y-3">
                  {subjects.map(sub => {
                    const progressKey = `${cls.id}_${sub.id}`;
                    const currentPercent = syllabusProgress[progressKey] || 45;
                    
                    return (
                      <div key={sub.id} className="space-y-1">
                        <div className="flex justify-between items-center text-[10.5px] font-bold">
                          <span className="text-slate-805">{sub.name}</span>
                          <div className="flex items-center gap-1">
                            <input 
                              type="number" 
                              min="0" 
                              max="100"
                              value={currentPercent}
                              onChange={(e) => handleUpdateProgressPercent(cls.id, sub.id, parseInt(e.target.value) || 0)}
                              className="w-10 text-center bg-white border border-slate-200 p-0.5 text-[10px] font-bold rounded"
                            />
                            <span>%</span>
                          </div>
                        </div>

                        {/* Progress Bar styled nicely */}
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${
                              currentPercent < 50 ? 'bg-[#ee7b11]' : 'bg-[#0b4998]'
                            }`}
                            style={{ width: `${currentPercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RENDER VIEW: AUDITING AND VERIFICATION OF HOURS */}
      {activeSubTab === 'auditing' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-black text-[#0b4998] uppercase">Rapport de Contrôle & de Conformité des Heures dispensées</h3>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed">
            Le tableau d'émargement récapitule de manière séquentielle le nombre de séances renseignées dans le cahier de textes e-learning par rapport à la grille. Les inspecteurs généraux signent le rapport d'étude.
          </p>

          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-450 border-b border-rose-100 font-black uppercase">
                  <th className="p-3">Dossier Classe</th>
                  <th className="p-3">Discipline</th>
                  <th className="p-3">Séances déclarées</th>
                  <th className="p-3">Assiduité indicative</th>
                  <th className="p-3">Dernier Émargement enregistré</th>
                  <th className="p-3">Statut Audit</th>
                </tr>
              </thead>
              <tbody>
                {classes.map(cls => (
                  subjects.map(sub => {
                    const entriesCount = diaryEntries.filter(e => e.classId === cls.id && e.subjectId === sub.id).length;
                    const lastEntry = diaryEntries.find(e => e.classId === cls.id && e.subjectId === sub.id);
                    
                    return (
                      <tr key={`${cls.id}_${sub.id}`} className="border-b border-slate-100 hover:bg-slate-100/40 transition">
                        <td className="p-3 font-extrabold text-[#0b4998]">{cls.name}</td>
                        <td className="p-3 font-bold text-slate-700">{sub.name}</td>
                        <td className="p-3 font-bold">{entriesCount} cours émargés</td>
                        <td className="p-3">
                          <span className="font-extrabold text-emerald-800">{entriesCount > 0 ? "Aptitude Haute (95%)" : "Non émargé (0%)"}</span>
                        </td>
                        <td className="p-3 font-mono text-slate-500">{lastEntry ? lastEntry.createdAt : 'Aucune entrée'}</td>
                        <td className="p-3">
                          {entriesCount > 0 ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase tracking-wider">Homologué</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[9px] font-black uppercase tracking-wider">En attente</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
