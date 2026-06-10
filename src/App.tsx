import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { 
  ClassItem, 
  TeacherItem, 
  SubjectItem, 
  RoomItem, 
  ScheduleCourse, 
  Conflict, 
  DAYS, 
  TIME_SLOTS,
  ActivationCode
} from './types';
import { 
  INITIAL_CLASSES, 
  INITIAL_TEACHERS, 
  INITIAL_ROOMS, 
  INITIAL_SUBJECTS, 
  INITIAL_COURSES,
  COLOR_CLASSES
} from './data';
import { checkAllConflicts } from './utils/conflictChecker';
import DashboardTab from './components/DashboardTab';
import { BrandLogo } from './components/BrandLogo';
import { SettingsTab } from './components/SettingsTab';
import { StatsTab } from './components/StatsTab';
import { 
  Calendar, 
  LayoutDashboard, 
  Users, 
  School, 
  GraduationCap, 
  BookOpen, 
  Sparkles, 
  Plus, 
  Trash2, 
  AlertCircle, 
  AlertTriangle, 
  X, 
  Send, 
  Check, 
  Edit, 
  ChevronRight,
  Shield, 
  Info,
  Clock,
  User,
  LogOut,
  Sliders,
  Database,
  Printer,
  Settings,
  BarChart3
} from 'lucide-react';

