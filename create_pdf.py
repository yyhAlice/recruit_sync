from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
    HRFlowable, KeepTogether, Image
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.platypus.flowables import Flowable
import os, re

SCREENSHOTS = os.path.join(os.path.dirname(__file__), "screenshots")

# ─── Color palette ───────────────────────────────────────────────────────────
BLUE      = colors.HexColor("#2563EB")
DARK_BLUE = colors.HexColor("#1E3A8A")
LIGHT_BG  = colors.HexColor("#F1F5F9")
BORDER    = colors.HexColor("#CBD5E1")
GREEN     = colors.HexColor("#16A34A")
AMBER     = colors.HexColor("#D97706")
RED_C     = colors.HexColor("#DC2626")
GRAY      = colors.HexColor("#64748B")
DARK      = colors.HexColor("#0F172A")
WHITE     = colors.white
PURPLE    = colors.HexColor("#7C3AED")
TEAL      = colors.HexColor("#0D9488")

# ─── Document setup ───────────────────────────────────────────────────────────
PAGE_W, PAGE_H = A4
MARGIN = 18 * mm

doc = SimpleDocTemplate(
    "RecruitSync_Design_Docs.pdf",
    pagesize=A4,
    leftMargin=MARGIN, rightMargin=MARGIN,
    topMargin=MARGIN, bottomMargin=MARGIN,
    title="RecruitSync Design Documentation",
    author="RecruitSync Team",
)

# ─── Styles ───────────────────────────────────────────────────────────────────
base = getSampleStyleSheet()

def S(name, parent="Normal", **kw):
    s = ParagraphStyle(name, parent=base[parent], **kw)
    return s

sTitle       = S("DocTitle",  "Title",   fontSize=28, textColor=DARK_BLUE, spaceAfter=4, leading=34)
sSubTitle    = S("DocSub",    "Normal",  fontSize=11, textColor=GRAY, spaceAfter=2)
sMeta        = S("Meta",      "Normal",  fontSize=9,  textColor=GRAY, spaceAfter=1)
sChapter     = S("Chapter",   "Heading1",fontSize=20, textColor=WHITE, spaceAfter=0, leading=26)
sH1          = S("H1",        "Heading1",fontSize=15, textColor=DARK_BLUE, spaceBefore=12, spaceAfter=4, leading=20)
sH2          = S("H2",        "Heading2",fontSize=12, textColor=BLUE, spaceBefore=8, spaceAfter=3, leading=16)
sH3          = S("H3",        "Heading3",fontSize=10, textColor=DARK, spaceBefore=6, spaceAfter=2, leading=13, fontName="Helvetica-Bold")
sBody        = S("Body",      "Normal",  fontSize=9,  textColor=DARK, leading=14, spaceAfter=4)
sBodySmall   = S("BodySm",    "Normal",  fontSize=8,  textColor=GRAY, leading=12, spaceAfter=2)
sBullet      = S("Bullet",    "Normal",  fontSize=9,  textColor=DARK, leading=13, leftIndent=12, spaceAfter=2,
                 bulletText="•", bulletIndent=4)
sCode        = S("Code",      "Code",    fontSize=7.5, fontName="Courier", leading=11,
                 backColor=LIGHT_BG, borderPadding=(4,6,4,6), textColor=colors.HexColor("#1E293B"))
sQuote       = S("Quote",     "Normal",  fontSize=10, textColor=DARK_BLUE, leading=15,
                 leftIndent=16, rightIndent=16, fontName="Helvetica-Oblique", spaceAfter=6, spaceBefore=4)
sLabel       = S("Label",     "Normal",  fontSize=7.5, textColor=WHITE, fontName="Helvetica-Bold",
                 leading=10, alignment=TA_CENTER)
sCenter      = S("Center",    "Normal",  fontSize=9, alignment=TA_CENTER, textColor=GRAY, leading=12)
sTOC         = S("TOC",       "Normal",  fontSize=10, textColor=DARK_BLUE, leading=16, spaceAfter=2)
sTOCSub      = S("TOCSub",    "Normal",  fontSize=9, textColor=GRAY, leading=14, leftIndent=14, spaceAfter=1)

# ─── Helpers ──────────────────────────────────────────────────────────────────

class ColorBox(Flowable):
    """A solid-filled rectangle (used for chapter banners)."""
    def __init__(self, w, h, fill, radius=4):
        super().__init__()
        self.w, self.h, self.fill, self.radius = w, h, fill, radius
    def draw(self):
        self.canv.setFillColor(self.fill)
        self.canv.roundRect(0, 0, self.w, self.h, self.radius, stroke=0, fill=1)
    def wrap(self, *_):
        return self.w, self.h


class ChapterBanner(Flowable):
    """Full-width colored banner with chapter number + title overlay."""
    def __init__(self, number, title, color=DARK_BLUE, w=None):
        super().__init__()
        self._w = w or (PAGE_W - 2 * MARGIN)
        self.number = number
        self.title = title
        self.color = color
        self.h = 36

    def wrap(self, *_):
        return self._w, self.h

    def draw(self):
        c = self.canv
        c.setFillColor(self.color)
        c.roundRect(0, 0, self._w, self.h, 5, stroke=0, fill=1)
        c.setFillColor(WHITE)
        c.setFont("Helvetica", 9)
        c.drawString(10, self.h - 14, f"SECTION {self.number}")
        c.setFont("Helvetica-Bold", 16)
        c.drawString(10, 7, self.title)


def hr(color=BORDER, thickness=0.5):
    return HRFlowable(width="100%", thickness=thickness, color=color, spaceAfter=4, spaceBefore=4)


def badge(text, bg=BLUE, fg=WHITE, size=7.5):
    style = ParagraphStyle("badge", fontSize=size, textColor=fg, fontName="Helvetica-Bold",
                           backColor=bg, borderPadding=(2,5,2,5), leading=10)
    return Paragraph(text, style)


def field_table(rows, col_widths=None):
    """Two-column key/value table."""
    w = PAGE_W - 2 * MARGIN
    cw = col_widths or [w * 0.28, w * 0.72]
    data = [[Paragraph(k, S("fk", fontSize=8, fontName="Helvetica-Bold", textColor=GRAY)),
             Paragraph(v, S("fv", fontSize=8, textColor=DARK, leading=11))]
            for k, v in rows]
    t = Table(data, colWidths=cw)
    t.setStyle(TableStyle([
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("ROWBACKGROUNDS", (0,0), (-1,-1), [WHITE, LIGHT_BG]),
        ("LINEBELOW", (0,0), (-1,-1), 0.3, BORDER),
        ("LEFTPADDING", (0,0), (-1,-1), 6),
        ("RIGHTPADDING", (0,0), (-1,-1), 6),
        ("TOPPADDING", (0,0), (-1,-1), 4),
        ("BOTTOMPADDING", (0,0), (-1,-1), 4),
    ]))
    return t


def api_table(rows):
    """Method | Path | Purpose table."""
    w = PAGE_W - 2 * MARGIN
    header = [
        Paragraph("Method", S("th", fontSize=8, fontName="Helvetica-Bold", textColor=WHITE)),
        Paragraph("Path",   S("th", fontSize=8, fontName="Helvetica-Bold", textColor=WHITE)),
        Paragraph("Purpose",S("th", fontSize=8, fontName="Helvetica-Bold", textColor=WHITE)),
    ]
    data = [header]
    METHOD_COLORS = {"GET": colors.HexColor("#0369A1"), "POST": GREEN,
                     "PATCH": AMBER, "DELETE": RED_C}
    for method, path, purpose in rows:
        mc = METHOD_COLORS.get(method, GRAY)
        data.append([
            Paragraph(f'<font color="white"><b>{method}</b></font>',
                      S("m", fontSize=7.5, backColor=mc, borderPadding=(2,4,2,4), leading=10)),
            Paragraph(f'<font name="Courier">{path}</font>',
                      S("p", fontSize=7.5, textColor=DARK_BLUE, leading=11)),
            Paragraph(purpose, S("pu", fontSize=7.5, textColor=DARK, leading=11)),
        ])
    t = Table(data, colWidths=[w*0.1, w*0.38, w*0.52])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), DARK_BLUE),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [WHITE, LIGHT_BG]),
        ("LINEBELOW", (0,0), (-1,-1), 0.3, BORDER),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("LEFTPADDING", (0,0), (-1,-1), 6),
        ("RIGHTPADDING", (0,0), (-1,-1), 6),
        ("TOPPADDING", (0,0), (-1,-1), 3),
        ("BOTTOMPADDING", (0,0), (-1,-1), 3),
        ("ROWBACKGROUNDS", (0,0), (0,-1), [None]),  # remove leftpad override
    ]))
    return t


def sql_table(rows):
    """Entity / relationships table."""
    w = PAGE_W - 2 * MARGIN
    header = [
        Paragraph("Entity",       S("th2", fontSize=8, fontName="Helvetica-Bold", textColor=WHITE)),
        Paragraph("Key relationships", S("th2", fontSize=8, fontName="Helvetica-Bold", textColor=WHITE)),
    ]
    data = [header]
    for entity, rel in rows:
        data.append([
            Paragraph(f"<b>{entity}</b>", S("e", fontSize=8, textColor=DARK_BLUE, leading=11)),
            Paragraph(rel, S("r", fontSize=8, textColor=DARK, leading=11)),
        ])
    t = Table(data, colWidths=[w*0.22, w*0.78])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), DARK_BLUE),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [WHITE, LIGHT_BG]),
        ("LINEBELOW", (0,0), (-1,-1), 0.3, BORDER),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("LEFTPADDING", (0,0), (-1,-1), 6),
        ("RIGHTPADDING", (0,0), (-1,-1), 6),
        ("TOPPADDING", (0,0), (-1,-1), 4),
        ("BOTTOMPADDING", (0,0), (-1,-1), 4),
    ]))
    return t


def p(text, style=None):
    return Paragraph(text, style or sBody)


