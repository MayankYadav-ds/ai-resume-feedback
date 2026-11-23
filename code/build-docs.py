"""Generate honest Milestone 2 preparation drafts. Requires reportlab and pymupdf.
Run from any directory. Team data and model experiments are intentionally not invented.
"""
from pathlib import Path
import json, textwrap, re
from xml.sax.saxutils import escape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, Image, Preformatted
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.graphics.shapes import Drawing, Rect, Line, String, Polygon
from reportlab.graphics import renderPDF, renderSVG
import pymupdf

ROOT=Path(__file__).resolve().parents[1]
DOC=ROOT/'docs'
DOC.mkdir(exist_ok=True)
FONT=Path('C:/Windows/Fonts/segoeui.ttf')
if FONT.exists():
    pdfmetrics.registerFont(TTFont('Body',str(FONT)))
    pdfmetrics.registerFont(TTFont('BodyBold',str(FONT.with_name('segoeuib.ttf'))))
else:
    pdfmetrics.registerFont(pdfmetrics.Font('Body','Helvetica','WinAnsiEncoding'))
    pdfmetrics.registerFont(pdfmetrics.Font('BodyBold','Helvetica-Bold','WinAnsiEncoding'))
INK=colors.HexColor('#173044'); GREEN=colors.HexColor('#22745f'); LIGHT=colors.HexColor('#edf5f1')
styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name='BodyText2',fontName='Body',fontSize=10,leading=15,textColor=INK,spaceAfter=9))
styles.add(ParagraphStyle(name='Small2',fontName='Body',fontSize=8.4,leading=12,textColor=INK,spaceAfter=6))
styles.add(ParagraphStyle(name='Title2',fontName='BodyBold',fontSize=27,leading=33,textColor=INK,spaceAfter=20))
styles.add(ParagraphStyle(name='H2x',fontName='BodyBold',fontSize=18,leading=24,textColor=GREEN,spaceAfter=15))
styles.add(ParagraphStyle(name='H3x',fontName='BodyBold',fontSize=12,leading=17,textColor=INK,spaceAfter=9))
def P(s,style='BodyText2'):
    html=escape(str(s))
    html=re.sub(r'(https?://[^\s<]+)',r'<link href="\1" color="#22745f">\1</link>',html)
    return Paragraph(html.replace('\n','<br/>'),styles[style])
H=lambda s:P(s,'H2x')
S=lambda s:P(s,'Small2')
repo='https://github.com/MayankYadav-ds/ai-resume-feedback'
prototype='https://mayankyadav-ds.github.io/ai-resume-feedback/'
results=json.loads((ROOT/'test-data/results.json').read_text())
modules=[
 ['Text input and validation','Plain text, required fields and length limits','Working','Local and browser checks'],
 ['Keyword gap analysis','Coverage, aliases, gaps and conservative edits','Working','Semantic limitations retained'],
 ['Prompt export','Select v1/v2/v3 and download full prompt','Working','One final prompt: P1 v3'],
 ['Manual AI evidence checking','Import JSON; check quotes, shape and numbers','Working','Does not verify semantic truth'],
 ['JSON report export','Download local analysis or checked AI review','Working','Files may contain input text'],
 ['Local Gemini adapter','Consent-gated local provider request','Partly working','Mock-tested; live test pending key/model'],
 ['Document parsing','Extract PDF/DOCX resume text','Not started','Plain text only']]

