
SECTIONS = [
    {
        "title": "MODULE 1 : CONNEXION & SÉCURITÉ",
        "procedures": [
            {
                "name": "Comment se connecter à l'application",
                "steps": [
                    "Ouvrez votre navigateur (Chrome, Edge, Firefox) et accédez à l'URL de l'application.",
                    "Sur l'écran de connexion, saisissez votre Identifiant (email) dans le champ prévu.",
                    "Saisissez votre Mot de passe dans le champ suivant.",
                    "Cliquez sur le bouton bleu 'Se connecter'.",
                    "Si vos identifiants sont corrects, vous êtes redirigé vers le Tableau de Bord correspondant à votre rôle.",
                    "En cas d'erreur, un message rouge s'affiche. Vérifiez l'identifiant et le mot de passe saisis.",
                ]
            },
            {
                "name": "Comment se déconnecter",
                "steps": [
                    "En haut à droite de l'interface, cliquez sur votre nom d'utilisateur ou l'icône de profil.",
                    "Dans le menu déroulant, cliquez sur 'Se déconnecter'.",
                    "Vous êtes redirigé vers l'écran de connexion. Votre session est fermée.",
                ]
            },
        ]
    },
    {
        "title": "MODULE 2 : ADMINISTRATION & GESTION DES UTILISATEURS",
        "procedures": [
            {
                "name": "Comment créer un nouveau compte utilisateur",
                "steps": [
                    "Connectez-vous avec un compte Directeur ou Super Admin.",
                    "Cliquez sur l'onglet 'Administration' dans la barre de navigation.",
                    "Allez à la section 'Créer un nouveau compte utilisateur'.",
                    "Remplissez : Nom complet, Identifiant/Email, Mot de passe.",
                    "Sélectionnez le Rôle : Super Admin, Directeur, Informaticien ou Professeur.",
                    "Si c'est un professeur, associez-le à un enseignant de la liste via 'Professeur lié'.",
                    "Cliquez sur le bouton orange 'Créer le compte utilisateur'.",
                    "Le compte apparaît dans la liste des comptes ci-dessous.",
                ]
            },
            {
                "name": "Comment attribuer la permission 'Saisie des Moyennes' à un professeur",
                "steps": [
                    "Dans l'onglet Administration, repérez la table 'Comptes utilisateurs enregistrés'.",
                    "Localisez le compte du professeur concerné dans la liste.",
                    "Dans la colonne 'Permissions', cochez la case 'Saisie des Moyennes'.",
                    "La permission est activée instantanément, sans déconnexion requise.",
                    "Pour révoquer le droit, décochez la même case.",
                ]
            },
            {
                "name": "Comment modifier ou supprimer un compte utilisateur",
                "steps": [
                    "Dans l'onglet Administration, repérez le compte dans la liste.",
                    "Pour modifier : cliquez sur le bouton Crayon (Modifier) à droite du compte.",
                    "Mettez à jour les champs souhaités (nom, rôle, mot de passe).",
                    "Cliquez sur 'Enregistrer les modifications'.",
                    "Pour supprimer : cliquez sur le bouton rouge Corbeille et confirmez la suppression.",
                ]
            },
        ]
    },
    {
        "title": "MODULE 3 : CONFIGURATION DE L'ÉTABLISSEMENT",
        "procedures": [
            {
                "name": "Comment configurer les informations de l'école",
                "steps": [
                    "Accédez à l'onglet 'Paramètres' (icône engrenage) dans la navigation.",
                    "Dans la section 'Informations de l'établissement', modifiez :",
                    "  - Nom officiel de l'école",
                    "  - Sous-titre ou devise",
                    "  - Adresse, Téléphone, Email de contact",
                    "  - Nom du Directeur (imprimé sur les bulletins)",
                    "  - Année scolaire en cours (ex: 2025-2026)",
                    "Cliquez sur 'Enregistrer les paramètres' pour sauvegarder.",
                    "Ces informations apparaissent automatiquement sur tous les bulletins et procès-verbaux imprimés.",
                ]
            },
        ]
    },
    {
        "title": "MODULE 4 : GESTION DES CLASSES",
        "procedures": [
            {
                "name": "Comment créer une nouvelle classe",
                "steps": [
                    "Allez dans l'onglet 'EDT - Salles & Classes' (ou module Académique).",
                    "Dans le formulaire 'Ajouter une Classe', saisissez :",
                    "  - Identifiant unique (ex: 6A, 5B, 4C, 3D)",
                    "  - Nom complet de la classe (ex: Classe de 6ème A)",
                    "  - Capacité maximale d'élèves",
                    "  - Couleur d'affichage dans l'EDT",
                    "  - Professeur Principal (sélectionnez dans la liste des enseignants)",
                    "Cliquez sur 'Ajouter la Classe'. Elle apparaît dans la grille d'emplois du temps.",
                ]
            },
            {
                "name": "Comment modifier ou supprimer une classe",
                "steps": [
                    "Dans la liste des classes affichées, cliquez sur le bouton Modifier (crayon) de la classe.",
                    "Modifiez les champs (nom, capacité, professeur principal, couleur).",
                    "Cliquez sur 'Enregistrer'. Les changements sont reflétés dans tous les modules.",
                    "Pour supprimer : cliquez sur le bouton rouge Corbeille et confirmez.",
                    "ATTENTION : La suppression d'une classe retire aussi tous ses cours planifiés.",
                ]
            },
        ]
    },
    {
        "title": "MODULE 5 : GESTION DES MATIÈRES & COEFFICIENTS",
        "procedures": [
            {
                "name": "Comment ajouter une nouvelle matière",
                "steps": [
                    "Allez dans l'onglet 'Matières' ou 'EDT - Classes & Séries'.",
                    "Dans le formulaire 'Ajouter une Matière', saisissez :",
                    "  - Nom de la matière (ex: Mathématiques, Français, Anglais)",
                    "  - Coefficient : poids de la matière dans le calcul des moyennes (ex: 4 pour Math)",
                    "  - Cochez 'Langue Vivante 2 (LV2)' si c'est une langue facultative (ex: Espagnol, Allemand)",
                    "  - Choisissez une couleur pour l'affichage dans l'EDT",
                    "Cliquez sur 'Ajouter la Matière'.",
                ]
            },
            {
                "name": "Comment modifier le coefficient d'une matière",
                "steps": [
                    "Dans la liste des matières, cliquez sur le bouton Modifier de la matière.",
                    "Changez la valeur du Coefficient selon les directives pédagogiques.",
                    "Cliquez sur 'Enregistrer'. Les bulletins recalculent automatiquement les moyennes.",
                ]
            },
        ]
    },
    {
        "title": "MODULE 6 : GESTION DES ENSEIGNANTS",
        "procedures": [
            {
                "name": "Comment ajouter un enseignant",
                "steps": [
                    "Allez dans l'onglet 'Enseignants & Équipes'.",
                    "Dans le formulaire d'ajout, saisissez :",
                    "  - Nom et Prénom complets",
                    "  - Matière(s) enseignée(s)",
                    "  - Téléphone et Email professionnel",
                    "  - Statut (Titulaire, Contractuel, Vacataire)",
                    "Cliquez sur 'Ajouter l'Enseignant'.",
                ]
            },
            {
                "name": "Comment déclarer les indisponibilités d'un enseignant",
                "steps": [
                    "Allez dans l'Espace Enseignant (Portail Professeur).",
                    "Sélectionnez le professeur dans la liste déroulante en haut.",
                    "Repérez la grille horaire hebdomadaire affichée.",
                    "Cliquez directement sur une case de la grille pour la basculer en 'Indisponible' (case grisée avec ❌).",
                    "Recliquez sur la case pour la remettre en disponible.",
                    "Les créneaux indisponibles bloquent automatiquement la planification de cours sur ces plages.",
                ]
            },
            {
                "name": "Comment affecter un professeur principal à une classe",
                "steps": [
                    "Allez dans l'onglet de gestion des Classes.",
                    "Cliquez sur Modifier pour la classe concernée.",
                    "Dans le champ 'Professeur Principal', sélectionnez l'enseignant dans la liste déroulante.",
                    "Cliquez sur 'Enregistrer'. Le nom apparaîtra sur tous les bulletins de cette classe.",
                ]
            },
        ]
    },
    {
        "title": "MODULE 7 : GESTION DES SALLES",
        "procedures": [
            {
                "name": "Comment ajouter une salle de cours",
                "steps": [
                    "Allez dans l'onglet 'EDT - Salles & Classes'.",
                    "Dans le formulaire 'Ajouter une Salle', saisissez :",
                    "  - Identifiant (ex: s101, slab, sgym)",
                    "  - Nom complet (ex: Salle 101 - Standard)",
                    "  - Type : Standard, Laboratoire, Gymnase, Atelier",
                    "  - Capacité maximale",
                    "Cliquez sur 'Ajouter la Salle'. Elle est disponible dans le planificateur d'EDT.",
                ]
            },
        ]
    },
    {
        "title": "MODULE 8 : EMPLOI DU TEMPS (EDT)",
        "procedures": [
            {
                "name": "Comment planifier un cours",
                "steps": [
                    "Allez sur l'onglet 'EDT - Planification'.",
                    "Dans le formulaire à gauche, sélectionnez dans l'ordre :",
                    "  1. La Classe (ex: 6ème A)",
                    "  2. Le Professeur (ex: M. Koffi)",
                    "  3. La Matière (ex: Mathématiques)",
                    "  4. La Salle (ex: Salle 101)",
                    "  5. Le Jour (ex: Lundi)",
                    "  6. Le Créneau horaire (ex: 08:00 - 10:00)",
                    "Cliquez sur 'Planifier ce cours'.",
                    "Si aucun conflit n'est détecté, le cours s'affiche dans la grille hebdomadaire.",
                    "Si un conflit est détecté (prof occupé, salle prise, indispo), une alerte rouge bloque la création.",
                ]
            },
            {
                "name": "Comment supprimer un cours planifié",
                "steps": [
                    "Dans la grille d'EDT, cliquez sur le cours à supprimer.",
                    "Un panneau de détail s'ouvre à droite ou une boîte de dialogue apparaît.",
                    "Cliquez sur le bouton rouge 'Supprimer ce cours' et confirmez.",
                    "Le créneau est immédiatement libéré.",
                ]
            },
            {
                "name": "Comment imprimer l'emploi du temps",
                "steps": [
                    "Dans l'onglet EDT, utilisez les filtres en haut pour choisir la vue :",
                    "  - Par Classe : affiche tous les cours de la classe sélectionnée",
                    "  - Par Enseignant : affiche le planning personnel du professeur sélectionné",
                    "Cliquez sur le bouton 'Imprimer' (icône imprimante).",
                    "La boîte de dialogue d'impression du navigateur s'ouvre. Choisissez 'Enregistrer en PDF' ou imprimez directement.",
                ]
            },
        ]
    },
    {
        "title": "MODULE 9 : GESTION DES ÉLÈVES",
        "procedures": [
            {
                "name": "Comment inscrire un nouvel élève",
                "steps": [
                    "Allez dans l'onglet 'Élèves' du menu principal.",
                    "Dans le panneau 'Inscrire un nouvel élève', remplissez :",
                    "  - Nom de famille",
                    "  - Prénom(s)",
                    "  - Genre (Masculin / Féminin)",
                    "  - Classe d'affectation (sélectionnez dans la liste des classes)",
                    "Cliquez sur 'Enregistrer l'inscription'.",
                    "L'élève apparaît dans le registre de sa classe et dans la liste des bulletins.",
                ]
            },
            {
                "name": "Comment modifier les informations d'un élève",
                "steps": [
                    "Dans la liste des élèves, cliquez sur le bouton Modifier (crayon) à droite de l'élève.",
                    "Mettez à jour les champs nécessaires (nom, classe, genre).",
                    "Cliquez sur 'Enregistrer'. Les bulletins et registres sont mis à jour automatiquement.",
                ]
            },
            {
                "name": "Comment changer un élève de classe",
                "steps": [
                    "Cliquez sur Modifier pour l'élève concerné.",
                    "Changez la 'Classe d'affectation' dans le menu déroulant.",
                    "Cliquez sur 'Enregistrer'.",
                    "ATTENTION : Les notes déjà saisies pour l'ancienne classe restent associées à l'élève.",
                ]
            },
        ]
    },
    {
        "title": "MODULE 10 : SAISIE DES NOTES & ÉVALUATIONS",
        "procedures": [
            {
                "name": "Comment saisir une note via le registre administratif",
                "steps": [
                    "Connectez-vous avec un compte Directeur ou Informaticien.",
                    "Allez dans l'onglet 'Évaluations & Examens'.",
                    "Dans le formulaire 'Saisir une Note d'Évaluation' :",
                    "  - Sélectionnez l'Élève dans la liste déroulante",
                    "  - Sélectionnez la Matière",
                    "  - Choisissez le Coefficient de l'évaluation (1, 2, 3 ou 5)",
                    "  - Saisissez l'intitulé du devoir (ex: Interrogation Écrite n°1)",
                    "  - Entrez la Note sur 20 (ex: 14.5)",
                    "Cliquez sur 'Soumettre au Registre Électronique'.",
                ]
            },
            {
                "name": "Comment saisir des notes via le portail enseignant",
                "steps": [
                    "Connectez-vous avec un compte Professeur autorisé (permission 'Saisie des Moyennes' active).",
                    "Allez dans 'Espace Enseignant' > sous-section 'Saisie des Moyennes'.",
                    "Sélectionnez votre Classe et votre Matière dans les filtres.",
                    "La liste de vos élèves apparaît.",
                    "Pour chaque élève, saisissez sa note dans le champ numérique.",
                    "Renseignez l'intitulé de l'évaluation et le coefficient.",
                    "Cliquez sur le bouton orange 'Enregistrer toutes les notes saisies'.",
                ]
            },
            {
                "name": "Comment figer (valider) les notes d'une matière",
                "steps": [
                    "Dans la section 'Notes déjà saisies' (côté droit du portail enseignant), vérifiez vos notes.",
                    "Si tout est correct, cliquez sur le bouton vert '🔒 Valider & Figer'.",
                    "Confirmez dans la boîte de dialogue qui s'affiche.",
                    "Les notes passent au statut '🔒 Figé'. Vous ne pouvez plus les modifier.",
                    "Seul le Directeur ou l'Informaticien peut les déverrouiller en cas d'erreur.",
                ]
            },
            {
                "name": "Comment déverrouiller une note figée (Directeur/Admin uniquement)",
                "steps": [
                    "Connectez-vous avec un compte Directeur ou Super Admin.",
                    "Accédez au Portail Enseignant, sélectionnez la classe et la matière concernée.",
                    "Dans la liste des notes saisies, repérez la note marquée '🔒 Figé'.",
                    "Cliquez sur le bouton bleu '🔓 Déverr.' à droite de la note.",
                    "Confirmez dans la boîte de dialogue.",
                    "Le badge '🔒 Figé' disparaît. L'enseignant peut à nouveau modifier la note depuis sa session.",
                ]
            },
            {
                "name": "Comment supprimer une note erronée",
                "steps": [
                    "Seuls le Directeur et l'Informaticien peuvent supprimer des notes.",
                    "Dans l'onglet Évaluations, repérez la note dans la liste 'Derniers coefficients enregistrés'.",
                    "Survolez la ligne avec la souris : un bouton rouge Corbeille apparaît.",
                    "Cliquez sur la Corbeille et confirmez la suppression.",
                    "Si la note est figée, utilisez d'abord le déverrouillage avant de la supprimer.",
                ]
            },
        ]
    },
    {
        "title": "MODULE 11 : PROCÈS-VERBAUX ET BULLETINS",
        "procedures": [
            {
                "name": "Comment valider le procès-verbal (PV) d'une classe",
                "steps": [
                    "Vérifiez d'abord que TOUTES les notes de la classe ont été saisies et figées.",
                    "Allez dans l'onglet 'Évaluations' > sous-onglet 'Procès-Verbaux & Validation'.",
                    "Sélectionnez la Classe dans la liste déroulante.",
                    "Consultez la grille de la Natte : vérifiez que chaque matière a une moyenne calculée.",
                    "Si tout est complet et correct, cliquez sur 'Valider le PV pour cette Classe'.",
                    "Le statut de la classe passe à 'PV Validé ✅'.",
                    "Les bulletins de cette classe sont maintenant disponibles pour impression.",
                ]
            },
            {
                "name": "Comment imprimer le bulletin scolaire d'un élève",
                "steps": [
                    "Vérifiez que le PV de la classe a été validé au préalable.",
                    "Allez dans l'onglet 'Évaluations' > sous-onglet 'Éditeur de Bulletins'.",
                    "Sélectionnez la Classe et l'Élève dans les menus déroulants.",
                    "Le bulletin s'affiche avec : toutes les matières, les moyennes, le rang, la mention et les appréciations.",
                    "Cliquez sur 'Imprimer le Bulletin' (icône imprimante).",
                    "La fenêtre d'impression système s'ouvre. Sélectionnez 'Enregistrer en PDF' ou imprimez directement.",
                    "Si le PV n'est pas validé, un message d'avertissement jaune s'affiche et bloque l'impression.",
                ]
            },
        ]
    },
    {
        "title": "MODULE 12 : SUIVI DES PRÉSENCES (ABSENCES)",
        "procedures": [
            {
                "name": "Comment enregistrer les absences d'un élève",
                "steps": [
                    "Allez dans l'onglet 'Présences & Absences'.",
                    "Sélectionnez la Classe et la Date du jour.",
                    "La liste des élèves de la classe s'affiche.",
                    "Pour chaque élève absent, cliquez sur la case correspondante pour la cocher.",
                    "Indiquez si l'absence est Justifiée ou Non Justifiée.",
                    "Cliquez sur 'Enregistrer l'appel' pour sauvegarder.",
                ]
            },
            {
                "name": "Comment consulter l'historique des absences d'un élève",
                "steps": [
                    "Dans l'onglet Présences, allez dans le sous-onglet 'Historique'.",
                    "Filtrez par Élève et par Période (mois ou trimestre).",
                    "Le tableau affiche toutes les dates d'absence avec le statut (justifiée/non justifiée).",
                    "Le total d'heures d'absence est calculé automatiquement.",
                ]
            },
        ]
    },
    {
        "title": "MODULE 13 : FINANCES & ÉCOLAGES",
        "procedures": [
            {
                "name": "Comment enregistrer un paiement de scolarité",
                "steps": [
                    "Allez dans l'onglet 'Finances & Écolages'.",
                    "Dans la section 'Nouvelle Transaction', sélectionnez l'Élève concerné.",
                    "Renseignez :",
                    "  - Montant versé (ex: 75 000 FCFA)",
                    "  - Motif : Inscription, Scolarité 1er/2ème/3ème Trimestre, Fournitures, etc.",
                    "  - Mode de règlement : Espèces, Chèque, Orange Money, Wave, MTN Money",
                    "  - Date du versement",
                    "Cliquez sur 'Enregistrer la transaction'.",
                    "Le solde restant de l'élève est recalculé automatiquement.",
                ]
            },
            {
                "name": "Comment générer et imprimer un reçu de paiement",
                "steps": [
                    "Après avoir enregistré un paiement, repérez-le dans la table des transactions.",
                    "Cliquez sur le bouton 'Reçu PDF' à droite de la transaction.",
                    "Un reçu officiel au format PDF est généré avec :",
                    "  - Le nom de l'établissement et le logo",
                    "  - Le nom de l'élève et sa classe",
                    "  - Le montant payé, le motif et la date",
                    "  - Un numéro de reçu unique",
                    "Cliquez sur 'Télécharger' ou 'Imprimer' selon votre besoin.",
                ]
            },
            {
                "name": "Comment envoyer un reçu par WhatsApp ou SMS",
                "steps": [
                    "Après avoir généré le reçu, cliquez sur le bouton vert 'WhatsApp'.",
                    "Votre application WhatsApp s'ouvre avec un message pré-rempli contenant les détails du paiement.",
                    "Sélectionnez ou saisissez le numéro du parent/tuteur de l'élève.",
                    "Cliquez sur Envoyer. Le parent reçoit instantanément la confirmation de paiement.",
                ]
            },
        ]
    },
    {
        "title": "MODULE 14 : RAPPORTS & STATISTIQUES",
        "procedures": [
            {
                "name": "Comment générer un rapport de classe",
                "steps": [
                    "Allez dans l'onglet 'Rapports & Statistiques'.",
                    "Sélectionnez le type de rapport : Résultats scolaires, Présences, Financier.",
                    "Choisissez la Classe et la Période (Trimestre 1, 2 ou 3, ou Annuel).",
                    "Cliquez sur 'Générer le Rapport'.",
                    "Le rapport s'affiche avec des graphiques et des tableaux récapitulatifs.",
                    "Cliquez sur 'Exporter en PDF' ou 'Exporter en Excel' pour le sauvegarder.",
                ]
            },
            {
                "name": "Comment consulter les statistiques du tableau de bord",
                "steps": [
                    "Accédez à l'onglet 'Tableau de Bord' (page d'accueil après connexion).",
                    "Les cartes colorées affichent en temps réel :",
                    "  - Effectif total d'élèves inscrits",
                    "  - Nombre de cours planifiés cette semaine",
                    "  - Taux de remplissage des salles",
                    "  - Nombre de professeurs actifs",
                    "Consultez les graphiques de répartition par classe et par genre.",
                ]
            },
        ]
    },
    {
        "title": "MODULE 15 : SÉCURITÉ & PROTECTION DES DONNÉES",
        "procedures": [
            {
                "name": "Comprendre les protections de sécurité de l'application",
                "steps": [
                    "L'application interdit le clic droit sur les pages pour protéger le code source.",
                    "La touche F12 (outils développeur) est bloquée pour les utilisateurs non-admin.",
                    "Le raccourci Ctrl+S (sauvegarde page) et Ctrl+U (voir source) sont désactivés.",
                    "L'application ne fonctionne que sur les domaines autorisés (localhost, vercel.app).",
                    "Si l'URL n'est pas reconnue, un écran de verrouillage de domaine s'affiche.",
                ]
            },
            {
                "name": "Comment gérer les permissions d'accès aux onglets",
                "steps": [
                    "Connectez-vous en tant que Directeur ou Super Admin.",
                    "Allez dans l'onglet Administration.",
                    "Pour chaque utilisateur, cochez ou décochez les onglets auxquels il a accès dans la colonne 'Pages autorisées'.",
                    "Les modifications sont instantanées.",
                    "Un utilisateur sans permission sur un onglet ne verra pas cet onglet dans son menu de navigation.",
                ]
            },
        ]
    },
]
