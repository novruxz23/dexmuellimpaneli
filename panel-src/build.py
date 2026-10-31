# Müəllim panelini yığır: sənin göndərdiyin HTML dizaynı (CSS, markup, şəkillər) + canlı app.js.
import re, json, sys
SRC = sys.argv[1] if len(sys.argv) > 1 else '/mnt/user-data/uploads/DeX___Müəllim_Paneli.html'
s = open(SRC, encoding='utf-8').read()
i = s.rfind('<!doctype html>')
inner = s[i:]
head = inner[:inner.index('<body')]
body = inner[inner.index('<body'):inner.index('<script')]
ic = re.search(r'const IC=(\{.*?\}),\s*TH=\[', inner, re.S).group(1)
tail_i = inner.index('(()=>{const cs=$("#castle")') if '(()=>{const cs=$("#castle")' in inner else -1
tail = inner[tail_i:inner.index('</script>', tail_i)] if tail_i >= 0 else ''
tail = re.sub(r'initDB\(\)\s*;?','',tail)
app = open('app.js', encoding='utf-8').read().replace('__MODELS__', open('models.json', encoding='utf-8').read())
extra_css = '''
<style>
/* canlı panel üçün əlavələr */
.grid{grid-template-columns:repeat(4,minmax(0,1fr))!important;grid-template-rows:none!important;grid-auto-rows:var(--rowh,40rem);height:auto!important;align-content:start}
.th{position:relative;overflow:hidden}.th img.sh{width:100%;height:100%;object-fit:cover;display:block}
.th.off{filter:grayscale(.85) brightness(.7)}
.ph{position:absolute;inset:0;display:grid;place-content:center;justify-items:center;gap:6px;text-align:center;background:radial-gradient(circle at 50% 35%,#16398f,#091b4d 70%);color:#cfe0ff}
.ph b{font-size:2.9rem;font-weight:600}.ph small{font-size:2.1rem;color:#8fb0ff}.ph.big b{font-size:26px}.ph.big small{font-size:15px}
.ph.big{position:absolute}
.lk{font-size:2.6rem}
.sched{padding:8px 4px}.sched .tm{flex:none;width:86px;text-align:center}
.ans{background:#0f3b2c;border:1px solid #1e8a5e;border-radius:10px;padding:8px 12px;color:#c9f2d8;width:100%}
.tg{cursor:pointer}
.scr img.rc{cursor:crosshair}
#off{position:fixed;left:50%;top:10px;transform:translateX(-50%);background:#6b1a33;color:#ffd7df;padding:6px 16px;border-radius:99px;font:600 14px "Segoe UI",system-ui,sans-serif;z-index:60}
#off[hidden]{display:none}
#ts{position:fixed;left:50%;bottom:28px;transform:translateX(-50%);background:#12308f;border:1px solid #4a78ee;color:#fff;padding:10px 18px;border-radius:12px;font:600 15px "Segoe UI",system-ui,sans-serif;z-index:70;box-shadow:0 8px 30px #0008}
#ts[hidden]{display:none}
textarea.in{min-height:90px;width:100%;resize:vertical;font:inherit}
select.in{flex:none}
.d.b{background:#4aa3ff}
</style>
'''
out = head + extra_css + '</head>' if '</head>' not in head else head.replace('</head>', extra_css + '</head>')
out += body.replace('</body>', '').rstrip() + '\n<div id="off" hidden>Serverlə əlaqə yoxdur — yenidən cəhd edilir…</div>\n<script>\nconst IC=' + ic + ';\n' + app + '\n' + tail + '\n</script></body></html>\n'
open('../public/panel.html', 'w', encoding='utf-8').write(out)
print('panel.html', len(out)//1024, 'KB; castle tail', bool(tail))
