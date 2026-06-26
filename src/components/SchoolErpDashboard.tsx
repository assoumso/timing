import React, { useState } from 'react';
import { 
  Users, 
  GraduationCap, 
  Coins, 
  Clock, 
  TrendingUp, 
  BookOpen, 
  Activity, 
  Calendar, 
  ArrowUpRight, 
  BellRing, 
  FileCheck,
  UserCheck
} from 'lucide-react';
import { ClassItem, TeacherItem, RoomItem, ScheduleCourse } from '../types';

interface SchoolErpDashboardProps {
  classes: ClassItem[];
  teachers: TeacherItem[];
  rooms: RoomItem[];
  courses: ScheduleCourse[];
  isScheduleValidated: boolean;
  schoolName: string;
  academicYear: string;
  onNavigateToModule: (moduleId: string) => void;
}

export default function SchoolErpDashboard({
  classes,
  teachers,
  rooms,
  courses,
  isScheduleValidated,
  schoolName,
  academicYear,
  onNavigateToModule
}: SchoolErpDashboardProps) {
  // Let's retrieve quick local counts for visual fidelity
  const totalStudents = 342; // default simulated
  const attendanceRate = "96.4%";
  
  // Financial indicators
  const totalInvoiced = 48500000; // 48.5 M FCFA
  const totalCollected = 39800000; // 39.8 M FCFA
  const outstandingDebt = totalInvoiced - totalCollected;

  return (
    <div className="space-y-6">
      {/* Visual greeting banner */}
      <div className="bg-gradient-to-br from-[#0b4998] via-[#093d80] to-[#072c5e] border border-[#f3aa1c]/30 text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-[#ee7b11]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-2.5 z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#ee7b11] text-white border border-[#f3aa1c]/30 shadow-sm">
            🛡️ ERP Scolaire Global
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
            Plateforme Unifiée d'Administration <br className="hidden md:inline" />
            <span className="text-[#f3aa1c]">{schoolName}</span>
          </h2>
          <p className="text-sm text-blue-150 max-w-2xl font-light">
            Année Académique **{academicYear}** • Vous naviguez en mode centralisé. Accédez à la scolarité, au dossier des enseignants, aux notes scolaires et à l'ordonnancement sans conflits.
          </p>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-1 text-right bg-white/5 border border-white/10 rounded-2xl p-4 z-10 backdrop-blur-md">
          <span className="text-[10px] uppercase font-bold text-slate-350">Statut de la structure</span>
          <span className="text-slate-205 text-xs font-bold font-mono">Classes: {classes.length} • Salles: {rooms.length}</span>
          <div className="mt-2.5 flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${isScheduleValidated ? 'bg-emerald-550' : 'bg-amber-500'} animate-pulse`} />
            <span className="text-[10px] font-black uppercase text-slate-100 bg-slate-900/60 px-2 py-0.5 rounded border border-white/5">
              {isScheduleValidated ? '🎓 Emploi Validé Direct' : '⚙️ Brouillon en cours'}
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Key Performance Indicators (Bento Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI: Enrolments */}
        <div 
          onClick={() => onNavigateToModule('students')}
          className="bg-white border border-slate-200/80 p-5 rounded-3xl hover:border-[#f3aa1c]/40 hover:shadow-md transition duration-200 group cursor-pointer flex items-start justify-between"
        >
          <div className="space-y-3">
            <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Effectif Élèves</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-[font-sans] text-slate-900">{totalStudents}</span>
              <span className="text-xs text-emerald-600 font-bold">+18 inscrits</span>
            </div>
            <div className="text-[10.5px] text-slate-500 font-semibold flex items-center gap-1">
              <span>Filières Actives: 3</span>
              <span className="text-slate-300">•</span>
              <span>Niveaux: 6</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-650 group-hover:bg-[#0b4998] group-hover:text-white transition-colors duration-200">
            <GraduationCap className="h-5 w-5" />
          </div>
        </div>

        {/* KPI: Tuition fees / Finances */}
        <div 
          onClick={() => onNavigateToModule('financials')}
          className="bg-white border border-slate-200/80 p-5 rounded-3xl hover:border-[#f3aa1c]/40 hover:shadow-md transition duration-200 group cursor-pointer flex items-start justify-between"
        >
          <div className="space-y-3">
            <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Recouvrement Scolarité</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl md:text-2xl font-black text-slate-900 font-mono">{(totalCollected / 1000000).toFixed(1)}M <span className="text-xs font-black">FCFA</span></span>
              <span className="text-xs text-slate-400 font-semibold">sur 48.5M</span>
            </div>
            <div className="text-[10.5px] text-red-600 font-bold flex items-center gap-1">
              <span>Solde restant: {(outstandingDebt / 1000000).toFixed(1)}M FCFA</span>
              <span className="px-1.5 py-0.2 rounded-full bg-red-100 text-red-700 text-[8.5px]">82% Payé</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-amber-50 text-[#ee7b11] group-hover:bg-[#ee7b11] group-hover:text-white transition-colors duration-200">
            <Coins className="h-5 w-5" />
          </div>
        </div>

        {/* KPI: Global Daily Attendance */}
        <div 
          onClick={() => onNavigateToModule('attendance')}
          className="bg-gradient-to-br from-emerald-50/65 via-emerald-50/15 to-white border border-emerald-150 p-5 rounded-3xl hover:border-emerald-400 hover:shadow-md transition duration-200 group cursor-pointer flex items-start justify-between"
        >
          <div className="space-y-3">
            <span className="text-emerald-850 font-extrabold text-[10.5px] uppercase tracking-wider">Présence Journalière</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900">{attendanceRate}</span>
              <span className="text-xs text-emerald-650 font-bold">Excellent</span>
            </div>
            <div className="text-[10.5px] text-slate-500 font-semibold flex items-center gap-1">
              <span>Absences signalées: 4</span>
              <span className="text-slate-300">•</span>
              <span>Retards: 2</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-650 group-hover:bg-[#0b4998] group-hover:text-white transition-colors duration-200">
            <Activity className="h-5 w-5" />
          </div>
        </div>

        {/* KPI: Existing Schedule Engine status */}
        <div 
          onClick={() => onNavigateToModule('schedule_module')}
          className="bg-gradient-to-br from-purple-50/65 via-purple-50/15 to-white border border-purple-150 p-5 rounded-3xl hover:border-purple-400 hover:shadow-md transition duration-200 group cursor-pointer flex items-start justify-between"
        >
          <div className="space-y-3">
            <span className="text-purple-850 font-extrabold text-[10.5px] uppercase tracking-wider">Planning & Cours</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900">{courses.length}</span>
              <span className="text-xs text-slate-550 font-semibold">Crén. planifiés</span>
            </div>
            <div className="text-[10.5px] text-slate-500 font-semibold flex items-center gap-1">
              <span>Enseignants occupés: {teachers.length}</span>
              <span className="text-slate-300">•</span>
              <span>Salles libres</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-purple-100 text-purple-600 group-hover:bg-[#0b4998] group-hover:text-white transition-colors duration-200">
            <Calendar className="h-5 w-5" />
          </div>
        </div>

      </div>

      {/* Main split sections: Left Recent Activities, Right quick launchers map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: General activity notices / live reports */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-black uppercase text-slate-900 tracking-tight flex items-center gap-2">
                <BellRing className="h-4.5 w-4.5 text-[#ee7b11]" />
                <span>Rappels Administratifs & Activités Récentes</span>
              </h3>
              <span className="text-[10px] font-bold text-slate-400">Temps réel</span>
            </div>

            <div className="space-y-3.5">
              
              {/* Report row */}
              <div className="flex gap-3 items-start p-2.5 rounded-2xl bg-slate-50 border border-slate-150/60 hover:bg-slate-100/50 transition">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-700 font-black text-xs shrink-0 font-mono">
                  INFO
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>Validation visa requise pour le planning d'examens</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-[#ee7b11]" />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    La direction générale de **{schoolName}** doit contrôler et signer électroniquement la structure d'heures du planning rédigée par le surveillant général.
                  </p>
                  <span className="text-[9px] font-mono text-slate-400">Il y a 10 minutes</span>
                </div>
              </div>

              {/* Inscriptions Alert */}
              <div className="flex gap-3 items-start p-2.5 rounded-2xl bg-slate-50 border border-slate-150/60 hover:bg-slate-100/50 transition">
                <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700 font-black text-xs shrink-0 font-mono">
                  SCOL
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>3 nouvelles inscriptions enregistrées ce matin (Portail Parent)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Dossiers en attente d'affectation définitive : **Koffi Yao (6ème A)**, **Diomandé Aminata (3ème B)** et **Sylla Ibrahim (Terminal C)**.
                  </p>
                  <span className="text-[9px] font-mono text-slate-400">Il y a 2 heures</span>
                </div>
              </div>

              {/* Finance Alert */}
              <div className="flex gap-3 items-start p-2.5 rounded-2xl bg-slate-50 border border-slate-150/60 hover:bg-slate-100/50 transition">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 font-black text-xs shrink-0 font-mono">
                  FIN
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>Versement Scolarité de 450,000 FCFA comptabilisé</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Paiement reçu en agence Wave de la part du tuteur de **Gomez Marie-Chantal** (Filière Primaire). Reçu n° **REC-2026-0041** approuvé.
                  </p>
                  <span className="text-[9px] font-mono text-slate-400">Il y a 4 heures</span>
                </div>
              </div>

              {/* Presence Alert */}
              <div className="flex gap-3 items-start p-2.5 rounded-2xl bg-slate-50 border border-slate-150/60 hover:bg-slate-100/50 transition">
                <div className="p-2 rounded-xl bg-red-100 text-red-700 font-black text-xs shrink-0 font-mono">
                  ABS
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>Absence Enseignant signalée - M. Koffi (Anglais)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Absence temporaire déclarée sur le créneau **M2 (Lundi)**. Le surveillant général recherche un remplacement à l'aide de l'outil "Professeurs Libres".
                  </p>
                  <span className="text-[9px] font-mono text-slate-400">Hier à 17h30</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right: Quick launchers map to jump to sub-modules */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between h-full">
            <div>
              <h3 className="text-sm font-black uppercase text-slate-900 tracking-tight pb-3 border-b border-slate-100 mb-4 flex items-center gap-2">
                <span>⚡ Raccourcis Modules ERP</span>
              </h3>

              <div className="grid grid-cols-1 gap-2.5">
                
                <button 
                  onClick={() => onNavigateToModule('school_structure')}
                  className="cursor-pointer text-left w-full p-3 rounded-2xl bg-slate-50 hover:bg-[#0b4998]/5 border border-slate-150 hover:border-[#0b4998]/30 transition group flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-[#0b4998]/10 text-[#0b4998] group-hover:bg-[#0b4998] group-hover:text-white transition">🏛️</span>
                    <div>
                      <span className="font-bold text-xs text-slate-800 block">Structure & Administration</span>
                      <span className="text-[9.5px] text-slate-400 font-semibold block">Filières, Niveaux, Classes, Coefficients...</span>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-[#0b4998] transition" />
                </button>

                <button 
                  onClick={() => onNavigateToModule('students')}
                  className="cursor-pointer text-left w-full p-3 rounded-2xl bg-slate-50 hover:bg-[#ee7b11]/5 border border-slate-150 hover:border-[#ee7b11]/30 transition group flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-[#ee7b11]/10 text-[#ee7b11] group-hover:bg-[#ee7b11] group-hover:text-white transition">🎓</span>
                    <div>
                      <span className="font-bold text-xs text-slate-800 block">Dossiers Élèves & Inscriptions</span>
                      <span className="text-[9.5px] text-slate-400 font-semibold block">Cartes Scolaires, Affectations...</span>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-[#ee7b11] transition" />
                </button>

                <button 
                  onClick={() => onNavigateToModule('evaluations')}
                  className="cursor-pointer text-left w-full p-3 rounded-2xl bg-slate-50 hover:bg-emerald-500/5 border border-slate-150 hover:border-emerald-500/30 transition group flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800 group-hover:bg-emerald-600 group-hover:text-white transition">📝</span>
                    <div>
                      <span className="font-bold text-xs text-slate-800 block">Évaluations, Bulletins & Notes</span>
                      <span className="text-[9.5px] text-slate-400 font-semibold block">Moyennes, Ranks, Examens continus...</span>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-600 transition" />
                </button>

                <button 
                  onClick={() => onNavigateToModule('financials')}
                  className="cursor-pointer text-left w-full p-3 rounded-2xl bg-slate-50 hover:bg-amber-500/5 border border-slate-150 hover:border-amber-500/30 transition group flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-amber-100 text-amber-800 group-hover:bg-amber-600 group-hover:text-white transition">💵</span>
                    <div>
                      <span className="font-bold text-xs text-slate-800 block">Comptabilité, Frais & Invoices</span>
                      <span className="text-[9.5px] text-slate-400 font-semibold block">Wave/Orange, Recouvrements bourses...</span>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-amber-600 transition" />
                </button>

              </div>
            </div>

            <div className="p-3 bg-indigo-50/60 border border-indigo-150 rounded-2xl mt-4">
              <span className="text-[9.5px] font-black tracking-wider text-slate-400 block uppercase mb-1">Rapport rapide d'audit</span>
              <p className="text-[10px] text-indigo-950/70 font-semibold leading-normal">
                Tout est en règle. Aucune anomalie n'a été détectée dans l'ERP ce jour. Les conflits horaires restent surveillés par le validateur Supabase.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
