import React, { useState, useEffect } from 'react';
import { 
  Users, 
  GraduationCap, 
  Plus, 
  Trash2, 
  Search, 
  Printer, 
  FileCheck, 
  ArrowRightLeft, 
  Contact, 
  CreditCard,
  Check,
  Award
} from 'lucide-react';
import { ClassItem } from '../types';

interface StudentModuleProps {
  classes: ClassItem[];
  schoolName: string;
  schoolSubName: string;
  schoolMotto: string;
  academicYear: string;
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
  status: 'Inscrit' | 'Réinscrit' | 'Suspendu' | 'Diplômé';
  matricule: string;
  matriculeNat?: string;
  photo?: string;
  city: string;
}

export default function StudentModule({
  classes,
  schoolName,
  schoolSubName,
  schoolMotto,
  academicYear
}: StudentModuleProps) {
  
  // Persistent registry
  const [students, setStudents] = useState<StudentRecord[]>(() => {
    const saved = localStorage.getItem('erp_student_records');
    if (saved) return JSON.parse(saved);
    // realistic default students (Côte d'Ivoire accents & names + mock photos and matricules nationales)
    return [
      { id: 'std_1', firstName: 'Koffi', lastName: 'Yao Anderson', gender: 'M', birthDate: '2014-04-12', classId: '6A', tutorName: 'Koffi Blaise', tutorPhone: '+225 07 41 85 96 03', status: 'Inscrit', matricule: 'M-2026-4102', matriculeNat: 'CI-0125-9831K', photo: '', city: 'Cocody, Abidjan' },
      { id: 'std_2', firstName: 'Diomandé', lastName: 'Aminata', gender: 'F', birthDate: '2013-08-19', classId: '6B', tutorName: 'Diomandé Lanciné', tutorPhone: '+225 05 52 41 12 74', status: 'Réinscrit', matricule: 'M-2024-1185', matriculeNat: 'CI-0124-7744D', photo: '', city: 'Marcory, Abidjan' },
      { id: 'std_3', firstName: 'Kouassi', lastName: 'Koffi Charles', gender: 'M', birthDate: '2012-11-05', classId: '3A', tutorName: 'Mme Kouassi Hortense', tutorPhone: '+225 07 09 85 12 43', status: 'Inscrit', matricule: 'M-2026-9981', matriculeNat: 'CI-0125-1109C', photo: '', city: 'Bingerville' },
      { id: 'std_4', firstName: 'Sylla', lastName: 'Ibrahim Karim', gender: 'M', birthDate: '2010-01-30', classId: '3B', tutorName: 'Sylla Fatoumata', tutorPhone: '+225 01 02 03 04 05', status: 'Réinscrit', matricule: 'M-2023-0056', matriculeNat: 'CI-0123-5591I', photo: '', city: 'Plateau' },
      { id: 'std_5', firstName: 'Gomez', lastName: 'Marie-Chantal Enola', gender: 'F', birthDate: '2008-07-21', classId: '3A', tutorName: 'Gomez Robert (Ambass.)', tutorPhone: '+225 07 41 02 85 96', status: 'Inscrit', matricule: 'M-2026-0103', matriculeNat: 'CI-0125-0044E', photo: '', city: 'Cocody Riviera' }
    ];
  });

  // Controls
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('ALL');
  const [activeSubTab, setActiveSubTab] = useState<'directory' | 'enroll' | 'id_cards' | 'certificates'>('directory');
  
  // Selection pointer for Card view or docs
  const [activeStudentId, setActiveStudentId] = useState<string>('std_1');

  // Enrollment forms
  const [enrollForm, setEnrollForm] = useState({
    firstName: '',
    lastName: '',
    gender: 'M' as 'M' | 'F',
    birthDate: '2015-01-01',
    classId: classes[0]?.id || '6A',
    tutorName: '',
    tutorPhone: '',
    status: 'Inscrit' as 'Inscrit' | 'Réinscrit',
    city: 'Abidjan',
    matriculeNat: '',
    photo: ''
  });

  // Autosave
  useEffect(() => {
    localStorage.setItem('erp_student_records', JSON.stringify(students));
  }, [students]);

  // Methods
  const handleEnrollStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollForm.firstName.trim() || !enrollForm.lastName.trim()) {
      alert("Veuillez renseigner le nom et le prénom de l'élève !");
      return;
    }

    const uniqueMatricule = 'M-' + academicYear.split('-')[0] + '-' + Math.floor(1000 + Math.random() * 9000);
    // Generate a National Matricule if left blank, formatted as CI-YEAR-6 RANDOM SEED + GENDER code
    const generatedMatriculeNat = enrollForm.matriculeNat.trim() || `CI-01${academicYear.split('-')[0].substring(2)}-${Math.floor(1000 + Math.random() * 9000)}${enrollForm.gender}`;

    const newStudent: StudentRecord = {
      id: 'std_' + Date.now(),
      firstName: enrollForm.firstName.trim(),
      lastName: enrollForm.lastName.trim().toUpperCase(),
      gender: enrollForm.gender,
      birthDate: enrollForm.birthDate,
      classId: enrollForm.classId,
      tutorName: enrollForm.tutorName.trim() || "Tuteur Non Renseigné",
      tutorPhone: enrollForm.tutorPhone.trim() || "+225 00 00 00 00 00",
      status: enrollForm.status,
      matricule: uniqueMatricule,
      matriculeNat: generatedMatriculeNat,
      photo: enrollForm.photo,
      city: enrollForm.city.trim() || "Abidjan"
    };

    setStudents(prev => [newStudent, ...prev]);
    setActiveStudentId(newStudent.id);
    alert(`Élève inscrit(e) avec succès !\nMatricules attribués :\n- Local (Généré) : ${uniqueMatricule}\n- National : ${generatedMatriculeNat}`);
    
    // reset form
    setEnrollForm({
      firstName: '',
      lastName: '',
      gender: 'M',
      birthDate: '2015-01-01',
      classId: classes[0]?.id || '6A',
      tutorName: '',
      tutorPhone: '',
      status: 'Inscrit',
      city: 'Abidjan',
      matriculeNat: '',
      photo: ''
    });
    
    // Redirect to list
    setActiveSubTab('directory');
  };

  const handleDeleteStudent = (id: string, name: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir radier ou supprimer l'élève ${name} ?`)) {
      setStudents(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleUpdateStudentClass = (studentId: string, newClassId: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return { ...s, classId: newClassId };
      }
      return s;
    }));
  };

  const handlePrintCard = () => {
    window.print();
  };

  // Filters logic
  const filteredStudents = students.filter(s => {
    const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
    const tutor = s.tutorName.toLowerCase();
    const mat = s.matricule.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || tutor.includes(searchTerm.toLowerCase()) || mat.includes(searchTerm.toLowerCase());
    const matchesClass = selectedClassFilter === 'ALL' || s.classId === selectedClassFilter;
    return matchesSearch && matchesClass;
  });

  const selectedStudentObj = students.find(s => s.id === activeStudentId) || students[0];

  return (
    <div className="space-y-6">
      
      {/* Header section with specific buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-light">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <GraduationCap className="h-5.5 w-5.5 text-indigo-650" />
            <span>Gestion des Élèves & Scolarité</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium font-sans">
            Pilotez l'école : enregistrez les inscriptions initiales, éditez les cartes d'identité d'élèves, affectez les classes et imprimez les certificats de scolarité.
          </p>
        </div>

        {/* Local module menu controller */}
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveSubTab('directory')}
            className={`cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'directory' ? 'bg-[#0b4998] text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <Contact className="h-4 w-4" />
            Annales & Dossiers
          </button>
          <button 
            onClick={() => setActiveSubTab('enroll')}
            className={`cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'enroll' ? 'bg-[#0b4998] text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <Plus className="h-4 w-4" />
            Nouvel Élève
          </button>
          <button 
            onClick={() => setActiveSubTab('id_cards')}
            className={`cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'id_cards' ? 'bg-[#0b4998] text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <CreditCard className="h-4 w-4" />
            Cartes d'Élèves
          </button>
          <button 
            onClick={() => setActiveSubTab('certificates')}
            className={`cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'certificates' ? 'bg-[#0b4998] text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <FileCheck className="h-4 w-4" />
            Documents
          </button>
        </div>
      </div>

      {/* RENDER VIEW: STUDENTS DIRECTORY */}
      {activeSubTab === 'directory' && (
        <div className="space-y-4">
          
          {/* Filter Bar */}
          <div className="bg-white border border-slate-200/80 p-4 rounded-3xl shadow-xs flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Rechercher par nom, tuteur, matricule officiel..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0b4998] focus:bg-white transition"
              />
            </div>

            <div className="flex gap-2 w-full md:w-auto shrink-0">
              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 focus:outline-none w-full md:w-40"
              >
                <option value="ALL">Toutes les classes</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Directory Listings Table */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-150">
                    <th className="p-4 text-xs font-black uppercase text-slate-500 tracking-wider">Matricules (Local / National)</th>
                    <th className="p-4 text-xs font-black uppercase text-slate-500 tracking-wider">Élève</th>
                    <th className="p-4 text-xs font-black uppercase text-slate-500 tracking-wider text-center">Genre</th>
                    <th className="p-4 text-xs font-black uppercase text-slate-500 tracking-wider">Classe Actuelle</th>
                    <th className="p-4 text-xs font-black uppercase text-slate-500 tracking-wider text-center">Réaffecter</th>
                    <th className="p-4 text-xs font-black uppercase text-slate-500 tracking-wider">Tuteur & Téléphone</th>
                    <th className="p-4 text-xs font-black uppercase text-slate-500 tracking-wider">Statut</th>
                    <th className="p-4 text-xs font-black uppercase text-slate-500 tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map(std => {
                      const matchedClass = classes.find(c => c.id === std.classId);
                      return (
                        <tr key={std.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                          
                          {/* Matricules Local & National */}
                          <td className="p-4 font-mono">
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-[#0b4998]" title="Matricule Local">{std.matricule}</span>
                              <span className="text-[9.5px] font-bold text-slate-500" title="Matricule National">{std.matriculeNat || 'Aucun'}</span>
                            </div>
                          </td>
                          
                          {/* Name & birthday with Photo bubble */}
                          <td className="p-4">
                            <div className="flex items-center gap-2.5">
                              <div className="h-9 w-9 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80 shrink-0 flex items-center justify-center">
                                {std.photo ? (
                                  <img src={std.photo} alt={`${std.firstName} ${std.lastName}`} className="h-full w-full object-cover" />
                                ) : (
                                  <span className="text-sm font-bold">{std.gender === 'F' ? '👩‍🎓' : '👨‍🎓'}</span>
                                )}
                              </div>
                              <div>
                                <span className="font-extrabold text-[#01142e] text-xs block">{std.firstName} {std.lastName}</span>
                                <span className="text-[10px] text-slate-400 font-semibold block">Né le {new Date(std.birthDate).toLocaleDateString('fr-FR', { dateStyle: 'medium' })}</span>
                              </div>
                            </div>
                          </td>

                          {/* Gender */}
                          <td className="p-4 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black ${std.gender === 'F' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}`}>
                              {std.gender}
                            </span>
                          </td>

                          {/* Classroom with dynamic color badge */}
                          <td className="p-4">
                            <span 
                              className="text-[10px] font-extrabold inline-block text-white px-2.5 py-1 rounded-lg"
                              style={{ backgroundColor: matchedClass?.color || '#3b82f6' }}
                            >
                              {matchedClass?.name || std.classId}
                            </span>
                          </td>

                          {/* Class Reassign quick triggers */}
                          <td className="p-4 text-center">
                            <select 
                              value={std.classId}
                              onChange={(e) => handleUpdateStudentClass(std.id, e.target.value)}
                              className="text-[10px] font-bold bg-slate-50 p-1 border border-slate-200 rounded-md select-none focus:outline-none cursor-pointer"
                            >
                              {classes.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                          </td>

                          {/* Tutor details */}
                          <td className="p-4 text-slate-705">
                            <span className="text-xs font-bold block">{std.tutorName}</span>
                            <span className="text-[9.5px] font-mono text-slate-400 block">{std.tutorPhone}</span>
                          </td>

                          {/* Enrollment state */}
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              std.status === 'Inscrit' ? 'bg-emerald-100 text-emerald-800' :
                              std.status === 'Réinscrit' ? 'bg-indigo-150 text-indigo-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                              {std.status}
                            </span>
                          </td>

                          {/* Quick action triggers */}
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button 
                                onClick={() => {
                                  setActiveStudentId(std.id);
                                  setActiveSubTab('id_cards');
                                }}
                                className="cursor-pointer text-[#0b4998] hover:bg-slate-100 p-1.5 rounded-lg transition"
                                title="Carte d'identité"
                              >
                                <CreditCard className="h-3.5 w-3.5" />
                              </button>
                              <button 
                                onClick={() => {
                                  setActiveStudentId(std.id);
                                  setActiveSubTab('certificates');
                                }}
                                className="cursor-pointer text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition"
                                title="Générer Certificat"
                              >
                                <FileCheck className="h-3.5 w-3.5" />
                              </button>
                              <button 
                                onClick={() => handleDeleteStudent(std.id, `${std.firstName} ${std.lastName}`)}
                                className="cursor-pointer text-red-500 hover:text-red-750 hover:bg-red-50 p-1.5 rounded-lg transition"
                                title="Radier l'élève"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>

                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400 font-semibold italic">
                        Aucun élève ne correspond à votre filtre de recherche.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* RENDER VIEW: ENROLLMENT FORM */}
      {activeSubTab === 'enroll' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6 max-w-3xl mx-auto">
          <div>
            <h3 className="text-base font-black text-[#0b4998] flex items-center gap-1.5">
              <span>📝 Formulaire Officiel d'Inscription Scolaire</span>
            </h3>
            <p className="text-xs text-slate-400">
              Remplissez les informations administratives pour créer instantanément un dossier élève et lui attribuer un matricule réglementaire d'établissement.
            </p>
          </div>

          <form onSubmit={handleEnrollStudent} className="space-y-4">
            
            {/* PHOTO UPLOAD ZONE */}
            <div className="space-y-1 bg-slate-50/50 p-4 rounded-2xl border border-slate-150 shadow-inner">
              <label className="text-xs font-black text-slate-700 block uppercase tracking-wider mb-2">📸 Photo d'Identité Scolaire</label>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-20 h-24 bg-white rounded-xl border border-slate-300 overflow-hidden flex items-center justify-center shrink-0 shadow-md relative">
                  {enrollForm.photo ? (
                    <img src={enrollForm.photo} alt="Aperçu" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-slate-400 text-center flex flex-col items-center">
                      <span className="text-3xl block">👤</span>
                      <span className="text-[8px] font-black uppercase tracking-wider block mt-1">Aucune photo</span>
                    </div>
                  )}
                  {enrollForm.photo && (
                    <div className="absolute top-1 right-1 bg-emerald-500 text-white p-0.5 rounded-full shadow">
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 w-full">
                  <div 
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const file = e.dataTransfer.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          if (event.target?.result) {
                            setEnrollForm(prev => ({ ...prev, photo: event.target!.result as string }));
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    onClick={() => document.getElementById('enroll-photo-picker')?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-[#0b4998] hover:bg-slate-50/50 p-4 rounded-xl text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[90px]"
                  >
                    <span className="text-[11px] font-black text-[#0b4998]">Glissez-déposez le fichier image ou cliquez pour parcourir</span>
                    <span className="text-[9px] font-bold text-slate-400 mt-1">Recommandé : Portrait cadré ratio 3:4 (JPEG, PNG, max 1.5 Mo)</span>
                    <input 
                      id="enroll-photo-picker"
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (event.target?.result) {
                              setEnrollForm(prev => ({ ...prev, photo: event.target!.result as string }));
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden" 
                    />
                  </div>
                  {enrollForm.photo && (
                    <button 
                      type="button"
                      onClick={() => setEnrollForm(prev => ({ ...prev, photo: '' }))}
                      className="mt-2 text-[10px] font-black text-rose-500 hover:text-rose-700 transition uppercase tracking-wide flex items-center gap-1 cursor-pointer"
                    >
                      <span>❌ Retirer la photo sélectionnée</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Prénom(s) de l'élève</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Anderson Koffi" 
                  value={enrollForm.firstName}
                  onChange={(e) => setEnrollForm(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Nom de famille</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: YAO" 
                  value={enrollForm.lastName}
                  onChange={(e) => setEnrollForm(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white capitalize"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Genre</label>
                <select 
                  value={enrollForm.gender}
                  onChange={(e) => setEnrollForm(prev => ({ ...prev, gender: e.target.value as any }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                >
                  <option value="M">Masculin (M)</option>
                  <option value="F">Féminin (F)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Date de naissance</label>
                <input 
                  type="date" 
                  value={enrollForm.birthDate}
                  onChange={(e) => setEnrollForm(prev => ({ ...prev, birthDate: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Ville de résidence</label>
                <input 
                  type="text" 
                  placeholder="Ex: Cocody, Abidjan" 
                  value={enrollForm.city}
                  onChange={(e) => setEnrollForm(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-3 border-b border-slate-100">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Affectation Classe</label>
                <select 
                  value={enrollForm.classId}
                  onChange={(e) => setEnrollForm(prev => ({ ...prev, classId: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-[#dee2e6] rounded-xl text-xs font-bold focus:outline-none"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Régime de Scolarité</label>
                <select 
                  value={enrollForm.status}
                  onChange={(e) => setEnrollForm(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-[#dee2e6] rounded-xl text-xs font-bold focus:outline-none"
                >
                  <option value="Inscrit">Nouvelle Inscription (Inscrit)</option>
                  <option value="Réinscrit">Réinscription d'office (Réinscrit)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 flex items-center gap-1">
                  <span>Matricule National</span>
                  <span className="text-[9.5px] text-[#ee7b11] font-bold">(Saisie / Auto)</span>
                </label>
                <input 
                  type="text" 
                  placeholder="Laissé vide = auto-généré" 
                  value={enrollForm.matriculeNat}
                  onChange={(e) => setEnrollForm(prev => ({ ...prev, matriculeNat: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Responsable Tuteur (Parents d'élèves)</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Nom Complet du Tuteur</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ex: M. YAO Kouamé Augustin" 
                    value={enrollForm.tutorName}
                    onChange={(e) => setEnrollForm(prev => ({ ...prev, tutorName: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Téléphone Mobile Tuteur (Wave/Orange)</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ex: +225 07 55 44 22 11" 
                    value={enrollForm.tutorPhone}
                    onChange={(e) => setEnrollForm(prev => ({ ...prev, tutorPhone: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setActiveSubTab('directory')}
                className="cursor-pointer px-4.5 py-2 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition border border-slate-200"
              >
                Annuler
              </button>
              <button 
                type="submit"
                className="cursor-pointer px-5 py-2 bg-[#ee7b11] hover:bg-[#d66f0e] text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition shadow-sm"
              >
                <Check className="h-4 w-4" />
                Soumettre et Générer le Dossier
              </button>
            </div>

          </form>
        </div>
      )}

      {/* RENDER VIEW: SCHOOL ID CARDS GENERATOR */}
      {activeSubTab === 'id_cards' && (
        <div className="space-y-6">
          
          <div className="bg-white border border-slate-200 p-4 rounded-3xl flex flex-wrap gap-2 items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Choisir un élève pour générer sa carte :</span>
              <select 
                value={activeStudentId}
                onChange={(e) => setActiveStudentId(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-bold text-slate-700"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                ))}
              </select>
            </div>

            <button 
              onClick={handlePrintCard}
              className="cursor-pointer px-4 py-1.5 bg-[#0b4998] hover:bg-[#093d80] text-white font-black text-xs rounded-xl flex items-center gap-1.5 transition"
            >
              <Printer className="h-3.5 w-3.5" />
              Imprimer la carte scolaire
            </button>
          </div>

          <p className="text-xs text-slate-450 italic font-semibold text-center pb-2">
            ⚠️ Utilisez la commande système d'impression (Ctrl+P ou Cmd+P) pour exporter directement un PDF de votre carte.
          </p>

          {/* Holographic ID card display container (styled nicely box) */}
          <div className="flex justify-center">
            
            {selectedStudentObj ? (
              <div 
                id="school-card-print-area"
                className="w-[380px] h-[230px] rounded-2xl bg-gradient-to-br from-[#0b4998] via-[#093d80] to-[#072c5e] border-2 border-[#f3aa1c] p-4 text-white shadow-xl flex flex-col justify-between relative overflow-hidden font-sans select-none"
              >
                {/* Back embellishments design elements */}
                <div className="absolute right-0 top-0 -translate-y-8 translate-x-8 w-28 h-28 bg-[#ee7b11]/15 rounded-full pointer-events-none" />
                <div className="absolute left-0 bottom-0 translate-y-12 -translate-x-4 w-28 h-28 bg-white/5 rounded-full pointer-events-none" />

                {/* ID Header */}
                <div className="flex items-center justify-between pb-2 border-b border-white/20">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg">🛡️</span>
                    <div>
                      <h4 className="text-[10px] font-black uppercase text-white tracking-wider leading-none">{schoolName}</h4>
                      <span className="text-[7.5px] italic font-semibold text-[#f3aa1c] block leading-none">{schoolSubName}</span>
                    </div>
                  </div>
                  <span className="text-[7.5px] font-black bg-[#ee7b11] text-white px-1.5 py-0.5 rounded uppercase font-mono tracking-wider">CARTE ÉLÈVE</span>
                </div>

                {/* Card Main info row Grid */}
                <div className="grid grid-cols-12 gap-3 items-center flex-1 py-1.5">
                  
                  {/* Photo place */}
                  <div className="col-span-4 flex flex-col items-center">
                    <div className="w-[66px] h-[82px] border border-white/30 rounded-lg bg-slate-900/60 flex items-center justify-center relative overflow-hidden shadow-inner">
                      {selectedStudentObj.photo ? (
                        <img src={selectedStudentObj.photo} alt="Photo élève" className="h-full w-full object-cover" />
                      ) : selectedStudentObj.gender === 'F' ? (
                        <div className="text-center font-extrabold text-[28px] text-pink-300">👩</div>
                      ) : (
                        <div className="text-center font-extrabold text-[28px] text-blue-300">👨</div>
                      )}
                      <div className="absolute bottom-0 inset-x-0 bg-slate-950/60 py-0.2 text-[6.5px] font-black uppercase text-center text-slate-100">
                        {schoolName.substring(0, 3)}
                      </div>
                    </div>
                    <span className="text-[7px] text-[#f3aa1c] uppercase font-black tracking-widest mt-1">Photo Badge</span>
                  </div>

                  {/* Text details */}
                  <div className="col-span-8 space-y-1 text-left">
                    <div>
                      <span className="text-[7.5px] font-bold text-slate-300 uppercase block">Élève</span>
                      <span className="text-xs font-black uppercase leading-tight block text-white">{selectedStudentObj.lastName}</span>
                      <span className="text-xs font-black tracking-wide leading-none block text-[#f3aa1c]">{selectedStudentObj.firstName}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-[8px] font-semibold text-slate-100">
                      <div>
                        <span className="text-[6.5px] font-bold text-slate-400 uppercase">Classe</span>
                        <span className="block font-black text-rose-300">
                          {classes.find(c => c.id === selectedStudentObj.classId)?.name || selectedStudentObj.classId}
                        </span>
                      </div>
                      <div>
                        <span className="text-[6.5px] font-bold text-slate-400 uppercase">Année</span>
                        <span className="block font-bold">{academicYear}</span>
                      </div>
                    </div>

                    <div className="text-[7.5px] text-slate-350 leading-tight">
                      <span className="font-bold text-slate-400 uppercase">Tuteur :</span> <span className="font-bold">{selectedStudentObj.tutorName}</span> <br />
                      <span className="font-bold text-slate-400 uppercase">Mob :</span> <span className="font-mono font-bold text-white">{selectedStudentObj.tutorPhone}</span>
                    </div>
                  </div>

                </div>

                {/* ID Footer Card */}
                <div className="flex items-center justify-between pt-1 border-t border-white/20 text-[6.5px] text-slate-400 font-bold">
                  <div className="flex flex-col text-left leading-none space-y-0.5">
                    <div>
                      <span className="uppercase text-slate-300">M. Local :</span>
                      <span className="font-mono text-white text-[7.5px] font-black ml-1">{selectedStudentObj.matricule}</span>
                    </div>
                    <div>
                      <span className="uppercase text-slate-300">M. National :</span>
                      <span className="font-mono text-[#f3aa1c] text-[7.5px] font-black ml-1">{selectedStudentObj.matriculeNat || 'AUCUN'}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span>Devise : </span>
                    <span className="italic text-[#f3aa1c] font-black">"{schoolMotto}"</span>
                  </div>
                </div>

              </div>
            ) : (
              <span className="text-slate-400 italic">Veuillez inscrire un élève pour générer sa carte.</span>
            )}

          </div>

        </div>
      )}

      {/* RENDER VIEW: CERTIFICATES EXPORTER */}
      {activeSubTab === 'certificates' && (
        <div className="space-y-6">
          
          <div className="bg-white border border-slate-200 p-4 rounded-3xl flex flex-wrap gap-2 items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Choisir l'élève destinataire :</span>
              <select 
                value={activeStudentId}
                onChange={(e) => setActiveStudentId(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-bold text-slate-700"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                ))}
              </select>
            </div>

            <button 
              onClick={handlePrintCard}
              className="cursor-pointer px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center gap-1.5 transition"
            >
              <Printer className="h-3.5 w-3.5" />
              Imprimer l'Acte Administratif
            </button>
          </div>

          {/* Classic formal legal letter card */}
          {selectedStudentObj ? (
            <div className="max-w-xl mx-auto bg-white border border-slate-300 p-8 text-black shadow-lg font-serif min-h-[520px] relative space-y-6">
              
              {/* Header Letter */}
              <div className="flex items-start justify-between border-b pb-4">
                <div className="text-left font-sans">
                  <h3 className="text-xs font-black text-[#0b4998] tracking-widest uppercase leading-tight">{schoolName}</h3>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">{schoolSubName}</span>
                  <span className="text-[9px] italic text-[#ee7b11] block">"{schoolMotto}"</span>
                  <span className="text-[8px] text-slate-450 font-serif mt-1 block">Région Administrative d'Abidjan</span>
                </div>
                
                <div className="text-right font-sans text-[8px] text-slate-400 font-semibold space-y-0.5">
                  <span>Année Scolaire {academicYear}</span> <br />
                  <span>Matricule : {selectedStudentObj.matricule}</span>
                </div>
              </div>

              {/* Title Document */}
              <div className="text-center py-6">
                <h2 className="text-lg font-black uppercase tracking-wider text-slate-900 underline underline-offset-4">
                  CERTIFICAT DE SCOLARITÉ
                </h2>
                <span className="text-[9.5px] font-sans font-bold text-slate-400 uppercase tracking-widest block mt-1">POUR VALOIR CE QUE DE DROIT</span>
              </div>

              {/* Body Letter text */}
              <div className="text-sm text-slate-800 leading-relaxed space-y-4 text-justify font-sans">
                <p>
                  Je soussigné, **Directeur de l'établissement d'enseignement général {schoolName}**, certifie par le présent certificat que l'élève désigné ci-après :
                </p>

                <div className="pl-6 space-y-1.5 border-l-2 border-slate-200">
                  <div>
                    <span className="text-[11px] uppercase font-bold text-slate-400 block">Nom complet et Prénoms :</span>
                    <span className="text-sm font-black text-slate-900 font-sans">{selectedStudentObj.lastName} {selectedStudentObj.firstName}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[11px] uppercase font-bold text-slate-400 block">Matricule Local (Établissement) :</span>
                      <span className="text-xs font-black text-slate-900 font-mono">{selectedStudentObj.matricule}</span>
                    </div>
                    <div>
                      <span className="text-[11px] uppercase font-bold text-slate-400 block">Matricule National :</span>
                      <span className="text-xs font-black text-[#ee7b11] font-mono">{selectedStudentObj.matriculeNat || 'Aucun'}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] uppercase font-bold text-slate-400 block">Date et Ville de naissance :</span>
                    <span className="text-xs font-semibold text-slate-800">
                      Le {new Date(selectedStudentObj.birthDate).toLocaleDateString('fr-FR', { dateStyle: 'long' })} à {selectedStudentObj.city}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] uppercase font-bold text-slate-400 block">Classe d'inscription actuelle :</span>
                    <span className="text-xs font-black text-[#0b4998]">
                      Classe officielle de {classes.find(c => c.id === selectedStudentObj.classId)?.name || selectedStudentObj.classId}
                    </span>
                  </div>
                </div>

                <p>
                  est régulièrement inscrit(e) et poursuit ses études avec assiduité au sein de notre établissement pour le compte de l'exercice scolaire officiel **{academicYear}**.
                </p>

                <p>
                  En foi de quoi, le présent certificat lui est délivré à toutes fins utiles, notamment pour servir de justificatif de prestations familiales ou d'écolage.
                </p>
              </div>

              {/* Date & signatures blocks */}
              <div className="pt-8 flex justify-between items-center text-xs font-sans">
                <div className="text-left text-slate-400 font-semibold">
                  <span>Réf : CS-EC-{Math.floor(1000 + Math.random()*9000)}-2026</span>
                </div>
                
                <div className="text-right space-y-1">
                  <span>Fait à Abidjan, le {new Date().toLocaleDateString('fr-FR', { dateStyle: 'long' })}</span> <br />
                  <span className="font-extrabold block text-slate-900 pb-12">Le Directeur de l'Établissement</span>
                  
                  {/* Digital Signature Emblem */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-850 rounded-xl">
                    <span className="text-[9px] font-black uppercase text-indigo-700 font-mono tracking-widest flex items-center gap-1">
                      <Award className="h-3 w-3 text-[#ee7b11]" />
                      <span>VISA CONTRÔLÉ DIRECT</span>
                    </span>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <span className="text-slate-400 italic">Veuillez inscrire un élève pour générer ses actes officiels.</span>
          )}

        </div>
      )}

    </div>
  );
}