def h1(text): return Paragraph(text, sH1)
def h2(text): return Paragraph(text, sH2)
def h3(text): return Paragraph(text, sH3)
def sp(n=6):  return Spacer(1, n)


def bullets(items, style=None):
    st = style or sBullet
    return [Paragraph(item, st) for item in items]


# ─── Cover page ───────────────────────────────────────────────────────────────

class CoverPage(Flowable):
    def __init__(self, w, h):
        super().__init__()
        self.w, self.h = w, h
        self.width = w
        self.height = h

    def wrap(self, availW, availH):
        self.w = availW
        self.h = availH
        return availW, availH

    def draw(self):
        c = self.canv
        # Background gradient simulation — two rects
        c.setFillColor(colors.HexColor("#0F172A"))
        c.rect(0, 0, self.w, self.h, stroke=0, fill=1)
        # Accent strip
        c.setFillColor(BLUE)
        c.rect(0, self.h * 0.38, self.w, 4, stroke=0, fill=1)
        # Title
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 38)
        c.drawCentredString(self.w/2, self.h * 0.62, "RecruitSync")
        c.setFont("Helvetica", 18)
        c.setFillColor(colors.HexColor("#93C5FD"))
        c.drawCentredString(self.w/2, self.h * 0.56, "Design Documentation")
        # Tagline
        c.setFont("Helvetica", 11)
        c.setFillColor(colors.HexColor("#94A3B8"))
        c.drawCentredString(self.w/2, self.h * 0.50,
            "Product · UX · Engineering · UI Layout")
        # Divider
        c.setStrokeColor(BLUE)
        c.setLineWidth(1)
        c.line(self.w*0.25, self.h*0.465, self.w*0.75, self.h*0.465)
        # Meta
        c.setFont("Helvetica", 9)
        c.setFillColor(GRAY)
        c.drawCentredString(self.w/2, self.h*0.43, "Status: Draft v0.1  ·  Last updated: 2026-06-25  ·  Internal use only")
        # Section pills
        pills = [
            (BLUE,   "01  Product Design"),
            (TEAL,   "02  UX Design"),
            (PURPLE, "03  Engineering"),
            (colors.HexColor("#B45309"), "04  UI Layout"),
        ]
        pill_w, pill_h = 120, 28
        total = len(pills) * pill_w + (len(pills)-1)*12
        x_start = (self.w - total) / 2
        y = self.h * 0.32
        for i, (col, label) in enumerate(pills):
            x = x_start + i*(pill_w+12)
            c.setFillColor(col)
            c.roundRect(x, y, pill_w, pill_h, 5, stroke=0, fill=1)
            c.setFillColor(WHITE)
            c.setFont("Helvetica-Bold", 8)
            c.drawCentredString(x + pill_w/2, y+10, label)
        # Footer
        c.setFont("Helvetica", 8)
        c.setFillColor(colors.HexColor("#475569"))
        c.drawCentredString(self.w/2, 20,
            "RecruitSync · Recruitment CRM for agencies placing international candidates in Japan")


# ─── UI Layout Diagram ────────────────────────────────────────────────────────

def _screenshot(name, width=None):
    """Return a reportlab Image flowable for a captured screenshot."""
    path = os.path.join(SCREENSHOTS, f"{name}.png")
    w = width or (PAGE_W - 2 * MARGIN)
    img = Image(path, width=w, height=w * 820 / 1280)
    img.hAlign = "CENTER"
    return img


# ── placeholder so old references compile (classes removed) ──
class _RemovedDiagram(Flowable):
    def wrap(self, *_): return 0, 0
    def draw(self): pass

PipelineBoardDiagram  = _RemovedDiagram
DashboardDiagram      = _RemovedDiagram
FileWorkspaceDiagram  = _RemovedDiagram
LoginOnboardingDiagram = _RemovedDiagram

class _Dummy(Flowable):
    """Placeholder — old diagram bodies removed."""
    def __init__(self, w):
        super().__init__()
        self.bw = w
        self.bh = 280

    def wrap(self, *_):
        return self.bw, self.bh

    def draw(self):
        c = self.canv
        w, h = self.bw, self.bh

        # Background
        c.setFillColor(colors.HexColor("#F8FAFC"))
        c.roundRect(0, 0, w, h, 6, stroke=0, fill=1)
        c.setStrokeColor(BORDER)
        c.setLineWidth(0.5)
        c.roundRect(0, 0, w, h, 6, stroke=1, fill=0)

        # Top bar
        bar_h = 32
        c.setFillColor(DARK_BLUE)
        c.roundRect(0, h-bar_h, w, bar_h, 6, stroke=0, fill=1)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 9)
        c.drawString(12, h-20, "← Jobs")
        c.setFont("Helvetica-Bold", 11)
        c.drawCentredString(w/2, h-20, "Senior Java Engineer — Nexus Systems K.K.")
        c.setFont("Helvetica", 8)
        c.setFillColor(colors.HexColor("#93C5FD"))
        c.drawRightString(w-12, h-20, "Recruiter: All  ▾")

        # Columns
        stages = ["Sourced", "Screening", "Interview", "Offered", "Placed", "Rejected"]
        stage_colors = [GRAY, BLUE, TEAL, PURPLE, GREEN, RED_C]
        col_pad = 6
        col_w = (w - col_pad * (len(stages)+1)) / len(stages)
        col_top = h - bar_h - col_pad
        col_h = col_top - col_pad

        cards = {
            "Sourced": [("Tanaka H.", GREEN, "Java, Spring", "Resume reviewed"),
                        ("Park J.",   AMBER, "Python, AWS",  "Initial contact")],
            "Screening":[("Kim JW.",  RED_C,  "Java, N2",    "CV sent 18 days ago")],
            "Interview":[("Aung A.",  GREEN,  "Java, N1",    "1st round Thu 26 Jun")],
            "Offered":  [("Sato M.",  GREEN,  "Java, Native","Offer issued")],
            "Placed":   [("Chen L.",  GREEN,  "Java, N2",    "Placed ¥9M")],
            "Rejected": [],
        }

        for i, (stage, col) in enumerate(zip(stages, stage_colors)):
            x = col_pad + i * (col_w + col_pad)
            # Column background
            c.setFillColor(colors.HexColor("#E2E8F0"))
            c.roundRect(x, col_pad, col_w, col_h, 4, stroke=0, fill=1)
            # Column header
            c.setFillColor(col)
            c.roundRect(x, col_pad + col_h - 22, col_w, 22, 4, stroke=0, fill=1)
            c.setFillColor(WHITE)
            c.setFont("Helvetica-Bold", 7.5)
            count = len(cards.get(stage, []))
            c.drawCentredString(x + col_w/2, col_pad + col_h - 13, f"{stage}  {count}")

            # Cards
            card_y = col_pad + col_h - 26
            for cname, dot_col, skills, log in cards.get(stage, []):
                card_h2 = 52
                card_y -= (card_h2 + 4)
                if card_y < col_pad + 4:
                    break
                c.setFillColor(WHITE)
                c.roundRect(x+3, card_y, col_w-6, card_h2, 3, stroke=0, fill=1)
                c.setStrokeColor(BORDER)
                c.setLineWidth(0.4)
                c.roundRect(x+3, card_y, col_w-6, card_h2, 3, stroke=1, fill=0)
                # Status dot
                c.setFillColor(dot_col)
                c.circle(x+10, card_y+card_h2-9, 4, stroke=0, fill=1)
                # Name
                c.setFillColor(DARK)
                c.setFont("Helvetica-Bold", 7.5)
                c.drawString(x+18, card_y+card_h2-11, cname)
                # Skills
                c.setFont("Helvetica", 6.5)
                c.setFillColor(GRAY)
                c.drawString(x+5, card_y+card_h2-24, skills)
                # Divider
                c.setStrokeColor(BORDER)
                c.setLineWidth(0.3)
                c.line(x+5, card_y+card_h2-30, x+col_w-8, card_y+card_h2-30)
                # Log preview
                c.setFont("Helvetica", 6)
                c.setFillColor(colors.HexColor("#64748B"))
                c.drawString(x+5, card_y+card_h2-40, log[:28]+"…" if len(log)>28 else log)

            # Empty column placeholder
            if not cards.get(stage):
                c.setStrokeColor(BORDER)
                c.setDash(3, 3)
                c.setLineWidth(0.5)
                c.roundRect(x+5, col_pad+8, col_w-10, col_h-38, 3, stroke=1, fill=0)
                c.setDash()
                c.setFont("Helvetica", 6.5)
                c.setFillColor(GRAY)
                c.drawCentredString(x+col_w/2, col_pad+col_h//2-18, "Drop candidate here")

        # Legend
        lx, ly = 8, -2
        for dot_col, label in [(GREEN,"< 7 days"),(AMBER,"7–14 days"),(RED_C,"> 14 days / overdue")]:
            c.setFillColor(dot_col)
            c.circle(lx+4, ly+5, 3.5, stroke=0, fill=1)
            c.setFillColor(GRAY)
            c.setFont("Helvetica", 6.5)
            c.drawString(lx+10, ly+2, label)
            lx += 72


class _DashboardDiagramOLD(Flowable):
    """REMOVED — replaced by screenshot."""
    def __init__(self, w):
        super().__init__()
        self.bw = w
        self.bh = 220

    def wrap(self, *_):
        return self.bw, self.bh

    def draw(self):
        c = self.canv
        w, h = self.bw, self.bh

        c.setFillColor(colors.HexColor("#F8FAFC"))
        c.roundRect(0, 0, w, h, 6, stroke=0, fill=1)
        c.setStrokeColor(BORDER)
        c.setLineWidth(0.5)
        c.roundRect(0, 0, w, h, 6, stroke=1, fill=0)

        # Top bar
        c.setFillColor(DARK_BLUE)
        c.roundRect(0, h-28, w, 28, 6, stroke=0, fill=1)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 11)
        c.drawString(12, h-18, "Dashboard")
        c.setFont("Helvetica", 8)
        c.setFillColor(colors.HexColor("#93C5FD"))
        c.drawRightString(w-12, h-18, "This month  ▾")

        # Metric cards
        metrics = [
            (BLUE,  "24",  "Active Jobs"),
            (TEAL,  "11",  "In Screening"),
            (PURPLE,"8",   "Interviews Today"),
            (RED_C, "3",   "Reminders Due"),
        ]
        card_w = (w - 10*5) / 4
        cy = h - 28 - 8 - 48
        for i, (col, val, label) in enumerate(metrics):
            cx = 10 + i*(card_w+10)
            c.setFillColor(WHITE)
            c.roundRect(cx, cy, card_w, 48, 4, stroke=0, fill=1)
            c.setStrokeColor(col)
            c.setLineWidth(2)
            c.line(cx, cy+48, cx+card_w, cy+48)  # top accent line
            c.setStrokeColor(BORDER)
            c.setLineWidth(0.4)
            c.roundRect(cx, cy, card_w, 48, 4, stroke=1, fill=0)
            c.setFillColor(col)
            c.setFont("Helvetica-Bold", 18)
            c.drawCentredString(cx+card_w/2, cy+22, val)
            c.setFont("Helvetica", 7)
            c.setFillColor(GRAY)
            c.drawCentredString(cx+card_w/2, cy+10, label)

        # Two-column section
        mid = h - 28 - 8 - 48 - 8
        col_l_w = w * 0.55 - 10
        col_r_w = w * 0.45 - 10
        sec_h = mid - 40

        # Left: bar chart
        c.setFillColor(WHITE)
        c.roundRect(10, 38, col_l_w, sec_h, 4, stroke=0, fill=1)
        c.setStrokeColor(BORDER)
        c.setLineWidth(0.4)
        c.roundRect(10, 38, col_l_w, sec_h, 4, stroke=1, fill=0)
        c.setFont("Helvetica-Bold", 8)
        c.setFillColor(DARK)
        c.drawString(18, 38+sec_h-14, "Candidates by Stage")
        stages_bar = [("Sourced",6,GRAY),("Screening",11,BLUE),("Interview",8,TEAL),
                      ("Offered",3,PURPLE),("Placed",14,GREEN),("Rejected",4,RED_C)]
        bar_x0 = 22
        bar_max_w = col_l_w - 70
        bar_h_each = (sec_h - 30) / len(stages_bar) - 3
        by = 38 + sec_h - 28
        for stg, cnt, col in stages_bar:
            bw2 = bar_max_w * cnt / 14
            c.setFillColor(col)
            c.roundRect(bar_x0+50, by, bw2, bar_h_each-2, 2, stroke=0, fill=1)
            c.setFont("Helvetica", 6.5)
            c.setFillColor(GRAY)
            c.drawRightString(bar_x0+46, by+2, stg)
            c.setFillColor(DARK)
            c.drawString(bar_x0+54+bw2, by+2, str(cnt))
            by -= (bar_h_each + 3)

        # Right: due today
        rx = 10 + col_l_w + 10
        c.setFillColor(WHITE)
        c.roundRect(rx, 38, col_r_w, sec_h, 4, stroke=0, fill=1)
        c.setStrokeColor(BORDER)
        c.setLineWidth(0.4)
        c.roundRect(rx, 38, col_r_w, sec_h, 4, stroke=1, fill=0)
        c.setFont("Helvetica-Bold", 8)
        c.setFillColor(DARK)
        c.drawString(rx+8, 38+sec_h-14, "Due Today")
        reminders = [
            ("Follow up — Kim JW.", RED_C, "OVERDUE"),
            ("Send offer — Sato M.", AMBER, "TODAY"),
            ("CV review — Park J.", BLUE,  "TODAY"),
        ]
        ry = 38 + sec_h - 28
        for rtask, rcol, rbadge in reminders:
            c.setFillColor(colors.HexColor("#FFF1F2") if rcol==RED_C else LIGHT_BG)
            c.roundRect(rx+6, ry, col_r_w-12, 18, 2, stroke=0, fill=1)
            c.setFillColor(rcol)
            c.setFont("Helvetica-Bold", 6)
            c.drawString(rx+10, ry+6, rbadge)
            c.setFillColor(DARK)
            c.setFont("Helvetica", 6.5)
            c.drawString(rx+52, ry+6, rtask[:22]+"…" if len(rtask)>22 else rtask)
            c.setFillColor(GREEN)
            c.roundRect(rx+col_r_w-30, ry+3, 22, 12, 2, stroke=0, fill=1)
            c.setFillColor(WHITE)
            c.setFont("Helvetica-Bold", 6)
            c.drawCentredString(rx+col_r_w-19, ry+7, "Done")
            ry -= 24

        # Bottom: recent placements header
        c.setFont("Helvetica-Bold", 8)
        c.setFillColor(DARK)
        c.drawString(10, 28, "Recent Placements")
        c.setFont("Helvetica", 7)
        c.setFillColor(GRAY)
        c.drawString(10, 16, "Chen L.  ·  Java Engineer  ·  Nexus Systems  ·  2026-06-10  ·  ¥9,000,000")


