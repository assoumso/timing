export const INITIAL_SUBJECTS: SubjectItem[] = [
  { id: 'math', name: 'Mathématiques', color: 'blue', coefficient: 4 },
  { id: 'fra', name: 'Français', color: 'rose', coefficient: 4 },
  { id: 'hg', name: 'Histoire-Géographie', color: 'amber', coefficient: 2 },
  { id: 'sci', name: 'Physique-Chimie / SVT', color: 'emerald', coefficient: 3 },
  { id: 'ang', name: 'Anglais', color: 'purple', coefficient: 3 },
  { id: 'eps', name: 'Éducation Physique', color: 'cyan', coefficient: 1 },
  { id: 'art', name: 'Arts Plastiques', color: 'indigo', coefficient: 1 },
  { id: 'esp_lv2', name: 'Espagnol LV2', color: 'rose', coefficient: 2, isLV2: true },
  { id: 'all_lv2', name: 'Allemand LV2', color: 'blue', coefficient: 2, isLV2: true }
];

export const INITIAL_CLASSES: ClassItem[] = [
  { id: '6A', name: 'Classe de 6ème A', capacity: 25, color: 'emerald', mainTeacherId: 'prof_martin' },
  { id: '5B', name: 'Classe de 5ème B', capacity: 32, color: 'sky', mainTeacherId: 'prof_dubois' },
  { id: '4C', name: 'Classe de 4ème C', capacity: 28, color: 'violet', mainTeacherId: 'prof_lopez' },
  { id: '3D', name: 'Classe de 3ème D', capacity: 22, color: 'amber', mainTeacherId: 'prof_bernard' }
];

export const INITIAL_ROOMS: RoomItem[] = [
  { id: 's101', name: 'Salle 101 - Standard', type: 'Standard', capacity: 35, color: 'slate' },
  { id: 's102', name: 'Salle 102 - Standard', type: 'Standard', capacity: 30, color: 'slate' },
  { id: 'slab', name: 'Labo Biochimie S1', type: 'Lab', capacity: 28, color: 'emerald' },
  { id: 'sgym', name: 'Gymnase COSEC', type: 'Gym', capacity: 100, color: 'cyan' },
  { id: 'sart', name: 'Atelier Dessin S2', type: 'Art', capacity: 24, color: 'indigo' }
];

export const INITIAL_TEACHERS: TeacherItem[] = [
  {
    id: 'prof_martin',
    name: 'M. Martin (Maths)',
    subjects: ['math'],
    unavailableSlots: ['Mon_M1', 'Wed_A1', 'Wed_A2', 'Wed_A3'],
    color: 'blue',
    email: 'martin.maths@academie-scolaires.fr',
    maxHoursPerWeek: 18
  },
  {
    id: 'prof_dubois',
    name: 'Mme. Dubois (Français)',
    subjects: ['fra'],
    unavailableSlots: ['Fri_A3'],
    color: 'rose',
    email: 'dubois.lettres@academie-scolaires.fr',
    maxHoursPerWeek: 20
  },
  {
    id: 'prof_lopez',
    name: 'M. Lopez (Histoire-Géo / Anglais)',
    subjects: ['hg', 'ang'],
    unavailableSlots: ['Tue_M1'],
    color: 'amber',
    email: 'lopez.hist@academie-scolaires.fr',
    maxHoursPerWeek: 18
  },
  {
    id: 'prof_bernard',
    name: 'Mme. Bernard (Sciences)',
    subjects: ['sci'],
    unavailableSlots: ['Thu_M3'],
    color: 'emerald',
    email: 'bernard.sciences@academie-scolaires.fr',
    maxHoursPerWeek: 16
  },
  {
    id: 'prof_gerrard',
    name: 'M. Gerrard (EPS)',
    subjects: ['eps'],
    unavailableSlots: ['Wed_M1', 'Wed_M2'],
    color: 'cyan',
    email: 'gerrard.eps@academie-scolaires.fr',
    maxHoursPerWeek: 15
  },
  {
    id: 'prof_vidal',
    name: 'Mme. Vidal (Arts)',
    subjects: ['art'],
    unavailableSlots: ['Mon_A2'],
    color: 'indigo',
    email: 'vidal.arts@academie-scolaires.fr',
    maxHoursPerWeek: 12
  }
];

