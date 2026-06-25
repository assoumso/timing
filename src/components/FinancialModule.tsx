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
  UserCheck
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

interface TuitionFeeRate {
  classId: string;
  className: string;
  amountNonAffecte: number; // Privatised fee (Non Affecté)
  amountAffecte: number; // State subsidised parental fee (Affecté)
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
  assignmentStatus?: 'Affecté' | 'Non Affecté'; // State-sponsored (Affecté) vs Private (Non Affecté)
}

export default function FinancialModule({
  classes,
  schoolName,
  schoolSubName,
  schoolMotto,
  academicYear,
  schoolDirector
}: FinancialModuleProps) {
  
  // Resolve student list dynamically
  const [studentList, setStudentList] = useState<StudentRecord[]>([]);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = () => {
    const saved = localStorage.getItem('erp_student_records');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure all students have assignmentStatus field (defaulting to 'Non Affecté' if empty)
      const initialized = parsed.map((s: any) => ({
        ...s,
        assignmentStatus: s.assignmentStatus || 'Non Affecté'
      }));
      setStudentList(initialized);
    } else {
      const defaults: StudentRecord[] = [
        { id: 'std_1', firstName: 'Koffi', lastName: 'Yao Anderson', gender: 'M', classId: '6A', status: 'Inscrit', matricule: 'M-2026-4102', assignmentStatus: 'Non Affecté' },
        { id: 'std_2', firstName: 'Diomandé', lastName: 'Aminata', gender: 'F', classId: '6B', status: 'Réinscrit', matricule: 'M-2024-1185', assignmentStatus: 'Affecté' },
        { id: 'std_3', firstName: 'Kouassi', lastName: 'Koffi Charles', gender: 'M', classId: '3A', status: 'Inscrit', matricule: 'M-2026-9981', assignmentStatus: 'Non Affecté' },
        { id: 'std_4', firstName: 'Sylla', lastName: 'Ibrahim Karim', gender: 'M', classId: '3B', status: 'Réinscrit', matricule: 'M-2023-0056', assignmentStatus: 'Affecté' },
        { id: 'std_5', firstName: 'Gomez', lastName: 'Marie-Chantal Enola', gender: 'F', classId: '3A', status: 'Inscrit', matricule: 'M-2026-0103', assignmentStatus: 'Non Affecté' }
      ];
      setStudentList(defaults);
      localStorage.setItem('erp_student_records', JSON.stringify(defaults));
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

  // Standard school fees rates per class
  const [feeSchedule, setFeeSchedule] = useState<TuitionFeeRate[]>(() => {
    const saved = localStorage.getItem('erp_fees_schedule_v2');
    if (saved) return JSON.parse(saved);
    return [
      { classId: '6A', className: 'Sixième A', amountNonAffecte: 180000, amountAffecte: 15000 },
      { classId: '6B', className: 'Sixième B', amountNonAffecte: 180000, amountAffecte: 15000 },
      { classId: '3A', className: 'Troisième A', amountNonAffecte: 250000, amountAffecte: 25000 },
      { classId: '3B', className: 'Troisième B', amountNonAffecte: 250000, amountAffecte: 25000 }
    ];
  });

  // Scholars & discounts table { "studentId": discountPercent (0 to 100) }
  const [studentDiscounts, setStudentDiscounts] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('erp_student_discount_rates');
    return saved ? JSON.parse(saved) : {
      'std_5': 50 // Gomez Marie-Chantal has 50% excellence scholarship
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
    localStorage.setItem('erp_fees_schedule_v2', JSON.stringify(feeSchedule));
  }, [feeSchedule]);

  useEffect(() => {
    localStorage.setItem('erp_student_discount_rates', JSON.stringify(studentDiscounts));
  }, [studentDiscounts]);

  useEffect(() => {
    localStorage.setItem('erp_billing_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // UI status controller
  const [activeSubTab, setActiveSubTab] = useState<'billing' | 'txn_log' | 'fee_setup'>('billing');
  
  // Selection pointer for receipts
  const [activeTxnId, setActiveTxnId] = useState('txn_1');

  // Payment register form state
  const [payForm, setPayForm] = useState({
    studentId: 'std_1',
    amount: 15000,
    paymentMethod: 'Wave Mobile' as any,
    refNo: ''
  });

  // Register collection payment method
  const handleRegisterPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const student = studentList.find(s => s.id === payForm.studentId);
    if (!student) {
      alert("Élève invalide ou introuvable !");
      return;
    }

    const payAmt = parseInt(String(payForm.amount));
    if (isNaN(payAmt) || payAmt <= 0) {
      alert("Le montant à facturer doit s'élever au-delà de 0 FCFA !");
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

    setTransactions(prev => [newTxn, ...prev]);
    setActiveTxnId(newTxn.id);
    alert(`Encaissement enregistré avec succès !\nReçu n° ${uniqueReceiptNo} délivré.`);

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
    
    if (matchedFeeSchedule) {
      baseFee = assignment === 'Affecté' ? matchedFeeSchedule.amountAffecte : matchedFeeSchedule.amountNonAffecte;
    } else {
      // General fallbacks
      baseFee = assignment === 'Affecté' ? 20000 : 200000;
    }
    
    // Check discount and scholarship
    const discountPercent = studentDiscounts[studentId] || 0;
    const finalInvoiceDue = Math.round(baseFee * (1 - discountPercent / 100));

    // Sum total paid
    const studentTxns = transactions.filter(t => t.studentId === studentId);
    const totalPaid = studentTxns.reduce((sum, t) => sum + t.amount, 0);
    const balanceRemaining = Math.max(0, finalInvoiceDue - totalPaid);

    return {
      baseFee,
      assignmentStatus: assignment,
      discountPercent,
      finalInvoiceDue,
      totalPaid,
      balanceRemaining,
      isFullyPaid: totalPaid >= finalInvoiceDue
    };
  };

  const selectedTxnObj = transactions.find(t => t.id === activeTxnId) || transactions[0];
  const selectedTxnStudentBilling = selectedTxnObj 
    ? getStudentBillingSheet(selectedTxnObj.studentId, selectedTxnObj.classId) 
    : null;

  // Global collection stats
  const globalTotalCollected = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      
      {/* Header panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-light">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Banknote className="h-5.5 w-5.5 text-indigo-650" />
            <span>Gestion Financière & Recouvrement Scolarités</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Pilotez la caisse : configurez les tarifs d'écolage par niveau (élèves affectés par l'état vs élèves privés non affectés), appliquez les bourses d'études et délivrez des reçus officiels.
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
            Grille des Écolages
          </button>
        </div>
      </div>

      {/* RENDER VIEW: CENTRAL BILLING DIRECTORY & DISMISSION */}
      {activeSubTab === 'billing' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Cashier Payment Form (Let cashier record money in) */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
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

          {/* Right student accounting directory */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-5 shadow-xs overflow-hidden space-y-4">
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
                    <th className="p-2.5 w-32 text-center">Statut (État/Privé)</th>
                    <th className="p-2.5 text-right">Scolarité Estimée</th>
                    <th className="p-2.5 text-right text-emerald-800">Montant Versé</th>
                    <th className="p-2.5 text-right text-red-750">Reste À payer</th>
                    <th className="p-2.5 text-center">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {studentList.map(std => {
                    const bill = getStudentBillingSheet(std.id, std.classId);
                    
                    return (
                      <tr key={std.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                        <td className="p-2.5 font-mono text-[#0b4998] font-bold">{std.matricule}</td>
                        <td className="p-2.5 font-extrabold text-slate-850 uppercase leading-none">
                          {std.lastName} {std.firstName}
                        </td>
                        <td className="p-2.5 font-bold text-slate-500">{std.classId}</td>
                        <td className="p-2.5 text-center">
                          <select
                            value={std.assignmentStatus || 'Non Affecté'}
                            onChange={(e) => updateStudentAssignmentStatus(std.id, e.target.value as any)}
                            className={`p-1 rounded text-[10px] font-black border uppercase cursor-pointer ${
                              std.assignmentStatus === 'Affecté'
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-750'
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            <option value="Non Affecté">Privé (Non affecté)</option>
                            <option value="Affecté">État (Affecté)</option>
                          </select>
                        </td>
                        <td className="p-2.5 text-right font-semibold font-mono">
                          {bill.finalInvoiceDue.toLocaleString()} FCFA
                          {bill.discountPercent > 0 && (
                            <span className="text-[8px] bg-amber-100 text-amber-700 px-1 py-0.2 rounded font-extrabold uppercase block mt-0.5">
                              Bourse -{bill.discountPercent}%
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 text-right text-emerald-850 font-mono font-black">{bill.totalPaid.toLocaleString()} FCFA</td>
                        <td className="p-2.5 text-right text-red-750 font-mono font-black">{bill.balanceRemaining.toLocaleString()} FCFA</td>
                        <td className="p-2.5 text-center">
                          {bill.balanceRemaining === 0 ? (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[9px] font-black uppercase">Soldé</span>
                          ) : bill.totalPaid > 0 ? (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[9px] font-black uppercase">Partiel</span>
                          ) : (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[9px] font-black uppercase">Impayé</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* RENDER VIEW: TRANSACTION LEDGER & PRINT RECEIPT */}
      {activeSubTab === 'txn_log' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
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
                  <span className="text-xs font-semibold text-slate-500">Aperçu du justificatif :</span>
                  <button 
                    onClick={() => window.print()}
                    className="cursor-pointer px-4.5 py-1.5 bg-[#0b4998] text-white text-xs font-black rounded-lg flex items-center gap-1 shadow-sm transition"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    Imprimer le reçu client
                  </button>
                </div>

                {/* Printable receipt canvas */}
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
                      <span className="text-[10px] bg-slate-950 text-white px-2 py-0.5 rounded font-black font-mono">REÇU DE CAISSE</span>
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
                    <div className="flex justify-between text-slate-550 text-[10px]">
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
        <div className="space-y-6">
          
          {/* Tuition Fee Rates table */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-[#0b4998] uppercase">Barème Général des Frais d'Écolage</h3>
            <p className="text-xs text-slate-500 font-medium">
              Configurez le tarif de scolarité annuel applicable par défaut pour les élèves **non affectés (privés)** et les élèves **affectés (subventionnés par l'État)**.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {feeSchedule.map((rate, index) => (
                <div key={rate.classId} className="p-4 rounded-2xl bg-slate-50 border border-slate-150 space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                    <span className="text-[9px] bg-slate-900 text-white px-2 py-0.5 rounded font-black font-mono">CLASSE {rate.classId}</span>
                    <span className="text-xs font-black text-slate-900">{rate.className}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {/* Private fees input */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Tarif Privé (Non affecté)</label>
                      <div className="flex items-center gap-1">
                        <input 
                          type="number" 
                          step="5000"
                          value={rate.amountNonAffecte}
                          onChange={(e) => {
                            const copy = [...feeSchedule];
                            copy[index].amountNonAffecte = parseInt(e.target.value) || 0;
                            setFeeSchedule(copy);
                          }}
                          className="w-full text-center bg-white border border-slate-250 p-1.5 rounded-lg text-xs font-black text-slate-800 focus:outline-none"
                        />
                        <span className="text-[10px] font-bold text-slate-400">FCFA</span>
                      </div>
                    </div>

                    {/* State-sponsored fees input */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-[#0b4998] uppercase">Tarif État (Affecté)</label>
                      <div className="flex items-center gap-1">
                        <input 
                          type="number" 
                          step="1000"
                          value={rate.amountAffecte}
                          onChange={(e) => {
                            const copy = [...feeSchedule];
                            copy[index].amountAffecte = parseInt(e.target.value) || 0;
                            setFeeSchedule(copy);
                          }}
                          className="w-full text-center bg-white border border-indigo-250 p-1.5 rounded-lg text-xs font-black text-slate-800 focus:outline-none"
                        />
                        <span className="text-[10px] font-bold text-slate-400 font-mono">FCFA</span>
                      </div>
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
                      <span className="text-xs font-black text-slate-900 uppercase block">{std.lastName} {std.firstName}</span>
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

    </div>
  );
}