class _FileWorkspaceDiagramOLD(Flowable):
    """REMOVED — replaced by screenshot."""
    def __init__(self, w):
        super().__init__()
        self.bw = w
        self.bh = 240

    def wrap(self, *_):
        return self.bw, self.bh

    def draw(self):
        c = self.canv
        w, h = self.bw, self.bh

        c.setFillColor(colors.HexColor("#F8FAFC"))
        c.roundRect(0, 0, w, h, 6, stroke=0, fill=1)
        c.setStrokeColor(BORDER)
        c.setLineWidth(0.5)
        c.roundRect(0, 0, w, h, 6, stroke=1, fill=0)

        # Top nav
        c.setFillColor(DARK_BLUE)
        c.roundRect(0, h-28, w, 28, 6, stroke=0, fill=1)
        c.setFillColor(WHITE)
        c.setFont("Helvetica", 8)
        c.drawString(10, h-18, "File Workspace  ›  Clients  ›  Toyota  ›  Contracts")
        c.setFont("Helvetica-Bold", 8)
        c.setFillColor(colors.HexColor("#93C5FD"))
        c.drawRightString(w-10, h-18, "✎ Rename")

        # Toolbar
        ty = h - 28 - 10 - 22
        for label, col in [("Upload File", BLUE),("New Subfolder", TEAL),("Download ZIP", GRAY)]:
            btn_w = 90
            c.setFillColor(col)
            c.roundRect(10, ty, btn_w, 20, 3, stroke=0, fill=1)
            c.setFillColor(WHITE)
            c.setFont("Helvetica-Bold", 7.5)
            c.drawCentredString(10+btn_w/2, ty+6, label)
            # shift next button
            if label == "Upload File":
                c.translate(100, 0)
            elif label == "New Subfolder":
                c.translate(100, 0)
        c.resetTransforms()  # reset transforms

        # Tabs
        tab_y = h - 28 - 10 - 22 - 10 - 22
        tabs = [("Files", True), ("Notes", False), ("Activity History", False), ("Shared Members", False)]
        tx = 10
        for tab_label, active in tabs:
            tab_w = 90 if tab_label == "Activity History" else 70
            c.setFillColor(BLUE if active else colors.HexColor("#E2E8F0"))
            c.roundRect(tx, tab_y, tab_w, 20, 3, stroke=0, fill=1)
            c.setFillColor(WHITE if active else GRAY)
            c.setFont("Helvetica-Bold" if active else "Helvetica", 7.5)
            c.drawCentredString(tx+tab_w/2, tab_y+6, tab_label)
            tx += tab_w + 4

        # File list area
        list_top = tab_y - 6
        list_h = list_top - 12
        c.setFillColor(WHITE)
        c.roundRect(10, 12, w-20, list_h, 4, stroke=0, fill=1)
        c.setStrokeColor(BORDER)
        c.setLineWidth(0.4)
        c.roundRect(10, 12, w-20, list_h, 4, stroke=1, fill=0)

        # Column headers
        hdr_y = list_top - 18
        c.setFillColor(LIGHT_BG)
        c.rect(10, hdr_y, w-20, 18, stroke=0, fill=1)
        c.setFont("Helvetica-Bold", 7)
        c.setFillColor(GRAY)
        for label, xpos in [("File Name",20),("Size",220),("Uploaded by",260),("Date",330),("Actions",390)]:
            c.drawString(xpos, hdr_y+5, label)

        # File rows
        files = [
            ("📄 NexusSystems_NDA_2026.pdf", "1.2 MB", "Y. Tanaka", "2026-06-10"),
            ("📄 Contract_v2_signed.docx",   "0.8 MB", "J. Yamamoto","2026-06-15"),
            ("📄 MSA_Amendment_01.pdf",      "2.1 MB", "Y. Tanaka", "2026-06-20"),
        ]
        fy = hdr_y - 4
        for fname, size, uploader, date in files:
            fy -= 22
            c.setFillColor(WHITE)
            c.rect(10, fy, w-20, 20, stroke=0, fill=1)
            c.setStrokeColor(BORDER)
            c.setLineWidth(0.3)
            c.line(10, fy, w-10, fy)
            c.setFont("Helvetica", 7.5)
            c.setFillColor(BLUE)
            c.drawString(20, fy+6, fname)
            c.setFillColor(GRAY)
            c.setFont("Helvetica", 7)
            c.drawString(220, fy+6, size)
            c.drawString(260, fy+6, uploader)
            c.drawString(330, fy+6, date)
            # action buttons
            for ax, alabel, acol in [(390,"↓",BLUE),(408,"Move",TEAL),(432,"✕",RED_C)]:
                c.setFillColor(acol)
                c.roundRect(ax, fy+3, 20 if alabel!="Move" else 28, 14, 2, stroke=0, fill=1)
                c.setFillColor(WHITE)
                c.setFont("Helvetica-Bold", 6.5)
                c.drawCentredString(ax+(10 if alabel!="Move" else 14), fy+8, alabel)

        # Drop zone hint at bottom
        c.setStrokeColor(BLUE)
        c.setDash(3, 3)
        c.setLineWidth(0.5)
        c.roundRect(14, 16, w-28, fy-20, 4, stroke=1, fill=0)
        c.setDash()
        c.setFont("Helvetica", 7)
        c.setFillColor(colors.HexColor("#93C5FD"))
        c.drawCentredString(w/2, 22, "Drop files here to upload")