export const INITIAL_COURSES: ScheduleCourse[] = [
  // --- Lundi ---
  // M1
  // NB: M. Martin est indisponible le Lundi M1. Créons un cours exprès pour illustrer un conflit d'indisponibilité !
  {
    id: 'c1',
    classId: '6A',
    teacherId: 'prof_martin', // Indisponibilité Lundi M1 !
    subjectId: 'math',
    roomId: 's101',
    dayId: 'Mon',
    slotId: 'M1'
  },
  {
    id: 'c2',
    classId: '5B',
    teacherId: 'prof_dubois',
    subjectId: 'fra',
    roomId: 's102',
    dayId: 'Mon',
    slotId: 'M1'
  },
  // M2: Conflit de salle : on met deux profs différents dans la même salle au même moment !
  {
    id: 'c3',
    classId: '6A',
    teacherId: 'prof_dubois',
    subjectId: 'fra',
    roomId: 's101', // Salle s101 double réservation !
    dayId: 'Mon',
    slotId: 'M2'
  },
  {
    id: 'c4',
    classId: '4C',
    teacherId: 'prof_lopez',
    subjectId: 'ang',
    roomId: 's101', // Salle s101 double réservation !
    dayId: 'Mon',
    slotId: 'M2'
  },
  
  // M3
  {
    id: 'c5',
    classId: '6A',
    teacherId: 'prof_lopez',
    subjectId: 'hg',
    roomId: 's101',
    dayId: 'Mon',
    slotId: 'M3'
  },
  {
    id: 'c6',
    classId: '3D',
    teacherId: 'prof_martin',
    subjectId: 'math',
    roomId: 's102',
    dayId: 'Mon',
    slotId: 'M3'
  },

  // M4 (Professeur Martin planifié en double sur deux classes en même temps !)
  {
    id: 'c7',
    classId: '6A',
    teacherId: 'prof_martin',
    subjectId: 'math',
    roomId: 's101',
    dayId: 'Mon',
    slotId: 'M4'
  },
  {
    id: 'c8',
    classId: '5B',
    teacherId: 'prof_martin', // Conflit d'enseignant ! En même temps que 6A
    subjectId: 'math',
    roomId: 's102',
    dayId: 'Mon',
    slotId: 'M4'
  },

  // --- Mardi ---
  // M1
  {
    id: 'c9',
    classId: '5B',
    teacherId: 'prof_dubois',
    subjectId: 'fra',
    roomId: 's102',
    dayId: 'Tue',
    slotId: 'M1'
  },
  // M2
  {
    id: 'c10',
    classId: '6A',
    teacherId: 'prof_bernard',
    subjectId: 'sci',
    roomId: 'slab',
    dayId: 'Tue',
    slotId: 'M2'
  },
  {
    id: 'c11',
    classId: '5B',
    teacherId: 'prof_martin',
    subjectId: 'math',
    roomId: 's101',
    dayId: 'Tue',
    slotId: 'M2'
  },

  // --- Mercredi ---
  // M1
  {
    id: 'c12',
    classId: '4C',
    teacherId: 'prof_dubois',
    subjectId: 'fra',
    roomId: 's102',
    dayId: 'Wed',
    slotId: 'M1'
  },
  // M2
  {
    id: 'c13',
    classId: '3D',
    teacherId: 'prof_lopez',
    subjectId: 'hg',
    roomId: 's101',
    dayId: 'Wed',
    slotId: 'M2'
  },

  // --- Jeudi ---
  // A1
  {
    id: 'c14',
    classId: '6A',
    teacherId: 'prof_gerrard',
    subjectId: 'eps',
    roomId: 'sgym',
    dayId: 'Thu',
    slotId: 'A1'
  },
  // A2
  {
    id: 'c15',
    classId: '4C',
    teacherId: 'prof_vidal',
    subjectId: 'art',
    roomId: 'sart', // Capacité de sart est de 24. 4C a 28 élèves ! Conflit de capacité d'accueil averti.
    dayId: 'Thu',
    slotId: 'A2'
  },

  // --- Vendredi ---
  // M3
  {
    id: 'c16',
    classId: '3D',
    teacherId: 'prof_bernard',
    subjectId: 'sci',
    roomId: 'slab',
    dayId: 'Fri',
    slotId: 'M3'
  },
  // M4
  {
    id: 'c17',
    classId: '4C',
    teacherId: 'prof_lopez',
    subjectId: 'ang',
    roomId: 's102',
    dayId: 'Fri',
    slotId: 'M4'
  }
];