def table(headers,rows,widths):
    data=[[P(x,'Small2') for x in headers]]+[[P(x,'Small2') for x in r] for r in rows]
    t=Table(data,colWidths=widths,repeatRows=1,hAlign='LEFT')
    t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),LIGHT),('VALIGN',(0,0),(-1,-1),'TOP'),('LINEBELOW',(0,0),(-1,0),1,GREEN),('LINEBELOW',(0,1),(-1,-1),.4,colors.HexColor('#d7e2e8')),('LEFTPADDING',(0,0),(-1,-1),8),('RIGHTPADDING',(0,0),(-1,-1),8),('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),4)]))
    return t

def footer(canvas,doc):
    canvas.saveState();w,h=A4
    canvas.setStrokeColor(colors.HexColor('#d7e2e8'));canvas.line(48,44,w-48,44)
    canvas.setFont('Body',8);canvas.setFillColor(INK)
    canvas.drawString(48,30,'RESUME STUDIO | Preparation draft | 23 Nov 2026')
    canvas.drawRightString(w-48,30,str(doc.page));canvas.restoreState()

def build(path,story):
    SimpleDocTemplate(str(path),pagesize=A4,leftMargin=48,rightMargin=48,topMargin=48,bottomMargin=60,title='Resume Studio - Milestone 2 preparation draft',author='Project preparation; team details pending').build(story,onFirstPage=footer,onLaterPages=footer)

def prompt_text(text):
    lines=[]
    for line in text.splitlines():lines.extend(textwrap.wrap(line,width=100,break_long_words=True,break_on_hyphens=False) or [''])
    return Preformatted('\n'.join(lines),ParagraphStyle('Code',fontName='Courier',fontSize=7.5,leading=10,spaceAfter=10))

def diagram(name,title,labels):
    d=Drawing(490,190)
    d.add(String(0,173,title,fontName='BodyBold',fontSize=13,fillColor=GREEN))
    positions=[(0,85),(130,85),(260,85),(390,85)]
    for i,(label,(x,y)) in enumerate(zip(labels,positions)):
        d.add(Rect(x,y,100,62,rx=8,ry=8,fillColor=LIGHT,strokeColor=GREEN,strokeWidth=.7))
        for j,line in enumerate(textwrap.wrap(label,18)):
            d.add(String(x+9,y+42-j*12,line,fontName='Body',fontSize=9,fillColor=INK))
        if i<3:
            d.add(Line(x+101,y+31,x+124,y+31,strokeColor=GREEN))
            d.add(Polygon([x+124,y+31,x+119,y+34,x+119,y+28],fillColor=GREEN,strokeColor=GREEN))
    renderPDF.drawToFile(d,str(DOC/(name+'.pdf')))
    renderSVG.drawToFile(d,str(DOC/(name+'.svg')))
    doc=pymupdf.open(DOC/(name+'.pdf'));doc[0].get_pixmap(matrix=pymupdf.Matrix(2,2)).save(DOC/(name+'.png'));doc.close()
    return d

diagrams=[
 diagram('workflow','Prompt workflow',['Resume + target job','Local gap review','P1 final prompt + chosen model','Import JSON + check evidence']),
 diagram('decomposition','Task decomposition',['Input validation','Skill extraction + coverage','Evidence-based AI review','Quote + number validation']),
 diagram('input-output','Input-output flow',['Plain-text source pair','Local report JSON','AI review JSON (optional)','Checked review + action plan']),
 diagram('architecture','System architecture',['GitHub Pages serves static UI','Browser runs local analysis','Manual AI OR local Node API','Google Gemini (optional)'])]

def supporting(section=False):
    f=[H('6. Supporting document' if section else 'Technical report'),P('Resume Studio: evidence-grounded resume preparation','Title2'),S('Supporting document type: Technical report | Team name: TO BE SUPPLIED | Preparation date: 23 November 2026'),P('Architecture and implementation','H3x'),P('The public prototype is a static HTML/CSS/JavaScript application. Its dictionary analysis, prompt rendering and JSON evidence checks run in the browser. The optional Node.js server binds to loopback and offers a consent-gated Gemini adapter. No database, retrieval pipeline or agent loop is used.'),P('Tools and models','H3x'),P('Tools: Node.js 20+, browser JavaScript, GitHub Actions and Pages. PDF generation uses ReportLab and PyMuPDF. No live provider model has been configured or evaluated for this release. The adapter takes GEMINI_MODEL and GEMINI_API_KEY from the local process environment; the public prototype does not expose or request a key.'),P('Prompt design','H3x'),P('One final prompt, P1 v3, produces summary, matched skills with resume quotes, gaps with job quotes, up to three evidence-preserving rewrites and next steps. Source text is encoded as JSON. One fictional few-shot example illustrates acceptable output. Three design versions are saved, but before/after model experiments remain pending.'),P('Data handling','H3x'),P('Local inputs remain in tab memory. Downloaded exports contain supplied text. Manual sharing or a consented local provider request transfers text to the chosen AI service. The application does not automatically persist source texts or model outputs. No real resumes or private reference screenshots are included in the repository.'),PageBreak(),H('Technical report - results and limitations'),P('Actual local results','H3x'),P('Twelve fictional input pairs were executed through the deterministic engine. Ten pass the recorded expectation and two fail semantic capability checks. Five inputs are Edge and three are Invalid. Fourteen separate regression tests pass, including exact-quote checks, unsupported-number rejection, mocked transport errors and local API origin/consent behavior.'),table(['Measure','Observed result'],[['Local capability inputs','12 executed; 10 pass; 2 fail'],['Known failures','T07 negation; T08 proficiency / experience depth'],['Regression tests','14 pass; provider responses mocked'],['Live model experiments','0 executed; cannot claim model quality or iteration gains'],['Final prompts / saved versions','1 / 3'],['Working modules','5 Working; 1 Partly working; 1 Not started']],[160,330]),Spacer(1,15),P('Limitations and next work','H3x'),P('1. Keyword presence cannot interpret negation or seniority. Add semantic comparison and evaluate with labeled cases.\n2. Quote and number checks cannot establish that rewritten claims follow from the evidence. Add human review and entailment evaluation.\n3. The live Gemini adapter and prompt performance have not been verified with credentials. Run controlled v1/v2/v3 experiments with one actual model and save raw results.\n4. Document extraction is absent. Add PDF/DOCX parsing with extraction quality checks.'),P('Reproducibility and scope','H3x'),P('Run npm test and npm run evaluate from the repository. Full local inputs, expected/actual outputs and failures are saved in test-data/. The model experiment runner is provided, but no mock fixture is passed off as a model output. This report documents a preparation build, not a completed academic submission.'),S('Source reference for optional adapter: https://aistudio.google.com/api-reference/generate-content\nRepository: '+repo)]
    return f

build(DOC/'TeamName_PENDING_TechnicalReport.pdf',supporting())
story=[S('SCSE4041 MINI PROJECT | MILESTONE 2 | 12 MARKS'),Spacer(1,20),H('1. Cover page'),P('AI-Powered Resume Feedback & Gap Analysis','Title2'),P('Resume Studio','H3x'),P('PREPARATION DRAFT - not ready for submission','H3x'),P('Prepared 23 November 2026. Team metadata, actual model experiment evidence, contribution agreement and demo reel remain pending. Replace the draft filename only after these are supplied and verified.'),table(['Field','Value'],[['Team ID','TO BE SUPPLIED (use existing Milestone 1 ID)'],['Team name','TO BE SUPPLIED'],['Batch / group','TO BE SUPPLIED'],['Faculty name','TO BE SUPPLIED'],['Members and enrollments','TO BE SUPPLIED by the team'],['Prototype status','Some modules working'],['Prompt / test / version counts','1 final prompt / 12 local test inputs / 3 saved design versions']],[150,340]),Spacer(1,20),P('Required links','H3x'),P('Prototype: '+prototype+'\nRepository: '+repo+'\nReel: PENDING - no video created or uploaded. Exact duration: PENDING.'),S('The supplied guideline deadline was 22 November 2026, 11:59 PM. This draft was prepared later. Faculty acceptance must be confirmed by the team. No form has been submitted.'),PageBreak(),H('2. Prompt and solution design'),P('Problem, users and scope','H3x'),P('Placement applicants need a practical way to compare a resume with a target role and improve how real experience is expressed. The source brief proposes AI-powered gap analysis and tailored bullet points. This build separates simple local keyword coverage from contextual AI feedback, so a vocabulary count is not represented as an ATS pass prediction.'),P('Input, output and steps','H3x'),P('Input is plain-text resume content and a target job description. Local output is a coverage score, matched skills, gaps and conservative wording edits. The optional AI step uses one final prompt (P1) and returns structured evidence-based feedback. A subsequent deterministic validator checks quotes, output structure and numbers. The final export supports a user-reviewed improvement plan.'),P('Tools and model choice','H3x'),P('The public browser application needs no credentials. A chosen external assistant can run the exported prompt manually; an optional local adapter supports Google Gemini. A specific model has not been selected or run. Selection should be based on schema adherence, evidence fidelity, availability and privacy terms, measured on the same fictional inputs. The adapter uses temperature 0.2 and maximum output tokens 4096; manual-tool settings are provider defaults unless recorded otherwise.'),P('Changes since Milestone 1','H3x'),P('The reference screenshots describe a proposed workflow and unconstrained baseline. The implementation now provides working local analysis, three full prompt versions, a final JSON contract, a quote/number validator, an optional provider path and saved test evidence. Unsupported achievement metrics in the original illustrative rewrite are explicitly avoided. No claim is made that the original screenshot feedback or recruitment statistics were independently verified.'),P('Why one final prompt','H3x'),P('Extraction, gap interpretation and rewrites share the same small source pair. One model call keeps the workflow easy to reproduce; local input checks and output validation remain separate software steps. There is no agent, RAG or multi-agent loop.'),PageBreak(),H('Design diagrams'),diagrams[0],diagrams[1],S('Arrows describe data flow, not additional LLM calls. Only P1 is a prompt.'),PageBreak(),H('Design diagrams - continued'),diagrams[2],diagrams[3],S('Public Pages hosting supports local analysis and manual import. The local Node API and Gemini path are optional and do not run on GitHub Pages.'),PageBreak(),H('P1 final prompt sheet'),table(['Item','Recorded value'],[['Prompt ID / name','P1 - Evidence-grounded resume review'],['Workflow step / purpose','After local analysis; compare evidence and suggest factual revisions'],['Tool and model','Manual chosen assistant OR optional local Gemini; actual model pending'],['Settings','Adapter: temperature 0.2, maxOutputTokens 4096; manual defaults unless recorded'],['System prompt','None; the full instruction is supplied as one user message'],['User variables','{source_json}: JSON object with resume and job_description strings'],['Examples / output','1 example; JSON with summary, matched_skills, gaps, rewrites, next_steps'],['Actual sample run','PENDING. No live provider run has been performed. The UI fixture is not a model sample.']],[140,350]),Spacer(1,14),P('Full user prompt template','H3x'),prompt_text((ROOT/'prompts/final/P1-resume-review.txt').read_text()),PageBreak(),H('3. Implementation'),table(['Module','What it does','Status','Notes'],modules,[112,158,83,137]),Spacer(1,15),P('Implementation evidence','H3x'),P('The application is implemented in code/public/. The loopback server and provider adapter are in code/server.js and code/provider.js. Tests cover deterministic behavior and mocked provider transport. The public workflow tests the source before publishing the static browser assets. Actual external model behavior remains unverified.'),P('Prompt iteration log','H3x'),table(['Version','Change and reason','Observed result'],[['v1','Unconstrained role, matching and rewrites; baseline from the brief','Full text saved; 0 examples; no live model run'],['v2','JSON fields, supporting quotes and no invention; make output consumable','Full text saved; 0 examples; exact field structure still unspecified; no live model run'],['v3 / final','Exact quote contract, source separation, 1 example and no ATS prediction','Full text saved; 1 example; validator tests pass. No live model quality result']],[65,225,200]),S('Versions are design iterations, not evidence of empirical improvement. Run code/run-prompt-experiments.js after configuring a key/model, save real outputs and replace pending result cells before submission.'),PageBreak(),H('Full prompt version text'),P('v1 - Baseline','H3x'),prompt_text((ROOT/'prompts/v1/P1-resume-review.txt').read_text()),P('v2 - Structured baseline','H3x'),prompt_text((ROOT/'prompts/v2/P1-resume-review.txt').read_text()),P('v3 - Final evidence-grounded version','H3x'),prompt_text((ROOT/'prompts/v3/P1-resume-review.txt').read_text()),PageBreak(),H('4. Demonstration and testing'),P('Actual runs and interpretation','H3x'),P('The following twelve inputs were executed through the local deterministic engine. Full source text and actual outputs are saved in test-data/inputs.json and results.json. Run time (UTC): '+results['executed_at']+'. Ten pass, two fail semantic capability expectations. These are not LLM tests. A separate set of fourteen software regression tests passes.'),S('T08 deliberately tests whether keyword coverage can establish suitability at a required experience level. Its failure must not be interpreted as an arithmetic bug in the coverage formula.' )]

rows=[]
for r in results['results']:
    inp=(r.get('resume','')+' | '+r['job'])
    if len(inp)>100:inp=inp[:97]+'...'
    expected=r['expected'].get('error',str(r['expected'].get('score'))+'%; '+', '.join(r['expected'].get('matched',[])))
    a=r['actual'];actual=a.get('error',str(a.get('score'))+'%; '+', '.join(a.get('matched',[])))
    expected=expected.replace('None%','N/A');actual=actual.replace('None%','N/A')
    rows.append([r['id']+'\n'+r['type'],inp,expected,actual,'Pass' if r['pass'] else 'Fail'])
story.extend([table(['Test / type','Input (short)','Expected','Actual','Result'],rows,[60,155,115,115,45]),Spacer(1,12),P('Known limitations and planned actions','H3x'),P('Negation and experience depth: add semantic checks (T07/T08 fail).\nFactuality beyond quotes/numbers: add reviewer checks and entailment evaluation.\nLive model behavior: configure a provider and run controlled prompt experiments.\nDocument extraction: add PDF/DOCX parsing with extraction checks.'),PageBreak(),H('Real-run screenshots'),S('T01 - Actual local keyword comparison. Three of four recognized skills match: 75%. This is not an ATS score.'),Image(str(DOC/'T01-normal-run.jpg'),width=250,height=283),Spacer(1,12),S('T05 - Actual Edge input with unsupported vocabulary. Coverage is N/A instead of a false zero or perfect score.'),Image(str(DOC/'T05-unknown-skills.jpg'),width=250,height=283),PageBreak(),H('Real-run screenshot - validation'),S('T01 validation extension - Manual test fixture adds an unsupported 25% metric. The real UI rejects it and disables export. The fixture was deliberately authored for validator testing; it is not a saved live-model output.'),Image(str(DOC/'T01-rejected-metric.jpg'),width=440,height=498),P('Demo reel status','H3x'),P('No reel has been recorded or uploaded. docs/reel-recording-plan.md provides a 120-second recording plan. The team must replace its pending before/after segment with actual model outputs, record a real demo, upload an accessible video and measure its exact duration. Planned length is not actual reel length.'),PageBreak(),H('5. Repository'),Image(str(DOC/'repository-public.jpg'),width=390,height=442),Spacer(1,12),P('The repository is public and contains code, full prompt histories, fictional test inputs, saved local outputs and documentation.\nThe initial implementation was created on 23 November 2026; the Milestone 2 commit adds evidence validation, provider scaffolding and test artifacts.\nThe changelog records implementation progress without inventing earlier software history.\nNo real resume data, reference screenshots or API keys are committed.\nThe static prototype workflow runs tests before publication.'),S(repo),PageBreak()])
story.extend(supporting(section=True))
story.extend([PageBreak(),H('7. Team contribution'),P('Pending team input and agreement','H3x'),P('The team asked to provide details later. No member names, enrollment numbers, roles, claimed tasks or contribution percentages have been invented. The team must fill one row per member, give evidence for each task and confirm that percentages total 100 before submission.'),table(['Member','Enrollment','Role / actual task','Evidence','%'],[['TO BE SUPPLIED','TO BE SUPPLIED','TO BE SUPPLIED','File / commit / prompt ID','-']],[85,105,145,110,45]),Spacer(1,16),P('Required confirmations','H3x'),P('Each member owns at least one specific task and can explain it.\nEvidence identifies real work performed by that member.\nPercentages sum to 100.\nAll members agree to the contribution table.\nNames, tasks and counts match the form.'),P('Finalization checklist','H3x'),P('Supply team metadata and review actual contributions. Complete a live final-prompt sample and model before/after experiments. Record and upload the reel. Verify all three links in a private window. Rename this draft to M2_TeamID_ProjectTitle.pdf and the separate supporting PDF to TeamName_TechnicalReport.pdf. Preserve Section 6 as the same supporting document. Do not tick agreement or claim full completion while these items remain open.'),S('Current supported counts: 1 final prompt; 3 saved design versions; 12 local test inputs. Actual model sample: pending. Reel duration: pending. Status: Some modules working.')])
build(DOC/'DRAFT_M2_PENDING_AIResumeFeedback.pdf',story)
print('Generated milestone draft and two-page technical report in',DOC)
