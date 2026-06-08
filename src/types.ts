export interface ClassItem {
  id: string;
  name: string;
  capacity: number;
  color: string;
}

export interface TeacherItem {
  id: string;
  name: string;
  subjects: string[]; // Liste d'IDs de Matières
  unavailableSlots: string[]; // au format "dayId_slotId", ex: "Mon_M1"
  color: string;
  email?: string;
  maxHoursPerWeek: number;
}

export interface SubjectItem {
  id: string;
  name: string;
  color: string;
}

export interface RoomItem {
  id: string;
  name: string;
  type: 'Standard' | 'Lab' | 'Gym' | 'Art';
  capacity: number;
  color: string;
}

export interface Day {
  id: string;
  name: string;
}

export interface TimeSlot {
  id: string;
  name: string;
  start: string;
  end: string;
}

export interface ScheduleCourse {
  id: string;
  classId: string;
  teacherId: string;
  subjectId: string;
  roomId: string;
  dayId: string; // Ex: "Mon"
  slotId: string; // Ex: "M1"
}

export interface Conflict {
  id: string;
  type: 'teacher' | 'room' | 'class' | 'unavailability' | 'capacity';
  severity: 'error' | 'warning';
  message: string;
  courseIds: string[]; // Les cours concernés par ce conflit
  details?: {
    dayId: string;
    slotId: string;
    teacherId?: string;
    roomId?: string;
    classId?: string;
  };
}

export const DAYS: Day[] = [
  { id: 'Mon', name: 'Lundi' },
  { id: 'Tue', name: 'Mardi' },
  { id: 'Wed', name: 'Mercredi' },
  { id: 'Thu', name: 'Jeudi' },
  { id: 'Fri', name: 'Vendredi' }
];

export const TIME_SLOTS: TimeSlot[] = [
  { id: 'M1', name: 'M1 (08h30 - 09h30)', start: '08:30', end: '09:30' },
  { id: 'M2', name: 'M2 (09:30 - 10h30)', start: '09:30', end: '10:30' },
  { id: 'M3', name: 'M3 (10h45 - 11:45)', start: '10:45', end: '11:45' },
  { id: 'M4', name: 'M4 (11h45 - 12h45)', start: '11:45', end: '12:45' },
  { id: 'A1', name: 'A1 (14h00 - 15h00)', start: '14:00', end: '15:00' },
  { id: 'A2', name: 'A2 (15h00 - 16h00)', start: '15:00', end: '16:00' },
  { id: 'A3', name: 'A3 (16h15 - 17h15)', start: '16:15', end: '17:15' }
];