class _LoginOnboardingDiagramOLD(Flowable):
    """REMOVED — replaced by screenshot."""
    def __init__(self, w):
        super().__init__()
        self.bw = w
        self.bh = 200

    def wrap(self, *_):
        return self.bw, self.bh

    def draw(self):
        c = self.canv
        w, h = self.bw, self.bh
        half = (w - 20) / 2

        def panel(x, title):
            c.setFillColor(WHITE)
            c.roundRect(x, 0, half, h, 6, stroke=0, fill=1)
            c.setStrokeColor(BORDER)
            c.setLineWidth(0.5)
            c.roundRect(x, 0, half, h, 6, stroke=1, fill=0)
            c.setFillColor(DARK_BLUE)
            c.roundRect(x, h-26, half, 26, 6, stroke=0, fill=1)
            c.setFillColor(WHITE)
            c.setFont("Helvetica-Bold", 9)
            c.drawCentredString(x+half/2, h-15, title)

        # Login panel
        panel(0, "Login")
        # Logo area
        c.setFillColor(BLUE)
        c.roundRect(half/2-40, h-70, 80, 30, 4, stroke=0, fill=1)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 10)
        c.drawCentredString(half/2, h-50, "RecruitSync")
        # Fields
        for i, label in enumerate(["Email", "Password"]):
            fy = h - 95 - i*40
            c.setFont("Helvetica", 7)
            c.setFillColor(GRAY)
            c.drawString(14, fy+4, label)
            c.setFillColor(LIGHT_BG)
            c.roundRect(12, fy-14, half-24, 18, 3, stroke=0, fill=1)
            c.setStrokeColor(BORDER)
            c.setLineWidth(0.4)
            c.roundRect(12, fy-14, half-24, 18, 3, stroke=1, fill=0)
        # Login button
        c.setFillColor(BLUE)
        c.roundRect(12, h-185, half-24, 22, 3, stroke=0, fill=1)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 9)
        c.drawCentredString(half/2, h-170, "Log In")
        # Footer
        c.setFont("Helvetica", 6.5)
        c.setFillColor(GRAY)
        c.drawCentredString(half/2, 10, "RecruitSync V1 · Internal use only")

        # Onboarding panel
        ox = half + 20
        panel(ox, "Onboarding — First time setup")
        # Welcome
        c.setFont("Helvetica-Bold", 9)
        c.setFillColor(DARK)
        c.drawCentredString(ox+half/2, h-50, "Welcome to RecruitSync!")
        c.setFont("Helvetica", 7.5)
        c.setFillColor(GRAY)
        c.drawCentredString(ox+half/2, h-62, "Let's set up your first client and job")
        # Progress steps
        steps = ["Add Client", "Add Job", "Upload CV"]
        step_colors = [BLUE, BORDER, BORDER]
        sx = ox + 16
        for i, (step, scol) in enumerate(zip(steps, step_colors)):
            c.setFillColor(scol)
            c.circle(sx+i*(half-32)/2+14, h-90, 10, stroke=0, fill=1)
            c.setFillColor(WHITE)
            c.setFont("Helvetica-Bold", 7)
            c.drawCentredString(sx+i*(half-32)/2+14, h-93, str(i+1))
            c.setFillColor(GRAY if scol==BORDER else DARK)
            c.setFont("Helvetica", 6.5)
            c.drawCentredString(sx+i*(half-32)/2+14, h-107, step)
            if i < 2:
                c.setStrokeColor(BORDER)
                c.setLineWidth(0.5)
                c.line(sx+i*(half-32)/2+24, h-90, sx+(i+1)*(half-32)/2+4, h-90)

        # Primary CTA
        c.setFillColor(BLUE)
        c.roundRect(ox+12, h-145, half-24, 22, 3, stroke=0, fill=1)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 8.5)
        c.drawCentredString(ox+half/2, h-130, "Add your first client →")

        # Secondary CTA
        c.setFillColor(LIGHT_BG)
        c.roundRect(ox+12, h-175, half-24, 20, 3, stroke=0, fill=1)
        c.setStrokeColor(BORDER)
        c.setLineWidth(0.4)
        c.roundRect(ox+12, h-175, half-24, 20, 3, stroke=1, fill=0)
        c.setFillColor(GRAY)
        c.setFont("Helvetica", 8)
        c.drawCentredString(ox+half/2, h-162, "Skip — existing client")


# ─── Build story ──────────────────────────────────────────────────────────────

W = PAGE_W - 2 * MARGIN
story = []

# ── Cover ──
story.append(CoverPage(W, PAGE_H))
story.append(PageBreak())

# ── Table of Contents ──
story.append(Paragraph("Table of Contents", sH1))
story.append(hr(BLUE, 1))
story.append(sp(6))
toc_items = [
    ("01", "Product Design Doc", "Scope, user profile, success metrics, open questions"),
    ("02", "UX Design Doc",      "21 screen specs, user journeys, component notes, accessibility"),
    ("03", "Engineering Design Doc", "Architecture, data model, API surface, trade-offs, testing"),
    ("04", "UI Layout Design",   "High-fidelity screen wireframes: Dashboard, Pipeline, Files, Login"),
]
for num, title, desc in toc_items:
    story.append(Paragraph(f'<b>{num}</b>  {title}', sTOC))
    story.append(Paragraph(desc, sTOCSub))
    story.append(sp(2))
story.append(PageBreak())

# ═══════════════════════════════════════════════════════════════════════
# SECTION 01 — PRODUCT DESIGN DOC
# ═══════════════════════════════════════════════════════════════════════

story.append(ChapterBanner("01", "Product Design Doc", DARK_BLUE, W))
story.append(sp(8))
story.append(field_table([
    ("Author", "TBD"),
    ("Status", "Draft v0.1"),
    ("Last updated", "2026-06-25"),
    ("One-liner", "A recruitment CRM for agencies placing international candidates in Japan — tracks every client, job, and candidate from first contact to placement, no spreadsheet required."),
]))
story.append(sp(10))

story.append(h1("1. The User & The Moment"))
story.append(field_table([
    ("Who",      "A recruiter at a small-to-mid-size international recruitment agency placing candidates into Japanese companies. Tools today: Excel, Google Drive, WhatsApp, and memory."),
    ("When",     "Monday morning. 24 active jobs, 8 interviews this week, 5 overdue reminders. Spends 10 minutes in Excel figuring out where each candidate is."),
    ("Why now",  "The agency is growing. Placements are falling through because candidate stages aren't tracked. Clients go cold because nobody logged the last call."),
]))
story.append(sp(8))

story.append(h1("2. The Contract (I/O)"))
story.append(field_table([
    ("Input",  "Client record → Job opening → Candidate CV uploaded and parsed → Candidate attached to job at starting stage."),
    ("Output", "Pipeline Kanban board per job: 6 stages, last activity on card, next due reminder flagged red/amber/green."),
    ("The loop", "Open app → check reminders → open pipeline → drag candidate to next stage + log move → close. Repeat daily."),
]))
story.append(sp(8))

story.append(h1("3. The Magical Moment"))
story.append(Paragraph(
    '"I opened the pipeline board and for the first time I could see every candidate, every stage, every overdue follow-up — all in one screen. I didn\'t open Excel once today."',
    sQuote))
story.append(sp(8))

story.append(h1("4. Scope — What We ARE Building (v1)"))
scope_items = [
    "User login — recruiter / admin roles; JWT-based session",
    "Guided onboarding — Add Client → Add Job → Upload CV",
    "Dashboard — active job count, candidates by stage, today's reminders, recent placements",
    "Client management — company profile with tabs for jobs, activity logs, files, reminders",
    "Job management — linked to client; JPY salary range, language levels, required skills",
    "Candidate management — profile from CV upload; linked to many jobs",
    "CV upload & parser — PDF/Word/image; 履歴書 (File 1) + 職務経歴書 (File 2); async parse",
    "CV data merge engine — personal data from File 1 + work history from File 2; recruiter review",
    "CV template selector — Agency Standard / Client-specific / Japanese 履歴書 / Work Experience",
    "Formatted CV export — DOCX or PDF; downloadable; stored as FileAsset",
    "Pipeline board — 6-column Kanban; status dots; drag-to-move with inline log prompt",
    "Activity logs — manual communication log (Call/Email/Meeting/Chat) per entity",
    "Reminders — follow-up tasks with priority; team-visible; Overdue/Today/This week view",
    "File Workspace — hierarchical folder system; 4-tab workspace per folder (Files/Notes/Activity/Members)",
]
story += bullets(scope_items)
story.append(sp(8))

story.append(h2("Default Folder Structure"))
story.append(field_table([
    ("Clients / {Company}", "Contracts · JD · Meeting Notes · NDA · Visa · Others"),
    ("Candidates / {Name}", "CV · Passport · Certificates · JLPT · Photos · Other Documents"),
    ("Jobs / {Job title}",  "JD · Interview Results · Offer Letters · Others"),
]))
story.append(sp(8))

story.append(h1("5. Scope — What We Are NOT Building"))
not_scope = [
    "No email integration — communication logged manually; no Gmail/Outlook sync",
    "No payroll or salary calculation engine",
    "No business card OCR — deferred to Phase 4",
    "No candidate-facing or client-facing portal",
    "No AI scoring or ranking",
    "No mobile native app — responsive web only in v1",
    "No bulk Excel import",
    "No multi-tenancy",
    "No per-folder access control in v1 (data model supports it; UI deferred to v2)",
]
story += bullets(not_scope)
story.append(sp(8))

