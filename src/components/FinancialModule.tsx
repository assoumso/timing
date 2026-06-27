import React, { useState, useEffect } from 'react';
import { 
  Banknote, 
  Plus, 
  Trash2, 
  Check, 
  Printer, 
  Percent, 
  Users, 
  FileSpreadsheet, 
  Activity,
  Award,
  Sliders,
  UserCheck,
  Calendar,
  AlertTriangle,
  Send,
  Copy,
  Mail,
  ExternalLink,
  MessageSquare,
  TrendingUp,
  ShieldCheck,
  Scissors
} from 'lucide-react';
import { ClassItem } from '../types';

interface FinancialModuleProps {
  classes: ClassItem[];
  schoolName: string;
  schoolSubName: string;
  schoolMotto: string;
  academicYear: string;
  schoolDirector: string;
}

interface FeeInstallment {
  label: string; // Ex: "1er Versement (Rentrée)"
  amount: number;
  dueDate: string;
}

interface TuitionFeeRate {
  classId: string;
  className: string;
  amountNonAffecte: number;
  amountAffecte: number;
  installmentsNonAffecte: FeeInstallment[];
}

interface PaymentTransaction {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  amount: number;
  paymentMethod: 'Cash (Caisse)' | 'Wave Mobile' | 'Orange Money' | 'Virement Bancaire';
  refNo: string;
  recordedAt: string;
  receiptNo: string;
}

interface StudentRecord {
  id: string;
  firstName: string;
  lastName: string;
  gender: 'M' | 'F';
  classId: string;
  status: string;
  matricule: string;
  assignmentStatus?: 'Affecté' | 'Non Affecté';
  tutorName?: string;
  tutorPhone?: string;
  birthCertNumber?: string;
  birthCertDate?: string;
  birthCertPlace?: string;
}

interface ReminderLog {
  id: string;
  studentId: string;
  studentName: string;
  sentAt: string;
  method: 'SMS' | 'WhatsApp' | 'Courrier A4';
  message: string;
}

