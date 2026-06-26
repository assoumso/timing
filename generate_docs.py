import os
import datetime
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

# Colors matching the application
COLOR_NAVY = RGBColor(11, 73, 152)      # #0b4998
COLOR_ORANGE = RGBColor(238, 123, 17)   # #ee7b11
COLOR_DARK = RGBColor(30, 41, 59)       # #1e293b
COLOR_WHITE = RGBColor(255, 255, 255)
COLOR_LIGHT_BG = RGBColor(248, 250, 252)

def set_slide_bg(slide, rgb_color):
    background = slide.background
    fill = background.fill
    fill.solid()
    fill.fore_color.rgb = rgb_color

def add_header(slide, title_text):
    txBox = slide.shapes.add_textbox(Inches(0.5), Inches(0.4), Inches(12.33), Inches(0.8))
    tf = txBox.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = title_text
    p.font.size = Pt(28)
    p.font.bold = True
    p.font.color.rgb = COLOR_NAVY
    p.font.name = 'Arial'

def create_presentation():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    
    # --- SLIDE 1: Title ---
    slide = prs.slides.add_slide(prs.slide_layouts[6]) # blank
    set_slide_bg(slide, COLOR_NAVY)
    
    # Title Box
    txBox = slide.shapes.add_textbox(Inches(1.0), Inches(2.2), Inches(11.33), Inches(3.0))
    tf = txBox.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "ERP BARAKAT"
    p.font.size = Pt(54)
    p.font.bold = True
    p.font.color.rgb = COLOR_ORANGE
    p.font.name = 'Arial'
    
    p2 = tf.add_paragraph()
    p2.text = "Guide d'Utilisation Numérique Complet"
    p2.font.size = Pt(28)
    p2.font.bold = True
    p2.font.color.rgb = COLOR_WHITE
    p2.font.name = 'Arial'
    
    p3 = tf.add_paragraph()
    p3.text = "Gestion Scolaire • Emploi du Temps • Notes & Facturation"
    p3.font.size = Pt(18)
    p3.font.color.rgb = RGBColor(200, 220, 255)
    p3.font.name = 'Arial'
    
    # --- SLIDE 2: RBAC ---
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_bg(slide, COLOR_LIGHT_BG)
    add_header(slide, "1. Rôles & Gestion des Accès (RBAC)")
    
    txBox = slide.shapes.add_textbox(Inches(0.5), Inches(1.5), Inches(12.33), Inches(5.0))
    tf = txBox.text_frame
    tf.word_wrap = True
    
    def add_bullet(tf, bold_prefix, text_content, level=0):
        p = tf.add_paragraph()
        p.level = level
        run1 = p.add_run()
        run1.text = bold_prefix
        run1.font.bold = True
        run1.font.size = Pt(18)
        run1.font.color.rgb = COLOR_DARK
        run2 = p.add_run()
        run2.text = text_content
        run2.font.size = Pt(16)
        run2.font.color.rgb = COLOR_DARK
        
    add_bullet(tf, "• Directeur / Super Admin : ", "Accès total à tous les onglets, modification des droits, déverrouillage des notes figées et validation finale des Procès-Verbaux (PV).")
    add_bullet(tf, "• Correspondant Fichier (Informaticien) : ", "Gestion technique des bases de données, inscriptions, configurations d'EDT et correctifs de notes.")
    add_bullet(tf, "• Professeurs : ", "Accès limité à l'emploi du temps personnel et saisie des notes uniquement sur autorisation expresse.")
    add_bullet(tf, "• Attribution des droits : ", "Le Directeur attribue la permission 'Saisie des Moyennes' dynamiquement via l'onglet Administration.")

    # --- SLIDE 3: Saisie des Moyennes ---
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_bg(slide, COLOR_LIGHT_BG)
    add_header(slide, "2. Saisie des Moyennes & Verrouillage")
    
    txBox = slide.shapes.add_textbox(Inches(0.5), Inches(1.5), Inches(12.33), Inches(5.0))
    tf = txBox.text_frame
    tf.word_wrap = True
    
    add_bullet(tf, "• Saisie par le Professeur : ", "Le professeur remplit la grille de notes pour sa classe/matière autorisée.")
    add_bullet(tf, "• Action 'Valider & Figer' : ", "Une fois validées, les notes passent au statut verrouillé (🔒). L'enseignant ne peut plus les modifier.")
    add_bullet(tf, "• Règle de Sécurité : ", "Les modifications après validation sont exclusivement réservées au Directeur et à l'Informaticien.")
    add_bullet(tf, "• Déverrouillage : ", "Le Directeur peut débloquer individuellement ou par lot les notes pour permettre un correctif.")

    # --- SLIDE 4: Workflow Bulletins ---
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_bg(slide, COLOR_LIGHT_BG)
    add_header(slide, "3. Procédure de Validation des Bulletins")
    
    txBox = slide.shapes.add_textbox(Inches(0.5), Inches(1.5), Inches(12.33), Inches(5.0))
    tf = txBox.text_frame
    tf.word_wrap = True
    
    add_bullet(tf, "• Étape 1 : Saisie de notes ", "par les enseignants pour toutes les matières.")
    add_bullet(tf, "• Étape 2 : Consultation de la 'Natte' ", "par la direction pour vérification globale.")
    add_bullet(tf, "• Étape 3 : Validation du Procès-Verbal (PV) ", "de la classe par le Directeur (onglet Évaluations).")
    add_bullet(tf, "• Étape 4 : Impression des Bulletins ", "devenue disponible uniquement après validation du PV de la classe.")
    add_bullet(tf, "• Sécurité renforcée : ", "Aucun bulletin n'est éditable ou consultable si le PV de classe n'est pas validé au préalable.")

    # --- SLIDE 5: EDT ---
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_bg(slide, COLOR_LIGHT_BG)
    add_header(slide, "4. Emplois du Temps (EDT)")
    
    txBox = slide.shapes.add_textbox(Inches(0.5), Inches(1.5), Inches(12.33), Inches(5.0))
    tf = txBox.text_frame
    tf.word_wrap = True
    
    add_bullet(tf, "• Planification intelligente : ", "Attribution des créneaux horaires, enseignants, salles et matières.")
    add_bullet(tf, "• Détection des conflits : ", "Vérification instantanée en cas de double réservation d'enseignant, de salle ou d'horaire indisponible.")
    add_bullet(tf, "• Professeur Principal : ", "Chaque classe possède son enseignant principal attitré visible sur l'EDT et le bulletin.")
    add_bullet(tf, "• Visualisation et Impression : ", "Grilles d'EDT claires filtrables par enseignant ou par classe prêtes pour l'impression.")

    # --- SLIDE 6: Finance ---
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_bg(slide, COLOR_LIGHT_BG)
    add_header(slide, "5. Facturation & Scolarité")
    
    txBox = slide.shapes.add_textbox(Inches(0.5), Inches(1.5), Inches(12.33), Inches(5.0))
    tf = txBox.text_frame
    tf.word_wrap = True
    
    add_bullet(tf, "• Traçabilité financière : ", "Enregistrement des versements d'écolages par élève.")
    add_bullet(tf, "• Reçus PDF officiels : ", "Génération automatique d'un reçu imprimable pour chaque transaction.")
    add_bullet(tf, "• Notification intégrée : ", "Bouton d'envoi rapide par WhatsApp ou SMS pour notifier instantanément les parents d'élèves.")
    
    prs.save('guide_utilisation.pptx')
    print("PowerPoint presentation generated: guide_utilisation.pptx")