story.append(h1("6. The Signature Detail"))
story.append(p(
    "The <b>status dot</b> on every pipeline card — a 9px filled circle. "
    "<font color='#16A34A'><b>Green</b></font> = last contact within 7 days. "
    "<font color='#D97706'><b>Amber</b></font> = 7–14 days. "
    "<font color='#DC2626'><b>Red</b></font> = &gt;14 days or reminder past due. "
    "Appears on pipeline cards, job list rows, and reminder rows. "
    "From across the room, a recruiter scanning the board instantly sees which candidates are falling through the cracks."
))
story.append(sp(8))

story.append(h1("7. Success Metrics"))
story.append(field_table([
    ("Primary",   "≥ 80% of active jobs have at least one candidate stage update logged within 7 days of go-live (measured by pipeline log entries)."),
    ("Secondary", "Overdue reminders drop by ≥ 30% between month 1 and month 2."),
    ("NOT measuring", "Total logins, session length, page views — vanity metrics for an internal tool."),
]))
story.append(sp(8))

story.append(h1("8. Open Questions"))
open_q = [
    "Hard cutover from Excel or parallel-run? Parallel run is safer but requires double data entry during transition.",
    "Is candidate data shared across all recruiters, or siloed per assigned recruiter?",
    "What is the acceptable CV parser field extraction error rate before switching to LLM-based extraction?",
    "Which languages must the CV parser support at launch? English assumed; Japanese and Myanmar flagged as hard.",
]
story += bullets(open_q)
story.append(PageBreak())

# ═══════════════════════════════════════════════════════════════════════
# SECTION 02 — UX DESIGN DOC
# ═══════════════════════════════════════════════════════════════════════

story.append(ChapterBanner("02", "UX Design Doc", TEAL, W))
story.append(sp(8))
story.append(field_table([("Designer","TBD"),("Status","Draft v0.1"),("Last updated","2026-06-25")]))
story.append(sp(10))

story.append(h1("1. The Design Bet"))
story.append(p(
    "A recruiter's workday is structured around three moments: the <b>morning reminder check</b>, "
    "the <b>pipeline scan</b>, and the <b>end-of-call log entry</b>. "
    "70% of design effort goes to the pipeline board, reminder list, and activity log form. "
    "The other 12 screens exist to feed into those three."
))
story.append(sp(8))

story.append(h1("2. The Defining Interaction"))
story.append(Paragraph(
    'Recruiter opens pipeline board. Spots a red-dot card — overdue 3 days. Drags card from Screening → Interview. '
    'Inline prompt: "Log this move?" Types "1st round confirmed Thu 26 Jun 10am." Enter. '
    'Red dot turns green. Badge increments. Total time: 8 seconds.',
    sQuote))
story.append(sp(8))

story.append(h1("3. Screen Inventory (21 Screens)"))
screens = [
    ("01", "Login", "Email + password authentication"),
    ("02", "Onboarding", "3-step guided flow: Add Client → Add Job → Upload CV"),
    ("03", "Dashboard", "Metric cards, pipeline bar chart, reminders, recent placements"),
    ("04", "Client list", "Searchable/filterable table of all client companies"),
    ("05", "Add/Edit client", "Form to create or update a client record"),
    ("06", "Client detail", "Profile with tabbed sub-views: Jobs, Logs, Files, Reminders"),
    ("07", "Job list", "Searchable table of all jobs across all clients"),
    ("08", "Add/Edit job", "Form with JPY salary, language levels, skills"),
    ("09", "Job detail", "Tabbed: Candidates, Activity logs, Files"),
    ("10", "Upload CV", "Dual-file upload (File 1: 履歴書, File 2: 職務経歴書); parse trigger"),
    ("11", "Parsed data review", "Merged fields editable before save — Step 2 of CV pipeline"),
    ("12", "Template selection", "Output format picker (Agency/Client/JA 履歴書/職務経歴書)"),
    ("13", "Download", "Generation confirmation + download button"),
    ("14", "Candidate list", "Searchable index of all candidates"),
    ("15", "Candidate profile", "Parsed CV data + Linked jobs, Logs, Files tabs"),
    ("16", "Pipeline board", "6-column Kanban per job — the hero screen"),
    ("17", "Activity logs", "Log entry form + chronological feed"),
    ("18", "Reminders", "Overdue/Today/This week sections"),
    ("19", "File Workspace — root", "Top-level workspace roots: Clients / Candidates / Jobs"),
    ("20", "File Workspace — entity folder", "Folder grid for one entity; toolbar; loose files"),
    ("21", "File Workspace — folder detail", "4-tab workspace: Files, Notes, Activity History, Shared Members"),
]
tdata = [[Paragraph("#", S("th3",fontSize=7,fontName="Helvetica-Bold",textColor=WHITE)),
          Paragraph("Screen",S("th3",fontSize=7,fontName="Helvetica-Bold",textColor=WHITE)),
          Paragraph("Purpose",S("th3",fontSize=7,fontName="Helvetica-Bold",textColor=WHITE))]]
for num, name, purpose in screens:
    tdata.append([
        Paragraph(num, S("n",fontSize=7.5,textColor=GRAY,alignment=TA_CENTER)),
        Paragraph(f"<b>{name}</b>", S("sn",fontSize=7.5,textColor=DARK_BLUE,leading=11)),
        Paragraph(purpose, S("sp",fontSize=7.5,textColor=DARK,leading=11)),
    ])
t = Table(tdata, colWidths=[W*0.06, W*0.26, W*0.68])
t.setStyle(TableStyle([
    ("BACKGROUND",(0,0),(-1,0),DARK_BLUE),
    ("ROWBACKGROUNDS",(0,1),(-1,-1),[WHITE,LIGHT_BG]),
    ("LINEBELOW",(0,0),(-1,-1),0.3,BORDER),
    ("VALIGN",(0,0),(-1,-1),"MIDDLE"),
    ("LEFTPADDING",(0,0),(-1,-1),5),
    ("RIGHTPADDING",(0,0),(-1,-1),5),
    ("TOPPADDING",(0,0),(-1,-1),3),
    ("BOTTOMPADDING",(0,0),(-1,-1),3),
]))
story.append(t)
story.append(sp(10))

story.append(h1("4. Key Screen Specs"))

story.append(h2("Pipeline Board (Screen 16 — Hero Screen)"))
story.append(field_table([
    ("Layout",    "Sticky breadcrumb + recruiter filter · 6 Kanban columns: Sourced | Screening | Interview | Offered | Placed | Rejected"),
    ("Card",      "Candidate name + status dot · Skills/experience line · Last log preview · Next reminder date"),
    ("Drag",      "Stage updates on drop · Inline prompt 'Log this move?' · Enter saves log · Escape dismisses"),
    ("Empty col", "Dashed placeholder: 'Drop candidate here'"),
    ("Overflow",  "Column scrolls internally when >15 cards"),
]))
story.append(sp(6))

story.append(h2("CV Pipeline Flow (Screens 10–13)"))
story.append(field_table([
    ("Step 1 Upload",  "Dual upload zones (File 1: 履歴書, File 2: optional 職務経歴書) · Language selector · Button disabled until ≥1 file chosen"),
    ("Step 2 Review",  "Merged extracted fields, all editable · Parse-fail banner (amber) → manual entry · 'Save & Continue' writes candidate to DB"),
    ("Step 3 Template","Radio list: Agency Standard / Client-specific / Japanese 履歴書 / Work Experience · DOCX / PDF toggle"),
    ("Step 4 Download","Success card · Download button · 'Generate another format' option"),
]))
story.append(sp(6))

story.append(h2("File Workspace — Folder Detail (Screen 21)"))
story.append(field_table([
    ("Files tab",   "File list with drag-and-drop upload · Move file via folder picker modal · Multi-select → bulk ZIP or delete"),
    ("Notes tab",   "Rich-text notepad scoped to folder · Auto-saves on blur · Shows last editor + timestamp"),
    ("Activity tab","Append-only log of every file/folder action · Chronological, newest first · Cannot be edited or deleted"),
    ("Members tab", "All recruiters shown with access level · Per-member control coming v2"),
]))
story.append(sp(8))

story.append(h1("5. Component & Visual Notes"))
story.append(field_table([
    ("Typography",  "Inter or system-ui · 13px body, 15px page titles, 11px labels"),
    ("Color",       "Neutral base (white cards, light gray bg) · Semantic only: blue=info, green=success, amber=warning, red=danger, gray=neutral"),
    ("Status dot",  "9px filled circle · Green <7 days · Amber 7–14 days · Red >14 days or overdue"),
    ("Motion",      "Kanban drag only animated interaction · Drop snap 150ms ease-out · Everything else instant"),
    ("Badges",      "Pill-shaped · Stage (blue tints) · Status (green/amber/gray) · Language levels"),
    ("Microcopy",   "Direct, imperative: 'Log this move?' not 'Would you like to record this action?'"),
]))
story.append(sp(8))

story.append(h1("6. Accessibility"))
story.append(field_table([
    ("Screen readers", "All table columns have <th> headers · Form fields have <label> · Pipeline cards have ARIA labels · Keyboard drag fallback: Space to pick up, arrows to move, Space to drop"),
    ("Motor",          "All interactive targets minimum 44×44px · Kanban drag has tap-to-move fallback via stage selector modal"),
    ("Low bandwidth",  "Skeleton rows on first paint · CV parsing is async · Candidate card appears immediately; fields populate when complete"),
    ("Color blindness","Status dots also differentiated by shape in reminder list: overdue rows have full red background fill"),
]))
story.append(PageBreak())

# ═══════════════════════════════════════════════════════════════════════
# SECTION 03 — ENGINEERING DESIGN DOC
# ═══════════════════════════════════════════════════════════════════════

