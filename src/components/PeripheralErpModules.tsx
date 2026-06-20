import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  BookOpen, 
  Briefcase, 
  Plus, 
  Trash2, 
  Check, 
  Send, 
  Mail, 
  Search, 
  Bookmark, 
  Coins, 
  Calendar,
  Layers,
  Award
} from 'lucide-react';
import { ClassItem } from '../types';

interface PeripheralErpModulesProps {
  classes: ClassItem[];
}

interface MessageBroadCast {
  id: string;
  sender: string;
  scope: string; // Ex: "Tous les Parents d'élèves", "Enseignants"
  subject: string;
  body: string;
  channel: 'SMS' | 'E-mail' | 'Interne (Application)';
  sentAt: string;
}

interface BookCatalog {
  id: string;
  isbn: string;
  title: string;
  author: string;
  quantity: number;
  available: number;
  shelf: string; // classification code
}

interface BookLoan {
  id: string;
  bookId: string;
  studentId: string;
  studentName: string;
  loanDate: string;
  returnEstimateDate: string;
  status: 'Prêté' | 'Retourné' | 'En Retard';
}

interface AdminStaffRecord {
  id: string;
  name: string;
  role: string; // ex: Secrétaire, Gardien, Gestionnaire
  phone: string;
  salaryFCFA: number;
  leaveStatus: 'En poste' | 'En Congé' | 'Maladie';
}

