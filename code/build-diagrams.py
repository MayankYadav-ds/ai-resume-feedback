"""Editable workflow and architecture diagrams matching the implemented application."""
from pathlib import Path
import textwrap
from reportlab.graphics.shapes import Drawing,Rect,String,Line,Polygon
from reportlab.graphics import renderPDF,renderSVG
from reportlab.lib import colors
import pymupdf
DOC=Path(__file__).resolve().parents[1]/'docs'
green=colors.HexColor('#466633');ink=colors.HexColor('#263426');light=colors.HexColor('#edf4e5')
def box(d,x,y,w,h,text):
 d.add(Rect(x,y,w,h,fillColor=light,strokeColor=green,strokeWidth=.7))
 lines=text.split('\n') if '\n' in text else textwrap.wrap(text,18)
 for i,s in enumerate(lines):d.add(String(x+8,y+h-17-i*13,s,fontName='Helvetica',fontSize=9,fillColor=ink))
def arrow(d,x1,y1,x2,y2):
 d.add(Line(x1,y1,x2,y2,strokeColor=green,strokeWidth=.8))
 points=[x2,y2,x2-5,y2+3,x2-5,y2-3] if y1==y2 else [x2,y2,x2-3,y2+5,x2+3,y2+5]
 d.add(Polygon(points,fillColor=green,strokeColor=green))
def save(name,d):
 renderPDF.drawToFile(d,str(DOC/(name+'.pdf')));renderSVG.drawToFile(d,str(DOC/(name+'.svg')))
 pdf=pymupdf.open(DOC/(name+'.pdf'));pdf[0].get_pixmap(matrix=pymupdf.Matrix(2,2)).save(DOC/(name+'.png'))
def row(name,title,labels):
 d=Drawing(490,165);d.add(String(0,145,title,fontName='Helvetica-Bold',fontSize=13,fillColor=green))
 for i,label in enumerate(labels):
  x=i*130;box(d,x,45,100,68,label)
  if i<3:arrow(d,x+101,79,x+124,79)
 save(name,d)
row('workflow','Prompt workflow',['Resume + target job','Local input + coverage checks','P1 contextual review','Quote + numeric checks; export'])
row('decomposition','Task decomposition',['Validate source','Recognize skills and explicit negation','Review gaps and factual bullets','Check evidence and human review'])
row('input-output','Input-output flow',['Plain-text source pair','Coverage + source evidence','AI review JSON','Checked report and next steps'])
d=Drawing(490,290);d.add(String(0,270,'System architecture',fontName='Helvetica-Bold',fontSize=13,fillColor=green))
for x,label in [(0,'GitHub Pages\nStatic assets'),(130,'Browser UI\nNo source storage'),(260,'Local analysis\nJavaScript'),(390,'Coverage report\nJSON export')]:box(d,x,175,100,62,label)
for x in [101,231,361]:arrow(d,x,206,x+23,206)
box(d,130,65,100,70,'P1 prompt\nSource pair');box(d,260,55,100,90,'Manual Codex OR\nSmolLM2 on device\nOR own-key Gemini');box(d,390,65,100,70,'Evidence checks\nHuman review\nJSON export')
arrow(d,180,175,180,140);arrow(d,231,100,254,100);arrow(d,361,100,384,100)
d.add(String(0,17,'Optional Node loopback adapter keeps a Gemini key server-side.',fontName='Helvetica',fontSize=9,fillColor=ink))
save('architecture',d)
print('Generated four diagrams from the implemented architecture.')