export default function FinancialModule({
  classes,
  schoolName,
  schoolSubName,
  schoolMotto,
  academicYear,
  schoolDirector
}: FinancialModuleProps) {
  
  const [studentList, setStudentList] = useState<StudentRecord[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'billing' | 'txn_log' | 'fee_setup' | 'reminders'>('billing');
  const [selectedStudentIdForDetail, setSelectedStudentIdForDetail] = useState<string>('std_1');

  // Popup modal for payment notification after creation
  const [notificationModal, setNotificationModal] = useState<{
    isOpen: boolean;
    studentName: string;
    amount: number;
    receiptNo: string;
    tutorName: string;
    tutorPhone: string;
    balanceRemaining: number;
    classId: string;
  } | null>(null);

  // Reminder logs state
  const [reminderLogs, setReminderLogs] = useState<ReminderLog[]>(() => {
    const saved = localStorage.getItem('erp_payment_reminders_log');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('erp_payment_reminders_log', JSON.stringify(reminderLogs));
  }, [reminderLogs]);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = () => {
    const saved = localStorage.getItem('erp_student_records');
    if (saved) {
      const parsed = JSON.parse(saved);
      const initialized = parsed.map((s: any) => ({
        ...s,
        assignmentStatus: s.assignmentStatus || 'Non Affecté',
        tutorName: s.tutorName || 'Parent d’élève',
        tutorPhone: s.tutorPhone || '+225 01 02 03 04 05'
      }));
      setStudentList(initialized);
      if (initialized.length > 0) {
        setSelectedStudentIdForDetail(initialized[0].id);
      }
    } else {
      const defaults: StudentRecord[] = [
        { id: 'std_1', firstName: 'Koffi', lastName: 'Yao Anderson', gender: 'M', classId: '6A', status: 'Inscrit', matricule: 'M-2026-4102', assignmentStatus: 'Non Affecté', tutorName: 'Koffi Blaise', tutorPhone: '+225 07 41 85 96 03' },
        { id: 'std_2', firstName: 'Diomandé', lastName: 'Aminata', gender: 'F', classId: '6B', status: 'Réinscrit', matricule: 'M-2024-1185', assignmentStatus: 'Affecté', tutorName: 'Diomandé Lanciné', tutorPhone: '+225 05 52 41 12 74' },
        { id: 'std_3', firstName: 'Kouassi', lastName: 'Koffi Charles', gender: 'M', classId: '3A', status: 'Inscrit', matricule: 'M-2026-9981', assignmentStatus: 'Non Affecté', tutorName: 'Mme Kouassi Hortense', tutorPhone: '+225 07 09 85 12 43' },
        { id: 'std_4', firstName: 'Sylla', lastName: 'Ibrahim Karim', gender: 'M', classId: '3B', status: 'Réinscrit', matricule: 'M-2023-0056', assignmentStatus: 'Affecté', tutorName: 'Sylla Fatoumata', tutorPhone: '+225 01 02 03 04 05' },
        { id: 'std_5', firstName: 'Gomez', lastName: 'Marie-Chantal Enola', gender: 'F', classId: '3A', status: 'Inscrit', matricule: 'M-2026-0103', assignmentStatus: 'Non Affecté', tutorName: 'Gomez Robert (Ambass.)', tutorPhone: '+225 07 41 02 85 96' }
      ];
      setStudentList(defaults);
      localStorage.setItem('erp_student_records', JSON.stringify(defaults));
      setSelectedStudentIdForDetail('std_1');
    }
  };

  const updateStudentAssignmentStatus = (studentId: string, status: 'Affecté' | 'Non Affecté') => {
    const updated = studentList.map(s => {
      if (s.id === studentId) {
        return { ...s, assignmentStatus: status };
      }
      return s;
    });
    setStudentList(updated);
    localStorage.setItem('erp_student_records', JSON.stringify(updated));
  };

  // Fees schedule rates per class
  const [feeSchedule, setFeeSchedule] = useState<TuitionFeeRate[]>(() => {
    const saved = localStorage.getItem('erp_fees_schedule_v3');
    if (saved) return JSON.parse(saved);
    return [
      { 
        classId: '6A', 
        className: 'Sixième A', 
        amountNonAffecte: 180000, 
        amountAffecte: 15000,
        installmentsNonAffecte: [
          { label: 'Inscription / 1er Versement', amount: 80000, dueDate: '2026-09-15' },
          { label: '2ème Versement', amount: 50000, dueDate: '2026-12-15' },
          { label: '3ème Versement', amount: 50000, dueDate: '2027-03-15' }
        ]
      },
      { 
        classId: '6B', 
        className: 'Sixième B', 
        amountNonAffecte: 180000, 
        amountAffecte: 15000,
        installmentsNonAffecte: [
          { label: 'Inscription / 1er Versement', amount: 80000, dueDate: '2026-09-15' },
          { label: '2ème Versement', amount: 50000, dueDate: '2026-12-15' },
          { label: '3ème Versement', amount: 50000, dueDate: '2027-03-15' }
        ]
      },
      { 
        classId: '3A', 
        className: 'Troisième A', 
        amountNonAffecte: 250000, 
        amountAffecte: 25000,
        installmentsNonAffecte: [
          { label: 'Inscription / 1er Versement', amount: 100000, dueDate: '2026-09-15' },
          { label: '2ème Versement', amount: 80000, dueDate: '2026-12-15' },
          { label: '3ème Versement', amount: 70000, dueDate: '2027-03-15' }
        ]
      },
      { 
        classId: '3B', 
        className: 'Troisième B', 
        amountNonAffecte: 250000, 
        amountAffecte: 25000,
        installmentsNonAffecte: [
          { label: 'Inscription / 1er Versement', amount: 100000, dueDate: '2026-09-15' },
          { label: '2ème Versement', amount: 80000, dueDate: '2026-12-15' },
          { label: '3ème Versement', amount: 70000, dueDate: '2027-03-15' }
        ]
      }
    ];
  });

  // Scholars & discounts table
  const [studentDiscounts, setStudentDiscounts] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('erp_student_discount_rates');
    return saved ? JSON.parse(saved) : {
      'std_5': 50
    };
  });

  // Persistent payment ledger
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(() => {
    const saved = localStorage.getItem('erp_billing_transactions');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'txn_1', studentId: 'std_1', studentName: 'YAO Koffi Anderson', classId: '6A', amount: 100000, paymentMethod: 'Wave Mobile', refNo: 'WAVE-TX-998812', recordedAt: '2026-06-02', receiptNo: 'R-2026-0032' },
      { id: 'txn_2', studentId: 'std_2', studentName: 'DIOMANDÉ Aminata', classId: '6B', amount: 15000, paymentMethod: 'Cash (Caisse)', refNo: 'CAISSE-DIRECT-85', recordedAt: '2026-06-10', receiptNo: 'R-2026-0045' },
      { id: 'txn_3', studentId: 'std_5', studentName: 'GOMEZ Marie-Chantal Enola', classId: '3A', amount: 125000, paymentMethod: 'Virement Bancaire', refNo: 'SIB-VIR-001295', recordedAt: '2026-06-14', receiptNo: 'R-2026-0062' }
    ];
  });

  // Save changes
  useEffect(() => {
    localStorage.setItem('erp_fees_schedule_v3', JSON.stringify(feeSchedule));
  }, [feeSchedule]);

  useEffect(() => {
    localStorage.setItem('erp_student_discount_rates', JSON.stringify(studentDiscounts));
  }, [studentDiscounts]);

  useEffect(() => {
    localStorage.setItem('erp_billing_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Selection pointer for receipts
  const [activeTxnId, setActiveTxnId] = useState('txn_1');

  // Payment register form state
  const [payForm, setPayForm] = useState({
    studentId: 'std_1',
    amount: 15000,
    paymentMethod: 'Wave Mobile' as any,
    refNo: ''
  });

  // Register collection payment
  const handleRegisterPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const student = studentList.find(s => s.id === payForm.studentId);
    if (!student) {
      alert("Élève invalide ou introuvable !");
      return;
    }

    const payAmt = parseInt(String(payForm.amount));
    if (isNaN(payAmt) || payAmt <= 0) {
      alert("Le montant doit s'élever au-delà de 0 FCFA !");
      return;
    }

    const uniqueReceiptNo = 'R-' + academicYear.split('-')[0] + '-' + Math.floor(10000 + Math.random() * 90000);
    const resolvedRef = payForm.refNo.trim() || 'REF-C' + Math.floor(1000 + Math.random() * 9000);

    const newTxn: PaymentTransaction = {
      id: 'txn_' + Date.now(),
      studentId: payForm.studentId,
      studentName: `${student.lastName} ${student.firstName}`,
      classId: student.classId,
      amount: payAmt,
      paymentMethod: payForm.paymentMethod,
      refNo: resolvedRef,
      recordedAt: new Date().toISOString().split('T')[0],
      receiptNo: uniqueReceiptNo
    };

    // Calculate temporary updated total paid to get real-time remaining balance
    const bill = getStudentBillingSheet(payForm.studentId, student.classId);
    const totalPaidAfterThisTxn = bill.totalPaid + payAmt;
    const balanceRemainingAfterThisTxn = Math.max(0, bill.finalInvoiceDue - totalPaidAfterThisTxn);

    // Save transaction
    setTransactions(prev => [newTxn, ...prev]);
    setActiveTxnId(newTxn.id);

    // Open communication panel popup
    setNotificationModal({
      isOpen: true,
      studentName: `${student.lastName} ${student.firstName}`,
      amount: payAmt,
      receiptNo: uniqueReceiptNo,
      tutorName: student.tutorName || 'Parent d’élève',
      tutorPhone: student.tutorPhone || '',
      balanceRemaining: balanceRemainingAfterThisTxn,
      classId: student.classId
    });

    setPayForm(prev => ({
      ...prev,
      amount: 15000,
      refNo: ''
    }));
  };

  const handleDeleteTxn = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir l'annulation comptable de cette transaction ?")) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  // Math helper logic to compute student billing state
  const getStudentBillingSheet = (studentId: string, classId: string) => {
    const student = studentList.find(s => s.id === studentId);
    const assignment = student?.assignmentStatus || 'Non Affecté';

    const matchedFeeSchedule = feeSchedule.find(f => f.classId === classId);
    let baseFee = 200000;
    let rawInstallments: FeeInstallment[] = [];
    
    if (matchedFeeSchedule) {
      baseFee = assignment === 'Affecté' ? matchedFeeSchedule.amountAffecte : matchedFeeSchedule.amountNonAffecte;
      rawInstallments = matchedFeeSchedule.installmentsNonAffecte || [];
    } else {
      baseFee = assignment === 'Affecté' ? 20000 : 200000;
    }
    
    // Check discount
    const discountPercent = studentDiscounts[studentId] || 0;
    const finalInvoiceDue = Math.round(baseFee * (1 - discountPercent / 100));

    // Sum total paid
    const studentTxns = transactions.filter(t => t.studentId === studentId);
    const totalPaid = studentTxns.reduce((sum, t) => sum + t.amount, 0);
    const balanceRemaining = Math.max(0, finalInvoiceDue - totalPaid);

    // Calculate details for each installment
    const processedInstallments = rawInstallments.map((inst, index) => {
      const discountedInstallmentAmt = Math.round(inst.amount * (1 - discountPercent / 100));
      
      let cumulativeTarget = 0;
      for (let i = 0; i <= index; i++) {
        cumulativeTarget += Math.round(rawInstallments[i].amount * (1 - discountPercent / 100));
      }

      const prevCumulativeTarget = cumulativeTarget - discountedInstallmentAmt;

      let status: 'Payé' | 'Partiel' | 'En attente' | 'En retard' = 'En attente';
      let paidForThisInst = 0;

      if (totalPaid >= cumulativeTarget) {
        status = 'Payé';
        paidForThisInst = discountedInstallmentAmt;
      } else if (totalPaid > prevCumulativeTarget) {
        status = 'Partiel';
        paidForThisInst = totalPaid - prevCumulativeTarget;
      } else {
        status = 'En attente';
        paidForThisInst = 0;
      }

      const isPastDue = new Date(inst.dueDate).getTime() < new Date().getTime();
      if (status !== 'Payé' && isPastDue) {
        status = 'En retard';
      }

      return {
        ...inst,
        discountedAmount: discountedInstallmentAmt,
        paidAmount: paidForThisInst,
        remainingAmount: Math.max(0, discountedInstallmentAmt - paidForThisInst),
        status
      };
    });

    return {
      baseFee,
      assignmentStatus: assignment,
      discountPercent,
      finalInvoiceDue,
      totalPaid,
      balanceRemaining,
      isFullyPaid: totalPaid >= finalInvoiceDue,
      installments: processedInstallments
    };
  };

  const selectedTxnObj = transactions.find(t => t.id === activeTxnId) || transactions[0];
  const selectedTxnStudentBilling = selectedTxnObj 
    ? getStudentBillingSheet(selectedTxnObj.studentId, selectedTxnObj.classId) 
    : null;

  // Selected student for detail breakdown in left directory
  const detailStudent = studentList.find(s => s.id === selectedStudentIdForDetail);
  const detailStudentBilling = detailStudent 
    ? getStudentBillingSheet(detailStudent.id, detailStudent.classId) 
    : null;

  // Global collection stats
  const globalTotalCollected = transactions.reduce((sum, t) => sum + t.amount, 0);

  // Helper to append / update custom installments
  const handleUpdateInstallment = (classId: string, index: number, field: keyof FeeInstallment, val: string | number) => {
    const updatedSchedule = feeSchedule.map(rate => {
      if (rate.classId === classId) {
        const copyInst = [...rate.installmentsNonAffecte];
        copyInst[index] = {
          ...copyInst[index],
          [field]: field === 'amount' ? Number(val) : val
        };

        const sumOfInstallments = copyInst.reduce((sum, inst) => sum + inst.amount, 0);

        return {
          ...rate,
          installmentsNonAffecte: copyInst,
          amountNonAffecte: sumOfInstallments
        };
      }
      return rate;
    });
    setFeeSchedule(updatedSchedule);
  };

  const handleAddInstallmentRow = (classId: string) => {
    const updatedSchedule = feeSchedule.map(rate => {
      if (rate.classId === classId) {
        const newInst: FeeInstallment = {
          label: `Versement ${rate.installmentsNonAffecte.length + 1}`,
          amount: 30000,
          dueDate: new Date().toISOString().split('T')[0]
        };
        const updatedInsts = [...rate.installmentsNonAffecte, newInst];
        const sum = updatedInsts.reduce((s, i) => s + i.amount, 0);
        return {
          ...rate,
          installmentsNonAffecte: updatedInsts,
          amountNonAffecte: sum
        };
      }
      return rate;
    });
    setFeeSchedule(updatedSchedule);
  };

  const handleRemoveInstallmentRow = (classId: string, index: number) => {
    const updatedSchedule = feeSchedule.map(rate => {
      if (rate.classId === classId) {
        const updatedInsts = rate.installmentsNonAffecte.filter((_, idx) => idx !== index);
        const sum = updatedInsts.reduce((s, i) => s + i.amount, 0);
        return {
          ...rate,
          installmentsNonAffecte: updatedInsts,
          amountNonAffecte: sum
        };
      }
      return rate;
    });
    setFeeSchedule(updatedSchedule);
  };

  // ----------------------------------------------------
  // Relances & Retards (Reminders Panel) Logic
  // ----------------------------------------------------
  const [selectedReminderStudentId, setSelectedReminderStudentId] = useState<string>('');
  
  const getRemindersScannerList = () => {
    const list: any[] = [];
    studentList.forEach(std => {
      if (std.assignmentStatus === 'Affecté') return;
      
      const bill = getStudentBillingSheet(std.id, std.classId);
      
      bill.installments.forEach(inst => {
        if (inst.status === 'Payé') return;
        
        const limitTime = new Date(inst.dueDate).getTime();
        const nowTime = new Date().getTime();
        const daysRemaining = Math.ceil((limitTime - nowTime) / (1000 * 60 * 60 * 24));
        
        if (daysRemaining <= 7) {
          list.push({
            studentId: std.id,
            studentName: `${std.lastName} ${std.firstName}`,
            classId: std.classId,
            matricule: std.matricule,
            tutorName: std.tutorName || 'Parent',
            tutorPhone: std.tutorPhone || '',
            installmentLabel: inst.label,
            dueDate: inst.dueDate,
            dueAmount: inst.discountedAmount,
            remainingAmount: inst.remainingAmount,
            status: inst.status,
            daysRemaining
          });
        }
      });
    });
    return list;
  };

  const scannerList = getRemindersScannerList();

  const handleSendReminderLog = (studentId: string, method: 'SMS' | 'WhatsApp' | 'Courrier A4', msg: string) => {
    const student = studentList.find(s => s.id === studentId);
    if (!student) return;

    const newLog: ReminderLog = {
      id: 'rem_' + Date.now(),
      studentId,
      studentName: `${student.lastName} ${student.firstName}`,
      sentAt: new Date().toLocaleDateString('fr-FR') + ' ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      method,
      message: msg
    };

    setReminderLogs(prev => [newLog, ...prev]);
    alert(`Relance (${method}) enregistrée pour ${newLog.studentName}.`);
  };

  const getReminderTemplateMessage = (item: any) => {
    return `Cher parent ${item.tutorName}, nous vous informons que la scolarité de votre enfant ${item.studentName} (${item.classId}), matricule ${item.matricule}, présente un solde restant de ${item.remainingAmount.toLocaleString()} FCFA pour la tranche "${item.installmentLabel}" qui était attendue le ${new Date(item.dueDate).toLocaleDateString('fr-FR')}. Merci de régulariser ce paiement dans les plus brefs délais à la caisse de l'école. Cordialement, la direction de ${schoolName}.`;
  };

  const activeReminderItem = scannerList.find(x => x.studentId === selectedReminderStudentId);

  // ----------------------------------------------------
  // Global Summary Ledger (expected, paid, remaining, execution rates)
  // ----------------------------------------------------
  const calculateGlobalSummaryLedger = () => {
    let expectedEnrollment = 0;
    let expectedTuition = 0;
    
    let paidEnrollment = 0;
    let paidTuition = 0;

    studentList.forEach(std => {
      const bill = getStudentBillingSheet(std.id, std.classId);
      
      if (std.assignmentStatus === 'Affecté') {
        expectedEnrollment += bill.finalInvoiceDue;
        paidEnrollment += Math.min(bill.totalPaid, bill.finalInvoiceDue);
      } else {
        const firstInst = bill.installments[0];
        const firstInstExpected = firstInst ? firstInst.discountedAmount : 0;
        
        expectedEnrollment += firstInstExpected;
        expectedTuition += Math.max(0, bill.finalInvoiceDue - firstInstExpected);

        paidEnrollment += Math.min(bill.totalPaid, firstInstExpected);
        paidTuition += Math.max(0, bill.totalPaid - firstInstExpected);
      }
    });

    const totalExpected = expectedEnrollment + expectedTuition;
    const totalPaid = paidEnrollment + paidTuition;

    const remainingEnrollment = Math.max(0, expectedEnrollment - paidEnrollment);
    const remainingTuition = Math.max(0, expectedTuition - paidTuition);
    const totalRemaining = Math.max(0, totalExpected - totalPaid);

    const rateEnrollment = expectedEnrollment > 0 ? Math.round((paidEnrollment / expectedEnrollment) * 100) : 100;
    const rateTuition = expectedTuition > 0 ? Math.round((paidTuition / expectedTuition) * 100) : 100;
    const rateTotal = totalExpected > 0 ? Math.round((totalPaid / totalExpected) * 100) : 100;

    return {
      expectedEnrollment,
      expectedTuition,
      totalExpected,
      paidEnrollment,
      paidTuition,
      totalPaid,
      remainingEnrollment,
      remainingTuition,
      totalRemaining,
      rateEnrollment,
      rateTuition,
      rateTotal
    };
  };

  const ledgerSummary = calculateGlobalSummaryLedger();

  // Helper to generate the exact payment confirmation message text
  const getPaymentConfirmationMessage = (data: typeof notificationModal) => {
    if (!data) return '';
    return `Cher parent ${data.tutorName}, nous accusons réception avec succès du versement de ${data.amount.toLocaleString()} FCFA effectué ce jour pour la scolarité de votre enfant ${data.studentName} (${data.classId}). Reçu officiel n° ${data.receiptNo} enregistré. Reliquat restant : ${data.balanceRemaining.toLocaleString()} FCFA. Merci de votre confiance. La direction de ${schoolName}.`;
  };

  return (
    <div className="space-y-6">
      
      {/* 🚀 Real-time WhatsApp/SMS payment confirmation popup */}
      {notificationModal && notificationModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-2.5 text-emerald-700">
              <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center">
                <Check className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-black uppercase text-slate-800">Versement enregistré avec succès !</h4>
                <p className="text-[10px] text-slate-500 font-medium">Reçu n° {notificationModal.receiptNo} • {notificationModal.amount.toLocaleString()} FCFA</p>
              </div>
            </div>

            <div className="space-y-1.5 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="text-[9px] font-black text-slate-400 block uppercase">Texte à notifier au Parent ({notificationModal.tutorName})</span>
              <p className="text-xs font-semibold text-slate-700 leading-relaxed font-sans">
                {getPaymentConfirmationMessage(notificationModal)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button 
                onClick={() => {
                  const msgText = encodeURIComponent(getPaymentConfirmationMessage(notificationModal));
                  const cleanPhone = notificationModal.tutorPhone.replace(/[\s+]/g, '');
                  window.open(`https://wa.me/${cleanPhone}?text=${msgText}`, '_blank');
                }}
                className="cursor-pointer py-2 bg-emerald-600 hover:bg-emerald-750 text-white text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition"
              >
                <MessageSquare className="h-4 w-4" />
                Envoyer via WhatsApp
              </button>

              <button 
                onClick={() => {
                  navigator.clipboard.writeText(getPaymentConfirmationMessage(notificationModal));
                  alert("Message copié dans le presse-papiers (SMS prêt) !");
                }}
                className="cursor-pointer py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition"
              >
                <Copy className="h-4 w-4" />
                Copier le SMS
              </button>
            </div>

            <div className="text-center pt-2">
              <button 
                onClick={() => setNotificationModal(null)}
                className="cursor-pointer text-xs font-bold text-slate-400 hover:text-slate-600 underline"
              >
                Fermer cette fenêtre
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-light print:hidden">
        <div>
          <h2 className="text-xl font-black text-slate-905 tracking-tight flex items-center gap-2">
            <Banknote className="h-5.5 w-5.5 text-indigo-650" />
            <span>Gestion Financière & Recouvrement Scolarités</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Pilotez la caisse : configurez les tarifs d'écolage par niveau (élèves affectés par l'état vs élèves privés non affectés), planifiez l'échéancier des versements et gérez les relances.
          </p>
        </div>

        {/* Sub menu controls */}
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveSubTab('billing')}
            className={`cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'billing' ? 'bg-[#0b4998] text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <Users className="h-4 w-4" />
            Registre Factures Élèves
          </button>
          <button 
            onClick={() => setActiveSubTab('txn_log')}
            className={`cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'txn_log' ? 'bg-[#0b4998] text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Livre de Caisse & Reçus
          </button>
          <button 
            onClick={() => setActiveSubTab('fee_setup')}
            className={`cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'fee_setup' ? 'bg-[#0b4998] text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <Percent className="h-4 w-4" />
            Grille des Versements
          </button>
          <button 
            onClick={() => setActiveSubTab('reminders')}
            className={`cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'reminders' ? 'bg-[#0b4998] text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Relances & Retards
          </button>
        </div>
      </div>

      {/* RENDER VIEW: CENTRAL BILLING DIRECTORY & DISMISSION */}
      {activeSubTab === 'billing' && (
        <div className="space-y-6 print:hidden">
          
          {/* Global Summary Table / Ledger Dashboard */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="text-xs font-black uppercase text-[#0b4998] tracking-widest flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#ee7b11]" />
                <span>Tableau Synthétique Global du Recouvrement</span>
              </h3>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-black font-mono">
                Année Scolaire {academicYear}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
              
              {/* Financial metrics breakdown table (8 cols) */}
              <div className="lg:col-span-8 overflow-hidden rounded-2xl border border-slate-150">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 border-b border-slate-250 font-bold">
                      <th className="p-3">Rubrique de Caisse</th>
                      <th className="p-3 text-right">Montant Attendu</th>
                      <th className="p-3 text-right text-emerald-800">Montant Encaissé (Payé)</th>
                      <th className="p-3 text-right text-rose-750">Reste à Recouvrer</th>
                      <th className="p-3 text-center">Taux d'Exécution</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100 hover:bg-slate-50/40">
                      <td className="p-3 font-extrabold text-slate-700">Droits d'Inscription</td>
                      <td className="p-3 text-right font-mono font-bold">{ledgerSummary.expectedEnrollment.toLocaleString()} FCFA</td>
                      <td className="p-3 text-right font-mono font-black text-emerald-855">+{ledgerSummary.paidEnrollment.toLocaleString()} FCFA</td>
                      <td className="p-3 text-right font-mono font-bold text-rose-750">{ledgerSummary.remainingEnrollment.toLocaleString()} FCFA</td>
                      <td className="p-3 text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-indigo-600 h-full" style={{ width: `${ledgerSummary.rateEnrollment}%` }}></div>
                          </div>
                          <span className="font-black text-indigo-700 w-8 text-right font-mono">{ledgerSummary.rateEnrollment}%</span>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100 hover:bg-slate-50/40">
                      <td className="p-3 font-extrabold text-slate-700">Frais de Scolarité</td>
                      <td className="p-3 text-right font-mono font-bold">{ledgerSummary.expectedTuition.toLocaleString()} FCFA</td>
                      <td className="p-3 text-right font-mono font-black text-emerald-855">+{ledgerSummary.paidTuition.toLocaleString()} FCFA</td>
                      <td className="p-3 text-right font-mono font-bold text-rose-750">{ledgerSummary.remainingTuition.toLocaleString()} FCFA</td>
                      <td className="p-3 text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-[#ee7b11] h-full" style={{ width: `${ledgerSummary.rateTuition}%` }}></div>
                          </div>
                          <span className="font-black text-[#ee7b11] w-8 text-right font-mono">{ledgerSummary.rateTuition}%</span>
                        </div>
                      </td>
                    </tr>
                    <tr className="bg-slate-100/50 font-black">
                      <td className="p-3 text-[#0b4998] uppercase">Total Général</td>
                      <td className="p-3 text-right font-mono text-[#0b4998]">{ledgerSummary.totalExpected.toLocaleString()} FCFA</td>
                      <td className="p-3 text-right font-mono text-emerald-800">+{ledgerSummary.totalPaid.toLocaleString()} FCFA</td>
                      <td className="p-3 text-right font-mono text-rose-750">{ledgerSummary.totalRemaining.toLocaleString()} FCFA</td>
                      <td className="p-3 text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-20 bg-slate-200 h-2.5 rounded-full overflow-hidden">
                            <div className="bg-emerald-600 h-full" style={{ width: `${ledgerSummary.rateTotal}%` }}></div>
                          </div>
                          <span className="font-extrabold text-emerald-800 w-8 text-right font-mono">{ledgerSummary.rateTotal}%</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Graphical Card (4 cols) */}
              <div className="lg:col-span-4 bg-[#0b4998]/5 border border-[#0b4998]/20 rounded-2xl p-4 space-y-3 flex flex-col justify-between h-full min-h-[140px]">
                <div>
                  <span className="text-[10px] uppercase font-black text-indigo-755 block">Indice de Recouvrement</span>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Le taux global d'exécution est à <strong className="text-[#0b4998]">{ledgerSummary.rateTotal}%</strong> avec un restant à recouvrer total de <strong className="text-rose-755">{ledgerSummary.totalRemaining.toLocaleString()} FCFA</strong>.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <ShieldCheck className="h-5.5 w-5.5" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Caisse Établissement</span>
                    <strong className="text-slate-800 font-mono font-black">{ledgerSummary.totalPaid.toLocaleString()} FCFA Encaissés</strong>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Cashier Payment Form & Installment Status Detail (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Cashier entry */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
                <h3 className="text-xs font-black uppercase text-[#0b4998] tracking-widest flex items-center gap-1.5">
                  <span>Encaissement Versement</span>
                </h3>

                <form onSubmit={handleRegisterPayment} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Élève Payeur</label>
                    <select
                      value={payForm.studentId}
                      onChange={(e) => setPayForm(prev => ({ ...prev, studentId: e.target.value }))}
                      className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                    >
                      {studentList.map(s => {
                        const matchedClass = classes.find(c => c.id === s.classId)?.name || s.classId;
                        const statusText = s.assignmentStatus === 'Affecté' ? 'Affecté État' : 'Privé';
                        return (
                          <option key={s.id} value={s.id}>{s.lastName} {s.firstName} ({matchedClass} - {statusText})</option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Montant Versé (FCFA)</label>
                    <input 
                      type="number" 
                      step="5000"
                      required
                      placeholder="ex: 15000"
                      value={payForm.amount}
                      onChange={(e) => setPayForm(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Mode paiement</label>
                      <select
                        value={payForm.paymentMethod}
                        onChange={(e) => setPayForm(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
                        className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                      >
                        <option value="Cash (Caisse)">Cash (Caisse)</option>
                        <option value="Wave Mobile">Wave Mobile</option>
                        <option value="Orange Money">Orange Money</option>
                        <option value="Virement Bancaire">Virement Bancaire</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Réf. transaction</label>
                      <input 
                        type="text" 
                        placeholder="W-4981"
                        value={payForm.refNo}
                        onChange={(e) => setPayForm(prev => ({ ...prev, refNo: e.target.value }))}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="cursor-pointer w-full py-2 bg-[#ee7b11] hover:bg-[#d66f0e] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition pt-2"
                >
                  <Banknote className="h-4 w-4" />
                  Valider l'Écrit de Caisse
                </button>
              </form>
            </div>

            {/* Installment details for selected student */}
            {detailStudent && detailStudentBilling && (
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
                  <h4 className="text-xs font-black uppercase text-slate-755">
                    Échéancier de Versements : {detailStudent.lastName} {detailStudent.firstName}
                  </h4>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                    detailStudent.assignmentStatus === 'Affecté' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-900 text-white'
                  }`}>
                    {detailStudent.assignmentStatus === 'Affecté' ? 'Affecté' : 'Élève Privé'}
                  </span>
                </div>

                {detailStudent.assignmentStatus === 'Affecté' ? (
                  <p className="text-xs text-slate-500 leading-normal italic bg-slate-50 p-3 rounded-xl border border-slate-200">
                    Les élèves affectés par l'État bénéficient d'un tarif forfaitaire subventionné et ne sont pas soumis à l'échéancier des versements trimestriels privés.
                  </p>
                ) : detailStudentBilling.installments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-4">Aucun versement planifié pour cette classe.</p>
                ) : (
                  <div className="space-y-3">
                    {detailStudentBilling.installments.map((inst, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-extrabold text-slate-800 text-xs block">{inst.label}</span>
                            <span className="text-[10px] text-slate-455 font-bold block flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-slate-400" />
                              Limite : {new Date(inst.dueDate).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            inst.status === 'Payé' ? 'bg-emerald-100 text-emerald-800' :
                            inst.status === 'Partiel' ? 'bg-amber-100 text-amber-800' :
                            inst.status === 'En retard' ? 'bg-rose-100 text-rose-800 animate-pulse border border-rose-200' :
                            'bg-slate-100 text-slate-500'
                          }`}>
                            {inst.status === 'Payé' ? 'Payé' :
                             inst.status === 'Partiel' ? 'Partiel' :
                             inst.status === 'En retard' ? 'En Retard ⚠️' :
                             'En attente'}
                          </span>
                        </div>

                        <div className="flex justify-between text-[11px] font-mono border-t border-slate-200/60 pt-1.5">
                          <div>
                            <span className="text-slate-400 font-bold">Attendu : </span>
                            <strong className="text-slate-850 font-black">{inst.discountedAmount.toLocaleString()} FCFA</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 font-bold">Payé : </span>
                            <strong className="text-emerald-700 font-black">{inst.paidAmount.toLocaleString()} FCFA</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 font-bold">Reste : </span>
                            <strong className={inst.remainingAmount > 0 ? "text-rose-700 font-black" : "text-slate-700 font-black"}>
                              {inst.remainingAmount.toLocaleString()} FCFA
                            </strong>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right student accounting directory (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-5 shadow-xs overflow-hidden space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black text-slate-905 uppercase tracking-tight">Dossier de Facturation Élèves ({studentList.length})</h3>
              <span className="text-[10.5px] bg-slate-900 text-white px-2.5 py-0.5 rounded-full font-bold">Total Encaissé : {globalTotalCollected.toLocaleString()} FCFA</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-150">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-450 border-b border-slate-250 font-black">
                    <th className="p-2.5">Matricule</th>
                    <th className="p-2.5">Nom d'Élève</th>
                    <th className="p-2.5">Classe</th>
                    <th className="p-2.5 w-28 text-center">Type</th>
                    <th className="p-2.5 text-right">Scolarité Dûe</th>
                    <th className="p-2.5 text-right text-emerald-800">Payé</th>
                    <th className="p-2.5 text-right text-red-750">Reste</th>
                    <th className="p-2.5 text-center">Fiche</th>
                  </tr>
                </thead>
                <tbody>
                  {studentList.map(std => {
                    const bill = getStudentBillingSheet(std.id, std.classId);
                    const isSelectedDetail = selectedStudentIdForDetail === std.id;
                    
                    return (
                      <tr 
                        key={std.id} 
                        onClick={() => setSelectedStudentIdForDetail(std.id)}
                        className={`border-b border-slate-100 hover:bg-slate-50/50 transition cursor-pointer ${
                          isSelectedDetail ? 'bg-indigo-50/40' : ''
                        }`}
                      >
                        <td className="p-2.5 font-mono text-[#0b4998] font-bold">{std.matricule}</td>
                        <td className="p-2.5 font-extrabold text-slate-850 uppercase leading-none">
                          {std.lastName} {std.firstName}
                        </td>
                        <td className="p-2.5 font-bold text-slate-500">{std.classId}</td>
                        <td className="p-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={std.assignmentStatus || 'Non Affecté'}
                            onChange={(e) => updateStudentAssignmentStatus(std.id, e.target.value as any)}
                            className={`p-1 rounded text-[10px] font-black border uppercase cursor-pointer ${
                              std.assignmentStatus === 'Affecté'
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-750'
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            <option value="Non Affecté">Privé</option>
                            <option value="Affecté">État (Affecté)</option>
                          </select>
                        </td>
                        <td className="p-2.5 text-right font-semibold font-mono">
                          {bill.finalInvoiceDue.toLocaleString()} FCFA
                        </td>
                        <td className="p-2.5 text-right text-emerald-855 font-mono font-black">{bill.totalPaid.toLocaleString()} FCFA</td>
                        <td className="p-2.5 text-right text-red-750 font-mono font-black">{bill.balanceRemaining.toLocaleString()} FCFA</td>
                        <td className="p-2.5 text-center">
                          <button 
                            className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                              isSelectedDetail ? 'bg-[#0b4998] text-white' : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            Détails
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        </div>
      )}

      {/* RENDER VIEW: TRANSACTION LEDGER & PRINT RECEIPT */}
      {activeSubTab === 'txn_log' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start print:hidden">
          
          {/* Cash book log lists */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-905 uppercase tracking-tight">Journal Chronologique des Recettes</h3>

            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {transactions.map(txn => (
                <div 
                  key={txn.id} 
                  onClick={() => setActiveTxnId(txn.id)}
                  className={`p-3 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                    activeTxnId === txn.id 
                    ? 'bg-indigo-50/50 border-indigo-400 border-2' 
                    : 'bg-slate-50 border-slate-150 hover:bg-slate-100/50'
                  }`}
                >
                  <div className="text-left">
                    <span className="text-[8px] font-bold text-slate-400 block uppercase font-mono">{txn.recordedAt} • Reçu {txn.receiptNo}</span>
                    <span className="text-xs font-black text-slate-800 block">{txn.studentName} ({txn.classId})</span>
                    <span className="text-[10px] text-slate-455 font-bold block">{txn.paymentMethod}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[#0b4998] font-mono">{txn.amount.toLocaleString()} FCFA</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTxn(txn.id);
                      }}
                      className="p-1 text-slate-300 hover:text-red-500 rounded transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Printable visual receipt template card right */}
          <div className="lg:col-span-6 space-y-4">
            
            {selectedTxnObj && selectedTxnStudentBilling ? (
              <div className="p-2 space-y-3">
                
                <div className="flex justify-between items-center bg-white p-3 border border-slate-200 rounded-2xl shadow-xs">
                  <span className="text-xs font-semibold text-slate-500">Aperçu du justificatif double (Archives + Parent) :</span>
                  <button 
                    onClick={() => window.print()}
                    className="cursor-pointer px-4.5 py-1.5 bg-[#0b4998] text-white text-xs font-black rounded-lg flex items-center gap-1 shadow-sm transition"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    Imprimer le reçu double A4
                  </button>
                </div>

                {/* Printable receipt canvas (Parent Copy screen preview) */}
                <div className="bg-white border-2 border-dashed border-slate-400 p-6 text-slate-900 rounded-3xl space-y-4 font-sans relative overflow-hidden select-none">
                  
                  {/* Decorative stamp background */}
                  <div className="absolute right-6 top-1/2 -translate-y-12 rotate-12 opacity-8 select-none pointer-events-none">
                    <div className="w-24 h-24 rounded-full border-4 border-emerald-600 flex items-center justify-center font-black text-xs text-emerald-800 uppercase tracking-widest text-center">
                      Caisse <br /> Payé
                    </div>
                  </div>

                  {/* Header */}
                  <div className="flex items-start justify-between border-b border-dotted pb-3">
                    <div>
                      <h4 className="text-xs font-black text-[#0b4998] uppercase leading-none">{schoolName}</h4>
                      <span className="text-[8px] font-bold text-slate-400 block uppercase">{schoolSubName}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] bg-slate-950 text-white px-2 py-0.5 rounded font-black font-mono">EXEMPLAIRE PARENT</span>
                    </div>
                  </div>

                  {/* Receipt description detail */}
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-450 font-bold uppercase">N° Reçu :</span>
                      <span className="font-mono font-black text-slate-900">{selectedTxnObj.receiptNo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-455 font-bold uppercase">Date de versement :</span>
                      <span className="font-mono font-bold text-slate-750">{selectedTxnObj.recordedAt}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-450 font-bold uppercase">Élève Référent :</span>
                      <span className="font-black text-slate-900 uppercase">{selectedTxnObj.studentName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-450 font-bold uppercase">Classe :</span>
                      <span className="font-extrabold text-[#ee7b11]">{selectedTxnObj.classId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-450 font-bold uppercase">Statut scolarité :</span>
                      <span className="font-extrabold text-indigo-700">{selectedTxnStudentBilling.assignmentStatus === 'Affecté' ? 'Élève Affecté (État)' : 'Élève Privé (Non affecté)'}</span>
                    </div>
                  </div>

                  {/* Breakdown amount block */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs font-semibold">
                    <div className="flex justify-between border-b pb-1">
                      <span>Dû annuel pour cette catégorie :</span>
                      <span>{selectedTxnStudentBilling.baseFee.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between text-emerald-800 font-extrabold">
                      <span>Montant Encaissé par ce reçu :</span>
                      <span>+{selectedTxnObj.amount.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between text-slate-555 text-[10px]">
                      <span>Mode de règlement :</span>
                      <span>{selectedTxnObj.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>Réf. transaction :</span>
                      <span>{selectedTxnObj.refNo}</span>
                    </div>
                  </div>

                  {/* Financial update balance */}
                  <div className="flex justify-between text-[11px] font-bold text-slate-700">
                    <span>Reliquat restant dû :</span>
                    <span className="text-red-750 font-mono font-black">{selectedTxnStudentBilling.balanceRemaining.toLocaleString()} FCFA</span>
                  </div>

                  {/* Signatures */}
                  <div className="pt-2 text-right border-t border-dotted border-slate-300 text-[10px] font-semibold flex justify-between items-center">
                    <span className="text-slate-400 italic">Année Scolaire {academicYear}</span>
                    <div>
                      <span className="font-bold underline uppercase">La caisse comptable :</span>
                      <span className="block font-black text-slate-900 pt-0.5">VISA OK</span>
                    </div>
                  </div>

                </div>

              </div>
            ) : (
              <span className="text-slate-400 italic block text-center pt-8">Aucun versement enregistré.</span>
            )}

          </div>

        </div>
      )}

      {/* RENDER VIEW: FEES GRILLE CONFIGURATION */}
      {activeSubTab === 'fee_setup' && (
        <div className="space-y-6 print:hidden">
          
          {/* Tuition Fee Rates table */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-[#0b4998] uppercase">Barème Général des Frais d'Écolage & Échéancier</h3>
            <p className="text-xs text-slate-500 font-medium">
              Configurez le tarif de scolarité annuel applicable par défaut, le nombre de versements et la date limite pour chaque tranche des **élèves privés (non affectés)**.
            </p>

            <div className="space-y-6">
              {feeSchedule.map((rate, rateIndex) => (
                <div key={rate.classId} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  
                  {/* Top line detail */}
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] bg-slate-900 text-white px-2.5 py-0.5 rounded font-black font-mono">
                        CLASSE {rate.classId}
                      </span>
                      <span className="text-xs font-black text-slate-900">{rate.className}</span>
                    </div>
                    
                    {/* Subsidy fee input */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-[10px] font-bold text-[#0b4998] uppercase">Tarif État (Affecté) :</span>
                      <input 
                        type="number" 
                        value={rate.amountAffecte}
                        onChange={(e) => {
                          const copy = [...feeSchedule];
                          copy[rateIndex].amountAffecte = parseInt(e.target.value) || 0;
                          setFeeSchedule(copy);
                        }}
                        className="w-20 text-center bg-white border border-slate-200 rounded px-1 py-0.5 font-bold"
                      />
                      <span className="text-[10px] font-bold text-slate-400">FCFA</span>
                    </div>
                  </div>

                  {/* Installments configurator */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                      <span>Échéancier Élèves Privés (Somme : <strong className="text-[#ee7b11]">{rate.amountNonAffecte.toLocaleString()} FCFA</strong>)</span>
                      <button 
                        onClick={() => handleAddInstallmentRow(rate.classId)}
                        className="cursor-pointer text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded hover:bg-slate-800 transition flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        Ajouter une Tranche
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {rate.installmentsNonAffecte.map((inst, instIndex) => (
                        <div key={instIndex} className="bg-white border border-slate-200 p-3 rounded-xl space-y-2 relative">
                          <button
                            onClick={() => handleRemoveInstallmentRow(rate.classId, instIndex)}
                            className="absolute top-2 right-2 text-slate-300 hover:text-rose-600 transition"
                            title="Supprimer cette tranche"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>

                          <div className="space-y-1">
                            <label className="block text-[8px] font-bold text-slate-400 uppercase">Libellé</label>
                            <input 
                              type="text" 
                              value={inst.label} 
                              onChange={(e) => handleUpdateInstallment(rate.classId, instIndex, 'label', e.target.value)}
                              className="w-full border border-slate-200 rounded px-2 py-0.5 text-xs font-bold text-slate-800 focus:outline-none"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-0.5">
                              <label className="block text-[8px] font-bold text-slate-400 uppercase">Montant (FCFA)</label>
                              <input 
                                type="number" 
                                step="1000"
                                value={inst.amount} 
                                onChange={(e) => handleUpdateInstallment(rate.classId, instIndex, 'amount', e.target.value)}
                                className="w-full border border-slate-200 rounded px-1.5 py-0.5 text-xs font-black text-slate-805"
                              />
                            </div>
                            <div className="space-y-0.5">
                              <label className="block text-[8px] font-bold text-slate-400 uppercase">Échéance</label>
                              <input 
                                type="date" 
                                value={inst.dueDate} 
                                onChange={(e) => handleUpdateInstallment(rate.classId, instIndex, 'dueDate', e.target.value)}
                                className="w-full border border-slate-200 rounded px-1 py-0.5 text-[10px]"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* Scholar and Discounts setup registry */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-[#ee7b11] uppercase">Abattements Boursiers & Réductions d'Excellence</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Délivrez des réductions proportionnelles aux étudiants boursiers, orphelins ou appartenant à des fratries nombreuses d'enseignants.
            </p>

            <div className="space-y-3">
              {studentList.map(std => {
                const discountVal = studentDiscounts[std.id] || 0;
                
                return (
                  <div key={std.id} className="p-3 bg-slate-50 border border-slate-150 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black text-slate-905 uppercase block">{std.lastName} {std.firstName}</span>
                      <span className="text-[10px] text-slate-455 font-bold block">
                        Classe : {std.classId} • Matricule : {std.matricule} • Statut : {std.assignmentStatus}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-450 uppercase">Taux Abattement :</span>
                      <select
                        value={discountVal}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setStudentDiscounts(prev => ({
                            ...prev,
                            [std.id]: val
                          }));
                        }}
                        className="bg-white border border-slate-200 rounded-lg p-1 text-xs font-bold text-slate-800"
                      >
                        <option value="0">Aucun (0%)</option>
                        <option value="10">Famille nombreuse (10%)</option>
                        <option value="25">Demi-Bourse d’excellence (25%)</option>
                        <option value="50">Bourse Orphelinat (50%)</option>
                        <option value="100">Prise en charge intégrale (100%)</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* RENDER VIEW: REMINDERS AND ARREARS MANAGEMENT */}
      {activeSubTab === 'reminders' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start print:hidden">
          
          {/* Left panel: scanned list of candidates with arrears (8 cols) */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="text-sm font-black text-slate-900 uppercase">
                Scanner des Impayés & Échéances Proches (Sous 7 Jours)
              </h3>
              <p className="text-[10.5px] text-slate-450 mt-0.5">
                Le système analyse en continu l'échéancier des tranches non soldées de tous les élèves privés.
              </p>
            </div>

            {scannerList.length === 0 ? (
              <p className="text-xs text-slate-455 italic text-center py-8 bg-slate-50 border border-dashed rounded-xl">
                ✓ Aucun retard de paiement détecté. Tous les élèves privés sont à jour de leurs tranches actives !
              </p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold">
                      <th className="p-2.5">Élève (Classe)</th>
                      <th className="p-2.5">Tranche Concernée</th>
                      <th className="p-2.5 text-center">Échéance</th>
                      <th className="p-2.5 text-right">Reste dû</th>
                      <th className="p-2.5 text-center">Statut / Retard</th>
                      <th className="p-2.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scannerList.map((item, idx) => (
                      <tr 
                        key={idx} 
                        onClick={() => setSelectedReminderStudentId(item.studentId)}
                        className={`border-b border-slate-100 hover:bg-slate-50 transition cursor-pointer ${
                          selectedReminderStudentId === item.studentId ? 'bg-indigo-50/40' : ''
                        }`}
                      >
                        <td className="p-2.5">
                          <strong className="text-slate-800 uppercase block">{item.studentName}</strong>
                          <span className="text-[9.5px] text-slate-455 block font-mono">Mat: {item.matricule} • Cl: {item.classId}</span>
                        </td>
                        <td className="p-2.5 font-semibold text-slate-600">{item.installmentLabel}</td>
                        <td className="p-2.5 text-center font-mono text-slate-550">
                          {new Date(item.dueDate).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="p-2.5 text-right font-black font-mono text-rose-700">
                          {item.remainingAmount.toLocaleString()} FCFA
                        </td>
                        <td className="p-2.5 text-center">
                          {item.daysRemaining < 0 ? (
                            <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-100 rounded-full text-[9px] font-black uppercase">
                              Dépassé ({Math.abs(item.daysRemaining)} j)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-full text-[9px] font-black uppercase">
                              Rappel ({item.daysRemaining} j)
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 text-center">
                          <button className="px-2 py-1 bg-slate-900 text-white rounded text-[10px] font-bold">
                            Relancer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right panel: Reminder Template & Delivery Action (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {activeReminderItem ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-black uppercase text-slate-700">Fiche de Relance Destinataire</h4>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-2 text-xs">
                  <div>
                    <span className="text-slate-450 font-bold block uppercase text-[9px]">Tuteur / Parent d'élève :</span>
                    <strong className="text-slate-800 font-extrabold">{activeReminderItem.tutorName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-455 font-bold block uppercase text-[9px]">Téléphone Tuteur :</span>
                    <strong className="text-indigo-800 font-mono font-black">{activeReminderItem.tutorPhone}</strong>
                  </div>
                  <div>
                    <span className="text-slate-455 font-bold block uppercase text-[9px]">Solde en souffrance :</span>
                    <strong className="text-rose-700 font-mono font-black">{activeReminderItem.remainingAmount.toLocaleString()} FCFA</strong>
                  </div>
                </div>

                {/* Message preview editor */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Message de relance (SMS / WhatsApp)</label>
                  <textarea 
                    value={getReminderTemplateMessage(activeReminderItem)}
                    readOnly
                    className="w-full h-32 p-2 border border-slate-255 bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 leading-relaxed focus:outline-none"
                  />
                </div>

                {/* Manual Reminder Channels */}
                <div className="space-y-2">
                  <span className="text-[9px] font-black uppercase text-slate-455 tracking-wider block">Canaux d'envoi & Traçabilité</span>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {/* SMS */}
                    <button
                      onClick={() => handleSendReminderLog(activeReminderItem.studentId, 'SMS', getReminderTemplateMessage(activeReminderItem))}
                      className="cursor-pointer h-9 bg-slate-900 hover:bg-slate-800 text-white text-[10.5px] font-bold rounded-lg transition flex items-center justify-center gap-1 shadow-xs"
                    >
                      <Send className="h-3.5 w-3.5 text-sky-400" />
                      <span>Relancer SMS</span>
                    </button>

                    {/* WhatsApp */}
                    <button
                      onClick={() => {
                        handleSendReminderLog(activeReminderItem.studentId, 'WhatsApp', getReminderTemplateMessage(activeReminderItem));
                        const formattedText = encodeURIComponent(getReminderTemplateMessage(activeReminderItem));
                        const cleanPhone = activeReminderItem.tutorPhone.replace(/[\s+]/g, '');
                        window.open(`https://wa.me/${cleanPhone}?text=${formattedText}`, '_blank');
                      }}
                      className="cursor-pointer h-9 bg-emerald-600 hover:bg-emerald-700 text-white text-[10.5px] font-bold rounded-lg transition flex items-center justify-center gap-1 shadow-xs"
                    >
                      <MessageSquare className="h-3.5 w-3.5 text-white" />
                      <span>Relancer WA</span>
                    </button>
                  </div>

                  {/* Print A4 reminder letter button */}
                  <button
                    onClick={() => {
                      handleSendReminderLog(activeReminderItem.studentId, 'Courrier A4', getReminderTemplateMessage(activeReminderItem));
                      window.print();
                    }}
                    className="cursor-pointer h-9 w-full bg-[#ee7b11] hover:bg-[#d66f0e] text-white text-xs font-black uppercase rounded-lg transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Lettre A4 Officielle</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs text-center text-slate-400 italic py-8">
                Cliquez sur un élève de la liste de gauche pour configurer son message de relance et lancer les notifications.
              </div>
            )}

            {/* Reminder History Log */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
              <h4 className="text-xs font-black uppercase text-slate-700 border-b border-slate-100 pb-1.5">Historique des Relances</h4>
              {reminderLogs.length === 0 ? (
                <p className="text-[10px] text-slate-400 italic text-center py-2">Aucune relance effectuée durant cette session.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {reminderLogs.map(log => (
                    <div key={log.id} className="p-2 border border-slate-100 bg-[#dfecf8]/10 rounded-lg text-[10px]">
                      <div className="flex justify-between font-bold">
                        <span className="text-slate-800 uppercase">{log.studentName}</span>
                        <span className="text-indigo-700">{log.method}</span>
                      </div>
                      <div className="text-slate-450 mt-0.5">{log.sentAt}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* ----------------------------------------------------
          PRINTABLE CANVAS: DOUBLE RECEIPT FOR A4 CUTOUT 
      ---------------------------------------------------- */}
      {selectedTxnObj && selectedTxnStudentBilling && (
        <div className="hidden print:block fixed inset-0 bg-white z-9999 text-slate-900 p-6 font-sans text-xs leading-tight select-none space-y-12">
          
          {/* ================= EXEMPLAIRE 1 : ARCHIVES DE L'ÉTABLISSEMENT ================= */}
          <div className="border border-slate-350 p-5 rounded-2xl space-y-3 relative overflow-hidden">
            <div className="absolute right-4 top-4 border border-indigo-700 text-indigo-750 px-2 py-0.5 rounded text-[8px] font-black uppercase">
              COPIE ÉTABLISSEMENT (ARCHIVES)
            </div>

            <div className="flex items-start justify-between border-b pb-2">
              <div>
                <h4 className="text-xs font-black text-[#0b4998] uppercase leading-none">{schoolName}</h4>
                <span className="text-[8px] font-bold text-slate-400 block uppercase">{schoolSubName}</span>
                <span className="text-[7px] italic text-slate-400 block">"{schoolMotto}"</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-black font-mono text-slate-900">REÇU DE CAISSE N° {selectedTxnObj.receiptNo}</span>
                <span className="text-[9px] text-slate-400 block font-mono">Date : {selectedTxnObj.recordedAt}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-[10px]">
              <div>
                <span className="text-slate-450 font-bold block uppercase text-[8px]">Élève Candidat :</span>
                <strong className="text-slate-905 uppercase text-xs font-black">{selectedTxnObj.studentName}</strong>
                <span className="text-slate-450 block font-mono">Matricule : {selectedTxnStudentBilling.assignmentStatus === 'Affecté' ? `${selectedTxnObj.studentId} (Affecté)` : selectedTxnObj.studentId}</span>
              </div>
              <div>
                <span className="text-slate-450 font-bold block uppercase text-[8px]">Tuteur Facturé :</span>
                <strong className="text-slate-905 uppercase">{detailStudent?.tutorName || 'Tuteur'}</strong>
                <span className="text-slate-450 block font-mono">Tél : {detailStudent?.tutorPhone || 'N/A'}</span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center text-[10px]">
              <div>
                <span className="text-slate-500 font-bold">Versement Scolarité (Mode : {selectedTxnObj.paymentMethod})</span>
                {selectedTxnObj.refNo && <span className="text-slate-400 font-mono block text-[8px]">Ref: {selectedTxnObj.refNo}</span>}
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-emerald-800 font-mono">+{selectedTxnObj.amount.toLocaleString()} FCFA</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-[9px] border-t border-slate-200 pt-2 font-semibold">
              <span>Total attendu : {selectedTxnStudentBilling.finalInvoiceDue.toLocaleString()} FCFA</span>
              <span>Total versé cumulé : {selectedTxnStudentBilling.totalPaid.toLocaleString()} FCFA</span>
              <span className="text-rose-750 font-black">Reliquat dû : {selectedTxnStudentBilling.balanceRemaining.toLocaleString()} FCFA</span>
            </div>

            <div className="pt-4 flex justify-between items-center text-[9px] italic text-slate-400">
              <span>Année Académique : {academicYear}</span>
              <div className="text-right font-bold text-slate-600 not-italic">
                <span>Le Caissier : VISA OK</span>
              </div>
            </div>
          </div>

          {/* ================= LINE DE DÉCOUPE / CUTOUT LINE ================= */}
          <div className="flex items-center gap-2 text-slate-400 text-[10px] select-none my-6">
            <div className="flex-1 border-t border-dashed border-slate-350"></div>
            <div className="flex items-center gap-1 font-bold font-mono">
              <Scissors className="h-3.5 w-3.5 text-slate-500" />
              <span>DÉCOUPE REÇU (Plier & Découper ici)</span>
            </div>
            <div className="flex-1 border-t border-dashed border-slate-350"></div>
          </div>

          {/* ================= EXEMPLAIRE 2 : EXEMPLAIRE DU PARENT ================= */}
          <div className="border border-slate-350 p-5 rounded-2xl space-y-3 relative overflow-hidden">
            <div className="absolute right-4 top-4 border border-emerald-600 text-emerald-800 px-2 py-0.5 rounded text-[8px] font-black uppercase">
              COPIE PARENT (ÉLÈVE)
            </div>

            <div className="flex items-start justify-between border-b pb-2">
              <div>
                <h4 className="text-xs font-black text-[#0b4998] uppercase leading-none">{schoolName}</h4>
                <span className="text-[8px] font-bold text-slate-400 block uppercase">{schoolSubName}</span>
                <span className="text-[7px] italic text-slate-400 block">"{schoolMotto}"</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-black font-mono text-slate-905">REÇU DE CAISSE N° {selectedTxnObj.receiptNo}</span>
                <span className="text-[9px] text-slate-400 block font-mono">Date : {selectedTxnObj.recordedAt}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-[10px]">
              <div>
                <span className="text-slate-455 font-bold block uppercase text-[8px]">Élève Candidat :</span>
                <strong className="text-slate-905 uppercase text-xs font-black">{selectedTxnObj.studentName}</strong>
                <span className="text-slate-455 block font-mono">Matricule : {selectedTxnStudentBilling.assignmentStatus === 'Affecté' ? `${selectedTxnObj.studentId} (Affecté)` : selectedTxnObj.studentId}</span>
              </div>
              <div>
                <span className="text-slate-455 font-bold block uppercase text-[8px]">Tuteur Facturé :</span>
                <strong className="text-slate-905 uppercase">{detailStudent?.tutorName || 'Tuteur'}</strong>
                <span className="text-slate-455 block font-mono">Tél : {detailStudent?.tutorPhone || 'N/A'}</span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center text-[10px]">
              <div>
                <span className="text-slate-500 font-bold">Versement Scolarité (Mode : {selectedTxnObj.paymentMethod})</span>
                {selectedTxnObj.refNo && <span className="text-slate-400 font-mono block text-[8px]">Ref: {selectedTxnObj.refNo}</span>}
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-emerald-800 font-mono">+{selectedTxnObj.amount.toLocaleString()} FCFA</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-[9px] border-t border-slate-200 pt-2 font-semibold">
              <span>Total attendu : {selectedTxnStudentBilling.finalInvoiceDue.toLocaleString()} FCFA</span>
              <span>Total versé cumulé : {selectedTxnStudentBilling.totalPaid.toLocaleString()} FCFA</span>
              <span className="text-rose-750 font-black">Reliquat dû : {selectedTxnStudentBilling.balanceRemaining.toLocaleString()} FCFA</span>
            </div>

            <div className="pt-4 flex justify-between items-center text-[9px] italic text-slate-400">
              <span>Année Académique : {academicYear}</span>
              <div className="text-right font-bold text-slate-655 not-italic">
                <span>Le Caissier : VISA OK</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* RENDER DOCKED PRINTABLE A4 REMINDER CONVOCATION */}
      {activeReminderItem && (
        <div className="hidden print:block fixed inset-0 bg-white z-9999 text-slate-900 p-12 font-serif text-sm leading-relaxed select-none">
          {/* Header */}
          <div className="text-center border-b pb-4 mb-8">
            <h1 className="text-lg font-bold uppercase tracking-tight text-slate-995">{schoolName}</h1>
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mt-1">{schoolSubName}</p>
            <p className="text-[9px] italic text-slate-455 mt-0.5">"{schoolMotto}"</p>
            <div className="text-[10px] font-mono mt-2 text-slate-500">Année Académique : {academicYear}</div>
          </div>

          {/* Letter Body */}
          <div className="space-y-6 pt-4">
            <div className="text-right">
              <p>Fait à Abidjan, le {new Date().toLocaleDateString('fr-FR')}</p>
            </div>

            <div>
              <p className="font-bold">À l'attention de M./Mme {activeReminderItem.tutorName},</p>
              <p className="italic">Parent / Tuteur de l'élève {activeReminderItem.studentName} ({activeReminderItem.classId})</p>
              <p className="text-xs">Contact : {activeReminderItem.tutorPhone}</p>
            </div>

            <div className="pt-2">
              <p className="font-bold underline uppercase">Objet : Lettre de Rappel et de Mise en Demeure pour Scolarité</p>
            </div>

            <div className="space-y-4">
              <p>Madame, Monsieur,</p>
              <p>
                Sauf erreur de notre part, nous attirons votre aimable attention sur le fait que la scolarité de votre enfant <strong>{activeReminderItem.studentName}</strong>, inscrit en classe de <strong>{activeReminderItem.classId}</strong> (Matricule : {activeReminderItem.matricule}), présente un retard de paiement.
              </p>
              <p>
                En effet, le versement de la tranche <strong>"{activeReminderItem.installmentLabel}"</strong> d'un montant de <strong>{activeReminderItem.dueAmount.toLocaleString()} FCFA</strong>, dont la date limite était fixée au <strong>{new Date(activeReminderItem.dueDate).toLocaleDateString('fr-FR')}</strong>, n'a pas été intégralement régularisé à ce jour. Le solde restant dû pour cette tranche s'élève actuellement à :
              </p>
              
              <div className="my-6 p-4 border bg-slate-50 rounded-xl text-center">
                <span className="text-xs font-bold text-slate-500 uppercase block tracking-wider">Montant restant dû</span>
                <strong className="text-2xl font-black text-slate-900 font-mono">{activeReminderItem.remainingAmount.toLocaleString()} FCFA</strong>
              </div>

              <p>
                Nous vous prions de bien vouloir régulariser cette situation auprès du secrétariat ou du bureau de la caisse de l'établissement sous huitaine. L'éducation de votre enfant dépend de votre ponctualité, qui est indispensable au bon fonctionnement et à la logistique de notre école.
              </p>
              <p>
                Si votre règlement a été effectué entre-temps, veuillez ne pas tenir compte de la présente lettre.
              </p>
              <p>Nous vous remercions de votre collaboration habituelle et vous prions d'agréer, Madame, Monsieur, nos salutations distinguées.</p>
            </div>

            {/* Signature */}
            <div className="pt-10 flex justify-between items-center text-xs">
              <span className="italic text-slate-400">Copie : Direction Générale</span>
              <div className="text-center font-bold">
                <p className="underline uppercase">Le Directeur Général</p>
                <p className="mt-8 font-black uppercase text-slate-950">{schoolDirector}</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
