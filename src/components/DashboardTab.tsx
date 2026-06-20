import React, { useState } from 'react';
import { ClassItem, TeacherItem, RoomItem, SubjectItem, ScheduleCourse, Conflict, DAYS, TIME_SLOTS, ActivationCode } from '../types';
import { 
  AlertCircle, 
  AlertTriangle, 
  Users, 
  GraduationCap, 
  School, 
  BookOpen, 
  Clock, 
  Sparkles,
  Database,
  UploadCloud,
  DownloadCloud,
  Copy,
  RefreshCw,
  Check,
  Calendar,
  Key,
  Shield,
  Trash2
} from 'lucide-react';

interface DashboardTabProps {
  classes: ClassItem[];
  teachers: TeacherItem[];
  rooms: RoomItem[];
  courses: ScheduleCourse[];
  conflicts: Conflict[];
  onSetClassFilter: (classId: string) => void;
  onSetTab: (tab: any) => void;
  onClearAll: () => void;
  onResetData: () => void;
  // Supabase Sync integration props
  supabaseStatus: 'idle' | 'connecting' | 'synced' | 'error_tables' | 'error_auth';
  supabaseErrorMsg: string;
  isSyncing: boolean;
  onSaveToSupabase: () => Promise<void>;
  onLoadFromSupabase: () => Promise<void>;
  activationCodes: ActivationCode[];
  onGenerateNewCode: () => void;
  onDeleteActivationCode: (code: string) => void;
  schoolName?: string;
  isEditable?: boolean;
  isScheduleValidated?: boolean;
  onToggleScheduleValidation?: () => void;
  schoolDirector?: string;
  academicYear?: string;
}