export default function PeripheralErpModules({
  classes
}: PeripheralErpModulesProps) {
  
  // 1. COMMUNICATON REGISTRY
  const [announcements, setAnnouncements] = useState<MessageBroadCast[]>(() => {
    const saved = localStorage.getItem('erp_communication_announcements');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'ann_1', sender: 'Le Secrétariat', scope: 'Enseignants et Enseignantes', subject: 'Conseil de classe du premier trimestre', body: 'Chers collègues, la réunion préparatoire se tiendra le vendredi 19 juin à 15h00 au réfectoire principal. Votre présence est obligatoire.', channel: 'Interne (Application)', sentAt: '2026-06-14' },
      { id: 'ann_2', sender: 'La Direction financière', scope: 'Tous les Parents d\'élèves', subject: 'Rappel important : Échéance solde scolarité', body: 'Bonjour Chers Parents d\'élèves, nous vous prions de bien vouloir régulariser le reliquat du premier acompte au plus tard ce week-end par Wave ou au guichet.', channel: 'SMS', sentAt: '2026-06-12' }
    ];
  });

  // 2. LIBRARY CATALOG REGISTRY
  const [libraryBooks, setLibraryBooks] = useState<BookCatalog[]>(() => {
    const saved = localStorage.getItem('erp_library_books');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'bk_1', isbn: '978-2012-3211', title: 'L\'Étudiant Noir (Léopold S. Senghor)', author: 'Régie Nationale', quantity: 15, available: 12, shelf: 'Littérature (Rayon L1)' },
      { id: 'bk_2', isbn: '978-2200-4105', title: 'Physique-Chimie Collection Boni 3ème', author: 'Editions CEDA-NEI', quantity: 25, available: 22, shelf: 'Sciences (Rayon S3)' },
      { id: 'bk_3', isbn: '978-2841-8902', title: 'Le pagne noir (Bernard Dadié)', author: 'Présence Africaine', quantity: 10, available: 8, shelf: 'Littérature (Rayon L1)' }
    ];
  });

  // 3. BOOK LOANS REGISTRY
  const [bookLoans, setBookLoans] = useState<BookLoan[]>(() => {
    const saved = localStorage.getItem('erp_library_loans');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'ln_1', bookId: 'bk_1', studentId: 'std_1', studentName: 'Koffi Yao Anderson', loanDate: '2026-06-05', returnEstimateDate: '2026-06-19', status: 'Prêté' },
      { id: 'ln_2', bookId: 'bk_3', studentId: 'std_2', studentName: 'Diomandé Aminata', loanDate: '2026-06-01', returnEstimateDate: '2026-06-11', status: 'En Retard' }
    ];
  });

  // 4. HR ADMIN STAFF REGISTRY
  const [adminStaff, setAdminStaff] = useState<AdminStaffRecord[]>(() => {
    const saved = localStorage.getItem('erp_hr_staff');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'adm_1', name: 'Mme Bamba Fatim', role: 'Secrétaire de Direction Scolaire', phone: '+225 07 41 85 96 03', salaryFCFA: 220000, leaveStatus: 'En poste' },
      { id: 'adm_2', name: 'M. Touré Drissa', role: 'Surveillant de discipline adjoint', phone: '+225 05 52 41 12 74', salaryFCFA: 190000, leaveStatus: 'En poste' },
      { id: 'adm_3', name: 'Mme Ahoutou Chantal', role: 'Comptable Trésorier général', phone: '+225 01 02 03 04 05', salaryFCFA: 300000, leaveStatus: 'En Congé' }
    ];
  });

  // Persistence hooks
  useEffect(() => {
    localStorage.setItem('erp_communication_announcements', JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem('erp_library_books', JSON.stringify(libraryBooks));
  }, [libraryBooks]);

  useEffect(() => {
    localStorage.setItem('erp_library_loans', JSON.stringify(bookLoans));
  }, [bookLoans]);

  useEffect(() => {
    localStorage.setItem('erp_hr_staff', JSON.stringify(adminStaff));
  }, [adminStaff]);

  // Overall page section layout tab pointer
  const [currentModulePointer, setCurrentModulePointer] = useState<'communication' | 'library' | 'hr'>('communication');

  // FORM 1: SEND MESSAGE
  const [msgForm, setMsgForm] = useState({
    sender: 'La Censeure',
    scope: 'Enseignants et Enseignantes',
    channel: 'SMS' as 'SMS' | 'E-mail' | 'Interne (Application)',
    subject: '',
    body: ''
  });

  // FORM 2: NEW BOOK
  const [bookForm, setBookForm] = useState({
    isbn: '',
    title: '',
    author: '',
    quantity: 5,
    shelf: 'Rayon Général A'
  });

  // FORM 3: BOOK LOAN
  const [newLoan, setNewLoan] = useState({
    bookId: libraryBooks[0]?.id || 'bk_1',
    studentName: 'YAO Koffi Anderson (Mat-6A)',
    returnDate: new Date(Date.now() + 86400000*14).toISOString().split('T')[0]
  });

  // FORM 4: RECRUIT ADMIN STAFF
  const [staffForm, setStaffForm] = useState({
    name: '',
    role: 'Adjoint de surveillance',
    phone: '',
    salaryFCFA: 150000
  });

  // METHODS
  const handleBroadCast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgForm.subject.trim() || !msgForm.body.trim()) {
      alert("Veuillez inscrire l'objet et le texte de l'annonce !");
      return;
    }

    const newAnn: MessageBroadCast = {
      id: 'ann_' + Date.now(),
      sender: msgForm.sender,
      scope: msgForm.scope,
      subject: msgForm.subject.trim(),
      body: msgForm.body.trim(),
      channel: msgForm.channel,
      sentAt: new Date().toISOString().split('T')[0]
    };

    setAnnouncements(prev => [newAnn, ...prev]);
    alert(`Succès de diffusion !\nVotre ${msgForm.channel} a été virtuellement distribué à la cohorte "${msgForm.scope}".`);
    
    setMsgForm(prev => ({
      ...prev,
      subject: '',
      body: ''
    }));
  };

  const handleAddNewBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookForm.title.trim() || !bookForm.isbn.trim()) {
      alert("Veuillez renseigner le titre du manuel scolaire et l'ISBN !");
      return;
    }

    const nQty = parseInt(String(bookForm.quantity)) || 5;

    const newBk: BookCatalog = {
      id: 'bk_' + Date.now(),
      isbn: bookForm.isbn.trim(),
      title: bookForm.title.trim(),
      author: bookForm.author.trim() || 'Auteur Inconnu',
      quantity: nQty,
      available: nQty,
      shelf: bookForm.shelf.trim() || 'Rayon G'
    };

    setLibraryBooks(prev => [...prev, newBk]);
    alert(`Le manuel "${newBk.title}" a été inséré en catalogue.`);

    setBookForm({
      isbn: '',
      title: '',
      author: '',
      quantity: 5,
      shelf: 'Rayon Général A'
    });
  };

  const handleCreateLoan = (e: React.FormEvent) => {
    e.preventDefault();
    const targetBookInStock = libraryBooks.find(b => b.id === newLoan.bookId);

    if (!targetBookInStock || targetBookInStock.available <= 0) {
      alert("Erreur ! Ce manuel n'est pas ou plus en stock disponible.");
      return;
    }

    const loan: BookLoan = {
      id: 'ln_' + Date.now(),
      bookId: newLoan.bookId,
      studentId: 'std_dyn_' + Math.floor(Math.random()*100),
      studentName: newLoan.studentName.trim(),
      loanDate: new Date().toISOString().split('T')[0],
      returnEstimateDate: newLoan.returnDate,
      status: 'Prêté'
    };

    // Decrement available copies
    setLibraryBooks(prev => prev.map(b => {
      if (b.id === newLoan.bookId) {
        return { ...b, available: Math.max(0, b.available - 1) };
      }
      return b;
    }));

    setBookLoans(prev => [loan, ...prev]);
    alert("Prêt de livre validé et comptabilisé !");
  };

  const handleReturnBook = (loanId: string, bookId: string) => {
    setBookLoans(prev => prev.map(l => {
      if (l.id === loanId) return { ...l, status: 'Retourné' };
      return l;
    }));

    // Increment available copies
    setLibraryBooks(prev => prev.map(b => {
      if (b.id === bookId) {
        return { ...b, available: Math.min(b.quantity, b.available + 1) };
      }
      return b;
    }));

    alert("Manuel retourné en rayon, stock incrémenté !");
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.name.trim()) return;

    const newStaff: AdminStaffRecord = {
      id: 'adm_' + Date.now(),
      name: staffForm.name.trim(),
      role: staffForm.role,
      phone: staffForm.phone.trim() || '+225 00000000',
      salaryFCFA: parseInt(String(staffForm.salaryFCFA)) || 135000,
      leaveStatus: 'En poste'
    };

    setAdminStaff(prev => [...prev, newStaff]);
    alert(`Le profil administratif pour ${newStaff.name} a été enregistré.`);
    setStaffForm({
      name: '',
      role: 'Adjoint de surveillance',
      phone: '',
      salaryFCFA: 150000
    });
  };

  const handleUpdateStaffLeave = (id: string, status: 'En poste' | 'En Congé' | 'Maladie') => {
    setAdminStaff(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, leaveStatus: status };
      }
      return s;
    }));
  };

  const handleDeleteStaff = (id: string) => {
    if (window.confirm("Voulez-vous supprimer ce dossier d'agent comptable ou de surveillance ?")) {
      setAdminStaff(prev => prev.filter(s => s.id !== id));
    }
  };

  const totalHRPayrollSum = adminStaff.reduce((sum, s) => sum + s.salaryFCFA, 0);

  return (
    <div className="space-y-6">
      
      {/* Tab Controller Bar for these secondary modules */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-light">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="h-5.5 w-5.5 text-[#0b4998]" />
            <span>Services Périphériques & Logistique</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium font-sans">
            Gérez les autres départements essentiels : communication multicanale, prêt de manuels scolaires à la bibliothèque et masse salariale des personnels non-enseignants.
          </p>
        </div>

        {/* Local switcher triggers */}
        <div className="flex gap-2">
          <button 
            onClick={() => setCurrentModulePointer('communication')}
            className={`cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              currentModulePointer === 'communication' ? 'bg-[#0b4998] text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <Bell className="h-4 w-4 text-[#ee7b11]" />
            Portail Communication
          </button>
          <button 
            onClick={() => setCurrentModulePointer('library')}
            className={`cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              currentModulePointer === 'library' ? 'bg-[#0b4998] text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            Bibliothèque Doc
          </button>
          <button 
            onClick={() => setCurrentModulePointer('hr')}
            className={`cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              currentModulePointer === 'hr' ? 'bg-[#0b4998] text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <Briefcase className="h-4 w-4" />
            RH & Caisse Paie
          </button>
        </div>
      </div>

      {/* RENDER VIEW: COMMUNICATION HUB */}
      {currentModulePointer === 'communication' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Broadcaster form on left */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase text-[#0b4998] tracking-widest flex items-center gap-1.5">
              <span>Diffuser une note d'information</span>
            </h3>

            <form onSubmit={handleBroadCast} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase">Canal d'envoi</label>
                  <select
                    value={msgForm.channel}
                    onChange={(e) => setMsgForm(prev => ({ ...prev, channel: e.target.value as any }))}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                  >
                    <option value="SMS font-bold text-emerald-800">SMS Direct</option>
                    <option value="E-mail">E-mail Officiel</option>
                    <option value="Interne (Application)">Portail Interne</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-455 uppercase">Émetteur</label>
                  <input 
                    type="text" 
                    required
                    value={msgForm.sender}
                    onChange={(e) => setMsgForm(prev => ({ ...prev, sender: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase">Destinataire (Audience)</label>
                <select
                  value={msgForm.scope}
                  onChange={(e) => setMsgForm(prev => ({ ...prev, scope: e.target.value }))}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                >
                  <option value="Tous les Parents d'élèves">Tous les Parents d'élèves (Abonnés)</option>
                  <option value="Enseignants et Enseignantes">Tous les Enseignants (CDI & Vacataires)</option>
                  <option value="Élèves de 3eA">Élèves de Classe Troisième A</option>
                  <option value="Membres de l'administration">Membres du Bureau administratif</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase font-sans">Objet du message</label>
                <input 
                  type="text" 
                  required
                  placeholder="ex: Fête de fin d'année et remise des prix"
                  value={msgForm.subject}
                  onChange={(e) => setMsgForm(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase">Corps du message de diffusion</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Saisissez ici le texte de votre SMS ou courriel."
                  value={msgForm.body}
                  onChange={(e) => setMsgForm(prev => ({ ...prev, body: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:bg-white min-h-[100px]"
                />
              </div>

              <button 
                type="submit"
                className="cursor-pointer w-full py-2 bg-[#ee7b11] hover:bg-[#d66f0e] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition pt-2 shadow-sm"
              >
                <Send className="h-4 w-4" />
                Diffuser l'Annonce Multicanale
              </button>
            </form>
          </div>

          {/* Historical feed notifications on right */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-905 uppercase tracking-tight pb-3 border-b border-indigo-50">
              Historique des Diffusions Générales ({announcements.length})
            </h3>

            <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
              {announcements.map(ann => (
                <div key={ann.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-150 relative space-y-2 hover:shadow-xs transition">
                  <div className="flex flex-wrap items-center gap-2 text-[9.5px] font-black uppercase">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono">Canal : {ann.channel}</span>
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-805 rounded">Cible : {ann.scope}</span>
                    <span className="text-slate-400 font-mono italic font-bold">Le {ann.sentAt}</span>
                  </div>

                  <div className="space-y-1 text-left">
                    <h4 className="text-xs font-black text-slate-900">{ann.subject}</h4>
                    <p className="text-[11px] text-slate-650 leading-relaxed font-sans">{ann.body}</p>
                  </div>

                  <div className="text-right text-[10px] text-slate-400 font-bold block">
                    Émis par : <span className="text-[#0b4998] font-black">{ann.sender}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* RENDER VIEW: LIBRARY BOOKS & LOANS */}
      {currentModulePointer === 'library' && (
        <div className="space-y-6">
          
          {/* Quick dual grid forms */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            
            {/* Catalog manual adding form left */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-black uppercase text-[#0b4998] tracking-widest">Ajouter un Manuel d'Enseignement</h3>
              
              <form onSubmit={handleAddNewBook} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-450 uppercase">Code ISBN / Référence</label>
                    <input 
                      type="text" 
                      required
                      placeholder="ISBN"
                      value={bookForm.isbn}
                      onChange={(e) => setBookForm(prev => ({ ...prev, isbn: e.target.value }))}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-450 uppercase font-sans">Quantité Initiale</label>
                    <input 
                      type="number" 
                      min="1"
                      required
                      value={bookForm.quantity}
                      onChange={(e) => setBookForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 5 }))}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase">Titre de l'Ouvrage scolaire</label>
                  <input 
                    type="text" 
                    required
                    placeholder="ex: Le pagne noir (Bernard Dadié)"
                    value={bookForm.title}
                    onChange={(e) => setBookForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-450 uppercase">Auteur(s)</label>
                    <input 
                      type="text" 
                      placeholder="Bernard Dadié"
                      value={bookForm.author}
                      onChange={(e) => setBookForm(prev => ({ ...prev, author: e.target.value }))}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-455 uppercase">Classification / Étagère</label>
                    <input 
                      type="text" 
                      placeholder="Rayon L1"
                      value={bookForm.shelf}
                      onChange={(e) => setBookForm(prev => ({ ...prev, shelf: e.target.value }))}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="cursor-pointer w-full py-2 bg-[#0b4998] hover:bg-[#093d80] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition pt-2"
                >
                  <Plus className="h-4 w-4" />
                  Homologuer l'Ouvrage
                </button>
              </form>
            </div>

            {/* Loan transactions form right */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-black uppercase text-[#ee7b11] tracking-widest font-mono">Consigner un Prêt de Livre</h3>
              
              <form onSubmit={handleCreateLoan} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase">Ouvrage à prêter</label>
                  <select
                    value={newLoan.bookId}
                    onChange={(e) => setNewLoan(prev => ({ ...prev, bookId: e.target.value }))}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                  >
                    {libraryBooks.map(b => (
                      <option key={b.id} value={b.id}>{b.title} ({b.available} restants en rayon)</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase font-sans">Élève Bénéficiaire (Nom et Matricule)</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ex: Koffi Anderson (M-2025-4102)"
                    value={newLoan.studentName}
                    onChange={(e) => setNewLoan(prev => ({ ...prev, studentName: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase">Date limite contractuelle de Restitution</label>
                  <input 
                    type="date" 
                    value={newLoan.returnDate}
                    onChange={(e) => setNewLoan(prev => ({ ...prev, returnDate: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="cursor-pointer w-full py-2 bg-[#ee7b11] hover:bg-[#d66f0e] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition pt-2"
                >
                  <Bookmark className="h-4 w-4" />
                  Signer le Prêt de Manuel
                </button>
              </form>
            </div>

          </div>

          {/* Catalog stats report with dual layout table listings */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Catalog catalog left */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4 overflow-hidden">
              <h3 className="text-sm font-black text-[#0b4998] uppercase">Inventaire de la Bibliothèque</h3>
              
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-450 border-b border-slate-205 font-black uppercase">
                      <th className="p-2.5">ISBN</th>
                      <th className="p-2.5">Titre Œuvre</th>
                      <th className="p-2.5">Auteur</th>
                      <th className="p-2.5 text-center">Quantité</th>
                      <th className="p-2.5 text-center text-emerald-850">Dispo.</th>
                      <th className="p-2.5">Classification</th>
                    </tr>
                  </thead>
                  <tbody>
                    {libraryBooks.map(b => (
                      <tr key={b.id} className="border-b border-slate-100 hover:bg-slate-50 transition font-medium text-slate-750">
                        <td className="p-2.5 font-mono text-slate-450">{b.isbn}</td>
                        <td className="p-2.5 font-extrabold text-slate-900">{b.title}</td>
                        <td className="p-2.5">{b.author}</td>
                        <td className="p-2.5 text-center font-bold">{b.quantity} ex.</td>
                        <td className="p-2.5 text-center font-black text-emerald-705 bg-emerald-50/50">{b.available} ex.</td>
                        <td className="p-2.5 font-mono">{b.shelf}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Active loans right */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-[#ee7b11] uppercase">Fiches de Prêt en Cours</h3>

              <div className="space-y-2.5">
                {bookLoans.map(loan => {
                  const book = libraryBooks.find(b => b.id === loan.bookId) || { title: 'Livre non repertorié' };
                  return (
                    <div key={loan.id} className="p-3 bg-slate-50 border border-slate-150 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 hover:bg-slate-100/40 transition text-xs font-semibold">
                      <div>
                        <span className="text-[8.5px] uppercase font-black text-[#0b4998] block">Élève : {loan.studentName}</span>
                        <span className="text-slate-900 block font-bold leading-normal">{book.title}</span>
                        <span className="text-[10px] text-slate-400 block block mt-0.5">Date limite : {loan.returnEstimateDate}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase ${
                          loan.status === 'Retourné' ? 'bg-emerald-100 text-emerald-800' :
                          loan.status === 'En Retard' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                          'bg-indigo-150 text-indigo-850'
                        }`}>
                          {loan.status}
                        </span>

                        {loan.status !== 'Retourné' && (
                          <button
                            onClick={() => handleReturnBook(loan.id, loan.bookId)}
                            className="cursor-pointer px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[9.5px] font-extrabold transition shadow-sm"
                          >
                            Retourné OK
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* RENDER VIEW: HR ADMIN IN-STAFF */}
      {currentModulePointer === 'hr' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Form left */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase text-[#0b4998] tracking-widest flex items-center gap-1.5">
              <span>Recruter un Profil Administratif / Logistique</span>
            </h3>

            <form onSubmit={handleAddStaff} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase">Nom Complet de l'Agent</label>
                <input 
                  type="text" 
                  required
                  placeholder="ex: M. Touré Lanciné"
                  value={staffForm.name}
                  onChange={(e) => setStaffForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase">Rôle / Poste au sein de l'établissement</label>
                <select
                  value={staffForm.role}
                  onChange={(e) => setStaffForm(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                >
                  <option value="Adjoint de surveillance académique">Adjoint de surveillance</option>
                  <option value="Secrétaire générale administrative">Secrétaire générale</option>
                  <option value="Chef des travaux informatiques">Chef travaux SI</option>
                  <option value="Comptable Guichet Trésorerie">Comptable trésor</option>
                  <option value="Gardien de sécurité nocturne">Gardien de sécurité</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase">Téléphone</label>
                  <input 
                    type="text" 
                    placeholder="+225 07..."
                    value={staffForm.phone}
                    onChange={(e) => setStaffForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase font-sans">Salaire Mensuel Brut</label>
                  <input 
                    type="number" 
                    step="5000"
                    placeholder="150000"
                    value={staffForm.salaryFCFA}
                    onChange={(e) => setStaffForm(prev => ({ ...prev, salaryFCFA: parseInt(e.target.value) || 0 }))}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black focus:outline-none"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="cursor-pointer w-full py-2 bg-[#ee7b11] hover:bg-[#d66f0e] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1 transition shadow-sm pt-2"
              >
                <Plus className="h-4 w-4" />
                Engager le Collaborateur
              </button>
            </form>
          </div>

          {/* Directory lists right with salary projections */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-5 shadow-xs overflow-hidden space-y-4">
            <div className="flex justify-between items-center border-b border-indigo-50 pb-3">
              <h3 className="text-sm font-black text-slate-905 uppercase tracking-tight">Fichier du Personnel d'Appui & Masse Salariale</h3>
              <span className="text-[11.5px] bg-[#0b4998] text-white px-3 py-0.5 rounded-full font-black">Masse administrative : {totalHRPayrollSum.toLocaleString()} FCFA / mois</span>
            </div>

            <div className="space-y-3">
              {adminStaff.map(staff => (
                <div key={staff.id} className="p-3.5 bg-slate-50 border border-slate-150 rounded-2xl flex items-center justify-between group text-xs font-semibold hover:shadow-xs transition">
                  <div className="text-left">
                    <span className="text-[9px] uppercase font-black tracking-wider text-slate-400">{staff.role}</span>
                    <h4 className="text-sm font-bold text-slate-900 block">{staff.name}</h4>
                    <span className="text-[10px] text-slate-500 font-medium">Mob : {staff.phone}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[9px] text-slate-400 block uppercase font-mono">Salaire Mensuel</span>
                      <span className="text-xs font-mono font-black text-[#0b4998] block">{staff.salaryFCFA.toLocaleString()} FCFA</span>
                    </div>

                    <select
                      value={staff.leaveStatus}
                      onChange={(e) => handleUpdateStaffLeave(staff.id, e.target.value as any)}
                      className={`rounded-lg p-1 text-[10px] font-black uppercase transition ${
                        staff.leaveStatus === 'En poste' ? 'bg-emerald-100 text-emerald-800' :
                        staff.leaveStatus === 'En Congé' ? 'bg-amber-100 text-amber-850' :
                        'bg-red-100 text-red-700'
                      }`}
                    >
                      <option value="En poste">En poste</option>
                      <option value="En Congé">En Congé</option>
                      <option value="Maladie">Maladie</option>
                    </select>

                    <button 
                      onClick={() => handleDeleteStaff(staff.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 rounded transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-indigo-50 border border-indigo-150 rounded-2xl text-[10.5px] font-semibold text-slate-800 leading-normal">
              💳 **Procédure de déblocage des virements** : Le payroll mensuel est arrêté le 25 de chaque mois civile. Veuillez valider le fichier d'absentéisme des surveillants avant de débloquer les émoluments en banque SIB/Ecobank.
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
