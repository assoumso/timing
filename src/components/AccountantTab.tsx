import React, { useState } from 'react';
import { 
  PiggyBank, 
  Coins, 
  TrendingUp, 
  UserSquare2, 
  Printer, 
  CheckCircle,
  AlertCircle,
  Search,
  FileSpreadsheet
} from 'lucide-react';

interface TeacherItem {
  id: string;
  name: string;
  subjects: string[];
  maxHours: number;
  color: string;
  email?: string;
}

interface SubjectItem {
  id: string;
  name: string;
}

interface ScheduleCourse {
  id: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  roomId: string;
  dayId: string;
  slotId: string;
}

interface AccountantTabProps {
  teachers: TeacherItem[];
  subjects: SubjectItem[];
  courses: ScheduleCourse[];
  schoolName: string;
  academicYear: string;
}

export const AccountantTab: React.FC<AccountantTabProps> = ({
  teachers,
  subjects,
  courses,
  schoolName,
  academicYear
}) => {
  // Local states for accounting calculations
  const [hourlyRate, setHourlyRate] = useState<number>(() => {
    const saved = localStorage.getItem('barakat_hourly_rate');
    return saved ? parseInt(saved, 10) : 7500; // 7500 FCFA standard hourly rate
  });

  const [overtimePremium, setOvertimePremium] = useState<number>((() => {
    const saved = localStorage.getItem('barakat_overtime_premium');
    return saved ? parseInt(saved, 10) : 25; // 25% bonus for extra hours
  })());

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeacherReceipt, setSelectedTeacherReceipt] = useState<string | null>(null);

  // Save config values
  const handleSaveConfig = () => {
    localStorage.setItem('barakat_hourly_rate', hourlyRate.toString());
    localStorage.setItem('barakat_overtime_premium', overtimePremium.toString());
    alert("Configurations financières enregistrées avec succès !");
  };

  // Perform Calculations
  const teacherStats = teachers.map(teacher => {
    const scheduledSlots = courses.filter(c => c.teacherId === teacher.id).length;
    const hours = scheduledSlots * 2; // Each slot is 2h
    
    // Normal hours vs extra hours
    const normalHours = Math.min(hours, teacher.maxHours);
    const overtimeHours = Math.max(0, hours - teacher.maxHours);
    
    // Calculations
    const baseCompensation = normalHours * hourlyRate;
    const premiumHourlyRate = hourlyRate * (1 + overtimePremium / 100);
    const overtimeCompensation = overtimeHours * premiumHourlyRate;
    const totalCompensation = baseCompensation + overtimeCompensation;

    return {
      ...teacher,
      hours,
      normalHours,
      overtimeHours,
      baseCompensation,
      overtimeCompensation,
      totalCompensation
    };
  });

  // Totals
  const filteredTeachers = teacherStats.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalTeachersCost = teacherStats.reduce((sum, t) => sum + t.totalCompensation, 0);
  const totalBaseHours = teacherStats.reduce((sum, t) => sum + t.normalHours, 0);
  const totalOvertimeHours = teacherStats.reduce((sum, t) => sum + t.overtimeHours, 0);
  const totalHoursTaught = totalBaseHours + totalOvertimeHours;

  const handlePrintSlips = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Upper header banner page */}
      <div className="bg-gradient-to-br from-[#072c5e] via-[#093d80] to-indigo-950 border border-[#f3aa1c]/30 text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl print:hidden">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            <Coins className="h-3.5 w-3.5 text-emerald-400" />
            <span>PORTAIL COMPTABILITÉ & FINANCES ACADÉMIQUES</span>
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Suivi des Vacations et Honoraires
          </h2>
          <p className="text-sm text-blue-100 max-w-xl">
            Estimez automatiquement les charges budgétaires liées aux heures d'intervention réelles et éditez les rapports d’honoraire de l'établissement {schoolName}.
          </p>
        </div>
        
        <button
          onClick={handlePrintSlips}
          className="cursor-pointer self-start md:self-auto inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition shrink-0"
        >
          <Printer className="h-4 w-4" />
          <span>Imprimer l'État du Personnel</span>
        </button>
      </div>

      {/* Grid of metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 text-[#0b4998] rounded-xl font-bold text-xl">
            💵             
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Masse Salariale Estimée</span>
            <span className="text-xl font-black text-slate-900">{totalTeachersCost.toLocaleString('fr-FR')} FCFA</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-center gap-4">
          <div className="p-3.5 bg-sky-50 text-sky-600 rounded-xl font-bold text-xl col-span-1">
            ⏱️
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Heures de Vacation Totales</span>
            <span className="text-xl font-black text-slate-900">{totalHoursTaught} heures</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl font-semibold">
            📊
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Heures Supplémentaires</span>
            <span className="text-xl font-black text-indigo-700">
              {totalOvertimeHours}h (+{overtimePremium}% majorées)
            </span>
          </div>
        </div>
      </div>

      {/* Settings Panel & Search */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Settings Box (3 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 print:hidden">
          <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
            <PiggyBank className="h-4.5 w-4.5 text-[#0b4998]" />
            <span>Paramètres de Facturation</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Taux Horaire Standard (FCFA/h)
              </label>
              <input
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-250 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#0b4998]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Majorations Heures Supp. (%)
              </label>
              <input
                type="number"
                value={overtimePremium}
                onChange={(e) => setOvertimePremium(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-250 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#0b4998]"
              />
            </div>

            <button
              onClick={handleSaveConfig}
              className="cursor-pointer w-full py-2 bg-[#0b4998] hover:bg-[#093d80] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Appliquer les Tarifs</span>
            </button>
          </div>

          <div className="bg-stone-50 border border-stone-200/80 p-3.5 rounded-xl text-[11px] leading-relaxed text-slate-500">
            <span className="font-bold text-slate-700 block mb-1">ℹ️ Règle Légale d'Établissement</span>
            Les heures contractuelles de base correspondent au plafond d'heures (max) par enseignant. Tout dépassement s'ajoute en majoration.
          </div>
        </div>

        {/* Teachers breakdown table (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
            <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-2">
              <FileSpreadsheet className="h-4.5 w-4.5 text-emerald-600" />
              <span>Tableau des Allocations Forfaitaires</span>
            </h3>

            <div className="relative w-full sm:w-60 print:hidden">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Filtrer un enseignant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase font-bold">
                  <th className="py-2.5 font-bold">Enseignant</th>
                  <th className="py-2.5 font-bold text-center">Volume Total</th>
                  <th className="py-2.5 font-bold text-center">Heures Ref.</th>
                  <th className="py-2.5 font-bold text-center">Heures Supp.</th>
                  <th className="py-2.5 font-bold text-right">Rémunération</th>
                  <th className="py-2.5 font-bold text-right print:hidden">Détail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredTeachers.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/50 group">
                    <td className="py-3 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: t.color === 'indigo' ? '#3f51b5' : t.color === 'rose' ? '#e91e63' : t.color === 'emerald' ? '#4caf50' : t.color === 'orange' ? '#ff9800' : '#8bc34a' }}></span>
                        <div>
                          <p className="font-extrabold text-slate-800">{t.name}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">{t.email || 'Aucun email saisi'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <span className="font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                        {t.hours}h
                      </span>
                    </td>
                    <td className="py-3 text-center font-bold text-slate-650">{t.normalHours}h</td>
                    <td className="py-3 text-center">
                      {t.overtimeHours > 0 ? (
                        <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md font-extrabold">
                          +{t.overtimeHours}h
                        </span>
                      ) : (
                        <span className="text-slate-400 font-bold">0h</span>
                      )}
                    </td>
                    <td className="py-3 text-right font-black text-emerald-700">
                      {t.totalCompensation.toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="py-3 text-right print:hidden">
                      <button
                        onClick={() => setSelectedTeacherReceipt(selectedTeacherReceipt === t.id ? null : t.id)}
                        className="cursor-pointer text-[10px] font-black text-indigo-650 hover:text-indigo-850 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-sm"
                      >
                        {selectedTeacherReceipt === t.id ? "Fermer" : "Billet"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Modal / Inline receipt view */}
      {selectedTeacherReceipt && (
        (() => {
          const detail = teacherStats.find(t => t.id === selectedTeacherReceipt);
          if (!detail) return null;
          return (
            <div id="payout-receipt-box" className="bg-slate-50 border border-[#0b4998]/20 rounded-2xl p-6 shadow-sm max-w-xl mx-auto space-y-4">
              <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                <div>
                  <h4 className="text-xs uppercase font-extrabold tracking-widest text-slate-400">FICHE EXPÉDITIVE D'HONORAIRES</h4>
                  <h3 className="text-lg font-black text-slate-900">{detail.name}</h3>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold bg-[#0b4998]/10 text-[#0b4998] px-2.5 py-1 rounded-full uppercase">
                    An {academicYear}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                  <span className="text-slate-500 font-medium">Heures réglementaires prestées</span>
                  <span className="font-extrabold text-slate-800">{detail.normalHours}h x {hourlyRate.toLocaleString('fr-FR')} FCFA</span>
                </div>
                {detail.overtimeHours > 0 && (
                  <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                    <span className="text-slate-500 font-medium">Vacations supplémentaires majorées (+{overtimePremium}%)</span>
                    <span className="font-extrabold text-rose-600">
                      {detail.overtimeHours}h x {(hourlyRate * (1 + overtimePremium / 100)).toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-1.5 font-bold text-sm text-slate-900">
                  <span>Remboursement Brut Estimé</span>
                  <span className="text-emerald-700 font-black">{detail.totalCompensation.toLocaleString('fr-FR')} FCFA</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 progress-footer text-[9.5px] text-slate-400 border-t border-slate-200">
                <span>Calculé d’après l'emploi du temps actuel</span>
                <button
                  onClick={() => window.print()}
                  className="cursor-pointer inline-flex items-center gap-1 hover:text-slate-900 font-bold"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Imprimer cette fiche</span>
                </button>
              </div>
            </div>
          );
        })()
      )}
    </div>
  );
};
