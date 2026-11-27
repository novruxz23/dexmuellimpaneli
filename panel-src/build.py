# Müəllim panelini yığır: style.css + shell.html + app.js (+ models.json) -> ../public/panel.html
# İstifadə: python3 build.py   (heç bir kənar fayl lazım deyil)
import os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
css = open('style.css', encoding='utf-8').read()
shell = open('shell.html', encoding='utf-8').read()
app = open('app.js', encoding='utf-8').read().replace('__MODELS__', open('models.json', encoding='utf-8').read())
# Əlavə modul (ders idarəsi, təqvim, qeydlər, tətbiqlər, səs, Windows idarə mərkəzi) app.js-dən sonra eyni skriptə yığılır
app += '\nconst CFG=' + open('config.json', encoding='utf-8').read() + ';\n' + open('extra.js', encoding='utf-8').read() + '\n' + open('extra2.js', encoding='utf-8').read() + '\n' + open('win.js', encoding='utf-8').read()
css += open('extra.css', encoding='utf-8').read()
html = f'''<!doctype html>
<html lang="az"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#010622">
<title>DeX — Müəllim Paneli</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&display=swap" rel="stylesheet">
<style>
{css}</style>
</head>
<body>
{shell}
<script>
const IC={{}};
{app}
</script></body></html>
'''
open('../public/panel.html', 'w', encoding='utf-8').write(html)
print('panel.html', len(html) // 1024, 'KB')