def create_pdf():
    doc = SimpleDocTemplate("guide_utilisation.pdf", pagesize=letter,
                            rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    styles = getSampleStyleSheet()
    
    # Custom styles
    style_title = ParagraphStyle(
        name='TitleStyle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        textColor=colors.HexColor('#0b4998'),
        spaceAfter=15
    )
    style_subtitle = ParagraphStyle(
        name='SubTitleStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        textColor=colors.HexColor('#ee7b11'),
        spaceAfter=25
    )
    style_h2 = ParagraphStyle(
        name='H2Style',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=15,
        textColor=colors.HexColor('#0b4998'),
        spaceBefore=15,
        spaceAfter=10
    )
    style_body = ParagraphStyle(
        name='BodyStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        textColor=colors.HexColor('#1e293b'),
        spaceBefore=6,
        spaceAfter=6,
        leading=14
    )
    style_bullet = ParagraphStyle(
        name='BulletStyle',
        parent=style_body,
        leftIndent=20,
        firstLineIndent=-10,
        spaceBefore=3,
        spaceAfter=3
    )

    story = []
    
    # Title Page
    story.append(Paragraph("GUIDE D'UTILISATION OFFICIEL - ERP BARAKAT", style_title))
    story.append(Paragraph("Logiciel de Planification Scolaire, Saisie des Notes & Facturation", style_subtitle))
    story.append(Spacer(1, 15))
    
    # Intro
    story.append(Paragraph("<b>Présentation générale :</b> Ce document constitue le manuel d'utilisation complet pour les administrateurs, le Directeur et le personnel informatique de l'établissement scolaire.", style_body))
    story.append(Spacer(1, 10))
    
    # Section 1
    story.append(Paragraph("1. Rôles et Gestion des Accès (RBAC)", style_h2))
    story.append(Paragraph("L'application intègre une gestion des rôles à granularité fine pour sécuriser la saisie des moyennes :", style_body))
    story.append(Paragraph("• <b>Directeur / Super Admin :</b> Accès global, configuration générale, affectation des droits et déverrouillage des notes.", style_bullet))
    story.append(Paragraph("• <b>Correspondant Fichier (Informaticien) :</b> Inscriptions, maintenance technique, saisies de notes directes et exports.", style_bullet))
    story.append(Paragraph("• <b>Professeurs :</b> Accès restreint à leur planning et à la saisie de leurs matières autorisées.", style_bullet))
    story.append(Spacer(1, 10))
    
    # Section 2
    story.append(Paragraph("2. Registre de Saisie et Verrouillage des Moyennes", style_h2))
    story.append(Paragraph("Le processus suit un cycle de validation sécurisé :", style_body))
    story.append(Paragraph("• <b>Saisie par Enseignant :</b> Le professeur saisit les notes trimestrielles via son portail dédié.", style_bullet))
    story.append(Paragraph("• <b>Figer les Notes :</b> Une fois validées, les notes sont verrouillées. L'enseignant ne peut plus les modifier ni les supprimer.", style_bullet))
    story.append(Paragraph("• <b>Administration :</b> Seuls le Directeur et le Correspondant Fichier disposent des droits pour déverrouiller ou corriger des notes validées.", style_bullet))
    story.append(Spacer(1, 10))

    # Section 3
    story.append(Paragraph("3. Validation des PV et Édition des Bulletins", style_h2))
    story.append(Paragraph("Pour garantir l'intégrité des résultats scolaires, l'édition des bulletins suit le cheminement suivant :", style_body))
    story.append(Paragraph("1. <b>Saisie totale</b> des notes par les disciplines concernées.", style_bullet))
    story.append(Paragraph("2. <b>Validation du PV de Classe</b> par le Directeur sous l'onglet 'Procès-Verbaux & Validation'.", style_bullet))
    story.append(Paragraph("3. <b>Impression des Bulletins :</b> Devient disponible uniquement après la validation officielle du PV de la classe.", style_bullet))
    story.append(Spacer(1, 10))

    # Section 4
    story.append(Paragraph("4. Planification d'Emplois du Temps (EDT)", style_h2))
    story.append(Paragraph("• <b>Détection automatique des conflits :</b> Le système empêche les doubles réservations de salles, de professeurs et respecte les contraintes horaires.", style_bullet))
    story.append(Paragraph("• <b>Professeur Principal :</b> Association d'un enseignant référent par classe.", style_bullet))
    story.append(Spacer(1, 10))

    # Section 5
    story.append(Paragraph("5. Module Financier", style_h2))
    story.append(Paragraph("• <b>Versements d'écolages :</b> Tracé de chaque paiement d'élève.", style_bullet))
    story.append(Paragraph("• <b>Reçu PDF :</b> Génération à la volée du reçu officiel de scolarité.", style_bullet))
    story.append(Paragraph("• <b>Envoi Direct :</b> Bouton d'envoi rapide par WhatsApp/SMS pour les parents.", style_bullet))
    
    doc.build(story)
    print("PDF guide generated: guide_utilisation.pdf")

if __name__ == "__main__":
    create_presentation()
    create_pdf()
