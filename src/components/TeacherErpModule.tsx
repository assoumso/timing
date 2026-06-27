import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  Briefcase, 
  Plus, 
  Trash2, 
  Check, 
  ShieldCheck, 
  Clock, 
  Activity 
} from 'lucide-react';
import { TeacherItem, SubjectItem, ClassItem, ScheduleCourse } from '../types';

interface TeacherErpModuleProps {
  teachers: TeacherItem[];
  setTeachers: React.Dispatch<React.SetStateAction<TeacherItem[]>>;
  subjects: SubjectItem[];
  classes: ClassItem[];
  courses: ScheduleCourse[];
}

interface TeacherExtendedState {
  teacherId: string;
  phone: string;
  contractType: 'Permanent (CDI)' | 'Vacataire (Horaire)' | 'CDD Temporaire';
  monthlyBaseSalary: number;
  hiredDate: string;
}

interface TeacherPayrollAdjustment {
  extraHours: number;
  proctoringHours: number;
  bonuses: number;
  deductions: number;
}

export default function TeacherErpModule({
  teachers,
  setTeachers,
  subjects,
  classes,
  courses
}: TeacherErpModuleProps) {
  
  // Local extra administrative database linked in local storage
  const [extendedData, setExtendedData] = useState<Record<string, TeacherExtendedState>>(() => {
    const saved = localStorage.getItem('erp_teachers_extended');
    if (saved) return JSON.parse(saved);
    // defaults
    return {
      'prof_martin': { teacherId: 'prof_martin', phone: '+225 07 88 55 22 11', contractType: 'Permanent (CDI)', monthlyBaseSalary: 450000, hiredDate: '2022-09-01' },
      'prof_koffi': { teacherId: 'prof_koffi', phone: '+225 05 44 99 88 00', contractType: 'Permanent (CDI)', monthlyBaseSalary: 420000, hiredDate: '2023-10-15' },
      'prof_soro': { teacherId: 'prof_soro', phone: '+225 01 22 33 44 55', contractType: 'Vacataire (Horaire)', monthlyBaseSalary: 180000, hiredDate: '2024-01-08' },
      'prof_diarra': { teacherId: 'prof_diarra', phone: '+225 07 00 11 22 33', contractType: 'CDD Temporaire', monthlyBaseSalary: 320000, hiredDate: '2024-09-01' }
    };
  });

  const saveExtended = (data: Record<string, TeacherExtendedState>) => {
    setExtendedData(data);
    localStorage.setItem('erp_teachers_extended', JSON.stringify(data));
  };

  const exportTeachers = (format: 'excel' | 'pdf' | 'word') => {
    const schoolName = localStorage.getItem('barakat_school_name') || "ÉCOLE DES FAMILLES";
    const academicYear = localStorage.getItem('barakat_academic_year') || "2025-2026";
    const title = "Liste des Enseignants - " + schoolName;
    const headers = ["Identifiant", "Nom Complet", "Matières enseignées", "Type de Contrat", "Traitement Mensuel", "Heures Planifiées", "Max Heures/Semaine", "Adresse Email", "Téléphone"];
    
    const rows = teachers.map(t => {
      const ext = extendedData[t.id] || { phone: '', contractType: 'Permanent (CDI)', monthlyBaseSalary: 350000 };
      const scheduleHoursCount = getTeacherScheduledHoursCount(t.id);
      return [
        t.id,
        t.name,
        t.subjects.map(sid => subjects.find(s => s.id === sid)?.name || sid).join(', '),
        ext.contractType,
        ext.monthlyBaseSalary.toLocaleString() + " FCFA",
        scheduleHoursCount + "h",
        t.maxHoursPerWeek + "h",
        t.email || '',
        ext.phone || ''
      ];
    });

    if (format === 'excel') {
      const csvContent = "\uFEFF" + [headers.join(";")].concat(rows.map(r => r.map(val => `"${val.replace(/"/g, '""')}"`).join(";"))).join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `liste_professeurs_${academicYear.replace(/\s+/g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === 'word') {
      const htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; }
            h2 { color: #0b4998; text-align: center; }
            table { border-collapse: collapse; width: 100%; margin-top: 20px; }
            th, td { border: 1px solid #000000; padding: 8px; text-align: left; font-size: 10pt; }
            th { background-color: #f3f4f6; font-weight: bold; }
          </style>
        </head>
        <body>
          <h2>${title}</h2>
          <p style="text-align: center; font-size: 10pt; color: #666;">Année Académique : ${academicYear}</p>
          <table>
            <thead>
              <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `;
      const blob = new Blob([htmlContent], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `liste_professeurs_${academicYear.replace(/\s+/g, '_')}.doc`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === 'pdf') {
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;
      printWindow.document.write(`
        <html>
          <head>
            <title>${title}</title>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; padding: 30px; color: #1e293b; }
              .header { text-align: center; margin-bottom: 25px; }
              h1 { color: #0b4998; margin: 0; font-size: 22px; }
              .meta { font-size: 13px; color: #64748b; margin-top: 5px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
              th, td { border: 1px solid #e2e8f0; padding: 10px 12px; text-align: left; font-size: 11px; }
              th { background-color: #f8fafc; font-weight: 700; color: #334155; }
              tr:nth-child(even) { background-color: #f8fafc; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${title}</h1>
              <div class="meta">Année Scolaire ${academicYear} | Document officiel</div>
            </div>
            <table>
              <thead>
                <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
              </thead>
              <tbody>
                ${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
              </tbody>
            </table>
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() { window.close(); }, 500);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // UI state
  const [activeTab, setActiveTab] = useState<'hiring' | 'loads' | 'attendance' | 'payroll'>('hiring');
  
  // Form Recruitment
  const [recruitForm, setRecruitForm] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    maxHours: 18,
    color: 'teal',
    contractType: 'Permanent (CDI)' as any,
    monthlyBaseSalary: 350000,
    selectedSubjects: [] as string[]
  });

  // Payroll adjustments database
  const [payrollAdjustments, setPayrollAdjustments] = useState<Record<string, TeacherPayrollAdjustment>>(() => {
    const saved = localStorage.getItem('erp_teachers_payroll_adjustments');
    return saved ? JSON.parse(saved) : {};
  });

  const savePayrollAdjustments = (data: Record<string, TeacherPayrollAdjustment>) => {
    setPayrollAdjustments(data);
    localStorage.setItem('erp_teachers_payroll_adjustments', JSON.stringify(data));
  };

  const handleUpdatePayrollAdjustment = (teacherId: string, field: keyof TeacherPayrollAdjustment, value: number) => {
    const current = payrollAdjustments[teacherId] || { extraHours: 0, proctoringHours: 0, bonuses: 0, deductions: 0 };
    const updated = {
      ...payrollAdjustments,
      [teacherId]: {
        ...current,
        [field]: value
      }
    };
    savePayrollAdjustments(updated);
  };

  const handleGeneratePayslipPDF = (teacher: TeacherItem) => {
    const ext = extendedData[teacher.id] || { phone: '+225 00 00 00 00', contractType: 'Permanent (CDI)', monthlyBaseSalary: 350000, hiredDate: 'En cours' };
    const adj = payrollAdjustments[teacher.id] || { extraHours: 0, proctoringHours: 0, bonuses: 0, deductions: 0 };
    const schoolName = localStorage.getItem('barakat_school_name') || "ÉCOLE DES FAMILLES";
    const academicYear = localStorage.getItem('barakat_academic_year') || "2025-2026";
    const director = localStorage.getItem('barakat_school_director') || "La Direction";

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Calculation logic
    const isVacataire = ext.contractType.includes('Vacataire');
    const scheduledHours = courses.filter(c => c.teacherId === teacher.id).length;
    const monthlyRegularHours = scheduledHours * 4;
    
    let basePay = 0;
    let baseRateLabel = "";
    let baseRateValue = 0;
    
    if (isVacataire) {
      baseRateValue = ext.monthlyBaseSalary; // acting as hourly rate
      basePay = monthlyRegularHours * baseRateValue;
      baseRateLabel = `${baseRateValue.toLocaleString()} FCFA / h`;
    } else {
      basePay = ext.monthlyBaseSalary;
      baseRateLabel = "Forfait Mensuel";
    }

    const extraHoursRate = isVacataire ? baseRateValue * 1.25 : 10000;
    const extraHoursPay = adj.extraHours * extraHoursRate;
    
    const proctoringRate = 7500;
    const proctoringPay = adj.proctoringHours * proctoringRate;
    
    const grossPay = basePay + extraHoursPay + proctoringPay + adj.bonuses;
    const netPay = grossPay - adj.deductions;

    let extraHoursRow = '';
    if (adj.extraHours > 0) {
      extraHoursRow = `
        <tr>
          <td>Heures Supplémentaires (Majorées)</td>
          <td class="num">${extraHoursRate.toLocaleString()} FCFA / h</td>
          <td class="num">${adj.extraHours} h</td>
          <td class="num">${extraHoursPay.toLocaleString()}</td>
          <td class="num">-</td>
        </tr>
      `;
    }

    let proctoringRow = '';
    if (adj.proctoringHours > 0) {
      proctoringRow = `
        <tr>
          <td>Devoirs Surveillés / Examens</td>
          <td class="num">${proctoringRate.toLocaleString()} FCFA / h</td>
          <td class="num">${adj.proctoringHours} h</td>
          <td class="num">${proctoringPay.toLocaleString()}</td>
          <td class="num">-</td>
        </tr>
      `;
    }

    let bonusesRow = '';
    if (adj.bonuses > 0) {
      bonusesRow = `
        <tr>
          <td>Primes et Indemnités Exceptionnelles</td>
          <td class="num">-</td>
          <td class="num">1</td>
          <td class="num">${adj.bonuses.toLocaleString()}</td>
          <td class="num">-</td>
        </tr>
      `;
    }

    let deductionsRow = '';
    if (adj.deductions > 0) {
      deductionsRow = `
        <tr>
          <td>Retenues sur Salaire (Retards/Absences/Avances)</td>
          <td class="num">-</td>
          <td class="num">1</td>
          <td class="num">-</td>
          <td class="num">${adj.deductions.toLocaleString()}</td>
        </tr>
      `;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Bulletin de Paie - ${teacher.name}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; padding: 30px; color: #000; font-size: 12px; max-width: 750px; margin: 0 auto; line-height: 1.4; }
            .header-table { width: 100%; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
            .title { text-align: center; font-size: 16px; font-weight: bold; text-decoration: underline; margin-bottom: 20px; }
            .info-table { width: 100%; margin-bottom: 20px; }
            .info-table td { padding: 4px; }
            .payroll-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .payroll-table th, .payroll-table td { border: 1px solid #000; padding: 6px 10px; text-align: left; }
            .payroll-table th { background-color: #f2f2f2; }
            .payroll-table .num { text-align: right; }
            .summary-box { width: 100%; display: flex; justify-content: flex-end; margin-bottom: 30px; }
            .summary-table { width: 50%; border-collapse: collapse; }
            .summary-table td { border: 1px solid #000; padding: 6px 10px; font-weight: bold; }
            .signatures { display: flex; justify-content: space-between; margin-top: 40px; }
            .sig-block { width: 45%; text-align: center; }
            .sig-space { height: 70px; }
            @media print {
              body { padding: 10px; }
            }
          </style>
        </head>
        <body>
          <table class="header-table">
            <tr>
              <td style="font-weight: bold; font-size: 14px;">${schoolName.toUpperCase()}</td>
              <td style="text-align: right; font-weight: bold;">BULLETIN DE PAIE</td>
            </tr>
            <tr>
              <td>Année Scolaire : ${academicYear}</td>
              <td style="text-align: right;">Période : ${new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }).toUpperCase()}</td>
            </tr>
          </table>

          <table class="info-table">
            <tr>
              <td style="width: 15%; font-weight: bold;">MATRICULE :</td>
              <td style="width: 35%;">${teacher.id}</td>
              <td style="width: 20%; font-weight: bold;">NOM DE L'ENSEIGNANT :</td>
              <td style="width: 30%;">${teacher.name}</td>
            </tr>
            <tr>
              <td style="font-weight: bold;">CONTRAT :</td>
              <td>${ext.contractType}</td>
              <td style="font-weight: bold;">TÉLÉPHONE :</td>
              <td>${ext.phone}</td>
            </tr>
            <tr>
              <td style="font-weight: bold;">EMAIL :</td>
              <td colspan="3">${teacher.email || 'Non spécifié'}</td>
            </tr>
          </table>

          <div class="title">DÉTAIL DES ÉMOLUMENTS ET INDEMNITÉS</div>

          <table class="payroll-table">
            <thead>
              <tr>
                <th>Rubrique / Libellé</th>
                <th class="num">Base / Taux</th>
                <th class="num">Nombre / Quantité</th>
                <th class="num">Gain (FCFA)</th>
                <th class="num">Retenue (FCFA)</th>
              </tr>
            </thead>
            <tbody>
              <!-- Base Pay -->
              <tr>
                <td>Salaire / Honoraires de Base</td>
                <td class="num">${baseRateLabel}</td>
                <td class="num">${isVacataire ? `${monthlyRegularHours} heures` : '1'}</td>
                <td class="num">${basePay.toLocaleString()}</td>
                <td class="num">-</td>
              </tr>
              <!-- Extra Hours -->
              ${extraHoursRow}
              <!-- Proctoring / Exam Hours -->
              ${proctoringRow}
              <!-- Bonuses -->
              ${bonusesRow}
              <!-- Deductions -->
              ${deductionsRow}
            </tbody>
          </table>

          <div class="summary-box">
            <table class="summary-table">
              <tr>
                <td>TOTAL BRUT :</td>
                <td style="text-align: right;">${grossPay.toLocaleString()} FCFA</td>
              </tr>
              <tr>
                <td>TOTAL RETENUES :</td>
                <td style="text-align: right;">${adj.deductions.toLocaleString()} FCFA</td>
              </tr>
              <tr style="background-color: #f2f2f2; font-size: 14px;">
                <td>NET À PAYER :</td>
                <td style="text-align: right; color: #0b4998;">${netPay.toLocaleString()} FCFA</td>
              </tr>
            </table>
          </div>

          <div class="signatures">
            <div class="sig-block">
              <strong>Le Bénéficiaire</strong><br/>
              <span style="font-size: 9px;">Signature précédée de la mention "Reçu"</span>
              <div class="sig-space"></div>
            </div>
            <div class="sig-block">
              <strong>La Caisse / La Direction</strong><br/>
              <span style="font-size: 9px;">Le Directeur ${director}</span>
              <div class="sig-space"></div>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Editing teacher state
  const [editingTeacher, setEditingTeacher] = useState<TeacherItem | null>(null);
  const [editForm, setEditForm] = useState<{
    id: string;
    name: string;
    email: string;
    phone: string;
    maxHours: number;
    color: string;
    contractType: 'Permanent (CDI)' | 'Vacataire (Horaire)' | 'CDD Temporaire';
    monthlyBaseSalary: number;
    selectedSubjects: string[];
    hiredDate: string;
  } | null>(null);

  useEffect(() => {
    if (editingTeacher) {
      const ext = extendedData[editingTeacher.id] || { phone: '', contractType: 'Permanent (CDI)' as any, monthlyBaseSalary: 350000, hiredDate: new Date().toISOString().split('T')[0] };
      setEditForm({
        id: editingTeacher.id,
        name: editingTeacher.name,
        email: editingTeacher.email || '',
        phone: ext.phone || '',
        maxHours: editingTeacher.maxHoursPerWeek,
        color: editingTeacher.color,
        contractType: ext.contractType as any,
        monthlyBaseSalary: ext.monthlyBaseSalary,
        selectedSubjects: [...editingTeacher.subjects],
        hiredDate: ext.hiredDate || new Date().toISOString().split('T')[0]
      });
    } else {
      setEditForm(null);
    }
  }, [editingTeacher, extendedData]);

  const handleSaveTeacherEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;

    if (!editForm.name.trim()) {
      alert("Le nom de l'enseignant est obligatoire !");
      return;
    }

    // Update central teachers list
    setTeachers(prev => {
      const updated = prev.map(t => t.id === editForm.id ? {
        ...t,
        name: editForm.name.trim(),
        email: editForm.email.trim() || undefined,
        maxHoursPerWeek: editForm.maxHours,
        color: editForm.color,
        subjects: editForm.selectedSubjects.length > 0 ? editForm.selectedSubjects : t.subjects
      } : t);
      localStorage.setItem('barakatplanning_teachers', JSON.stringify(updated));
      return updated;
    });

    // Update extended administrative data
    const updatedExt = {
      ...extendedData,
      [editForm.id]: {
        teacherId: editForm.id,
        phone: editForm.phone.trim() || "+225 00 00 00 00 00",
        contractType: editForm.contractType,
        monthlyBaseSalary: editForm.monthlyBaseSalary,
        hiredDate: editForm.hiredDate
      }
    };
    saveExtended(updatedExt);

    setEditingTeacher(null);
    alert("Dossier enseignant mis à jour avec succès !");
  };

  const handleGenerateContractPDF = (teacher: TeacherItem) => {
    const ext = extendedData[teacher.id] || { phone: '+225 00 00 00 00', contractType: 'Permanent (CDI)', monthlyBaseSalary: 350000, hiredDate: 'En cours' };
    const schoolName = localStorage.getItem('barakat_school_name') || "ÉCOLE DES FAMILLES";
    const academicYear = localStorage.getItem('barakat_academic_year') || "2025-2026";
    const director = localStorage.getItem('barakat_school_director') || "La Direction";

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const formattedMonthlySalary = ext.monthlyBaseSalary.toLocaleString();
    const hireDate = ext.hiredDate !== 'En cours' ? new Date(ext.hiredDate).toLocaleDateString('fr-FR', { dateStyle: 'long' }) : 'non spécifiée';
    const teacherSubjects = teacher.subjects.map(sid => subjects.find(sub => sub.id === sid)?.name || sid).join(', ');

    printWindow.document.write(`
      <html>
        <head>
          <title>Contrat de Travail - ${teacher.name}</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 40px; color: #111827; line-height: 1.6; max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 3px double #000; padding-bottom: 15px; }
            .school-name { font-size: 24px; font-weight: bold; text-transform: uppercase; color: #0b4998; }
            .school-motto { font-style: italic; font-size: 13px; color: #4b5563; }
            .contract-title { font-size: 20px; font-weight: bold; text-align: center; text-transform: uppercase; margin: 30px 0; text-decoration: underline; }
            .section-title { font-size: 14px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; margin-top: 25px; margin-bottom: 10px; }
            .content { font-size: 12px; text-align: justify; }
            .parties { margin-bottom: 20px; }
            .signatures { margin-top: 50px; display: flex; justify-content: space-between; }
            .signature-block { text-align: center; width: 45%; }
            .signature-space { height: 100px; border-bottom: 1px dashed #000; margin-bottom: 10px; }
            @media print {
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="school-name">${schoolName}</div>
            <div class="school-motto">Année Scolaire ${academicYear}</div>
            <div style="font-size: 11px; margin-top: 5px; font-weight: bold;">FICHE INDIVIDUELLE & CONTRAT PROFESSIONNEL</div>
          </div>

          <div class="contract-title">CONTRAT DE TRAVAIL - ENSEIGNANT</div>

          <div class="content">
            <div class="parties">
              <strong>ENTRE LES SOUSSIGNÉS :</strong><br/>
              <strong>L'Établissement :</strong> ${schoolName}, représenté par son Directeur <strong>${director}</strong>, ci-après désigné "L'Employeur", d'une part,<br/>
              <strong>Et l'Enseignant :</strong> <strong>${teacher.name}</strong>, de spécialité(s) <strong>${teacherSubjects}</strong>, domicilié à l'adresse e-mail <strong>${teacher.email || 'Non spécifiée'}</strong>, Téléphone : <strong>${ext.phone}</strong>, ci-après désigné "L'Employé", d'autre part.
            </div>

            <p>Il a été convenu et arrêté ce qui suit :</p>

            <div class="section-title">Article 1 : Objet du Contrat & Engagement</div>
            <p>L'Employeur recrute L'Employé en qualité d'enseignant sous le régime contractuel de type <strong>${ext.contractType}</strong> pour dispenser des cours de <strong>${teacherSubjects}</strong> au titre de l'année scolaire en cours. L'Employé s'engage à accomplir ses cours avec professionnalisme et ponctualité, conformément à l'emploi du temps qui lui sera transmis.</p>

            <div class="section-title">Article 2 : Durée & Date d'Effet</div>
            <p>Le présent contrat prend effet à compter du <strong>${hireDate}</strong>. Sa durée est liée aux spécifications légales du statut de <strong>${ext.contractType}</strong>.</p>

            <div class="section-title">Article 3 : Rémunération & Traitement</div>
            <p>En contrepartie de l'accomplissement de ses tâches académiques, L'Employé percevra un traitement de base mensuel forfaitaire de <strong>${formattedMonthlySalary} FCFA</strong>. Pour les contrats vacataires, ce barème pourra être modulé en fonction des heures effectivement prestées à la fin de chaque mois.</p>

            <div class="section-title">Article 4 : Obligations Professionnelles</div>
            <p>L'Employé s'engage à respecter les règlements intérieurs de l'établissement, à assister aux conseils des professeurs et à consigner régulièrement les notes et évaluations des élèves sous sa charge. La charge hebdomadaire maximale autorisée est fixée à <strong>${teacher.maxHoursPerWeek} heures</strong>.</p>

            <div class="section-title">Article 5 : Résiliation</div>
            <p>Chacune des parties pourra mettre fin au présent engagement sous réserve des préavis légaux applicables au contrat de type ${ext.contractType}.</p>

            <p style="text-align: right; margin-top: 30px;">Fait à Abidjan, le ${new Date().toLocaleDateString('fr-FR', { dateStyle: 'long' })}</p>

            <div class="signatures">
              <div class="signature-block">
                <strong>L'Employé(e)</strong><br/>
                <span style="font-size: 10px; color: #555;">(Précédé de la mention "Lu et approuvé")</span>
                <div class="signature-space"></div>
              </div>
              <div class="signature-block">
                <strong>L'Employeur</strong><br/>
                <span style="font-size: 10px; color: #555;">Le Directeur ${director}</span>
                <div class="signature-space"></div>
              </div>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Attendance checking state
  const [teacherDailyAttendance, setTeacherDailyAttendance] = useState<Record<string, 'present' | 'late' | 'absent'>>(() => {
    const saved = localStorage.getItem('erp_teachers_attendance_check');
    return saved ? JSON.parse(saved) : {};
  });

  // Calculate live teaching hours per week for each teacher (1 course block = 1 hour)
  const getTeacherScheduledHoursCount = (teacherId: string) => {
    return courses.filter(c => c.teacherId === teacherId).length;
  };

  // Recruit Method
  const handleRecruitTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recruitForm.name.trim() || !recruitForm.id.trim()) {
      alert("Veuillez remplir l'Identifiant unique et le nom complet !");
      return;
    }

    const cleanedId = recruitForm.id.trim().toLowerCase().replace(/\s+/g, '_');
    if (teachers.some(t => t.id === cleanedId)) {
      alert("Erreur ! Un enseignant possède déjà cet Identifiant unique.");
      return;
    }

    const newTeacher: TeacherItem = {
      id: cleanedId,
      name: recruitForm.name.trim(),
      subjects: recruitForm.selectedSubjects.length > 0 ? recruitForm.selectedSubjects : [subjects[0]?.id || 'math'],
      unavailableSlots: [],
      color: recruitForm.color,
      email: recruitForm.email.trim() || undefined,
      maxHoursPerWeek: recruitForm.maxHours
    };

    // Append to central teacher list (Shares with schedule!)
    setTeachers(prev => {
      const updated = [...prev, newTeacher];
      localStorage.setItem('barakatplanning_teachers', JSON.stringify(updated));
      return updated;
    });

    // Save extra HR properties
    const ext: TeacherExtendedState = {
      teacherId: cleanedId,
      phone: recruitForm.phone.trim() || "+225 00 00 00 00 00",
      contractType: recruitForm.contractType,
      monthlyBaseSalary: recruitForm.monthlyBaseSalary,
      hiredDate: new Date().toISOString().split('T')[0]
    };
    saveExtended({
      ...extendedData,
      [cleanedId]: ext
    });

    alert(`Félicitations ! L'enseignant "${newTeacher.name}" a été recruté avec succès.\nIl est maintenant disponible pour être affecté aux emplois du temps.`);
    
    // reset form
    setRecruitForm({
      id: '',
      name: '',
      email: '',
      phone: '',
      maxHours: 18,
      color: 'teal',
      contractType: 'Permanent (CDI)' as any,
      monthlyBaseSalary: 350000,
      selectedSubjects: []
    });
  };

  // Handle delete teacher
  const handleDeleteTeacher = (id: string, name: string) => {
    if (window.confirm(`Voulez-vous révoquer le contrat et supprimer l'enseignant ${name} ? cela affectera ses cours programmés.`)) {
      setTeachers(prev => {
        const updated = prev.filter(t => t.id !== id);
        localStorage.setItem('barakatplanning_teachers', JSON.stringify(updated));
        return updated;
      });
      const copy = { ...extendedData };
      delete copy[id];
      saveExtended(copy);
    }
  };

  const toggleSubjectSelect = (subId: string) => {
    setRecruitForm(prev => {
      const exists = prev.selectedSubjects.includes(subId);
      const next = exists 
        ? prev.selectedSubjects.filter(id => id !== subId)
        : [...prev.selectedSubjects, subId];
      return { ...prev, selectedSubjects: next };
    });
  };

  const handleSetAttendance = (teacherId: string, status: 'present' | 'late' | 'absent') => {
    const updated = { ...teacherDailyAttendance, [teacherId]: status };
    setTeacherDailyAttendance(updated);
    localStorage.setItem('erp_teachers_attendance_check', JSON.stringify(updated));
  };

  return (
    <div className="space-y-6">
      
      {/* Module Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-light">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Briefcase className="h-5.5 w-5.5 text-indigo-650" />
            <span>Gestion des Enseignants & Corps Professoral</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Embauchez des enseignants qualifiés, affectez-les à des enseignements précis et suivez leur charge horaire réelle vis-à-vis du plan hebdomadaire.
          </p>
        </div>

        {/* Sub Navigation */}
        <div className="flex gap-2.5">
          <button 
            onClick={() => setActiveTab('hiring')}
            className={`cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'hiring' ? 'bg-[#ee7b11] text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <Users className="h-4 w-4" />
            Recrutement & Effectifs
          </button>
          <button 
            onClick={() => setActiveTab('loads')}
            className={`cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'loads' ? 'bg-[#ee7b11] text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <Clock className="h-4 w-4" />
            Charges & Volumes Horaires
          </button>
          <button 
            onClick={() => setActiveTab('attendance')}
            className={`cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'attendance' ? 'bg-[#ee7b11] text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <Activity className="h-4 w-4" />
            Pointage Présences
          </button>
          <button 
            onClick={() => setActiveTab('payroll')}
            className={`cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'payroll' ? 'bg-[#ee7b11] text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <span className="text-xs">🪙</span>
            Honoraires & Émoluments
          </button>
        </div>
      </div>

      {/* RENDER TAB: HIRING & RECRUITMENT */}
      {activeTab === 'hiring' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left panel: Recruitment Form */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase text-[#0b4998] tracking-widest flex items-center gap-1.5">
              <span>Recruter un Enseignant</span>
            </h3>

            <form onSubmit={handleRecruitTeacher} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Identifiant unique (Sans espaces)</label>
                <input 
                  type="text" 
                  required
                  placeholder="ex: prof_gomez" 
                  value={recruitForm.id}
                  onChange={(e) => setRecruitForm(prev => ({ ...prev, id: e.target.value }))}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Nom complet & titre</label>
                <input 
                  type="text" 
                  required
                  placeholder="ex: M. Gomez Paul" 
                  value={recruitForm.name}
                  onChange={(e) => setRecruitForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Courriel professionnel</label>
                <input 
                  type="email" 
                  placeholder="ex: p.gomez@ecole.ci" 
                  value={recruitForm.email}
                  onChange={(e) => setRecruitForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Téléphone Mobile</label>
                  <input 
                    type="text" 
                    placeholder="Abidjan" 
                    value={recruitForm.phone}
                    onChange={(e) => setRecruitForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Charge Max (heures/sem.)</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="40" 
                    value={recruitForm.maxHours}
                    onChange={(e) => setRecruitForm(prev => ({ ...prev, maxHours: parseInt(e.target.value) || 18 }))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#ee7b11] uppercase">Type de Contrat</label>
                  <select
                    value={recruitForm.contractType}
                    onChange={(e) => setRecruitForm(prev => ({ ...prev, contractType: e.target.value as any }))}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                  >
                    <option value="Permanent (CDI)">Permanent (CDI)</option>
                    <option value="Vacataire (Horaire)">Vacataire (Horaire)</option>
                    <option value="CDD Temporaire">CDD Temporaire</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Salaire Base / Taux Horaire (FCFA)</label>
                  <input 
                    type="number" 
                    value={recruitForm.monthlyBaseSalary}
                    onChange={(e) => setRecruitForm(prev => ({ ...prev, monthlyBaseSalary: parseInt(e.target.value) || 150000 }))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Couleur d'identification</label>
                <select
                  value={recruitForm.color}
                  onChange={(e) => setRecruitForm(prev => ({ ...prev, color: e.target.value }))}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                >
                  <option value="indigo">Indigo</option>
                  <option value="emerald">Vert Émeraude</option>
                  <option value="teal">Sarcelle (Teal)</option>
                  <option value="rose">Rose</option>
                  <option value="amber">Ambre</option>
                  <option value="violet">Violet</option>
                  <option value="slate">Ardoise</option>
                </select>
              </div>

              {/* Subject qualification checkboxes list */}
              <div className="space-y-1.5 pt-1.5 border-t border-slate-100">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Matières de spécialisation</label>
                <div className="flex flex-wrap gap-1.5 max-h-[85px] overflow-y-auto pt-1">
                  {subjects.map(s => {
                    const isSelected = recruitForm.selectedSubjects.includes(s.id);
                    return (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => toggleSubjectSelect(s.id)}
                        className={`cursor-pointer px-2 py-1 border rounded-lg text-[10px] font-bold transition ${
                          isSelected ? 'bg-indigo-600 text-white border-indigo-650' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {s.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button 
                type="submit"
                className="cursor-pointer w-full py-2 bg-[#ee7b11] hover:bg-[#d66f0e] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm pt-2"
              >
                <Plus className="h-4 w-4" />
                Dresser le Contrat & Sauver
              </button>
            </form>
          </div>

          {/* Right panel: Teachers directory */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-5 shadow-xs overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-indigo-50 mb-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                Dossiers & Contrats Professoriaux Actuels ({teachers.length})
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Exporter :</span>
                <button
                  type="button"
                  onClick={() => exportTeachers('excel')}
                  className="cursor-pointer px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-[10px] font-black uppercase transition flex items-center gap-1.5"
                >
                  Excel
                </button>
                <button
                  type="button"
                  onClick={() => exportTeachers('word')}
                  className="cursor-pointer px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-[10px] font-black uppercase transition flex items-center gap-1.5"
                >
                  Word
                </button>
                <button
                  type="button"
                  onClick={() => exportTeachers('pdf')}
                  className="cursor-pointer px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-[10px] font-black uppercase transition flex items-center gap-1.5"
                >
                  PDF
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teachers.map(t => {
                const ext = extendedData[t.id] || { phone: '+225 00 00 00 00', contractType: 'Permanent (CDI)', monthlyBaseSalary: 350000, hiredDate: 'En cours' };
                const scheduleHoursCount = getTeacherScheduledHoursCount(t.id);
                
                // Colors lookup helper for visual cohesion (safe fallback)
                let visualBorder = "border-slate-200";
                if (t.color === 'indigo') visualBorder = "border-indigo-300";
                if (t.color === 'emerald') visualBorder = "border-emerald-300";
                if (t.color === 'teal') visualBorder = "border-teal-300";
                if (t.color === 'rose') visualBorder = "border-rose-300";
                if (t.color === 'amber') visualBorder = "border-amber-300";

                return (
                  <div key={t.id} className={`p-4 rounded-2xl bg-slate-50 border ${visualBorder} hover:shadow-xs transition flex flex-col justify-between space-y-3 group`}>
                    
                    {/* Header profile row */}
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[9px] uppercase font-black tracking-wider text-[#0b4998]">{t.id}</span>
                        <h4 className="text-sm font-bold text-slate-900">{t.name}</h4>
                        <span className="text-[10px] text-slate-400 font-semibold">{t.email || 'Pas de courriel enregistré'}</span>
                      </div>

                      <button 
                        onClick={() => handleDeleteTeacher(t.id, t.name)}
                        className="opacity-0 group-hover:opacity-100 cursor-pointer p-1 text-slate-350 hover:text-red-500 rounded-lg transition"
                        title="Révoquer l'enseignant"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Meta contract row */}
                    <div className="grid grid-cols-2 gap-2 text-[10.5px] font-semibold text-slate-500 py-1.5 border-t border-b border-slate-100">
                      <div>
                        <span className="text-[8px] font-bold text-slate-400 uppercase block">Contrat</span>
                        <span className="text-slate-800 block">{ext.contractType}</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-bold text-slate-400 uppercase block">Traitement mensuel</span>
                        <span className="text-slate-850 font-mono block font-bold">{ext.monthlyBaseSalary.toLocaleString()} FCFA</span>
                      </div>
                    </div>

                    {/* Teaching qualification tags */}
                    <div className="space-y-1">
                      <span className="text-[8px] font-bold text-slate-400 uppercase">Spécialités :</span>
                      <div className="flex flex-wrap gap-1">
                        {t.subjects.map(subId => {
                          const matchedSubName = subjects.find(s => s.id === subId)?.name || subId;
                          return (
                            <span key={subId} className="px-1.5 py-0.2 bg-slate-200 text-slate-700 text-[8.5px] font-extrabold rounded-md">
                              {matchedSubName}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Live scheduled hours summary */}
                    <div className="pt-2">
                      <div className="flex justify-between text-[9px] font-black text-slate-650 uppercase mb-1">
                        <span>Horaires Grille : {scheduleHoursCount}h / Max {t.maxHoursPerWeek}h</span>
                        <span className={scheduleHoursCount > t.maxHoursPerWeek ? 'text-red-600' : 'text-emerald-750'}>
                          {Math.round(scheduleHoursCount / t.maxHoursPerWeek * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            scheduleHoursCount > t.maxHoursPerWeek ? 'bg-red-500' : 'bg-emerald-555'
                          }`}
                          style={{ width: `${Math.min(100, scheduleHoursCount / t.maxHoursPerWeek * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Action buttons row */}
                    <div className="flex gap-2 pt-2.5 border-t border-slate-200/65">
                      <button
                        onClick={() => handleGenerateContractPDF(t)}
                        className="cursor-pointer flex-1 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-[10px] font-black uppercase transition flex items-center justify-center gap-1"
                        title="Imprimer la fiche sous forme de contrat"
                      >
                        📄 Fiche Contrat
                      </button>
                      <button
                        onClick={() => setEditingTeacher(t)}
                        className="cursor-pointer flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-305 rounded-xl text-[10px] font-black uppercase transition flex items-center justify-center gap-1"
                        title="Modifier l'enseignant"
                      >
                        ✏️ Modifier
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* RENDER TAB: LOADS & MAX TRACKING REPORT */}
      {activeTab === 'loads' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-black text-[#0b4998] uppercase">Moniteur des Charges d’Enseignement Actives</h3>
          <p className="text-xs text-slate-500 leading-normal">
            Le tableau ci-dessous combine les heures insérées sur l'Emploi du Temps réel avec le plafond autorisé pour chaque professeur. Il permet de contrôler instantanément la sur-activité ou la sous-charge.
          </p>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-450 border-b border-slate-200 text-xs font-bold">
                  <th className="p-3">Identifiant</th>
                  <th className="p-3">Nom de l'Enseignant</th>
                  <th className="p-3 text-center">Spécialités</th>
                  <th className="p-3 text-center">Heures Prévues d'office</th>
                  <th className="p-3 text-center">Contrat Max</th>
                  <th className="p-3">Statut Charge</th>
                  <th className="p-3">Balance Mensuelle Estimée</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map(t => {
                  const currentHours = getTeacherScheduledHoursCount(t.id);
                  const ext = extendedData[t.id] || { contractType: 'Permanent (CDI)', monthlyBaseSalary: 350000 };
                  const percent = Math.round((currentHours / t.maxHoursPerWeek) * 105) || 0;
                  
                  return (
                    <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50/50 text-xs transition">
                      <td className="p-3 font-mono font-bold text-slate-500">{t.id}</td>
                      <td className="p-3 font-extrabold text-[#0b4998]">{t.name}</td>
                      <td className="p-3 text-center">
                        <span className="text-[10px] text-slate-550 font-semibold">{t.subjects.length} matières</span>
                      </td>
                      <td className="p-3 text-center font-black text-[#ee7b11]">{currentHours}h / semaine</td>
                      <td className="p-3 text-center font-bold text-slate-700">{t.maxHoursPerWeek}h / semaine</td>
                      <td className="p-3">
                        {currentHours > t.maxHoursPerWeek ? (
                          <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-[9px] font-black uppercase">⚠️ En surcharge</span>
                        ) : currentHours === 0 ? (
                          <span className="bg-slate-150 text-slate-500 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase">Non affecté</span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[9px] font-black uppercase">Charge Conforme</span>
                        )}
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-650">
                        {ext.contractType.includes('Vacataire') 
                          ? `${(currentHours * 4 * 7500).toLocaleString()} FCFA (Par Heure)` 
                          : `${ext.monthlyBaseSalary.toLocaleString()} FCFA (Forfait CDI)`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RENDER TAB: TEACHERS POINTAGE PRESENCES */}
      {activeTab === 'attendance' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-indigo-55">
            <h3 className="text-sm font-black text-slate-900 uppercase">Registre de Pointage Quotidien - Corps Enseignant</h3>
            <span className="text-[10px] bg-slate-900 text-white px-2.5 py-0.5 rounded-full font-bold">Pointage du jour : {new Date().toLocaleDateString('fr-FR', { dateStyle: 'medium' })}</span>
          </div>

          <p className="text-xs text-slate-500 font-semibold">
            Pointage rapide matinal pour le contrôle d'accès des professeurs. Les absences excusées permettront la réaffectation sans heurts par le bureau des surveillants.
          </p>

          <div className="space-y-2.5">
            {teachers.map(t => {
              const currentStatus = teacherDailyAttendance[t.id] || 'present';
              return (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-150/80 hover:bg-slate-100/50 transition">
                  <div className="flex items-center gap-3">
                    <span className="p-11 rounded-full text-xs font-bold" style={{ backgroundColor: t.color === 'indigo' ? '#e0e7ff' : '#ecfdf5' }}>
                      👨‍🏫
                    </span>
                    <div>
                      <span className="text-xs font-black text-slate-900 block">{t.name}</span>
                      <span className="text-[10.5px] text-slate-450 font-bold block">Contrat actif ({t.subjects.length} Disciplines)</span>
                    </div>
                  </div>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleSetAttendance(t.id, 'present')}
                      className={`cursor-pointer px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition ${
                        currentStatus === 'present' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Present
                    </button>
                    <button
                      onClick={() => handleSetAttendance(t.id, 'late')}
                      className={`cursor-pointer px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition ${
                        currentStatus === 'late' ? 'bg-amber-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      En retard
                    </button>
                    <button
                      onClick={() => handleSetAttendance(t.id, 'absent')}
                      className={`cursor-pointer px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition ${
                        currentStatus === 'absent' ? 'bg-red-650 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Absent
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RENDER TAB: PAYROLL & HONORAIRES */}
      {activeTab === 'payroll' && (
        <div className="space-y-6">
          {/* Summary Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-center justify-between shadow-inner">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Masse Salariale</span>
                <span className="text-base font-black text-indigo-700 font-mono">
                  {teachers.reduce((acc, t) => {
                    const ext = extendedData[t.id] || { contractType: 'Permanent (CDI)', monthlyBaseSalary: 350000 };
                    const adj = payrollAdjustments[t.id] || { extraHours: 0, proctoringHours: 0, bonuses: 0, deductions: 0 };
                    const isVacataire = ext.contractType.includes('Vacataire');
                    const regularHours = courses.filter(c => c.teacherId === t.id).length * 4;
                    const basePay = isVacataire ? regularHours * ext.monthlyBaseSalary : ext.monthlyBaseSalary;
                    const extraRate = isVacataire ? ext.monthlyBaseSalary * 1.25 : 10000;
                    const extraPay = adj.extraHours * extraRate;
                    const proctoringPay = adj.proctoringHours * 7500;
                    const gross = basePay + extraPay + proctoringPay + adj.bonuses;
                    const net = gross - adj.deductions;
                    return acc + net;
                  }, 0).toLocaleString()} FCFA
                </span>
              </div>
              <span className="text-2xl">💰</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-center justify-between shadow-inner">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Permanents (Fixed)</span>
                <span className="text-base font-black text-slate-800">
                  {teachers.filter(t => {
                    const ext = extendedData[t.id] || { contractType: 'Permanent (CDI)' };
                    return !ext.contractType.includes('Vacataire');
                  }).length} enseignants
                </span>
              </div>
              <span className="text-2xl">👔</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-center justify-between shadow-inner">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Vacataires (Hourly)</span>
                <span className="text-base font-black text-slate-800">
                  {teachers.filter(t => {
                    const ext = extendedData[t.id] || { contractType: 'Permanent (CDI)' };
                    return ext.contractType.includes('Vacataire');
                  }).length} enseignants
                </span>
              </div>
              <span className="text-2xl">⏱️</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-center justify-between shadow-inner">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Heures Sup. & Devoirs</span>
                <span className="text-base font-black text-[#ee7b11] font-mono">
                  {teachers.reduce((acc, t) => {
                    const adj = payrollAdjustments[t.id] || { extraHours: 0, proctoringHours: 0, bonuses: 0, deductions: 0 };
                    return acc + adj.extraHours + adj.proctoringHours;
                  }, 0)} h cumulées
                </span>
              </div>
              <span className="text-2xl">📝</span>
            </div>
          </div>

          {/* Payroll calculation table */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-indigo-50">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase">Calcul et Répartition Mensuelle des Émoluments</h3>
                <p className="text-[11px] text-slate-400">Modifiez directement les heures supplémentaires, de surveillance et primes en cours de mois.</p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-450 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider">
                    <th className="p-3">Enseignant</th>
                    <th className="p-3">Type & Base</th>
                    <th className="p-3 text-center">Cours Planifiés</th>
                    <th className="p-3 text-center">Heures Sup. (h)</th>
                    <th className="p-3 text-center">Devoirs/Exams (h)</th>
                    <th className="p-3 text-center">Primes (FCFA)</th>
                    <th className="p-3 text-center">Retenues (FCFA)</th>
                    <th className="p-3 text-right">Net à Payer (Est.)</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map(t => {
                    const ext = extendedData[t.id] || { contractType: 'Permanent (CDI)', monthlyBaseSalary: 350000 };
                    const adj = payrollAdjustments[t.id] || { extraHours: 0, proctoringHours: 0, bonuses: 0, deductions: 0 };
                    const isVacataire = ext.contractType.includes('Vacataire');
                    const scheduledHours = courses.filter(c => c.teacherId === t.id).length;
                    const monthlyRegularHours = scheduledHours * 4;

                    let basePay = 0;
                    if (isVacataire) {
                      basePay = monthlyRegularHours * ext.monthlyBaseSalary;
                    } else {
                      basePay = ext.monthlyBaseSalary;
                    }

                    const extraRate = isVacataire ? ext.monthlyBaseSalary * 1.25 : 10000;
                    const extraPay = adj.extraHours * extraRate;
                    const proctoringPay = adj.proctoringHours * 7500;
                    
                    const gross = basePay + extraPay + proctoringPay + adj.bonuses;
                    const net = gross - adj.deductions;

                    return (
                      <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50/50 text-xs transition">
                        {/* Name */}
                        <td className="p-3">
                          <span className="font-extrabold text-slate-900 block">{t.name}</span>
                          <span className="text-[9px] font-mono text-[#0b4998] block uppercase">{t.id}</span>
                        </td>
                        
                        {/* Base type and Salary */}
                        <td className="p-3">
                          <span className={`inline-block px-1.5 py-0.2 rounded text-[8.5px] font-black uppercase ${isVacataire ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                            {ext.contractType}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-slate-500 block mt-0.5">
                            {ext.monthlyBaseSalary.toLocaleString()} {isVacataire ? 'FCFA/h' : 'FCFA/mois'}
                          </span>
                        </td>

                        {/* Scheduled hours */}
                        <td className="p-3 text-center font-bold">
                          <span className="text-[#ee7b11]">{scheduledHours}h/sem</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">{monthlyRegularHours}h/mois</span>
                        </td>

                        {/* Extra Hours Input */}
                        <td className="p-3 text-center">
                          <input 
                            type="number"
                            min="0"
                            value={adj.extraHours || 0}
                            onChange={(e) => handleUpdatePayrollAdjustment(t.id, 'extraHours', parseInt(e.target.value) || 0)}
                            className="w-16 px-1.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold text-slate-700 focus:outline-none focus:bg-white"
                          />
                        </td>

                        {/* Proctoring Hours Input */}
                        <td className="p-3 text-center">
                          <input 
                            type="number"
                            min="0"
                            value={adj.proctoringHours || 0}
                            onChange={(e) => handleUpdatePayrollAdjustment(t.id, 'proctoringHours', parseInt(e.target.value) || 0)}
                            className="w-16 px-1.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold text-slate-700 focus:outline-none focus:bg-white"
                          />
                        </td>

                        {/* Bonuses Input */}
                        <td className="p-3 text-center">
                          <input 
                            type="number"
                            min="0"
                            value={adj.bonuses || 0}
                            onChange={(e) => handleUpdatePayrollAdjustment(t.id, 'bonuses', parseInt(e.target.value) || 0)}
                            className="w-24 px-1.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-right font-bold text-slate-700 focus:outline-none focus:bg-white"
                          />
                        </td>

                        {/* Deductions Input */}
                        <td className="p-3 text-center">
                          <input 
                            type="number"
                            min="0"
                            value={adj.deductions || 0}
                            onChange={(e) => handleUpdatePayrollAdjustment(t.id, 'deductions', parseInt(e.target.value) || 0)}
                            className="w-24 px-1.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-right font-bold text-rose-600 focus:outline-none focus:bg-white"
                          />
                        </td>

                        {/* Net salary calculated live */}
                        <td className="p-3 text-right font-mono font-black text-[#0b4998]">
                          {net.toLocaleString()} FCFA
                        </td>

                        {/* Actions */}
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleGeneratePayslipPDF(t)}
                            className="cursor-pointer px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-[9px] font-black uppercase transition inline-flex items-center gap-1"
                            title="Imprimer le Bulletin de Paie"
                          >
                            <span>🧾 Bulletin</span>
                          </button>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Note on rates */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-150 text-[10px] text-slate-500 font-semibold space-y-1">
              <span className="font-bold text-[#0b4998] block">ℹ️ Barèmes de calcul par défaut :</span>
              <ul className="list-disc pl-4 space-y-0.5">
                <li><strong>Enseignant Permanent :</strong> Salaire Mensuel Fixe. Heures supplémentaires payées au tarif fixe de 10 000 FCFA / h.</li>
                <li><strong>Enseignant Vacataire :</strong> Honoraires calculés sur les heures planifiées (nombre d'heures hebdomadaire × 4 semaines × taux horaire de base).</li>
                <li><strong>Heures Supplémentaires Vacataires :</strong> Majorées de +25% par rapport au taux horaire de base de l'enseignant.</li>
                <li><strong>Devoirs surveillés / Examens (tous statuts) :</strong> Indemnisés au forfait uniforme de 7 500 FCFA / h.</li>
              </ul>
            </div>

          </div>
        </div>
      )}

      {/* RENDER MODAL: EDIT TEACHER */}
      {editingTeacher && editForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-6 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-150">
              <div>
                <h3 className="text-base font-black text-[#0b4998] flex items-center gap-1.5">
                  <span>📝 Modifier le Dossier Enseignant</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Modifiez les données contractuelles et administratives de l'enseignant.
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setEditingTeacher(null)}
                className="text-slate-400 hover:text-slate-655 cursor-pointer p-1.5 rounded-lg hover:bg-slate-100 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTeacherEdit} className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Identifiant unique (Lecture seule)</label>
                <input 
                  type="text" 
                  disabled
                  value={editForm.id}
                  className="w-full px-3 py-1.5 bg-slate-200 border border-slate-350 rounded-xl text-xs font-mono font-bold text-slate-500 cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Nom complet & titre</label>
                <input 
                  type="text" 
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Courriel professionnel</label>
                <input 
                  type="email" 
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => prev ? ({ ...prev, email: e.target.value }) : null)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Téléphone Mobile</label>
                  <input 
                    type="text" 
                    value={editForm.phone}
                    onChange={(e) => setEditForm(prev => prev ? ({ ...prev, phone: e.target.value }) : null)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Charge Max (heures/sem.)</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="40" 
                    value={editForm.maxHours}
                    onChange={(e) => setEditForm(prev => prev ? ({ ...prev, maxHours: parseInt(e.target.value) || 18 }) : null)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Type de Contrat</label>
                  <select
                    value={editForm.contractType}
                    onChange={(e) => setEditForm(prev => prev ? ({ ...prev, contractType: e.target.value as any }) : null)}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                  >
                    <option value="Permanent (CDI)">Permanent (CDI)</option>
                    <option value="Vacataire (Horaire)">Vacataire (Horaire)</option>
                    <option value="CDD Temporaire">CDD Temporaire</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Salaire Base / Taux Horaire (FCFA)</label>
                  <input 
                    type="number" 
                    value={editForm.monthlyBaseSalary}
                    onChange={(e) => setEditForm(prev => prev ? ({ ...prev, monthlyBaseSalary: parseInt(e.target.value) || 150000 }) : null)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Date de recrutement</label>
                  <input 
                    type="date" 
                    value={editForm.hiredDate}
                    onChange={(e) => setEditForm(prev => prev ? ({ ...prev, hiredDate: e.target.value }) : null)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Couleur</label>
                  <select
                    value={editForm.color}
                    onChange={(e) => setEditForm(prev => prev ? ({ ...prev, color: e.target.value }) : null)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  >
                    <option value="indigo">Indigo</option>
                    <option value="emerald">Vert Émeraude</option>
                    <option value="teal">Sarcelle (Teal)</option>
                    <option value="rose">Rose</option>
                    <option value="amber">Ambre</option>
                    <option value="violet">Violet</option>
                    <option value="slate">Ardoise</option>
                  </select>
                </div>
              </div>

              {/* Subject qualification checkboxes list */}
              <div className="space-y-1.5 pt-1.5 border-t border-slate-100">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Matières de spécialisation</label>
                <div className="flex flex-wrap gap-1.5 max-h-[85px] overflow-y-auto pt-1">
                  {subjects.map(s => {
                    const isSelected = editForm.selectedSubjects.includes(s.id);
                    return (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => {
                          setEditForm(prev => {
                            if (!prev) return null;
                            const exists = prev.selectedSubjects.includes(s.id);
                            const next = exists 
                              ? prev.selectedSubjects.filter(id => id !== s.id)
                              : [...prev.selectedSubjects, s.id];
                            return { ...prev, selectedSubjects: next };
                          });
                        }}
                        className={`cursor-pointer px-2 py-1 border rounded-lg text-[10px] font-bold transition ${
                          isSelected ? 'bg-indigo-600 text-white border-indigo-650' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {s.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-150">
                <button 
                  type="button" 
                  onClick={() => setEditingTeacher(null)}
                  className="cursor-pointer px-4.5 py-2 hover:bg-slate-100 text-slate-655 rounded-xl text-xs font-bold transition border border-slate-200"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="cursor-pointer px-5 py-2 bg-[#ee7b11] hover:bg-[#d66f0e] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm"
                >
                  <Check className="h-4 w-4" />
                  Sauvegarder les modifications
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