export default function App() {
  // DB States
  const [classes, setClasses] = useState<ClassItem[]>(() => {
    const saved = localStorage.getItem('barakatplanning_classes') || localStorage.getItem('edusched_classes');
    return saved ? JSON.parse(saved) : INITIAL_CLASSES;
  });
  const [teachers, setTeachers] = useState<TeacherItem[]>(() => {
    const saved = localStorage.getItem('barakatplanning_teachers') || localStorage.getItem('edusched_teachers');
    return saved ? JSON.parse(saved) : INITIAL_TEACHERS;
  });
  const [rooms, setRooms] = useState<RoomItem[]>(() => {
    const saved = localStorage.getItem('barakatplanning_rooms') || localStorage.getItem('edusched_rooms');
    return saved ? JSON.parse(saved) : INITIAL_ROOMS;
  });
  const [subjects, setSubjects] = useState<SubjectItem[]>(() => {
    const saved = localStorage.getItem('barakatplanning_subjects') || localStorage.getItem('edusched_subjects');
    return saved ? JSON.parse(saved) : INITIAL_SUBJECTS;
  });
  const [courses, setCourses] = useState<ScheduleCourse[]>(() => {
    const saved = localStorage.getItem('barakatplanning_courses') || localStorage.getItem('edusched_courses');
    return saved ? JSON.parse(saved) : INITIAL_COURSES;
  });

  // UI Navigation states
  const [activeTab, setActiveTab] = useState<'dashboard' | 'schedule' | 'teachers' | 'rooms' | 'classes' | 'subjects' | 'settings' | 'stats'>('dashboard');
  
  // Custom establishment settings states
  const [schoolName, setSchoolName] = useState(() => localStorage.getItem('barakat_school_name') || "ÉCOLE DES FAMILLES");
  const [schoolSubName, setSchoolSubName] = useState(() => localStorage.getItem('barakat_school_sub_name') || "ÉTIMOÉ & MAKORÉ");
  const [academicYear, setAcademicYear] = useState(() => localStorage.getItem('barakat_academic_year') || "2025-2026");
  const [schoolAddress, setSchoolAddress] = useState(() => localStorage.getItem('barakat_school_address') || "Abidjan, Côte d'Ivoire");
  const [schoolPhone, setSchoolPhone] = useState(() => localStorage.getItem('barakat_school_phone') || "+225 07 07 07 07 07");
  const [schoolEmail, setSchoolEmail] = useState(() => localStorage.getItem('barakat_school_email') || "contact@ecoledesfamilles.ed.ci");
  const [schoolDirector, setSchoolDirector] = useState(() => localStorage.getItem('barakat_school_director') || "Mme Catherine Amon");
  const [schoolMotto, setSchoolMotto] = useState(() => localStorage.getItem('barakat_school_motto') || "Éducation - Valeurs - Excellence");

  const [userRole, setUserRole] = useState<'admin' | 'professor'>(() => {
    const code = localStorage.getItem('barakat_activation_code_used') || '';
    return code === "BKT-ADMIN-789-MASTER" ? 'admin' : 'professor';
  });
  const [isDomainLocked, setIsDomainLocked] = useState(false);

  // Security locks for Host / Domain locking (anti-copy/anti-clone) and right-click block
  useEffect(() => {
    const hostname = window.location.hostname;
    const allowedDomains = [
      'localhost',
      '127.0.0.1',
      'run.app',
      'google.com',
      'vercel.app'
    ];
    
    const isAllowed = allowedDomains.some(domain => hostname.includes(domain));
    if (!isAllowed) {
      setIsDomainLocked(true);
      return;
    }

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12') {
        e.preventDefault();
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
        e.preventDefault();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  // Selection filter for standard calendar
  const [calendarFilterType, setCalendarFilterType] = useState<'class' | 'teacher' | 'room'>('class');
  const [selectedFilterValue, setSelectedFilterValue] = useState<string>('6A');

  // Teacher portal state variables
  const [selectedProfPortalId, setSelectedProfPortalId] = useState<string>('prof_martin');

  // Conflicts list derived state
  const [conflicts, setConflicts] = useState<Conflict[]>([]);

  // Open/Close of right panel Gemini assistant drawer
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [aiChatHistory, setAiChatHistory] = useState<Array<{ role: 'user' | 'model'; text: string }>>([
    { role: 'model', text: "Bonjour ! Je suis l'Assistant intelligent de BARAKATPLANNING. Je peux vous aider à analyser la structure de vos plannings, déceler des propositions de remplacement d'heures en conflit ou générer automatiquement des sessions d'apprentissage pour vos classes." }
  ]);
  const [customAiPrompt, setCustomAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Auto scheduler inputs (Form wizard inside assistant drawer)
  const [wizardClass, setWizardClass] = useState('6A');
  const [wizardSubject, setWizardSubject] = useState('math');
  const [wizardTeacher, setWizardTeacher] = useState('prof_martin');
  const [wizardRoom, setWizardRoom] = useState('s101');
  const [wizardHoursCount, setWizardHoursCount] = useState(2);
  const [isWizardLoading, setIsWizardLoading] = useState(false);
  const [wizardLog, setWizardLog] = useState('');

  // Course planner modals
  const [isAddEditCourseModalOpen, setIsAddEditCourseModalOpen] = useState(false);
  const [modalTargetDay, setModalTargetDay] = useState('');
  const [modalTargetSlot, setModalTargetSlot] = useState('');
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);

  // Form states during course creation/editing
  const [modalClassId, setModalClassId] = useState('');
  const [modalSubjectId, setModalSubjectId] = useState('');
  const [modalTeacherId, setModalTeacherId] = useState('');
  const [modalRoomId, setModalRoomId] = useState('');

  // Form fields adding new elements
  const [newClass, setNewClass] = useState({ id: '', name: '', capacity: 25, color: 'blue' });
  const [newTeacher, setNewTeacher] = useState({ id: '', name: '', subjects: [] as string[], maxHours: 18, color: 'indigo', email: '' });
  const [newRoom, setNewRoom] = useState({ id: '', name: '', type: 'Standard' as any, capacity: 30, color: 'slate' });
  const [newSubject, setNewSubject] = useState({ id: '', name: '', color: 'rose' });

  // DB record editing states
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);

  // Activation / Clé d'activation unique
  const [isActivated, setIsActivated] = useState<boolean>(() => localStorage.getItem('barakat_activated') === 'true');
  const [activationCodeInput, setActivationCodeInput] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [activationError, setActivationError] = useState('');
  const [activationCodes, setActivationCodes] = useState<ActivationCode[]>([]);


  // Supabase Live Synchronization Core Engine
  const [supabaseStatus, setSupabaseStatus] = useState<'idle' | 'connecting' | 'synced' | 'error_tables' | 'error_auth'>('connecting');
  const [supabaseErrorMsg, setSupabaseErrorMsg] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);

  // Method to fetch data from Supabase default schedule
  const handleLoadFromSupabase = async () => {
    setSupabaseStatus('connecting');
    setSupabaseErrorMsg('');
    try {
      const { data, error } = await supabase
        .from('barakat_planning')
        .select('*')
        .eq('id', 'default')
        .maybeSingle();

      if (error) {
        if (error.code === '42P01') {
          setSupabaseStatus('error_tables');
          setSupabaseErrorMsg("La table 'barakat_planning' n'existe pas encore.");
          return;
        }
        throw error;
      }

      if (data) {
        if (data.classes) setClasses(data.classes);
        if (data.teachers) setTeachers(data.teachers);
        if (data.rooms) setRooms(data.rooms);
        if (data.subjects) setSubjects(data.subjects);
        if (data.courses) setCourses(data.courses);
        setSupabaseStatus('synced');
      } else {
        // Table exists but is completely empty. We can sync existing state.
        setSupabaseStatus('idle');
      }
    } catch (err: any) {
      console.error("Erreur de chargement Supabase:", err);
      setSupabaseErrorMsg(err.message || 'Impossible de se connecter à Supabase');
      if (err.code === '42P01' || err.message?.includes('non trouvée')) {
        setSupabaseStatus('error_tables');
      } else {
        setSupabaseStatus('error_auth');
      }
    } finally {
      setIsInitialLoadComplete(true);
    }
  };

  // Method to push active state up to Supabase
  const handleSaveToSupabase = async (forceData?: {
    classes?: ClassItem[];
    teachers?: TeacherItem[];
    rooms?: RoomItem[];
    subjects?: SubjectItem[];
    courses?: ScheduleCourse[];
  }) => {
    setIsSyncing(true);
    setSupabaseErrorMsg('');
    try {
      const payload = {
        id: 'default',
        classes: forceData?.classes || classes,
        teachers: forceData?.teachers || teachers,
        rooms: forceData?.rooms || rooms,
        subjects: forceData?.subjects || subjects,
        courses: forceData?.courses || courses,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('barakat_planning')
        .upsert(payload);

      if (error) {
        if (error.code === '42P01') {
          setSupabaseStatus('error_tables');
          setSupabaseErrorMsg("La table 'barakat_planning' n'existe pas encore.");
          return;
        }
        throw error;
      }

      setSupabaseStatus('synced');
    } catch (err: any) {
      console.error("Erreur d'écriture Supabase:", err);
      setSupabaseErrorMsg(err.message || 'Impossible de sauvegarder dans Supabase');
      if (err.code === '42P01' || err.message?.includes('non trouvée')) {
        setSupabaseStatus('error_tables');
      } else {
        setSupabaseStatus('error_auth');
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Charger les codes d'activation depuis Supabase (id = 'activation_info')
  const handleLoadActivationCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('barakat_planning')
        .select('*')
        .eq('id', 'activation_info')
        .maybeSingle();

      if (error) {
        if (error.code === '42P01') {
          console.warn("La table d'activation n'existe pas ou n'est pas encore créée.");
          return;
        }
        throw error;
      }

      if (data && Array.isArray(data.courses)) {
        setActivationCodes(data.courses as ActivationCode[]);
      } else {
        // Initialiser avec quelques codes par défaut
        const initialCodes: ActivationCode[] = [
          { code: 'BKT-942-AZE', isUsed: false },
          { code: 'BKT-108-WXC', isUsed: false },
          { code: 'BKT-551-NJK', isUsed: false },
          { code: 'BKT-304-TYP', isUsed: false }
        ];
        
        // On push l'initialisation de manière silencieuse
        await supabase.from('barakat_planning').upsert({
          id: 'activation_info',
          classes: [],
          teachers: [],
          rooms: [],
          subjects: [],
          courses: initialCodes,
          updated_at: new Date().toISOString()
        });
        setActivationCodes(initialCodes);
      }
    } catch (err) {
      console.error("Erreur de chargement des codes d'activation:", err);
    }
  };

  // Générer un nouveau code unique
  const handleGenerateNewCode = async () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let rand = '';
    for (let i = 0; i < 6; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const newCodeFormatted = `BKT-${rand.slice(0, 3)}-${rand.slice(3, 6)}`;
    
    const updated = [...activationCodes, { code: newCodeFormatted, isUsed: false }];
    
    try {
      const { error } = await supabase
        .from('barakat_planning')
        .upsert({
          id: 'activation_info',
          classes: [],
          teachers: [],
          rooms: [],
          subjects: [],
          courses: updated,
          updated_at: new Date().toISOString()
        });
        
      if (error) throw error;
      setActivationCodes(updated);
    } catch (err: any) {
      alert("Erreur lors de la génération du code de sécurité : " + err.message);
    }
  };

  // Supprimer un code d'activation
  const handleDeleteActivationCode = async (codeToDelete: string) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer le code d'activation ${codeToDelete} ?`)) return;
    const updated = activationCodes.filter(c => c.code !== codeToDelete);
    try {
      const { error } = await supabase
        .from('barakat_planning')
        .upsert({
          id: 'activation_info',
          classes: [],
          teachers: [],
          rooms: [],
          subjects: [],
          courses: updated,
          updated_at: new Date().toISOString()
        });
        
      if (error) throw error;
      setActivationCodes(updated);
    } catch (err: any) {
      alert("Erreur lors de la suppression du code : " + err.message);
    }
  };

  // Procédure d'activation depuis la mire de login / blocage
  const handleVerifyAndActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activationCodeInput.trim()) return;
    
    setIsActivating(true);
    setActivationError('');
    
    const cleanCode = activationCodeInput.trim().toUpperCase();
    
    // Code Administrateur permanent ou d'urgence
    const masterKey = "BKT-ADMIN-789-MASTER";
    if (cleanCode === masterKey) {
      localStorage.setItem('barakat_activated', 'true');
      localStorage.setItem('barakat_activation_code_used', masterKey);
      setUserRole('admin');
      setIsActivated(true);
      setIsActivating(false);
      return;
    }
    
    try {
      // Pour éviter les conflits de lecture concurrentes, on relit l'état à jour depuis Supabase
      const { data, error } = await supabase
        .from('barakat_planning')
        .select('*')
        .eq('id', 'activation_info')
        .maybeSingle();
        
      if (error) throw error;
      
      let currentCodes: ActivationCode[] = [];
      if (data && Array.isArray(data.courses)) {
        currentCodes = data.courses as ActivationCode[];
      } else {
        // Enregistrement inexistant, on considère qu'aucun code n'a encore été créé.
        currentCodes = [
          { code: 'BKT-942-AZE', isUsed: false },
          { code: 'BKT-108-WXC', isUsed: false },
          { code: 'BKT-551-NJK', isUsed: false },
          { code: 'BKT-304-TYP', isUsed: false }
        ];
        
        await supabase.from('barakat_planning').upsert({
          id: 'activation_info',
          classes: [],
          teachers: [],
          rooms: [],
          subjects: [],
          courses: currentCodes,
          updated_at: new Date().toISOString()
        });
      }
      
      const foundIdx = currentCodes.findIndex(c => c.code.toUpperCase() === cleanCode);
      if (foundIdx === -1) {
        setActivationError("Code d'activation incorrect ou inexistant. Veuillez contacter votre administrateur.");
        setIsActivating(false);
        return;
      }
      
      const foundCode = currentCodes[foundIdx];
      if (foundCode.isUsed) {
        setActivationError(`Ce code d'activation à usage unique a déjà été utilisé sur un autre terminal.`);
        setIsActivating(false);
        return;
      }
      
      // Marquer comme utilisé
      const updatedCodes = [...currentCodes];
      updatedCodes[foundIdx] = {
        ...foundCode,
        isUsed: true,
        usedAt: new Date().toISOString(),
        usedBy: 'Appareil Client'
      };
      
      // Enregistrer dans Supabase
      const { error: saveError } = await supabase
        .from('barakat_planning')
        .upsert({
          id: 'activation_info',
          classes: [],
          teachers: [],
          rooms: [],
          subjects: [],
          courses: updatedCodes,
          updated_at: new Date().toISOString()
        });
        
      if (saveError) throw saveError;
      
      // Mettre à jour l'état local et localStorage
      localStorage.setItem('barakat_activated', 'true');
      localStorage.setItem('barakat_activation_code_used', cleanCode);
      setUserRole('professor');
      setActiveTab('dashboard');
      
      setActivationCodes(updatedCodes);
      setIsActivated(true);
    } catch (err: any) {
      console.error(err);
      setActivationError(`Une erreur s'est produite lors de la connexion réseau : ${err.message}`);
    } finally {
      setIsActivating(false);
    }
  };

  // Charger les codes d'activation dès que l'accès de l'utilisateur est légitime
  useEffect(() => {
    if (isActivated) {
      handleLoadActivationCodes();
    }
  }, [isActivated]);

  // Kick off Supabase boot load on start
  useEffect(() => {
    handleLoadFromSupabase();
  }, []);

  // Recalculate conflicts when data changes and persist (with local backup & Supabase Cloud Sync)
  useEffect(() => {
    const computed = checkAllConflicts(courses, classes, teachers, rooms);
    setConflicts(computed);

    // LocalStorage Fallback State Persistence
    localStorage.setItem('barakatplanning_classes', JSON.stringify(classes));
    localStorage.setItem('barakatplanning_teachers', JSON.stringify(teachers));
    localStorage.setItem('barakatplanning_rooms', JSON.stringify(rooms));
    localStorage.setItem('barakatplanning_subjects', JSON.stringify(subjects));
    localStorage.setItem('barakatplanning_courses', JSON.stringify(courses));

    // Auto push mutations to Supabase once initial boot loading is finished
    if (isInitialLoadComplete && (supabaseStatus === 'synced' || supabaseStatus === 'idle')) {
      handleSaveToSupabase({ classes, teachers, rooms, subjects, courses });
    }
  }, [courses, classes, teachers, rooms, subjects, isInitialLoadComplete]);

  // Handle auto filter defaults when filter categories change
  useEffect(() => {
    if (calendarFilterType === 'class' && classes.length > 0) {
      setSelectedFilterValue(classes[0].id);
    } else if (calendarFilterType === 'teacher' && teachers.length > 0) {
      setSelectedFilterValue(teachers[0].id);
    } else if (calendarFilterType === 'room' && rooms.length > 0) {
      setSelectedFilterValue(rooms[0].id);
    }
  }, [calendarFilterType]);

  // Method to clear ALL courses from schedule
  const handleClearAllCourses = () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer tous les cours programmés dans l'emploi du temps ?")) {
      setCourses([]);
    }
  };

  // Re-load initial demo dataset
  const handleResetDemoData = () => {
    if (window.confirm("Voulez-vous rétablir les données de démonstration initiales (matières, professeurs, salles et conflits pré-remplis) ?")) {
      localStorage.removeItem('barakatplanning_classes');
      localStorage.removeItem('barakatplanning_teachers');
      localStorage.removeItem('barakatplanning_rooms');
      localStorage.removeItem('barakatplanning_subjects');
      localStorage.removeItem('barakatplanning_courses');
      localStorage.removeItem('edusched_classes');
      localStorage.removeItem('edusched_teachers');
      localStorage.removeItem('edusched_rooms');
      localStorage.removeItem('edusched_subjects');
      localStorage.removeItem('edusched_courses');
      setClasses(INITIAL_CLASSES);
      setTeachers(INITIAL_TEACHERS);
      setRooms(INITIAL_ROOMS);
      setSubjects(INITIAL_SUBJECTS);
      setCourses(INITIAL_COURSES);
    }
  };

  // Switch filter selection to class instantly
  const handleNavigateToClassAndFilter = (classId: string) => {
    setCalendarFilterType('class');
    setSelectedFilterValue(classId);
    setActiveTab('schedule');
  };

  // Open planning modal for specific slot
  const handleOpenSlotModal = (dayId: string, slotId: string, existingCourse?: ScheduleCourse) => {
    setModalTargetDay(dayId);
    setModalTargetSlot(slotId);
    
    if (existingCourse) {
      setEditingCourseId(existingCourse.id);
      setModalClassId(existingCourse.classId);
      setModalSubjectId(existingCourse.subjectId);
      setModalTeacherId(existingCourse.teacherId);
      setModalRoomId(existingCourse.roomId);
    } else {
      setEditingCourseId(null);
      // Try to pre-fill logically based on current filter state
      setModalClassId(calendarFilterType === 'class' ? selectedFilterValue : (classes[0]?.id || ''));
      setModalTeacherId(calendarFilterType === 'teacher' ? selectedFilterValue : (teachers[0]?.id || ''));
      setModalRoomId(calendarFilterType === 'room' ? selectedFilterValue : (rooms[0]?.id || ''));
      setModalSubjectId(subjects[0]?.id || '');
    }

    setIsAddEditCourseModalOpen(true);
  };

  // Auto filter teacher based on subject inside Modal
  useEffect(() => {
    if (modalSubjectId) {
      // Prioritize teachers qualified in this subject
      const qualified = teachers.filter(t => t.subjects.includes(modalSubjectId));
      if (qualified.length > 0 && !qualified.some(q => q.id === modalTeacherId)) {
        setModalTeacherId(qualified[0].id);
      }
    }
  }, [modalSubjectId]);

  // Handle Course persistence inside modal
  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalClassId || !modalSubjectId || !modalTeacherId || !modalRoomId) {
      alert("Veuillez remplir tous les champs !");
      return;
    }

    if (editingCourseId) {
      // Edit mode
      setCourses(prev => prev.map(c => c.id === editingCourseId ? {
        ...c,
        classId: modalClassId,
        subjectId: modalSubjectId,
        teacherId: modalTeacherId,
        roomId: modalRoomId
      } : c));
    } else {
      // Create mode
      const newCourse: ScheduleCourse = {
        id: `c_${Date.now()}`,
        classId: modalClassId,
        subjectId: modalSubjectId,
        teacherId: modalTeacherId,
        roomId: modalRoomId,
        dayId: modalTargetDay,
        slotId: modalTargetSlot
      };
      setCourses(prev => [...prev, newCourse]);
    }

    setIsAddEditCourseModalOpen(false);
  };

  // Remove individual course from grid
  const handleDeleteCourse = (courseId: string) => {
    if (window.confirm("Voulez-vous supprimer ce cours de la grille d'emploi du temps ?")) {
      setCourses(prev => prev.filter(c => c.id !== courseId));
    }
  };

  // Quick Action: Auto-complete or schedule via AI endpoint
  const handleTriggerWizardGeneration = async () => {
    setIsWizardLoading(true);
    setWizardLog("Calcul en cours par l'I.A. de planification...");

    const reqItem = {
      classId: wizardClass,
      subjectId: wizardSubject,
      teacherId: wizardTeacher,
      roomId: wizardRoom,
      count: wizardHoursCount
    };

    try {
      const response = await fetch('/api/gemini/generate-auto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classes,
          teachers,
          rooms,
          currentCourses: courses,
          requirementsToScheduleByClass: [reqItem]
        })
      });

      const resData = await response.json();
      if (resData.success && Array.isArray(resData.courses) && resData.courses.length > 0) {
        const added = resData.courses;
        setCourses(prev => [...prev, ...added]);
        setWizardLog(`Succès ! L'IA a réussi à planifier ${added.length} cours pour la classe sans créer de conflit.`);
        // Ask assistant to summarize where they placed them
        const placeDetails = added.map((x: any) => `- ${subjects.find(s => s.id === x.subjectId)?.name || x.subjectId} le ${getDayLabel(x.dayId)} en ${x.slotId}`).join('\n');
        setAiChatHistory(prev => [
          ...prev,
          { role: 'user', text: `Planifie automatiquement ${wizardHoursCount}h de ${subjects.find(s => s.id === wizardSubject)?.name} pour la ${wizardClass}` },
          { role: 'model', text: `J'ai trouvé la meilleure structure libre sans collision pour ces cours et je les ai insérés directement sur la grille :\n\n${placeDetails}\n\nVous pouvez le constater directement sur l'emploi du temps !` }
        ]);
      } else {
        setWizardLog("Désolé, aucune proposition de créneau libre n'a pu être générée par l'IA sans violer l'une de vos contraintes de collision.");
      }
    } catch (e: any) {
      setWizardLog(`Erreur système lors du calcul : ${e.message}`);
    } finally {
      setIsWizardLoading(false);
    }
  };

  // Submit chat prompt to Gemini suggestion engine
  const handleSendAiPrompt = async (presetText?: string) => {
    const textToSend = presetText || customAiPrompt;
    if (!textToSend.trim()) return;

    if (!presetText) setCustomAiPrompt('');
    setIsAiLoading(true);

    const updatedHistory = [
      ...aiChatHistory,
      { role: 'user' as const, text: textToSend }
    ];
    setAiChatHistory(updatedHistory);

    try {
      const response = await fetch('/api/gemini/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courses,
          classes,
          teachers,
          rooms,
          prompt: textToSend,
          conversationHistory: updatedHistory.slice(-5) // Send some back history
        })
      });

      const data = await response.json();
      setAiChatHistory(prev => [
        ...prev,
        { role: 'model', text: data.text || "Désolé, j'ai rencontré un problème pour dresser mes recommandations." }
      ]);
    } catch (err: any) {
      setAiChatHistory(prev => [
        ...prev,
        { role: 'model', text: `**Erreur lors de la communication avec le serveur d'ordonnancement** : ${err.message}` }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Day IDs translations
  const getDayLabel = (dayId: string) => {
    switch (dayId) {
      case 'Mon': return 'Lundi';
      case 'Tue': return 'Mardi';
      case 'Wed': return 'Mercredi';
      case 'Thu': return 'Jeudi';
      case 'Fri': return 'Vendredi';
      default: return dayId;
    }
  };

  // Toggle unavailability in Teacher portal
  const handleToggleTeacherUnavailability = (dayId: string, slotId: string) => {
    const slotKey = `${dayId}_${slotId}`;
    setTeachers(prev => prev.map(t => {
      if (t.id === selectedProfPortalId) {
        const index = t.unavailableSlots.indexOf(slotKey);
        let updated = [...t.unavailableSlots];
        if (index > -1) {
          updated.splice(index, 1);
        } else {
          updated.push(slotKey);
        }
        return { ...t, unavailableSlots: updated };
      }
      return t;
    }));
  };

  // DB management helpers
  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClass.id || !newClass.name) return;
    
    if (editingClassId) {
      // Edit mode
      setClasses(prev => prev.map(c => c.id === editingClassId ? { ...c, name: newClass.name, capacity: newClass.capacity, color: newClass.color } : c));
      setEditingClassId(null);
    } else {
      // Create mode
      if (classes.some(c => c.id === newClass.id)) {
        alert("Une classe avec cet identifiant existe déjà !");
        return;
      }
      setClasses(prev => [...prev, newClass]);
    }
    setNewClass({ id: '', name: '', capacity: 25, color: 'blue' });
  };

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacher.id || !newTeacher.name) return;

    if (editingTeacherId) {
      // Edit mode
      setTeachers(prev => prev.map(t => t.id === editingTeacherId ? {
        ...t,
        name: newTeacher.name,
        subjects: newTeacher.subjects,
        maxHoursPerWeek: newTeacher.maxHours,
        color: newTeacher.color,
        email: newTeacher.email
      } : t));
      setEditingTeacherId(null);
    } else {
      // Create mode
      if (teachers.some(t => t.id === newTeacher.id)) {
        alert("Un enseignant avec cet identifiant existe déjà !");
        return;
      }
      setTeachers(prev => [...prev, {
        id: newTeacher.id,
        name: newTeacher.name,
        subjects: newTeacher.subjects,
        maxHoursPerWeek: newTeacher.maxHours,
        color: newTeacher.color,
        email: newTeacher.email,
        unavailableSlots: []
      }]);
    }
    setNewTeacher({ id: '', name: '', subjects: [], maxHours: 18, color: 'indigo', email: '' });
  };

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoom.id || !newRoom.name) return;

    if (editingRoomId) {
      // Edit mode
      setRooms(prev => prev.map(r => r.id === editingRoomId ? {
        ...r,
        name: newRoom.name,
        type: newRoom.type,
        capacity: newRoom.capacity
      } : r));
      setEditingRoomId(null);
    } else {
      // Create mode
      if (rooms.some(r => r.id === newRoom.id)) {
        alert("Une salle avec cet identifiant existe déjà !");
        return;
      }
      setRooms(prev => [...prev, newRoom]);
    }
    setNewRoom({ id: '', name: '', type: 'Standard', capacity: 30, color: 'slate' });
  };

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.id || !newSubject.name) return;

    if (editingSubjectId) {
      // Edit mode
      setSubjects(prev => prev.map(s => s.id === editingSubjectId ? {
        ...s,
        name: newSubject.name,
        color: newSubject.color
      } : s));
      setEditingSubjectId(null);
    } else {
      // Create mode
      if (subjects.some(s => s.id === newSubject.id)) {
        alert("Une matière avec cet identifiant existe déjà !");
        return;
      }
      setSubjects(prev => [...prev, newSubject]);
    }
    setNewSubject({ id: '', name: '', color: 'rose' });
  };

  // Start Editing Triggers
  const handleStartEditTeacher = (teacher: TeacherItem) => {
    setEditingTeacherId(teacher.id);
    setNewTeacher({
      id: teacher.id,
      name: teacher.name,
      subjects: teacher.subjects,
      maxHours: teacher.maxHoursPerWeek || 18,
      color: teacher.color || 'indigo',
      email: teacher.email || ''
    });
  };

  const handleStartEditRoom = (room: RoomItem) => {
    setEditingRoomId(room.id);
    setNewRoom({
      id: room.id,
      name: room.name,
      type: room.type,
      capacity: room.capacity,
      color: room.color || 'slate'
    });
  };

  const handleStartEditClass = (cls: ClassItem) => {
    setEditingClassId(cls.id);
    setNewClass({
      id: cls.id,
      name: cls.name,
      capacity: cls.capacity,
      color: cls.color || 'blue'
    });
  };

  const handleStartEditSubject = (sub: SubjectItem) => {
    setEditingSubjectId(sub.id);
    setNewSubject({
      id: sub.id,
      name: sub.name,
      color: sub.color || 'rose'
    });
  };

  const handleDeleteTeacherDb = (id: string) => {
    if (confirm("Supprimer ce professeur ? Les cours qui lui sont associés seront orphelins.")) {
      setTeachers(prev => prev.filter(t => t.id !== id));
      // Optionally clean up or leave course to show warning
    }
  };

  const handleDeleteClassDb = (id: string) => {
    if (confirm("Supprimer cette classe ? Les cours associés seront également retirés.")) {
      setClasses(prev => prev.filter(c => c.id !== id));
      setCourses(prev => prev.filter(c => c.classId !== id));
    }
  };

  const handleDeleteRoomDb = (id: string) => {
    if (confirm("Supprimer cette salle ? Les cours associés n'auront plus d'affectation de salle.")) {
      setRooms(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleDeleteSubjectDb = (id: string) => {
    if (confirm("Supprimer cette matière ?")) {
      setSubjects(prev => prev.filter(s => s.id !== id));
    }
  };

  // Find specific detail color for classes or subjects to draw schedules
  const getSubjectColorClasses = (subjectId: string): { font: string, bg: string, border: string, bgLight: string } => {
    const sub = subjects.find(s => s.id === subjectId);
    const colorCode = sub?.color || 'slate';
    return COLOR_CLASSES[colorCode] || COLOR_CLASSES['slate'];
  };

  const getClassColorClasses = (classId: string): { font: string, bg: string, border: string, bgLight: string } => {
    const cls = classes.find(c => c.id === classId);
    const colorCode = cls?.color || 'slate';
    return COLOR_CLASSES[colorCode] || COLOR_CLASSES['slate'];
  };

  // Filter courses depending on actual user selection
  const getFilteredCoursesForGrid = (): ScheduleCourse[] => {
    if (userRole === 'professor') {
      return courses.filter(c => c.teacherId === selectedProfPortalId);
    }

    // Role admin filtered
    if (calendarFilterType === 'class') {
      return courses.filter(c => c.classId === selectedFilterValue);
    } else if (calendarFilterType === 'teacher') {
      return courses.filter(c => c.teacherId === selectedFilterValue);
    } else {
      return courses.filter(c => c.roomId === selectedFilterValue);
    }
  };

  const currentGridCourses = getFilteredCoursesForGrid();

  if (isDomainLocked) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans select-none">
        {/* Background alert highlights */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-red-650/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="w-full max-w-lg bg-slate-900/60 backdrop-blur-2xl border border-red-900/30 p-8 md:p-10 rounded-3xl shadow-2xl relative z-10 text-center border-t-4 border-t-red-500">
          <div className="mx-auto w-16 h-16 bg-red-550/15 border border-red-500/20 text-red-555 rounded-full flex items-center justify-center mb-6">
            <Shield className="h-8 w-8 text-red-550 animate-pulse" />
          </div>

          <h1 className="text-sm font-black tracking-[0.25em] text-red-500 uppercase leading-none">
            ERREUR DE LICENCE
          </h1>
          <h2 className="text-xl font-black text-white mt-3 uppercase tracking-tight font-sans">
            INSTANCE NON AUTORISÉE
          </h2>
          
          <div className="h-[2px] w-12 bg-red-950 rounded-full my-6 mx-auto"></div>

          <p className="text-xs text-slate-300 leading-relaxed text-center px-2">
            Le code de sécurité et de droit d'auteur du logiciel <strong>BARAKATPLANNING</strong> interdit formellement le clonage, la reproduction ou la redistribution brute de ses fichiers sur un domaine non enregistré.
          </p>
          
          <p className="text-xs text-slate-400 mt-4 leading-relaxed text-center px-4 bg-slate-950/40 p-3.5 border border-slate-900 rounded-2xl font-mono">
            Hébergement détecté : <span className="text-red-400 font-bold">{window.location.hostname}</span> <br/>
            Statut : <strong>ACCÈS SUSPENDU PAR LE SERVEUR</strong>
          </p>

          <p className="text-[10px] text-slate-500 leading-normal mt-6">
            Pour acquérir ou transférer votre licence sur un autre serveur d'établissement scolaire, contactez le titulaire exclusif des droits d'exploitation.
          </p>
        </div>
      </div>
    );
  }

  if (!isActivated) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* Background decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#ee7b11]/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#0b4998]/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="w-full max-w-md bg-white border border-slate-200/80 p-8 rounded-3xl shadow-xl relative z-10 transition-all duration-300">
          
          {/* Brand Logo Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="mb-4 transform hover:scale-105 transition duration-300">
              <BrandLogo className="h-20" />
            </div>
            
            <h2 className="text-xs font-bold text-slate-700 tracking-wide mt-2">
              Planificateur scolaire — Accès Sécurisé
            </h2>
            <p className="text-[11px] text-slate-500 mt-2 leading-relaxed max-w-xs">
              Cette application est réservée à l'usage exclusif de l'administration et des enseignants pour {schoolName} ({schoolSubName}).
            </p>
          </div>

          <form onSubmit={handleVerifyAndActivate} className="space-y-4">
            <div>
              <label htmlFor="activation-code" className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 text-center">
                Clé d'administration / Enseignant
              </label>
              <div className="relative">
                <input
                  id="activation-code"
                  type="text"
                  placeholder="EX: BKT-XYZ-123"
                  value={activationCodeInput}
                  onChange={(e) => {
                    setActivationCodeInput(e.target.value);
                    if (activationError) setActivationError('');
                  }}
                  autoFocus
                  required
                  className="w-full px-4 py-3 bg-stone-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 font-mono text-center text-sm font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-[#0b4998] focus:border-[#0b4998] uppercase transition"
                />
              </div>
            </div>

            {activationError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-650 rounded-xl text-xs font-semibold leading-relaxed flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{activationError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isActivating || !activationCodeInput.trim()}
              className="w-full py-3 bg-[#0b4998] hover:bg-[#093d80] disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl text-xs uppercase tracking-widest transition flex items-center justify-center gap-2 cursor-pointer border border-[#0b4998] shadow-md hover:shadow-lg"
            >
              {isActivating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Vérification cloud...</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>Démarrer l'application</span>
                </>
              )}
            </button>
          </form>

          {/* Device details help */}
          <div className="mt-8 pt-5 border-t border-slate-100 text-center">
            <p className="text-[9px] text-slate-400 leading-normal">
              Accès restreint — validé en temps réel auprès du serveur cloud pour l'établissement scolaire.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* Upper Navigation Header */}
      <header id="edu-header" className="bg-[#0b4998] text-white shadow-xl border-b border-[#f3aa1c]/30 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Brand Logo */}
            <div className="flex items-center shrink-0">
              <BrandLogo isDarkBackground={true} className="h-10 sm:h-11" />
            </div>

            {/* Profile / Role Selector switches */}
            <div className="flex items-center gap-3">
              {/* Supabase connection status pill */}
              <div 
                onClick={() => {
                  setUserRole('admin');
                  setActiveTab('dashboard');
                }}
                className="cursor-pointer hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-slate-900/40 border-slate-700/50 hover:border-[#f3aa1c]/50 transition text-slate-300"
                title="Statut de la synchronisation Supabase - Cliquez pour accéder au tableau de bord."
              >
                <Database className={`h-3.5 w-3.5 ${
                  supabaseStatus === 'synced' ? 'text-emerald-400' : 
                  supabaseStatus === 'connecting' ? 'text-amber-400 animate-spin' : 
                  supabaseStatus === 'error_tables' ? 'text-red-400 animate-pulse' : 'text-slate-400'
                }`} />
              <span className="text-[10px] font-bold text-slate-400">État :</span>
                <span className={`text-[10px] font-extrabold ${
                  supabaseStatus === 'synced' ? 'text-emerald-400' : 
                  supabaseStatus === 'connecting' ? 'text-amber-400' : 
                  supabaseStatus === 'error_tables' ? 'text-red-400' : 'text-slate-400'
                }`}>
                  {supabaseStatus === 'synced' ? 'Connecté à la base de données' : 
                   supabaseStatus === 'connecting' ? 'Connexion en cours...' : 
                   supabaseStatus === 'error_tables' ? 'Erreur base de données' : 'Base de données hors ligne'}
                </span>
              </div>

              {localStorage.getItem('barakat_activation_code_used') === "BKT-ADMIN-789-MASTER" && (
                <div className="flex bg-[#093d80] p-1 rounded-xl border border-white/10">
                  <button
                    onClick={() => {
                      setUserRole('admin');
                      setActiveTab('dashboard');
                    }}
                    className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      userRole === 'admin' 
                        ? 'bg-[#ee7b11] text-white shadow-sm' 
                        : 'text-blue-100 hover:text-white'
                    }`}
                  >
                    Admin
                  </button>
                  <button
                    onClick={() => {
                      setUserRole('professor');
                      setIsAiDrawerOpen(false);
                    }}
                    className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      userRole === 'professor' 
                        ? 'bg-[#f3aa1c] text-stone-900 shadow-sm' 
                        : 'text-blue-100 hover:text-white'
                    }`}
                  >
                    <User className="h-3 w-3" />
                    <span>Enseignant</span>
                  </button>
                </div>
              )}

              {/* AI assistant removed for white-labeling */}
            </div>

          </div>
        </div>

        {/* Unified Administrative Sub-bar Tabs for Admin Role */}
        {userRole === 'admin' && (
          <div className="bg-[#093d80] border-t border-[#f3aa1c]/15">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <nav className="flex items-center justify-start md:justify-center gap-1 sm:gap-2 py-2 overflow-x-auto scrollbar-none whitespace-nowrap">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`cursor-pointer px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                    activeTab === 'dashboard' ? 'bg-[#ee7b11] text-white shadow-md' : 'text-blue-100 hover:bg-[#072c5e] hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Tableau de bord</span>
                </button>
                <button
                  onClick={() => setActiveTab('stats')}
                  className={`cursor-pointer px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                    activeTab === 'stats' ? 'bg-[#ee7b11] text-white shadow-md' : 'text-blue-100 hover:bg-[#072c5e] hover:text-white'
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Statistiques</span>
                </button>
                <button
                  onClick={() => setActiveTab('schedule')}
                  className={`cursor-pointer px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                    activeTab === 'schedule' ? 'bg-[#ee7b11] text-white shadow-md' : 'text-blue-100 hover:bg-[#072c5e] hover:text-white'
                  }`}
                >
                  <Calendar className="h-4 w-4" />
                  <span>Planificateur Grille</span>
                </button>
                <button
                  onClick={() => setActiveTab('teachers')}
                  className={`cursor-pointer px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                    activeTab === 'teachers' ? 'bg-[#ee7b11] text-white shadow-md' : 'text-blue-100 hover:bg-[#072c5e] hover:text-white'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  <span>Professeurs</span>
                </button>
                <button
                  onClick={() => setActiveTab('rooms')}
                  className={`cursor-pointer px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                    activeTab === 'rooms' ? 'bg-[#ee7b11] text-white shadow-md' : 'text-blue-100 hover:bg-[#072c5e] hover:text-white'
                  }`}
                >
                  <School className="h-4 w-4" />
                  <span>Salles</span>
                </button>
                <button
                  onClick={() => setActiveTab('classes')}
                  className={`cursor-pointer px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                    activeTab === 'classes' ? 'bg-[#ee7b11] text-white shadow-md' : 'text-blue-100 hover:bg-[#072c5e] hover:text-white'
                  }`}
                >
                  <GraduationCap className="h-4 w-4" />
                  <span>Classes</span>
                </button>
                <button
                  onClick={() => setActiveTab('subjects')}
                  className={`cursor-pointer px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                    activeTab === 'subjects' ? 'bg-[#ee7b11] text-white shadow-md' : 'text-blue-100 hover:bg-[#072c5e] hover:text-white'
                  }`}
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Matières</span>
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`cursor-pointer px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                    activeTab === 'settings' ? 'bg-[#ee7b11] text-white shadow-md' : 'text-blue-100 hover:bg-[#072c5e] hover:text-white'
                  }`}
                >
                  <Settings className="h-4 w-4" />
                  <span>Paramètres</span>
                </button>
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col md:flex-row relative min-h-0 overflow-hidden">
        
        {/* Central screen content */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto">
          
          {userRole === 'admin' ? (
            // ================= ADMIN ROLE VIEWS =================
            <>
              {activeTab === 'dashboard' && (
                <DashboardTab 
                  classes={classes}
                  teachers={teachers}
                  rooms={rooms}
                  courses={courses}
                  conflicts={conflicts}
                  onSetClassFilter={handleNavigateToClassAndFilter}
                  onSetTab={setActiveTab}
                  onClearAll={handleClearAllCourses}
                  onResetData={handleResetDemoData}
                  supabaseStatus={supabaseStatus}
                  supabaseErrorMsg={supabaseErrorMsg}
                  isSyncing={isSyncing}
                  onSaveToSupabase={handleSaveToSupabase}
                  onLoadFromSupabase={handleLoadFromSupabase}
                  activationCodes={activationCodes}
                  onGenerateNewCode={handleGenerateNewCode}
                  onDeleteActivationCode={handleDeleteActivationCode}
                  schoolName={schoolName}
                />
              )}

              {activeTab === 'schedule' && (
                <div className="space-y-6">
                  {/* Calendar controller controls */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 no-print">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                          onClick={() => setCalendarFilterType('class')}
                          className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                            calendarFilterType === 'class' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                          }`}
                        >
                          Par Classe
                        </button>
                        <button
                          onClick={() => setCalendarFilterType('teacher')}
                          className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                            calendarFilterType === 'teacher' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                          }`}
                        >
                          Par Professeur
                        </button>
                        <button
                          onClick={() => setCalendarFilterType('room')}
                          className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                            calendarFilterType === 'room' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                          }`}
                        >
                          Par Salle
                        </button>
                      </div>
 
                      {/* Dropdown selector for dynamic filters state */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-400">Ciblé:</span>
                        <select
                          value={selectedFilterValue}
                          onChange={(e) => setSelectedFilterValue(e.target.value)}
                          className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                        >
                          {calendarFilterType === 'class' && classes.map(c => (
                            <option key={c.id} value={c.id}>{c.name} ({c.capacity} él.)</option>
                          ))}
                          {calendarFilterType === 'teacher' && teachers.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                          {calendarFilterType === 'room' && rooms.map(r => (
                            <option key={r.id} value={r.id}>{r.name} - ({r.type}, Cap: {r.capacity})</option>
                          ))}
                        </select>
                      </div>
                    </div>
 
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => window.print()}
                        className="cursor-pointer px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md shrink-0 border border-slate-700"
                        title="Imprimer l'emploi du temps actuel au format A4 Paysage"
                      >
                        <Printer className="h-4 w-4 text-emerald-400" />
                        <span>Imprimer en A4 Landscape</span>
                      </button>

                      <div className="text-xs text-slate-500 font-semibold italic flex items-center gap-1 bg-indigo-550/10 text-indigo-900 border border-indigo-150 rounded-xl px-3 py-1.5">
                        <Info className="h-3.5 w-3.5 shrink-0" />
                        <span>Cliquez sur une heure pour planifier.</span>
                      </div>
                    </div>
                  </div>
 
                  {/* Dynamic schedule grid display */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-4 md:p-6 shadow-sm overflow-x-auto print:border-none print:p-0 print:shadow-none">
                    
                    {/* Header d'impression professionnel visible uniquement sur l'impression papier A4 */}
                    <div className="hidden print:block mb-6 border-b-2 border-slate-900 pb-4">
                      <div className="flex justify-between items-end">
                        <div className="space-y-1">
                          <div className="text-[10px] text-indigo-600 font-extrabold tracking-widest uppercase">
                            {schoolName} — {schoolSubName}
                          </div>
                          <h1 className="text-2xl font-black text-slate-950 uppercase tracking-tight">
                            {calendarFilterType === 'class' && `Emploi du Temps : Classe de ${classes.find(c => c.id === selectedFilterValue)?.name || selectedFilterValue}`}
                            {calendarFilterType === 'teacher' && `Emploi du Temps (Enseignant) : ${teachers.find(t => t.id === selectedFilterValue)?.name || selectedFilterValue}`}
                            {calendarFilterType === 'room' && `Affectation de la Salle : ${rooms.find(r => r.id === selectedFilterValue)?.name || selectedFilterValue}`}
                          </h1>
                          <p className="text-xs text-slate-600 font-semibold">
                            Fiche d'apprentissage officielle de l'établissement scolaire — Année Académique {academicYear}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10.5px] font-bold text-slate-900 block bg-slate-100 px-3 py-1 rounded-md border border-slate-200">
                            Fiche d'affichage A4 officielle
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono block mt-1.5 leading-none">
                            Généré et imprimé le {new Date().toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <table className="w-full min-w-[700px] border-collapse">
                      <thead>
                        <tr>
                          <th className="w-24 p-3 text-left text-xs font-bold text-slate-400 tracking-widest uppercase border-b border-slate-100">
                            Heure
                          </th>
                          {DAYS.map(day => (
                            <th 
                              key={day.id} 
                              className="p-3 text-center text-xs font-bold text-slate-700 tracking-wide uppercase border-b border-slate-100"
                            >
                              {day.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {TIME_SLOTS.map(slot => (
                          <tr key={slot.id} className="group border-b border-slate-100/50 hover:bg-slate-50/30">
                            {/* Hour label slot cell */}
                            <td className="p-3 font-semibold text-xs text-slate-400 border-r border-slate-100">
                              <div className="font-bold text-slate-700">{slot.id}</div>
                              <div className="text-[10px] mt-0.5">{slot.start} - {slot.end}</div>
                            </td>

                            {/* Active days scheduling cell elements */}
                            {DAYS.map(day => {
                              // Find courses scheduled at this slot matching our active view filters
                              const matchedCourses = currentGridCourses.filter(c => c.dayId === day.id && c.slotId === slot.id);
                              
                              // Check if we have any conflicts involving these specific course IDs
                              const slotConflicts = conflicts.filter(c => 
                                matchedCourses.some(mc => c.courseIds.includes(mc.id))
                              );
                              const hasError = slotConflicts.some(sc => sc.severity === 'error');
                              const hasWarning = slotConflicts.some(sc => sc.severity === 'warning');

                              return (
                                <td 
                                  key={day.id} 
                                  className="p-2 border-r border-slate-100 align-top min-w-[130px]"
                                >
                                  {matchedCourses.length > 0 ? (
                                    <div className="space-y-2">
                                      {matchedCourses.map(course => {
                                        const subColor = getSubjectColorClasses(course.subjectId);
                                        const classColor = getClassColorClasses(course.classId);
                                        const teacherObj = teachers.find(t => t.id === course.teacherId);
                                        const roomObj = rooms.find(r => r.id === course.roomId);

                                        // Find if this particular course has warning or error conflicts on it
                                        const courseConflicts = slotConflicts.filter(sc => sc.courseIds.includes(course.id));
                                        const isCourseInError = courseConflicts.some(sc => sc.severity === 'error');
                                        const isCourseInWarning = courseConflicts.some(sc => sc.severity === 'warning');

                                        return (
                                          <div
                                            key={course.id}
                                            className={`group/card relative py-2.5 px-3 rounded-2xl border text-left transition hover:scale-[1.02] hover:shadow-sm ${subColor.bg} ${subColor.border} ${
                                              isCourseInError ? 'ring-2 ring-red-500' : isCourseInWarning ? 'ring-2 ring-amber-400' : ''
                                            }`}
                                          >
                                            <div className="flex justify-between items-start">
                                              <span className="text-xs font-bold leading-tight block">
                                                {subjects.find(s => s.id === course.subjectId)?.name || course.subjectId}
                                              </span>
                                              
                                              {/* Hover interactive actions */}
                                              <div className="opacity-0 group-hover/card:opacity-100 flex items-center gap-1 transition ml-2">
                                                <button
                                                  onClick={() => handleOpenSlotModal(day.id, slot.id, course)}
                                                  className="cursor-pointer p-1 rounded-md text-slate-600 bg-white hover:bg-slate-150 transition border border-slate-250"
                                                  title="Modifier"
                                                >
                                                  <Edit className="h-3 w-3" />
                                                </button>
                                                <button
                                                  onClick={() => handleDeleteCourse(course.id)}
                                                  className="cursor-pointer p-1 rounded-md text-red-600 bg-white hover:bg-red-50 transition border border-red-200"
                                                  title="Supprimer"
                                                >
                                                  <Trash2 className="h-3 w-3" />
                                                </button>
                                              </div>
                                            </div>

                                            {/* Sub Details label text */}
                                            <div className="text-[11px] font-medium text-slate-600 mt-1 space-y-0.5">
                                              {calendarFilterType !== 'class' && (
                                                <div className="flex items-center gap-1 font-bold">
                                                  <GraduationCap className="h-2.5 w-2.5" />
                                                  <span>{classColor && classColor.font ? '' : ''}{classes.find(c => c.id === course.classId)?.name || course.classId}</span>
                                                </div>
                                              )}
                                              {calendarFilterType !== 'teacher' && (
                                                <div className="flex items-center gap-1">
                                                  <User className="h-2.5 w-2.5" />
                                                  <span>{teacherObj?.name || course.teacherId}</span>
                                                </div>
                                              )}
                                              {calendarFilterType !== 'room' && (
                                                <div className="flex items-center gap-1">
                                                  <School className="h-2.5 w-2.5" />
                                                  <span className="font-semibold">{roomObj?.name || course.roomId}</span>
                                                </div>
                                              )}
                                            </div>

                                            {/* Indicators if conflicts exist inside that card */}
                                            {courseConflicts.length > 0 && (
                                              <div className="mt-1.5 pt-1 border-t border-slate-200/50 flex flex-col gap-1">
                                                {courseConflicts.map((sc, scIdx) => (
                                                  <div 
                                                    key={scIdx} 
                                                    className={`text-[9px] font-bold flex items-center gap-1 ${sc.severity === 'error' ? 'text-red-700' : 'text-amber-700'}`}
                                                    title={sc.message}
                                                  >
                                                    {sc.severity === 'error' ? <AlertCircle className="h-2.5 w-2.5 inline shrink-0" /> : <AlertTriangle className="h-2.5 w-2.5 inline shrink-0" />}
                                                    <span className="truncate max-w-[150px]">{sc.message}</span>
                                                  </div>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    // Empty slot card layout (Add Trigger)
                                    <button
                                      onClick={() => handleOpenSlotModal(day.id, slot.id)}
                                      className="w-full text-center py-6 border border-dashed border-slate-200 rounded-2xl hover:border-indigo-400 hover:bg-indigo-50/30 text-slate-350 hover:text-indigo-600 font-bold transition flex flex-col items-center justify-center gap-1 group/empty cursor-pointer"
                                    >
                                      <Plus className="h-4 w-4 transform group-hover/empty:scale-110 transition shrink-0" />
                                      <span className="text-[10px] uppercase tracking-wider font-semibold">Réserver</span>
                                    </button>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB: Teachers database */}
              {activeTab === 'teachers' && (
                <div className="space-y-6">
                  {/* Create New form */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <Users className="h-5 w-5 text-indigo-600" />
                        <span>{editingTeacherId ? `Modifier l'Enseignant: ${newTeacher.name}` : "Ajouter un Enseignant"}</span>
                      </h3>
                      {editingTeacherId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTeacherId(null);
                            setNewTeacher({ id: '', name: '', subjects: [], maxHours: 18, color: 'indigo', email: '' });
                          }}
                          className="cursor-pointer text-xs font-bold text-slate-500 hover:text-red-500 bg-slate-100 hover:bg-red-50 border border-slate-200 px-3 py-1 rounded-xl transition"
                        >
                          Annuler la modification
                        </button>
                      )}
                    </div>
                    <form onSubmit={handleAddTeacher} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500">Identifiant Unique</label>
                        <input
                          type="text"
                          required
                          disabled={!!editingTeacherId}
                          placeholder="ex: prof_martin"
                          value={newTeacher.id}
                          onChange={(e) => setNewTeacher(prev => ({ ...prev, id: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-50 disabled:opacity-60 border border-slate-250 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-550"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500">Nom Complet</label>
                        <input
                          type="text"
                          required
                          placeholder="M. Martin"
                          value={newTeacher.name}
                          onChange={(e) => setNewTeacher(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-250 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-550"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500">Max Heures / Semaine</label>
                        <input
                          type="number"
                          min="1"
                          max="40"
                          value={newTeacher.maxHours}
                          onChange={(e) => setNewTeacher(prev => ({ ...prev, maxHours: parseInt(e.target.value) || 18 }))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-250 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-550"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500">Spécialité Principale</label>
                        <select
                          value={newTeacher.subjects[0] || ''}
                          onChange={(e) => setNewTeacher(prev => ({ ...prev, subjects: e.target.value ? [e.target.value] : [] }))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-250 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-550"
                        >
                          <option value="">Sélectionnez une matière</option>
                          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-semibold text-slate-500">Adresse Email académique (Optionnel)</label>
                        <input
                          type="email"
                          placeholder="identifiant@edu-scolaires.fr"
                          value={newTeacher.email}
                          onChange={(e) => setNewTeacher(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-250 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-550"
                        />
                      </div>

                      <button
                        type="submit"
                        className="cursor-pointer h-10 w-full sm:col-span-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center justify-center gap-1"
                      >
                        {editingTeacherId ? <Check className="h-4 w-4 text-emerald-400" /> : <Plus className="h-4 w-4" />}
                        <span>{editingTeacherId ? "Enregistrer les modifications" : "Enregistrer l'enseignant"}</span>
                      </button>
                    </form>
                  </div>

                  {/* List current */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs overflow-hidden">
                    <h3 className="text-base font-bold text-slate-900 mb-4">Membres du Corps Enseignant</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {teachers.map(teacher => {
                        // Count scheduled hours
                        const countHours = courses.filter(c => c.teacherId === teacher.id).length;
                        return (
                          <div key={teacher.id} className="border border-slate-200 rounded-2xl p-4 space-y-3 flex flex-col justify-between hover:shadow-xs transition">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <div className={`h-3.5 w-3.5 rounded-full bg-${teacher.color}-500 bg-indigo-500`}></div>
                                <span className="font-bold text-sm text-slate-900">{teacher.name}</span>
                              </div>
                              <span className="text-[10px] font-bold text-slate-400 block uppercase">ID: {teacher.id}</span>
                              
                              <p className="text-xs text-slate-600">
                                Qualifié pour : <span className="font-semibold text-indigo-700">{teacher.subjects.map(sid => subjects.find(s => s.id === sid)?.name || sid).join(', ') || 'Aucune qualification'}</span>
                              </p>
                              <p className="text-[11px] text-slate-500">
                                Enseigne actuellement <span className="font-bold text-slate-900">{countHours} heures</span> sur un volant d'heures vœux de {teacher.maxHoursPerWeek}h max.
                              </p>
                              {teacher.email && (
                                <p className="text-[10px] text-slate-400 font-mono select-all truncate">
                                  {teacher.email}
                                </p>
                              )}
                            </div>
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                              <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                                {teacher.unavailableSlots.length} indispos déclarées
                              </span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleStartEditTeacher(teacher)}
                                  className="cursor-pointer text-indigo-600 hover:text-indigo-800 text-xs font-bold transition p-1 rounded hover:bg-indigo-50 flex items-center justify-center gap-1"
                                  title="Modifier les options de l'enseignant"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTeacherDb(teacher.id)}
                                  className="cursor-pointer text-red-500 hover:text-red-700 text-xs font-bold transition p-1 rounded hover:bg-red-50"
                                  title="Supprimer"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: Rooms list */}
              {activeTab === 'rooms' && (
                <div className="space-y-6">
                  {/* Create New Room form */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <School className="h-5 w-5 text-indigo-600" />
                        <span>{editingRoomId ? `Modifier la Salle : ${newRoom.name}` : "Ajouter une Salle de Classe"}</span>
                      </h3>
                      {editingRoomId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingRoomId(null);
                            setNewRoom({ id: '', name: '', type: 'Standard', capacity: 30, color: 'slate' });
                          }}
                          className="cursor-pointer text-xs font-bold text-slate-500 hover:text-red-500 bg-slate-100 hover:bg-red-50 border border-slate-200 px-3 py-1 rounded-xl transition"
                        >
                          Annuler la modification
                        </button>
                      )}
                    </div>
                    <form onSubmit={handleAddRoom} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500">Identifiant Unique</label>
                        <input
                          type="text"
                          required
                          disabled={!!editingRoomId}
                          placeholder="ex: s103"
                          value={newRoom.id}
                          onChange={(e) => setNewRoom(prev => ({ ...prev, id: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-50 disabled:opacity-60 border border-slate-250 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-550"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500">Nom de la Salle</label>
                        <input
                          type="text"
                          required
                          placeholder="ex: Salle 103"
                          value={newRoom.name}
                          onChange={(e) => setNewRoom(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-250 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-550"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500">Type de la Salle</label>
                        <select
                          value={newRoom.type}
                          onChange={(e) => setNewRoom(prev => ({ ...prev, type: e.target.value as any }))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-250 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-550"
                        >
                          <option value="Standard">Standard</option>
                          <option value="Lab">Lab (Laboratoire)</option>
                          <option value="Gym">Gym (Gymnase)</option>
                          <option value="Art">Art (Atelier Dessin)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500">Capacité d’accueil maximale</label>
                        <input
                          type="number"
                          min="5"
                          max="200"
                          value={newRoom.capacity}
                          onChange={(e) => setNewRoom(prev => ({ ...prev, capacity: parseInt(e.target.value) || 30 }))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-250 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-550"
                        />
                      </div>

                      <button
                        type="submit"
                        className="cursor-pointer h-10 w-full md:col-span-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center justify-center gap-1"
                      >
                        {editingRoomId ? <Check className="h-4 w-4 text-emerald-400" /> : <Plus className="h-4 w-4" />}
                        <span>{editingRoomId ? "Enregistrer les modifications" : "Enregistrer la salle"}</span>
                      </button>
                    </form>
                  </div>

                  {/* List current rooms */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs overflow-hidden">
                    <h3 className="text-base font-bold text-slate-900 mb-4 font-bold text-slate-900 mb-4">Liste des Salles</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                      {rooms.map(room => (
                        <div key={room.id} className="border border-slate-200 rounded-2xl p-4 space-y-2 flex flex-col justify-between hover:shadow-xs transition">
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-sm text-slate-900">{room.name}</span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800">
                                {room.type}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">ID unique : <span className="font-mono font-bold">{room.id}</span></p>
                          </div>
                          
                          <div className="pt-2 border-t border-slate-150 flex items-center justify-between text-xs font-semibold">
                            <span className="text-slate-600">Capacité : {room.capacity} places</span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleStartEditRoom(room)}
                                className="cursor-pointer text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 p-1.5 rounded-lg flex items-center justify-center transition"
                                title="Modifier la salle"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteRoomDb(room.id)}
                                className="cursor-pointer text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg flex items-center justify-center transition"
                                title="Supprimer la salle"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: Classes list */}
              {activeTab === 'classes' && (
                <div className="space-y-6">
                  {/* Create New Class form */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-indigo-600" />
                        <span>{editingClassId ? `Modifier le Groupe : ${newClass.name}` : "Ajouter un Groupe de Classe"}</span>
                      </h3>
                      {editingClassId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingClassId(null);
                            setNewClass({ id: '', name: '', capacity: 25, color: 'blue' });
                          }}
                          className="cursor-pointer text-xs font-bold text-slate-500 hover:text-red-500 bg-slate-100 hover:bg-red-50 border border-slate-200 px-3 py-1 rounded-xl transition"
                        >
                          Annuler la modification
                        </button>
                      )}
                    </div>
                    <form onSubmit={handleAddClass} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500">Identifiant Unique</label>
                        <input
                          type="text"
                          required
                          disabled={!!editingClassId}
                          placeholder="ex: 2D"
                          value={newClass.id}
                          onChange={(e) => setNewClass(prev => ({ ...prev, id: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-50 disabled:opacity-60 border border-slate-250 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-550"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500">Nom d'usage de la Classe</label>
                        <input
                          type="text"
                          required
                          placeholder="ex: Classe de Seconde D"
                          value={newClass.name}
                          onChange={(e) => setNewClass(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-250 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-550"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500">Nombre d'élèves total</label>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={newClass.capacity}
                          onChange={(e) => setNewClass(prev => ({ ...prev, capacity: parseInt(e.target.value) || 25 }))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-250 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-550"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500">Code de thématique couleur</label>
                        <select
                          value={newClass.color}
                          onChange={(e) => setNewClass(prev => ({ ...prev, color: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-250 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-550"
                        >
                          <option value="blue">Bleu Océan</option>
                          <option value="emerald">Vert Émeraude</option>
                          <option value="rose">Rose Fuschia</option>
                          <option value="amber">Ambre Fauve</option>
                          <option value="purple">Violet Pourpre</option>
                          <option value="indigo">Violet Indigo</option>
                          <option value="cyan">Cyan Lagon</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="cursor-pointer h-10 w-full md:col-span-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center justify-center gap-1"
                      >
                        {editingClassId ? <Check className="h-4 w-4 text-emerald-400" /> : <Plus className="h-4 w-4" />}
                        <span>{editingClassId ? "Enregistrer les modifications" : "Créer la classe"}</span>
                      </button>
                    </form>
                  </div>

                  {/* List current classes */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs overflow-hidden">
                    <h3 className="text-base font-bold text-slate-900 mb-4">Classes de l'établissement</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {classes.map(cls => (
                        <div key={cls.id} className="border border-slate-200 rounded-2xl p-4 space-y-2 flex flex-col justify-between hover:shadow-xs transition">
                          <div>
                            <span className="font-extrabold text-indigo-800 tracking-tight text-sm block">{cls.name}</span>
                            <span className="text-[10px] text-slate-400 block uppercase">Code ID : {cls.id}</span>
                          </div>
                          
                          <div className="pt-2 border-t border-slate-150 flex items-center justify-between text-xs font-bold">
                            <span className="text-slate-655">{cls.capacity} élèves inscrits</span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleStartEditClass(cls)}
                                className="cursor-pointer text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 p-1.5 rounded-lg flex items-center justify-center transition"
                                title="Modifier la classe"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteClassDb(cls.id)}
                                className="cursor-pointer text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg flex items-center justify-center transition"
                                title="Supprimer la classe"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: Subjects list */}
              {activeTab === 'subjects' && (
                <div className="space-y-6">
                  {/* Create New form */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-indigo-600" />
                        <span>{editingSubjectId ? `Modifier la Matière : ${newSubject.name}` : "Ajouter une Nouvelle Matière"}</span>
                      </h3>
                      {editingSubjectId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingSubjectId(null);
                            setNewSubject({ id: '', name: '', color: 'rose' });
                          }}
                          className="cursor-pointer text-xs font-bold text-slate-500 hover:text-red-500 bg-slate-100 hover:bg-red-50 border border-slate-200 px-3 py-1 rounded-xl transition"
                        >
                          Annuler la modification
                        </button>
                      )}
                    </div>
                    <form onSubmit={handleAddSubject} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500">Identifiant Unique</label>
                        <input
                          type="text"
                          required
                          disabled={!!editingSubjectId}
                          placeholder="ex: math2"
                          value={newSubject.id}
                          onChange={(e) => setNewSubject(prev => ({ ...prev, id: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-50 disabled:opacity-60 border border-slate-250 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-550"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500">Nom de l'Enseignement</label>
                        <input
                          type="text"
                          required
                          placeholder="ex: Espagnol LV2"
                          value={newSubject.name}
                          onChange={(e) => setNewSubject(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-250 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-550"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500">Couleur d'affichage</label>
                        <select
                          value={newSubject.color}
                          onChange={(e) => setNewSubject(prev => ({ ...prev, color: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-250 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-550 selection:disabled:bg-slate-300"
                        >
                          <option value="blue">Bleu</option>
                          <option value="emerald">Vert Émeraude</option>
                          <option value="rose">Rose Intense</option>
                          <option value="amber">Jaune Ambre</option>
                          <option value="purple">Violet Royal</option>
                          <option value="indigo">Bleu Indigo</option>
                          <option value="cyan">Cyan Clair</option>
                          <option value="sky">bleu ciel</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="cursor-pointer h-10 w-full sm:col-span-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center justify-center gap-1"
                      >
                        {editingSubjectId ? <Check className="h-4 w-4 text-emerald-400" /> : <Plus className="h-4 w-4" />}
                        <span>{editingSubjectId ? "Enregistrer les modifications" : "Créer la matière"}</span>
                      </button>
                    </form>
                  </div>

                  {/* List current subjects */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs overflow-hidden pb-10">
                    <h3 className="text-base font-bold text-slate-900 mb-4">Programme de Matières Actuelles</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {subjects.map(sub => {
                        const styleColor = getSubjectColorClasses(sub.id);
                        return (
                          <div key={sub.id} className={`border ${styleColor.border} bg-slate-50 rounded-2xl p-4 flex flex-col justify-between hover:shadow-xs transition`}>
                            <div>
                              <span className={`text-sm font-bold block ${styleColor.font}`}>{sub.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">ID: {sub.id}</span>
                            </div>
                            
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-400">Actions</span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleStartEditSubject(sub)}
                                  className="cursor-pointer text-indigo-600 hover:text-indigo-800 hover:bg-white p-1 rounded-lg flex items-center justify-center transition"
                                  title="Modifier la matière"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSubjectDb(sub.id)}
                                  className="cursor-pointer text-red-500 hover:text-red-705 p-1 rounded-lg flex items-center justify-center transition"
                                  title="Supprimer la matière"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: App Settings */}
              {activeTab === 'settings' && (
                <SettingsTab
                  schoolName={schoolName}
                  setSchoolName={setSchoolName}
                  schoolSubName={schoolSubName}
                  setSchoolSubName={setSchoolSubName}
                  academicYear={academicYear}
                  setAcademicYear={setAcademicYear}
                  schoolAddress={schoolAddress}
                  setSchoolAddress={setSchoolAddress}
                  schoolPhone={schoolPhone}
                  setSchoolPhone={setSchoolPhone}
                  schoolEmail={schoolEmail}
                  setSchoolEmail={setSchoolEmail}
                  schoolDirector={schoolDirector}
                  setSchoolDirector={setSchoolDirector}
                  schoolMotto={schoolMotto}
                  setSchoolMotto={setSchoolMotto}
                />
              )}

              {/* TAB: App Statistics */}
              {activeTab === 'stats' && (
                <StatsTab
                  teachers={teachers}
                  classes={classes}
                  subjects={subjects}
                  rooms={rooms}
                  courses={courses}
                  conflicts={conflicts}
                  schoolName={schoolName}
                  academicYear={academicYear}
                />
              )}
            </>
          ) : (
            // ================= PROFESSOR ROLE VIEWS =================
            <div className="space-y-6">
              
              {/* Profile selector tab banner and tutorial banner */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                      <span className="p-2 rounded-xl bg-rose-50 text-rose-600 inline-block">👨‍🏫</span>
                      <span>Portail Enseignant : Gestion des Plannings</span>
                    </h2>
                    <p className="text-xs text-slate-500">
                      Consultez votre emploi du temps et déclarez vos vœux d'indisponibilité pour assurer le respect de vos contraintes horaires lors de la planification.
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-slate-400">Votre profil :</span>
                    <select
                      value={selectedProfPortalId}
                      onChange={(e) => setSelectedProfPortalId(e.target.value)}
                      className="px-3.5 py-1.5 bg-rose-50 border border-rose-250 rounded-xl text-xs font-extrabold text-rose-950 focus:outline-none"
                    >
                      {teachers.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200/85 text-yellow-800 p-4 rounded-2xl flex gap-3 text-xs leading-relaxed">
                  <span className="text-lg mt-0.5 animate-pulse shrink-0">💡</span>
                  <div>
                    <span className="font-bold block mb-0.5">Comment déclarer une indisponibilité ?</span>
                    Cliquez directement sur les heures vides de votre grille ci-dessous. Les cases hachurées en gris foncé représentent vos créneaux d'indisponibilité. À chaque modification, le système recalculera en arrière-plan pour révéler s'il y a de nouveaux conflits avec vos cours pré-calculés !
                  </div>
                </div>
              </div>

              {/* Personal Course scheduling grid */}
              <div className="bg-white border border-slate-200 rounded-3xl p-4 md:p-6 shadow-sm overflow-x-auto print:border-none print:p-0 print:shadow-none">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100/60 no-print">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Aperçu Grille de {teachers.find(t => t.id === selectedProfPortalId)?.name || 'l\'Enseignant'}
                  </h3>
                  <button
                    onClick={() => window.print()}
                    className="cursor-pointer px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md shrink-0 border border-slate-700"
                    title="Imprimer l'emploi du temps enseignant au format A4"
                  >
                    <Printer className="h-4 w-4 text-emerald-400" />
                    <span>Imprimer mon Emploi du Temps (A4)</span>
                  </button>
                </div>

                {/* Print Title for Enseignant visible only on A4 printout */}
                <div className="hidden print:block mb-6 border-b-2 border-slate-900 pb-4">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <div className="text-[10px] text-rose-600 font-extrabold tracking-widest uppercase">
                        {schoolName} — {schoolSubName}
                      </div>
                      <h1 className="text-2xl font-black text-slate-950 uppercase tracking-tight">
                        Emploi du Temps personnel : {teachers.find(t => t.id === selectedProfPortalId)?.name || selectedProfPortalId}
                      </h1>
                      <p className="text-xs text-slate-600 font-semibold font-sans">
                        Garantie d'absence réglementaire et ordonnancement — Année Scolaire {academicYear}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10.5px] font-bold text-slate-900 block bg-rose-50 px-3 py-1 rounded-md border border-rose-200">
                        Bulletin Enseignant Officiel
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono block mt-1.5 leading-none">
                        Généré et imprimé le {new Date().toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </div>
                
                <table className="w-full min-w-[700px] border-collapse">
                  <thead>
                    <tr>
                      <th className="w-24 p-3 text-left text-xs font-bold text-slate-400 tracking-widest uppercase border-b border-slate-100">
                        Heure
                      </th>
                      {DAYS.map(day => (
                        <th 
                          key={day.id} 
                          className="p-3 text-center text-xs font-bold text-slate-700 tracking-wide uppercase border-b border-slate-100"
                        >
                          {day.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {TIME_SLOTS.map(slot => (
                      <tr key={slot.id} className="border-b border-slate-100/50">
                        <td className="p-3 font-semibold text-xs text-slate-400 border-r border-slate-100">
                          <div className="font-bold text-slate-700">{slot.id}</div>
                          <div className="text-[10px] mt-0.5">{slot.start} - {slot.end}</div>
                        </td>

                        {DAYS.map(day => {
                          const slotKey = `${day.id}_${slot.id}`;
                          const isUnavailable = teachers.find(t => t.id === selectedProfPortalId)?.unavailableSlots.includes(slotKey);
                          // Matched courses for this prof
                          const currentCourseAtSlot = courses.filter(c => c.teacherId === selectedProfPortalId && c.dayId === day.id && c.slotId === slot.id);

                          return (
                            <td 
                              key={day.id}
                              onClick={() => {
                                // Toggle availability if the slot has no courses scheduled (or warning can be computed)
                                handleToggleTeacherUnavailability(day.id, slot.id);
                              }}
                              className={`p-2 border-r border-slate-100 align-top min-w-[130px] transition select-none cursor-pointer relative ${
                                isUnavailable 
                                ? 'bg-slate-700 text-white/90 border-slate-650 font-bold hover:bg-slate-650 scale-[0.98]' 
                                : 'hover:bg-slate-50/70'
                              }`}
                            >
                              {currentCourseAtSlot.length > 0 ? (
                                <div className="space-y-2">
                                  {currentCourseAtSlot.map(course => {
                                    const subColor = getSubjectColorClasses(course.subjectId);
                                    const classObj = classes.find(c => c.id === course.classId);
                                    const roomObj = rooms.find(r => r.id === course.roomId);

                                    return (
                                      <div 
                                        key={course.id} 
                                        className={`py-2 px-3 rounded-xl border text-left text-xs ${
                                          isUnavailable ? 'opacity-80 bg-red-100 border-red-300 text-slate-900 ring-2 ring-red-500 shadow' : `${subColor.bg} ${subColor.border}`
                                        }`}
                                        onClick={(e) => {
                                          e.stopPropagation(); // Avoid triggering availability toggle click
                                          alert(`Ce cours de ${subjects.find(s => s.id === course.subjectId)?.name} est planifié avec la classe ${classObj?.name || course.classId} en salle ${roomObj?.name || course.roomId}.`);
                                        }}
                                      >
                                        <div className="font-extrabold truncate">
                                          {subjects.find(s => s.id === course.subjectId)?.name || course.subjectId}
                                        </div>
                                        <div className="text-[10px] text-slate-700 font-semibold mt-1 space-y-0.5">
                                          <div className="flex items-center gap-1">
                                            <GraduationCap className="h-2.5 w-2.5" />
                                            <span>{classObj?.name || course.classId}</span>
                                          </div>
                                          <div className="flex items-center gap-1 text-[9px] font-mono">
                                            <School className="h-2.5 w-2.5" />
                                            <span>{roomObj?.name || course.roomId}</span>
                                          </div>
                                        </div>

                                        {isUnavailable && (
                                          <div className="text-[9px] font-extrabold text-red-700 mt-1 flex items-center gap-1 bg-white/70 px-1 py-0.5 rounded border border-red-200">
                                            <AlertCircle className="h-3 w-3 shrink-0 text-red-600 inline" />
                                            CONFLIT INDISPO
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="py-5 flex flex-col items-center justify-center text-center">
                                  {isUnavailable ? (
                                    <>
                                      <span className="text-sm">❌</span>
                                      <span className="text-[9px] font-bold tracking-wider uppercase text-slate-300 mt-1">Indisponible</span>
                                    </>
                                  ) : (
                                    <span className="text-[9px] font-medium text-slate-350 opacity-40 group-hover:opacity-100">Disponible</span>
                                  )}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>

        {/* Right slide-out panel for Gemini smart assistant AI drawer */}
        {userRole === 'admin' && isAiDrawerOpen && (
          <aside 
            id="ai-assistant-drawer" 
            className="w-full md:w-[420px] bg-white border-t md:border-t-0 md:border-l border-slate-200 shadow-xl flex flex-col shrink-0 min-h-0 relative z-30 transition-all duration-300"
          >
            {/* Header info */}
            <div className="p-4 bg-gradient-to-r from-indigo-900 to-indigo-950 text-white flex items-center justify-between border-b border-indigo-950">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-550">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">Assistant d'Ordonnancement</h3>
                  <p className="text-[10px] text-indigo-300 font-semibold uppercase tracking-widest">Optimiseur Gemini</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAiDrawerOpen(false)}
                className="cursor-pointer text-slate-300 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content view layout (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              
              {/* Presets triggers */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Raccourcis Audit Rapide</span>
                <div className="grid grid-cols-1 gap-1.5">
                  <button
                    onClick={() => handleSendAiPrompt("Analysez l’intégralité de mon emploi du temps d'école actuel, dressez la liste des erreurs critiques et proposez-moi des permutations précises pour les résoudre.")}
                    className="cursor-pointer py-1.5 px-3 text-left transition text-xs font-semibold bg-indigo-50 border border-indigo-150 text-indigo-950 hover:bg-indigo-100 rounded-xl"
                  >
                    🔍 Auditer l'école et corriger les conflits
                  </button>
                  <button
                    onClick={() => handleSendAiPrompt("Dites-moi quels professeurs ont des conflits de créneaux indisponibles et suggérez de nouvelles heures respectueuses.")}
                    className="cursor-pointer py-1.5 px-3 text-left transition text-xs font-semibold bg-indigo-50 border border-indigo-150 text-indigo-950 hover:bg-indigo-100 rounded-xl"
                  >
                    ⏰ Analyser les indisponibilités profs
                  </button>
                  <button
                    onClick={() => handleSendAiPrompt("Vérifiez la répartition d'occupation des salles d'étude et signalez si certaines salles dépassent leur capacité d'accueil par rapport aux groupes de classe d'élèves.")}
                    className="cursor-pointer py-1.5 px-3 text-left transition text-xs font-semibold bg-indigo-50 border border-indigo-150 text-indigo-950 hover:bg-indigo-100 rounded-xl"
                  >
                    🏫 Auditer l'occupation et taille des salles
                  </button>
                </div>
              </div>

              {/* Chat messages stream thread */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Analyseur de conversation</span>
                <div className="space-y-3 max-h-[220px] overflow-y-auto border border-slate-100 bg-slate-50/50 p-3 rounded-2xl">
                  {aiChatHistory.map((message, idx) => (
                    <div 
                      key={idx} 
                      className={`text-xs p-3 rounded-2xl leading-relaxed whitespace-pre-line ${
                        message.role === 'user' 
                        ? 'bg-indigo-600 text-white ml-6 font-semibold' 
                        : 'bg-white border border-slate-200 text-slate-800 mr-6 shadow-xs'
                      }`}
                    >
                      {message.text}
                    </div>
                  ))}
                  {isAiLoading && (
                    <div className="bg-white border border-slate-200 p-3 rounded-2xl mr-6 text-slate-500 text-xs italic flex items-center gap-2">
                      <span className="animate-spin inline-block h-3 w-3 border-2 border-indigo-600 border-t-transparent rounded-full"></span>
                      <span>L'intelligence artificielle étudie la grille...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Auto schedule scheduling wizard form creator */}
              <div className="p-4 bg-purple-50/60 border border-purple-200/60 rounded-3xl space-y-4">
                <div className="flex items-center gap-1 text-purple-950 font-extrabold text-xs">
                  <Sparkles className="h-4 w-4 text-purple-700" />
                  <span>IA Ordonnanceur Automatique (sans conflit)</span>
                </div>
                
                <p className="text-[11px] text-purple-800 leading-relaxed">
                  L'IA recherchera les meilleurs créneaux entièrement libres conformes à l'occupation de cette salle, ce professeur et cette classe.
                </p>

                <div className="space-y-2.5 text-xs text-slate-700">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <span className="block text-[10px] font-bold text-purple-900/60">Groupe classe</span>
                      <select 
                        value={wizardClass} 
                        onChange={(e) => setWizardClass(e.target.value)}
                        className="w-full bg-white border border-purple-200 p-1.5 rounded-lg text-xs"
                      >
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <span className="block text-[10px] font-bold text-purple-900/60">Matière</span>
                      <select 
                        value={wizardSubject} 
                        onChange={(e) => setWizardSubject(e.target.value)}
                        className="w-full bg-white border border-purple-200 p-1.5 rounded-lg text-xs"
                      >
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <span className="block text-[10px] font-bold text-purple-900/60">Enseignant qualifié</span>
                      <select 
                        value={wizardTeacher} 
                        onChange={(e) => setWizardTeacher(e.target.value)}
                        className="w-full bg-white border border-purple-200 p-1.5 rounded-lg text-xs"
                      >
                        {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <span className="block text-[10px] font-bold text-purple-900/60 font-bold text-purple-900/60">Salle cible</span>
                      <select 
                        value={wizardRoom} 
                        onChange={(e) => setWizardRoom(e.target.value)}
                        className="w-full bg-white border border-purple-200 p-1.5 rounded-lg text-xs"
                      >
                        {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="block text-[10px] font-bold text-purple-900/60 font-bold text-purple-900/60">Volume horaire (heures d'études)</span>
                    <input 
                      type="number" 
                      min="1" 
                      max="10" 
                      value={wizardHoursCount} 
                      onChange={(e) => setWizardHoursCount(parseInt(e.target.value) || 1)}
                      className="w-full bg-white border border-purple-200 p-1.5 rounded-lg text-xs"
                    />
                  </div>

                  <button
                    onClick={handleTriggerWizardGeneration}
                    disabled={isWizardLoading}
                    className="cursor-pointer w-full text-center py-2 px-3 rounded-lg bg-purple-750 hover:bg-purple-700 text-white font-extrabold text-xs transition shadow-sm disabled:opacity-50"
                  >
                    {isWizardLoading ? "Attribution automatique..." : "Générer et positionner via l'IA !"}
                  </button>

                  {wizardLog && (
                    <div className="p-2 border border-purple-200 bg-white rounded-lg text-[10px] font-semibold text-purple-900 leading-normal max-h-[80px] overflow-y-auto">
                      {wizardLog}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Input custom chatbot box */}
            <div className="p-3 border-t border-slate-200 bg-slate-50 shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Posez une question sur le planning..."
                  value={customAiPrompt}
                  onChange={(e) => setCustomAiPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendAiPrompt();
                  }}
                  className="flex-1 px-3.5 py-2 text-xs bg-white border border-slate-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-650 font-medium"
                />
                <button
                  onClick={() => handleSendAiPrompt()}
                  className="cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl transition shadow flex items-center justify-center shrink-0"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </aside>
        )}

      </div>

      {/* FOOTER credit brand line */}
      <footer className="text-center py-3 bg-slate-900 text-[10px] text-slate-550 border-t border-indigo-950/40 shrink-0">
         BARAKATPLANNING v2.5 — Confectionné sur mesure pour la gestion et l'ordonnancement scolaire
      </footer>

      {/* ================= MODAL : ADD / EDIT COURSE ================= */}
      {isAddEditCourseModalOpen && (
        <div id="course-modal" className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-white">
                  {editingCourseId ? "Modifier le cours" : "Planifier un cours"}
                </h3>
                <p className="text-[10px] text-indigo-300 font-semibold uppercase mt-0.5">
                  Pour le {getDayLabel(modalTargetDay)} — Créneau {modalTargetSlot}
                </p>
              </div>
              <button 
                onClick={() => setIsAddEditCourseModalOpen(false)}
                className="cursor-pointer text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form inputs */}
            <form onSubmit={handleSaveCourse} className="p-5 space-y-4">
              {/* Class group code */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Groupe Classe</label>
                <select
                  value={modalClassId}
                  onChange={(e) => setModalClassId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-250 hover:border-slate-350 rounded-xl text-xs font-semibold text-slate-800"
                >
                  <option value="">Sélectionnez un groupe</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.capacity} él.)</option>
                  ))}
                </select>
              </div>

              {/* Subject course name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Matière Enseignée</label>
                <select
                  value={modalSubjectId}
                  onChange={(e) => setModalSubjectId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-250 hover:border-slate-350 rounded-xl text-xs font-semibold text-slate-800"
                >
                  <option value="">Sélectionnez une matière</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Teacher code */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-slate-500">Professeur en charge</label>
                  <span className="text-[10px] text-indigo-600 font-bold">Sélection qualifiée</span>
                </div>
                <select
                  value={modalTeacherId}
                  onChange={(e) => setModalTeacherId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-250 hover:border-slate-350 rounded-xl text-xs font-semibold text-slate-800"
                >
                  <option value="">Sélectionnez l'enseignant</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.subjects.map(x => subjects.find(s=>s.id===x)?.name || x).join(', ')})</option>
                  ))}
                </select>
              </div>

              {/* Classroom location */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Salle de Classe réservée</label>
                <select
                  value={modalRoomId}
                  onChange={(e) => setModalRoomId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-250 hover:border-slate-350 rounded-xl text-xs font-semibold text-slate-800"
                >
                  <option value="">Sélectionnez la salle</option>
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>{r.name} - Cap: {r.capacity} pl. ({r.type})</option>
                  ))}
                </select>
              </div>

              {/* Actions footer buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddEditCourseModalOpen(false)}
                  className="cursor-pointer px-4 py-2 bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 text-xs font-bold rounded-xl transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="cursor-pointer px-4 py-2 bg-indigo-650 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl transition shadow flex items-center gap-1"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>{editingCourseId ? "Sauvegarder" : "Inscrire au planning"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