export default function DashboardTab({
  classes,
  teachers,
  rooms,
  courses,
  conflicts,
  onSetClassFilter,
  onSetTab,
  onClearAll,
  onResetData,
  supabaseStatus,
  supabaseErrorMsg,
  isSyncing,
  onSaveToSupabase,
  onLoadFromSupabase,
  activationCodes = [],
  onGenerateNewCode,
  onDeleteActivationCode,
  schoolName = "ÉCOLE DES FAMILLES",
  isEditable = true,
  isScheduleValidated = false,
  onToggleScheduleValidation = () => {},
  schoolDirector = "Le Directeur",
  academicYear = "2025-2026"
}: DashboardTabProps) {
  
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSqlGuide, setShowSqlGuide] = useState(false);

  const sqlSetupScript = `-- SCRIPT DE CONFIGURATION REUQUIS POUR DEPLOYER BARAKATPLANNING
-- À coller dans l'éditeur SQL (SQL Editor) de votre tableau de bord Supabase

CREATE TABLE IF NOT EXISTS barakat_planning (
  id TEXT PRIMARY KEY DEFAULT 'default',
  classes JSONB NOT NULL,
  teachers JSONB NOT NULL,
  rooms JSONB NOT NULL,
  subjects JSONB NOT NULL,
  courses JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Désactivez ou configurez les règles de sécurité RLS pour l'accès anonyme public
ALTER TABLE barakat_planning ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Accès anonyme public" ON barakat_planning;
CREATE POLICY "Accès anonyme public" ON barakat_planning FOR ALL USING (true) WITH CHECK (true);

-- Attribution explicite des privilèges PostgreSQL
GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE barakat_planning TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE barakat_planning TO authenticated;
GRANT ALL ON TABLE barakat_planning TO postgres;
GRANT ALL ON TABLE barakat_planning TO service_role;`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSetupScript);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const errors = conflicts.filter(c => c.severity === 'error');
  const warnings = conflicts.filter(c => c.severity === 'warning');


  // Calculates schedule coverage rate
  const totalPossibleSlots = classes.length * DAYS.length * TIME_SLOTS.length;
  const scheduledCount = courses.length;
  const coveragePercent = totalPossibleSlots > 0 ? Math.round((scheduledCount / totalPossibleSlots) * 100) : 0;

  // Calcul du taux d'occupation par salle
  const roomOccupiedCounts = rooms.map(room => {
    const count = courses.filter(c => c.roomId === room.id).length;
    const maxCapacityHours = DAYS.length * TIME_SLOTS.length;
    const utilization = Math.round((count / maxCapacityHours) * 100);
    return { ...room, count, utilization };
  });

  return (
    <div className="space-y-6">
      {/* Banner / Header info */}
      <div className="bg-gradient-to-br from-[#0b4998] via-[#093d80] to-[#072c5e] border border-[#f3aa1c]/30 text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#ee7b11]/20 text-amber-205 border border-[#f3aa1c]/30">
            <School className="h-3.5 w-3.5 text-[#f3aa1c]" />
            <span>{schoolName.toUpperCase()} — GESTION</span>
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Structurez vos plannings sans conflits
          </h2>
          <p className="text-sm text-blue-100 max-w-xl">
            Bienvenue sur le tableau de bord d’administration. Suivez la charge d’enseignement, libérez les salles sur-occupées et organisez efficacement vos plannings.
          </p>
        </div>
        {isEditable ? (
          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              onClick={onResetData}
              className="cursor-pointer px-4 py-2.5 text-xs font-semibold bg-white/10 hover:bg-white/25 text-white border border-white/15 active:scale-95 transition rounded-xl"
            >
              Réinitialiser les données
            </button>
            <button
              onClick={onClearAll}
              className="cursor-pointer px-4 py-2.5 text-xs font-semibold bg-red-500/25 hover:bg-red-500/45 text-red-100 border border-red-500/30 active:scale-95 transition rounded-xl"
            >
              Vider le planning
            </button>
          </div>
        ) : (
          <div className="bg-[#ee7b11]/20 border border-[#f3aa1c]/40 text-[#f3aa1c] px-4 py-2 rounded-xl text-xs font-bold leading-none select-none flex items-center gap-1.5 shadow-sm">
            <span>⚖️ Profil Consultation de Direction</span>
          </div>
        )}
      </div>

      {/* Supabase Integration Live Panel */}
      <div id="school-security-backup-panel" className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${
              supabaseStatus === 'synced' ? 'bg-emerald-50 text-emerald-600' :
              supabaseStatus === 'connecting' ? 'bg-amber-50 text-amber-600' :
              'bg-slate-50 text-slate-600'
            }`}>
              <Database className={`h-5 w-5 ${supabaseStatus === 'connecting' ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Coffre de Sécurité & Sauvegarde Cloud</span>
                <span className={`h-2.5 w-2.5 rounded-full ${
                  supabaseStatus === 'synced' ? 'bg-emerald-500 animate-pulse' :
                  supabaseStatus === 'connecting' ? 'bg-amber-500 animate-pulse' :
                  supabaseStatus === 'error_tables' ? 'bg-amber-500 animate-pulse' :
                  'bg-slate-300'
                }`} />
              </h3>
              <p className="text-xs text-slate-550 font-semibold font-sans">
                Espace de stockage académique sécurisé de l'établissement — <span className="text-[#ee7b11] font-extrabold uppercase tracking-wide">Données chiffrées</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto self-stretch md:self-auto">
            <button
              onClick={onLoadFromSupabase}
              disabled={isSyncing || !isEditable}
              className="cursor-pointer flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-950 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition disabled:opacity-50"
              title={isEditable ? "Restaurer la dernière version sauvegardée" : "Action réservée au Super Admin"}
            >
              <DownloadCloud className="h-4 w-4 text-[#0b4998]" />
              <span>Restaurer / Charger</span>
            </button>
            <button
              onClick={() => onSaveToSupabase()}
              disabled={isSyncing || !isEditable}
              className="cursor-pointer flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#0b4998] hover:bg-[#093d80] shadow-sm border border-[#f3aa1c]/30 rounded-xl transition disabled:opacity-50"
              title={isEditable ? "Créer un point de sauvegarde de l'état actuel" : "Action réservée au Super Admin"}
            >
              {isSyncing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <UploadCloud className="h-4 w-4 text-[#f3aa1c]" />
              )}
              <span>Sauvegarder l’état actuel</span>
            </button>
          </div>
        </div>

        {/* Status Messages */}
        {supabaseStatus === 'synced' && (
          <div className="p-3 bg-emerald-50/70 border border-emerald-150 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-800">
            <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
            <span className="font-semibold">Liaison Cloud de Sécurité Établie & Opérationnelle. Vos plannings, salles et coefficients sont sauvegardés en toute sécurité.</span>
          </div>
        )}

        {supabaseStatus === 'connecting' && (
          <div className="p-3 bg-amber-50/70 border border-amber-150 rounded-2xl flex items-center gap-2.5 text-xs text-amber-800">
            <RefreshCw className="h-4 w-4 animate-spin text-[#ee7b11] shrink-0" />
            <span className="font-semibold">Vérification de l'intégrité de la liaison et archivage cloud en cours...</span>
          </div>
        )}

        {supabaseStatus === 'error_tables' && (
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 text-amber-950 border border-amber-200 rounded-2xl space-y-3 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2.5 text-xs font-bold text-amber-900">
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                  <span>Initialisation académique requise : Créer la table de stockage principale</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSqlGuide(!showSqlGuide)}
                    className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-705 border border-slate-200 text-xs font-bold transition shadow-xs"
                  >
                    <span>{showSqlGuide ? "Masquer la technique" : "Voir le Guide SQL"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={onLoadFromSupabase}
                    disabled={isSyncing}
                    className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#0b4998] hover:bg-[#093d80] text-white text-xs font-black transition shadow-sm active:scale-95 shrink-0"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>Relancer la Liaison</span>
                  </button>
                </div>
              </div>
              <p className="text-xs leading-relaxed max-w-4xl font-semibold opacity-90 text-slate-600">
                La liaison avec le serveur est active, mais la table de données n'a pas encore été initialisée dans votre espace de stockage.
              </p>
            </div>

            {showSqlGuide && (
              <div className="bg-slate-905 border border-blue-100 rounded-2xl overflow-hidden shadow-xs">
                <div className="px-4 py-3 bg-blue-50/50 text-xs font-bold text-slate-900 border-b border-blue-100/60 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-[#0b4998]" />
                    <span>Guide de Configuration Supabase en 2 étapes rapides :</span>
                  </span>
                  <a
                    href="https://supabase.com/dashboard/project/utixbzqtakabfjjeajzs/sql/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[#0b4998] hover:text-[#093d80] hover:underline bg-white px-2.5 py-1.5 rounded-lg border border-blue-200 transition font-black"
                  >
                    <span>1. Ouvrir l'Éditeur SQL ↗</span>
                  </a>
                </div>

                <div className="p-5 space-y-4 bg-slate-900 text-slate-100 font-sans">
                  <div className="space-y-2 text-xs text-slate-300 font-medium">
                    <p>
                      <strong className="text-white text-xs bg-[#0b4998] px-1.5 py-0.5 rounded-sm mr-2">Étape 1</strong>
                      Cliquez sur le bouton ci-dessus pour ouvrir l'éditeur SQL de votre projet Supabase.
                    </p>
                    <p>
                      <strong className="text-white text-xs bg-[#0b4998] px-1.5 py-0.5 rounded-sm mr-2">Étape 2</strong>
                      Copiez le script SQL ci-dessous, collez-le dans l'éditeur de Supabase et cliquez sur le bouton <strong className="text-white">"Run"</strong> en bas à droite pour créer la table. Ensuite, revenez ici et cliquez sur <strong className="text-white">"Relancer la Liaison"</strong> !
                    </p>
                  </div>

                  <div className="p-4 bg-slate-950 text-slate-105 border border-slate-800 rounded-xl font-mono text-[11px] leading-relaxed space-y-3">
                    <div className="flex items-center justify-between text-slate-400 border-b border-slate-900 pb-2 mb-2">
                      <span className="font-sans font-bold text-xs text-amber-400">Script SQL à exécuter :</span>
                      <button
                        type="button"
                        onClick={handleCopySql}
                        className="cursor-pointer bg-slate-900 hover:bg-slate-850 border border-slate-800 text-white rounded-lg px-3 py-1.5 text-xs font-sans font-bold flex items-center gap-1.5 transition active:scale-95"
                      >
                        {copiedSql ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-[#c09038]" />}
                        <span>{copiedSql ? "Copié !" : "Copier le Script SQL"}</span>
                      </button>
                    </div>
                    <pre className="overflow-x-auto select-all max-h-56 text-emerald-100 font-medium">{sqlSetupScript}</pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {supabaseStatus === 'error_auth' && (
          <div className="p-4 bg-amber-50/70 border border-amber-200/65 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-amber-900">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="h-5 w-5 text-[#ee7b11] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-amber-950">Option de stockage Cloud non configurée ou en mode hors-ligne :</span>
                <p className="mt-1 text-[11px] opacity-80 font-semibold text-slate-650">Vos modifications de planning sont actuellement conservées dans votre navigateur de manière sécurisée.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onLoadFromSupabase}
              disabled={isSyncing}
              className="cursor-pointer self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0b4998]/10 hover:bg-[#0b4998]/20 text-[#0b4998] border border-[#0b4998]/20 font-bold transition shadow-xs shrink-0"
            >
              <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Réessayer de connecter</span>
            </button>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Classes card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm transition hover:shadow-md flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium tracking-wide uppercase block">Classes</span>
            <span className="text-2xl font-extrabold text-slate-900">{classes.length}</span>
          </div>
        </div>

        {/* Teachers card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm transition hover:shadow-md flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-sky-50 text-sky-600">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium tracking-wide uppercase block">Professeurs</span>
            <span className="text-2xl font-extrabold text-slate-900">{teachers.length}</span>
          </div>
        </div>

        {/* Rooms card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm transition hover:shadow-md flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-purple-50 text-purple-600">
            <School className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium tracking-wide uppercase block">Salles</span>
            <span className="text-2xl font-extrabold text-slate-900">{rooms.length}</span>
          </div>
        </div>

        {/* Booked percentage card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm transition hover:shadow-md flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-blue-50 text-blue-600">
            <BookOpen className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs text-slate-500 font-medium tracking-wide uppercase block">Attribution</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-slate-900">{scheduledCount} cours</span>
              <span className="text-xs font-semibold text-blue-700">({coveragePercent}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Conflicts (Left) & Room occupation rates (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Real-time conflicts */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Détection des Conflits en Temps Réel
                </h3>
                <p className="text-xs text-slate-500">
                  Les collisions d'horaires se mettent à jour instantanément à chaque modification.
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${errors.length > 0 ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-slate-50 text-slate-600 border border-slate-100'}`}>
                  {errors.length} Erreurs
                </span>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${warnings.length > 0 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-50 text-slate-600 border border-slate-100'}`}>
                  {warnings.length} Alertes
                </span>
              </div>
            </div>

            {conflicts.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex p-4 rounded-full bg-emerald-50 text-emerald-600 mb-4 border border-emerald-100">
                  <Sparkles className="h-6 w-6 animate-pulse" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Aucun conflit détecté !</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Toutes les contraintes sont respectées. Salles, enseignants et classes sont parfaitement affectés à des créneaux distincts.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                {conflicts.map(conflict => {
                  const isError = conflict.severity === 'error';
                  return (
                    <div
                      key={conflict.id}
                      className={`p-4 rounded-2xl border flex items-start gap-3.5 transition ${
                        isError
                          ? 'border-red-200 bg-red-50/40 hover:bg-red-50/70'
                          : 'border-amber-200 bg-amber-50/40 hover:bg-amber-50/70'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isError ? (
                          <AlertCircle className="h-5 w-5 text-red-600" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-amber-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isError ? 'text-red-700' : 'text-amber-700'}`}>
                          {conflict.type === 'teacher' ? "Enseignant double-réservé" :
                           conflict.type === 'room' ? "Salle occupée en double" :
                           conflict.type === 'class' ? "Classe double cours" :
                           conflict.type === 'unavailability' ? "Plage indisponible prof" :
                           "Espace de salle trop petit"}
                        </span>
                        <p className="text-xs font-semibold text-slate-800 mt-0.5 leading-relaxed">
                          {conflict.message}
                        </p>
                        
                        <div className="flex gap-4 mt-2">
                          <button
                            onClick={() => {
                              if (conflict.details?.classId) {
                                onSetClassFilter(conflict.details.classId);
                                onSetTab('schedule');
                              }
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0b4998] hover:text-[#093d80] transition cursor-pointer"
                          >
                            <Clock className="h-3 w-3" />
                            <span>Voir et ajuster le cours</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Room allocation & Usage graphs */}
        <div className="space-y-5">
          {/* Room utilization section */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <School className="h-4.5 w-4.5 text-[#0b4998]" />
              <span>Taux d'occupation des Salles</span>
            </h3>

            <div className="space-y-4">
              {roomOccupiedCounts.map(room => (
                <div key={room.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{room.name}</span>
                    <span className="text-slate-500 font-semibold">{room.count}h / 35h ({room.utilization}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        room.utilization > 70
                           ? 'bg-red-500'
                           : room.utilization > 40
                           ? 'bg-[#0b4998]'
                           : 'bg-emerald-500'
                       }`}
                      style={{ width: `${Math.min(room.utilization, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 mt-4 leading-relaxed">
              *Taux d'exploitation estimé sur un référentiel maximal de 35 créneaux hebdomadaires. Un taux supérieur à 80% signale une saturation critique de l'espace.
            </p>
          </div>

          {/* Section de gestion des clés d'activation ou Visa de Direction */}
          {isEditable ? (
            <div id="activation-key-panel" className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Key className="h-4.5 w-4.5 text-[#0b4998]" />
                  <span>Clés d'Activation Secrètes</span>
                </span>
                <button
                  onClick={onGenerateNewCode}
                  className="cursor-pointer px-2.5 py-1.5 bg-[#0b4998] hover:bg-[#093d80] text-white rounded-lg text-[10.5px] font-bold transition flex items-center gap-1 shadow-sm uppercase tracking-wider"
                >
                  + Générer une clé
                </button>
              </h3>
              
              <p className="text-[10.5px] text-slate-400 mb-3 leading-relaxed">
                Pour éviter les utilisations multiples, demandez aux nouveaux utilisateurs de saisir l'une des clés uniques ci-dessous à l'ouverture de leur lien.
              </p>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {activationCodes.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 border border-dashed border-slate-200 rounded-2xl text-xs font-semibold">
                    Aucune clé générée. Utilisez le bouton ci-dessus pour en créer une.
                  </div>
                ) : (
                  [...activationCodes].reverse().map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-150 rounded-xl hover:bg-slate-100/50 transition text-xs gap-2">
                      <div className="flex flex-col min-w-0">
                        <span className="font-mono text-[11px] font-black tracking-wider text-slate-900 select-all uppercase">
                          {item.code}
                        </span>
                        {item.isUsed ? (
                          <span className="text-[9px] text-slate-400 mt-0.5 truncate leading-none">
                            Consommée le {new Date(item.usedAt || '').toLocaleDateString('fr-FR')} à {new Date(item.usedAt || '').toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        ) : (
                          <span className="text-[9px] text-[#0b4998] font-bold mt-0.5 leading-none uppercase tracking-wider">
                            Prête à l'usage
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        {item.isUsed ? (
                          <span className="px-2 py-0.5 rounded-md bg-slate-200/60 border border-slate-300 text-slate-600 text-[8.5px] font-bold uppercase tracking-wider">
                            Utilisée
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded-md bg-emerald-100/70 border border-emerald-250 text-emerald-700 text-[8.5px] font-bold uppercase tracking-wider animate-pulse">
                            Active
                          </span>
                        )}

                        <button
                          onClick={() => onDeleteActivationCode(item.code)}
                          className="cursor-pointer p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                          title="Supprimer la clé"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/15 rounded-xl text-[10px] text-amber-700 font-semibold mt-3 leading-relaxed">
                ⚠️ <strong>Clé Maître d'urgence :</strong> <code className="bg-white/60 px-1 rounded">BKT-ADMIN-789-MASTER</code> permet de débloquer n'importe quel terminal à tout moment.
              </div>
            </div>
          ) : (
            <div id="director-visa-panel" className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3.5">
              <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Shield className="h-4.5 w-4.5 text-[#0b4998]" />
                  <span>Visa Officiel de Direction</span>
                </span>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border shadow-xs ${
                  isScheduleValidated 
                    ? 'bg-emerald-105 border-emerald-200 text-emerald-700 animate-pulse' 
                    : 'bg-amber-100/80 border-[#f3aa1c]/30 text-amber-700'
                }`}>
                  {isScheduleValidated ? "✅ VALIDÉ ET LOCKÉ" : "⏳ REQUIS"}
                </span>
              </h3>
              
              <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                Donnez votre visa officiel pour certifier cet emploi du temps et le marquer comme validé dans l'établissement pour l'affichage publique et l'A4 officiel.
              </p>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-150 text-xs space-y-1.5">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>Signataire :</span>
                  <span className="text-[#0b4998]">{schoolDirector}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Année Académique :</span>
                  <span>{academicYear}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onToggleScheduleValidation}
                className={`w-full cursor-pointer py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-sm ${
                  isScheduleValidated
                    ? 'bg-rose-500 hover:bg-rose-600 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                <span>{isScheduleValidated ? "Retirer mon Visa officiel" : "Autoriser & Apposer mon Visa"}</span>
              </button>
            </div>
          )}

          {/* Guidelines info */}
          <div className="bg-gradient-to-br from-[#0b4998] via-[#093d80] to-[#072c5e] rounded-3xl p-5 border border-[#f3aa1c]/30 shadow-sm text-white space-y-4">
            <div>
              <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Gestion de l'emploi du temps</span>
              </h4>
              <p className="text-xs text-blue-100 mt-1 leading-relaxed">
                Vous pouvez ajouter, modifier ou supprimer des créneaux de cours en temps réel depuis la grille horaire tout en contrôlant la disponibilité de vos professeurs et salles.
              </p>
            </div>
            <div className="pt-2 border-t border-[#f3aa1c]/30">
              <button
                onClick={() => onSetTab('schedule')}
                className="w-full cursor-pointer py-2 px-2.5 rounded-xl bg-[#ee7b11] hover:bg-amber-600 text-xs font-bold text-center text-white shadow-xs transition"
              >
                Ouvrir le Planificateur
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
