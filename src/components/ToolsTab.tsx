import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  UserCheck, 
  Download, 
  RefreshCw, 
  FolderSync, 
  Trash2, 
  CheckCircle2, 
  Search, 
  BookOpen, 
  Users, 
  Key,
  Database,
  Grid,
  Sparkles
} from 'lucide-react';

interface ClassItem {
  id: string;
  name: string;
  capacity: number;
}

interface StudentRecord {
  id: string;
  firstName: string;
  lastName: string;
  gender: 'M' | 'F';
  birthDate: string;
  classId: string;
  tutorName: string;
  tutorPhone: string;
  status: 'Inscrit' | 'Réinscrit' | 'Suspendu';
  matricule: string;
  matriculeNat?: string;
  photo?: string;
  city?: string;
}

interface ToolsTabProps {
  classes: ClassItem[];
  schoolName: string;
  academicYear: string;
}

export function ToolsTab({ classes, schoolName, academicYear }: ToolsTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'individual_photo' | 'bulk_photo' | 'bulk_class_transfer' | 'system_db'>('individual_photo');
  
  // Student database loaded from localStorage
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  // Load students on mount
  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = () => {
    const saved = localStorage.getItem('erp_student_records');
    if (saved) {
      setStudents(JSON.parse(saved));
    } else {
      // Fallback defaults
      const defaults: StudentRecord[] = [
        { id: 'std_1', firstName: 'Koffi', lastName: 'Yao Anderson', gender: 'M', birthDate: '2014-04-12', classId: '6A', tutorName: 'Koffi Blaise', tutorPhone: '+225 07 41 85 96 03', status: 'Inscrit', matricule: 'M-2026-4102', matriculeNat: 'CI-0125-9831K', photo: '', city: 'Cocody, Abidjan' },
        { id: 'std_2', firstName: 'Diomandé', lastName: 'Aminata', gender: 'F', birthDate: '2013-08-19', classId: '6B', tutorName: 'Diomandé Lanciné', tutorPhone: '+225 05 52 41 12 74', status: 'Réinscrit', matricule: 'M-2024-1185', matriculeNat: 'CI-0124-7744D', photo: '', city: 'Marcory, Abidjan' },
        { id: 'std_3', firstName: 'Kouassi', lastName: 'Koffi Charles', gender: 'M', birthDate: '2012-11-05', classId: '3A', tutorName: 'Mme Kouassi Hortense', tutorPhone: '+225 07 09 85 12 43', status: 'Inscrit', matricule: 'M-2026-9981', matriculeNat: 'CI-0125-1109C', photo: '', city: 'Bingerville' },
        { id: 'std_4', firstName: 'Sylla', lastName: 'Ibrahim Karim', gender: 'M', birthDate: '2010-01-30', classId: '3B', tutorName: 'Sylla Fatoumata', tutorPhone: '+225 01 02 03 04 05', status: 'Réinscrit', matricule: 'M-2023-0056', matriculeNat: 'CI-0123-5591I', photo: '', city: 'Plateau' },
        { id: 'std_5', firstName: 'Gomez', lastName: 'Marie-Chantal Enola', gender: 'F', birthDate: '2008-07-21', classId: '3A', tutorName: 'Gomez Robert (Ambass.)', tutorPhone: '+225 07 41 02 85 96', status: 'Inscrit', matricule: 'M-2026-0103', matriculeNat: 'CI-0125-0044E', photo: '', city: 'Cocody Riviera' }
      ];
      setStudents(defaults);
      localStorage.setItem('erp_student_records', JSON.stringify(defaults));
    }
  };

  const showStatus = (type: 'success' | 'error', message: string) => {
    setSaveStatus({ type, message });
    setTimeout(() => {
      setSaveStatus({ type: null, message: '' });
    }, 4000);
  };

  // ==========================================
  // TAB 1: INDIVIDUAL PHOTO BY MATRICULE
  // ==========================================
  const [photoSearchMatricule, setPhotoSearchMatricule] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [individualPhotoUrl, setIndividualPhotoUrl] = useState('');

  const handleSearchStudent = () => {
    const found = students.find(
      s => s.matricule.trim().toLowerCase() === photoSearchMatricule.trim().toLowerCase()
    );
    if (found) {
      setSelectedStudent(found);
      setIndividualPhotoUrl(found.photo || '');
    } else {
      setSelectedStudent(null);
      showStatus('error', `Aucun élève trouvé avec le matricule : ${photoSearchMatricule}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setIndividualPhotoUrl(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveIndividualPhoto = () => {
    if (!selectedStudent) return;
    
    const updated = students.map(s => {
      if (s.id === selectedStudent.id) {
        return { ...s, photo: individualPhotoUrl };
      }
      return s;
    });

    setStudents(updated);
    localStorage.setItem('erp_student_records', JSON.stringify(updated));
    setSelectedStudent(prev => prev ? { ...prev, photo: individualPhotoUrl } : null);
    showStatus('success', `Photo affectée avec succès à l'élève ${selectedStudent.firstName} ${selectedStudent.lastName}.`);
  };

  // ==========================================
  // TAB 2: BULK PHOTO ASSIGNMENT BY CLASS
  // ==========================================
  const [bulkPhotoClassId, setBulkPhotoClassId] = useState(classes[0]?.id || '6A');
  const classStudents = students.filter(s => s.classId === bulkPhotoClassId);

  const handleBulkPhotoUpload = (studentId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      const updated = students.map(s => {
        if (s.id === studentId) {
          return { ...s, photo: base64String };
        }
        return s;
      });
      setStudents(updated);
      localStorage.setItem('erp_student_records', JSON.stringify(updated));
      showStatus('success', 'Photo mise à jour.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = (studentId: string) => {
    const updated = students.map(s => {
      if (s.id === studentId) {
        return { ...s, photo: '' };
      }
      return s;
    });
    setStudents(updated);
    localStorage.setItem('erp_student_records', JSON.stringify(updated));
    showStatus('success', 'Photo retirée.');
  };

  // ==========================================
  // TAB 3: BULK CLASS TRANSFER (AFFECTATION GROUPÉE)
  // ==========================================
  const [transferSourceClassId, setTransferSourceClassId] = useState(classes[0]?.id || '6A');
  const [transferTargetClassId, setTransferTargetClassId] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  const sourceStudents = students.filter(s => s.classId === transferSourceClassId);

  const handleToggleSelectStudent = (id: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedStudentIds.length === sourceStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(sourceStudents.map(s => s.id));
    }
  };

  const handleExecuteTransfer = () => {
    if (!transferTargetClassId) {
      showStatus('error', 'Veuillez sélectionner une classe de destination.');
      return;
    }
    if (transferSourceClassId === transferTargetClassId) {
      showStatus('error', 'La classe de destination doit être différente de la classe source.');
      return;
    }
    if (selectedStudentIds.length === 0) {
      showStatus('error', 'Veuillez cocher au moins un élève à transférer.');
      return;
    }

    const updated = students.map(s => {
      if (selectedStudentIds.includes(s.id)) {
        return { ...s, classId: transferTargetClassId };
      }
      return s;
    });

    setStudents(updated);
    localStorage.setItem('erp_student_records', JSON.stringify(updated));
    setSelectedStudentIds([]);
    showStatus('success', `Succès : ${selectedStudentIds.length} élèves ont été réaffectés vers la classe ${classes.find(c => c.id === transferTargetClassId)?.name}.`);
  };

  // ==========================================
  // TAB 4: SYSTEM UTILITIES & DATABASE (JSON)
  // ==========================================
  const handleExportData = () => {
    const backup: Record<string, string | null> = {};
    const keysToBackup = [
      'erp_student_records',
      'erp_student_marks',
      'timetable_classes',
      'timetable_teachers',
      'timetable_rooms',
      'timetable_subjects',
      'timetable_courses',
      'timetable_absences',
      'erp_school_settings'
    ];

    keysToBackup.forEach(k => {
      backup[k] = localStorage.getItem(k);
    });

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sauvegarde_scolaire_${schoolName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showStatus('success', 'Fichier de sauvegarde généré et téléchargé.');
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const backup = JSON.parse(event.target?.result as string);
        Object.keys(backup).forEach(key => {
          if (backup[key] !== null) {
            localStorage.setItem(key, backup[key]);
          }
        });
        showStatus('success', 'Restauration complète effectuée avec succès ! Rechargement des données...');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (err: any) {
        showStatus('error', `Échec de l'importation : Le fichier JSON est invalide ou corrompu.`);
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (window.confirm("Êtes-vous sûr de vouloir vider toutes les modifications et rétablir les données d'origine ? Cette opération est irréversible.")) {
      localStorage.clear();
      showStatus('success', 'Données effacées. Réinitialisation de la session...');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };

  const handleGenerateAccessCodes = () => {
    // Look up parent or student login accounts
    const saved = localStorage.getItem('erp_student_records');
    if (!saved) {
      showStatus('error', 'Aucun élève disponible pour générer des codes d’accès.');
      return;
    }
    const studentsList = JSON.parse(saved);
    const updated = studentsList.map((s: any) => {
      // If code parent/student doesn't exist, create random 6 digit numeric code
      const accessCode = s.accessCode || Math.floor(100000 + Math.random() * 90000).toString();
      return { ...s, accessCode };
    });
    localStorage.setItem('erp_student_records', JSON.stringify(updated));
    setStudents(updated);
    showStatus('success', 'Codes d’accès générés en masse pour tous les élèves !');
  };

  return (
    <div className="space-y-6">
      
      {/* Upper Status Banner */}
      {saveStatus.type && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 border shadow-sm transition animate-bounce ${
          saveStatus.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-250' : 'bg-rose-50 text-rose-800 border-rose-250'
        }`}>
          <span className="text-xl">{saveStatus.type === 'success' ? '✓' : '⚠️'}</span>
          <span className="text-xs font-bold">{saveStatus.message}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-[#0b4998] via-[#093d80] to-[#072c5e] border border-[#f3aa1c]/30 text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <span className="bg-[#ee7b11] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider select-none">
            🛠️ Outils Académiques & Administration
          </span>
          <h1 className="text-2xl font-black uppercase tracking-tight">
            Menu Administratif & Utilitaires
          </h1>
          <p className="text-xs text-slate-350 max-w-xl font-medium">
            Affectez des photos aux dossiers d'élèves, organisez les passages en masse de classes, ou gérez les sauvegardes de votre base locale.
          </p>
        </div>
        <div className="text-right shrink-0">
          <span className="text-slate-400 text-[10px] font-bold block uppercase tracking-wider">Établissement</span>
          <span className="text-sm font-extrabold text-[#f3aa1c] block">{schoolName}</span>
          <span className="text-[10px] text-slate-450 block font-mono">Année Académique {academicYear}</span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveSubTab('individual_photo')}
          className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
            activeSubTab === 'individual_photo' 
              ? 'bg-slate-900 text-white border-slate-950 shadow-xs' 
              : 'bg-white text-slate-650 hover:bg-slate-50 border-slate-200'
          }`}
        >
          <Camera className="h-4 w-4" />
          <span>Affecter Photo Individuelle</span>
        </button>

        <button
          onClick={() => setActiveSubTab('bulk_photo')}
          className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
            activeSubTab === 'bulk_photo' 
              ? 'bg-slate-900 text-white border-slate-950 shadow-xs' 
              : 'bg-white text-slate-650 hover:bg-slate-50 border-slate-200'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Photos Groupées par Classe</span>
        </button>

        <button
          onClick={() => setActiveSubTab('bulk_class_transfer')}
          className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
            activeSubTab === 'bulk_class_transfer' 
              ? 'bg-slate-900 text-white border-slate-950 shadow-xs' 
              : 'bg-white text-slate-650 hover:bg-slate-50 border-slate-200'
          }`}
        >
          <FolderSync className="h-4 w-4" />
          <span>Réaffectation / Transfert de Classe</span>
        </button>

        <button
          onClick={() => setActiveSubTab('system_db')}
          className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
            activeSubTab === 'system_db' 
              ? 'bg-slate-900 text-white border-slate-950 shadow-xs' 
              : 'bg-white text-slate-650 hover:bg-slate-50 border-slate-200'
          }`}
        >
          <Database className="h-4 w-4" />
          <span>Base de données & Sauvegardes</span>
        </button>
      </div>

      {/* Sub-Tab Contents */}
      <div className="bg-slate-50 rounded-2xl">
        
        {/* TAB 1: INDIVIDUAL PHOTO */}
        {activeSubTab === 'individual_photo' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Search and input card */}
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <Search className="h-4 w-4 text-[#ee7b11]" />
                <span>Recherche Dossier Élève</span>
              </h2>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Matricule Scolaire</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input 
                      type="text" 
                      placeholder="Ex: M-2026-4102"
                      value={photoSearchMatricule}
                      onChange={(e) => setPhotoSearchMatricule(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchStudent()}
                      className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-250 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-slate-400"
                    />
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  </div>
                  <button 
                    onClick={handleSearchStudent}
                    className="cursor-pointer h-10 px-4 bg-[#ee7b11] hover:bg-[#d9700f] text-white text-xs font-bold rounded-xl transition"
                  >
                    Rechercher
                  </button>
                </div>
              </div>

              {selectedStudent && (
                <div className="space-y-4 pt-3 border-t border-slate-100">
                  <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-700">
                    <div className="flex justify-between"><span className="font-semibold text-slate-400">Nom Complet :</span> <strong className="text-slate-800">{selectedStudent.lastName} {selectedStudent.firstName}</strong></div>
                    <div className="flex justify-between"><span className="font-semibold text-slate-400">Classe :</span> <strong>{selectedStudent.classId}</strong></div>
                    <div className="flex justify-between"><span className="font-semibold text-slate-400">Genre :</span> <strong>{selectedStudent.gender === 'M' ? 'Masculin' : 'Féminin'}</strong></div>
                    <div className="flex justify-between"><span className="font-semibold text-slate-400">Tuteur :</span> <strong>{selectedStudent.tutorName}</strong></div>
                    <div className="flex justify-between"><span className="font-semibold text-slate-400">Statut :</span> <span className="text-emerald-700 font-extrabold">{selectedStudent.status}</span></div>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase">Option 1 : Importer une image locale</label>
                      <div className="border border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition cursor-pointer relative">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <Upload className="h-6 w-6 text-slate-400 mx-auto mb-1.5" />
                        <span className="text-[10px] text-slate-550 block font-bold">Glissez ou sélectionnez un fichier photo</span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">Formats acceptés : JPG, PNG (Taille max: 2 Mo)</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase">Option 2 : Lien URL de l'image</label>
                      <input 
                        type="text" 
                        placeholder="https://exemple.com/photo.jpg"
                        value={individualPhotoUrl}
                        onChange={(e) => setIndividualPhotoUrl(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-slate-250 text-xs focus:outline-none"
                      />
                    </div>

                    <button
                      onClick={handleSaveIndividualPhoto}
                      className="cursor-pointer h-10 w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <Camera className="h-4 w-4 text-emerald-400" />
                      <span>Enregistrer la photo sur la fiche</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Card: Preview Mockup Card */}
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
              {selectedStudent ? (
                <div className="space-y-4 w-full max-w-sm">
                  <span className="text-center block text-[10px] font-black uppercase text-slate-400 tracking-wider">Aperçu Carte Scolaire</span>
                  
                  {/* School ID Card Mockup */}
                  <div className="border border-slate-250 bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl p-5 shadow-md relative overflow-hidden font-sans border-t-4 border-t-indigo-600">
                    {/* Header */}
                    <div className="flex justify-between items-start border-b border-slate-200 pb-3 mb-4">
                      <div>
                        <span className="text-[7.5px] uppercase font-black tracking-widest text-indigo-700 block leading-none">{schoolName}</span>
                        <span className="text-[10px] font-extrabold text-slate-850 block mt-0.5">CARTE ÉLÈVE OFFICIELLE</span>
                      </div>
                      <span className="text-[8px] font-bold text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded bg-white">
                        {academicYear}
                      </span>
                    </div>

                    {/* Photo + Info */}
                    <div className="flex gap-4 items-center">
                      <div className="w-24 h-28 border border-slate-250 rounded-2xl bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-xs relative">
                        {individualPhotoUrl ? (
                          <img src={individualPhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center space-y-1">
                            <span className="text-2xl text-slate-350 block">👤</span>
                            <span className="text-[8px] text-slate-400 uppercase font-black tracking-wider leading-none">Photo vide</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5 min-w-0">
                        <div>
                          <span className="text-[8px] font-semibold text-slate-450 block uppercase leading-none">Nom complet</span>
                          <span className="text-xs font-black text-slate-850 truncate block leading-tight">{selectedStudent.lastName} {selectedStudent.firstName}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[8px] font-semibold text-slate-450 block uppercase leading-none">Classe</span>
                            <span className="text-[11px] font-extrabold text-indigo-700 block leading-none mt-0.5">{selectedStudent.classId}</span>
                          </div>
                          <div>
                            <span className="text-[8px] font-semibold text-slate-450 block uppercase leading-none">Genre</span>
                            <span className="text-[11px] font-extrabold text-slate-800 block leading-none mt-0.5">{selectedStudent.gender}</span>
                          </div>
                        </div>

                        <div>
                          <span className="text-[8px] font-semibold text-slate-450 block uppercase leading-none">Matricule</span>
                          <span className="text-[10.5px] font-bold text-slate-900 font-mono block leading-none mt-0.5">{selectedStudent.matricule}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-dashed border-slate-200 flex justify-between items-center text-[7.5px] font-semibold text-slate-400">
                      <span>Statut : {selectedStudent.status}</span>
                      <span className="text-[8px] text-indigo-600 font-extrabold">ACCRÉDITÉ</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-3 p-6 text-slate-400">
                  <span className="text-4xl block">🔍</span>
                  <p className="text-xs italic max-w-xs leading-relaxed">
                    Veuillez saisir un matricule dans le champ de recherche pour charger et modifier la photo d'un élève.
                  </p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: BULK PHOTO ASSIGNMENT BY CLASS */}
        {activeSubTab === 'bulk_photo' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
              <div className="space-y-0.5">
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Affectation Groupée de Photos</h2>
                <p className="text-[10.5px] text-slate-450">Attribuez ou réinitialisez rapidement les photos de tous les élèves d'une classe.</p>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 border border-slate-200 rounded-xl shrink-0">
                <span className="text-xs font-bold text-slate-550">Classe cible :</span>
                <select 
                  value={bulkPhotoClassId}
                  onChange={(e) => setBulkPhotoClassId(e.target.value)}
                  className="bg-[#0b4998] text-white text-xs font-extrabold focus:outline-none rounded-md px-2 py-0.5 cursor-pointer"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id} className="text-slate-900 font-bold">{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {classStudents.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="p-3 font-bold text-slate-500 w-16 text-center">N°</th>
                      <th className="p-3 font-bold text-slate-500 w-24">Photo</th>
                      <th className="p-3 font-bold text-slate-500">Nom Complet</th>
                      <th className="p-3 font-bold text-slate-500 w-36">Matricule</th>
                      <th className="p-3 font-bold text-slate-500 w-64 text-center">Action d'import</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classStudents.map((std, idx) => (
                      <tr key={std.id} className="border-b border-slate-100 hover:bg-slate-50/40">
                        <td className="p-3 text-center text-slate-450 font-bold">{idx + 1}</td>
                        <td className="p-3">
                          <div className="w-10 h-12 border border-slate-200 rounded bg-slate-50 flex items-center justify-center overflow-hidden">
                            {std.photo ? (
                              <img src={std.photo} alt={std.lastName} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-base">👤</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 font-bold text-slate-800">{std.lastName} {std.firstName}</td>
                        <td className="p-3 font-mono font-bold text-indigo-700">{std.matricule}</td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-2">
                            <div className="relative">
                              <button className="cursor-pointer h-7 px-3 bg-slate-900 hover:bg-slate-850 text-white text-[10.5px] font-bold rounded-lg transition flex items-center gap-1">
                                <Upload className="h-3 w-3 text-emerald-400" />
                                <span>Choisir Photo</span>
                              </button>
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => handleBulkPhotoUpload(std.id, e)}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                              />
                            </div>
                            
                            {std.photo && (
                              <button 
                                onClick={() => handleRemovePhoto(std.id)}
                                className="cursor-pointer h-7 w-7 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-center transition"
                                title="Supprimer la photo"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 border border-slate-200 rounded-2xl text-center italic text-slate-400">
                Aucun élève inscrit dans cette classe.
              </div>
            )}
          </div>
        )}

        {/* TAB 3: BULK CLASS TRANSFER */}
        {activeSubTab === 'bulk_class_transfer' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
              <div className="space-y-0.5">
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Réaffectation Collective / Transfert de Classe</h2>
                <p className="text-[10.5px] text-slate-450">Transférez en bloc plusieurs élèves d'une classe d'origine vers une autre classe de destination.</p>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 border border-slate-200 rounded-xl shrink-0">
                <span className="text-xs font-bold text-slate-550">Classe d'origine :</span>
                <select 
                  value={transferSourceClassId}
                  onChange={(e) => {
                    setTransferSourceClassId(e.target.value);
                    setSelectedStudentIds([]);
                  }}
                  className="bg-[#0b4998] text-white text-xs font-extrabold focus:outline-none rounded-md px-2 py-0.5 cursor-pointer"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id} className="text-slate-900 font-bold">{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {sourceStudents.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left list table (8 cols) */}
                <div className="lg:col-span-8 space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-500 px-1">
                    <span>Élèves de la classe source ({sourceStudents.length})</span>
                    <button 
                      onClick={handleToggleSelectAll}
                      className="cursor-pointer text-[#0b4998] hover:underline"
                    >
                      {selectedStudentIds.length === sourceStudents.length ? "Tout décocher" : "Tout cocher"}
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="p-3 font-bold text-slate-500 w-12 text-center">Choix</th>
                          <th className="p-3 font-bold text-slate-500">Nom Complet</th>
                          <th className="p-3 font-bold text-slate-500">Matricule</th>
                          <th className="p-3 font-bold text-slate-500 w-20 text-center">Genre</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sourceStudents.map(std => (
                          <tr 
                            key={std.id} 
                            onClick={() => handleToggleSelectStudent(std.id)}
                            className="border-b border-slate-100 hover:bg-slate-50/40 cursor-pointer"
                          >
                            <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                              <input 
                                type="checkbox" 
                                checked={selectedStudentIds.includes(std.id)}
                                onChange={() => handleToggleSelectStudent(std.id)}
                                className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                              />
                            </td>
                            <td className="p-3 font-bold text-slate-800">{std.lastName} {std.firstName}</td>
                            <td className="p-3 font-mono text-slate-500 font-semibold">{std.matricule}</td>
                            <td className="p-3 text-center font-bold text-slate-600">{std.gender}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right control box (4 cols) */}
                <div className="lg:col-span-4 bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider">Opération de transfert</h3>
                  
                  <div className="bg-white p-3 border border-slate-200 rounded-xl text-center space-y-1">
                    <span className="text-slate-400 text-[10px] font-bold block uppercase">Élèves sélectionnés</span>
                    <strong className="text-2xl font-black text-indigo-700">{selectedStudentIds.length}</strong>
                    <span className="text-[10px] text-slate-500 block">sur {sourceStudents.length} disponibles</span>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase">Classe de destination</label>
                    <select 
                      value={transferTargetClassId}
                      onChange={(e) => setTransferTargetClassId(e.target.value)}
                      className="w-full h-10 px-3 border border-slate-250 rounded-xl text-xs font-bold focus:outline-none"
                    >
                      <option value="">Sélectionner la classe...</option>
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleExecuteTransfer}
                    className="cursor-pointer h-10 w-full bg-[#0b4998] hover:bg-[#093d80] text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <FolderSync className="h-4 w-4" />
                    <span>Transférer les élèves</span>
                  </button>
                </div>

              </div>
            ) : (
              <div className="p-8 border border-slate-200 rounded-2xl text-center italic text-slate-400">
                Aucun élève inscrit dans cette classe.
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SYSTEM UTILITIES */}
        {activeSubTab === 'system_db' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            
            {/* Backup & Restore */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm space-y-5">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
                <Database className="h-4.5 w-4.5 text-[#0b4998]" />
                <span>Sauvegarde & Restauration (JSON)</span>
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Sauvegardez l'ensemble des données scolaires (matières, enseignants, élèves, classes, relevés de notes, emploi du temps) dans un fichier JSON portable sur votre ordinateur. Vous pourrez le restaurer ultérieurement pour retrouver l'état exact de votre école.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleExportData}
                  className="cursor-pointer h-10 px-4 bg-[#0b4998] hover:bg-[#093d80] text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-xs"
                >
                  <Download className="h-4 w-4" />
                  <span>Exporter (Sauvegarder)</span>
                </button>

                <div className="relative">
                  <button className="cursor-pointer h-10 w-full px-4 bg-slate-900 hover:bg-slate-850 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-xs">
                    <Upload className="h-4 w-4" />
                    <span>Importer (Restaurer)</span>
                  </button>
                  <input 
                    type="file" 
                    accept=".json"
                    onChange={handleImportData}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>
              </div>
            </div>

            {/* Utility features */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm space-y-5">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
                <Sparkles className="h-4.5 w-4.5 text-[#ee7b11]" />
                <span>Actions Administratives Utiles</span>
              </h2>

              <div className="space-y-4">
                {/* Access code generator */}
                <div className="flex items-start gap-4 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl shrink-0 mt-0.5">
                    <Key className="h-4.5 w-4.5" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-850">Générateur de Codes d'Accès Élèves/Parents</h3>
                    <p className="text-[10.5px] text-slate-500 leading-normal">
                      Génère des codes PIN uniques pour chaque élève/parent manquant afin de leur permettre de se connecter à leurs portails dédiés respectifs.
                    </p>
                    <button
                      onClick={handleGenerateAccessCodes}
                      className="cursor-pointer h-8 px-3 bg-indigo-600 hover:bg-indigo-550 text-white text-[10.5px] font-bold rounded-lg transition"
                    >
                      Générer les codes PIN
                    </button>
                  </div>
                </div>

                {/* Reset system */}
                <div className="flex items-start gap-4 p-3 bg-rose-50/50 border border-rose-100 rounded-2xl">
                  <div className="p-2 bg-rose-50 text-rose-700 rounded-xl shrink-0 mt-0.5">
                    <Trash2 className="h-4.5 w-4.5" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-850 text-rose-900">Nettoyage / Rétablir à Zéro</h3>
                    <p className="text-[10.5px] text-slate-500 leading-normal">
                      Efface l'intégralité du cache local (réinitialise les données des élèves, des profs, et détruit l'emploi du temps actuel) pour repartir sur une installation propre.
                    </p>
                    <button
                      onClick={handleResetData}
                      className="cursor-pointer h-8 px-3 bg-rose-600 hover:bg-rose-700 text-white text-[10.5px] font-bold rounded-lg transition"
                    >
                      Effacer et réinitialiser
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
      
    </div>
  );
}
