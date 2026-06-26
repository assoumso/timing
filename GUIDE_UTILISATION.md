# 📘 GUIDE D'UTILISATION PROCÉDURAL COMPLET (PAS-À-PAS)
## ERP Scolaire & Emploi du Temps (« BARAKAT »)

Ce guide détaille la marche à suivre pas-à-pas pour exécuter chaque tâche sur l'application.

---

## 🗺️ Index des Procédures
1. [Comment créer un utilisateur et configurer ses droits (RBAC)](#1-comment-créer-un-utilisateur-et-configurer-ses-droits-rbac)
2. [Comment configurer les matières, coefficients et langues LV2](#2-comment-configurer-les-matières-coefficients-et-langues-lv2)
3. [Comment inscrire un nouvel élève](#3-comment-inscrire-un-nouvel-élève)
4. [Comment affecter un professeur principal à une classe](#4-comment-affecter-un-professeur-principal-à-une-classe)
5. [Comment planifier un cours sur l'Emploi du Temps (EDT)](#5-comment-planifier-un-cours-sur-lemploi-du-temps-edt)
6. [Comment déclarer les indisponibilités d'un enseignant](#6-comment-déclarer-les-indisponibilités-dun-enseignant)
7. [Comment saisir les notes (côté Enseignant) et figer la saisie](#7-comment-saisir-les-notes-côté-enseignant-et-figer-la-saisie)
8. [Comment déverrouiller une note validée par un enseignant](#8-comment-déverrouiller-une-note-validée-par-un-enseignant)
9. [Comment saisir ou supprimer des notes (côté Administration)](#9-comment-saisir-ou-supprimer-des-notes-côté-administration)
10. [Comment valider le procès-verbal (PV) d'une classe](#10-comment-valider-le-procès-verbal-pv-dune-classe)
11. [Comment imprimer ou exporter les bulletins de notes](#11-comment-imprimer-ou-exporter-les-bulletins-de-notes)
12. [Comment enregistrer un paiement d'écolage et envoyer le reçu PDF](#12-comment-enregistrer-un-paiement-décolage-et-envoyer-le-reçu-pdf)

---

### 1. Comment créer un utilisateur et configurer ses droits (RBAC)
*   **Étape 1 :** Cliquez sur l'onglet **Administration** dans la barre de navigation supérieure.
*   **Étape 2 :** Dans la section **"Créer un nouveau compte utilisateur"**, remplissez les champs :
    *   **Nom complet** (ex: *Koffi Yao*)
    *   **Identifiant / Email** (ex: *koffi.yao@ecole.ci*)
    *   **Mot de passe**
*   **Étape 3 :** Choisissez le **Rôle** dans le menu déroulant :
    *   `Super Admin` ou `Directeur` (accès complet)
    *   `Informaticien / Correspondant Fichier` (accès technique)
    *   `Professeur` (accès enseignant restreint)
*   **Étape 4 :** Cliquez sur le bouton orange **"Créer le compte utilisateur"**.
*   **Étape 5 (Permissions) :** Dans la table **"Comptes utilisateurs enregistrés"** située juste en dessous, recherchez l'utilisateur créé.
*   **Étape 6 :** Cochez la case **"Saisie des Moyennes"** (`saisie_moyennes`) pour l'autoriser à saisir les notes de ses classes. La permission prend effet instantanément.

---

### 2. Comment configurer les matières, coefficients et langues LV2
*   **Étape 1 :** Accédez à l'onglet **Matières** du menu.
*   **Étape 2 :** Pour ajouter une matière, allez au formulaire **"Ajouter une Matière"** :
    *   Saisissez le **Nom de la matière** (ex: *Allemand*).
    *   Sélectionnez le **Coefficient** (poids pour le calcul des moyennes).
    *   Cochez **"Langue Vivante 2 (LV2)"** s'il s'agit d'une matière facultative ou de langue secondaire.
    *   Sélectionnez la couleur thématique pour l'affichage dans l'Emploi du Temps.
*   **Étape 3 :** Cliquez sur le bouton orange **"Ajouter la Matière"**.

---

### 3. Comment inscrire un nouvel élève
*   **Étape 1 :** Cliquez sur l'onglet **Élèves**.
*   **Étape 2 :** Dans le panneau **"Inscrire un nouvel élève"**, complétez les informations requises :
    *   **Nom** et **Prénom** de l'élève.
    *   **Genre** (Masculin / Féminin).
    *   **Classe d'affectation** (sélectionnez dans la liste déroulante des classes existantes).
*   **Étape 3 :** Cliquez sur **"Enregistrer l'inscription"**. L'élève apparaît immédiatement dans le registre général de sa classe.

---

### 4. Comment affecter un professeur principal à une classe
*   **Étape 1 :** Rendez-vous dans l'onglet **EDT - Salles & Classes**.
*   **Étape 2 :** Dans la table des classes enregistrées, localisez la classe concernée et cliquez sur son bouton de modification (ou modifiez directement les paramètres de création de la classe).
*   **Étape 3 :** Dans le menu déroulant **"Professeur Principal"**, sélectionnez l'enseignant référent de cette classe.
*   **Étape 4 :** Cliquez sur **"Enregistrer les modifications"**. Le nom du professeur principal sera automatiquement imprimé sur tous les bulletins scolaires de cette classe.

---

### 5. Comment planifier un cours sur l'Emploi du Temps (EDT)
*   **Étape 1 :** Allez sur l'onglet **EDT - Planification**.
*   **Étape 2 :** Dans le formulaire de gauche, sélectionnez :
    *   La **Classe** cible.
    *   Le **Professeur** en charge.
    *   La **Matière** enseignée.
    *   La **Salle** réservée.
*   **Étape 3 :** Indiquez le **Jour** de la semaine et le **Créneau Horaire** (ex: *Mardi de 10h à 12h*).
*   **Étape 4 :** Cliquez sur **"Planifier ce cours"**.
    *   *Si un conflit est détecté (enseignant occupé, salle déjà prise ou professeur indisponible), une boîte d'alerte rouge bloque la saisie.*
    *   *Si tout est correct, le cours s'inscrit automatiquement dans la grille hebdomadaire visible à l'écran.*

---

### 6. Comment déclarer les indisponibilités d'un enseignant
*   **Étape 1 :** Rendez-vous dans l'**Espace Enseignant** (Portail Professeur).
*   **Étape 2 :** Sélectionnez le professeur concerné dans la liste déroulante supérieure.
*   **Étape 3 :** Repérez la grille horaire de disponibilité.
*   **Étape 4 :** Cliquez directement sur les cases de la grille pour basculer leur état :
    *   Une case grisée avec le symbole **❌ Indisponible** signifie que le professeur ne peut pas enseigner sur ce créneau.
    *   Les modifications se sauvegardent automatiquement dans la base locale.

---

### 7. Comment saisir les notes (côté Enseignant) et figer la saisie
*   **Étape 1 :** Ouvrez le **Portail Enseignant** > section **Saisie des Moyennes**.
*   **Étape 2 :** Sélectionnez la **Classe** et la **Discipline (Matière)** dans les filtres en haut.
*   **Étape 3 :** Dans la liste des élèves qui s'affiche, entrez la note sur 20 dans le champ numérique de chaque élève.
*   **Étape 4 :** Saisissez l'intitulé de l'évaluation (ex: *Interrogation n°1*) et son coefficient.
*   **Étape 5 :** Cliquez sur le bouton orange **"Enregistrer toutes les notes saisies"**.
*   **Étape 6 (Verrouillage) :** Pour figer définitivement ces moyennes, repérez la section **"Notes déjà saisies"** à droite et cliquez sur le bouton vert **"🔒 Valider & Figer"** :
    *   Les notes affichent désormais le badge **🔒 Figé**.
    *   Le professeur ne peut plus modifier ni supprimer ces notes.

---

### 8. Comment déverrouiller une note validée par un enseignant
*   **Étape 1 :** Connectez-vous avec un compte **Directeur** ou **Super Admin**.
*   **Étape 2 :** Accédez au **Portail Enseignant** (Saisie des Moyennes) et sélectionnez la classe et la matière de la note à corriger.
*   **Étape 3 :** Dans la liste des notes saisies à droite, localisez la note portant le badge **🔒 Figé**.
*   **Étape 4 :** Cliquez sur le bouton bleu **"🔓 Déverr."** situé à côté de la note.
*   **Étape 5 :** Confirmez la demande dans la boîte de dialogue. Le badge disparaît et l'enseignant peut de nouveau modifier la note depuis sa session.

---

### 9. Comment saisir ou supprimer des notes (côté Administration)
*   **Étape 1 :** Allez sur l'onglet **Évaluations & Examens**.
*   **Étape 2 :** *Si vous êtes autorisé*, le formulaire de saisie de gauche s'affiche.
    *   Sélectionnez l'Élève, la Matière, le Coefficient, le type de devoir et la note.
    *   Cliquez sur **"Soumettre au Registre Électronique"**.
*   **Étape 3 (Suppression) :** Pour supprimer une note erronée, repérez-la dans la liste de droite **"Derniers coefficients & notes enregistrés"**.
*   **Étape 4 :** Cliquez sur le bouton rouge **Corbeille (Supprimer)** et validez la confirmation.

---

### 10. Comment valider le procès-verbal (PV) d'une classe
*   **Étape 1 :** Rendez-vous dans l'onglet **Évaluations & Examens**, sous-onglet **Procès-Verbaux & Validation**.
*   **Étape 2 :** Sélectionnez la **Classe** souhaitée.
*   **Étape 3 :** Examinez le tableau de la "Natte de vérification". Assurez-vous que toutes les moyennes des matières sont présentes et valides.
*   **Étape 4 :** Cliquez sur le bouton bleu **"Valider le PV pour cette Classe"**. Le PV passe au statut **"Validé"** et fige les moyennes trimestrielles de la classe.

---

### 11. Comment imprimer ou exporter les bulletins de notes
*   **Étape 1 :** Assurez-vous d'abord que le PV de la classe a été validé (voir rubrique précédente).
*   **Étape 2 :** Allez sur l'onglet **Évaluations & Examens** > sous-onglet **Éditeur de Bulletins**.
*   **Étape 3 :** Sélectionnez la **Classe** et l'**Élève**.
    *   *Si le PV est validé, le bulletin s'affiche avec la moyenne générale, le rang de l'élève, et l'appréciation du professeur principal.*
    *   *Si le PV n'est pas validé, un écran d'avertissement jaune bloque la consultation.*
*   **Étape 4 :** Cliquez sur le bouton bleu **"Imprimer le Bulletin"** pour ouvrir l'aperçu avant impression système ou le sauvegarder en PDF.

---

### 12. Comment enregistrer un paiement d'écolage et envoyer le reçu PDF
*   **Étape 1 :** Cliquez sur l'onglet **Finances & Écolages** dans le menu principal.
*   **Étape 2 :** Recherchez et sélectionnez l'élève dans la liste déroulante.
*   **Étape 3 :** Remplissez les champs de paiement de la section **"Enregistrer une nouvelle transaction"** :
    *   **Montant versé** (ex: *50 000 FCFA*)
    *   **Motif du paiement** (ex: *Scolarité 1er Trimestre*)
    *   **Mode de règlement** (Espèces, Orange Money, Wave, etc.)
*   **Étape 4 :** Cliquez sur **"Enregistrer la transaction"**. Le solde restant de l'élève est recalculé.
*   **Étape 5 :** Dans la table des reçus en bas de page, cliquez sur **"Reçu PDF"** pour télécharger le justificatif.
*   **Étape 6 :** Cliquez sur le bouton vert **"WhatsApp / SMS"** pour générer le lien de partage rapide et l'envoyer au tuteur de l'élève.