story.append(ChapterBanner("03", "Engineering Design Doc", PURPLE, W))
story.append(sp(8))
story.append(field_table([
    ("Author","TBD"), ("Status","Draft v0.1"), ("Last updated","2026-06-25"),
    ("Summary","React SPA + FastAPI + PostgreSQL. 9 core CRM entities + 4 CV pipeline tables. In-process parse queue; DOCX template rendering; local disk storage. Designed for <20 recruiters."),
]))
story.append(sp(10))

story.append(h1("1. Assumptions"))
story.append(field_table([
    ("Target scale", "<20 concurrent users; <10,000 total records in v1"),
    ("Latency",      "API p95 <500ms; CV parsing p95 <30s"),
    ("Platform",     "Web-first; responsive for tablet; no native mobile"),
    ("Currency",     "JPY stored as integer (no decimal)"),
    ("Languages",    "UI in English; CV parser handles English, Japanese, Myanmar"),
]))
story.append(sp(8))

story.append(h1("2. Architecture"))
story.append(h3("Stack overview"))
story.append(field_table([
    ("React SPA",      "React 18 + Vite + React Query + React Router + @dnd-kit/core · All 21 screens · Polls parse-status every 3s"),
    ("FastAPI",        "Python 3.12 · SQLAlchemy 2.x async · Alembic migrations · JWT auth · File upload · In-process parse queue"),
    ("PostgreSQL 15",  "Durable store for all 13 tables · ORM models only; raw SQL only in Alembic migrations and dashboard aggregations"),
    ("In-process queue","concurrent.futures.ThreadPoolExecutor · No Redis/Celery at v1 scale"),
    ("CV Parser",      "pdfplumber (PDF) + python-docx (Word) + regex heuristics · parse_cv(file_path, language) → ParsedCV | ParseError"),
    ("Merge Service",  "File 1 wins personal data · File 2 wins work history + skills · Conflicts surfaced for recruiter review"),
    ("Export Service", "python-docx mailmerge ({{field_name}} bookmarks) → DOCX · LibreOffice --headless → PDF"),
    ("File store",     "Local disk /data/uploads/ in v1 · FileStore protocol interface → S3 swap is one-file change"),
]))
story.append(sp(8))

story.append(h1("3. Data Model"))
story.append(h2("Core CRM Entities"))
story.append(sql_table([
    ("User",         "Creates clients, jobs, candidates; assigned to candidate_jobs and reminders"),
    ("Client",       "Has many jobs; has activity_logs, reminders; owns folder workspace (owner_type='client')"),
    ("Job",          "Belongs to client; has many candidate_jobs; has activity_logs; owns folder workspace (owner_type='job')"),
    ("Candidate",    "Has many candidate_jobs (many-to-many with jobs); has cv_uploads, generated_profiles, activity_logs; owns folder workspace (owner_type='candidate')"),
    ("CandidateJob", "Bridge: one candidate × one job; has pipeline_logs, activity_logs, reminders"),
    ("PipelineLog",  "Belongs to candidate_job; records one stage transition"),
    ("ActivityLog",  "Polymorphic — attached to client, job, candidate, or candidate_job"),
    ("Reminder",     "Polymorphic — attached to client, job, candidate, or candidate_job"),
]))
story.append(sp(6))
story.append(h2("File Workspace Entities"))
story.append(sql_table([
    ("Folder",       "Self-referential tree (parent_folder_id); belongs to one entity; has many files, one folder_note, many folder_activity entries, many folder_members"),
    ("File",         "Belongs to exactly one folder; stored in file store (disk/S3)"),
    ("FolderNote",   "One per folder (upserted); holds the rich-text note content"),
    ("FolderActivity","Append-only audit log per folder; records every mutation"),
    ("FolderMember", "Maps users to folders; v1 all users have view_upload; table exists for v2 access control"),
]))
story.append(sp(6))
story.append(h2("CV Pipeline Entities"))
story.append(sql_table([
    ("CVUpload",        "Belongs to candidate; one upload per file; has one cv_parsed_data record"),
    ("CVParsedData",    "Belongs to cv_upload (1:1); holds extracted fields as JSONB"),
    ("CVTemplate",      "Standalone; referenced by generated_profiles; DOCX file in file store"),
    ("GeneratedProfile","Belongs to candidate and cv_template; stores output DOCX/PDF path; tracked via generate_status"),
]))
story.append(sp(8))

story.append(h1("4. API Surface"))
story.append(h2("Auth"))
story.append(api_table([("POST", "/auth/login", "Issue JWT; body: {email, password} → {access_token, user}")]))
story.append(sp(4))

story.append(h2("Clients & Jobs"))
story.append(api_table([
    ("GET",   "/api/v1/clients",           "List/search; ?q=&industry=&page="),
    ("POST",  "/api/v1/clients",           "Create client"),
    ("GET",   "/api/v1/clients/{id}",      "Detail with contacts"),
    ("PATCH", "/api/v1/clients/{id}",      "Update"),
    ("GET",   "/api/v1/jobs",              "List; ?client_id=&status=&q="),
    ("POST",  "/api/v1/jobs",              "Create job"),
    ("GET",   "/api/v1/jobs/{id}",         "Detail"),
    ("PATCH", "/api/v1/jobs/{id}",         "Update"),
    ("GET",   "/api/v1/jobs/{id}/pipeline","Pipeline board data — {job, columns:[{stage, candidates}]}"),
]))
story.append(sp(4))

story.append(h2("Candidates & Pipeline"))
story.append(api_table([
    ("GET",   "/api/v1/candidates",                  "List; ?q="),
    ("POST",  "/api/v1/candidates/upload-cv",        "Upload CV; multipart; enqueues parse; returns {candidate_id, parse_status:'pending'}"),
    ("POST",  "/api/v1/candidates",                  "Create candidate manually"),
    ("GET",   "/api/v1/candidates/{id}",             "Detail"),
    ("PATCH", "/api/v1/candidates/{id}",             "Update fields (after parse review)"),
    ("GET",   "/api/v1/candidates/{id}/parse-status","Poll; returns {parse_status, fields?}"),
    ("POST",  "/api/v1/candidate-jobs",              "Link candidate to job"),
    ("PATCH", "/api/v1/candidate-jobs/{id}/stage",   "Update stage; writes PipelineLog"),
]))
story.append(sp(4))

story.append(h2("File Workspace"))
story.append(api_table([
    ("GET",    "/api/v1/folders",              "List root folders; ?owner_type=client&owner_id=42; returns folder tree"),
    ("POST",   "/api/v1/folders",              "Create folder; writes folder_created activity"),
    ("PATCH",  "/api/v1/folders/{id}",         "Rename folder; writes folder_renamed activity"),
    ("DELETE", "/api/v1/folders/{id}",         "Delete folder recursively; blocked if is_default=true"),
    ("GET",    "/api/v1/folders/{id}/zip",     "Stream ZIP of all files in folder"),
    ("POST",   "/api/v1/folders/{id}/files",   "Upload file(s); writes file_uploaded activity per file"),
    ("PATCH",  "/api/v1/files/{id}",           "Rename file; writes file_renamed activity"),
    ("PATCH",  "/api/v1/files/{id}/move",      "Move file; writes file_moved_out + file_moved_in activities"),
    ("DELETE", "/api/v1/files/{id}",           "Delete file; writes file_deleted activity"),
    ("GET",    "/api/v1/files/{id}/download",  "Stream file for download"),
    ("GET",    "/api/v1/folders/{id}/note",    "Get folder note content"),
    ("PUT",    "/api/v1/folders/{id}/note",    "Upsert folder note; writes note_edited activity"),
    ("GET",    "/api/v1/folders/{id}/activity","List activity entries; ?page=; newest first"),
]))
story.append(sp(4))

story.append(h2("CV Pipeline & Dashboard"))
story.append(api_table([
    ("POST", "/api/v1/cv/uploads",               "Upload 1–2 CV files; enqueues parse; returns {upload_ids, parse_status:'pending'}"),
    ("GET",  "/api/v1/cv/parse-status",           "Poll; ?upload_ids=...; returns {statuses:[{upload_id, parse_status, fields?}]}"),
    ("POST", "/api/v1/cv/merge",                  "Merge parsed data from 2 upload IDs into one candidate record"),
    ("GET",  "/api/v1/cv/templates",              "List active CV templates"),
    ("POST", "/api/v1/cv/generate",               "Generate formatted CV; enqueues export; returns {profile_id, generate_status:'pending'}"),
    ("GET",  "/api/v1/cv/generate-status/{id}",  "Poll generation; returns {generate_status, download_url?}"),
    ("GET",  "/api/v1/cv/download/{profile_id}", "Stream generated DOCX or PDF"),
    ("GET",  "/api/v1/dashboard",                "Aggregated counts; ?period=month"),
]))
story.append(sp(8))

story.append(h1("5. Key Trade-offs"))
tradeoffs = [
    ("Polymorphic FK (ActivityLogs/Reminders)",
     "Single target_type + target_id vs. separate nullable FK columns per entity. Chose polymorphic: simpler for unified log feed query; app layer validates target_type values."),
    ("In-process thread pool for CV parsing",
     "concurrent.futures.ThreadPoolExecutor vs. Celery + Redis. Chose in-process: <20 users, <50 uploads/day makes a full task queue operationally over-engineered. Celery is the first swap if volume grows."),
    ("Heuristic CV parser",
     "pdfplumber + regex vs. Claude/GPT-4 API. Chose heuristic: zero per-parse cost, runs offline, deterministic latency. Human review step absorbs errors. Module is isolated — LLM swap is one-file change."),
    ("Hierarchical folder model",
     "Self-referential folders + files tables vs. flat file_assets with polymorphic FK. Chose hierarchical: flat storage cannot represent user-created subfolders. Self-referential tree is standard (depth rarely >3)."),
    ("Dual-file CV merge strategy",
     "File 1 wins personal data (name/email/phone); File 2 wins work history + skills. Deterministic, zero-cost. Human review catches rare wrong merge result."),
    ("DOCX template via python-docx",
     "{{field_name}} bookmark substitution in Word templates vs. WeasyPrint / reportlab. Chose python-docx: recruiters know Word; no code changes for new client formats. PDF via LibreOffice --headless."),
]
for title, desc in tradeoffs:
    story.append(KeepTogether([
        h3(title),
        p(desc),
        sp(4),
    ]))
