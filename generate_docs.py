from guide_content import SECTIONS
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

COLOR_NAVY = RGBColor(11, 73, 152)
COLOR_ORANGE = RGBColor(238, 123, 17)
COLOR_DARK = RGBColor(30, 41, 59)
COLOR_WHITE = RGBColor(255, 255, 255)
COLOR_LIGHT = RGBColor(248, 250, 252)

# ─── PDF ────────────────────────────────────────────────────
def make_pdf():
    doc = SimpleDocTemplate("guide_utilisation.pdf", pagesize=A4,
                            rightMargin=35, leftMargin=35, topMargin=30, bottomMargin=30)
    SS = getSampleStyleSheet()
    t_cover = ParagraphStyle('cover', parent=SS['Title'], fontName='Helvetica-Bold',
                             fontSize=22, textColor=colors.HexColor('#0b4998'), spaceAfter=6)
    t_sub   = ParagraphStyle('sub',   parent=SS['Normal'], fontName='Helvetica',
                             fontSize=11, textColor=colors.HexColor('#ee7b11'), spaceAfter=20)
    t_mod   = ParagraphStyle('mod',   parent=SS['Heading1'], fontName='Helvetica-Bold',
                             fontSize=13, textColor=colors.HexColor('#0b4998'),
                             spaceBefore=16, spaceAfter=6,
                             backColor=colors.HexColor('#e8f0fe'), leading=18)
    t_proc  = ParagraphStyle('proc',  parent=SS['Heading2'], fontName='Helvetica-Bold',
                             fontSize=10, textColor=colors.HexColor('#ee7b11'),
                             spaceBefore=10, spaceAfter=4)
    t_step  = ParagraphStyle('step',  parent=SS['Normal'], fontName='Helvetica',
                             fontSize=9,  textColor=colors.HexColor('#1e293b'),
                             spaceBefore=2, spaceAfter=2, leftIndent=14, leading=13)

    story = []
    story.append(Paragraph("GUIDE D'UTILISATION COMPLET — ERP BARAKAT", t_cover))
    story.append(Paragraph("Manuel procédural pas-à-pas · Toutes fonctionnalités · Sans zone d'ombre", t_sub))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0b4998')))
    story.append(Spacer(1, 10))

    for section in SECTIONS:
        story.append(Paragraph("  " + section["title"], t_mod))
        for i, proc in enumerate(section["procedures"], 1):
            story.append(Paragraph(f"{i}. {proc['name']}", t_proc))
            for j, step in enumerate(proc["steps"], 1):
                story.append(Paragraph(f"  {'→' if step.startswith('  ') else str(j)+'.'} {step.strip()}", t_step))
        story.append(Spacer(1, 6))

    doc.build(story)
    print("✅ PDF généré : guide_utilisation.pdf")

# ─── PowerPoint ─────────────────────────────────────────────
def make_pptx():
    prs = Presentation()
    prs.slide_width  = Inches(13.333)
    prs.slide_height = Inches(7.5)
    BLANK = prs.slide_layouts[6]

    def bg(slide, rgb):
        f = slide.background.fill; f.solid(); f.fore_color.rgb = rgb

    def tb(slide, x, y, w, h): return slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))

    # Title slide
    s = prs.slides.add_slide(BLANK); bg(s, COLOR_NAVY)
    t = tb(s, 0.8, 1.8, 11.7, 4.2).text_frame; t.word_wrap = True
    p = t.paragraphs[0]; p.text = "ERP BARAKAT"; p.font.size=Pt(52); p.font.bold=True; p.font.color.rgb=COLOR_ORANGE; p.font.name='Arial'
    p2 = t.add_paragraph(); p2.text = "Guide d'Utilisation Complet — Pas-à-Pas"; p2.font.size=Pt(26); p2.font.bold=True; p2.font.color.rgb=COLOR_WHITE; p2.font.name='Arial'
    p3 = t.add_paragraph(); p3.text = "Tous les modules · Toutes les procédures · Sans zone d'ombre"; p3.font.size=Pt(16); p3.font.color.rgb=RGBColor(180,200,240); p3.font.name='Arial'

    for section in SECTIONS:
        for proc in section["procedures"]:
            s = prs.slides.add_slide(BLANK); bg(s, COLOR_LIGHT)
            # Section header bar
            hdr = tb(s, 0, 0, 13.333, 0.45)
            ph = hdr.text_frame.paragraphs[0]; ph.text = section["title"]
            ph.font.size=Pt(9); ph.font.bold=True; ph.font.color.rgb=COLOR_WHITE; ph.font.name='Arial'
            hdr.text_frame.paragraphs[0].runs[0].font.color.rgb=COLOR_WHITE
            hdr_box = s.shapes[-1]; fill = hdr_box.fill; fill.solid(); fill.fore_color.rgb=COLOR_NAVY
            # Procedure title
            ptb = tb(s, 0.4, 0.5, 12.5, 0.6)
            pp = ptb.text_frame.paragraphs[0]; pp.text = proc["name"]
            pp.font.size=Pt(20); pp.font.bold=True; pp.font.color.rgb=COLOR_ORANGE; pp.font.name='Arial'
            # Steps
            stb = tb(s, 0.5, 1.25, 12.3, 5.9)
            tf = stb.text_frame; tf.word_wrap = True
            first = True
            for j, step in enumerate(proc["steps"], 1):
                if first:
                    p = tf.paragraphs[0]; first = False
                else:
                    p = tf.add_paragraph()
                indent = step.startswith("  ")
                p.text = ("    " if indent else f"{j}. ") + step.strip()
                p.font.size = Pt(12 if not indent else 11)
                p.font.color.rgb = RGBColor(80,80,80) if indent else COLOR_DARK
                p.font.name = 'Arial'
                p.font.bold = not indent and len(step) < 60

    prs.save("guide_utilisation.pptx")
    print("✅ PowerPoint généré : guide_utilisation.pptx")

# ─── Markdown ───────────────────────────────────────────────
def make_md():
    lines = ["# 📘 GUIDE D'UTILISATION COMPLET — ERP BARAKAT\n",
             "**Manuel procédural pas-à-pas · Toutes fonctionnalités · Sans zone d'ombre**\n",
             "\n---\n\n## 🗺️ TABLE DES MATIÈRES\n"]
    for i, s in enumerate(SECTIONS, 1):
        lines.append(f"{i}. [{s['title']}](#{s['title'].lower().replace(' ','- ').replace(':','').replace('&','').replace('(','').replace(')','')[:40]})\n")
    lines.append("\n---\n")
    for section in SECTIONS:
        lines.append(f"\n## {section['title']}\n")
        for i, proc in enumerate(section["procedures"], 1):
            lines.append(f"\n### {i}. {proc['name']}\n")
            for j, step in enumerate(proc["steps"], 1):
                indent = step.startswith("  ")
                lines.append(f"{'  ' if indent else ''}{'' if indent else str(j)+'. '}{step.strip()}\n")
        lines.append("\n---\n")
    with open("GUIDE_UTILISATION.md", "w", encoding="utf-8") as f:
        f.writelines(lines)
    print("✅ Markdown généré : GUIDE_UTILISATION.md")

if __name__ == "__main__":
    make_pdf()
    make_pptx()
    make_md()
