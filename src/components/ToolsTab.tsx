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
  Sparkles,
  Calendar,
  ArrowRight,
  Archive,
  GraduationCap,
  FileSpreadsheet,
  Scissors
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
  status: 'Inscrit' | 'Réinscrit' | 'Redoublant' | 'Suspendu' | 'Diplômé';
  matricule: string;
  matriculeNat?: string;
  photo?: string;
  city?: string;
  accessCode?: string;
}

interface StudentMark {
  id: string;
  studentId: string;
  classId: string;
  subjectId: string;
  examName: string;
  weight: number;
  score: number;
  recordedAt: string;
}

interface ToolsTabProps {
  classes: ClassItem[];
  schoolName: string;
  academicYear: string;
  setAcademicYear: (year: string) => void;
}

export function ToolsTab({ classes, schoolName, academicYear, setAcademicYear }: ToolsTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'individual_photo' | 'bulk_photo' | 'bulk_class_transfer' | 'import_excel' | 'year_transition' | 'system_db'>('individual_photo');
  
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
    }, 4500);
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
  // TAB 4: IMPORT STUDENTS FROM EXCEL / CSV
  // ==========================================
  const [pasteData, setPasteData] = useState('');
  const [importReport, setImportReport] = useState<{
    successCount: number;
    errors: string[];
  } | null>(null);

  const handleDownloadTemplate = () => {
    // Semicolon-separated CSV template for French Excel compatibility
    const headers = "Nom;Prenoms;Genre;DateNaissance;Classe;NomTuteur;TelephoneTuteur;Statut;MatriculeNational;Ville";
    const example1 = "YAO;Koffi Anderson;M;2014-04-12;6A;Koffi Blaise;+225 07 41 85 96 03;Inscrit;CI-0125-9831K;Abidjan";
    const example2 = "DIOMANDE;Aminata;F;2013-08-19;6B;Diomande Lancine;+225 05 52 41 12 74;Reinscrit;CI-0124-7744D;Yamoussoukro";
    
    const csvContent = "\uFEFF" + [headers, example1, example2].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = "modele_importation_eleves.csv";
    link.click();
    URL.revokeObjectURL(url);
    showStatus('success', 'Modèle CSV téléchargé. Ouvrez-le dans Excel pour le remplir.');
  };

  const handleImportCSVFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      processRawData(text);
    };
    reader.readAsText(file);
  };

  const handleProcessPasteData = () => {
    if (!pasteData.trim()) {
      showStatus('error', 'Veuillez coller des lignes Excel d’abord.');
      return;
    }
    processRawData(pasteData);
  };

  const processRawData = (text: string) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length <= 1) {
      showStatus('error', 'Le fichier ou texte collé ne contient pas de lignes de données.');
      return;
    }

    // Determine separator: tab or semicolon or comma
    const header = lines[0];
    let sep = ';';
    if (header.includes('\t')) sep = '\t';
    else if (header.includes(';')) sep = ';';
    else if (header.includes(',')) sep = ',';

    const parsedStudents: StudentRecord[] = [];
    const errors: string[] = [];
    let successCount = 0;

    // Start parsing from line index 1 (skip header)
    for (let i = 1; i < lines.length; i++) {
      const columns = lines[i].split(sep).map(col => col.trim().replace(/^["']|["']$/g, ''));
      if (columns.length < 5) {
        errors.push(`Ligne ${i + 1} ignorée: Nombre de colonnes insuffisant (${columns.length} colonnes détectées, attendu au moins 5).`);
        continue;
      }

      const [lastName, firstName, genderStr, birthDate, classInput, tutorName, tutorPhone, statusInput, matriculeNat, city] = columns;

      if (!lastName || !firstName) {
        errors.push(`Ligne ${i + 1} ignorée: Le Nom et le Prénom sont obligatoires.`);
        continue;
      }

      // Check class
      const matchedClass = classes.find(c => c.id.toLowerCase() === classInput.toLowerCase() || c.name.toLowerCase() === classInput.toLowerCase());
      if (!matchedClass) {
        errors.push(`Ligne ${i + 1} ignorée: La classe "${classInput}" n'existe pas dans le système.`);
        continue;
      }

      const gender = (genderStr && genderStr.toUpperCase().startsWith('F')) ? 'F' : 'M';
      
      const cleanStatus = (statusInput && statusInput.toLowerCase().includes('rein')) ? 'Réinscrit' : 'Inscrit';

      // Generate a unique matricule
      const studentId = 'std_imp_' + Date.now() + '_' + Math.floor(100 + Math.random() * 900);
      const generatedMatricule = 'M-' + academicYear.split('-')[0] + '-' + Math.floor(10000 + Math.random() * 90000);

      parsedStudents.push({
        id: studentId,
        lastName,
        firstName,
        gender,
        birthDate: birthDate || '2015-01-01',
        classId: matchedClass.id,
        tutorName: tutorName || 'Parent d’élève',
        tutorPhone: tutorPhone || '+225 01 02 03 04 05',
        status: cleanStatus,
        matricule: generatedMatricule,
        matriculeNat: matriculeNat || '',
        city: city || 'Abidjan',
        photo: ''
      });
      successCount++;
    }

    if (parsedStudents.length > 0) {
      // Append to existing students or overwrite if base is empty
      const isOverwrite = window.confirm(`Voulez-vous fusionner ces ${parsedStudents.length} nouveaux élèves avec la base existante (${students.length} élèves) ?\n\n[OK] = Fusionner les deux listes\n[Annuler] = Remplacer et écraser la base existante`);
      
      let updatedStudentsList: StudentRecord[] = [];
      if (isOverwrite) {
        updatedStudentsList = [...students, ...parsedStudents];
      } else {
        updatedStudentsList = parsedStudents;
      }

      setStudents(updatedStudentsList);
      localStorage.setItem('erp_student_records', JSON.stringify(updatedStudentsList));
      showStatus('success', `${parsedStudents.length} élèves importés avec succès !`);
    }

    setImportReport({
      successCount,
      errors
    });
    setPasteData('');
  };

  // ==========================================
  // TAB 5: ACADEMIC YEAR CLOSURE & INITIALIZATION
  // ==========================================
  
  // Year setup states
  const [newYearString, setNewYearString] = useState(() => {
    const parts = academicYear.split('-');
    if (parts.length === 2) {
      const y1 = parseInt(parts[0]) + 1;
      const y2 = parseInt(parts[1]) + 1;
      return `${y1}-${y2}`;
    }
    return '2026-2027';
  });

  const [periodType, setPeriodType] = useState<'trimestre' | 'semestre'>('trimestre');
  
  // Period dates
  const [p1Start, setP1Start] = useState('2026-09-15');
  const [p1End, setP1End] = useState('2026-12-18');
  const [p2Start, setP2Start] = useState('2027-01-05');
  const [p2End, setP2End] = useState('2027-03-26');
  const [p3Start, setP3Start] = useState('2027-04-12');
  const [p3End, setP3End] = useState('2027-06-18');

  // Promotion mappings: for each class, define what class students move to
  const [promotionMapping, setPromotionMapping] = useState<Record<string, string>>(() => {
    const mapping: Record<string, string> = {};
    classes.forEach(c => {
      // Auto-suggest logical next class
      if (c.name.includes('6')) mapping[c.id] = classes.find(x => x.name.includes('5'))?.id || '';
      else if (c.name.includes('5')) mapping[c.id] = classes.find(x => x.name.includes('4'))?.id || '';
      else if (c.name.includes('4')) mapping[c.id] = classes.find(x => x.name.includes('3'))?.id || '';
      else if (c.name.includes('3')) mapping[c.id] = 'DIPLOMA'; // Graduate
      else mapping[c.id] = '';
    });
    return mapping;
  });

  const [promotionThreshold, setPromotionThreshold] = useState(10); // Minimum passing average (out of 20)
  const [resetScheduleOnTransition, setResetScheduleOnTransition] = useState(true);
  const [archiveLog, setArchiveLog] = useState<string[]>([]);
  const [archivedYears, setArchivedYears] = useState<any[]>(() => {
    const saved = localStorage.getItem('erp_archived_years');
    return saved ? JSON.parse(saved) : [];
  });

  const handleUpdateMapping = (classId: string, targetValue: string) => {
    setPromotionMapping(prev => ({
      ...prev,
      [classId]: targetValue
    }));
  };

  // Helper: calculate weighted average grade for a student
  const getStudentAverage = (studentId: string): number | null => {
    const savedMarks = localStorage.getItem('erp_student_marks');
    if (!savedMarks) return null;
    const marksList: StudentMark[] = JSON.parse(savedMarks);
    const studentMarks = marksList.filter(m => m.studentId === studentId);
    if (studentMarks.length === 0) return null;

    let totalPoints = 0;
    let totalWeights = 0;
    studentMarks.forEach(m => {
      totalPoints += m.score * m.weight;
      totalWeights += m.weight;
    });
    return totalWeights > 0 ? totalPoints / totalWeights : null;
  };

  // Run Year Transition
  const handleRunYearTransition = () => {
    if (!newYearString.match(/^\d{4}-\d{4}$/)) {
      showStatus('error', "Le format de la nouvelle année académique est incorrect. Exemple valide : 2026-2027");
      return;
    }

    const log: string[] = [];
    log.push(`🏁 Début du processus de clôture de l'année scolaire : ${academicYear}`);

    // 1. Gather all current school files to archive
    const currentStudents = [...students];
    const currentMarks = (() => {
      const saved = localStorage.getItem('erp_student_marks');
      return saved ? JSON.parse(saved) : [];
    })();
    const currentCourses = (() => {
      const saved = localStorage.getItem('timetable_courses');
      return saved ? JSON.parse(saved) : [];
    })();

    const archiveItem = {
      academicYear: academicYear,
      archivedAt: new Date().toISOString(),
      students: currentStudents,
      marks: currentMarks,
      courses: currentCourses,
      schoolName: schoolName
    };

    // Save archive to list
    const updatedArchives = [archiveItem, ...archivedYears];
    localStorage.setItem('erp_archived_years', JSON.stringify(updatedArchives));
    setArchivedYears(updatedArchives);
    log.push(`💾 Sauvegarde de l'historique de l'année ${academicYear} effectuée.`);

    // 2. Perform Automatic Student Promotions based on threshold and mapping
    log.push(`🎓 Lancement de la promotion automatique avec un seuil de passage de ${promotionThreshold}/20.`);
    
    const promotedStudents = currentStudents.map(student => {
      const average = getStudentAverage(student.id);
      const hasPassed = average !== null ? average >= promotionThreshold : true; // assume pass if no grades recorded
      
      let nextClassId = student.classId;
      let nextStatus = student.status;
      let logMsg = '';

      if (hasPassed) {
        const mappedDest = promotionMapping[student.classId];
        if (mappedDest === 'DIPLOMA') {
          nextClassId = 'NONE';
          nextStatus = 'Diplômé';
          logMsg = `✔️ ${student.lastName} ${student.firstName} (Moy: ${average !== null ? average.toFixed(2) : 'N/A'}/20) -> Diplômé / Quitte l'école.`;
        } else if (mappedDest) {
          nextClassId = mappedDest;
          nextStatus = 'Inscrit';
          logMsg = `✔️ ${student.lastName} ${student.firstName} (Moy: ${average !== null ? average.toFixed(2) : 'N/A'}/20) -> Promu en classe ${classes.find(c => c.id === mappedDest)?.name || mappedDest}.`;
        } else {
          nextStatus = 'Réinscrit';
          logMsg = `✔️ ${student.lastName} ${student.firstName} (Moy: ${average !== null ? average.toFixed(2) : 'N/A'}/20) -> Reste en classe ${classes.find(c => c.id === student.classId)?.name || student.classId} (Réaffectation manuelle requise).`;
        }
      } else {
        nextStatus = 'Redoublant';
        logMsg = `❌ ${student.lastName} ${student.firstName} (Moy: ${average !== null ? average.toFixed(2) : 'N/A'}/20) -> Redouble en classe ${classes.find(c => c.id === student.classId)?.name || student.classId}.`;
      }

      log.push(logMsg);
      
      // Update matricule for the new year
      const newMatricule = 'M-' + newYearString.split('-')[0] + '-' + student.matricule.split('-')[2];

      return {
        ...student,
        classId: nextClassId,
        status: nextStatus as any,
        matricule: newMatricule
      };
    });

    // Save promoted students to local state and storage
    setStudents(promotedStudents);
    localStorage.setItem('erp_student_records', JSON.stringify(promotedStudents));

    // 3. Clear current marks & courses for the new year if checked
    localStorage.setItem('erp_student_marks', JSON.stringify([]));
    log.push(`🧹 Registre des notes scolaires vidé pour la nouvelle année.`);

    if (resetScheduleOnTransition) {
      localStorage.setItem('timetable_courses', JSON.stringify([]));
      log.push(`📅 Grille de l'emploi du temps réinitialisée pour accueillir le nouveau planning.`);
    }

    // 4. Save Period Configuration for the new year
    const periodConfig = {
      type: periodType,
      periods: periodType === 'trimestre' ? [
        { name: 'Trimestre 1', start: p1Start, end: p1End },
        { name: 'Trimestre 2', start: p2Start, end: p2End },
        { name: 'Trimestre 3', start: p3Start, end: p3End }
      ] : [
        { name: 'Semestre 1', start: p1Start, end: p1End },
        { name: 'Semestre 2', start: p2Start, end: p2End }
      ]
    };
    localStorage.setItem('erp_academic_year_config', JSON.stringify(periodConfig));
    log.push(`📅 Découpage de l'année scolaire défini en : ${periodType.toUpperCase()}S.`);

    // 5. Update global Academic Year String
    setAcademicYear(newYearString);
    localStorage.setItem('barakat_academic_year', newYearString);
    log.push(`🚀 Nouvelle année académique ${newYearString} démarrée avec succès !`);

    setArchiveLog(log);
    showStatus('success', `La transition vers la nouvelle année scolaire ${newYearString} s'est terminée avec succès.`);
  };

  // ==========================================
  // TAB 6: SYSTEM UTILITIES & DATABASE (JSON)
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
      'erp_school_settings',
      'erp_academic_year_config',
      'erp_archived_years',
      'barakat_academic_year'
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
      const accessCode = s.accessCode || Math.floor(100000 + Math.random() * 900000).toString();
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
        <div className={`p-4 rounded-2xl flex items-center gap-3 border shadow-sm transition ${
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
          <p className="text-xs text-slate-355 max-w-xl font-medium">
            Affectez des photos aux dossiers d'élèves, organisez les passages en masse de classes, clôturez vos trimestres ou préparez le démarrage de la nouvelle année.
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
              : 'bg-white text-slate-655 hover:bg-slate-50 border-slate-200'
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
              : 'bg-white text-slate-655 hover:bg-slate-50 border-slate-200'
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
              : 'bg-white text-slate-655 hover:bg-slate-50 border-slate-200'
          }`}
        >
          <FolderSync className="h-4 w-4" />
          <span>Réaffectation / Transfert de Classe</span>
        </button>

        <button
          onClick={() => setActiveSubTab('import_excel')}
          className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
            activeSubTab === 'import_excel' 
              ? 'bg-slate-900 text-white border-slate-950 shadow-xs' 
              : 'bg-white text-slate-655 hover:bg-slate-50 border-slate-200'
          }`}
        >
          <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
          <span>Importation Excel / CSV</span>
        </button>

        <button
          onClick={() => setActiveSubTab('year_transition')}
          className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
            activeSubTab === 'year_transition' 
              ? 'bg-slate-900 text-white border-slate-950 shadow-xs' 
              : 'bg-white text-slate-655 hover:bg-slate-50 border-slate-200'
          }`}
        >
          <Archive className="h-4 w-4 text-[#ee7b11]" />
          <span>Clôture & Nouvelle Année</span>
        </button>

        <button
          onClick={() => setActiveSubTab('system_db')}
          className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
            activeSubTab === 'system_db' 
              ? 'bg-slate-900 text-white border-slate-950 shadow-xs' 
              : 'bg-white text-slate-655 hover:bg-slate-50 border-slate-200'
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
                              <button className="cursor-pointer h-7 px-3 bg-slate-900 hover:bg-slate-855 text-white text-[10.5px] font-bold rounded-lg transition flex items-center gap-1">
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
                    <span className="text-[10px] text-slate-550 block">sur {sourceStudents.length} disponibles</span>
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

        {/* TAB 4: IMPORT STUDENTS FROM EXCEL / CSV */}
        {activeSubTab === 'import_excel' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                <span>Importation Collective d'Élèves (Excel / CSV / Copier-Coller)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Importez rapidement toute votre liste d'élèves depuis un tableur Excel. Téléchargez le modèle, remplissez-le et importez-le en un clic.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Instructions and File Upload (6 cols) */}
              <div className="lg:col-span-6 space-y-5">
                
                {/* Download Template Step */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-black">1</span>
                    <strong className="text-xs text-slate-800 uppercase">Télécharger le modèle type</strong>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Le modèle CSV est formaté pour être ouvert directement sous Microsoft Excel ou Google Sheets. Les colonnes obligatoires sont le Nom, le Prénom et la Classe.
                  </p>
                  <button
                    onClick={handleDownloadTemplate}
                    className="cursor-pointer h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition flex items-center gap-2 shadow-xs"
                  >
                    <Download className="h-4 w-4" />
                    Télécharger le Modèle Excel/CSV
                  </button>
                </div>

                {/* Upload File Step */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-black">2</span>
                    <strong className="text-xs text-slate-800 uppercase">Option A : Charger le fichier rempli</strong>
                  </div>
                  <div className="border border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-100/50 transition cursor-pointer relative bg-white">
                    <input 
                      type="file" 
                      accept=".csv, .txt"
                      onChange={handleImportCSVFile}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <Upload className="h-6 w-6 text-slate-400 mx-auto mb-1.5" />
                    <span className="text-[10px] text-slate-550 block font-black">Sélectionner votre fichier CSV d'élèves</span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">Encodage UTF-8 recommandé (Séparateurs: point-virgule)</span>
                  </div>
                </div>

              </div>

              {/* Right Column: Copy-Paste Step & Excel Preview (6 cols) */}
              <div className="lg:col-span-6 space-y-5">
                
                {/* Direct copy paste text box */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-black">2</span>
                    <strong className="text-xs text-slate-800 uppercase">Option B : Copier/Coller les lignes Excel</strong>
                  </div>
                  <p className="text-[11px] text-slate-555 leading-relaxed">
                    Sélectionnez vos lignes directement dans Excel, copiez-les (Ctrl+C) puis collez-les directement dans le cadre ci-dessous.
                  </p>
                  
                  <div className="space-y-2">
                    <textarea
                      placeholder="Exemple de lignes à coller :&#10;Nom;Prenoms;Genre;DateNaissance;Classe;NomTuteur;TelephoneTuteur;Statut&#10;KOUAME;Affoué Marie;F;2015-06-12;6A;Kouamé Jérôme;+225 0707070707;Inscrit"
                      value={pasteData}
                      onChange={(e) => setPasteData(e.target.value)}
                      className="w-full h-32 p-3 bg-white border border-slate-250 rounded-xl text-[10.5px] font-mono leading-normal focus:outline-none"
                    />
                    
                    <button
                      onClick={handleProcessPasteData}
                      className="cursor-pointer w-full h-9 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      Traiter les données collées
                    </button>
                  </div>
                </div>

              </div>

            </div>

            {/* Import Execution Report */}
            {importReport && (
              <div className="mt-4 p-4 border border-slate-200 rounded-2xl space-y-3">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Rapport de traitement de l'importation</h4>
                <div className="grid grid-cols-2 gap-3 text-center text-xs">
                  <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl">
                    <span className="block font-bold">Élèves validés</span>
                    <strong className="text-2xl font-black">{importReport.successCount}</strong>
                  </div>
                  <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl">
                    <span className="block font-bold">Lignes rejetées</span>
                    <strong className="text-2xl font-black">{importReport.errors.length}</strong>
                  </div>
                </div>

                {importReport.errors.length > 0 && (
                  <div className="p-3 bg-slate-50 border rounded-xl max-h-48 overflow-y-auto font-mono text-[10px] text-rose-700 leading-normal space-y-1">
                    {importReport.errors.map((err, idx) => (
                      <div key={idx}>⚠️ {err}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {/* TAB 5: YEAR TRANSITION (CLÔTURE & NOUVELLE ANNÉE) */}
        {activeSubTab === 'year_transition' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Form Setup Controls (7 cols) */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm space-y-6">
              
              <div className="space-y-1 pb-3 border-b border-slate-100">
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Archive className="h-4.5 w-4.5 text-[#ee7b11]" />
                  <span>Clôture et Transition Académique</span>
                </h2>
                <p className="text-[10.5px] text-slate-450">Définissez la nouvelle année, paramétrez les périodes (trimestres/semestres) et lancez les promotions d'élèves.</p>
              </div>

              {/* Step 1: New Year String and Division */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Nouvelle Année Scolaire</label>
                  <input 
                    type="text" 
                    placeholder="Ex: 2026-2027"
                    value={newYearString}
                    onChange={(e) => setNewYearString(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-250 text-xs font-extrabold focus:outline-none"
                  />
                  <span className="text-[9px] text-slate-400 block mt-0.5">Format obligatoire : AAAA-AAAA</span>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Découpage de l'Année</label>
                  <select 
                    value={periodType}
                    onChange={(e) => setPeriodType(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-250 text-xs font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="trimestre">Trimestres (3 périodes scolaires)</option>
                    <option value="semestre">Semestres (2 périodes scolaires)</option>
                  </select>
                </div>
              </div>

              {/* Step 2: Date configuration based on division selection */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                <span className="text-[10px] font-black uppercase text-slate-450 tracking-wider">Planification Calendaire des Périodes</span>
                
                {periodType === 'trimestre' ? (
                  <div className="space-y-3">
                    {/* T1 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Trimestre 1 — Début</label>
                        <input type="date" value={p1Start} onChange={(e) => setP1Start(e.target.value)} className="w-full h-8 px-2 border border-slate-200 rounded-lg bg-white" />
                      </div>
                      <div>
                        <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Trimestre 1 — Fin</label>
                        <input type="date" value={p1End} onChange={(e) => setP1End(e.target.value)} className="w-full h-8 px-2 border border-slate-200 rounded-lg bg-white" />
                      </div>
                    </div>
                    {/* T2 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Trimestre 2 — Début</label>
                        <input type="date" value={p2Start} onChange={(e) => setP2Start(e.target.value)} className="w-full h-8 px-2 border border-slate-200 rounded-lg bg-white" />
                      </div>
                      <div>
                        <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Trimestre 2 — Fin</label>
                        <input type="date" value={p2End} onChange={(e) => setP2End(e.target.value)} className="w-full h-8 px-2 border border-slate-200 rounded-lg bg-white" />
                      </div>
                    </div>
                    {/* T3 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Trimestre 3 — Début</label>
                        <input type="date" value={p3Start} onChange={(e) => setP3Start(e.target.value)} className="w-full h-8 px-2 border border-slate-200 rounded-lg bg-white" />
                      </div>
                      <div>
                        <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Trimestre 3 — Fin</label>
                        <input type="date" value={p3End} onChange={(e) => setP3End(e.target.value)} className="w-full h-8 px-2 border border-slate-200 rounded-lg bg-white" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* S1 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Semestre 1 — Début</label>
                        <input type="date" value={p1Start} onChange={(e) => setP1Start(e.target.value)} className="w-full h-8 px-2 border border-slate-200 rounded-lg bg-white" />
                      </div>
                      <div>
                        <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Semestre 1 — Fin</label>
                        <input type="date" value={p1End} onChange={(e) => setP1End(e.target.value)} className="w-full h-8 px-2 border border-slate-200 rounded-lg bg-white" />
                      </div>
                    </div>
                    {/* S2 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Semestre 2 — Début</label>
                        <input type="date" value={p2Start} onChange={(e) => setP2Start(e.target.value)} className="w-full h-8 px-2 border border-slate-200 rounded-lg bg-white" />
                      </div>
                      <div>
                        <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Semestre 2 — Fin</label>
                        <input type="date" value={p2End} onChange={(e) => setP2End(e.target.value)} className="w-full h-8 px-2 border border-slate-200 rounded-lg bg-white" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 3: Promotion rules mapping */}
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase text-slate-450 tracking-wider block">Règles de passage & Promotion des élèves</span>
                
                <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl flex items-center justify-between text-xs gap-4">
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-slate-800 block">Seuil de passage annuel</span>
                    <p className="text-[10px] text-slate-500 leading-normal">Moyenne annuelle pondérée minimale requise pour valider l'année et passer en classe supérieure.</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input 
                      type="number" 
                      min="0" 
                      max="20" 
                      step="0.5"
                      value={promotionThreshold} 
                      onChange={(e) => setPromotionThreshold(parseFloat(e.target.value))}
                      className="w-16 h-8 text-center border border-indigo-200 bg-white rounded-lg font-bold focus:outline-none focus:ring-1 focus:ring-indigo-400"
                    />
                    <span className="font-bold text-slate-600">/ 20</span>
                  </div>
                </div>

                {/* Class Mapping Matrix */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Correspondance des classes de passage</label>
                  <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-56 overflow-y-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-550 font-bold">
                          <th className="p-2.5">Classe Actuelle</th>
                          <th className="p-2.5 text-center"></th>
                          <th className="p-2.5">Classe Supérieure / Passage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {classes.map(c => (
                          <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50/20">
                            <td className="p-2.5 font-bold text-slate-700">{c.name}</td>
                            <td className="p-2.5 text-center text-slate-400">➔</td>
                            <td className="p-2.5">
                              <select
                                value={promotionMapping[c.id] || ''}
                                onChange={(e) => handleUpdateMapping(c.id, e.target.value)}
                                className="w-full h-8 px-2 border border-slate-200 rounded-lg text-xs focus:outline-none"
                              >
                                <option value="">Choisir la destination...</option>
                                <option value="DIPLOMA">🎓 Diplômé / Quitte l'école</option>
                                {classes.filter(x => x.id !== c.id).map(x => (
                                  <option key={x.id} value={x.id}>{x.name}</option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Reset schedule options */}
              <div className="flex items-center gap-2.5 py-1 text-xs">
                <input 
                  type="checkbox"
                  id="reset_schedule_transition"
                  checked={resetScheduleOnTransition}
                  onChange={(e) => setResetScheduleOnTransition(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-350 text-[#0b4998] focus:ring-[#0b4998]"
                />
                <label htmlFor="reset_schedule_transition" className="font-bold text-slate-655 cursor-pointer">
                  Réinitialiser la grille d'emploi du temps pour la nouvelle année
                </label>
              </div>

              {/* Action Button */}
              <button
                onClick={handleRunYearTransition}
                className="cursor-pointer h-12 w-full bg-[#ee7b11] hover:bg-[#d9700f] text-white text-xs font-black uppercase tracking-wider rounded-xl transition shadow-md flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <RefreshCw className="h-4 w-4 animate-spin-slow" />
                <span>Clôturer et Initialiser l'Année {newYearString}</span>
              </button>

            </div>

            {/* Archive and execution logs (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Live console logging */}
              {archiveLog.length > 0 && (
                <div className="bg-slate-900 text-emerald-400 font-mono text-[10px] rounded-3xl p-5 shadow-inner border border-slate-950 space-y-1.5 max-h-80 overflow-y-auto">
                  <span className="text-slate-400 block border-b border-slate-800 pb-2 mb-2 uppercase font-black tracking-wider text-center">Rapport d'exécution</span>
                  {archiveLog.map((line, idx) => (
                    <div key={idx} className="leading-relaxed">
                      {line}
                    </div>
                  ))}
                </div>
              )}

              {/* Historical archived years summary */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
                <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <Archive className="h-4.5 w-4.5 text-[#0b4998]" />
                  <span>Historique des années clôturées</span>
                </h3>

                {archivedYears.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-4">
                    Aucune archive historique d'année scolaire enregistrée.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {archivedYears.map((arc, idx) => (
                      <div key={idx} className="p-3 border border-slate-100 bg-[#dfecf8]/10 rounded-xl space-y-1.5 text-xs">
                        <div className="flex justify-between items-center font-bold">
                          <span className="text-[#0b4998] font-black">Année : {arc.academicYear}</span>
                          <span className="text-[9.5px] text-slate-400">{new Date(arc.archivedAt).toLocaleDateString('fr-FR')}</span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          <span>Effectif sauvegardé : <strong>{arc.students?.length || 0} élèves</strong></span> • <span>Notes archivées : <strong>{arc.marks?.length || 0} entrées</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* TAB 6: SYSTEM UTILITIES */}
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
                  <button className="cursor-pointer h-10 w-full px-4 bg-slate-900 hover:bg-slate-855 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-xs">
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
                    <h3 className="text-xs font-bold text-slate-855 text-rose-900">Nettoyage / Rétablir à Zéro</h3>
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