story.append(sp(8))

story.append(h1("6. Testing Strategy"))
story.append(h2("Unit Tests (must have)"))
unit_tests = [
    "parse_cv() — well-formed English PDF returns all required fields",
    "parse_cv() — scanned-image-only PDF (no extractable text) returns ParseError without exception",
    "parse_cv() — .docx file routes to Word extraction path",
    "stage_transition_valid() — rejects backward transitions (placed→sourced); accepts valid forward moves",
    "reminder_bucket() — returns 'overdue'/'today'/'upcoming' correctly for boundary dates",
    "FileStore.save() — writes to correct path; appends UUID suffix on conflict",
    "build_pipeline_columns() — groups candidates into 6 stage columns in correct order",
    "merge_parsed_cvs() — personal data from file1; skills/experience from file2",
    "render_template() — all {{field_name}} bookmarks substituted; missing fields → empty string",
    "export_to_pdf() — calls LibreOffice --headless; returns .pdf path that exists on disk",
]
story += bullets(unit_tests)
story.append(sp(6))

story.append(h2("Integration Tests (one per happy path)"))
int_tests = [
    "Create client → create job → add candidate → check pipeline (candidate in 'sourced' column)",
    "Upload CV → parse completes → fields populated (poll parse-status until complete)",
    "Move candidate stage → pipeline log written (candidate in 'interview' column; PipelineLog row exists)",
    "Create reminder → mark done → disappears from open list",
    "Dashboard aggregation — seeded DB counts match API response",
    "CV dual-file upload → merge → generate → download (Content-Type correct; body length > 0)",
]
story += bullets(int_tests)
story.append(sp(8))

story.append(h1("7. Risks & Monitoring"))
story.append(field_table([
    ("CV parser quality (JP/Myanmar)", "Likelihood: HIGH · Human review is mandatory before save; parse failures produce empty editable fields, never block the flow"),
    ("Polymorphic FK integrity",       "Likelihood: MEDIUM · App-layer validation; CHECK constraint in v1.1 migration"),
    ("File storage fills disk",        "Likelihood: MEDIUM · 10MB per-file limit; disk alert at 80%; S3 swap is one-file change"),
    ("Parse job lost on restart",      "Likelihood: LOW · Accepted; pending records >10 min surfaced as 'parse failed'; user can re-upload"),
    ("Dashboard query slowness",       "Likelihood: LOW at v1 · Composite index on candidate_jobs(current_stage, status) if p95 >500ms"),
    ("Monitoring: 3 signals",          "API 5xx error rate >1% over 5 min · CV parse queue depth >10 pending · Disk usage >80%"),
    ("Rollback plan",                  "Nightly pg_dump to S3 or local disk · Code rollback: git revert + redeploy <5 min · Data rollback from backup (last 24h loss — acceptable)"),
]))
story.append(PageBreak())

# ═══════════════════════════════════════════════════════════════════════
# ═══════════════════════════════════════════════════════════════════════
# SECTION 04 — UI LAYOUT DESIGN (actual screenshots from ui_design.html)
# ═══════════════════════════════════════════════════════════════════════

def screen_section(num, title, shot_name, desc, states=None):
    """Emit a heading, description, screenshot, and optional states table."""
    items = [
        h1(f"Screen {num} — {title}"),
        p(desc),
        sp(8),
        _screenshot(shot_name),
    ]
    if states:
        items += [sp(8), field_table(states)]
    items.append(sp(4))
    return items


story.append(ChapterBanner("04", "UI Layout Design", colors.HexColor("#B45309"), W))
story.append(sp(8))
story.append(p(
    "All 19 screens captured directly from the live HTML prototype (ui_design.html). "
    "Screens are fully interactive — click any tab in the top navigation bar to jump between them."
))
story.append(sp(10))

# ── 01 Login ─────────────────────────────────────────────────────────
story += screen_section(
    "01", "Login",
    "login",
    "Centered card on a dark navy gradient. Email and password fields with a full-width Login button. "
    "Footer: 'RecruitSync V1 · Internal use only'.",
    [
        ("Default",  "Empty fields; button inactive until both fields have content"),
        ("Error",    "Inline error below password: 'Invalid email or password'"),
        ("Loading",  "Button shows spinner; inputs disabled"),
    ]
)
story.append(PageBreak())

# ── 02 Onboarding ────────────────────────────────────────────────────
story += screen_section(
    "02", "Onboarding",
    "onboarding",
    "Shown to first-time users only. Three-step progress indicator: Add Client (active, blue) → "
    "Add Job (gray) → Upload CV (gray). Two CTAs: primary 'Add your first client' and secondary 'Skip'.",
    [
        ("Default",  "Step 1 active; Add Client CTA prominent"),
        ("Skip",     "Navigates directly to dashboard"),
        ("Complete", "After CV upload, navigates to dashboard"),
    ]
)
story.append(PageBreak())

# ── 03 Dashboard ─────────────────────────────────────────────────────
story += screen_section(
    "03", "Dashboard",
    "dashboard",
    "Daily orientation screen. Four metric cards (Active Jobs, In Screening, Interviews Today, "
    "Reminders Due). Two-column section: Candidates by Stage bar chart (left) and Due Today "
    "reminders panel (right). Recent Placements table at the bottom.",
    [
        ("Empty state",      "Metric cards show 0; prompt to 'Add your first client'"),
        ("Reminders card",   "Card top border turns red when overdue count > 0"),
        ("Loading",          "Skeleton metric cards and bar chart rows on first paint"),
        ("Click metric card","Navigates to the relevant filtered list screen"),
    ]
)
story.append(PageBreak())

# ── 04 Client List ───────────────────────────────────────────────────
story += screen_section(
    "04", "Client List",
    "clients",
    "Searchable, filterable table of all client companies. Columns: Company, Contact person, "
    "Industry (badge), Active jobs, Last contact (with status dot), View button. "
    "Industry dropdown filter. '+ Add client' button top-right.",
)
story.append(PageBreak())

# ── 05 Client Detail ─────────────────────────────────────────────────
story += screen_section(
    "05", "Client Detail",
    "client-detail",
    "Full client record. Three info cards: Contact details, Company info, Activity summary. "
    "Four tabs: Jobs (linked job table), Activity Logs (chronological feed with type badges), "
    "Files (downloadable attachments), Reminders (overdue in red, upcoming rows).",
    [
        ("Empty tabs",        "Each tab shows an inline empty state with a relevant add button"),
        ("Overdue reminders", "Shown with red background and red date text"),
    ]
)
story.append(PageBreak())

# ── 07 Job List ──────────────────────────────────────────────────────
story += screen_section(
    "07", "Job List",
    "jobs",
    "Overview of all active jobs across all clients. Search + Client filter + Status filter. "
    "Table columns: Job title, Client, Type, Status badge (Active/On hold/Closed), "
    "Candidate count badge, Closing date.",
)
story.append(PageBreak())

# ── 09 Job Detail ────────────────────────────────────────────────────
story += screen_section(
    "09", "Job Detail",
    "job-detail",
    "Job record with badge row showing key fields (Status, Type, Location, Language levels, "
    "Salary range, Closing date). Three tabs: Candidates (table with stage badges and pipeline "
    "shortcut), Activity Logs, Files. 'Pipeline view' button navigates directly to Kanban board.",
)
story.append(PageBreak())

# ── 16 Pipeline Board ────────────────────────────────────────────────
story += screen_section(
    "16", "Pipeline Board (Hero Screen)",
    "pipeline",
    "6-column Kanban board per job: Sourced · Screening · Interview · Offered · Placed · Rejected. "
    "Each candidate card shows a 9px status dot (green <7 days, amber 7-14 days, red overdue), "
    "skills/experience line, last log preview, and next reminder date. "
    "Kim Jae-won's card has a red left border and 'Overdue — 3 days' label. "
    "Status dot legend shown at the bottom.",
    [
        ("Drag to column",    "Stage updates immediately; inline log prompt slides up (120ms)"),
        ("Log prompt",        "Type → Enter saves log and turns dot green; Escape dismisses"),
        ("Empty column",      "Dashed border placeholder: 'Drop candidate here'"),
        ("Placed/Rejected",   "Cards shown at 60% opacity; not draggable back"),
        ("Stage update fail", "Card snaps back; toast: 'Couldn't update stage — try again'"),
    ]
)
story.append(PageBreak())

# ── 14 Candidate List ────────────────────────────────────────────────
story += screen_section(
    "14", "Candidate List",
    "candidates",
    "Searchable index of all candidates. Status dot beside each name. "
    "Columns: Name, Skills (badges), Experience, Location, Active jobs count.",
)

# ── 15 Candidate Profile ─────────────────────────────────────────────
story += screen_section(
    "15", "Candidate Profile",
    "candidate-profile",
    "Full candidate record. Three info cards: Contact, Profile (experience, language levels), "
    "Skills (badge list). Three tabs: Linked Jobs (with 'Attach to another job' button), "
    "Activity Logs, Files (CV, passport, certificates, generated CVs).",
)
story.append(PageBreak())

# ── 10 Upload CV ─────────────────────────────────────────────────────
story += screen_section(
    "10", "Upload CV — Step 1 of 4",
    "upload-cv",
    "Step progress indicator at the top (Upload active). Two upload zones side-by-side: "
    "File 1 — 履歴書 (blue border, required) and File 2 — 職務経歴書 (gray border, optional). "
    "Output language selector (Auto-detect / Japanese / English). "
    "Button disabled until at least File 1 is selected.",
)