export const COLOR_CLASSES: Record<string, { font: string, bg: string, border: string, bgLight: string }> = {
  blue: {
    font: 'text-blue-700 font-semibold',
    bg: 'bg-blue-150 hover:bg-blue-200 text-blue-950 border-blue-300',
    border: 'border-blue-400',
    bgLight: 'bg-blue-50/70'
  },
  emerald: {
    font: 'text-emerald-700 font-semibold',
    bg: 'bg-emerald-150 hover:bg-emerald-200 text-emerald-950 border-emerald-300',
    border: 'border-emerald-400',
    bgLight: 'bg-emerald-50/70'
  },
  rose: {
    font: 'text-rose-700 font-semibold',
    bg: 'bg-rose-150 hover:bg-rose-200 text-rose-950 border-rose-300',
    border: 'border-rose-400',
    bgLight: 'bg-rose-50/70'
  },
  amber: {
    font: 'text-amber-700 font-semibold',
    bg: 'bg-amber-150 hover:bg-amber-200 text-amber-950 border-amber-300',
    border: 'border-amber-400',
    bgLight: 'bg-amber-50/70'
  },
  purple: {
    font: 'text-purple-700 font-semibold',
    bg: 'bg-purple-150 hover:bg-purple-200 text-purple-950 border-purple-300',
    border: 'border-purple-400',
    bgLight: 'bg-purple-50/70'
  },
  indigo: {
    font: 'text-indigo-700 font-semibold',
    bg: 'bg-indigo-150 hover:bg-indigo-200 text-indigo-950 border-indigo-300',
    border: 'border-indigo-400',
    bgLight: 'bg-indigo-50/70'
  },
  cyan: {
    font: 'text-cyan-700 font-semibold',
    bg: 'bg-cyan-150 hover:bg-cyan-200 text-cyan-950 border-cyan-300',
    border: 'border-cyan-400',
    bgLight: 'bg-cyan-50/70'
  },
  sky: {
    font: 'text-sky-700 font-semibold',
    bg: 'bg-sky-150 hover:bg-sky-200 text-sky-950 border-sky-300',
    border: 'border-sky-400',
    bgLight: 'bg-sky-50/70'
  },
  violet: {
    font: 'text-violet-700 font-semibold',
    bg: 'bg-violet-150 hover:bg-violet-200 text-violet-950 border-violet-300',
    border: 'border-violet-400',
    bgLight: 'bg-violet-50/70'
  },
  slate: {
    font: 'text-slate-700 font-semibold',
    bg: 'bg-slate-150 hover:bg-slate-200 text-slate-950 border-slate-300',
    border: 'border-slate-400',
    bgLight: 'bg-slate-50/40'
  }
};

export const INITIAL_ACCOUNTS: UserAccount[] = [
  {
    id: 'user_admin',
    name: 'M. Touré (Administrateur)',
    email: 'admin@school.com',
    password: 'admin',
    role: 'super_admin'
  },
  {
    id: 'user_director',
    name: 'Mme Catherine Amon (Directrice)',
    email: 'director@school.com',
    password: 'director',
    role: 'director'
  },
  {
    id: 'user_accountant',
    name: 'M. Koffi (Comptable)',
    email: 'comptable@school.com',
    password: 'comptable',
    role: 'accountant'
  },
  {
    id: 'user_supervisor',
    name: 'M. Diallo (Surveillant)',
    email: 'surveillant@school.com',
    password: 'surveillant',
    role: 'supervisor'
  },
  {
    id: 'user_teacher',
    name: 'M. Martin (Enseignant)',
    email: 'martin@school.com',
    password: 'martin',
    role: 'teacher'
  },
  {
    id: 'user_parent',
    name: 'M. Koné (Parent)',
    email: 'parent@school.com',
    password: 'parent',
    role: 'parent'
  },
  {
    id: 'user_student',
    name: 'Awa Kouassi (Élève)',
    email: 'eleve@school.com',
    password: 'eleve',
    role: 'student'
  }
];

