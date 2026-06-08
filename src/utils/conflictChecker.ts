import { ScheduleCourse, Conflict, ClassItem, TeacherItem, RoomItem } from '../types';

export function checkAllConflicts(
  courses: ScheduleCourse[],
  classes: ClassItem[],
  teachers: TeacherItem[],
  rooms: RoomItem[]
): Conflict[] {
  const conflicts: Conflict[] = [];

  // Group classes, rooms, and teachers by Day + Slot
  const slotMap: Record<string, ScheduleCourse[]> = {};
  for (const course of courses) {
    if (!course.dayId || !course.slotId) continue;
    const key = `${course.dayId}_${course.slotId}`;
    if (!slotMap[key]) {
      slotMap[key] = [];
    }
    slotMap[key].push(course);
  }

  for (const [key, slotCourses] of Object.entries(slotMap)) {
    const [dayId, slotId] = key.split('_');

    const teacherMap: Record<string, ScheduleCourse[]> = {};
    const roomMap: Record<string, ScheduleCourse[]> = {};
    const classMap: Record<string, ScheduleCourse[]> = {};

    for (const course of slotCourses) {
      if (course.teacherId) {
        if (!teacherMap[course.teacherId]) teacherMap[course.teacherId] = [];
        teacherMap[course.teacherId].push(course);
      }
      if (course.roomId) {
        if (!roomMap[course.roomId]) roomMap[course.roomId] = [];
        roomMap[course.roomId].push(course);
      }
      if (course.classId) {
        if (!classMap[course.classId]) classMap[course.classId] = [];
        classMap[course.classId].push(course);
      }

      // 1. Unavailability check
      const teacherObj = teachers.find(t => t.id === course.teacherId);
      if (teacherObj) {
        const isUnavailable = teacherObj.unavailableSlots.includes(`${dayId}_${slotId}`);
        if (isUnavailable) {
          conflicts.push({
            id: `unavail_${course.id}`,
            type: 'unavailability',
            severity: 'warning',
            message: `Le professeur ${teacherObj.name} est planifié sur un créneau d'indisponibilité enregistré (${getDayName(dayId)} ${slotId}).`,
            courseIds: [course.id],
            details: { dayId, slotId, teacherId: course.teacherId, classId: course.classId }
          });
        }
      }

      // 2. Capacity check
      const classObj = classes.find(c => c.id === course.classId);
      const roomObj = rooms.find(r => r.id === course.roomId);
      if (classObj && roomObj && classObj.capacity > roomObj.capacity) {
        conflicts.push({
          id: `capacity_${course.id}`,
          type: 'capacity',
          severity: 'warning',
          message: `Dépassement : La salle ${roomObj.name} (${roomObj.capacity} places) est trop petite pour la classe ${classObj.name} (${classObj.capacity} élèves).`,
          courseIds: [course.id],
          details: { dayId, slotId, roomId: course.roomId, classId: course.classId }
        });
      }
    }

    // 3. Teacher overlap (double booking a teacher on identical slots)
    for (const [teacherId, dupCourses] of Object.entries(teacherMap)) {
      if (dupCourses.length > 1) {
        const teacherObj = teachers.find(t => t.id === teacherId);
        const name = teacherObj ? teacherObj.name : teacherId;
        const ids = dupCourses.map(c => c.id);
        const classNames = dupCourses.map(c => {
          const cls = classes.find(g => g.id === c.classId);
          return cls ? cls.name : 'classe inconnue';
        }).join(' et ');

        conflicts.push({
          id: `teacher_${dayId}_${slotId}_${teacherId}`,
          type: 'teacher',
          severity: 'error',
          message: `Conflit d'enseignant : ${name} est programmé(e) en double avec les groupes (${classNames}) le ${getDayName(dayId)} en ${slotId}.`,
          courseIds: ids,
          details: { dayId, slotId, teacherId, classId: dupCourses[0].classId }
        });
      }
    }

    // 4. Room overlap (double reserving a classroom)
    for (const [roomId, dupCourses] of Object.entries(roomMap)) {
      if (dupCourses.length > 1) {
        const roomObj = rooms.find(r => r.id === roomId);
        const name = roomObj ? roomObj.name : roomId;
        const ids = dupCourses.map(c => c.id);
        const labels = dupCourses.map(c => {
          const cls = classes.find(g => g.id === c.classId);
          const prof = teachers.find(t => t.id === c.teacherId);
          return `${cls ? cls.name : 'Classe'} (${prof ? prof.name : 'Prof'})`;
        }).join(' + ');

        conflicts.push({
          id: `room_${dayId}_${slotId}_${roomId}`,
          type: 'room',
          severity: 'error',
          message: `Conflit de salle : La ${name} est réservée en double pour ${labels} le ${getDayName(dayId)} en ${slotId}.`,
          courseIds: ids,
          details: { dayId, slotId, roomId, classId: dupCourses[0].classId }
        });
      }
    }

    // 5. Class overlap (double booking same class with different subjects)
    for (const [classId, dupCourses] of Object.entries(classMap)) {
      if (dupCourses.length > 1) {
        const classObj = classes.find(c => c.id === classId);
        const name = classObj ? classObj.name : classId;
        const ids = dupCourses.map(c => c.id);
        
        conflicts.push({
          id: `class_${dayId}_${slotId}_${classId}`,
          type: 'class',
          severity: 'error',
          message: `Double cours : ${name} a plusieurs cours assignés simultanément le ${getDayName(dayId)} en ${slotId}.`,
          courseIds: ids,
          details: { dayId, slotId, classId }
        });
      }
    }
  }

  return conflicts;
}

function getDayName(dayId: string): string {
  switch (dayId) {
    case 'Mon': return 'Lundi';
    case 'Tue': return 'Mardi';
    case 'Wed': return 'Mercredi';
    case 'Thu': return 'Jeudi';
    case 'Fri': return 'Vendredi';
    default: return dayId;
  }
}