# ── 11 Parsed Data Review ────────────────────────────────────────────
story += screen_section(
    "11", "Parsed Data Review — Step 2 of 4",
    "cv-review",
    "Green merge-status banner: 'Parsed from 2 files'. All extracted fields editable in a "
    "two-column form: Full name, Email, Phone, Location, Experience years, Source, Language "
    "levels, Skills, Education. 'Save & Continue', 'Re-parse', and '← Back' actions.",
    [
        ("All fields populated", "Green banner; form shows detected values"),
        ("Fields missing",       "Placeholder: 'Not detected — enter manually'"),
        ("Name missing",         "Inline error on Full name field on attempted continue"),
    ]
)
story.append(PageBreak())

# ── 12 Template Selection ────────────────────────────────────────────
story += screen_section(
    "12", "Template Selection — Step 3 of 4",
    "cv-template",
    "Two cards: 'Choose template' (radio list: Agency Standard / Client A / Japanese 履歴書 / "
    "Work Experience Sheet 職務経歴書) and 'Output type' (DOCX selected by default / PDF). "
    "Agency Standard pre-selected. 'Generate CV' button triggers async export.",
)

# ── 13 Download ──────────────────────────────────────────────────────
story += screen_section(
    "13", "Download — Step 4 of 4",
    "cv-download",
    "Green success card with checkmark, file name, and template name. Three actions: "
    "'↓ Download DOCX' (primary), 'Generate another format' (repeats step 3), "
    "'← Back to candidate'. Download triggers browser download; page stays so recruiter "
    "can generate another format.",
)
story.append(PageBreak())

# ── 17 Activity Logs ─────────────────────────────────────────────────
story += screen_section(
    "17", "Activity Logs",
    "activity",
    "Split-panel layout. Left: new log entry form (Target type/name, communication type, "
    "author, summary textarea, next action). Right: chronological feed with type badges "
    "(Call, Email, Meeting, Chat) and entity badges (Candidate, Client, Job).",
)

# ── 18 Reminders ─────────────────────────────────────────────────────
story += screen_section(
    "18", "Reminders",
    "reminders",
    "Three sections: Overdue (red background rows), Today (amber background), This week "
    "(white). Each row shows task name, entity, priority, due date, and Done/Reschedule "
    "buttons. Team filter dropdown and '+ Add reminder' in the top bar.",
    [
        ("All clear",        "'Nothing overdue — you're clear' with checkmark"),
        ("Done click",       "Row strikes through and fades out; no confirmation modal"),
        ("Reschedule click", "Inline date picker appears; updates due date in place"),
    ]
)
story.append(PageBreak())

# ── 19 File Workspace Root ───────────────────────────────────────────
story += screen_section(
    "19", "File Workspace — Root",
    "files-root",
    "Entry point showing three workspace root tiles: Clients, Candidates, Jobs — each with "
    "entity count and last-updated timestamp. 'Recently modified' table below shows the "
    "last 5 files touched across any workspace. Global search bar at the top.",
)

# ── 20 File Workspace Entity ─────────────────────────────────────────
story += screen_section(
    "20", "File Workspace — Entity Folder",
    "files-entity",
    "Folder grid for one entity (e.g. Nexus Systems K.K.). Default system folders: "
    "Contracts, JD, Meeting Notes, NDA, Visa, Others. Each card shows file count and "
    "last modified date. Toolbar: '+ New Folder' and '↑ Upload File'.",
)
story.append(PageBreak())

# ── 21 File Workspace Folder Detail ─────────────────────────────────
story += screen_section(
    "21", "File Workspace — Folder Detail",
    "files-folder",
    "Four-tab workspace for a specific folder (e.g. Contracts). "
    "Files tab: file table with checkbox multi-select, Download / Move / Delete actions, "
    "drag-and-drop drop zone. Notes tab: rich-text auto-save notepad. "
    "Activity History tab: append-only audit log. Shared Members tab: team access list.",
    [
        ("Upload drag",       "OS drag into browser → progress bar inline per file"),
        ("Move file",         "Folder picker modal → file moves without page reload"),
        ("Multi-select",      "Checkbox on hover → bulk ZIP or bulk Delete"),
        ("Notes auto-save",   "Saves on blur; 'Last edited by [name] · [timestamp]'"),
        ("Activity History",  "Append-only; never edited/deleted; newest first"),
        ("Shared Members v1", "All team members visible; per-member control coming v2"),
    ]
)

# ── Color legend ─────────────────────────────────────────────────────
story.append(PageBreak())
story.append(h1("Design System — Color & Status Reference"))
legend_data = [
    [Paragraph("Color", S("lt", fontSize=8, fontName="Helvetica-Bold", textColor=WHITE)),
     Paragraph("Hex",   S("lt", fontSize=8, fontName="Helvetica-Bold", textColor=WHITE)),
     Paragraph("Semantic usage", S("lt", fontSize=8, fontName="Helvetica-Bold", textColor=WHITE))],
]
colors_ref = [
    (BLUE,     "#2563EB", "Primary action, links, informational badges, active state"),
    (GREEN,    "#16A34A", "Success, Placed stage, status dot (<7 days since contact)"),
    (AMBER,    "#D97706", "Warning, On Hold, status dot (7-14 days), overdue-soon reminders"),
    (RED_C,    "#DC2626", "Danger, Rejected stage, status dot (>14 days / overdue), overdue reminders"),
    (GRAY,     "#64748B", "Neutral, inactive, metadata, Closed badges"),
    (TEAL,     "#0D9488", "Secondary action, Interview stage, Notes tab accent"),
    (PURPLE,   "#7C3AED", "Offered stage, Candidate entity badge"),
    (DARK_BLUE,"#1E3A8A", "Page headers, navigation bar background, chapter banners"),
    (DARK,     "#0F172A", "Body text, candidate names, form labels"),
    (LIGHT_BG, "#F1F5F9", "Alternating table row background, input field background"),
]
for col, hex_val, usage in colors_ref:
    swatch = Table([[""]], colWidths=[16], rowHeights=[14])
    swatch.setStyle(TableStyle([("BACKGROUND",(0,0),(0,0),col)]))
    legend_data.append([
        swatch,
        Paragraph(hex_val, S("hx", fontSize=7.5, fontName="Courier", textColor=DARK, leading=11)),
        Paragraph(usage,   S("us", fontSize=7.5, textColor=DARK, leading=11)),
    ])
leg_t = Table(legend_data, colWidths=[W*0.06, W*0.14, W*0.80])
leg_t.setStyle(TableStyle([
    ("BACKGROUND",(0,0),(-1,0),DARK_BLUE),
    ("ROWBACKGROUNDS",(0,1),(-1,-1),[WHITE,LIGHT_BG]),
    ("LINEBELOW",(0,0),(-1,-1),0.3,BORDER),
    ("VALIGN",(0,0),(-1,-1),"MIDDLE"),
    ("LEFTPADDING",(0,0),(-1,-1),5),
    ("RIGHTPADDING",(0,0),(-1,-1),5),
    ("TOPPADDING",(0,0),(-1,-1),3),
    ("BOTTOMPADDING",(0,0),(-1,-1),3),
]))
story.append(leg_t)
story.append(sp(12))

# ── Back cover / sign-off ──
story.append(PageBreak())
story.append(sp(80))
story.append(Paragraph("RecruitSync", S("bcTitle", fontSize=32, textColor=DARK_BLUE, alignment=TA_CENTER, fontName="Helvetica-Bold")))
story.append(Paragraph("Design Documentation — End of Document", S("bcSub", fontSize=12, textColor=GRAY, alignment=TA_CENTER)))
story.append(sp(12))
story.append(hr(BLUE, 1))
story.append(sp(12))
sign_data = [
    [Paragraph("Document", S("bc1",fontSize=9,fontName="Helvetica-Bold",textColor=GRAY)),
     Paragraph("RecruitSync Design Docs v0.1",S("bc2",fontSize=9,textColor=DARK))],
    [Paragraph("Covers",S("bc1",fontSize=9,fontName="Helvetica-Bold",textColor=GRAY)),
     Paragraph("Product · UX · Engineering · UI Layout",S("bc2",fontSize=9,textColor=DARK))],
    [Paragraph("Status",S("bc1",fontSize=9,fontName="Helvetica-Bold",textColor=GRAY)),
     Paragraph("Draft v0.1 — Internal use only",S("bc2",fontSize=9,textColor=DARK))],
    [Paragraph("Date",S("bc1",fontSize=9,fontName="Helvetica-Bold",textColor=GRAY)),
     Paragraph("2026-06-25",S("bc2",fontSize=9,textColor=DARK))],
]
st = Table(sign_data, colWidths=[W*0.25, W*0.75], hAlign="CENTER")
st.setStyle(TableStyle([
    ("LINEBELOW",(0,0),(-1,-1),0.3,BORDER),
    ("LEFTPADDING",(0,0),(-1,-1),8),
    ("RIGHTPADDING",(0,0),(-1,-1),8),
    ("TOPPADDING",(0,0),(-1,-1),6),
    ("BOTTOMPADDING",(0,0),(-1,-1),6),
    ("ROWBACKGROUNDS",(0,0),(-1,-1),[WHITE,LIGHT_BG]),
]))
story.append(st)

# ── Page numbers ──────────────────────────────────────────────────────────────
def add_page_number(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(GRAY)
    canvas.drawRightString(PAGE_W - MARGIN, 10 * mm, f"Page {doc.page}")
    canvas.drawString(MARGIN, 10 * mm, "RecruitSync · Design Documentation · Draft v0.1")
    canvas.setStrokeColor(BORDER)
    canvas.setLineWidth(0.3)
    canvas.line(MARGIN, 12 * mm, PAGE_W - MARGIN, 12 * mm)
    canvas.restoreState()

# ── Build ─────────────────────────────────────────────────────────────────────
doc.build(story, onFirstPage=add_page_number, onLaterPages=add_page_number)
print("PDF generated: RecruitSync_Design_Docs.pdf")
